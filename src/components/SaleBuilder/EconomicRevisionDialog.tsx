"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  Stack,
  Typography,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { Check, TrendingDown, TrendingUp } from "lucide-react";
import {
  CloseButton,
  DialogContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
} from "@/components/ConfirmModal/styles";
import { ConfirmButton, FormActions } from "@/components/Form/styles";
import {
  summarizeEconomicRevisionLines,
  type EconomicRevisionPreview,
} from "@/utils/economicRevision";
import { roundToCents } from "@/utils/number";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(value);
}

type EconomicRevisionDialogProps = {
  open: boolean;
  preview: EconomicRevisionPreview | null;
  paymentType: "CREDIT" | "CASH" | "LAYAWAY";
  keepsSpecialDiscount: boolean;
  productNameById: (productId: number) => string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function EconomicRevisionDialog({
  open,
  preview,
  paymentType,
  keepsSpecialDiscount,
  productNameById,
  loading = false,
  onClose,
  onConfirm,
}: EconomicRevisionDialogProps) {
  const [snapshot, setSnapshot] = useState<EconomicRevisionPreview | null>(
    preview,
  );

  useEffect(() => {
    if (open && preview) setSnapshot(preview);
  }, [open, preview]);

  const data = preview ?? snapshot;
  if (!data) return null;

  const quoted = data.quotedTotalAmount;
  const current = data.currentTotalAmount;
  const delta = roundToCents(current - quoted);
  const wentDown = delta < -0.009;
  const wentUp = delta > 0.009;
  const lineSummaries = summarizeEconomicRevisionLines(data.diffs).slice(0, 5);

  const handleClose = (_event: object, reason: string) => {
    if (loading) return;
    if (reason === "backdropClick" || reason === "escapeKeyDown") onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: "90vh",
        },
      }}
    >
      <DialogContent>
        <ModalHeader>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <ModalTitle>El total del ticket cambió</ModalTitle>
            <ModalDescription>
              Hay precios o promociones vigentes distintos a los de este ticket.
            </ModalDescription>
          </Box>
          <CloseButton
            onClick={onClose}
            disabled={loading}
            size="small"
            aria-label="Cerrar"
          >
            <CloseIcon fontSize="small" />
          </CloseButton>
        </ModalHeader>

        <Box
          sx={(theme) => ({
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
            p: 2,
            mb: 2,
            borderRadius: 2,
            border: `1px solid ${theme.palette.app.border}`,
            backgroundColor: theme.palette.background.paper,
          })}
        >
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
              display="block"
            >
              Ticket
            </Typography>
            <Typography
              variant="h6"
              fontWeight={700}
              color="text.secondary"
              sx={{ textDecoration: "line-through", opacity: 0.8 }}
            >
              {formatCurrency(quoted)}
            </Typography>
          </Box>
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
              display="block"
            >
              Ahora
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
              <Typography variant="h6" fontWeight={700}>
                {formatCurrency(current)}
              </Typography>
              {(wentDown || wentUp) && (
                <Chip
                  size="small"
                  icon={
                    wentDown ? (
                      <TrendingDown size={14} />
                    ) : (
                      <TrendingUp size={14} />
                    )
                  }
                  label={`${wentDown ? "Baja" : "Sube"} ${formatCurrency(Math.abs(delta))}`}
                  color={wentDown ? "success" : "warning"}
                  sx={{ fontWeight: 600, "& .MuiChip-icon": { ml: 0.75 } }}
                />
              )}
            </Stack>
          </Box>
        </Box>

        {paymentType === "CREDIT" && (
          <Box
            sx={(theme) => ({
              px: 2,
              py: 1.5,
              mb: 2,
              borderRadius: 2,
              border: `1px solid ${theme.palette.app.border}`,
              bgcolor: theme.palette.app.background.lowerGray,
            })}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
              display="block"
            >
              Enganche mínimo a cobrar
            </Typography>
            <Typography variant="h6" fontWeight={700} lineHeight={1.3}>
              {formatCurrency(data.currentMinimumDownPayment)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              10% del total actual
            </Typography>
          </Box>
        )}

        {keepsSpecialDiscount && (
          <Stack direction="row" alignItems="center" spacing={1} mb={2}>
            <Box
              sx={(theme) => ({
                width: 22,
                height: 22,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                bgcolor: theme.palette.success.main,
                color: theme.palette.success.contrastText,
                flexShrink: 0,
              })}
            >
              <Check size={14} strokeWidth={3} />
            </Box>
            <Typography variant="body2" color="text.secondary">
              El descuento especial aprobado se mantiene.
            </Typography>
          </Stack>
        )}

        {lineSummaries.length > 0 && (
          <Box sx={{ mb: 1 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
              display="block"
              mb={0.75}
            >
              Qué cambió
            </Typography>
            <Stack spacing={0.75}>
              {lineSummaries.map((line) => (
                <Stack
                  key={line.saleItemId}
                  direction="row"
                  justifyContent="space-between"
                  alignItems="baseline"
                  gap={1}
                >
                  <Typography variant="body2" noWrap sx={{ minWidth: 0, flex: 1 }}>
                    {productNameById(line.productId)}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    fontWeight={600}
                    sx={{ flexShrink: 0 }}
                  >
                    {line.priceChanged
                      ? `${formatCurrency(line.quotedListPrice)} → ${formatCurrency(line.currentListPrice)}`
                      : "Promoción actualizada"}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
        )}

        <Typography variant="caption" color="text.secondary" display="block">
          Actualizar solo refresca el resumen. El cobro lo confirmas tú.
        </Typography>

        <FormActions>
          <Button
            type="button"
            variant="outlined"
            color="primary"
            onClick={onClose}
            disabled={loading}
            sx={{ minWidth: 120, minHeight: 44 }}
          >
            Dejar el ticket
          </Button>
          <ConfirmButton
            type="button"
            variant="contained"
            onClick={() => void onConfirm()}
            disabled={loading}
            sx={{ minHeight: 44 }}
          >
            {loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Actualizar totales"
            )}
          </ConfirmButton>
        </FormActions>
      </DialogContent>
    </Dialog>
  );
}