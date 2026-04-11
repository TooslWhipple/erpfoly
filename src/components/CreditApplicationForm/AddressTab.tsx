import { Button, Grid, RadioGroup, Stack, Switch, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { FormTextField } from "@/components/Form";
import type { AddressTabErrors, AddressTabValues } from "@/types/credit-application-form.types";
import { Card } from "./styles";
import { RadioButton } from "../RadioButton";

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
          <Stack spacing={3}>
            <Typography variant="h6">Propiedad de la vivienda</Typography>
            <Stack direction="row" spacing={2}>
              <RadioButton
                value="owned"
                label="Casa propia"
                checked={values.housingType === "owned"}
                onChange={(event) => onFieldChange("housingType", event.target.value)}
              />
              <RadioButton
                value="rented"
                label="Alquilada"
                checked={values.housingType === "rented"}
                onChange={(event) => onFieldChange("housingType", event.target.value)}
              />
              <RadioButton
                value="paying"
                label="Pagandola"
                checked={values.housingType === "paying"}
                onChange={(event) => onFieldChange("housingType", event.target.value)}
              />
              <RadioButton
                value="relatives"
                label="Familiares"
                checked={values.housingType === "relatives"}
                onChange={(event) => onFieldChange("housingType", event.target.value)}
              />
            </Stack>
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
