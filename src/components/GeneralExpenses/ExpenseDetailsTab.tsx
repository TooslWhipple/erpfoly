import {
  Checkbox,
  FormControlLabel,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import {
  FormAutocomplete,
  FormDatePicker,
  FormTextField,
} from "@/components/Form";
import type { SelectOption } from "@/components/Form";
import { SwitchRow } from "./styles";

export interface ExpenseDetailsFormState {
  assignToSupplier: boolean;
  supplierId: string;
  supplierName: string;
  paymentDetails: string;
  dueDate: string;
  category: string;
  isLocalPurchase: boolean;
  responsibleId: string;
  responsibleName: string;
  description: string;
  amount: string;
}

export interface ExpenseDetailsTabProps {
  values: ExpenseDetailsFormState;
  supplierOptions: SelectOption[];
  categoryOptions: SelectOption[];
  responsibleOptions: SelectOption[];
  errors: Partial<Record<keyof ExpenseDetailsFormState, string>>;
  onChange: <K extends keyof ExpenseDetailsFormState>(
    field: K,
    value: ExpenseDetailsFormState[K],
  ) => void;
  disabled?: boolean;
}

export function ExpenseDetailsTab({
  values,
  supplierOptions,
  categoryOptions,
  responsibleOptions,
  errors,
  onChange,
  disabled = false,
}: ExpenseDetailsTabProps) {
  return (
    <Stack spacing={2.5}>
      {!values.assignToSupplier && (
        <Stack spacing={0.5}>
          <Typography variant="body2" color="text.secondary">
            Área que solicita
          </Typography>
          <Typography variant="body1" fontWeight={600}>
            Administración
          </Typography>
        </Stack>
      )}

      <SwitchRow>
        <Typography variant="body2" fontWeight={500}>
          Asignar a proveedor
        </Typography>
        <Switch
          checked={values.assignToSupplier}
          onChange={(_, checked) => onChange("assignToSupplier", checked)}
          disabled={disabled}
          color="primary"
        />
      </SwitchRow>

      {values.assignToSupplier && (
        <FormAutocomplete
          label="Proveedor"
          options={supplierOptions}
          value={values.supplierId}
          onChange={(supplierId) => {
            const option = supplierOptions.find(
              (item) => String(item.value) === supplierId,
            );
            onChange("supplierId", supplierId);
            onChange("supplierName", option?.label ?? "");
          }}
          error={Boolean(errors.supplierId)}
          helperText={errors.supplierId}
          disabled={disabled}
          placeholder="Buscar proveedor"
        />
      )}

      {!values.assignToSupplier && (
        <FormTextField
          label="Detalles del pago"
          value={values.paymentDetails}
          onChange={(event) => onChange("paymentDetails", event.target.value)}
          error={Boolean(errors.paymentDetails)}
          helperText={errors.paymentDetails}
          disabled={disabled}
          placeholder="Pago a cuenta de servicios externos"
        />
      )}

      <FormDatePicker
        label="Fecha a realizar el pago"
        value={values.dueDate}
        onChange={(value) => onChange("dueDate", value)}
        error={Boolean(errors.dueDate)}
        helperText={errors.dueDate}
        disabled={disabled}
      />

      <FormAutocomplete
        label="Categoría"
        options={categoryOptions}
        value={values.category}
        onChange={(value) => onChange("category", value)}
        error={Boolean(errors.category)}
        helperText={errors.category}
        disabled={disabled}
        placeholder="Selecciona una categoría"
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={values.isLocalPurchase}
            onChange={(_, checked) => onChange("isLocalPurchase", checked)}
            disabled={disabled}
            color="primary"
          />
        }
        label={<Typography variant="body2">Compra local</Typography>}
      />

      <FormAutocomplete
        label="Responsable"
        options={responsibleOptions}
        value={values.responsibleId}
        onChange={(responsibleId) => {
          const option = responsibleOptions.find(
            (item) => String(item.value) === responsibleId,
          );
          onChange("responsibleId", responsibleId);
          onChange("responsibleName", option?.label ?? "");
        }}
        disabled={disabled}
        placeholder="Buscar responsable"
      />

      <FormTextField
        label="Descripción [Opcional]"
        value={values.description}
        onChange={(event) => onChange("description", event.target.value)}
        placeholder="Detalles adicionales del gasto..."
        multiline
        minRows={3}
        disabled={disabled}
      />

      <FormTextField
        label="Monto"
        value={values.amount}
        onChange={(event) => onChange("amount", event.target.value)}
        error={Boolean(errors.amount)}
        helperText={errors.amount}
        disabled={disabled}
        placeholder="$0.00"
      />
    </Stack>
  );
}
