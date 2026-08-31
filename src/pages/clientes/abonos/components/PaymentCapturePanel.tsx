import { useCallback, useEffect, useRef, useState } from "react";
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
  InstallmentsControl,
  InstallmentsControlDivider,
  InstallmentsControlInput,
  PaymentMethodButton,
} from "@/styles/clientes/abonos.styles";
import { RadioButton } from "@/components";
import { CircleDollarSign, CreditCard, Minus, Pencil, Plus } from "lucide-react";

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

function clampInstallmentCount(raw: number, max: number): number {
  if (max <= 0) return 1;
  return Math.min(max, Math.max(1, Math.trunc(raw)));
}

// InstallmentsControl fija el color de fondo/texto vía CSS `color` heredado,
// pero IconButton/Button de MUI aplican su propio color por defecto con más
// especificidad que la herencia — hay que forzarlo explícitamente a "inherit"
// (y de nuevo en el estado disabled, que también trae color propio).
const installmentsControlActionSx = {
  color: "inherit",
  "&.Mui-disabled": {
    color: "inherit",
    opacity: 0.4,
  },
} as const;

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
  const [installmentInputValue, setInstallmentInputValue] = useState("1");
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

  const applyInstallmentCount = useCallback((count: number) => {
    const clamped = clampInstallmentCount(count, totalPendingInstallmentsCount);
    setInstallmentCount(clamped);
    setInstallmentInputValue(String(clamped));
    onInstallmentCountChange(clamped);
  }, [totalPendingInstallmentsCount, onInstallmentCountChange]);

  // Si el máximo baja (p. ej. excluir una cuenta), reclampar y reemitir el
  // conteo para que el monto derivado no quede desincronizado.
  useEffect(() => {
    if (displayedInstallmentCount === installmentCount) return;
    applyInstallmentCount(displayedInstallmentCount);
  }, [displayedInstallmentCount, installmentCount, applyInstallmentCount]);

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

  const handleInstallmentInputChange = (raw: string) => {
    const digitsOnly = raw.replace(/\D/g, "");
    setInstallmentInputValue(digitsOnly);

    if (digitsOnly.length === 0) return;

    const parsed = parseInt(digitsOnly, 10);
    if (Number.isNaN(parsed)) return;

    applyInstallmentCount(parsed);
  };

  const handleInstallmentInputBlur = () => {
    const parsed = parseInt(installmentInputValue, 10);
    if (Number.isNaN(parsed) || parsed < 1) {
      applyInstallmentCount(1);
      return;
    }
    applyInstallmentCount(parsed);
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

      <InstallmentsControl>
        <Typography variant="body2" textAlign="center">
          Parcialidades a cubrir
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton
            size="small"
            onClick={handleDecrementInstallments}
            disabled={displayedInstallmentCount <= 1 || totalPendingInstallmentsCount === 0}
            sx={installmentsControlActionSx}
          >
            <Minus size={16} />
          </IconButton>
          <InstallmentsControlInput
            type="number"
            inputMode="numeric"
            min={1}
            max={totalPendingInstallmentsCount || 1}
            step={1}
            value={installmentInputValue}
            disabled={totalPendingInstallmentsCount === 0}
            aria-label="Parcialidades a cubrir"
            onChange={(event) => handleInstallmentInputChange(event.target.value)}
            onBlur={handleInstallmentInputBlur}
          />
          <IconButton
            size="small"
            onClick={handleIncrementInstallments}
            disabled={displayedInstallmentCount >= totalPendingInstallmentsCount}
            sx={installmentsControlActionSx}
          >
            <Plus size={16} />
          </IconButton>
        </Stack>
        <InstallmentsControlDivider />
        <Button
          size="small"
          variant="text"
          onClick={handleSelectAllInstallments}
          disabled={totalPendingInstallmentsCount === 0}
          sx={{ ...installmentsControlActionSx, textTransform: "none", fontWeight: 600 }}
        >
          Seleccionar todas ({totalPendingInstallmentsCount})
        </Button>
      </InstallmentsControl>

      <CaptureAmountInput
        value={displayValue}
        placeholder="0.00"
        startAdornment={
          <InputAdornment position="start">
            <Typography variant="h4" color="text.secondary">$</Typography>
          </InputAdornment>
        }
        endAdornment={
          <InputAdornment position="end" sx={{ color: "text.secondary" }}>
            <Pencil size={18} />
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
