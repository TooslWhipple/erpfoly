import { useEffect, useRef, useState } from "react";
import {
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import numeral from "numeral";
import type { ClientPaymentMethod } from "@/types/clientPayment.types";
import type { PartialRemainderDecision } from "@/hooks/clientes/useClientPayment";
import type { PaymentTerminalCatalogItem } from "@/types/payment-terminals.types";
import {
  CaptureCard,
  CaptureCardActions,
  CaptureAmountInput,
  CaptureCardChangeRow,
  PaymentMethodButton,
} from "@/styles/clientes/abonos.styles";
import { RadioButton } from "@/components";
import { CircleDollarSign, CreditCard, Minus, Plus } from "lucide-react";

export interface PaymentCapturePanelProps {
  paymentAmount: number;
  paymentMethod: ClientPaymentMethod;
  isCashDeposit: boolean;
  change: number;
  hasPartialInstallmentRemainder: boolean;
  partialRemainderDecision: PartialRemainderDecision | null;
  canRegister: boolean;
  isSubmitting: boolean;
  paymentTerminalId: number | null;
  paymentTerminals: PaymentTerminalCatalogItem[];
  paymentTerminalsLoading: boolean;
  totalPendingInstallmentsCount: number;
  onPaymentAmountChange: (value: number) => void;
  onPaymentMethodChange: (method: ClientPaymentMethod) => void;
  onCashDepositChange: (value: boolean) => void;
  onPaymentTerminalChange: (value: number | null) => void;
  onInstallmentCountChange: (count: number) => void;
  onPartialRemainderDecisionChange: (choice: PartialRemainderDecision) => void;
  onSubmit: () => void;
}

function formatCurrency(value: number): string {
  return numeral(value).format("$0,0.00");
}

function formatAmountForInput(amount: number): string {
  return amount > 0 ? String(Math.round(amount * 100) / 100) : "";
}

export function PaymentCapturePanel({
  paymentAmount,
  paymentMethod,
  isCashDeposit,
  change,
  hasPartialInstallmentRemainder,
  partialRemainderDecision,
  canRegister,
  isSubmitting,
  paymentTerminalId,
  paymentTerminals,
  paymentTerminalsLoading,
  totalPendingInstallmentsCount,
  onPaymentAmountChange,
  onPaymentMethodChange,
  onCashDepositChange,
  onPaymentTerminalChange,
  onInstallmentCountChange,
  onPartialRemainderDecisionChange,
  onSubmit,
}: PaymentCapturePanelProps) {
  const [inputValue, setInputValue] = useState("");
  const [installmentCount, setInstallmentCount] = useState(1);
  const lastEmittedAmountRef = useRef(paymentAmount);

  // El campo de monto es texto libre (`inputValue`) y solo se actualiza al
  // teclear; cuando el monto cambia por una fuente externa (el stepper de
  // parcialidades) hay que reflejarlo aquí sin pisar lo que el cajero esté
  // escribiendo a mano.
  useEffect(() => {
    if (paymentAmount === lastEmittedAmountRef.current) return;
    lastEmittedAmountRef.current = paymentAmount;
    setInputValue(formatAmountForInput(paymentAmount));
  }, [paymentAmount]);

  // Se deriva en render en vez de sincronizar con un efecto: si el máximo
  // baja (p. ej. el cajero excluye una cuenta a media captura), el stepper
  // se ve acotado de inmediato sin depender de un setState en un efecto.
  const displayedInstallmentCount = Math.min(
    installmentCount,
    Math.max(totalPendingInstallmentsCount, 1),
  );

  const handleInputChange = (raw: string) => {
    const cleaned = raw.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    const sanitized = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join("")}` : cleaned;
    setInputValue(sanitized);
    const parsed = parseFloat(sanitized);
    const amount = Number.isNaN(parsed) ? 0 : parsed;
    lastEmittedAmountRef.current = amount;
    onPaymentAmountChange(amount);
  };

  const applyInstallmentCount = (count: number) => {
    setInstallmentCount(count);
    onInstallmentCountChange(count);
  };

  const handleDecrementInstallments = () => {
    applyInstallmentCount(Math.max(1, displayedInstallmentCount - 1));
  };

  const handleIncrementInstallments = () => {
    applyInstallmentCount(Math.min(totalPendingInstallmentsCount, displayedInstallmentCount + 1));
  };

  const handleSelectAllInstallments = () => {
    applyInstallmentCount(totalPendingInstallmentsCount);
  };

  const displayValue = inputValue.length > 0 ? inputValue : "";

  return (
    <CaptureCard>
      <Typography variant="body2" fontWeight={600} textAlign="center">
        Ingresa el cobro realizado al cliente:
      </Typography>

      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
        <Typography variant="body2" color="text.secondary">
          Parcialidades a cubrir
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton
            size="small"
            onClick={handleDecrementInstallments}
            disabled={displayedInstallmentCount <= 1 || totalPendingInstallmentsCount === 0}
          >
            <Minus size={16} />
          </IconButton>
          <Typography variant="body1" fontWeight={600} minWidth={20} textAlign="center">
            {displayedInstallmentCount}
          </Typography>
          <IconButton
            size="small"
            onClick={handleIncrementInstallments}
            disabled={displayedInstallmentCount >= totalPendingInstallmentsCount}
          >
            <Plus size={16} />
          </IconButton>
        </Stack>
      </Stack>

      <Button
        size="small"
        variant="text"
        onClick={handleSelectAllInstallments}
        disabled={totalPendingInstallmentsCount === 0}
      >
        Seleccionar todas ({totalPendingInstallmentsCount})
      </Button>

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

      {hasPartialInstallmentRemainder && (
        <Stack spacing={0.5}>
          <Typography variant="caption" color="text.secondary">
            El monto no cubre la siguiente parcialidad completa. ¿Qué hacer con el sobrante?
          </Typography>
          <Stack direction="row" spacing={1}>
            <RadioButton
              fullWidth
              value="apply-next"
              label="Aplicar al siguiente abono"
              checked={partialRemainderDecision === "apply-next"}
              onChange={() => onPartialRemainderDecisionChange("apply-next")}
            />
            <RadioButton
              fullWidth
              value="give-change"
              label="Dar cambio"
              checked={partialRemainderDecision === "give-change"}
              onChange={() => onPartialRemainderDecisionChange("give-change")}
            />
          </Stack>
        </Stack>
      )}

      <CaptureCardActions>
        {
          paymentMethod === "cash" && !isCashDeposit && (
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
