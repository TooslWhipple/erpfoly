import { Button, CircularProgress, IconButton, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/router";
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
  messageId: number | null;
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
  {
    id: "email",
    label: "Destinatario",
    type: "text",
    format: (_value, row) => {
      const email = row.email?.trim();
      const phone = row.phone?.trim();
      if (email) return email;
      if (phone) return phone;
      return "—";
    },
  },
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
  messageId,
  messageName,
  isActive,
}: AutomatedCollectionActivityModalProps) {
  const router = useRouter();
  const theme = useTheme();
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

  const handleOpenMessage = () => {
    if (messageId == null) return;
    void router.push({
      pathname: "/catalogos/mensajes",
      query: { messageId: String(messageId) },
    });
  };

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
              <IconButton
                size="small"
                onClick={handleOpenMessage}
                disabled={messageId == null}
                aria-label="Abrir mensaje en catálogo"
                title="Ver mensaje"
              >
                <SquareArrowOutUpRight
                  size={18}
                  color={
                    messageId == null
                      ? theme.palette.text.disabled
                      : theme.palette.text.secondary
                  }
                />
              </IconButton>
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
