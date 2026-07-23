import { useState } from "react";
import {
  Button,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import numeral from "numeral";
import type { ClientPaymentMethod } from "@/types/clientPayment.types";
import type { PaymentTerminalCatalogItem } from "@/types/payment-terminals.types";
import {
  CaptureCard,
  CaptureCardActions,
  CaptureAmountInput,
  CaptureCardChangeRow,
  PaymentMethodButton,
} from "@/styles/clientes/abonos.styles";
import { RadioButton } from "@/components";
import { CircleDollarSign, CreditCard } from "lucide-react";

export interface PaymentCapturePanelProps {
  paymentAmount: number;
  paymentMethod: ClientPaymentMethod;
  isCashDeposit: boolean;
  change: number;
  canRegister: boolean;
  isSubmitting: boolean;
  paymentTerminalId: number | null;
  paymentTerminals: PaymentTerminalCatalogItem[];
  paymentTerminalsLoading: boolean;
  onPaymentAmountChange: (value: number) => void;
  onPaymentMethodChange: (method: ClientPaymentMethod) => void;
  onCashDepositChange: (value: boolean) => void;
  onPaymentTerminalChange: (value: number | null) => void;
  onSubmit: () => void;
}

function formatCurrency(value: number): string {
  return numeral(value).format("$0,0.00");
}

export function PaymentCapturePanel({
  paymentAmount,
  paymentMethod,
  isCashDeposit,
  change,
  canRegister,
  isSubmitting,
  paymentTerminalId,
  paymentTerminals,
  paymentTerminalsLoading,
  onPaymentAmountChange,
  onPaymentMethodChange,
  onCashDepositChange,
  onPaymentTerminalChange,
  onSubmit,
}: PaymentCapturePanelProps) {
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (raw: string) => {
    const cleaned = raw.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    const sanitized = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join("")}` : cleaned;
    setInputValue(sanitized);
    const parsed = parseFloat(sanitized);
    onPaymentAmountChange(Number.isNaN(parsed) ? 0 : parsed);
  };

  const displayValue = inputValue.length > 0 ? inputValue : "";

  return (
    <CaptureCard>
      <Typography variant="body2" fontWeight={600} textAlign="center">
        Ingresa el cobro realizado al cliente:
      </Typography>

      <CaptureAmountInput
        value={displayValue}
        placeholder="0.00"
        startAdornment={
          <InputAdornment position="start">
            <Typography variant="h4" color="text.secondary">$</Typography>
          </InputAdornment>
        }
        onChange={(event) => handleInputChange(event.target.value)}
      />

      <Stack direction="row" spacing={1}>
        <RadioButton
          fullWidth
          value="cash"
          label="Efectivo"
          endIcon={<CircleDollarSign size={18} />}
          checked={paymentMethod === "cash"}
          onChange={() => onPaymentMethodChange("cash")}
        />

        <RadioButton
          fullWidth
          value="card"
          label="Tarjeta"
          endIcon={<CreditCard size={18} />}
          checked={paymentMethod === "card"}
          onChange={() => onPaymentMethodChange("card")}
        />
      </Stack>

      {paymentMethod === "card" && (
        <Select
          fullWidth
          size="small"
          displayEmpty
          value={paymentTerminalId ?? ""}
          onChange={(e) => onPaymentTerminalChange(Number(e.target.value) || null)}
          disabled={paymentTerminalsLoading}
        >
          <MenuItem value="" disabled>
            {paymentTerminalsLoading
              ? "Cargando terminales..."
              : "Selecciona una terminal"}
          </MenuItem>
          {paymentTerminals.map((terminal) => (
            <MenuItem key={terminal.id} value={terminal.id}>
              {terminal.name} ({terminal.bank})
            </MenuItem>
          ))}
          {!paymentTerminalsLoading && paymentTerminals.length === 0 && (
            <MenuItem value="" disabled>
              Esta sucursal no tiene terminales activas
            </MenuItem>
          )}
        </Select>
      )}

      <FormControlLabel
        control={
          <Checkbox
            checked={isCashDeposit}
            onChange={(event) => onCashDepositChange(event.target.checked)}
          />
        }
        label={
          <Typography variant="caption" color="text.secondary">
            Activa esta opción si el abono fue realizado como depósito en efectivo
          </Typography>
        }
      />

      <CaptureCardActions>
        {
          paymentMethod === "cash" && (
            <CaptureCardChangeRow>
              <Typography variant="body2" color="text.secondary">Cambio</Typography>
              <Typography variant="subtitle1">{formatCurrency(change)}</Typography>
            </CaptureCardChangeRow>
          )
        }

        <Button
          fullWidth
          variant="contained"
          disabled={!canRegister}
          onClick={onSubmit}>
          {isSubmitting ? "Registrando..." : "Registrar cobro"}
        </Button>
      </CaptureCardActions>
    </CaptureCard>
  );
}

const PaymentCapturePanelPage = () => null;

export default PaymentCapturePanelPage;
