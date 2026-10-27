import { useMemo, useRef, useState } from "react";
import {
  Alert,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  Skeleton,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Info, ShieldCheck, X as CloseIcon } from "lucide-react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import numeral from "numeral";
import { CloseButton, ModalTitle } from "@/components/ModalForm/styles";
import { FormAutocomplete, FormTextField } from "@/components/Form";
import NumberSpinner from "@/components/NumberSpinner";
import {
  SupervisorCredentialsDialog,
  type SupervisorCredentials,
} from "@/components/SupervisorCredentialsDialog";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getApiErrorMessage, unwrapOrThrow } from "@/lib/axios";
import {
  createSaleCancellation,
  getSaleCancellationPreview,
} from "@/services/sale-cancellation.service";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import type {
  SaleCancellationLineSelection,
  SaleCancellationPreviewLine,
  SaleCancellationResult,
} from "@/types/saleCancellation.types";
import {
  BodyGrid,
  FooterArea,
  FooterButtons,
  FooterHint,
  HeaderArea,
  HeaderChips,
  HeaderText,
  LineControls,
  LineInfo,
  LineList,
  LineRow,
  MainColumn,
  ModalShell,
  Section,
  SectionHeader,
  SectionTitle,
  SideColumn,
  StepBadge,
  SummaryCard,
  SummaryRow,
} from "./styles";

const SIMULATION_DEBOUNCE_MS = 300;
const NOTES_MAX_LENGTH = 500;

/** Raíces de consultas que cambian al cancelar piezas de una venta. */
const AFFECTED_QUERY_ROOTS = new Set([
  "sales",
  "venta-detail",
  "clients",
  "clientes",
  "sale-credits",
  "sale-handover",
  "inventory",
  "red-deliveries",
  "pos-client-loyalty",
]);

function formatCurrency(value: number): string {
  return numeral(value).format("$0,0.00");
}

function formatUnits(count: number): string {
  return count === 1 ? "1 pieza" : `${count} piezas`;
}

function selectionKey(lines: SaleCancellationLineSelection[]): string {
  return lines.map((line) => `${line.saleItemId}:${line.quantity}`).join(",");
}

function lineMeta(line: SaleCancellationPreviewLine): string {
  const parts = [`${line.availableQuantity} de ${line.quantity} sin entregar`];
  if (line.deliveredQuantity > 0)
    parts.push(`${line.deliveredQuantity} entregadas`);
  if (line.cancelledQuantity > 0)
    parts.push(`${line.cancelledQuantity} canceladas`);
  return parts.join(" · ");
}

export interface SaleCancellationModalProps {
  open: boolean;
  saleId: number;
  onClose: () => void;
  onSuccess?: (result: SaleCancellationResult) => void;
}

/**
 * Cancelación por pieza de lo no entregado. Antes de Cajas anula y recotiza;
 * después de Cajas pide autorización de gerente y muestra el efecto en saldo
 * a favor, crédito o apartado antes de confirmar.
 */
