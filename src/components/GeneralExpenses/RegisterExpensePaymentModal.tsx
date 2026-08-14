import { useEffect, useRef, useState } from "react";
import {
  Button,
  CircularProgress,
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
  notes?: string;
  receipt?: File;
}

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
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState("");
  const [receipt, setReceipt] = useState<File | null>(null);
  const [amountError, setAmountError] = useState<string | undefined>();
  const [dateError, setDateError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setAmount("");
    setNotes("");
    setDate(new Date().toISOString().slice(0, 10));
    setReceipt(null);
    setAmountError(undefined);
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

    setAmountError(nextAmountError);
    setDateError(nextDateError);
    if (nextAmountError || nextDateError) return;

    setSubmitting(true);
    try {
      await onSubmit({
        amount: parsedAmount,
        date,
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
        <FormTextField
          label="Monto"
          value={amount}
          onChange={(event) => {
            setAmount(sanitizeDecimal(event.target.value));
            if (amountError) setAmountError(undefined);
          }}
          error={Boolean(amountError)}
          helperText={amountError}
          placeholder="$0.00"
        />

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
