import { Stack, Typography } from "@mui/material";
import numeral from "numeral";
import { theme } from "@/styles/theme";

export function SalesDashboardChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length || !label) return null;
  return (
    <Stack
      sx={{
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.app.border}`,
        borderRadius: 1,
        p: 1.5,
        boxShadow: 1,
        minWidth: 140,
      }}
    >
      <Typography variant="caption" fontWeight={600} display="block" sx={{ mb: 0.5 }}>
        {label}
      </Typography>
      {payload.map((entry) => (
        <Typography key={entry.name} variant="caption" display="block" sx={{ color: entry.color }}>
          {entry.name}: {numeral(entry.value).format("$0,0.00")}
        </Typography>
      ))}
    </Stack>
  );
}
