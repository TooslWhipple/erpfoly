import { useEffect, useState } from "react";
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
import type { GeneralExpensePayment } from "@/types/general-expenses.types";
import { UploadDashedButton } from "./styles";

export interface RegisterExpensePaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payment: Omit<GeneralExpensePayment, "id">) => void;
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
}: RegisterExpensePaymentModalProps) {
  const theme = useTheme();
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState("");
  const [amountError, setAmountError] = useState<string | undefined>();
  const [dateError, setDateError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setAmount("");
    setNotes("");
    setDate(new Date().toISOString().slice(0, 10));
    setAmountError(undefined);
    setDateError(undefined);
    setSubmitting(false);
  }, [open]);

  const handleSubmit = () => {
    const parsedAmount = parseAmount(amount);
    const nextAmountError =
      !amount.trim() || parsedAmount <= 0
        ? "El monto debe ser mayor a 0"
        : undefined;
    const nextDateError = !date ? "Selecciona la fecha del pago" : undefined;

    setAmountError(nextAmountError);
    setDateError(nextDateError);
    if (nextAmountError || nextDateError) return;

    setSubmitting(true);
    onSubmit({
      date,
      registeredBy: "Usuario actual",
      amount: parsedAmount,
    });
    setSubmitting(false);
  };

  const headerActions = (
    <Button
      variant="contained"
      color="primary"
      disabled={submitting}
      onClick={handleSubmit}
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

        <UploadDashedButton
          fullWidth
          variant="outlined"
          startIcon={<Upload size={18} color={theme.palette.primary.main} />}
        >
          Adjuntar comprobante
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
