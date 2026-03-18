import { Divider, Grid, Stack, Typography, FormControlLabel, Switch, Radio, RadioGroup } from "@mui/material";
import { FormTextField } from "@/components";
import type { CreditApplicationDetail } from "@/types/solicitud-credito-detail.types";
import { formControlLabelSpacingSx } from "./formControlLabelSpacing";
import { colors } from "@/styles/theme";

interface AddressSectionProps {
  detail: CreditApplicationDetail;
}

export function AddressSection({ detail }: AddressSectionProps) {
  const { address } = detail;
  return (
    <Stack width="100%" spacing={3}>
      <Stack>
        <Typography variant="h6">Dirección</Typography>
        <Typography variant="body2" color="text.secondary">
          Información que será usada para realizar entrega de artículos a domicilio.
        </Typography>
      </Stack>
      <Divider />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormTextField label="Código Postal" value={address.postalCode} disabled fullWidth />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }} sx={{ display: { xs: 'none', md: 'block' } }} />
        <Grid size={{ xs: 12, md: 6 }}>
          <FormTextField label="Estado" value={address.state} disabled fullWidth />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormTextField label="Ciudad" value={address.city} disabled fullWidth />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <FormTextField label="Calle y número" value={address.streetAndNumber} disabled fullWidth />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <div
            style={{
              height: "144px",
              backgroundColor: colors.chip.background,
              border: `1px solid ${colors.border}`,
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Mapa (placeholder)
            </Typography>
          </div>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <FormTextField label="Entre calles" value={address.betweenStreets} disabled fullWidth />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormTextField
            label="Núm. de teléfono de quién recibirá los artículos"
            value={address.deliveryPhone}
            disabled
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormTextField label="Nombre de quién recibe" value={address.receiverName} disabled fullWidth />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <FormControlLabel
            sx={formControlLabelSpacingSx}
            control={<Switch checked={address.useClientPhone} disabled />}
            label="Utilizar número del cliente"
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle1">Propiedad de la Vivienda</Typography>
          <RadioGroup value={address.housingOwnership} row>
            <FormControlLabel sx={formControlLabelSpacingSx} value="own" control={<Radio disabled />} label="Casa propia" />
            <FormControlLabel sx={formControlLabelSpacingSx} value="rented" control={<Radio disabled />} label="Alquilada" />
            <FormControlLabel sx={formControlLabelSpacingSx} value="paying" control={<Radio disabled />} label="Pagandola" />
            <FormControlLabel sx={formControlLabelSpacingSx} value="relatives" control={<Radio disabled />} label="Familiares" />
          </RadioGroup>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <FormTextField label="Tiempo en el domicilio" value={address.timeAtAddress} disabled fullWidth />
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <FormTextField label="Domicilio anterior" value={address.previousAddress} disabled fullWidth />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <FormTextField label="Tiempo" value={address.previousTime} disabled fullWidth />
        </Grid>
      </Grid>
    </Stack>
  );
}
