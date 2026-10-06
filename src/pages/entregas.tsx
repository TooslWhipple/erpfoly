import { useEffect, useRef, useState, type PointerEvent } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ProductCodeScannerDialog } from "@/components/ProductCodeScannerDialog/ProductCodeScannerDialog";
import { usePermissions } from "@/hooks/usePermissions";
import { useBranchesSelect } from "@/hooks/branches/useBranchesSelect";
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
import { useAuthStore } from "@/store/useAuthStore";
import { useSnackbarStore } from "@/store/useSnackbarStore";

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
  onInk,
}: {
  onInk: (canvas: HTMLCanvasElement, hasInk: boolean) => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.floor(rect.width * 2));
    canvas.height = Math.max(1, Math.floor(rect.height * 2));
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(2, 2);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#111";
  }, []);

  const point = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = ref.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  return (
    <Box
      component="canvas"
      ref={ref}
      sx={{
        width: "100%",
        height: 220,
        touchAction: "none",
        bgcolor: "#fff",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
      }}
      onPointerDown={(event) => {
        const canvas = ref.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;
        drawing.current = true;
        canvas.setPointerCapture(event.pointerId);
        const { x, y } = point(event);
        ctx.beginPath();
        ctx.moveTo(x, y);
      }}
      onPointerMove={(event) => {
        if (!drawing.current) return;
        const canvas = ref.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;
        const { x, y } = point(event);
        ctx.lineTo(x, y);
        ctx.stroke();
        onInk(canvas, true);
      }}
      onPointerUp={() => {
        drawing.current = false;
      }}
    />
  );
}

