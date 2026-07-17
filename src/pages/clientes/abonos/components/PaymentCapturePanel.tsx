import { useMemo, useState } from "react";
import {
  Button,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Stack,
  Typography,
} from "@mui/material";
import numeral from "numeral";
import { CircleDollarSign, CreditCard, PlusCircle, Trash2 } from "lucide-react";
import type { CardPaymentEntry } from "@/types/clientPayment.types";
import {
  CaptureCard,
  CaptureCardActions,
  CaptureCardChangeRow,
  CaptureSplitRow
} from "@/styles/clientes/abonos.styles";
import { theme } from "@/styles/theme";

export interface PaymentCapturePanelProps {
  cashAmount: number;
  cardPayments: CardPaymentEntry[];
  totalCaptured: number;
  change: number;
  canRegister: boolean;
  isSubmitting: boolean;
  previewLoading?: boolean;
  onCashAmountChange: (value: number) => void;
  onCardPaymentChange: (id: string, amount: number) => void;
  onAddCardPayment: () => void;
  onRemoveCardPayment: (id: string) => void;
  onSubmit: () => void;
}

function formatCurrency(value: number): string {
  return numeral(value).format("$0,0.00");
}

function sanitizeAmountInput(raw: string): string {
  const cleaned = raw.replace(/[^0-9.]/g, "");
  const parts = cleaned.split(".");
  return parts.length > 2 ? `${parts[0]}.${parts.slice(1).join("")}` : cleaned;
}

function parseAmount(raw: string): number {
  const parsed = parseFloat(raw);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function PaymentCapturePanel({
  cashAmount,
  cardPayments,
  totalCaptured,
  change,
  canRegister,
  isSubmitting,
  previewLoading = false,
  onCashAmountChange,
  onCardPaymentChange,
  onAddCardPayment,
  onRemoveCardPayment,
  onSubmit,
}: PaymentCapturePanelProps) {
  const [cashInput, setCashInput] = useState(
    cashAmount > 0 ? String(cashAmount) : "",
  );
  const [cardInputs, setCardInputs] = useState<Record<string, string>>({});

  const cardInputValues = useMemo(() => {
    const next: Record<string, string> = {};
    for (const entry of cardPayments) {
      if (cardInputs[entry.id] !== undefined) {
        next[entry.id] = cardInputs[entry.id];
      } else {
        next[entry.id] = entry.amount > 0 ? String(entry.amount) : "";
      }
    }
    return next;
  }, [cardInputs, cardPayments]);

  const handleCashChange = (raw: string) => {
    const sanitized = sanitizeAmountInput(raw);
    setCashInput(sanitized);
    onCashAmountChange(parseAmount(sanitized));
  };

  const handleCardChange = (id: string, raw: string) => {
    const sanitized = sanitizeAmountInput(raw);
    setCardInputs((prev) => ({ ...prev, [id]: sanitized }));
    onCardPaymentChange(id, parseAmount(sanitized));
  };

  const handleRemoveCard = (id: string) => {
    setCardInputs((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    onRemoveCardPayment(id);
  };

  return (
    <CaptureCard>
      <Typography variant="body2" fontWeight={600} textAlign="center">Ingresa el cobro realizado a el cliente:</Typography>

      <Stack spacing={1.5}>
        <CaptureSplitRow>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <CircleDollarSign size={16} color={theme.palette.text.secondary} />
            <Typography variant="body1">Efectivo</Typography>
          </Stack>
          <OutlinedInput
            size="small"
            style={{ width: "108px" }}
            value={cashInput}
            placeholder="0.00"
            startAdornment={
              <InputAdornment position="start">
                <Typography variant="h6" color="text.primary" fontWeight={400}>
                  $
                </Typography>
              </InputAdornment>
            }
            onChange={(event) => handleCashChange(event.target.value)}
          />
        </CaptureSplitRow>

        {
          cardPayments.map((entry, index) => {
            const label = cardPayments.length > 1 ? `Tarjeta ${index + 1}` : "Tarjeta";

            return (
              <CaptureSplitRow key={entry.id}>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <CreditCard size={16} color={theme.palette.text.secondary} />
                  <Typography variant="body1">{label}</Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <OutlinedInput
                    size="small"
                    style={{ width: "108px" }}
                    value={cardInputValues[entry.id] ?? ""}
                    placeholder="0.0"
                    startAdornment={
                      <InputAdornment position="start">
                        <Typography
                          variant="h6"
                          color="text.primary"
                          fontWeight={400}>
                          $
                        </Typography>
                      </InputAdornment>
                    }
                    onChange={(event) =>
                      handleCardChange(entry.id, event.target.value)
                    }
                  />
                  {
                    cardPayments.length > 1 &&
                    <IconButton
                      size="small"
                      aria-label={`Eliminar ${label}`}
                      onClick={() => handleRemoveCard(entry.id)}>
                      <Trash2 size={16} />
                    </IconButton>
                  }
                </Stack>
              </CaptureSplitRow>
            );
          })}
      </Stack>

      <Button
        variant="text"
        size="small"
        startIcon={<PlusCircle size={16} />}
        onClick={onAddCardPayment}
        sx={{
          textTransform: "none",
          color: "primary.main",
          alignSelf: "flex-start",
          px: 0,
        }}
      >
        Agregar otra tarjeta
      </Button>

      <CaptureCardActions>
        {(cashAmount > 0 || change > 0) && (
          <CaptureCardChangeRow>
            <Typography variant="body2" color="text.secondary">
              Cambio:
            </Typography>
            <Typography variant="subtitle1" fontWeight={600}>
              {formatCurrency(change)}
            </Typography>
          </CaptureCardChangeRow>
        )}

        <Button
          fullWidth
          variant="contained"
          disabled={!canRegister}
          onClick={onSubmit}
        >
          {isSubmitting
            ? "Registrando..."
            : previewLoading
              ? "Calculando..."
              : `Registrar cobro | ${formatCurrency(totalCaptured)}`}
        </Button>
      </CaptureCardActions>
    </CaptureCard>
  );
}

const PaymentCapturePanelPage = () => null;

export default PaymentCapturePanelPage;
