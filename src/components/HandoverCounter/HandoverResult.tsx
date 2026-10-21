import { useState } from "react";
import { Alert, Button, Chip, Stack, Typography } from "@mui/material";
import { CheckCircle2, Download, Printer, RefreshCw } from "lucide-react";
import {
  downloadHandoverReceipt,
  printHandoverReceipt,
  resendHandoverReceipt,
} from "@/services/sale-handover.service";
import type {
  HandoverNotificationStatus,
  HandoverResendChannel,
  HandoverResult as HandoverResultData,
} from "@/types/saleHandover.types";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { SectionCard } from "./styles";

const STATUS_LABEL: Record<HandoverNotificationStatus, string> = {
  SENT: "Enviado",
  FAILED: "No se pudo enviar",
  SKIPPED: "No aplica",
};

const STATUS_COLOR: Record<
  HandoverNotificationStatus,
  "success" | "error" | "default"
> = { SENT: "success", FAILED: "error", SKIPPED: "default" };

export interface HandoverResultProps {
  result: HandoverResultData;
  onNext: () => void;
  onContinueSale?: () => void;
}

export function HandoverResult({
  result,
  onNext,
  onContinueSale,
}: HandoverResultProps) {
  const showError = useSnackbarStore((state) => state.showError);
  const showSuccess = useSnackbarStore((state) => state.showSuccess);
  const [statuses, setStatuses] = useState({
    whatsapp: result.whatsappStatus,
    email: result.emailStatus,
  });
  const [busy, setBusy] = useState<
    "print" | "download" | "resend" | null
  >(null);

  const run = async (
    kind: "print" | "download",
    action: () => Promise<void>,
    failure: string,
  ) => {
    setBusy(kind);
    try {
      await action();
    } catch {
      showError(failure);
    } finally {
      setBusy(null);
    }
  };

  const handleResend = async () => {
    const channels: HandoverResendChannel[] = [];
    if (statuses.whatsapp === "FAILED") channels.push("WHATSAPP");
    if (statuses.email === "FAILED") channels.push("EMAIL");
    if (channels.length === 0) channels.push("WHATSAPP", "EMAIL");
    setBusy("resend");
    const response = await resendHandoverReceipt(result.id, channels);
    setBusy(null);
    if (response.error || !response.data) return; // el toast global ya informó
    setStatuses({
      whatsapp: response.data.whatsappStatus,
      email: response.data.emailStatus,
    });
    showSuccess("Reenvío procesado.");
  };

  const hasPending = result.pending.length > 0;

  return (
    <Stack spacing={2}>
      <Alert
        severity="success"
        icon={<CheckCircle2 size={22} aria-hidden />}
      >
        Entrega registrada · {result.folio}
        {hasPending ? " (parcial)" : ""}
      </Alert>

      <SectionCard>
        <Stack spacing={1}>
          <Typography variant="subtitle1" fontWeight={700}>
            Entregado hoy
          </Typography>
          {result.deliveredToday.map((item) => (
            <Typography key={item.saleItemId} variant="body2">
              {item.quantity} × {item.name}
            </Typography>
          ))}
          {hasPending ? (
            <>
              <Typography variant="subtitle1" fontWeight={700} sx={{ pt: 1 }}>
                Pendiente de entregar
              </Typography>
              {result.pending.map((item) => (
                <Typography key={item.saleItemId} variant="body2">
                  {item.quantity} × {item.name}
                </Typography>
              ))}
            </>
          ) : null}
        </Stack>
      </SectionCard>

      <SectionCard>
        <Stack spacing={1.5}>
          <Typography variant="subtitle1" fontWeight={700}>
            Comprobante
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              size="small"
              color={STATUS_COLOR[statuses.whatsapp]}
              label={`WhatsApp: ${STATUS_LABEL[statuses.whatsapp]}`}
            />
            <Chip
              size="small"
              color={STATUS_COLOR[statuses.email]}
              label={`Correo: ${STATUS_LABEL[statuses.email]}`}
            />
          </Stack>
          {!result.receiptReady ? (
            <Alert severity="info">
              El comprobante se está generando. Inténtalo en unos segundos.
            </Alert>
          ) : null}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Button
              variant="contained"
              startIcon={<Printer size={18} aria-hidden />}
              disabled={busy !== null}
              onClick={() =>
                void run(
                  "print",
                  () => printHandoverReceipt(result.id, "thermal80"),
                  "No se pudo imprimir el ticket.",
                )
              }
            >
              Imprimir ticket
            </Button>
            <Button
              variant="outlined"
              startIcon={<Download size={18} aria-hidden />}
              disabled={busy !== null}
              onClick={() =>
                void run(
                  "download",
                  () => downloadHandoverReceipt(result.id, "letter"),
                  "No se pudo descargar el PDF.",
                )
              }
            >
              Descargar PDF
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshCw size={18} aria-hidden />}
              disabled={busy !== null}
              onClick={() => void handleResend()}
            >
              Reenviar
            </Button>
          </Stack>
        </Stack>
      </SectionCard>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
        <Button variant="contained" size="large" onClick={onNext}>
          Siguiente entrega
        </Button>
        {hasPending && onContinueSale ? (
          <Button variant="text" onClick={onContinueSale}>
            Seguir con esta venta
          </Button>
        ) : null}
      </Stack>
    </Stack>
  );
}
