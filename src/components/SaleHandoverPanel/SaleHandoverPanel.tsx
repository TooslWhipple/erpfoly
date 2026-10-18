import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Box, Button, Divider, Skeleton, Stack, Typography } from "@mui/material";
import { Download, Pencil, Printer } from "lucide-react";
import { StatusChip } from "@/components/StatusChip";
import {
  HOLDER_RECEIVER_DRAFT,
  PickupReceiverFields,
  draftFromPickupReceiver,
  getPickupReceiverError,
  toPickupReceiverPayload,
} from "@/components/SaleBuilder/PickupReceiverFields";
import type { PickupReceiverDraft } from "@/components/SaleBuilder/PickupReceiverFields";
import { usePermissions } from "@/hooks/usePermissions";
import { SALES_READ, SALES_UPDATE } from "@/lib/permissions";
import {
  downloadHandoverReceipt,
  getSaleHandovers,
  printHandoverReceipt,
  printSaleTicket,
} from "@/services/sale-handover.service";
import { updatePickupReceiver } from "@/services/ventas.service";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import type {
  HandoverHistoryEntry,
  HandoverProgress,
  HandoverValidationMethod,
  PickupReceiver,
} from "@/types/saleHandover.types";
import { formatDateTimeShort } from "@/utils/date";
import {
  HANDOVER_STATUS_LABELS,
  HANDOVER_STATUS_VARIANTS,
} from "@/utils/saleStatus";

const VALIDATION_LABELS: Record<HandoverValidationMethod, string> = {
  HOLDER: "Titular",
  THIRD_PARTY_OTP: "Tercero con código",
  SUPERVISOR: "Autorizada por supervisor",
};

export const saleHandoversKey = (saleId: number) =>
  ["sale-handovers", saleId] as const;

export interface SaleHandoverPanelProps {
  saleId: number;
  handoverStatus: HandoverProgress;
  pickupReceiver: PickupReceiver | null | undefined;
  isCancelled: boolean;
  /** Se invoca tras guardar el receptor para refrescar el detalle de la venta. */
  onReceiverSaved: () => void;
}

/** Entrega en sucursal: estado, receptor editable, entregas con comprobante y ticket. */
export function SaleHandoverPanel({
  saleId,
  handoverStatus,
  pickupReceiver,
  isCancelled,
  onReceiverSaved,
}: SaleHandoverPanelProps) {
  const { hasPermission } = usePermissions();
  const snackbar = useSnackbarStore();
  const queryClient = useQueryClient();
  const canRead = hasPermission(SALES_READ);
  const canEditReceiver =
    hasPermission(SALES_UPDATE) &&
    !isCancelled &&
    (handoverStatus === "PENDING" || handoverStatus === "PARTIALLY_DELIVERED");

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<PickupReceiverDraft>(HOLDER_RECEIVER_DRAFT);
  const [showErrors, setShowErrors] = useState(false);
  const [ticketBusy, setTicketBusy] = useState(false);

  const saveReceiver = useMutation({
    mutationFn: () => updatePickupReceiver(saleId, toPickupReceiverPayload(draft)),
    onSuccess: () => {
      snackbar.showSuccess("Quién recoge se actualizó");
      setEditing(false);
      onReceiverSaved();
      void queryClient.invalidateQueries({ queryKey: saleHandoversKey(saleId) });
    },
    onError: (err: Error) => snackbar.showError(err.message),
  });

  const startEditing = () => {
    setDraft(draftFromPickupReceiver(pickupReceiver));
    setShowErrors(false);
    setEditing(true);
  };

  const handleSave = () => {
    if (getPickupReceiverError(draft)) {
      setShowErrors(true);
      return;
    }
    saveReceiver.mutate();
  };

  const reprintTicket = async () => {
    setTicketBusy(true);
    try {
      await printSaleTicket(saleId);
    } catch {
      snackbar.showError("No se pudo imprimir el ticket de la venta");
    } finally {
      setTicketBusy(false);
    }
  };

  const receiverLabel =
    pickupReceiver?.type === "THIRD_PARTY"
      ? `Tercero: ${pickupReceiver.thirdPartyName} (${pickupReceiver.thirdPartyPhoneMasked})`
      : "Titular";

  return (
    <Stack spacing={1.5} sx={{ mb: 3 }}>
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
        <Typography variant="body2" color="text.secondary">
          Estado de la entrega
        </Typography>
        <StatusChip
          label={HANDOVER_STATUS_LABELS[handoverStatus]}
          variant={HANDOVER_STATUS_VARIANTS[handoverStatus]}
          size="small"
        />
        <Box sx={{ flexGrow: 1 }} />
        <Button
          size="small"
          variant="outlined"
          startIcon={<Printer size={14} aria-hidden />}
          disabled={ticketBusy}
          onClick={() => void reprintTicket()}
        >
          Reimprimir ticket
        </Button>
      </Stack>

      <Box>
        <Typography variant="caption" color="text.secondary" display="block">
          Quién recoge
        </Typography>
        {editing ? (
          <>
            <PickupReceiverFields
              value={draft}
              onChange={setDraft}
              savedPhoneMasked={
                pickupReceiver?.type === "THIRD_PARTY"
                  ? pickupReceiver.thirdPartyPhoneMasked
                  : null
              }
              showErrors={showErrors}
              disabled={saveReceiver.isPending}
            />
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="contained"
                onClick={handleSave}
                disabled={saveReceiver.isPending}
              >
                {saveReceiver.isPending ? "Guardando..." : "Guardar"}
              </Button>
              <Button
                size="small"
                onClick={() => setEditing(false)}
                disabled={saveReceiver.isPending}
              >
                Cancelar
              </Button>
            </Stack>
          </>
        ) : (
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" fontWeight={600}>
              {receiverLabel}
            </Typography>
            {canEditReceiver && (
              <Button
                size="small"
                variant="text"
                startIcon={<Pencil size={14} aria-hidden />}
                onClick={startEditing}
              >
                Cambiar
              </Button>
            )}
          </Stack>
        )}
      </Box>

      {canRead && (
        <Box>
          <Divider sx={{ mb: 1.5 }} />
          <HandoverReceiptsList saleId={saleId} />
        </Box>
      )}
    </Stack>
  );
}

