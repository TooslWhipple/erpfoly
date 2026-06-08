import { CircularProgress, Grid, Button, MenuItem, Typography } from "@mui/material";
import { Check, ShieldCheck } from "lucide-react";
import { FormDatePicker, FormTextField } from "@/components/Form";
import type { MaritalStatusCatalogItem } from "@/services/catalog.service";
import type {
  BasicInformationFormErrors,
  BasicInformationFormValues,
} from "@/types/credit-application-form.types";
import { Card } from "./styles";

interface BasicInformationTabProps {
  values: BasicInformationFormValues;
  errors: BasicInformationFormErrors;
  validatingSecurityCode: boolean;
  isSecurityCodeValid: boolean | null;
  otpActionLabel: string;
  isOtpActionDisabled: boolean;
  isSecurityCodeFieldDisabled: boolean;
  maritalStatusOptions: MaritalStatusCatalogItem[];
  maritalStatusesLoading: boolean;
  onFieldChange: (field: keyof BasicInformationFormValues, value: string) => void;
  onValidateSecurityCode: () => Promise<boolean>;
  onContinue: () => Promise<boolean>;
  saving: boolean;
}

export function BasicInformationTab({
  values,
  errors,
  validatingSecurityCode,
  isSecurityCodeValid,
  otpActionLabel,
  isOtpActionDisabled,
  isSecurityCodeFieldDisabled,
  maritalStatusOptions,
  maritalStatusesLoading,
  onFieldChange,
  onValidateSecurityCode,
  onContinue,
  saving,
}: BasicInformationTabProps) {
  const isSendMode = otpActionLabel !== "Validar";

  return (
    <Card>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <FormTextField
            fullWidth
            required
            label="Nombres"
            placeholder="Ingresa"
            value={values.firstName}
            onChange={(event) => onFieldChange("firstName", event.target.value)}
            error={Boolean(errors.firstName)}
            helperText={errors.firstName}
            disabled={saving}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormTextField
            fullWidth
            required
            label="Primer Apellido"
            placeholder="Ingresa"
            value={values.lastName}
            onChange={(event) => onFieldChange("lastName", event.target.value)}
            error={Boolean(errors.lastName)}
            helperText={errors.lastName}
            disabled={saving}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormTextField
            fullWidth
            label="Segundo Apellido"
            placeholder="Ingresa"
            value={values.secondLastName}
            onChange={(event) => onFieldChange("secondLastName", event.target.value)}
            error={Boolean(errors.secondLastName)}
            helperText={errors.secondLastName}
            disabled={saving}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormDatePicker
            fullWidth
            required
            openTo="year"
            views={["year", "month", "day"]}
            label="Fecha de nacimiento"
            placeholder="Selecciona"
            value={values.birthDate}
            onChange={(nextValue) => onFieldChange("birthDate", nextValue)}
            error={Boolean(errors.birthDate)}
            helperText={errors.birthDate}
            disabled={saving}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormTextField
            label="Estado civil"
            select
            value={values.maritalStatus}
            onChange={(event) => onFieldChange("maritalStatus", event.target.value)}
            error={Boolean(errors.maritalStatus)}
            helperText={errors.maritalStatus}
            fullWidth
            disabled={maritalStatusesLoading || saving}
          >
            <MenuItem value="">
              {maritalStatusesLoading ? "Cargando..." : "Selecciona"}
            </MenuItem>
            {maritalStatusOptions.map((item) => (
              <MenuItem key={item.id} value={String(item.id)}>
                {item.name}
              </MenuItem>
            ))}
          </FormTextField>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormTextField
            fullWidth
            required
            label="CURP"
            placeholder="Ingresa"
            value={values.curp}
            onChange={(event) => onFieldChange("curp", event.target.value)}
            error={Boolean(errors.curp)}
            helperText={errors.curp}
            disabled={saving}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormTextField
            fullWidth
            required
            label="RFC"
            placeholder="Ingresa"
            value={values.rfc}
            onChange={(event) => onFieldChange("rfc", event.target.value)}
            error={Boolean(errors.rfc)}
            helperText={errors.rfc}
            disabled={saving}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Typography variant="h6">Datos de contacto</Typography>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <FormTextField
            fullWidth
            required
            label="Correo electrónico"
            placeholder="Ingresa"
            value={values.email}
            onChange={(event) => onFieldChange("email", event.target.value)}
            error={Boolean(errors.email)}
            helperText={errors.email}
            disabled={saving}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormTextField
            fullWidth
            required={isSecurityCodeValid !== true}
            label="Número de Whatsapp"
            placeholder="Ingresa"
            value={values.whatsappNumber}
            onChange={(event) => onFieldChange("whatsappNumber", event.target.value)}
            error={Boolean(errors.whatsappNumber)}
            helperText={errors.whatsappNumber}
            disabled={isSecurityCodeValid === true || saving}
          />
        </Grid>
        <Grid size={{ xs: 'grow' }}>
          <FormTextField
            fullWidth
            required={isSecurityCodeValid !== true}
            label="Código de seguridad"
            placeholder="Ingresa"
            value={values.securityCode}
            onChange={(event) => onFieldChange("securityCode", event.target.value)}
            error={Boolean(errors.securityCode)}
            helperText={errors.securityCode}
            disabled={isSecurityCodeFieldDisabled || saving}
            inputProps={{ maxLength: 6, inputMode: "numeric", pattern: "[0-9]*" }}
          />
        </Grid>
        <Grid size={{ xs: 'auto' }} alignSelf="flex-end">
          <Button
            variant="outlined"
            startIcon={<ShieldCheck size={16} />}
            onClick={onValidateSecurityCode}
            disabled={isOtpActionDisabled || saving}
            sx={{ minWidth: 108, alignSelf: "stretch" }}>
            {validatingSecurityCode ? "Procesando..." : otpActionLabel}
          </Button>
        </Grid>

        <Grid size={{ xs: 12 }}>
          {isSecurityCodeValid === true && (
            <Typography
              variant="body2"
              color="success.main"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <Check size={14} />
              Código validado correctamente
            </Typography>
          )}
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Button
            variant="contained"
            onClick={onContinue}
            disabled={saving}>
            {saving ? <CircularProgress size={20} color="inherit" /> : "Guardar"}
          </Button>
        </Grid>
      </Grid>
    </Card>
  );
}
