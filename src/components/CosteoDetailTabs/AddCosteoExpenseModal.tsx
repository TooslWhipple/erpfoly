import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import numeral from "numeral";
import { SideModal } from "@/components/SideModal";
import { FormSelect, FormTextField } from "@/components/Form";
import type { SelectOption } from "@/components/Form";
import { sanitizeDecimal } from "@/forms/validation/schemas";
import type {
  AddCosteoExpensePayload,
  CosteoCurrency,
} from "@/types/costeos.types";
import { ExpenseModalFooter } from "@/styles/costeos/detail.styles";

const VAT_RATE = 0.16;
const MAX_AMOUNT = 999_999.99;
const MAX_EXCHANGE_RATE = 9_999.99;
const MIN_EXCHANGE_RATE = 0.01;

const EXPENSE_OPTIONS: SelectOption[] = [
  { value: "Flete Nacional", label: "Flete Nacional" },
  { value: "Maniobras", label: "Maniobras" },
  { value: "Flete extranjero", label: "Flete extranjero" },
  { value: "Seguro", label: "Seguro" },
];

interface AddCosteoExpenseModalProps {
  open: boolean;
  onClose: () => void;
  defaultExchangeRate: number;
  saving?: boolean;
  onSubmit: (payload: AddCosteoExpensePayload) => Promise<boolean>;
}