interface HandoverRowProps {
  entry: HandoverHistoryEntry;
  busyKey: string | null;
  onDownload: () => void;
  onPrint: () => void;
}

function HandoverRow({ entry, busyKey, onDownload, onPrint }: HandoverRowProps) {
  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: 1.25 }}
    >
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={600}>
          {entry.deliveredUnits} {entry.deliveredUnits === 1 ? "pieza" : "piezas"} ·{" "}
          {formatDateTimeShort(entry.createdAt)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {entry.branch.name} · {VALIDATION_LABELS[entry.validationMethod]} · Entregó{" "}
          {entry.deliveredBy.name}
        </Typography>
      </Box>
      <Button
        size="small"
        variant="outlined"
        startIcon={<Download size={14} aria-hidden />}
        aria-label={`Descargar comprobante carta de la entrega del ${formatDateTimeShort(entry.createdAt)}`}
        disabled={busyKey === `letter-${entry.id}`}
        onClick={onDownload}
      >
        Carta
      </Button>
      <Button
        size="small"
        variant="outlined"
        startIcon={<Printer size={14} aria-hidden />}
        aria-label={`Imprimir comprobante térmico de la entrega del ${formatDateTimeShort(entry.createdAt)}`}
        disabled={busyKey === `thermal-${entry.id}`}
        onClick={onPrint}
      >
        Térmico
      </Button>
    </Stack>
  );
}

export interface HandoverReceiptsListProps {
  saleId: number;
}

/** Entregas de la venta con su comprobante (carta y térmico 80 mm). Requiere SALES_READ. */
export function HandoverReceiptsList({ saleId }: HandoverReceiptsListProps) {
  const { hasPermission } = usePermissions();
  const snackbar = useSnackbarStore();
  const canRead = hasPermission(SALES_READ);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const { data: handovers, isLoading } = useQuery({
    queryKey: saleHandoversKey(saleId),
    enabled: canRead,
    queryFn: async () => {
      const res = await getSaleHandovers(saleId);
      if (res.error) throw new Error(res.error.message);
      return res.data ?? [];
    },
  });

  const runAction = async (key: string, action: () => Promise<void>, failure: string) => {
    setBusyKey(key);
    try {
      await action();
    } catch {
      snackbar.showError(failure);
    } finally {
      setBusyKey(null);
    }
  };

  if (!canRead) return null;

  return (
    <>
      <Typography variant="subtitle2" fontWeight={700} mb={1}>
        Entregas realizadas
      </Typography>
      {isLoading ? (
        <Skeleton variant="rounded" height={56} />
      ) : !handovers || handovers.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Aún no se ha entregado nada de esta venta.
        </Typography>
      ) : (
        <Stack spacing={1}>
          {handovers.map((entry) => (
            <HandoverRow
              key={entry.id}
              entry={entry}
              busyKey={busyKey}
              onDownload={() =>
                void runAction(
                  `letter-${entry.id}`,
                  () => downloadHandoverReceipt(entry.id, "letter"),
                  "No se pudo descargar el comprobante",
                )
              }
              onPrint={() =>
                void runAction(
                  `thermal-${entry.id}`,
                  () => printHandoverReceipt(entry.id, "thermal80"),
                  "No se pudo imprimir el comprobante",
                )
              }
            />
          ))}
        </Stack>
      )}
    </>
  );
}
