import { Grid, Button, MenuItem, Typography } from "@mui/material";
import { Check, ShieldCheck } from "lucide-react";
import { FormTextField } from "@/components/Form";
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
  maritalStatusOptions: MaritalStatusCatalogItem[];
  maritalStatusesLoading: boolean;
  onFieldChange: (field: keyof BasicInformationFormValues, value: string) => void;
  onValidateSecurityCode: () => Promise<boolean>;
  onContinue: () => Promise<boolean>;
}

export function BasicInformationTab({
  values,
  errors,
  validatingSecurityCode,
  isSecurityCodeValid,
  maritalStatusOptions,
  maritalStatusesLoading,
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
            fullWidth
            required
            label="Nombres"
            placeholder="Ingresa"
            value={values.firstName}
            onChange={(event) => onFieldChange("firstName", event.target.value)}
            error={Boolean(errors.firstName)}
            helperText={errors.firstName}
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
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormTextField
            fullWidth
            required
            label="Fecha de nacimiento"
            placeholder="Selecciona"
            type="date"
            value={values.birthDate}
            onChange={(event) => onFieldChange("birthDate", event.target.value)}
            error={Boolean(errors.birthDate)}
            helperText={errors.birthDate}
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
            disabled={maritalStatusesLoading}
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
          />
        </Grid>
        <Grid size={{ xs: 12, md: 'grow' }}>
          <FormTextField
            fullWidth
            required
            label="Número de Whatsapp"
            placeholder="Ingresa"
            value={values.whatsappNumber}
            onChange={(event) => onFieldChange("whatsappNumber", event.target.value)}
            error={Boolean(errors.whatsappNumber)}
            helperText={errors.whatsappNumber}
          />
        </Grid>
        <Grid size={{ xs: 'grow' }}>
          <FormTextField
            fullWidth
            required
            label="Código de seguridad"
            placeholder="Ingresa"
            value={values.securityCode}
            onChange={(event) => onFieldChange("securityCode", event.target.value)}
            error={Boolean(errors.securityCode)}
            helperText={errors.securityCode}
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
          {isSecurityCodeValid !== null && (
            <Typography
              variant="body2"
              color={isSecurityCodeValid ? "success.main" : "error.main"}
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              {isSecurityCodeValid ? <Check size={14} /> : null}
              {isSecurityCodeValid ? "Código validado correctamente" : "Código inválido"}
            </Typography>
          )}
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