function parseAmount(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Solo dígitos y un punto decimal (máx. 2 decimales), acotado a `max`. */
function sanitizeBoundedDecimal(value: string, max: number): string {
  const cleaned = sanitizeDecimal(value);
  if (cleaned === "" || cleaned === ".") return cleaned;

  const parsed = Number.parseFloat(cleaned);
  if (!Number.isFinite(parsed)) return "";
  if (parsed > max) {
    return numeral(max).format("0.00");
  }
  return cleaned;
}

function getAmountError(value: string): string | undefined {
  if (value.trim() === "") return "Ingresa un monto";
  const amount = parseAmount(value);
  if (amount <= 0) return "El monto debe ser mayor a 0";
  if (amount > MAX_AMOUNT) {
    return `El monto no puede ser mayor a ${numeral(MAX_AMOUNT).format("$0,0.00")}`;
  }
  return undefined;
}

function getExchangeRateError(
  value: string,
  required: boolean,
): string | undefined {
  if (!required) return undefined;
  if (value.trim() === "") return "Ingresa el tipo de cambio";
  const rate = parseAmount(value);
  if (rate < MIN_EXCHANGE_RATE) {
    return `El tipo de cambio mínimo es ${MIN_EXCHANGE_RATE}`;
  }
  if (rate > MAX_EXCHANGE_RATE) {
    return `El tipo de cambio no puede ser mayor a ${numeral(MAX_EXCHANGE_RATE).format("0,0.00")}`;
  }
  return undefined;
}

export function AddCosteoExpenseModal({
  open,
  onClose,
  defaultExchangeRate,
  saving = false,
  onSubmit,
}: AddCosteoExpenseModalProps) {
  const [name, setName] = useState("Maniobras");
  const [isForeignCurrency, setIsForeignCurrency] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(String(defaultExchangeRate));
  const [amount, setAmount] = useState("");
  const [includedInInvoice, setIncludedInInvoice] = useState(false);
  const [touched, setTouched] = useState({ amount: false, exchangeRate: false });

  useEffect(() => {
    if (!open) return;
    setName("Maniobras");
    setIsForeignCurrency(false);
    setExchangeRate(
      sanitizeBoundedDecimal(String(defaultExchangeRate), MAX_EXCHANGE_RATE),
    );
    setAmount("");
    setIncludedInInvoice(false);
    setTouched({ amount: false, exchangeRate: false });
  }, [open, defaultExchangeRate]);

  const amountNumber = parseAmount(amount);
  const amountError = touched.amount ? getAmountError(amount) : undefined;
  const exchangeRateError = touched.exchangeRate
    ? getExchangeRateError(exchangeRate, isForeignCurrency)
    : undefined;

  const isAmountValid = amountNumber > 0 && amountNumber <= MAX_AMOUNT;
  const exchangeRateNumber = parseAmount(exchangeRate);
  const isExchangeRateValid =
    !isForeignCurrency ||
    (exchangeRateNumber >= MIN_EXCHANGE_RATE &&
      exchangeRateNumber <= MAX_EXCHANGE_RATE);
  const canSubmit = Boolean(name) && isAmountValid && isExchangeRateValid && !saving;

  const totals = useMemo(() => {
    const rate = isForeignCurrency
      ? exchangeRateNumber || defaultExchangeRate
      : 1;
    const subtotal = amountNumber * rate;
    const vat = subtotal * VAT_RATE;
    return { subtotal, vat, total: subtotal + vat };
  }, [
    amountNumber,
    exchangeRateNumber,
    isForeignCurrency,
    defaultExchangeRate,
  ]);

  const handleAmountChange = (raw: string) => {
    setAmount(sanitizeBoundedDecimal(raw, MAX_AMOUNT));
  };

  const handleExchangeRateChange = (raw: string) => {
    setExchangeRate(sanitizeBoundedDecimal(raw, MAX_EXCHANGE_RATE));
  };

  const handleSubmit = async () => {
    setTouched({ amount: true, exchangeRate: true });
    if (!canSubmit) return;

    const currency: CosteoCurrency = isForeignCurrency ? "USD" : "MXN";
    const rate = isForeignCurrency
      ? exchangeRateNumber || defaultExchangeRate
      : 1;

    await onSubmit({
      name,
      currency,
      exchangeRate: rate,
      amount: amountNumber,
      includedInInvoice,
    });
  };

  return (
    <SideModal
      open={open}
      onClose={onClose}
      title="Agregar gasto"
      maxWidth="sm"
      headerActions={
        <Button
          variant="contained"
          onClick={() => void handleSubmit()}
          disabled={!canSubmit}
        >
          Agregar
        </Button>
      }
    >
      <Stack spacing={3}>
        <FormSelect
          label="Gasto"
          value={name}
          options={EXPENSE_OPTIONS}
          onChange={(event) => setName(String(event.target.value))}
        />

        <Stack direction="row" alignItems="center" spacing={1}>
          <Switch
            checked={isForeignCurrency}
            onChange={(_, checked) => setIsForeignCurrency(checked)}
          />
          <Typography variant="body1">¿Moneda extranjera?</Typography>
        </Stack>

        {isForeignCurrency && (
          <FormTextField
            label="Tipo de cambio"
            value={exchangeRate}
            onChange={(event) => handleExchangeRateChange(event.target.value)}
            onBlur={() =>
              setTouched((prev) => ({ ...prev, exchangeRate: true }))
            }
            error={Boolean(exchangeRateError)}
            helperText={
              exchangeRateError && 'Solo se permiten números'
            }
            inputProps={{
              inputMode: "decimal",
            }}
          />
        )}

        <FormTextField
          label="Monto"
          value={amount}
          onChange={(event) => handleAmountChange(event.target.value)}
          onBlur={() => setTouched((prev) => ({ ...prev, amount: true }))}
          placeholder="0.00"
          error={Boolean(amountError)}
          helperText={amountError && 'Solo se permiten números'}
          inputProps={{
            inputMode: "decimal",
          }}
        />

        <Stack direction="row" alignItems="center" spacing={1}>
          <Switch
            checked={includedInInvoice}
            onChange={(_, checked) => setIncludedInInvoice(checked)}
          />
          <Typography variant="body1">Incluida en factura</Typography>
        </Stack>

        <ExpenseModalFooter>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">Subtotal (MXN)</Typography>
            <Typography variant="body2">{numeral(totals.subtotal).format("$0,0.00")}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">IVA (MXN)</Typography>
            <Typography variant="body2">{numeral(totals.vat).format("$0,0.00")}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" fontWeight={700}>Total: (MXN)</Typography>
            <Typography variant="body2" fontWeight={700}>{numeral(totals.total).format("$0,0.00")}</Typography>
          </Stack>
        </ExpenseModalFooter>
      </Stack>
    </SideModal>
  );
}
