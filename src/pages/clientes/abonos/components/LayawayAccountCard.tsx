import { useEffect, useRef, useState } from "react";
import { Button, Grid, InputAdornment, Stack, TextField, Typography } from "@mui/material";
import numeral from "numeral";
import type { OpenClientLayaway } from "@/services/ventas.service";
import { StatementProgressBar } from "@/components/SupplierPayables/StatementProgressBar";
import { InnerCard } from "@/styles/clientes/abonos.styles";
import { formatDate } from "@/utils/date";

export interface LayawayAccountCardProps {
  layaway: OpenClientLayaway;
  /** Monto a abonar ya topado en `totalDue`. */
  amount: number;
  disabled?: boolean;
  onAmountChange: (layawayId: number, amount: number) => void;
}

function formatCurrency(value: number): string {
  return numeral(value).format("$0,0.00");
}

function formatAmountForInput(amount: number): string {
  return amount > 0 ? String(Math.round(amount * 100) / 100) : "";
}

export function LayawayAccountCard({
  layaway,
  amount,
  disabled = false,
  onAmountChange,
}: LayawayAccountCardProps) {
  const [inputValue, setInputValue] = useState(formatAmountForInput(amount));
  const lastEmittedRef = useRef(amount);
  const [now] = useState(() => Date.now());

  // El monto puede cambiar desde fuera (se topa en lo adeudado o se limpia al
  // recargar): se refleja sin pisar lo que el cajero esté tecleando.
  useEffect(() => {
    if (amount === lastEmittedRef.current) return;
    lastEmittedRef.current = amount;
    setInputValue(formatAmountForInput(amount));
  }, [amount]);

  const emit = (value: number) => {
    lastEmittedRef.current = value;
    onAmountChange(layaway.layawayId, value);
  };

  const handleInputChange = (raw: string) => {
    const cleaned = raw.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    const sanitized = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join("")}` : cleaned;
    const parsed = parseFloat(sanitized);
    const typed = Number.isNaN(parsed) ? 0 : parsed;
    const capped = Math.min(typed, layaway.totalDue);
    setInputValue(typed > layaway.totalDue ? formatAmountForInput(capped) : sanitized);
    emit(capped);
  };

  const handlePayAll = () => {
    setInputValue(formatAmountForInput(layaway.totalDue));
    emit(layaway.totalDue);
  };

  const isOverdue = layaway.status === "EXPIRED" || new Date(layaway.expiresAt).getTime() < now;

  return (
    <InnerCard>
      <Stack spacing={0.5}>
        <Typography variant="body1" fontWeight={600}>
          {layaway.productName ?? `Apartado ${layaway.folio}`}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Apartado · Comprado el {formatDate(layaway.purchaseDate, "D [de] MMMM, YYYY")} · Folio {layaway.folio}
        </Typography>
      </Stack>

      <Grid container spacing={2}>
        <Grid size="auto">
          <Stack spacing={0.5}>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>Costo inicial</Typography>
            <Typography variant="body1">{formatCurrency(layaway.totalAmount)}</Typography>
          </Stack>
        </Grid>
        <Grid size="auto">
          <Stack spacing={0.5}>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>Total abonos</Typography>
            <Typography variant="body1">{formatCurrency(layaway.principalPaid)}</Typography>
          </Stack>
        </Grid>
        <Grid size="auto">
          <Stack spacing={0.5}>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>Resta</Typography>
            <Typography variant="body1">
              {formatCurrency(layaway.totalDue)}
              {layaway.lateFeeOutstanding > 0
                ? ` (+ ${formatCurrency(layaway.lateFeeOutstanding)} mora)`
                : ""}
            </Typography>
          </Stack>
        </Grid>
        <Grid size="auto">
          <Stack spacing={0.5}>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>Fecha lím. pago</Typography>
            <Typography variant="body1" color={isOverdue ? "error.main" : "text.primary"}>
              {formatDate(layaway.expiresAt, "D [de] MMM, YYYY")}
            </Typography>
          </Stack>
        </Grid>
      </Grid>

      <StatementProgressBar
        paidAmount={layaway.principalPaid}
        totalAmount={layaway.totalAmount}
        paidPercent={layaway.paidPercent}
      />

      <Stack direction="row" spacing={1} alignItems="center">
        <TextField
          size="small"
          label="A pagar"
          value={inputValue}
          placeholder="0.00"
          disabled={disabled}
          onChange={(event) => handleInputChange(event.target.value)}
          slotProps={{
            htmlInput: { inputMode: "decimal", "aria-label": "A pagar" },
            input: { startAdornment: <InputAdornment position="start">$</InputAdornment> },
          }}
        />
        <Button size="small" variant="text" disabled={disabled} onClick={handlePayAll}>
          Pagar el total ({formatCurrency(layaway.totalDue)})
        </Button>
      </Stack>
    </InnerCard>
  );
}

const LayawayAccountCardPage = () => null;

export default LayawayAccountCardPage;
