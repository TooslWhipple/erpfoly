import { Button, Grid, Stack, Switch, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { FormTextField } from "@/components/Form";
import type { AddressTabErrors, AddressTabValues } from "@/types/credit-application-form.types";
import { Card } from "./styles";

interface AddressTabProps {
  values: AddressTabValues;
  errors: AddressTabErrors;
  onFieldChange: (field: keyof AddressTabValues, value: AddressTabValues[keyof AddressTabValues]) => void;
  onSave: () => Promise<boolean>;
}

export function AddressTab({ values, errors, onFieldChange, onSave }: AddressTabProps) {
  return (
    <Card>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormTextField
            fullWidth
            required
            label="Código Postal"
            placeholder="Ingresa"
            value={values.postalCode}
            onChange={(event) => onFieldChange("postalCode", event.target.value)}
            error={Boolean(errors.postalCode)}
            helperText={errors.postalCode}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }} />

        <Grid size={{ xs: 12, md: 6 }}>
          <FormTextField
            fullWidth
            disabled
            label="Estado"
            placeholder="Selecciona"
            value={values.state}
            onChange={(event) => onFieldChange("state", event.target.value)}
            error={Boolean(errors.state)}
            helperText={errors.state}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormTextField
            fullWidth
            disabled
            label="Ciudad"
            placeholder="Selecciona"
            value={values.city}
            onChange={(event) => onFieldChange("city", event.target.value)}
            error={Boolean(errors.city)}
            helperText={errors.city}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <FormTextField
            fullWidth
            required
            label="Calle y número"
            placeholder="Ingresa"
            value={values.streetAndNumber}
            onChange={(event) => onFieldChange("streetAndNumber", event.target.value)}
            error={Boolean(errors.streetAndNumber)}
            helperText={errors.streetAndNumber}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <FormTextField
            fullWidth
            required
            label="Entre calles"
            placeholder="Ingresa"
            value={values.betweenStreets}
            onChange={(event) => onFieldChange("betweenStreets", event.target.value)}
            error={Boolean(errors.betweenStreets)}
            helperText={errors.betweenStreets}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormTextField
            fullWidth
            required
            label="Núm. de teléfono de quién recibirá los artículos"
            placeholder="Ingresa"
            value={values.receiverPhone}
            onChange={(event) => onFieldChange("receiverPhone", event.target.value)}
            error={Boolean(errors.receiverName)}
            helperText={errors.receiverName}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormTextField
            fullWidth
            required
            label="Nombre de quién recibe"
            placeholder="Ingresa"
            value={values.receiverName}
            onChange={(event) => onFieldChange("receiverName", event.target.value)}
            error={Boolean(errors.receiverName)}
            helperText={errors.receiverName}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Switch
              checked={values.useClientPhone}
              onChange={(event) => onFieldChange("useClientPhone", event.target.checked)}
            />
            <Typography variant="body1">Utilizar número del cliente</Typography>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Stack spacing={1.5}>
            <Typography variant="h6">Propiedad de la vivienda</Typography>
            <ToggleButtonGroup
              exclusive
              value={values.housingType}
              onChange={(_, value) => {
                if (value) onFieldChange("housingType", value);
              }}
              size="small"
            >
              <ToggleButton value="owned">Casa propia</ToggleButton>
              <ToggleButton value="rented">Alquilada</ToggleButton>
              <ToggleButton value="paying">Pagandola</ToggleButton>
              <ToggleButton value="relatives">Familiares</ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <FormTextField
            fullWidth
            required
            label="Tiempo en el domicilio"
            placeholder="Ingresa"
            value={values.residenceTime}
            onChange={(event) => onFieldChange("residenceTime", event.target.value)}
            error={Boolean(errors.residenceTime)}
            helperText={errors.residenceTime}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 9 }}>
          <FormTextField
            fullWidth
            label="Domicilio anterior"
            placeholder="Ingresa"
            value={values.previousAddress}
            onChange={(event) => onFieldChange("previousAddress", event.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <FormTextField
            fullWidth
            label="Tiempo"
            placeholder="Ingresa"
            value={values.previousResidenceTime}
            onChange={(event) => onFieldChange("previousResidenceTime", event.target.value)}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Button variant="contained" onClick={onSave}>
            Guardar
          </Button>
        </Grid>
      </Grid>
    </Card>
  );
}
