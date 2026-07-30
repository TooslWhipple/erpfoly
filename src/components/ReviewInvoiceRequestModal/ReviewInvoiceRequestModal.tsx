import { useEffect, useState } from "react";
import {
  Button,
  CircularProgress,
  Grid,
  IconButton,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import { Check, ExternalLink, Wallet, X } from "lucide-react";
import numeral from "numeral";
import { SideModal } from "@/components/SideModal";
import { FormTextField } from "@/components/Form";
import { formatDate } from "@/utils/date";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { usePermissions } from "@/hooks/usePermissions";
import { INVOICE_REQUESTS_UPDATE } from "@/lib/permissions";
import {
  approveInvoiceRequest,
  getInvoiceRequestDetail,
  rejectInvoiceRequest,
} from "@/services/invoice-requests.service";
import type { InvoiceRequestDetail } from "@/types/invoice-requests.types";
import {
  AmountSummaryCard,
  AmountSummaryRow,
} from "@/components/CreateInvoiceRequestModal/styles";

export interface ReviewInvoiceRequestModalProps {
  open: boolean;
  requestId: number | null;
  onClose: () => void;
  onSuccess?: () => void;
}

function formatDisplayDate(value: string | null | undefined): string {
  if (!value) return "—";
  return formatDate(value, "dateLong");
}

function formatCurrency(value: number | null | undefined): string {
  if (value == null) return "—";
  return numeral(value).format("$0,0.00");
}

export function ReviewInvoiceRequestModal({
  open,
  requestId,
  onClose,
  onSuccess,
}: ReviewInvoiceRequestModalProps) {
  const showError = useSnackbarStore((state) => state.showError);
  const showSuccess = useSnackbarStore((state) => state.showSuccess);
  const { hasPermission } = usePermissions();
  const canResolve = hasPermission(INVOICE_REQUESTS_UPDATE);

  const [detail, setDetail] = useState<InvoiceRequestDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState<"approve" | "reject" | null>(
    null,
  );

  useEffect(() => {
    if (!open || requestId == null) {
      setDetail(null);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      const result = await getInvoiceRequestDetail(requestId);
      if (cancelled) return;

      if (result.error || !result.data) {
        showError(result.error?.message ?? "No se pudo cargar la solicitud");
        setDetail(null);
        setLoading(false);
        return;
      }

      setDetail(result.data);
      setLoading(false);
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [open, requestId, showError]);

  const isPending = detail?.status === "pending";
  const showActions = Boolean(detail && isPending && canResolve);

  const handleApprove = async () => {
    if (requestId == null) return;
    setSubmitting("approve");
    const result = await approveInvoiceRequest(requestId);
    setSubmitting(null);

    if (result.error || !result.data) {
      showError(result.error?.message ?? "No se pudo aprobar la solicitud");
      return;
    }

    showSuccess("Solicitud de factura aprobada");
    onSuccess?.();
    onClose();
  };

  const handleReject = async () => {
    if (requestId == null) return;
    setSubmitting("reject");
    const result = await rejectInvoiceRequest(requestId);
    setSubmitting(null);

    if (result.error || !result.data) {
      showError(result.error?.message ?? "No se pudo rechazar la solicitud");
      return;
    }

    showSuccess("Solicitud de factura rechazada");
    onSuccess?.();
    onClose();
  };

  const supplierLabel =
    detail?.supplierName?.trim() ||
    detail?.paymentDetails?.trim() ||
    "—";

  const orderLabel = detail?.orderFolio?.trim() || "—";
  const orderHref =
    detail?.orderId != null ? `/pedidos/${detail.orderId}` : undefined;

  return (
    <SideModal
      open={open}
      onClose={onClose}
      title="Valida los datos de la solicitud de factura"
      maxWidth="sm"
      disableClose={Boolean(submitting)}
    >
      {loading || !detail ? (
        <Stack alignItems="center" justifyContent="center" minHeight={240}>
          <CircularProgress size={28} />
        </Stack>
      ) : (
        <Stack spacing={2.5}>
          <FormTextField
            label="Proveedor"
            value={supplierLabel}
            readOnly
          />

          <FormTextField
            label="Pedido"
            value={orderLabel}
            readOnly
            InputProps={{
              endAdornment: orderHref ? (
                <IconButton
                  component={Link}
                  href={orderHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  edge="end"
                  aria-label="Abrir pedido"
                  color="primary"
                >
                  <ExternalLink size={16} />
                </IconButton>
              ) : undefined,
            }}
          />

          <FormTextField
            label="Concepto"
            value={detail.concept || "—"}
            readOnly
          />

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormTextField
                label="Número de factura"
                value={detail.invoiceNumber || "—"}
                readOnly
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormTextField
                label="Tipo"
                value={detail.paymentType || "—"}
                readOnly
              />
            </Grid>
          </Grid>

          <AmountSummaryCard>
            <Stack direction="row" spacing={1} alignItems="center">
              <Wallet size={16} />
              <Typography variant="subtitle2" fontWeight={700}>
                MONTO DE LA FACTURA
              </Typography>
            </Stack>
            <AmountSummaryRow>
              <Typography variant="body2" color="text.secondary">
                Subtotal (sin IVA)*
              </Typography>
              <Typography variant="body2">
                {formatCurrency(detail.subtotal)}
              </Typography>
            </AmountSummaryRow>
            <AmountSummaryRow>
              <Typography variant="body2" color="text.secondary">
                IVA
              </Typography>
              <Typography variant="body2">
                {formatCurrency(detail.vat)}
              </Typography>
            </AmountSummaryRow>
            <AmountSummaryRow>
              <Typography variant="subtitle1" fontWeight={700}>
                Total
              </Typography>
              <Typography variant="subtitle1" fontWeight={700}>
                {formatCurrency(detail.total)}
              </Typography>
            </AmountSummaryRow>
          </AmountSummaryCard>

          <FormTextField
            label="Fecha de emisión"
            value={formatDisplayDate(detail.issuedAt)}
            readOnly
          />

          <FormTextField
            label="Fecha de límite de pago"
            value={formatDisplayDate(detail.paymentDueAt)}
            readOnly
          />

          {showActions ? (
            <Stack direction="row" spacing={2} sx={{ pt: 1 }}>
              <Button
                variant="outlined"
                color="error"
                fullWidth
                startIcon={
                  submitting === "reject" ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <X size={18} />
                  )
                }
                onClick={() => void handleReject()}
                disabled={Boolean(submitting)}
                sx={{ py: 1.5 }}
              >
                Rechazar
              </Button>
              <Button
                variant="outlined"
                color="primary"
                fullWidth
                startIcon={
                  submitting === "approve" ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <Check size={18} />
                  )
                }
                onClick={() => void handleApprove()}
                disabled={Boolean(submitting)}
                sx={{ py: 1.5 }}
              >
                Aprobar
              </Button>
            </Stack>
          ) : null}
        </Stack>
      )}
    </SideModal>
  );
}
