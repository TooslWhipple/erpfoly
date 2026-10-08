import { useEffect, useMemo, useRef, useState, type PointerEvent, type RefObject } from "react";
import { Alert, Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, IconButton, InputAdornment, Stack, Typography } from "@mui/material";
import { Camera, PenLine, PenSquare, RefreshCw, ScanLine, Search, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Breadcrumbs, FormSelect, FormTextField, StatusChip, TableCrud, Title } from "@/components";
import type { TitleAction } from "@/components/Title";
import type { Column } from "@/components/TableCrud";
import { DropZoneRoot } from "@/components/FileUpload/styles";
import {
  SignatureCanvas,
  SignatureCanvasWrapper,
  SignatureLegalText,
  SignatureSection,
} from "@/components/CreditApplicationIntakeModal/styles";
import { ProductCodeScannerDialog } from "@/components/ProductCodeScannerDialog/ProductCodeScannerDialog";
import { usePermissions } from "@/hooks/usePermissions";
import { useHandoverBranches } from "@/hooks/useHandoverBranches";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { useDebouncedInput } from "@/hooks/useDebouncedValue";
import { DELIVERY_HOLD_UPDATE } from "@/lib/permissions";
import { printPdfBlob } from "@/lib/printing/print-pdf";
import {
  confirmHandover,
  fetchHandoverPdf,
  listHandoverQueue,
  uploadHandoverFile,
  type HandoverLine,
  type HandoverSale,
} from "@/services/sale-handover.service";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { theme } from "@/styles/theme";
import {
  SALE_STATUS_CHIP_LABELS,
  SALE_STATUS_CHIP_VARIANTS,
} from "@/utils/saleStatus";
import type { SaleStatus } from "@/types/ventas.types";

const SEARCH_DEBOUNCE_MS = 300;

function readyCount(row: HandoverSale): number {
  return row.lines.reduce((sum, line) => sum + line.ready, 0);
}

const PHOTO_MAX_BYTES = 10 * 1024 * 1024;

const compactZoneSx = {
  py: 1,
  px: 1.5,
  minHeight: 72,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
} as const;

function IdPhotoSlot({
  label,
  file,
  onChange,
}: {
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const preview = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );

  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  const openPicker = () => inputRef.current?.click();

  return (
    <Stack spacing={0.5}>
      <DropZoneRoot
        isDragActive={false}
        isError={!!error}
        onClick={openPicker}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openPicker();
          }
        }}
        sx={compactZoneSx}
      >
        <input
          ref={inputRef}
          hidden
          type="file"
          accept="image/*"
          capture="environment"
          onClick={(event) => event.stopPropagation()}
          onChange={(event) => {
            const picked = event.target.files?.[0] ?? null;
            event.target.value = "";
            if (picked && picked.size > PHOTO_MAX_BYTES) {
              setError("La foto supera 10 MB.");
              return;
            }
            setError(null);
            onChange(picked);
          }}
        />
        {preview ? (
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ width: "100%", minWidth: 0 }}
          >
            <Box
              component="img"
              src={preview}
              alt={label}
              sx={{
                width: 64,
                height: 44,
                objectFit: "cover",
                borderRadius: 1,
                bgcolor: "#fff",
                flexShrink: 0,
              }}
            />
            <Box sx={{ minWidth: 0, flex: 1, textAlign: "left" }}>
              <Typography variant="body2" fontWeight={600} noWrap>
                {label}
              </Typography>
              <Typography variant="caption" color="success.main">
                Lista
              </Typography>
            </Box>
            <IconButton
              aria-label={`Cambiar ${label}`}
              size="small"
              onClick={(event) => {
                event.stopPropagation();
                openPicker();
              }}
            >
              <RefreshCw size={16} />
            </IconButton>
            <IconButton
              aria-label={`Quitar ${label}`}
              size="small"
              onClick={(event) => {
                event.stopPropagation();
                setError(null);
                onChange(null);
              }}
            >
              <X size={16} />
            </IconButton>
          </Stack>
        ) : (
          <Stack direction="row" spacing={1} alignItems="center">
            <Camera size={18} color={theme.palette.primary.main} />
            <Box sx={{ textAlign: "left" }}>
              <Typography variant="body2" fontWeight={600} color="primary.main">
                {label}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Toca para tomar foto
              </Typography>
            </Box>
          </Stack>
        )}
      </DropZoneRoot>
      {error && (
        <Typography variant="caption" color="error">
          {error}
        </Typography>
      )}
    </Stack>
  );
}

