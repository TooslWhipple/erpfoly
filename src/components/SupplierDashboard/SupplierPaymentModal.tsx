import { useMemo, useState } from "react";
import { Button, CircularProgress, InputAdornment, Stack, Typography } from "@mui/material";
import { Search } from "lucide-react";
import { SideModal } from "@/components/SideModal";
import { FormDatePicker, FormSelect, FormTextField } from "@/components/Form";
import type { SelectOption } from "@/components/Form";
import dayjs from "@/lib/dayjs";
import type {
  EditSupplierPaymentPayload,
  RegisterSupplierPaymentPayload,
  ScheduleSupplierPaymentPayload,
  SupplierPaymentRow,
} from "@/types/supplierDashboard.types";

export type PaymentModalMode = "schedule" | "register" | "edit";

interface SupplierPaymentModalProps {
  open: boolean;
  mode: PaymentModalMode;
  onClose: () => void;
  supplierName: string;
  accountStatementOptions: SelectOption[];
  saving?: boolean;
  editingPayment?: SupplierPaymentRow | null;
  onSubmitSchedule: (payload: ScheduleSupplierPaymentPayload) => Promise<boolean>;
  onSubmitRegister: (payload: RegisterSupplierPaymentPayload) => Promise<boolean>;
  onSubmitEdit: (paymentId: number, payload: EditSupplierPaymentPayload) => Promise<boolean>;
}

interface PaymentFormValues {
  accountStatementId: number;
  amount: string;
  date: string;
}

const DEFAULT_FORM_VALUES: PaymentFormValues = {
  accountStatementId: 0,
  amount: "",
  date: "",
};

const MODE_CONFIG: Record<
  PaymentModalMode,
  { title: string; description: string; confirmLabel: string; dateLabel: string }
> = {
  schedule: {
    title: "Programar pago a proveedor",
    description: "Completa la información para programar el pago.",
    confirmLabel: "Programar",
    dateLabel: "Fecha programada",
  },
  register: {
    title: "Registrar pago a proveedor",
    description: "Completa la información para registrar el pago.",
    confirmLabel: "Registrar",
    dateLabel: "Fecha de pago",
  },
  edit: {
    title: "Editar pago programado",
    description: "Actualiza el monto o la fecha programada del pago.",
    confirmLabel: "Guardar cambios",
    dateLabel: "Fecha programada",
  },
};

function parseAmountInput(value: string): number {
  const normalized = value.replace(/[^0-9.]/g, "");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function SupplierPaymentModal({
  open,
  mode,
  onClose,
  supplierName,
  accountStatementOptions,
  saving = false,
  editingPayment = null,
  onSubmitSchedule,
  onSubmitRegister,
  onSubmitEdit,
}: SupplierPaymentModalProps) {
  const [formValues, setFormValues] = useState<PaymentFormValues>(() => {
    if (mode === "edit" && editingPayment) {
      return {
        accountStatementId: 0,
        amount: String(editingPayment.amount),
        date: editingPayment.scheduledDate ? dayjs(editingPayment.scheduledDate).format("YYYY-MM-DD") : "",
      };
    }
    return {
      ...DEFAULT_FORM_VALUES,
      accountStatementId: Number(accountStatementOptions[0]?.value ?? 0),
    };
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof PaymentFormValues, string>>>({});

  const config = MODE_CONFIG[mode];

  const amountNumber = useMemo(() => parseAmountInput(formValues.amount), [formValues.amount]);

  const validate = (): boolean => {
    const nextErrors: Partial<Record<keyof PaymentFormValues, string>> = {};

    if (mode !== "edit" && !formValues.accountStatementId) {
      nextErrors.accountStatementId = "Selecciona un estado de cuenta.";
    }
    if (amountNumber <= 0) {
      nextErrors.amount = "Ingresa un monto válido.";
    }
    if (!formValues.date) {
      nextErrors.date = "Selecciona una fecha.";
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleClose = () => {
    if (saving) return;
    onClose();
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    let success = false;
    if (mode === "schedule") {
      success = await onSubmitSchedule({
        accountStatementId: formValues.accountStatementId,
        amount: amountNumber,
        scheduledDate: formValues.date,
      });
    } else if (mode === "register") {
      success = await onSubmitRegister({
        accountStatementId: formValues.accountStatementId,
        amount: amountNumber,
        paidDate: formValues.date,
      });
    } else if (editingPayment) {
      success = await onSubmitEdit(editingPayment.id, {
        amount: amountNumber,
        scheduledDate: formValues.date,
      });
    }

    if (success) {
      setFormValues(DEFAULT_FORM_VALUES);
      setFormErrors({});
    }
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    if (nextValue === "" || /^\d*\.?\d{0,2}$/.test(nextValue)) {
      setFormValues((prev) => ({ ...prev, amount: nextValue }));
    }
  };

  const handleAmountBlur = () => {
    if (!formValues.amount.trim()) return;
    const parsed = parseAmountInput(formValues.amount);
    setFormValues((prev) => ({
      ...prev,
      amount: parsed > 0 ? parsed.toFixed(2) : "",
    }));
  };

  return (
    <SideModal
      open={open}
      onClose={handleClose}
      disableClose={saving}
      maxWidth="sm"
      title={config.title}
      description={config.description}
      headerActions={
        <Button variant="contained" color="primary" onClick={handleSubmit} disabled={saving}>
          {saving ? <CircularProgress size={20} color="inherit" /> : config.confirmLabel}
        </Button>
      }
    >
      <Stack spacing={2.5}>
        <FormTextField
          label="Proveedor"
          value={supplierName}
          disabled
          InputProps={{
            readOnly: true,
            endAdornment: (
              <InputAdornment position="end">
                <Search size={18} />
              </InputAdornment>
            ),
          }}
        />

        {mode !== "edit" && (
          <FormSelect
            label="Estado de cuenta"
            required
            value={formValues.accountStatementId}
            onChange={(event) => {
              const value = Number(event.target.value);
              setFormValues((prev) => ({ ...prev, accountStatementId: value }));
            }}
            options={accountStatementOptions}
            placeholder="Seleccione"
            error={Boolean(formErrors.accountStatementId)}
            helperText={formErrors.accountStatementId}
          />
        )}

        <Stack spacing={0.5}>
          <Typography variant="body1" fontWeight={500}>
            Monto
          </Typography>
          <FormTextField
            placeholder="0.00"
            value={formValues.amount}
            onChange={handleAmountChange}
            onBlur={handleAmountBlur}
            error={Boolean(formErrors.amount)}
            helperText={formErrors.amount}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Typography fontWeight={600}>$</Typography>
                </InputAdornment>
              ),
            }}
          />
        </Stack>

        <FormDatePicker
          label={config.dateLabel}
          required
          value={formValues.date}
          onChange={(value) => setFormValues((prev) => ({ ...prev, date: value }))}
          error={Boolean(formErrors.date)}
          helperText={formErrors.date}
          fullWidth
        />
      </Stack>
    </SideModal>
  );
}
