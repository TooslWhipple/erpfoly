import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { CreditCard, DollarSign, PlusCircle } from "lucide-react";
import type { PaymentTerminalCatalogItem } from "@/types/payment-terminals.types";
import {
  CaptureCard,
  ChangeRow,
  PaymentAmountInput,
  PaymentErrorBanner,
  PaymentIconBadge,
  PaymentMethodRow,
  TouchButton,
} from "./styles";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(value);
}

function formatNumberInput(raw: string): string {
  if (!raw) return "";
  const parts = raw.split(".");
  const intPart = Number(parts[0] || "0").toLocaleString("es-MX");
  if (parts.length > 1) {
    return `${intPart}.${parts[1]}`;
  }
  return intPart;
}

function sanitizeAmountInput(value: string): string {
  const val = value.replace(/[^0-9.]/g, "");
  const parts = val.split(".");
  return parts.length > 2
    ? `${parts[0]}.${parts.slice(1).join("")}`
    : val;
}

export const SHOW_CARD_REFERENCE = false;
const MAX_EXTRA_CARDS = 1;

export interface ExtraCardTender {
  amount: string;
}

export interface SaleCheckoutPaymentPanelProps {
  cashAmount: string;
  cardAmount: string;
  onCashAmountChange: (value: string) => void;
  onCardAmountChange: (value: string) => void;
  extraCards: ExtraCardTender[];
  onExtraCardsChange: (value: ExtraCardTender[]) => void;
  isCardPayment: boolean;
  exceedsCashLimit: boolean;
  cashLimitErrorMessage: string;
  selectedTerminal: number | null;
  onTerminalChange: (value: number | null) => void;
  terminals: PaymentTerminalCatalogItem[];
  terminalsLoading: boolean;
  cardPaymentDisabled: boolean;
  showNoTerminalsWarning: boolean;
  showChange: boolean;
  change: number;
  canRegister: boolean;
  isPending: boolean;
  amountToPay: number;
  onRegister: () => void;
}

