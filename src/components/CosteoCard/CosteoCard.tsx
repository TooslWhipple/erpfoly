import { useState } from "react";
import {
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import { ArrowRight, MoreVertical } from "lucide-react";
import { formatDateOnly } from "@/utils/date";
import { StatusChip } from "@/components/StatusChip";
import type { StatusChipVariant } from "@/components/StatusChip";
import type { CosteoListItem, CosteoStatus } from "@/types/costeos.types";
import { theme } from "@/styles/theme";
import {
  Card,
  EmptyContainer,
  ProgressBarContainer,
  ProgressBarFill,
} from "@/styles/costeos/list.styles";

export type CosteoCardData = CosteoListItem;

interface CosteoCardProps {
  costeo: CosteoCardData;
  onClick?: (costeo: CosteoCardData) => void;
  onViewDetail?: (costeo: CosteoCardData) => void;
}

const STATUS_LABELS: Record<CosteoStatus, string> = {
  captured: "Capturado",
  costed: "Costeado",
  reviewed: "Revisado",
  received: "Recibido",
  ordered: "Pedido",
  cancelled: "Cancelado",
};

const STATUS_COLORS: Record<
  CosteoStatus,
  { backgroundColor: string; color: string; progress: string }
> = {
  captured: {
    backgroundColor: theme.palette.app.chip.variants.pending.background,
    color: theme.palette.app.chip.variants.pending.color,
    progress: theme.palette.app.chip.variants.pending.color,
  },
  costed: {
    backgroundColor: theme.palette.app.chip.variants.warning.background,
    color: theme.palette.app.chip.variants.warning.color,
    progress: theme.palette.app.chip.variants.warning.color,
  },
  reviewed: {
    backgroundColor: theme.palette.app.chip.variants.success.background,
    color: theme.palette.app.chip.variants.success.color,
    progress: theme.palette.app.chip.variants.success.color,
  },
  received: {
    backgroundColor: theme.palette.app.chip.variants.success.background,
    color: theme.palette.app.chip.variants.success.color,
    progress: theme.palette.app.chip.variants.success.color,
  },
  ordered: {
    backgroundColor: theme.palette.app.chip.variants.info.background,
    color: theme.palette.app.chip.variants.info.color,
    progress: theme.palette.app.chip.variants.info.color,
  },
  cancelled: {
    backgroundColor: theme.palette.app.chip.variants.error?.background ?? theme.palette.app.chip.variants.pending.background,
    color: theme.palette.app.chip.variants.error?.color ?? theme.palette.app.chip.variants.pending.color,
    progress: theme.palette.app.chip.variants.error?.color ?? theme.palette.app.chip.variants.pending.color,
  },
};

function getStatusVariant(status: CosteoStatus): StatusChipVariant {
  const variants: Record<CosteoStatus, StatusChipVariant> = {
    captured: "pending",
    costed: "warning",
    reviewed: "success",
    received: "success",
    ordered: "info",
    cancelled: "error",
  };
  return variants[status];
}

export function CosteoCard({ costeo, onClick, onViewDetail }: CosteoCardProps) {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const statusColors = STATUS_COLORS[costeo.status];

  const handleCardClick = () => {
    onClick?.(costeo);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = (event?: React.MouseEvent) => {
    event?.stopPropagation();
    setMenuAnchor(null);
  };

  const handleViewDetail = (event: React.MouseEvent) => {
    event.stopPropagation();
    setMenuAnchor(null);
    onViewDetail?.(costeo);
  };

  return (
    <Card onClick={handleCardClick}>
      <Grid container spacing={2}>
        <Grid size={12}>
          <ProgressBarContainer>
            <ProgressBarFill
              fillColor={statusColors.progress}
              progress={costeo.progress}
            />
          </ProgressBarContainer>
        </Grid>
        <Grid size={12}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            alignItems={{ xs: "flex-start", md: "center" }}
            justifyContent="space-between"
            spacing={{ xs: 2, md: 0 }}
          >
            <Stack
              direction="row"
              alignItems="center"
              width="100%"
              spacing={2}
              flex={5}
            >
              <Stack spacing={0.5} width="100%" flex={3}>
                <Typography variant="body1" fontWeight={500}>{costeo.supplier}</Typography>
                <Typography variant="body2" color="text.secondary">{formatDateOnly(costeo.supplierDate, "dateLong")}</Typography>
              </Stack>
              <ArrowRight size={18} color={theme.palette.text.secondary} />
              <Stack spacing={0.5} width="100%" flex={3}>
                <Typography variant="body1" fontWeight={500}>{costeo.destination}</Typography>
                <Typography variant="body2" color="text.secondary">Entrega: {formatDateOnly(costeo.deliveryDate, "dateLong")}</Typography>
              </Stack>
            </Stack>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent={{ xs: "flex-start", md: "flex-end" }}
              spacing={2}
              flex={2}>
              <Typography variant="body2">SKU: <span style={{ color: theme.palette.text.primary, fontWeight: 500 }}>{costeo.sku}</span></Typography>
              <StatusChip
                label={STATUS_LABELS[costeo.status]}
                size="small"
                variant={getStatusVariant(costeo.status)}
                backgroundColor={statusColors.backgroundColor}
                color={statusColors.color}
              />
              <IconButton
                size="small"
                aria-label="Opciones de costeo"
                onClick={handleMenuOpen}>
                <MoreVertical size={18} />
              </IconButton>
              <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() => handleMenuClose()}
                onClick={(event) => event.stopPropagation()}>
                <MenuItem onClick={handleViewDetail}>Ver detalle</MenuItem>
              </Menu>
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </Card>
  );
}

interface CosteoListProps {
  costeos: CosteoCardData[];
  onCosteoClick?: (costeo: CosteoCardData) => void;
  onViewDetail?: (costeo: CosteoCardData) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export function CosteoList({
  costeos,
  onCosteoClick,
  onViewDetail,
  loading,
  emptyMessage = "No hay costeos",
}: CosteoListProps) {
  if (loading) {
    return (
      <Stack direction="column" spacing={2}>
        {[1, 2, 3].map((i) => (
          <Card key={i} style={{ opacity: 0.5, cursor: "default" }}>
            <ProgressBarContainer>
              <ProgressBarFill
                fillColor={theme.palette.app.border}
                progress={60}
              />
            </ProgressBarContainer>
            <Stack
              direction={{ xs: "column", md: "row" }}
              alignItems={{ xs: "flex-start", md: "center" }}
              justifyContent="space-between"
              spacing={{ xs: 2, md: 0 }}
              mt={2}
            >
              <div style={{ height: 40, width: "100%" }} />
            </Stack>
          </Card>
        ))}
      </Stack>
    );
  }

  if (costeos.length === 0) {
    return (
      <EmptyContainer>
        <Typography variant="body2">{emptyMessage}</Typography>
      </EmptyContainer>
    );
  }

  return (
    <Stack direction="column" spacing={2}>
      {
        costeos.map((costeo) => (
          <CosteoCard
            key={costeo.id}
            costeo={costeo}
            onClick={onCosteoClick}
            onViewDetail={onViewDetail}
          />
        ))
      }
    </Stack>
  );
}
