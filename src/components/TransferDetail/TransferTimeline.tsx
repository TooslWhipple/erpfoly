import { Stack, Typography } from "@mui/material";
import type { TransferTimelineEntry } from "@/types/transfers.types";
import { formatDate } from "@/utils/date";
import { getTimelineActionLabel } from "@/utils/transfers";

export interface TransferTimelineProps {
  entries: TransferTimelineEntry[];
}

export function TransferTimeline({ entries }: TransferTimelineProps) {
  if (entries.length === 0) return null;

  return (
    <Stack spacing={2}>
      <Typography variant="h6">Línea de tiempo</Typography>
      <Stack spacing={1.5}>
        {entries.map((entry) => (
          <Stack key={`${entry.action}-${entry.at}`} spacing={0.25}>
            <Typography variant="subtitle2">{getTimelineActionLabel(entry.action)}</Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDate(entry.at, "datetimeShort12h")}
              {entry.user ? ` · ${entry.user}` : ""}
            </Typography>
            {entry.notes && <Typography variant="body2">{entry.notes}</Typography>}
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}