export default function EntregasPage() {
  const user = useAuthStore((state) => state.user);
  const showError = useSnackbarStore((state) => state.showError);
  const showSuccess = useSnackbarStore((state) => state.showSuccess);
  const { hasPermission } = usePermissions();
  const canOverride = hasPermission(DELIVERY_HOLD_UPDATE);
  const { data: branches = [] } = useBranchesSelect();
  const queryClient = useQueryClient();
  const [branchId, setBranchId] = useState<number | "">(
    user?.principalBranchId ?? "",
  );
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [sale, setSale] = useState<HandoverSale | null>(null);
  const [scanned, setScanned] = useState<Record<number, number>>({});
  const [methods, setMethods] = useState<Record<number, "BARCODE" | "MANUAL">>({});
  const [scannerOpen, setScannerOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [manualQty, setManualQty] = useState("1");
  const [receiverName, setReceiverName] = useState("");
  const [overrideReason, setOverrideReason] = useState("");
  const [ineFront, setIneFront] = useState<File | null>(null);
  const [ineBack, setIneBack] = useState<File | null>(null);
  const [hasInk, setHasInk] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [lastReceiptId, setLastReceiptId] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const idempotencyKey = useRef(crypto.randomUUID());

  const queue = useQuery({
    queryKey: ["handover-queue", branchId, submittedQuery],
    queryFn: () => listHandoverQueue(Number(branchId), submittedQuery),
    enabled: branchId !== "",
  });

  const expiredOverride =
    sale?.holdStatus === "EXPIRED" && canOverride && Boolean(sale.blockReason);
  const blocked = Boolean(sale?.blockReason) && !expiredOverride;

  const openSale = (row: HandoverSale) => {
    setSale(row);
    setScanned({});
    setMethods({});
    setScanError(null);
    setHasInk(false);
    setOverrideReason("");
    setIneFront(null);
    setIneBack(null);
    idempotencyKey.current = crypto.randomUUID();
  };

  const onCode = (code: string, quantity: number, method: "BARCODE" | "MANUAL") => {
    if (!sale || blocked) return;
    const result = applyCode(sale.lines, scanned, code, quantity);
    if (result.error) {
      setScanError(result.error);
      return;
    }
    setScanError(null);
    setScanned(result.scanned);
    const nextMethods = { ...methods };
    for (const line of sale.lines) {
      if ((result.scanned[line.saleItemId] ?? 0) > (scanned[line.saleItemId] ?? 0)) {
        nextMethods[line.saleItemId] = method;
      }
    }
    setMethods(nextMethods);
  };

  const confirm = useMutation({
    mutationFn: async () => {
      if (!sale || branchId === "" || !canvasRef.current) {
        throw new Error("Falta la firma del receptor.");
      }
      const blob = await new Promise<Blob | null>((resolve) => {
        canvasRef.current?.toBlob((file) => resolve(file), "image/png");
      });
      if (!blob) throw new Error("No se pudo guardar la firma.");
      const signatureFileId = await uploadHandoverFile(blob, "SIGNATURE", "firma.png");
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

  return (
    <Stack spacing={2} sx={{ p: { xs: 2, md: 3 }, maxWidth: 860, mx: "auto" }}>
      <Typography variant="h5" fontWeight={700}>
        Entregas
      </Typography>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
        <TextField
          select
          label="Sucursal"
          value={branchId}
          onChange={(event) => setBranchId(Number(event.target.value))}
          SelectProps={{ native: true }}
          sx={{ minWidth: 220 }}
        >
          <option value="" />
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </TextField>
        <TextField
          label="Folio o cliente"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          fullWidth
          onKeyDown={(event) => {
            if (event.key === "Enter") setSubmittedQuery(query);
          }}
        />
        <Button variant="contained" onClick={() => setSubmittedQuery(query)}>
          Buscar
        </Button>
        {lastReceiptId != null && (
          <Button
            variant="outlined"
            onClick={() => {
              void fetchHandoverPdf(lastReceiptId)
                .then((blob) => printPdfBlob(blob))
                .catch((error: Error) => showError(error.message));
            }}
          >
            Imprimir comprobante
          </Button>
        )}
      </Stack>

      {queue.error instanceof Error && (
        <Alert severity="error">{queue.error.message}</Alert>
      )}

      {!sale && (
        <Stack spacing={1}>
          {(queue.data ?? []).map((row) => (
            <Button
              key={row.saleId}
              variant="outlined"
              onClick={() => openSale(row)}
              sx={{ justifyContent: "space-between", textAlign: "left", py: 1.5 }}
            >
              <span>
                {row.folio} · {row.clientName || "Sin cliente"}
              </span>
              <span>{row.holdLabel ?? row.blockReason ?? row.status}</span>
            </Button>
          ))}
          {queue.data?.length === 0 && (
            <Typography color="text.secondary">No hay coincidencias.</Typography>
          )}
        </Stack>
      )}

      {sale && (
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6">{sale.folio}</Typography>
              <Typography color="text.secondary">{sale.clientName}</Typography>
            </Box>
            <Button onClick={() => setSale(null)}>Volver</Button>
          </Stack>
          {sale.holdLabel && <Chip label={sale.holdLabel} />}
          {sale.blockReason && <Alert severity="warning">{sale.blockReason}</Alert>}
          {scanError && <Alert severity="error">{scanError}</Alert>}

          <Typography fontWeight={700}>Listo para escanear</Typography>
          {readyLines.map((line) => {
            const count = scanned[line.saleItemId] ?? 0;
            return (
              <Stack key={line.saleItemId} direction="row" justifyContent="space-between">
                <Typography>
                  {line.code} · {line.name}
                </Typography>
                <Typography fontWeight={700} color={count === line.ready ? "success.main" : "text.primary"}>
                  {count} / {line.ready}
                </Typography>
              </Stack>
            );
          })}
          {readyLines.length === 0 && (
            <Typography color="text.secondary">Nada listo en esta sucursal.</Typography>
          )}

          {supplyLines.length > 0 && (
            <>
              <Typography fontWeight={700}>Por surtir</Typography>
              {supplyLines.map((line) => (
                <Typography key={line.saleItemId} color="text.secondary">
                  {line.code} · {line.name} · {line.pendingSupply}
                </Typography>
              ))}
            </>
          )}

          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              disabled={blocked}
              onClick={() => setScannerOpen(true)}
            >
              Escanear
            </Button>
            <Button variant="outlined" disabled={blocked} onClick={() => setManualOpen(true)}>
              Captura manual
            </Button>
          </Stack>

          <TextField
            label="Nombre de quien recibe (opcional)"
            value={receiverName}
            onChange={(event) => setReceiverName(event.target.value)}
          />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <Button variant="outlined" component="label">
              INE frente
              <input
                hidden
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(event) => setIneFront(event.target.files?.[0] ?? null)}
              />
            </Button>
            <Button variant="outlined" component="label">
              INE reverso
              <input
                hidden
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(event) => setIneBack(event.target.files?.[0] ?? null)}
              />
            </Button>
            <Typography color="text.secondary" sx={{ alignSelf: "center" }}>
              {ineFront ? "Frente listo" : "Frente opcional"}
              {" · "}
              {ineBack ? "Reverso listo" : "Reverso opcional"}
            </Typography>
          </Stack>

          {expiredOverride && (
            <TextField
              label="Motivo para entregar con resguardo vencido"
              value={overrideReason}
              onChange={(event) => setOverrideReason(event.target.value)}
              required
            />
          )}

          <Typography fontWeight={700}>Firma</Typography>
          <SignaturePad
            onInk={(canvas, ink) => {
              canvasRef.current = canvas;
              setHasInk(ink);
            }}
          />
          <Button
            variant="contained"
            size="large"
            disabled={
              confirm.isPending ||
              !hasInk ||
              scannedTotal <= 0 ||
              blocked ||
              (expiredOverride && !overrideReason.trim())
            }
            onClick={() => confirm.mutate()}
          >
            Confirmar entrega
          </Button>
        </Stack>
      )}

      <ProductCodeScannerDialog
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onCodeScanned={(code) => onCode(code, 1, "BARCODE")}
      />
      <Dialog open={manualOpen} onClose={() => setManualOpen(false)} fullWidth>
        <DialogTitle>Captura manual</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Código"
              value={manualCode}
              onChange={(event) => setManualCode(event.target.value)}
              autoFocus
            />
            <TextField
              label="Cantidad"
              type="number"
              value={manualQty}
              onChange={(event) => setManualQty(event.target.value)}
              inputProps={{ min: 1 }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setManualOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={() => {
              const quantity = Number(manualQty);
              if (!manualCode.trim() || !Number.isInteger(quantity) || quantity < 1) {
                setScanError("Indica un código y una cantidad válida.");
                return;
              }
              onCode(manualCode, quantity, "MANUAL");
              setManualOpen(false);
              setManualCode("");
              setManualQty("1");
            }}
          >
            Agregar
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
