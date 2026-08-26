import { Box, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import numeral from "numeral";
import dayjs from "@/lib/dayjs";
import { CreditLimitBar } from "@/components";
import type { SharedDelinquencyClientDetail } from "@/types/delinquency-shared-list.types";
import { formatDate } from "@/utils/date";

function relativeDueLabel(dueDate: string): string | null {
  const due = dayjs(dueDate).startOf("day");
  const today = dayjs().startOf("day");
  const diff = today.diff(due, "day");
  if (diff === 0) return "Hoy";
  if (diff === 1) return "Ayer";
  if (diff > 1) return `Hace ${diff} días`;
  if (diff === -1) return "Mañana";
  return null;
}

export function formatClientSinceLabel(clientSince: string | null): string {
  if (!clientSince) {
    return "Cliente";
  }
  return `Cliente desde ${formatDate(clientSince, "D [de] MMMM [del] YYYY")}`;
}

export interface SharedDelinquencyClientHeaderProps {
  client: SharedDelinquencyClientDetail;
}

export function SharedDelinquencyClientHeader({
  client,
}: SharedDelinquencyClientHeaderProps) {
  const theme = useTheme();
  const requiredPayment =
    client.isNegotiated && client.negotiatedDebtAmount != null
      ? client.negotiatedDebtAmount
      : client.totalDebtAmount;
  const relative = relativeDueLabel(client.dueDate);
  const creditAuthorized = client.creditLineAuthorized ?? 0;
  const creditUsed = client.creditUsed ?? 0;
  const creditAvailable = client.creditAvailable ?? 0;
  const hasCredit = creditAuthorized > 0;

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", sm: "flex-start" }}
      width="100%">
      <Stack spacing={0.5} flex={1} minWidth={0}>
        {
          client.createdAt &&
          <Typography variant="body2" color="text.secondary" fontWeight={400}>
            Clientes desde {formatDate(client.createdAt, "D [de] MMMM [del] YYYY")}
          </Typography>
        }
        {
          client.curp &&
          <Typography variant="body2" color="text.secondary" fontWeight={600}>{client.curp}</Typography>
        }
        <Typography variant="h4" fontWeight={700}>{client.fullName}</Typography>
        {
          hasCredit &&
          <Typography variant="body2" color="text.secondary">
            Línea de crédito:{" "}
            <Box component="span" sx={{ color: "primary.main", fontWeight: 600 }}>
              {numeral(creditAuthorized).format("0,0.00")}
            </Box>
          </Typography>
        }
        <Typography variant="body2" color="text.secondary">
          Pago requerido{" "}
          <Box component="span" sx={{ color: "text.primary", fontWeight: 700 }}>
            {numeral(requiredPayment).format("$0,0.00")}
          </Box>{" "}
          <Box component="span" sx={{ color: "error.main", fontWeight: 500 }}>
            {formatDate(client.dueDate, "D [de] MMMM, YYYY")}
            {relative ? ` (${relative})` : ""}
          </Box>
        </Typography>
      </Stack>

      {hasCredit && (
        <CreditLimitBar
          creditLimit={creditAuthorized}
          creditUsed={creditUsed}
          creditAvailable={creditAvailable}
          showAvailableLock
          mutedAvailable
          barColor={theme.palette.grey[600]}
        />
      )}
    </Stack>
  );
}