export function SaleCheckoutPaymentPanel({
  cashAmount,
  cardAmount,
  onCashAmountChange,
  onCardAmountChange,
  extraCards,
  onExtraCardsChange,
  isCardPayment,
  exceedsCashLimit,
  cashLimitErrorMessage,
  selectedTerminal,
  onTerminalChange,
  terminals,
  terminalsLoading,
  cardPaymentDisabled,
  showNoTerminalsWarning,
  showChange,
  change,
  canRegister,
  isPending,
  amountToPay,
  onRegister,
}: SaleCheckoutPaymentPanelProps) {
  const theme = useTheme();

  return (
    <CaptureCard>
      <Typography variant="subtitle1" fontWeight={600}>
        Ingresa el cobro realizado al cliente:
      </Typography>

      <Stack spacing={1.5}>
        <PaymentMethodRow>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <PaymentIconBadge>
              <DollarSign size={16} color={theme.palette.text.secondary} />
            </PaymentIconBadge>
            <Typography variant="body1">Efectivo</Typography>
          </Stack>
          <PaymentAmountInput
            error={exceedsCashLimit}
            value={cashAmount ? formatNumberInput(cashAmount) : ""}
            onChange={(e) =>
              onCashAmountChange(sanitizeAmountInput(e.target.value))
            }
            placeholder="0.00"
            startAdornment={
              <InputAdornment position="start">
                <Typography
                  variant="h6"
                  color={exceedsCashLimit ? "error.main" : "text.primary"}
                  sx={{ fontWeight: 400 }}
                >
                  $
                </Typography>
              </InputAdornment>
            }
          />
        </PaymentMethodRow>

        <Stack
          spacing={1.5}
          sx={{
            borderBottom: "1px solid",
            borderColor: "divider",
            pb: 1.5,
          }}
        >
          <PaymentMethodRow sx={{ borderBottom: "none", pb: 0 }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <PaymentIconBadge>
                <CreditCard size={16} color={theme.palette.text.secondary} />
              </PaymentIconBadge>
              <Typography variant="body1">Tarjeta</Typography>
            </Stack>
            <PaymentAmountInput
              value={cardAmount ? formatNumberInput(cardAmount) : ""}
              onChange={(e) =>
                onCardAmountChange(sanitizeAmountInput(e.target.value))
              }
              placeholder="0.0"
              disabled={cardPaymentDisabled}
              startAdornment={
                <InputAdornment position="start">
                  <Typography
                    variant="h6"
                    color="text.primary"
                    sx={{ fontWeight: 400 }}
                  >
                    $
                  </Typography>
                </InputAdornment>
              }
            />
          </PaymentMethodRow>
          {showNoTerminalsWarning && (
            <Alert severity="warning">
              Esta sucursal no tiene terminales activas
            </Alert>
          )}
          {isCardPayment && !showNoTerminalsWarning && (
            <Select
              value={selectedTerminal ?? ""}
              onChange={(e) =>
                onTerminalChange(Number(e.target.value) || null)
              }
              displayEmpty
              fullWidth
              size="small"
              disabled={terminalsLoading}
              sx={{
                minHeight: 44,
                borderRadius: 1,
                bgcolor: "background.paper",
                "& .MuiSelect-select": {
                  py: 1.25,
                  display: "flex",
                  alignItems: "center",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "divider",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "text.secondary",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "primary.main",
                  borderWidth: 1,
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    mt: 0.5,
                    boxShadow: 2,
                  },
                },
              }}
            >
              <MenuItem value="" disabled>
                <Typography variant="body2" color="text.secondary">
                  {terminalsLoading
                    ? "Cargando terminales..."
                    : "Selecciona una terminal"}
                </Typography>
              </MenuItem>
              {terminals.map((terminal) => (
                <MenuItem key={terminal.id} value={terminal.id}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    width="100%"
                    gap={1}
                  >
                    <Typography variant="body2" fontWeight={500}>
                      {terminal.name}
                    </Typography>
                    <Chip
                      label={terminal.bank}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: "0.6875rem",
                        fontWeight: 600,
                        "& .MuiChip-label": { px: 1 },
                      }}
                    />
                  </Stack>
                </MenuItem>
              ))}
            </Select>
          )}
        </Stack>
      </Stack>

      <Tooltip
        title={
          showNoTerminalsWarning
            ? "Esta sucursal no tiene terminales activas"
            : extraCards.length >= MAX_EXTRA_CARDS
              ? "Máximo dos tarjetas (la principal y una adicional)"
              : "Divide el cobro en una segunda tarjeta. Usa la misma terminal."
        }
      >
        <Box component="span" sx={{ alignSelf: "flex-start", display: "inline-flex" }}>
          <Button
            variant="text"
            size="small"
            startIcon={<PlusCircle size={16} />}
            disabled={
              showNoTerminalsWarning ||
              cardPaymentDisabled ||
              extraCards.length >= MAX_EXTRA_CARDS
            }
            onClick={() => {
              if (extraCards.length >= MAX_EXTRA_CARDS) return;
              onExtraCardsChange([...extraCards, { amount: "" }]);
            }}
            sx={{ px: 1.5 }}
          >
            Agregar otra tarjeta
          </Button>
        </Box>
      </Tooltip>

      {extraCards.slice(0, MAX_EXTRA_CARDS).map((card, index) => (
        <Stack key={index} spacing={1} sx={{ pl: 1 }}>
          <PaymentMethodRow>
            <Typography variant="body2">Tarjeta 2</Typography>
            <PaymentAmountInput
              value={card.amount ? formatNumberInput(card.amount) : ""}
              onChange={(e) => {
                const next = [...extraCards];
                next[index] = {
                  amount: sanitizeAmountInput(e.target.value),
                };
                onExtraCardsChange(next);
              }}
              placeholder="0.00"
              startAdornment={
                <InputAdornment position="start">$</InputAdornment>
              }
            />
          </PaymentMethodRow>
          <Button
            variant="text"
            size="small"
            onClick={() =>
              onExtraCardsChange(extraCards.filter((_, i) => i !== index))
            }
            sx={{ alignSelf: "flex-start", px: 1.5 }}
          >
            Quitar
          </Button>
          {SHOW_CARD_REFERENCE ? (
            <PaymentAmountInput placeholder="Referencia (opcional)" />
          ) : null}
        </Stack>
      ))}

      {exceedsCashLimit && (
        <PaymentErrorBanner>{cashLimitErrorMessage}</PaymentErrorBanner>
      )}

      {showChange && (
        <ChangeRow>
          <Typography variant="body2" color="text.secondary">
            Cambio:
          </Typography>
          <Typography variant="h6" fontWeight={600}>
            {formatCurrency(change)}
          </Typography>
        </ChangeRow>
      )}

      <TouchButton
        fullWidth
        variant="contained"
        size="large"
        disabled={!canRegister}
        onClick={onRegister}
        sx={{ mt: "auto", py: 1.5 }}
      >
        {isPending ? (
          <CircularProgress size={20} color="inherit" />
        ) : (
          `Registrar cobro  ${formatCurrency(amountToPay)}`
        )}
      </TouchButton>
    </CaptureCard>
  );
}
