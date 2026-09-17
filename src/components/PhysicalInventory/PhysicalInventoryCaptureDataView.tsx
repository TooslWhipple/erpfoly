"use client";

import type { ReactNode } from "react";
import { Stack, Typography } from "@mui/material";
import { Scan } from "lucide-react";
import { Card } from "@/components/PhysicalInventory/Card";
import {
  PHYSICAL_INVENTORY_CAPTURE_METHOD_LABELS,
  type PhysicalInventoryCaptureMethod,
} from "@/types/physical-inventory.types";
import { formatDate } from "@/utils/date";
import { theme } from "@/styles/theme";

export interface PhysicalInventoryCaptureDataViewProps {
  responsibleUser: string;
  capturedAt: string;
  branchName: string;
  captureMethod: PhysicalInventoryCaptureMethod;
}

function DataField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Stack minWidth="176px">
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body1">{value}</Typography>
    </Stack>
  );
}

export function PhysicalInventoryCaptureDataView({
  responsibleUser,
  capturedAt,
  branchName,
  captureMethod,
}: PhysicalInventoryCaptureDataViewProps) {
  return (
    <Card>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Datos sobre la captura de inventario</Typography>
      <DataField
        label="Usuario"
        value={responsibleUser || "—"} />
      <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
        <DataField
          label="Fecha de captura"
          value={formatDate(capturedAt, "dateLong")}
        />
        <DataField
          label="Hora de captura"
          value={formatDate(capturedAt, "time12h")}
        />
        <DataField
          label="Sucursal"
          value={branchName || "—"} />
      </Stack>
      <DataField
        label="Método de captura"
        value={
          <Stack direction="row" spacing={1} alignItems="center">
            <Scan size={16} color={theme.palette.primary.main} />
            <span>
              {PHYSICAL_INVENTORY_CAPTURE_METHOD_LABELS[captureMethod]}
            </span>
          </Stack>
        }
      />
    </Card>
  );
}
