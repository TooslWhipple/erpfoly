import { Button, CircularProgress, Stack, Typography } from "@mui/material";
import { SquareArrowOutUpRight } from "lucide-react";
import { SideModal } from "@/components/SideModal";
import { DataTable } from "@/components/TableCrud";
import { StatusChip } from "@/components/StatusChip";
import type { DataTableColumn } from "@/components/TableCrud";
import { useAutomatedCollectionMessageHistory } from "@/hooks/useAutomatedCollectionMessageHistory";
import type { AutomatedCollectionMessageLogItem } from "@/services/automated-collection.service";
import {
  formatAutomatedCollectionActivityDate,
  getMessageDeliveryStatusLabel,
  getMessageDeliveryStatusVariant,
} from "@/utils/automatedCollection";
import {
  ActivityModalHeader,
  ActivityModalTitleRow,
  ActivitySectionTitle,
  ActivityTableWrapper,
  ActivityStateMessage,
} from "./styles";

export interface AutomatedCollectionActivityModalProps {
  open: boolean;
  onClose: () => void;
  ruleId: number | null;
  messageName: string;
  isActive: boolean;
}

const ACTIVITY_COLUMNS: DataTableColumn<AutomatedCollectionMessageLogItem>[] = [
  {
    id: "sentAt",
    label: "Fecha",
    type: "text",
    format: (value) =>
      formatAutomatedCollectionActivityDate(String(value ?? "")),
  },
  { id: "phone", label: "Teléfono", type: "text" },
  { id: "clientName", label: "Cliente", type: "text" },
  {
    id: "status",
    label: "Estatus",
    type: "text",
    format: (value) => {
      const status = value as AutomatedCollectionMessageLogItem["status"];
      return (
        <StatusChip
          label={getMessageDeliveryStatusLabel(status)}
          variant={getMessageDeliveryStatusVariant(status)}
          size="small"
        />
      );
    },
  },
];

export function AutomatedCollectionActivityModal({
  open,
  onClose,
  ruleId,
  messageName,
  isActive,
}: AutomatedCollectionActivityModalProps) {
  const {
    data: history,
    isLoading,
    isError,
    refetch,
  } = useAutomatedCollectionMessageHistory(ruleId, open);

  const messagesSentLastMonth = history?.messagesSentLastMonth ?? 0;
  const formattedCount = messagesSentLastMonth.toLocaleString("es-MX");
  const rows = history?.items ?? [];
  const showEmpty = !isLoading && !isError && rows.length === 0;

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

      {isLoading && (
        <ActivityStateMessage>
          <CircularProgress size={32} />
          <Typography variant="body2" color="text.secondary">
            Cargando actividad...
          </Typography>
        </ActivityStateMessage>
      )}

      {isError && !isLoading && (
        <ActivityStateMessage>
          <Typography variant="body2" color="error">
            No se pudo cargar la actividad. Intenta de nuevo.
          </Typography>
          <Button variant="outlined" size="small" onClick={() => void refetch()}>
            Reintentar
          </Button>
        </ActivityStateMessage>
      )}

      {showEmpty && (
        <ActivityStateMessage>
          <Typography variant="body2" color="text.secondary">
            Sin actividad registrada
          </Typography>
        </ActivityStateMessage>
      )}

      {!isLoading && !isError && rows.length > 0 && (
        <ActivityTableWrapper>
          <DataTable
            columns={ACTIVITY_COLUMNS}
            rows={rows}
            rowKey="id"
            emptyMessage="Sin actividad registrada"
          />
        </ActivityTableWrapper>
      )}
    </SideModal>
  );
}
