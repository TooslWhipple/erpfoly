import { Button, IconButton, Stack, TextField, Typography } from "@mui/material";
import { ArrowRight, PencilLine } from "lucide-react";
import { Breadcrumbs, StatusChip } from "@/components";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import type { StatusChipVariant } from "@/components/StatusChip";
import type { CosteoStatus } from "@/types/costeos.types";
import { formatDateOnly } from "@/utils/date";
import { theme } from "@/styles/theme";
import { ExchangeRateBox } from "@/styles/costeos/detail.styles";

const STATUS_LABELS: Record<CosteoStatus, string> = {
  captured: "Capturado",
  costed: "Costeado",
  reviewed: "Revisado",
  received: "Recibido",
  ordered: "Pedido",
  cancelled: "Cancelado",
};

const STATUS_VARIANTS: Record<CosteoStatus, StatusChipVariant> = {
  captured: "pending",
  costed: "warning",
  reviewed: "success",
  received: "success",
  ordered: "info",
  cancelled: "error",
};

const STATUS_COLORS: Record<
  CosteoStatus,
  { backgroundColor: string; color: string }
> = {
  captured: {
    backgroundColor: theme.palette.app.chip.variants.pending.background,
    color: theme.palette.app.chip.variants.pending.color,
  },
  costed: {
    backgroundColor: theme.palette.app.chip.variants.warning.background,
    color: theme.palette.app.chip.variants.warning.color,
  },
  reviewed: {
    backgroundColor: theme.palette.app.chip.variants.success.background,
    color: theme.palette.app.chip.variants.success.color,
  },
  received: {
    backgroundColor: theme.palette.app.chip.variants.success.background,
    color: theme.palette.app.chip.variants.success.color,
  },
  ordered: {
    backgroundColor: theme.palette.app.chip.variants.info.background,
    color: theme.palette.app.chip.variants.info.color,
  },
  cancelled: {
    backgroundColor:
      theme.palette.app.chip.variants.error?.background ??
      theme.palette.app.chip.variants.pending.background,
    color:
      theme.palette.app.chip.variants.error?.color ??
      theme.palette.app.chip.variants.pending.color,
  },
};

interface CosteoDetailHeaderProps {
  breadcrumbItems: BreadcrumbItem[];
  supplier: string;
  supplierDate: string;
  branchName: string;
  deliveryDate: string;
  receptionDate: string | null;
  status: CosteoStatus;
  exchangeRate: number;
  isEditingExchangeRate: boolean;
  exchangeRateDraft: string;
  saving?: boolean;
  onBack: () => void;
  onSave: () => void;
  onStartEditExchangeRate: () => void;
  onExchangeRateDraftChange: (value: string) => void;
  onConfirmExchangeRate: () => void;
  onCancelExchangeRate: () => void;
}

export function CosteoDetailHeader({
  breadcrumbItems,
  supplier,
  supplierDate,
  branchName,
  deliveryDate,
  receptionDate,
  status,
  exchangeRate,
  isEditingExchangeRate,
  exchangeRateDraft,
  saving = false,
  onBack,
  onSave,
  onStartEditExchangeRate,
  onExchangeRateDraftChange,
  onConfirmExchangeRate,
  onCancelExchangeRate,
}: CosteoDetailHeaderProps) {
  const statusColors = STATUS_COLORS[status];

  return (
    <Stack spacing={2.5}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        spacing={2}
      >
        <Breadcrumbs
          items={breadcrumbItems}
          showBackButton
          onBack={onBack}
        />
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <StatusChip
            label={STATUS_LABELS[status]}
            size="small"
            variant={STATUS_VARIANTS[status]}
            backgroundColor={statusColors.backgroundColor}
            color={statusColors.color}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={onSave}
            disabled={saving}
          >
            Guardar
          </Button>
        </Stack>
      </Stack>

      <Stack
        width="100%"
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", md: "flex-start" }}
        justifyContent={{ xs: "flex-start", md: "space-between" }}>

        <Stack spacing={2} flex={1} sx={{ maxWidth: "608px" }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={2}>
            <Stack spacing={0.5}>
              <Typography variant="body1" fontWeight={500}>{supplier}</Typography>
              <Typography variant="body2" color="text.secondary">{formatDateOnly(supplierDate, "dateLong")}</Typography>
            </Stack>
            <ArrowRight size={16} color={theme.palette.text.secondary} />
            <Stack spacing={0.5} alignItems={{ xs: "flex-start", md: "flex-end" }}>
              <Typography variant="body1" fontWeight={500}>{branchName}</Typography>
              {
                receptionDate &&
                <Typography variant="body2" color="text.secondary">{formatDateOnly(receptionDate, "dateLong")}</Typography>

              }
            </Stack>
          </Stack>
        </Stack>

        <ExchangeRateBox>
          {
            isEditingExchangeRate ?
              <Stack spacing={1} width="100%">
                <Typography variant="body2" color="text.secondary">Tipo de cambio</Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={exchangeRateDraft}
                  onChange={(event) =>
                    onExchangeRateDraftChange(event.target.value)
                  }
                  inputProps={{ inputMode: "decimal" }}
                />
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button
                    size="small"
                    onClick={onCancelExchangeRate}>
                    Cancelar
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={onConfirmExchangeRate}>
                    Aplicar
                  </Button>
                </Stack>
              </Stack>
              :
              <Stack width="100%" spacing={0.5}>
                <Typography variant="body2" color="text.secondary">Tipo de cambio</Typography>
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Typography variant="body1" fontWeight={600} textAlign="right">${exchangeRate.toFixed(2)}</Typography>
                  <IconButton
                    size="small"
                    aria-label="Editar tipo de cambio"
                    onClick={onStartEditExchangeRate}>
                    <PencilLine size={16} color={theme.palette.text.secondary} />
                  </IconButton>
                </Stack>
              </Stack>
          }
        </ExchangeRateBox>
      </Stack>
    </Stack>
  );
}