export function SaleCancellationModal({
  open,
  saleId,
  onClose,
  onSuccess,
}: SaleCancellationModalProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const queryClient = useQueryClient();
  const showSuccess = useSnackbarStore((state) => state.showSuccess);
  const showWarning = useSnackbarStore((state) => state.showWarning);
  const showError = useSnackbarStore((state) => state.showError);

  const [selection, setSelection] = useState<Record<number, number>>({});
  const [reasonId, setReasonId] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const idempotencyKeyRef = useRef<string | null>(null);

  const previewQuery = useQuery({
    queryKey: ["sale-cancellation-preview", saleId],
    enabled: open,
    queryFn: async () =>
      unwrapOrThrow(await getSaleCancellationPreview(saleId)),
    staleTime: 0,
  });
  const preview = previewQuery.data;

  const selectedLines = useMemo<SaleCancellationLineSelection[]>(
    () =>
      Object.entries(selection)
        .filter(([, quantity]) => quantity > 0)
        .map(([saleItemId, quantity]) => ({
          saleItemId: Number(saleItemId),
          quantity,
        })),
    [selection],
  );
  const currentKey = selectionKey(selectedLines);
  const debouncedLines = useDebouncedValue(
    selectedLines,
    SIMULATION_DEBOUNCE_MS,
  );
  const debouncedKey = selectionKey(debouncedLines);

  const simulationQuery = useQuery({
    queryKey: ["sale-cancellation-preview", saleId, debouncedKey],
    enabled:
      open && Boolean(preview) && !preview?.blockReason && debouncedKey !== "",
    queryFn: async () =>
      unwrapOrThrow(await getSaleCancellationPreview(saleId, debouncedLines)),
    placeholderData: keepPreviousData,
  });
  const hasSelection = selectedLines.length > 0;
  const simulation = hasSelection
    ? (simulationQuery.data?.simulation ?? null)
    : null;
  const simulationReady =
    hasSelection &&
    debouncedKey === currentKey &&
    !simulationQuery.isPlaceholderData &&
    simulationQuery.isSuccess &&
    simulation !== null;
  const simulationError = hasSelection && simulationQuery.isError;

  const cancellableLines = useMemo(
    () => (preview?.lines ?? []).filter((line) => line.availableQuantity > 0),
    [preview?.lines],
  );
  const allSelected =
    cancellableLines.length > 0 &&
    cancellableLines.every(
      (line) => selection[line.saleItemId] === line.availableQuantity,
    );

  const reasonOptions = useMemo(
    () =>
      (preview?.reasons ?? []).map((reason) => ({
        value: String(reason.id),
        label: reason.name,
      })),
    [preview?.reasons],
  );
  const selectedReason = preview?.reasons.find(
    (reason) => reason.id === reasonId,
  );
  const trimmedNotes = notes.trim();
  const notesRequired = selectedReason?.allowsCustomText ?? false;
  const missingClient =
    Boolean(simulation && simulation.creditedAmount > 0) &&
    preview?.hasClient === false;
  const isVoid = preview?.type === "VOID";
  const reasonDone =
    reasonId !== null && (!notesRequired || trimmedNotes.length > 0);

  const pendingStep = !hasSelection
    ? "Selecciona al menos una pieza."
    : reasonId === null
      ? "Elige el motivo de cancelación."
      : notesRequired && !trimmedNotes
        ? "Describe el motivo en las notas."
        : simulationError
          ? "No se pudo calcular el resumen."
          : missingClient
            ? "La venta necesita un cliente para abonar el saldo a favor."
            : !simulationReady
              ? "Calculando el resumen…"
              : null;
  const canSubmit =
    Boolean(preview) && !preview?.blockReason && pendingStep === null;

  const resetKey = () => {
    idempotencyKeyRef.current = null;
  };

  const resetForm = () => {
    setSelection({});
    setReasonId(null);
    setNotes("");
    setAuthOpen(false);
    setAuthError(null);
    resetKey();
  };

  const mutation = useMutation({
    mutationFn: async (credentials?: SupervisorCredentials) => {
      if (reasonId === null)
        throw new Error("Selecciona un motivo de cancelación.");
      idempotencyKeyRef.current ??= crypto.randomUUID();
      return unwrapOrThrow(
        await createSaleCancellation(saleId, {
          idempotencyKey: idempotencyKeyRef.current,
          reasonId,
          notes: trimmedNotes || undefined,
          lines: selectedLines,
          authorization: credentials
            ? { username: credentials.username, password: credentials.password }
            : undefined,
        }),
      );
    },
    onSuccess: async (result) => {
      showSuccess(result.message);
      result.warnings.forEach((warning) => showWarning(warning));
      resetForm();
      onClose();
      await queryClient.invalidateQueries({
        predicate: (query) => {
          const root = String(query.queryKey[0]);
          return (
            root === "sale-cancellation-preview" ||
            AFFECTED_QUERY_ROOTS.has(root)
          );
        },
      });
      onSuccess?.(result);
    },
    onError: (error: Error) => {
      const message = getApiErrorMessage(error);
      if (authOpen) {
        setAuthError(message);
      } else {
        showError(message);
      }
      void previewQuery.refetch();
    },
  });

  const busy = mutation.isPending;

  const handleClose = () => {
    if (busy) return;
    resetForm();
    onClose();
  };

  const updateSelection = (next: Record<number, number>) => {
    resetKey();
    setSelection(next);
  };

  const toggleLine = (line: SaleCancellationPreviewLine) => {
    if (line.availableQuantity <= 0 || busy) return;
    const next = { ...selection };
    if (next[line.saleItemId]) {
      delete next[line.saleItemId];
    } else {
      next[line.saleItemId] = line.availableQuantity;
    }
    updateSelection(next);
  };

  const toggleAll = () => {
    if (allSelected) {
      updateSelection({});
      return;
    }
    updateSelection(
      Object.fromEntries(
        cancellableLines.map((line) => [
          line.saleItemId,
          line.availableQuantity,
        ]),
      ),
    );
  };

  const selectReason = (id: number | null) => {
    resetKey();
    setReasonId(id);
  };

  const handleSubmit = () => {
    if (!canSubmit || !preview) return;
    if (preview.requiresAuthorization) {
      setAuthError(null);
      setAuthOpen(true);
      return;
    }
    mutation.mutate(undefined);
  };

  const isTotal = simulation?.scope === "TOTAL";
  const submitLabel = isVoid
    ? "Quitar piezas"
    : preview?.requiresAuthorization
      ? isTotal
        ? "Autorizar y cancelar venta"
        : "Autorizar y cancelar piezas"
      : isTotal
        ? "Cancelar venta"
        : "Cancelar piezas";

  const renderLine = (line: SaleCancellationPreviewLine) => {
    const blocked = line.availableQuantity <= 0;
    const quantity = selection[line.saleItemId] ?? 0;
    const selected = quantity > 0;
    return (
      <LineRow
        key={line.saleItemId}
        selected={selected}
        blocked={blocked}
        role="checkbox"
        aria-checked={selected}
        aria-disabled={blocked}
        tabIndex={blocked ? -1 : 0}
        onClick={() => toggleLine(line)}
        onKeyDown={(event) => {
          if (event.key === " " || event.key === "Enter") {
            event.preventDefault();
            toggleLine(line);
          }
        }}
      >
        <Checkbox
          checked={selected}
          disabled={blocked || busy}
          tabIndex={-1}
          sx={{ p: 0.5, pointerEvents: "none" }}
          inputProps={{ "aria-hidden": true }}
        />
        <LineInfo>
          <Typography
            variant="body2"
            fontWeight={600}
            noWrap
            title={line.productName}
          >
            {line.productName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {line.productCode} · {lineMeta(line)}
          </Typography>
          {line.blockMessage ? (
            <Typography variant="caption" color="warning.main">
              {line.blockMessage}
            </Typography>
          ) : null}
        </LineInfo>
        <LineControls onClick={(event) => event.stopPropagation()}>
          {selected && line.availableQuantity > 1 ? (
            <NumberSpinner
              value={quantity}
              min={1}
              max={line.availableQuantity}
              disabled={busy}
              size="medium"
              iconSize={16}
              onChange={(value) =>
                updateSelection({ ...selection, [line.saleItemId]: value })
              }
              decrementAriaLabel="Quitar una pieza"
              incrementAriaLabel="Agregar una pieza"
              inputAriaLabel={`Piezas a cancelar de ${line.productName}`}
            />
          ) : null}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ whiteSpace: "nowrap" }}
          >
            {formatCurrency(line.unitAmount)} c/u
          </Typography>
        </LineControls>
      </LineRow>
    );
  };

  const renderSummary = () => {
    if (!hasSelection) {
      return (
        <SummaryCard>
          <Typography variant="subtitle2">Resumen</Typography>
          <Typography variant="body2" color="text.secondary">
            Selecciona las piezas para ver el importe y su efecto en los pagos.
          </Typography>
        </SummaryCard>
      );
    }
    if (simulationError) {
      return (
        <Alert severity="error">
          {getApiErrorMessage(simulationQuery.error)}
        </Alert>
      );
    }
    if (!simulation) {
      return <Skeleton variant="rounded" height={160} />;
    }
    return (
      <SummaryCard
        aria-busy={!simulationReady}
        sx={{ opacity: simulationReady ? 1 : 0.6 }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="subtitle2">Resumen</Typography>
          <Chip
            size="small"
            color={isTotal ? "error" : "default"}
            label={isTotal ? "Cancelación total" : "Cancelación parcial"}
          />
        </Stack>
        <SummaryRow>
          <Typography variant="body2" color="text.secondary">
            Piezas
          </Typography>
          <Typography variant="body2">
            {formatUnits(simulation.units)}
          </Typography>
        </SummaryRow>
        <SummaryRow>
          <Typography variant="body2" color="text.secondary">
            Mercancía
          </Typography>
          <Typography variant="body2">
            {formatCurrency(simulation.merchandiseAmount)}
          </Typography>
        </SummaryRow>
        {isVoid ? (
          <Typography variant="caption" color="text.secondary">
            La venta aún no se cobra: el total se recalcula con promociones y
            descuentos al quitar las piezas.
          </Typography>
        ) : (
          <>
            {simulation.shippingAmount > 0 ? (
              <SummaryRow>
                <Typography variant="body2" color="text.secondary">
                  Envío
                </Typography>
                <Typography variant="body2">
                  {formatCurrency(simulation.shippingAmount)}
                </Typography>
              </SummaryRow>
            ) : null}
            <SummaryRow emphasis>
              <Typography variant="body1" fontWeight={600}>
                Total a cancelar
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {formatCurrency(simulation.totalAmount)}
              </Typography>
            </SummaryRow>
            {simulation.creditedAmount > 0 ? (
              <SummaryRow>
                <Typography variant="body2" color="success.main">
                  Saldo a favor del cliente
                </Typography>
                <Typography
                  variant="body2"
                  color="success.main"
                  fontWeight={600}
                >
                  {formatCurrency(simulation.creditedAmount)}
                </Typography>
              </SummaryRow>
            ) : null}
            {simulation.outstandingReduction > 0 ? (
              <SummaryRow>
                <Typography variant="body2" color="text.secondary">
                  Baja del saldo pendiente
                </Typography>
                <Typography variant="body2">
                  {formatCurrency(simulation.outstandingReduction)}
                </Typography>
              </SummaryRow>
            ) : null}
            <SummaryRow>
              <Typography variant="body2" color="text.secondary">
                Nuevo total de la venta
              </Typography>
              <Typography variant="body2">
                {formatCurrency(simulation.newTotal)}
              </Typography>
            </SummaryRow>
          </>
        )}
      </SummaryCard>
    );
  };

  const renderContent = () => {
    if (previewQuery.isLoading) {
      return (
        <BodyGrid>
          <MainColumn>
            <Skeleton variant="rounded" height={64} />
            <Skeleton variant="rounded" height={64} />
            <Skeleton variant="rounded" height={120} />
          </MainColumn>
          <SideColumn>
            <Skeleton variant="rounded" height={160} />
          </SideColumn>
        </BodyGrid>
      );
    }
    if (previewQuery.isError || !preview || preview.blockReason) {
      return (
        <>
          <BodyGrid sx={{ gridTemplateColumns: "minmax(0, 1fr) !important" }}>
            <Alert severity={preview?.blockReason ? "info" : "error"}>
              {preview?.blockMessage ?? getApiErrorMessage(previewQuery.error)}
            </Alert>
          </BodyGrid>
          <FooterArea>
            <span />
            <FooterButtons>
              <Button variant="contained" onClick={handleClose}>
                Entendido
              </Button>
            </FooterButtons>
          </FooterArea>
        </>
      );
    }

    return (
      <>
        <BodyGrid>
          <MainColumn>
            {preview.warnings.map((warning) => (
              <Alert key={warning} severity="warning">
                {warning}
              </Alert>
            ))}

            <Section aria-label="Piezas a cancelar">
              <SectionHeader>
                <SectionTitle>
                  <StepBadge done={hasSelection}>1</StepBadge>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Piezas sin entregar
                  </Typography>
                </SectionTitle>
                {cancellableLines.length > 1 ? (
                  <Button size="small" onClick={toggleAll} disabled={busy}>
                    {allSelected ? "Quitar selección" : "Seleccionar todo"}
                  </Button>
                ) : null}
              </SectionHeader>
              <LineList>{preview.lines.map(renderLine)}</LineList>
            </Section>

            <Section aria-label="Motivo">
              <SectionHeader>
                <SectionTitle>
                  <StepBadge done={reasonDone}>2</StepBadge>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Motivo de cancelación
                  </Typography>
                </SectionTitle>
              </SectionHeader>
              {preview.reasons.length === 0 ? (
                <Alert severity="error">
                  No hay motivos de cancelación activos. Pide a un administrador
                  que los dé de alta para poder continuar.
                </Alert>
              ) : null}
              <FormAutocomplete
                label="Motivo"
                options={reasonOptions}
                value={reasonId != null ? String(reasonId) : ""}
                onChange={(value) => selectReason(value ? Number(value) : null)}
                placeholder="Selecciona un motivo"
                noOptionsText="Sin motivos"
                required
                disabled={busy || preview.reasons.length === 0}
              />
              <FormTextField
                label={
                  notesRequired ? "Describe el motivo" : "Notas (opcional)"
                }
                value={notes}
                onChange={(event) => {
                  resetKey();
                  setNotes(event.target.value);
                }}
                required={notesRequired}
                disabled={busy}
                multiline
                minRows={2}
                fullWidth
                size="small"
                inputProps={{ maxLength: NOTES_MAX_LENGTH }}
              />
            </Section>
          </MainColumn>

          <SideColumn>
            {renderSummary()}
            {missingClient ? (
              <Alert severity="error">
                La venta no tiene cliente: asigna uno para abonar lo pagado como
                saldo a favor.
              </Alert>
            ) : null}
            {preview.requiresAuthorization ? (
              <Alert severity="info" icon={<ShieldCheck size={18} />}>
                La venta ya pasó por Cajas: al confirmar, un gerente de la
                sucursal o un administrador debe autorizar.
              </Alert>
            ) : null}
          </SideColumn>
        </BodyGrid>

        <FooterArea>
          <FooterHint aria-live="polite">
            {pendingStep ? (
              <>
                <Info size={16} aria-hidden style={{ flexShrink: 0 }} />
                <Typography variant="body2" color="inherit">
                  {pendingStep}
                </Typography>
              </>
            ) : simulation && !isVoid ? (
              <Typography variant="body2" color="text.primary">
                {formatUnits(simulation.units)} ·{" "}
                <strong>{formatCurrency(simulation.totalAmount)}</strong>
              </Typography>
            ) : null}
          </FooterHint>
          <FooterButtons>
            <Button variant="outlined" disabled={busy} onClick={handleClose}>
              Volver
            </Button>
            <Button
              variant="contained"
              color="error"
              disabled={!canSubmit || busy}
              onClick={handleSubmit}
            >
              {busy && !authOpen ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                submitLabel
              )}
            </Button>
          </FooterButtons>
        </FooterArea>
      </>
    );
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        fullScreen={fullScreen}
        PaperProps={{
          sx: {
            borderRadius: fullScreen ? 0 : 3,
            height: fullScreen ? "100%" : "min(760px, 92vh)",
            overflow: "hidden",
          },
        }}
      >
        <ModalShell>
          <HeaderArea>
            <HeaderText>
              <ModalTitle>
                {preview ? `Cancelar venta ${preview.folio}` : "Cancelar venta"}
              </ModalTitle>
              <Typography variant="body2" color="text.secondary">
                {isVoid
                  ? "Quita piezas antes de cobrar; lo que quede se recotiza."
                  : "Solo se cancelan piezas no entregadas. Lo entregado se atiende como devolución."}
              </Typography>
              {preview && !preview.blockReason ? (
                <HeaderChips>
                  <Chip
                    size="small"
                    variant="outlined"
                    label={`Total vigente ${formatCurrency(preview.currentTotal)}`}
                  />
                  {!isVoid ? (
                    <Chip
                      size="small"
                      variant="outlined"
                      label={`Pagado ${formatCurrency(preview.netPaid)}`}
                    />
                  ) : null}
                  {preview.requiresAuthorization ? (
                    <Chip
                      size="small"
                      color="warning"
                      variant="outlined"
                      label="Requiere gerente"
                    />
                  ) : null}
                </HeaderChips>
              ) : null}
            </HeaderText>
            <CloseButton
              onClick={handleClose}
              disabled={busy}
              size="small"
              aria-label="Cerrar"
            >
              <CloseIcon size={16} />
            </CloseButton>
          </HeaderArea>
          {renderContent()}
        </ModalShell>
      </Dialog>

      {authOpen ? (
        <SupervisorCredentialsDialog
          open
          title="Autorización de gerente"
          description={
            simulation
              ? `Autoriza la cancelación de ${formatUnits(simulation.units)} por ${formatCurrency(simulation.totalAmount)}.`
              : "Autoriza la cancelación."
          }
          confirmLabel="Autorizar cancelación"
          loading={busy}
          error={authError}
          onClose={() => {
            if (busy) return;
            setAuthOpen(false);
            setAuthError(null);
          }}
          onConfirm={(credentials) => {
            setAuthError(null);
            mutation.mutate(credentials);
          }}
        />
      ) : null}
    </>
  );
}
