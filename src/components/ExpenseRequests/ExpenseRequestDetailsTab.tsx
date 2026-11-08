import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from "@mui/material";
import {
  FormAutocomplete,
  FormDatePicker,
  FormTextField,
  type SelectOption,
} from "@/components/Form";
import type { ExpenseRequestClassification } from "@/types/expense-requests.types";

export interface ExpenseRequestDetailsFormState {
  classification: ExpenseRequestClassification;
  internalPayableCategoryId: string;
  diverseDebtorId: string;
  responsibleUserId: string;
  branchId: string;
  startDate: string;
  endDate: string;
  destination: string;
  requestedAmount: string;
  description: string;
}

export interface ExpenseRequestDetailsTabProps {
  values: ExpenseRequestDetailsFormState;
  categoryOptions: SelectOption[];
  debtorOptions: SelectOption[];
  responsibleOptions: SelectOption[];
  branchOptions: SelectOption[];
  errors: Partial<Record<keyof ExpenseRequestDetailsFormState, string>>;
  onChange: <K extends keyof ExpenseRequestDetailsFormState>(
    field: K,
    value: ExpenseRequestDetailsFormState[K],
  ) => void;
  disabled?: boolean;
}

export function ExpenseRequestDetailsTab({
  values,
  categoryOptions,
  debtorOptions,
  responsibleOptions,
  branchOptions,
  errors,
  onChange,
  disabled = false,
}: ExpenseRequestDetailsTabProps) {
  const isViaticos = values.classification === "VIATICOS";
  const isCajaChica = values.classification === "CAJA_CHICA";

  return (
    <Stack spacing={2.5}>
      <FormControl component="fieldset" disabled={disabled}>
        <FormLabel component="legend">
          <Typography variant="subtitle2" fontWeight={600} color="text.primary">
            Clasificación del Gasto
          </Typography>
        </FormLabel>
        <RadioGroup
          row
          value={values.classification}
          onChange={(e) =>
            onChange("classification", e.target.value as ExpenseRequestClassification)
          }
          sx={{ mt: 0.5, gap: { xs: 1, sm: 3 } }}
        >
          <FormControlLabel
            value="VIATICOS"
            control={<Radio size="small" />}
            label="Viáticos"
          />
          <FormControlLabel
            value="SOLICITUD_GASTOS"
            control={<Radio size="small" />}
            label="Solicitud de gastos"
          />
          <FormControlLabel
            value="CAJA_CHICA"
            control={<Radio size="small" />}
            label="Caja chica (Revolvente)"
          />
        </RadioGroup>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25 }}>
          {isViaticos &&
            "Aplica para viajes laborales. Incluye registro de destino, comprobación con facturas/recibos y balance final."}
          {values.classification === "SOLICITUD_GASTOS" &&
            "Para compras y gastos operativos puntuales con fecha inicio, fecha fin y posterior comprobación."}
          {isCajaChica &&
            "Fondo revolvente. Al concluir, las comprobaciones autorizadas devolverán el dinero al fondo de caja chica."}
        </Typography>
      </FormControl>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormAutocomplete
            label="Categoría de Gasto"
            options={categoryOptions}
            value={values.internalPayableCategoryId}
            onChange={(val) => onChange("internalPayableCategoryId", val)}
            error={Boolean(errors.internalPayableCategoryId)}
            helperText={errors.internalPayableCategoryId}
            disabled={disabled}
            placeholder="Selecciona una categoría"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormAutocomplete
            label="Sucursal"
            options={branchOptions}
            value={values.branchId}
            onChange={(val) => onChange("branchId", val)}
            error={Boolean(errors.branchId)}
            helperText={errors.branchId}
            disabled={disabled}
            placeholder="Selecciona la sucursal"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormAutocomplete
            label="Empleado / Deudor Diverso"
            options={debtorOptions}
            value={values.diverseDebtorId}
            onChange={(val) => onChange("diverseDebtorId", val)}
            error={Boolean(errors.diverseDebtorId)}
            helperText={
              errors.diverseDebtorId ??
              "Colaborador a nombre de quien se expide el recurso"
            }
            disabled={disabled}
            placeholder="Buscar colaborador o número de empleado"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormAutocomplete
            label="Responsable de Autorización"
            options={responsibleOptions}
            value={values.responsibleUserId}
            onChange={(val) => onChange("responsibleUserId", val)}
            error={Boolean(errors.responsibleUserId)}
            helperText={
              errors.responsibleUserId ??
              "Usuario responsable que revisará y autorizará esta solicitud"
            }
            disabled={disabled}
            placeholder="Selecciona el responsable"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormDatePicker
            label="Fecha de Inicio"
            value={values.startDate}
            onChange={(val) => onChange("startDate", val)}
            error={Boolean(errors.startDate)}
            helperText={errors.startDate}
            disabled={disabled}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormDatePicker
            label="Fecha de Fin"
            value={values.endDate}
            onChange={(val) => onChange("endDate", val)}
            error={Boolean(errors.endDate)}
            helperText={errors.endDate}
            disabled={disabled}
          />
        </Grid>
      </Grid>

      {isViaticos && (
        <FormTextField
          label="Destino del Viaje"
          value={values.destination}
          onChange={(e) => onChange("destination", e.target.value)}
          error={Boolean(errors.destination)}
          helperText={errors.destination ?? "Ciudad o lugar donde se llevará a cabo el viaje"}
          disabled={disabled}
          placeholder="Ej: Ciudad de México, Monterrey, etc."
        />
      )}

      <FormTextField
        label={
          isCajaChica
            ? "Monto a Reingresar / Fondo Solicitado"
            : "Monto Solicitado"
        }
        value={values.requestedAmount}
        onChange={(e) => onChange("requestedAmount", e.target.value)}
        error={Boolean(errors.requestedAmount)}
        helperText={errors.requestedAmount}
        disabled={disabled}
        placeholder="0.00"
      />

      <FormTextField
        label="Descripción / Justificación"
        value={values.description}
        onChange={(e) => onChange("description", e.target.value)}
        error={Boolean(errors.description)}
        helperText={errors.description}
        disabled={disabled}
        multiline
        rows={3}
        placeholder="Describe el objetivo o motivo de este gasto"
      />
    </Stack>
  );
}
