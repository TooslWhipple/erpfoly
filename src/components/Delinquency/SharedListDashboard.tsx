import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Stack, Typography } from "@mui/material";
import { DateRangeFilter, StatsCardGroup } from "@/components";
import type { StatsCardData } from "@/components/StatsCard";
import {
  PRESET_MES,
  PRESET_MES_ANTERIOR,
  PRESET_PERIODO,
  computePresetRange,
  formatRangeForApi,
} from "@/components/DateRangePopover";
import type { DateRangeSelectOption } from "@/components/DateRangePopover";
import { getSharedListDashboard } from "@/services/delinquency-shared-list.service";
import { unwrapOrThrow } from "@/lib/axios";
import { formatDate } from "@/utils/date";

const MEXICO_CITY_TZ = "America/Mexico_City";
const NOTE_DATE_FORMAT = "D [de] MMMM, YYYY";

const DASHBOARD_DATE_OPTIONS: DateRangeSelectOption[] = [
  { value: PRESET_MES, label: "Mes actual" },
  { value: PRESET_MES_ANTERIOR, label: "Mes anterior" },
  { value: PRESET_PERIODO, label: "Rango de fechas" },
];

function currentMonthRange(): { startDate: string; endDate: string } {
  const r = computePresetRange(PRESET_MES, MEXICO_CITY_TZ);
  return formatRangeForApi(r.startDate, r.endDate);
}

function toMexicoDay(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: MEXICO_CITY_TZ });
}

export interface SharedListDashboardProps {
  listId: number;
  closedAt: string | null;
}

export function SharedListDashboard({ listId, closedAt }: SharedListDashboardProps) {
  const [range, setRange] = useState(currentMonthRange);
  const from = range.startDate;
  const to = range.endDate;

  const dashboardQuery = useQuery({
    queryKey: ["clients", "delinquency", "shared-list", listId, "dashboard", from, to],
    queryFn: async () => {
      const result = await getSharedListDashboard(listId, { from, to });
      return unwrapOrThrow(result);
    },
  });

  const data = dashboardQuery.data;

  const cards: StatsCardData[] = useMemo(
    () =>
      data
        ? [
            { id: "clients", label: "Clientes en cartera", value: data.clientCount },
            {
              id: "assigned",
              label: "Monto total asignado",
              value: data.assignedAmount,
              isCurrency: true,
            },
            {
              id: "recovered",
              label: "Monto recuperado (periodo)",
              value: data.recoveredAmount,
              isCurrency: true,
            },
            {
              id: "negotiations",
              label: "Negociaciones activas",
              value: data.activeNegotiations,
            },
          ]
        : [],
    [data],
  );

  const notes: string[] = [];
  if (data) {
    const assignedDay = toMexicoDay(data.assignmentStartedAt);
    if (from < assignedDay) {
      notes.push(`Recuperado desde ${formatDate(assignedDay, NOTE_DATE_FORMAT)}`);
    }
    if (closedAt) {
      const closedDay = toMexicoDay(closedAt);
      if (to > closedDay) {
        notes.push(`Recuperado hasta ${formatDate(closedDay, NOTE_DATE_FORMAT)}`);
      }
    }
  }

  const handleRangeChange = (next: { startDate: string; endDate: string }) => {
    if (!next.startDate || !next.endDate) {
      setRange(currentMonthRange());
      return;
    }
    setRange(next);
  };

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" justifyContent="flex-end">
        <DateRangeFilter
          dateFrom={from}
          dateTo={to}
          onChange={handleRangeChange}
          options={DASHBOARD_DATE_OPTIONS}
          timeZone={MEXICO_CITY_TZ}
          label="Mes actual"
        />
      </Stack>
      {dashboardQuery.isError ? (
        <Typography color="error">
          {dashboardQuery.error instanceof Error
            ? dashboardQuery.error.message
            : "No se pudo cargar el resumen de la cartera"}
        </Typography>
      ) : (
        <StatsCardGroup cards={cards} columns={4} loading={dashboardQuery.isLoading} />
      )}
      {notes.map((note) => (
        <Typography key={note} variant="caption" color="text.secondary">
          {note}
        </Typography>
      ))}
    </Stack>
  );
}
