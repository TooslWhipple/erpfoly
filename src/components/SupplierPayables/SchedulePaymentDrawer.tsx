import { useEffect, useRef, useState } from "react";
import {
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { Upload } from "lucide-react";
import { SideModal } from "@/components/SideModal";
import { FormDatePicker, FormTextField } from "@/components/Form";
import { scheduleSupplierPayablePayment } from "@/services/supplier-payables.service";
import type { SupplierPayableStatement } from "@/types/supplier-payables.types";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { sanitizeDecimal } from "@/forms/validation/schemas";
import { SupplierSummaryBox, UploadDashedButton } from "./styles";

export interface SchedulePaymentDrawerProps {
  open: boolean;
  statement: SupplierPayableStatement | null;
  onClose: () => void;
  onSuccess?: (statement: SupplierPayableStatement) => void;
}

function parseAmount(value: string): number {
  const cleaned = value.replace(/[^\d.]/g, "");
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function SchedulePaymentDrawer({
  open,
  statement,
  onClose,
  onSuccess,
}: SchedulePaymentDrawerProps) {
  const showError = useSnackbarStore((state) => state.showError);
  const showSuccess = useSnackbarStore((state) => state.showSuccess);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [receiptFileName, setReceiptFileName] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [amountError, setAmountError] = useState<string | undefined>();
  const [dateError, setDateError] = useState<string | undefined>();

  useEffect(() => {
    if (!open) return;
    setAmount("");
    setNotes("");
    setScheduledDate("");
    setReceiptFileName(undefined);
    setAmountError(undefined);
    setDateError(undefined);
    setSubmitting(false);
  }, [open, statement?.id]);

  const handleSubmit = async () => {
    if (!statement) return;

    const parsedAmount = parseAmount(amount);
    let hasError = false;

    if (!parsedAmount || parsedAmount <= 0) {
      setAmountError("Ingresa un monto válido");
      hasError = true;
    } else if (parsedAmount > statement.balance) {
      setAmountError("El monto no puede ser mayor al saldo pendiente");
      hasError = true;
    } else {
      setAmountError(undefined);
    }

    if (!scheduledDate) {
      setDateError("Selecciona la fecha del pago");
      hasError = true;
    } else {
      setDateError(undefined);
    }

    if (hasError) return;

    setSubmitting(true);
    const result = await scheduleSupplierPayablePayment(statement.id, {
      amount: parsedAmount,
      notes: notes.trim() || undefined,
      scheduledDate,
      receiptFileName,
    });
    setSubmitting(false);

    if (result.error) {
      showError(result.error.message);
      return;
    }

    showSuccess("Pago programado correctamente");
    if (result.data) onSuccess?.(result.data);
    onClose();
  };

  return (
    <SideModal
      open={open}
      onClose={onClose}
      title="Cuenta por pagar"
      description="Completa la información para programar el pago"
      maxWidth="sm"
      disableClose={submitting}
      headerActionsPosition="top"
      headerActions={
        <Button
          variant="contained"
          color="primary"
          disabled={submitting || !statement}
          onClick={() => {
            void handleSubmit();
          }}
          startIcon={
            submitting ? (
              <CircularProgress size={14} color="inherit" />
            ) : undefined
          }
        >
          Programar pago
        </Button>
      }
    >
      {!statement ? (
        <Stack alignItems="center" py={6}>
          <Typography variant="body2" color="text.secondary">
            Selecciona un estado de cuenta
          </Typography>
        </Stack>
      ) : (
        <Stack spacing={2.5}>
          <SupplierSummaryBox>
            <Typography variant="subtitle1" fontWeight={600}>
              {statement.supplierName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Estado de cuenta {statement.periodLabel}
            </Typography>
          </SupplierSummaryBox>

          <FormTextField
            label="Monto"
            placeholder="$0.00"
            value={amount}
            onChange={(event) => {
              setAmount(sanitizeDecimal(event.target.value));
              if (amountError) setAmountError(undefined);
            }}
            error={Boolean(amountError)}
            helperText={amountError}
            required
          />

          <FormTextField
            label="Notas"
            placeholder="Detalles adicionales del gasto..."
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            multiline
            minRows={3}
          />

          <FormDatePicker
            label="Fecha de pago"
            value={scheduledDate}
            onChange={(value) => {
              setScheduledDate(value);
              if (dateError) setDateError(undefined);
            }}
            error={Boolean(dateError)}
            helperText={dateError}
            required
          />

          <input
            ref={fileInputRef}
            type="file"
            hidden
            accept="image/*,.pdf"
            onChange={(event) => {
              const file = event.target.files?.[0];
              setReceiptFileName(file?.name);
            }}
          />

          <UploadDashedButton
            variant="outlined"
            startIcon={<Upload size={18} />}
            onClick={() => fileInputRef.current?.click()}
            disabled={submitting}
          >
            {receiptFileName ?? "Adjuntar comprobante"}
          </UploadDashedButton>
        </Stack>
      )}
    </SideModal>
  );
}
