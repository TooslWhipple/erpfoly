import numeral from "numeral";
import { SideModal } from "@/components/SideModal";
import {
  CostHistoryTimeline,
  TimelineLine,
  TimelineItem,
  TimelineDot,
} from "@/styles/catalogos/productos.styles";
import type { CostHistoryEntry } from "@/types/productos.types";
import { formatDate } from "@/utils/date";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { theme } from "@/styles/theme";

interface CostHistoryModalProps {
  open: boolean;
  onClose: () => void;
  history: CostHistoryEntry[];
  loading?: boolean;
  errorMessage?: string | null;
  emptyMessage?: string;
}

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function formatHistoryDate(date: string): string {
  const trimmed = date.trim();
  if (!trimmed) {
    return "";
  }
  if (DATE_ONLY_PATTERN.test(trimmed)) {
    return formatDate(trimmed, "D [de] MMMM");
  }
  return formatDate(trimmed, "dateMonthTime12h");
}

function formatHistoryContext(entry: CostHistoryEntry): string | null {
  const parts: string[] = [];
  if (entry.notes?.trim()) {
    parts.push(entry.notes.trim());
  }
  if (entry.orderId?.trim()) {
    parts.push(`Pedido: ${entry.orderId.trim()}`);
  }
  if (entry.branchName?.trim()) {
    parts.push(entry.branchName.trim());
  }
  return parts.length > 0 ? parts.join(" · ") : null;
}

export function CostHistoryModal({
  open,
  onClose,
  history,
  loading = false,
  errorMessage = null,
  emptyMessage = "Este artículo aún no cuenta con histórico de costos.",
}: CostHistoryModalProps) {
  return (
    <SideModal
      open={open}
      onClose={onClose}
      maxWidth="md"
      title="Historial de costos de este artículo"
      description="Cambios de costo de lista guardados en el sistema y precios registrados desde pedidos."
    >
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress size={32} />
        </Box>
      ) : errorMessage ? (
        <CostHistoryTimeline>
          <Typography variant="body2" color="error" textAlign="center">
            {errorMessage}
          </Typography>
        </CostHistoryTimeline>
      ) : history.length > 0 ? (
        <CostHistoryTimeline>
          <TimelineLine />
          {history.map((entry) => {
            const context = formatHistoryContext(entry);
            return (
              <TimelineItem key={entry.id}>
                <TimelineDot />
                <Stack sx={{ pl: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    {formatHistoryDate(entry.date)}
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Typography variant="body1">
                      {numeral(entry.price).format("$0,0.00")}
                    </Typography>
                    {entry.changePercentage !== 0 ? (
                      <>
                        {entry.changeType === "increase" ? (
                          <ArrowUp
                            size={12}
                            strokeWidth={2}
                            color={theme.palette.text.secondary}
                          />
                        ) : (
                          <ArrowDown
                            size={12}
                            strokeWidth={2}
                            color={theme.palette.text.secondary}
                          />
                        )}
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontWeight={500}
                        >
                          {numeral(entry.changePercentage).format("0.00")}%
                        </Typography>
                      </>
                    ) : null}
                  </Stack>
                  {context ? (
                    <Typography variant="caption" color="text.secondary">
                      {context}
                    </Typography>
                  ) : null}
                </Stack>
              </TimelineItem>
            );
          })}
        </CostHistoryTimeline>
      ) : (
        <CostHistoryTimeline>
          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            fontWeight={500}
          >
            {emptyMessage}
          </Typography>
        </CostHistoryTimeline>
      )}
    </SideModal>
  );
}
