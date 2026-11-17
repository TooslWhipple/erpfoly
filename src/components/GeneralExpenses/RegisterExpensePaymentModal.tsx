import { useEffect, useRef, useState } from "react";
import {
  Button,
  CircularProgress,
  FormControlLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { Upload } from "lucide-react";
import { SideModal } from "@/components/SideModal";
import { FormDatePicker, FormTextField } from "@/components/Form";
import { sanitizeDecimal } from "@/forms/validation/schemas";
import { UploadDashedButton } from "./styles";

export interface RegisterExpensePaymentInput {
  amount: number;
  date: string;
  paymentMethod: "STP" | "BANK";
  bank?: string;
  bankReference?: string;
  notes?: string;
  receipt?: File;
}

const BANK_OPTIONS = [
  { value: "banamex", label: "Banamex" },
  { value: "banorte", label: "Banorte" },
  { value: "hsbc", label: "HSBC" },
  { value: "santander", label: "Santander" },
  { value: "bbva", label: "BBVA" },
];

export interface RegisterExpensePaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payment: RegisterExpensePaymentInput) => Promise<void> | void;
  maxAmount?: number;
}

function parseAmount(value: string): number {
  const cleaned = value.replace(/[^\d.]/g, "");
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function RegisterExpensePaymentModal({
  open,
  onClose,
  onSubmit,
  maxAmount,
}: RegisterExpensePaymentModalProps) {
  const theme = useTheme();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"STP" | "BANK">("STP");
  const [amount, setAmount] = useState("");
  const [bank, setBank] = useState("");
  const [bankReference, setBankReference] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState("");
  const [receipt, setReceipt] = useState<File | null>(null);
  const [amountError, setAmountError] = useState<string | undefined>();
  const [bankError, setBankError] = useState<string | undefined>();
  const [bankReferenceError, setBankReferenceError] = useState<
    string | undefined
  >();
  const [dateError, setDateError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setPaymentMethod("STP");
    setAmount("");
    setBank("");
    setBankReference("");
    setNotes("");
    setDate(new Date().toISOString().slice(0, 10));
    setReceipt(null);
    setAmountError(undefined);
    setBankError(undefined);
    setBankReferenceError(undefined);
    setDateError(undefined);
    setSubmitting(false);
  }, [open]);

  const handleSubmit = async () => {
    const parsedAmount = parseAmount(amount);
    let nextAmountError: string | undefined;
    if (!amount.trim() || parsedAmount <= 0) {
      nextAmountError = "El monto debe ser mayor a 0";
    } else if (maxAmount != null && parsedAmount > maxAmount) {
      nextAmountError = "El abono no puede ser mayor al saldo pendiente";
    }
    const nextDateError = !date ? "Selecciona la fecha del pago" : undefined;
    const nextBankError =
      paymentMethod === "BANK" && !bank.trim()
        ? "Ingresa el banco"
        : undefined;
    const nextBankReferenceError =
      paymentMethod === "BANK" && !bankReference.trim()
        ? "Ingresa la referencia bancaria"
        : undefined;

    setAmountError(nextAmountError);
    setDateError(nextDateError);
    setBankError(nextBankError);
    setBankReferenceError(nextBankReferenceError);
    if (
      nextAmountError ||
      nextDateError ||
      nextBankError ||
      nextBankReferenceError
    ) {
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        amount: parsedAmount,
        date,
        paymentMethod,
        bank: paymentMethod === "BANK" ? bank.trim() : undefined,
        bankReference:
          paymentMethod === "BANK" ? bankReference.trim() : undefined,
        notes: notes.trim() || undefined,
        receipt: receipt ?? undefined,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const headerActions = (
    <Button
      variant="contained"
      color="primary"
      disabled={submitting}
      onClick={() => void handleSubmit()}
      startIcon={
        submitting ? <CircularProgress size={16} color="inherit" /> : undefined
      }
    >
      Registrar pago
    </Button>
  );

  return (
    <SideModal
      open={open}
      onClose={onClose}
      title="Registrar pago"
      description="Completa la información para registrar el pago."
      maxWidth="sm"
      disableClose={submitting}
      headerActions={headerActions}
      headerActionsPosition="top"
    >
      <Stack spacing={2.5}>
        <Stack spacing={0.5}>
          <Typography variant="body2" fontWeight={600}>
            Modalidad de pago
          </Typography>
          <RadioGroup
            value={paymentMethod}
            onChange={(event) => {
              const next = event.target.value as "STP" | "BANK";
              setPaymentMethod(next);
              if (next === "STP") {
                setBankError(undefined);
                setBankReferenceError(undefined);
              }
            }}
          >
            <FormControlLabel
              value="STP"
              control={<Radio size="small" />}
              label="Programar pago por STP"
            />
            <FormControlLabel
              value="BANK"
              control={<Radio size="small" />}
              label="Registrar importe, banco y referencia bancaria"
            />
          </RadioGroup>
        </Stack>

        <FormTextField
          label="Importe"
          value={amount}
          onChange={(event) => {
            setAmount(sanitizeDecimal(event.target.value));
            if (amountError) setAmountError(undefined);
          }}
          error={Boolean(amountError)}
          helperText={amountError}
          placeholder="$0.00"
        />

        {paymentMethod === "BANK" && (
          <>
            <FormTextField
              label="Banco"
              select
              value={bank}
              onChange={(event) => {
                setBank(event.target.value);
                if (bankError) setBankError(undefined);
              }}
              error={Boolean(bankError)}
              helperText={bankError}
            >
              <MenuItem value="" disabled>
                Selecciona un banco
              </MenuItem>
              {BANK_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </FormTextField>

            <FormTextField
              label="Referencia bancaria"
              value={bankReference}
              onChange={(event) => {
                setBankReference(event.target.value);
                if (bankReferenceError) setBankReferenceError(undefined);
              }}
              error={Boolean(bankReferenceError)}
              helperText={bankReferenceError}
              placeholder="Folio o referencia de la transferencia"
            />
          </>
        )}

        <FormTextField
          label="Notas [Opcional]"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Detalles adicionales del gasto..."
          multiline
          minRows={3}
        />

        <FormDatePicker
          label="Fecha del pago"
          value={date}
          onChange={(value) => {
            setDate(value);
            if (dateError) setDateError(undefined);
          }}
          error={Boolean(dateError)}
          helperText={dateError}
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/webp"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;
            setReceipt(file);
            event.target.value = "";
          }}
        />

        <UploadDashedButton
          fullWidth
          variant="outlined"
          startIcon={<Upload size={18} color={theme.palette.primary.main} />}
          onClick={() => fileInputRef.current?.click()}
        >
          {receipt ? receipt.name : "Adjuntar comprobante"}
        </UploadDashedButton>

        {notes.trim() && (
          <Typography variant="caption" color="text.secondary">
            Las notas se guardarán junto con el pago.
          </Typography>
        )}
      </Stack>
    </SideModal>
  );
}
