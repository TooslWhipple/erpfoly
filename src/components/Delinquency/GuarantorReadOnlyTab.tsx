import { Divider, Grid, Stack, Switch, Typography } from "@mui/material";
import { FormTextField } from "@/components";
import type { SharedDelinquencyGuarantor } from "@/types/delinquency-shared-list.types";
import { formatDateOnly } from "@/utils/date";

export interface GuarantorReadOnlyTabProps {
  guarantor: SharedDelinquencyGuarantor | null;
}

export function GuarantorReadOnlyTab({ guarantor }: GuarantorReadOnlyTabProps) {
  if (!guarantor) {
    return (
      <Typography variant="body2" color="text.secondary">
        No hay aval registrado para este cliente
      </Typography>
    );
  }

  const { address } = guarantor;

  return (
    <Stack width="100%" spacing={3}>
      <Stack>
        <Typography variant="h6">Aval</Typography>
        <Typography variant="body2" color="text.secondary">
          Información del aval asociado a la solicitud de crédito del cliente.
        </Typography>
      </Stack>
      <Divider />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <FormTextField
            label="Nombre completo"
            value={guarantor.fullName}
            readOnly
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField
            label="Fecha de nacimiento"
            value={
              guarantor.birthDate
                ? formatDateOnly(guarantor.birthDate, "dateNumeric", {
                    fallback: "",
                  })
                : ""
            }
            readOnly
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField
            label="Estado civil"
            value={guarantor.maritalStatus}
            readOnly
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField label="CURP" value={guarantor.curp} readOnly fullWidth />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField label="RFC" value={guarantor.rfc} readOnly fullWidth />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField
            label="Teléfono"
            value={guarantor.phone}
            readOnly
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Stack direction="row" alignItems="center" spacing={1} height="100%">
            <Switch checked={guarantor.hasSpouse} disabled />
            <Typography variant="body2">Tiene cónyuge</Typography>
          </Stack>
        </Grid>
      </Grid>

      <Typography variant="subtitle1">Domicilio</Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField
            label="Código postal"
            value={address.postalCode}
            readOnly
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField
            label="Colonia"
            value={address.neighborhoodName}
            readOnly
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField label="Estado" value={address.state} readOnly fullWidth />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField label="Ciudad" value={address.city} readOnly fullWidth />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField label="Calle" value={address.street} readOnly fullWidth />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <FormTextField
            label="Número exterior"
            value={address.externalNumber}
            readOnly
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <FormTextField
            label="Número interior"
            value={address.internalNumber}
            readOnly
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <FormTextField
            label="Entre calles"
            value={address.betweenStreets}
            readOnly
            fullWidth
          />
        </Grid>
      </Grid>
    </Stack>
  );
}