function applyCode(
  lines: HandoverLine[],
  scanned: Record<number, number>,
  code: string,
  quantity: number,
): { scanned: Record<number, number>; error?: string } {
  const normalized = code.trim().toLowerCase();
  const matches = lines.filter(
    (line) => line.code.trim().toLowerCase() === normalized && line.ready > 0,
  );
  if (matches.length === 0) {
    const known = lines.some(
      (line) => line.code.trim().toLowerCase() === normalized,
    );
    return {
      scanned,
      error: known
        ? "Esa pieza todavía está por surtir."
        : "Ese código no pertenece a esta venta.",
    };
  }
  let left = quantity;
  const next = { ...scanned };
  for (const line of matches) {
    const room = line.ready - (next[line.saleItemId] ?? 0);
    if (room <= 0) continue;
    const take = Math.min(room, left);
    next[line.saleItemId] = (next[line.saleItemId] ?? 0) + take;
    left -= take;
    if (left <= 0) break;
  }
  if (left > 0) {
    return {
      scanned,
      error: "La cantidad supera lo que está listo para entregar.",
    };
  }
  return { scanned: next };
}

function SignaturePad({
  canvasRef,
  onInk,
}: {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  onInk: (hasInk: boolean) => void;
}) {
  const drawing = useRef(false);

  const point = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  return (
    <SignatureCanvas
      ref={canvasRef}
      width={900}
      height={480}
      onPointerDown={(event) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;
        event.preventDefault();
        drawing.current = true;
        canvas.setPointerCapture(event.pointerId);
        const { x, y } = point(event);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineWidth = 3.5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = "#111";
      }}
      onPointerMove={(event) => {
        if (!drawing.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;
        event.preventDefault();
        const { x, y } = point(event);
        ctx.lineTo(x, y);
        ctx.stroke();
        onInk(true);
      }}
      onPointerUp={(event) => {
        if (canvasRef.current?.hasPointerCapture(event.pointerId)) {
          canvasRef.current.releasePointerCapture(event.pointerId);
        }
        drawing.current = false;
      }}
      onPointerCancel={(event) => {
        if (canvasRef.current?.hasPointerCapture(event.pointerId)) {
          canvasRef.current.releasePointerCapture(event.pointerId);
        }
        drawing.current = false;
      }}
    />
  );
}

