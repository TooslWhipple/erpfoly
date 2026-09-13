import { Stack, Typography } from "@mui/material";
import { Banknote, Clock, FileText, RefreshCw, Wrench } from "lucide-react";
import numeral from "numeral";
import type { InvoiceActivity } from "@/types/atencion-cliente.types";
import { formatDate } from "@/utils/date";
import {
  ActivityIcon,
  ActivityItem,
  ActivityTimeline,
  SearchEmptyState,
} from "@/styles/atencion-cliente.styles";

function formatCurrency(value: number): string {
  return numeral(value).format("$0,0.00");
}

function activityTone(
  type: InvoiceActivity["type"],
): "payment" | "status" | "note" {
  if (type === "payment") return "payment";
  if (type === "status_change") return "status";
  return "note";
}

function activityIcon(type: InvoiceActivity["type"]) {
  if (type === "payment") return <Banknote size={16} />;
  if (type === "status_change") return <RefreshCw size={16} />;
  if (type === "note") return <Wrench size={16} />;
  return <FileText size={16} />;
}

export interface InvoiceActivityTabProps {
  activities: InvoiceActivity[];
}

export function InvoiceActivityTab({ activities }: InvoiceActivityTabProps) {
  if (activities.length === 0) {
    return (
      <SearchEmptyState>
        <Clock size={28} />
        <Typography fontWeight={600} color="text.primary">
          Todavía no hay movimientos
        </Typography>
        <Typography variant="body2">
          Los pagos, cambios de estatus y órdenes de servicio aparecerán aquí
          con fecha y monto.
        </Typography>
      </SearchEmptyState>
    );
  }

  return (
    <ActivityTimeline>
      {activities.map((activity) => (
        <ActivityItem key={activity.id}>
          <ActivityIcon tone={activityTone(activity.type)}>
            {activityIcon(activity.type)}
          </ActivityIcon>
          <Stack spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
            <Typography fontWeight={600}>{activity.title}</Typography>
            {activity.description ? (
              <Typography variant="body2" color="text.secondary">
                {activity.description}
              </Typography>
            ) : null}
            <Typography variant="caption" color="text.secondary">
              {formatDate(activity.date, "datetimeShort12h")}
            </Typography>
          </Stack>
          {activity.amount != null ? (
            <Typography
              fontWeight={700}
              color={activity.type === "payment" ? "success.dark" : "text.primary"}
              sx={{ flexShrink: 0 }}
            >
              {activity.type === "payment" ? "+" : ""}
              {formatCurrency(activity.amount)}
            </Typography>
          ) : null}
        </ActivityItem>
      ))}
    </ActivityTimeline>
  );
}

const InvoiceActivityTabPage = () => null;

export default InvoiceActivityTabPage;
