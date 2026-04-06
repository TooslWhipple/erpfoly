import { Grid, Button, MenuItem, Stack, Typography } from "@mui/material";
import { Check, ShieldCheck } from "lucide-react";
import { FormTextField } from "@/components/Form";
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
  onFieldChange: (field: keyof BasicInformationFormValues, value: string) => void;
  onValidateSecurityCode: () => Promise<boolean>;
  onContinue: () => Promise<boolean>;
}

const MARITAL_STATUS_OPTIONS = ["Soltero", "Casado", "Divorciado", "Viudo", "Unión libre"];

export function BasicInformationTab({
  values,
  errors,
  validatingSecurityCode,
  isSecurityCodeValid,
  onFieldChange,
  onValidateSecurityCode,
  onContinue,
}: BasicInformationTabProps) {
  return (
    <Card>
      <Typography variant="h5">Información básica</Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <FormTextField
            label="Nombres"
            value={values.firstName}
            onChange={(event) => onFieldChange("firstName", event.target.value)}
            error={Boolean(errors.firstName)}
            helperText={errors.firstName}
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormTextField
            label="Primer Apellido"
            value={values.lastName}
            onChange={(event) => onFieldChange("lastName", event.target.value)}
            error={Boolean(errors.lastName)}
            helperText={errors.lastName}
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormTextField
            label="Segundo Apellido"
            value={values.secondLastName}
            onChange={(event) => onFieldChange("secondLastName", event.target.value)}
            error={Boolean(errors.secondLastName)}
            helperText={errors.secondLastName}
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormTextField
            label="Fecha de nacimiento"
            type="date"
            value={values.birthDate}
            onChange={(event) => onFieldChange("birthDate", event.target.value)}
            error={Boolean(errors.birthDate)}
            helperText={errors.birthDate}
            fullWidth
            InputLabelProps={{ shrink: true }}
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
          >
            {MARITAL_STATUS_OPTIONS.map((statusOption) => (
              <MenuItem key={statusOption} value={statusOption}>
                {statusOption}
              </MenuItem>
            ))}
          </FormTextField>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormTextField
            label="CURP"
            value={values.curp}
            onChange={(event) => onFieldChange("curp", event.target.value)}
            error={Boolean(errors.curp)}
            helperText={errors.curp}
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormTextField
            label="RFC"
            value={values.rfc}
            onChange={(event) => onFieldChange("rfc", event.target.value)}
            error={Boolean(errors.rfc)}
            helperText={errors.rfc}
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Typography variant="h6">Datos de contacto</Typography>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <FormTextField
            label="Correo electrónico"
            value={values.email}
            onChange={(event) => onFieldChange("email", event.target.value)}
            error={Boolean(errors.email)}
            helperText={errors.email}
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12, md: 'grow' }}>
          <FormTextField
            label="Número de Whatsapp"
            value={values.whatsappNumber}
            onChange={(event) => onFieldChange("whatsappNumber", event.target.value)}
            error={Boolean(errors.whatsappNumber)}
            helperText={errors.whatsappNumber}
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 'grow' }}>
          <FormTextField
            label="Código de seguridad"
            value={values.securityCode}
            onChange={(event) => onFieldChange("securityCode", event.target.value)}
            error={Boolean(errors.securityCode)}
            helperText={errors.securityCode}
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 'auto' }} alignSelf="flex-end">
          <Button
            variant="outlined"
            startIcon={<ShieldCheck size={16} />}
            onClick={onValidateSecurityCode}
            disabled={validatingSecurityCode}
            sx={{ minWidth: 108, alignSelf: "stretch" }}>
            Validar
          </Button>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Button
            variant="contained"
            onClick={onContinue}>
            Continuar
          </Button>
        </Grid>
      </Grid>
    </Card>
  );
}