export default function EntregasPage() {
  const showError = useSnackbarStore((state) => state.showError);
  const showSuccess = useSnackbarStore((state) => state.showSuccess);
  const { hasPermission } = usePermissions();
  const canOverride = hasPermission(DELIVERY_HOLD_UPDATE);
  const queryClient = useQueryClient();
  const {
    branches,
    branchId,
    setBranchId,
    isLoading: branchesLoading,
    isError: branchesError,
    error: branchesQueryError,
  } = useHandoverBranches();
  const [sale, setSale] = useState<HandoverSale | null>(null);
  const [scanned, setScanned] = useState<Record<number, number>>({});
  const [methods, setMethods] = useState<Record<number, "BARCODE" | "MANUAL">>({});
  const [scannerOpen, setScannerOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [manualQty, setManualQty] = useState("1");
  const [manualError, setManualError] = useState<string | null>(null);
  const [manualField, setManualField] = useState<"code" | "qty" | null>(null);
  const [receiverName, setReceiverName] = useState("");
  const [receiverIsClient, setReceiverIsClient] = useState(false);
  const [confirmTried, setConfirmTried] = useState(false);
  const [overrideReason, setOverrideReason] = useState("");
  const [ineFront, setIneFront] = useState<File | null>(null);
  const [ineBack, setIneBack] = useState<File | null>(null);
  const [ticketScannerOpen, setTicketScannerOpen] = useState(false);
  const [signing, setSigning] = useState(false);
  const [signatureInk, setSignatureInk] = useState(false);
  const [signatureBlob, setSignatureBlob] = useState<Blob | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [lastReceiptId, setLastReceiptId] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const idempotencyKey = useRef(crypto.randomUUID());
  const numericBranchId = branchId === "" ? 0 : branchId;

  const {
    data: queueRows,
    total,
    page,
    rowsPerPage,
    search: searchValue,
    setPage,
    setRowsPerPage,
    setSearch,
    isLoading,
    isError,
    error,
  } = usePaginatedList<HandoverSale>({
    queryKey: ["handover-queue", String(numericBranchId)],
    queryFn: listHandoverQueue,
    initialRowsPerPage: 10,
    extraParams: { branchId: numericBranchId },
    enabled: branchId !== "",
  });
  const [searchInput, setSearchInput, debouncedSearch] = useDebouncedInput(
    searchValue,
    SEARCH_DEBOUNCE_MS,
  );

  useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);

  const expiredOverride =
    sale?.holdStatus === "EXPIRED" && canOverride && Boolean(sale.blockReason);
  const blocked = Boolean(sale?.blockReason) && !expiredOverride;

  const openSale = (row: HandoverSale) => {
    setSale(row);
    setScanned({});
    setMethods({});
    setScanError(null);
    setSignatureBlob(null);
    setSignaturePreview(null);
    setSignatureInk(false);
    setReceiverName("");
    setReceiverIsClient(false);
    setConfirmTried(false);
    setOverrideReason("");
    setIneFront(null);
    setIneBack(null);
    idempotencyKey.current = crypto.randomUUID();
  };

  const commitScan = (
    code: string,
    quantity: number,
    method: "BARCODE" | "MANUAL",
  ): string | null => {
    if (!sale || blocked) return "Esta venta no se puede entregar.";
    const result = applyCode(sale.lines, scanned, code, quantity);
    if (result.error) return result.error;
    const added = sale.lines.find(
      (line) => line.code.trim().toLowerCase() === code.trim().toLowerCase(),
    );
    setScanError(null);
    setScanned(result.scanned);
    showSuccess(
      quantity === 1
        ? `Se agregó ${added?.name ?? code}.`
        : `Se agregaron ${quantity} de ${added?.name ?? code}.`,
    );
    const nextMethods = { ...methods };
    for (const line of sale.lines) {
      if ((result.scanned[line.saleItemId] ?? 0) > (scanned[line.saleItemId] ?? 0)) {
        nextMethods[line.saleItemId] = method;
      }
    }
    setMethods(nextMethods);
    return null;
  };

  const confirm = useMutation({
    mutationFn: async () => {
      if (!sale || branchId === "" || !signatureBlob) {
        throw new Error("Falta la firma del receptor.");
      }
      const signatureFileId = await uploadHandoverFile(
        signatureBlob,
        "SIGNATURE",
        "firma.png",
      );
      const evidences: Array<{ fileId: number; side: "INE_FRONT" | "INE_BACK" }> = [];
      if (ineFront) {
        evidences.push({
          fileId: await uploadHandoverFile(ineFront, "PHOTO", "ine-frente.jpg"),
          side: "INE_FRONT",
        });
      }
      if (ineBack) {
        evidences.push({
          fileId: await uploadHandoverFile(ineBack, "PHOTO", "ine-reverso.jpg"),
          side: "INE_BACK",
        });
      }
      const lines = sale.lines
        .filter((line) => (scanned[line.saleItemId] ?? 0) > 0)
        .map((line) => ({
          saleItemId: line.saleItemId,
          quantity: scanned[line.saleItemId] ?? 0,
          inputMethod: methods[line.saleItemId] ?? "MANUAL",
        }));
      return confirmHandover({
        saleId: sale.saleId,
        branchId: Number(branchId),
        signatureFileId,
        receiverName: receiverName.trim() || undefined,
        idempotencyKey: idempotencyKey.current,
        overrideReason: expiredOverride ? overrideReason.trim() : undefined,
        lines,
        evidences: evidences.length ? evidences : undefined,
      });
    },
    onSuccess: async (result) => {
      setLastReceiptId(result.id);
      showSuccess(`Entrega ${result.folio} confirmada.`);
      try {
        const pdf = await fetchHandoverPdf(result.id);
        await printPdfBlob(pdf);
      } catch {
        showError("La entrega quedó registrada. No se pudo imprimir el comprobante.");
      }
      setSale(null);
      void queryClient.invalidateQueries({ queryKey: ["handover-queue"] });
    },
    onError: (error: Error) => showError(error.message),
  });

  const readyLines = sale?.lines.filter((line) => line.ready > 0) ?? [];
  const supplyLines = sale?.lines.filter((line) => line.pendingSupply > 0) ?? [];
  const scannedTotal = Object.values(scanned).reduce((sum, qty) => sum + qty, 0);
  const missingScan = confirmTried && !blocked && scannedTotal <= 0;
  const missingSignature = confirmTried && !signatureBlob;
  const missingOverride = confirmTried && expiredOverride && !overrideReason.trim();
  const blockedFeedback = confirmTried && blocked ? sale?.blockReason : null;
  const statusKey = (sale?.status ?? "") as SaleStatus;
  const columns: Column<HandoverSale>[] = [
    { id: "folio", label: "Folio", size: "lg" },
    {
      id: "clientName",
      label: "Cliente",
      size: "lg",
      format: (value) => (value == null || value === "" ? "—" : String(value)),
    },
    {
      id: "status",
      label: "Estatus",
      size: "md",
      type: "chip",
      chipLabelMap: SALE_STATUS_CHIP_LABELS,
      chipVariantMap: SALE_STATUS_CHIP_VARIANTS,
    },
    {
      id: "holdLabel",
      label: "Resguardo",
      size: "xl",
      format: (value) => (value == null || value === "" ? "—" : String(value)),
    },
    {
      id: "lines",
      label: "Listo",
      size: "md",
      format: (_value, row) => {
        if (!row) return "—";
        if (row.blockReason && readyCount(row) <= 0) return "No disponible";
        const ready = readyCount(row);
        if (ready <= 0) return "Nada listo";
        return ready === 1 ? "1 pieza" : `${ready} piezas`;
      },
    },
  ];
  const listActions: TitleAction[] = [
    {
      id: "scan-ticket",
      label: "Escanear ticket",
      icon: <ScanLine size={18} />,
      onClick: () => setTicketScannerOpen(true),
      variant: "outlined",
    },
    ...(lastReceiptId != null
      ? [
          {
            id: "print-receipt",
            label: "Imprimir comprobante",
            onClick: () => {
              void fetchHandoverPdf(lastReceiptId)
                .then((blob) => printPdfBlob(blob))
                .catch((printError: Error) => showError(printError.message));
            },
            variant: "outlined" as const,
          },
        ]
      : []),
  ];

  return (
    <Stack spacing={3}>
      {sale && (
        <Breadcrumbs
          items={[{ label: "Entregas" }, { label: sale.folio }]}
          onBack={() => setSale(null)}
        />
      )}
      <Title
        title={sale ? sale.folio : "Entregas"}
        description={
          sale ? (
            <Stack spacing={0.75}>
              <Typography variant="body2" color="text.secondary">
                {sale.clientName || "Sin cliente"}
              </Typography>
              <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap">
                <StatusChip
                  size="small"
                  label={SALE_STATUS_CHIP_LABELS[statusKey] ?? sale.status}
                  variant={SALE_STATUS_CHIP_VARIANTS[statusKey] ?? "default"}
                />
                {sale.holdLabel && (
                  <StatusChip
                    size="small"
                    label={sale.holdLabel}
                    variant={sale.holdStatus === "EXPIRED" ? "warning" : "info"}
                  />
                )}
              </Stack>
            </Stack>
          ) : (
            "Retiros en la sucursal seleccionada."
          )
        }
        actions={
          sale
            ? listActions.filter((action) => action.id === "print-receipt")
            : listActions
        }
      />
      {!sale && (
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ sm: "flex-end" }}
        >
          <Box sx={{ width: { xs: "100%", sm: 280 } }}>
            <FormSelect
              label="Sucursal"
              value={branchId}
              options={branches.map((branch) => ({
                value: branch.id,
                label: branch.name,
              }))}
              onChange={(event) => {
                const next = Number(event.target.value);
                setBranchId(Number.isFinite(next) && next > 0 ? next : "");
                setPage(0);
                setSale(null);
              }}
            />
          </Box>
          <Box sx={{ width: { xs: "100%", sm: 360 }, flex: 1 }}>
            <FormTextField
              placeholder="Folio o cliente"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              fullWidth
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={18} color={theme.palette.text.secondary} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Stack>
      )}

      {branchesError && (
        <Alert severity="error">
          {branchesQueryError instanceof Error
            ? branchesQueryError.message
            : "No se pudieron cargar tus sucursales."}
        </Alert>
      )}
      {!sale && !branchesLoading && branches.length === 0 && !branchesError && (
        <Alert severity="info">
          No tienes sucursales asignadas para entregar. Pide que te vinculen a la tienda donde trabajas.
        </Alert>
      )}
      {isError && (
        <Alert severity="error">
          {error instanceof Error ? error.message : "No se pudo cargar la cola."}
        </Alert>
      )}

      {!sale && (
        <TableCrud
          columns={columns}
          rows={queueRows}
          loading={isLoading}
          rowKey="saleId"
          page={page}
          rowsPerPage={rowsPerPage}
          totalRows={total}
          onPageChange={setPage}
          onRowsPerPageChange={setRowsPerPage}
          onRowClick={openSale}
          balanced
          emptyMessage={
            searchValue.trim()
              ? "No hay coincidencias"
              : "No hay entregas en esta sucursal"
          }
        />
      )}

      {sale && (
        <Stack spacing={2}>
          {sale.blockReason && (
            <Alert severity={confirmTried ? "error" : "warning"}>{sale.blockReason}</Alert>
          )}
          {scanError && <Alert severity="error">{scanError}</Alert>}

          <Stack spacing={1}>
            <Typography variant="subtitle2" fontWeight={600}>
              Listo para escanear
            </Typography>
            {readyLines.length > 0 && (
              <Stack
                divider={<Divider />}
                sx={{ border: 1, borderColor: "divider", borderRadius: 1 }}
              >
                {readyLines.map((line) => {
                  const count = scanned[line.saleItemId] ?? 0;
                  return (
                    <Stack
                      key={line.saleItemId}
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      spacing={1}
                      sx={{ px: 1.5, py: 1 }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography fontWeight={500} noWrap>
                          {line.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {line.code}
                        </Typography>
                      </Box>
                      <Typography
                        fontWeight={600}
                        sx={{ flexShrink: 0 }}
                        color={count === line.ready ? "success.main" : "text.primary"}
                      >
                        {count} / {line.ready}
                      </Typography>
                    </Stack>
                  );
                })}
              </Stack>
            )}
            {readyLines.length === 0 && !sale.blockReason && (
              <Typography variant="body2" color="text.secondary">
                Nada listo en esta sucursal.
              </Typography>
            )}
            {supplyLines.length > 0 && (
              <Typography variant="body2" color="text.secondary">
                Por surtir:{" "}
                {supplyLines
                  .map((line) => `${line.name} (${line.pendingSupply})`)
                  .join(" · ")}
              </Typography>
            )}
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                disabled={blocked}
                onClick={() => setScannerOpen(true)}
                sx={{ flex: 1, minHeight: 44 }}
              >
                Escanear
              </Button>
              <Button
                variant="outlined"
                disabled={blocked}
                onClick={() => {
                  setManualCode("");
                  setManualQty("1");
                  setManualError(null);
                  setManualField(null);
                  setManualOpen(true);
                }}
                sx={{ flex: 1, minHeight: 44 }}
              >
                Captura manual
              </Button>
            </Stack>
            {missingScan && (
              <Typography variant="body2" color="error">
                Escanea al menos una pieza antes de confirmar.
              </Typography>
            )}
          </Stack>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            alignItems={{ xs: "stretch", sm: "flex-end" }}
          >
            <FormTextField
              label="Nombre de quien recibe (opcional)"
              placeholder="Quien recibe la mercancía"
              value={receiverName}
              onChange={(event) => setReceiverName(event.target.value)}
              size="small"
              disabled={receiverIsClient}
              sx={{ flex: 1 }}
            />
            <Box
              component="label"
              sx={{
                height: 36,
                px: 1.25,
                display: "inline-flex",
                alignItems: "center",
                gap: 0.75,
                flexShrink: 0,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                bgcolor: "background.paper",
                cursor: sale.clientName.trim() ? "pointer" : "not-allowed",
              }}
            >
              <Checkbox
                size="small"
                checked={receiverIsClient}
                disabled={!sale.clientName.trim()}
                onChange={() => {
                  if (receiverIsClient) {
                    setReceiverIsClient(false);
                    setReceiverName("");
                    return;
                  }
                  setReceiverIsClient(true);
                  setReceiverName(sale.clientName);
                }}
                sx={{ p: 0, width: 20, height: 20 }}
              />
              <Typography variant="body2" sx={{ userSelect: "none" }}>
                Es el cliente
              </Typography>
            </Box>
          </Stack>

          <Stack spacing={1}>
            <Typography variant="subtitle2" color="text.secondary">
              Identificación opcional, si quien recibe no es el cliente
            </Typography>
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <IdPhotoSlot
                  label="INE frontal"
                  file={ineFront}
                  onChange={setIneFront}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <IdPhotoSlot
                  label="INE posterior"
                  file={ineBack}
                  onChange={setIneBack}
                />
              </Grid>
            </Grid>
          </Stack>

          {expiredOverride && (
            <FormTextField
              label="Motivo para entregar con resguardo vencido"
              value={overrideReason}
              onChange={(event) => setOverrideReason(event.target.value)}
              required
              size="small"
              error={missingOverride}
              helperText={
                missingOverride
                  ? "Escribe el motivo para entregar con el resguardo vencido."
                  : undefined
              }
            />
          )}

          <Stack spacing={1}>
            <Typography variant="subtitle2" fontWeight={600}>
              Firma de quien recibe
            </Typography>
            <DropZoneRoot
              isDragActive={false}
              isError={missingSignature}
              onClick={() => {
                setSignatureInk(false);
                setSigning(true);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSignatureInk(false);
                  setSigning(true);
                }
              }}
              sx={compactZoneSx}
            >
              {signaturePreview ? (
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ width: "100%", minWidth: 0 }}
                >
                  <Box
                    component="img"
                    src={signaturePreview}
                    alt="Firma del receptor"
                    sx={{
                      width: 96,
                      height: 44,
                      objectFit: "contain",
                      bgcolor: "#fff",
                      borderRadius: 1,
                      flexShrink: 0,
                    }}
                  />
                  <PenLine size={18} color={theme.palette.success.main} />
                  <Box sx={{ minWidth: 0, flex: 1, textAlign: "left" }}>
                    <Typography variant="body2" fontWeight={600}>
                      Firma lista
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Toca para volver a firmar
                    </Typography>
                  </Box>
                </Stack>
              ) : (
                <Stack direction="row" spacing={1} alignItems="center">
                  <PenLine size={18} color={theme.palette.primary.main} />
                  <Box sx={{ textAlign: "left" }}>
                    <Typography variant="body2" fontWeight={600} color="primary.main">
                      Firmar en pantalla
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Obligatoria
                    </Typography>
                  </Box>
                </Stack>
              )}
            </DropZoneRoot>
            {missingSignature && (
              <Typography variant="body2" color="error">
                Falta la firma de quien recibe.
              </Typography>
            )}
          </Stack>

          {blockedFeedback && (
            <Alert severity="error">{blockedFeedback}</Alert>
          )}
          <Button
            variant="contained"
            fullWidth
            onClick={() => {
              if (confirm.isPending) return;
              if (blocked || scannedTotal <= 0 || !signatureBlob || (expiredOverride && !overrideReason.trim())) {
                setConfirmTried(true);
                return;
              }
              confirm.mutate();
            }}
            sx={{ minHeight: 48 }}
          >
            {confirm.isPending ? "Confirmando..." : "Confirmar entrega"}
          </Button>
        </Stack>
      )}

      <Dialog
        fullScreen
        open={signing}
        onClose={() => setSigning(false)}
        PaperProps={{
          sx: { display: "flex", flexDirection: "column" },
        }}
      >
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "safe center",
            gap: 2,
            flex: 1,
            minHeight: 0,
            p: { xs: 2, sm: 3 },
            "@media (orientation: landscape) and (pointer: coarse)": {
              gap: 1.25,
              p: 1.5,
            },
          }}
        >
          <Box>
            <Typography
              sx={{ fontSize: { xs: "1.2rem", sm: "1.35rem" }, fontWeight: 700, lineHeight: 1.25 }}
            >
              Firma del receptor
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Firma con el dedo dentro del recuadro.
            </Typography>
          </Box>

          <SignatureSection>
            <SignatureCanvasWrapper>
              <SignaturePad canvasRef={canvasRef} onInk={setSignatureInk} />
            </SignatureCanvasWrapper>
            <SignatureLegalText>
              La firma confirma que recibió la mercancía.
            </SignatureLegalText>
            <Button
              variant="text"
              startIcon={<PenSquare size={16} />}
              disabled={!signatureInk}
              onClick={() => {
                const canvas = canvasRef.current;
                const ctx = canvas?.getContext("2d");
                if (!canvas || !ctx) return;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.beginPath();
                setSignatureInk(false);
              }}
              sx={{ alignSelf: "flex-end", minHeight: 44 }}
            >
              Limpiar firma
            </Button>
          </SignatureSection>

          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              pt: 2,
              borderTop: 1,
              borderColor: "divider",
              flexShrink: 0,
            }}
          >
            <Button
              variant="outlined"
              onClick={() => setSigning(false)}
              sx={{ flex: 1, minHeight: 48 }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              disabled={!signatureInk}
              onClick={() => {
                const canvas = canvasRef.current;
                if (!canvas || !signatureInk) return;
                setSignaturePreview(canvas.toDataURL("image/png"));
                canvas.toBlob((file) => {
                  if (!file) return;
                  setSignatureBlob(file);
                  setSigning(false);
                }, "image/png");
              }}
              sx={{ flex: 1, minHeight: 48 }}
            >
              Listo
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>

      <ProductCodeScannerDialog
        open={ticketScannerOpen}
        onClose={() => setTicketScannerOpen(false)}
        onCodeScanned={(code) => {
          setSearchInput(code);
          setSearch(code);
          setSale(null);
        }}
      />
      <ProductCodeScannerDialog
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onCodeScanned={(code) => {
          const message = commitScan(code, 1, "BARCODE");
          if (message) setScanError(message);
        }}
      />
      <Dialog
        open={manualOpen}
        onClose={() => setManualOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Captura manual</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Úsala si la etiqueta no se lee. El código es el de la pieza de esta venta y la cantidad no puede pasar lo que sigue listo.
            </Typography>
            {readyLines.length > 0 && (
              <Stack
                divider={<Divider />}
                sx={{ border: 1, borderColor: "divider", borderRadius: 1 }}
              >
                {readyLines.map((line) => {
                  const count = scanned[line.saleItemId] ?? 0;
                  const left = line.ready - count;
                  return (
                    <Stack
                      key={line.saleItemId}
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      spacing={1}
                      sx={{ px: 1.5, py: 1 }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={600} noWrap>
                          {line.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {line.code}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{ flexShrink: 0 }}
                        color={left <= 0 ? "success.main" : "text.primary"}
                      >
                        {left <= 0 ? "Completa" : `Faltan ${left}`}
                      </Typography>
                    </Stack>
                  );
                })}
              </Stack>
            )}
            <FormTextField
              label="Código"
              value={manualCode}
              onChange={(event) => {
                setManualCode(event.target.value);
                if (manualField === "code") {
                  setManualField(null);
                  setManualError(null);
                }
              }}
              error={manualField === "code"}
              helperText={
                manualField === "code"
                  ? manualError ?? undefined
                  : "Tal como aparece en la etiqueta."
              }
              autoFocus
            />
            <FormTextField
              label="Cantidad"
              type="number"
              value={manualQty}
              onChange={(event) => {
                setManualQty(event.target.value);
                if (manualField === "qty") {
                  setManualField(null);
                  setManualError(null);
                }
              }}
              error={manualField === "qty"}
              helperText={
                manualField === "qty"
                  ? manualError ?? undefined
                  : "Entero, de 1 hasta lo que falta de esa pieza."
              }
              inputProps={{ min: 1, step: 1 }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setManualOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={() => {
              const code = manualCode.trim();
              const quantity = Number(manualQty);
              if (!code) {
                setManualField("code");
                setManualError("Escribe el código de la pieza.");
                return;
              }
              if (!Number.isInteger(quantity) || quantity < 1) {
                setManualField("qty");
                setManualError("Indica una cantidad entera, de 1 en adelante.");
                return;
              }
              const message = commitScan(code, quantity, "MANUAL");
              if (message) {
                setManualField(
                  message.startsWith("La cantidad") ? "qty" : "code",
                );
                setManualError(message);
                return;
              }
              setManualOpen(false);
              setManualCode("");
              setManualQty("1");
              setManualError(null);
              setManualField(null);
            }}
          >
            Agregar
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
