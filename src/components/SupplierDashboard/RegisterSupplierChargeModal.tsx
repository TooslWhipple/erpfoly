import { useEffect, useMemo, useState } from "react";
import {
  Button,
  CircularProgress,
  FormControlLabel,
  Grid,
  InputAdornment,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import { Search } from "lucide-react";
import numeral from "numeral";
import { SideModal } from "@/components/SideModal";
import { FormSelect, FormTextField } from "@/components/Form";
import type { SelectOption } from "@/components/Form";
import type { SupplierChargeCategoryOption } from "@/types/supplierDashboard.types";
import {
  ChargeSummaryFooter,
  VatToggleRow,
} from "@/styles/catalogos/proveedores-charges.styles";

const VAT_RATE = 0.16;

export interface RegisterSupplierChargeFormValues {
  accountStatementId: number;
  categoryId: string;
  description: string;
  amount: string;
  includesVat: boolean;
}

interface RegisterSupplierChargeModalProps {
  open: boolean;
  onClose: () => void;
  supplierName: string;
  accountStatementOptions: SelectOption[];
  categories: SupplierChargeCategoryOption[];
  saving?: boolean;
  onSubmit: (values: RegisterSupplierChargeFormValues) => Promise<boolean>;
  title?: string;
  description?: string;
  confirmLabel?: string;
  fixedCategoryId?: string;
  lockCategory?: boolean;
  initialAmount?: string;
}

const DEFAULT_FORM_VALUES: RegisterSupplierChargeFormValues = {
  accountStatementId: 0,
  categoryId: "",
  description: "",
  amount: "",
  includesVat: true,
};

function calculateChargeTotals(amount: number, includesVat: boolean) {
  if (amount <= 0) {
    return { vat: 0, total: 0 };
  }

  if (includesVat) {
    const subtotal = amount / (1 + VAT_RATE);
    const vat = amount - subtotal;
    return { vat, total: amount };
  }

  const vat = amount * VAT_RATE;
  return { vat, total: amount + vat };
}

function parseAmountInput(value: string): number {
  const normalized = value.replace(/[^0-9.]/g, "");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function RegisterSupplierChargeModal({
  open,
  onClose,
  supplierName,
  accountStatementOptions,
  categories,
  saving = false,
  onSubmit,
  title = "Registrar cargo a proveedor",
  description = "Completa la información para registrar el nuevo cargo.",
  confirmLabel = "Registrar",
  fixedCategoryId,
  lockCategory = false,
  initialAmount = "",
}: RegisterSupplierChargeModalProps) {
  const [formValues, setFormValues] = useState<RegisterSupplierChargeFormValues>(DEFAULT_FORM_VALUES);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof RegisterSupplierChargeFormValues, string>>>({});

  useEffect(() => {
    if (!open) return;
    setFormValues({
      ...DEFAULT_FORM_VALUES,
      accountStatementId: Number(accountStatementOptions[0]?.value ?? 0),
      categoryId: fixedCategoryId ?? "",
      amount: initialAmount,
    });
    setFormErrors({});
  }, [open, accountStatementOptions, fixedCategoryId, initialAmount]);

  const amountNumber = useMemo(
    () => parseAmountInput(formValues.amount),
    [formValues.amount]
  );

  const { vat, total } = useMemo(
    () => calculateChargeTotals(amountNumber, formValues.includesVat),
    [amountNumber, formValues.includesVat]
  );

  const categoryOptions: SelectOption[] = useMemo(
    () => categories.map((category) => ({ value: category.id, label: category.label })),
    [categories]
  );

  const validate = (): boolean => {
    const nextErrors: Partial<Record<keyof RegisterSupplierChargeFormValues, string>> = {};

    if (!formValues.accountStatementId) {
      nextErrors.accountStatementId = "Selecciona un estado de cuenta.";
    }
    if (!lockCategory && !formValues.categoryId) {
      nextErrors.categoryId = "Selecciona una categoría.";
    }
    if (amountNumber <= 0) {
      nextErrors.amount = "Ingresa un monto válido.";
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
    const payload: RegisterSupplierChargeFormValues = {
      ...formValues,
      categoryId: lockCategory && fixedCategoryId ? fixedCategoryId : formValues.categoryId,
    };
    const success = await onSubmit(payload);
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
      title={title}
      description={description}
      headerActions={
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving ? <CircularProgress size={20} color="inherit" /> : confirmLabel}
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

        <FormSelect
          label="Cargar a estado de cuenta"
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

        <FormSelect
          label="Categoría"
          required
          value={formValues.categoryId}
          onChange={(event) => {
            const value = String(event.target.value);
            setFormValues((prev) => ({ ...prev, categoryId: value }));
          }}
          options={categoryOptions}
          placeholder="Seleccione"
          disabled={lockCategory}
          error={Boolean(formErrors.categoryId)}
          helperText={formErrors.categoryId}
        />

        <FormTextField
          label="Descripción"
          placeholder="Detalles adicionales del cobro..."
          value={formValues.description}
          onChange={(event) =>
            setFormValues((prev) => ({ ...prev, description: event.target.value }))
          }
          multiline
          minRows={3}
        />

        <Stack spacing={0.5}>
          <Typography variant="body1" fontWeight={500}>Monto</Typography>
          <Grid container spacing={2} alignItems="center" justifyContent="flex-end">
            <Grid size={{ xs: 12, md: 6 }}>
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
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack direction="row" alignItems="center" alignSelf="flex-end" spacing={1} flex={1}>
                <Switch
                  checked={formValues.includesVat}
                  onChange={(event) =>
                    setFormValues((prev) => ({
                      ...prev,
                      includesVat: event.target.checked,
                    }))
                  }
                  color="primary"
                />
                <Typography variant="body1">¿Monto incluye IVA?</Typography>
              </Stack>
            </Grid>
          </Grid>
        </Stack>

        <ChargeSummaryFooter>
          <Typography variant="body2" color="text.secondary">
            IVA: {numeral(vat).format("$0,0.00")}
          </Typography>
          <Typography variant="subtitle1" fontWeight={700}>
            Total: {numeral(total).format("$0,0.00")}
          </Typography>
        </ChargeSummaryFooter>
      </Stack>
    </SideModal>
  );
}
