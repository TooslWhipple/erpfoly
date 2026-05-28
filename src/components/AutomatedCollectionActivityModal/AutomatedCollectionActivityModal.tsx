import { Stack, Typography } from "@mui/material";
import { SquareArrowOutUpRight } from "lucide-react";
import { SideModal } from "@/components/SideModal";
import { DataTable } from "@/components/TableCrud";
import { StatusChip } from "@/components/StatusChip";
import type { DataTableColumn } from "@/components/TableCrud";
import {
  MOCK_AUTOMATED_COLLECTION_ACTIVITY,
  MOCK_MESSAGES_SENT_LAST_MONTH,
  type AutomatedCollectionActivityRow,
} from "./mockData";
import {
  ActivityModalHeader,
  ActivityModalTitleRow,
  ActivitySectionTitle,
  ActivityTableWrapper,
  ActivityStatusBadge,
} from "./styles";

export interface AutomatedCollectionActivityModalProps {
  open: boolean;
  onClose: () => void;
  messageName: string;
  isActive: boolean;
}

const ACTIVITY_COLUMNS: DataTableColumn<AutomatedCollectionActivityRow>[] = [
  { id: "date", label: "Fecha", type: "text" },
  { id: "phone", label: "Teléfono", type: "text" },
  { id: "clientName", label: "Cliente", type: "text" },
  {
    id: "status",
    label: "Status",
    type: "text",
    format: () => <ActivityStatusBadge>Exitoso</ActivityStatusBadge>,
  },
];

export function AutomatedCollectionActivityModal({
  open,
  onClose,
  messageName,
  isActive,
}: AutomatedCollectionActivityModalProps) {
  const formattedCount = MOCK_MESSAGES_SENT_LAST_MONTH.toLocaleString("es-MX");

  return (
    <SideModal
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      header={
        <Stack
          direction="row"
          width="100%"
          spacing={2}
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <ActivityModalHeader>
            <ActivityModalTitleRow>
              <Typography variant="h6">{messageName}</Typography>
              <SquareArrowOutUpRight size={18} />
            </ActivityModalTitleRow>
            <Typography variant="body2" color="text.secondary">
              {formattedCount} mensajes enviados en el último mes
            </Typography>
          </ActivityModalHeader>
          <StatusChip
            label={isActive ? "Activo" : "Inactivo"}
            variant={isActive ? "success" : "default"}
            size="small"
          />
        </Stack>
      }
    >
      <ActivitySectionTitle>
        Historial de actividad de ésta automatización
      </ActivitySectionTitle>
      <ActivityTableWrapper>
        <DataTable
          columns={ACTIVITY_COLUMNS}
          rows={MOCK_AUTOMATED_COLLECTION_ACTIVITY}
          rowKey="id"
          emptyMessage="Sin actividad registrada"
        />
      </ActivityTableWrapper>
    </SideModal>
  );
}
