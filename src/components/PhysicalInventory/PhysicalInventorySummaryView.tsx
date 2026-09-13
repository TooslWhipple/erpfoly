"use client";

import type { ReactNode } from "react";
import { Grid, Stack, Typography } from "@mui/material";
import { ScanSearch, Tags, TriangleAlert } from "lucide-react";
import { Card } from "@/components/PhysicalInventory/Card";
import type {
  PhysicalInventoryItem,
  PhysicalInventorySummary,
} from "@/types/physical-inventory.types";
import { theme } from "@/styles/theme";

function SummaryStatCard({
  label,
  value,
  icon,
  alert = false,
}: {
  label: string;
  value: number;
  icon: ReactNode;
  alert?: boolean;
}) {
  return (
    <Card sx={{ height: "100%", gap: "0px" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Typography variant="body1" fontWeight={600}>{label}</Typography>
        {icon}
      </Stack>
      <Typography variant="h3" fontWeight={700}>{value}</Typography>
    </Card>
  );
}

function ItemSection({
  title,
  items,
  emptyLabel,
}: {
  title: string;
  items: PhysicalInventoryItem[];
  emptyLabel: string;
}) {
  return (
    <Card>
      <Typography variant="subtitle1" fontWeight={700}>{title}</Typography>

      {
        (items.length === 0) ?
          <Typography variant="body2" color="text.secondary">{emptyLabel}</Typography>
          :
          items.map((item) => (
            <Stack
              key={`${title}-${item.productId}`}
              direction="row"
              alignItems="center"
              spacing={2}
              sx={{
                p: "12px",
                borderBottom: `1px solid ${theme.palette.app.border}`,
                "&:last-child": { borderBottom: "none" },
              }}>
              <Stack
                alignItems="center"
                justifyContent="center"
                style={{
                  minWidth: "24px",
                  height: "24px",
                  borderRadius: "4px",
                  backgroundColor: theme.palette.background.lowerGray,
                }}>
                <Typography variant="body2" fontWeight={700}>{item.countedQuantity}</Typography>
              </Stack>
              <Stack sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body1" fontWeight={600} noWrap>{item.name}</Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={500} noWrap>{item.code}</Typography>
              </Stack>
              {
                item.categoryPath &&
                <Typography variant="body2" color="text.secondary" fontWeight={500} noWrap>{item.categoryPath}</Typography>
              }
            </Stack>
          ))
      }
    </Card>
  );
}

export interface PhysicalInventorySummaryViewProps {
  summary: PhysicalInventorySummary;
}

export function PhysicalInventorySummaryView({ summary }: PhysicalInventorySummaryViewProps) {
  return (
    <Stack spacing={2}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SummaryStatCard
            label="Total de productos"
            value={summary.totalProducts}
            icon={<ScanSearch size={24} color={theme.palette.text.secondary} />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SummaryStatCard
            label="Total de artículos"
            value={summary.totalItems}
            icon={<Tags size={24} color={theme.palette.text.secondary} />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SummaryStatCard
            label="Faltantes"
            value={summary.missingUnits}
            alert
            icon={<TriangleAlert size={24} color={theme.palette.text.secondary} />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SummaryStatCard
            label="Sobrante"
            value={summary.surplusUnits}
            alert
            icon={<TriangleAlert size={24} color={theme.palette.text.secondary} />}
          />
        </Grid>
      </Grid>

      <ItemSection
        title="Faltantes"
        items={summary.missingItems}
        emptyLabel="No hay faltantes en este inventario."
      />
      <ItemSection
        title="Sobrantes"
        items={summary.surplusItems}
        emptyLabel="No hay sobrantes en este inventario."
      />
      <ItemSection
        title="Artículos escaneados"
        items={summary.scannedItems}
        emptyLabel="No se escanearon artículos."
      />
    </Stack>
  );
}
