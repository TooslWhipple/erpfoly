import { Button, CircularProgress, Grid, Stack, Typography } from "@mui/material";
import { FormTextField } from "@/components/Form";
import type { HousingTypeCatalogItem } from "@/services/address.service";
import type { AddressTabErrors, AddressTabValues } from "@/types/credit-application-form.types";
import { useNeighborhoodsByPostalCode } from "@/hooks/credit-applications/useNeighborhoodsByPostalCode";
import { RadioButton } from "@/components";
import { Card } from "./styles";
import { PostalCodeSettlementFields } from "./PostalCodeSettlementFields";

interface AddressTabProps {
  values: AddressTabValues;
  errors: AddressTabErrors;
  housingTypeOptions: HousingTypeCatalogItem[];
  housingTypesLoading: boolean;
  mergeFieldValues: (patch: Partial<AddressTabValues>) => AddressTabValues;
  onFieldChange: (field: keyof AddressTabValues, value: AddressTabValues[keyof AddressTabValues]) => void;
  onSave: () => Promise<boolean>;
  saving: boolean;
}

export function AddressTab({
  values,
  errors,
  housingTypeOptions,
  housingTypesLoading,
  mergeFieldValues,
  onFieldChange,
  onSave,
  saving,
}: AddressTabProps) {
  const neighborhoodsQuery = useNeighborhoodsByPostalCode(values.postalCode);

  return (
    <Card>
      <Grid container spacing={3}>
        <PostalCodeSettlementFields
          postalCode={values.postalCode}
          neighborhoodFullCode={values.neighborhoodFullCode}
          postalCodeError={errors.postalCode}
          neighborhoodError={errors.neighborhoodFullCode}
          neighborhoods={neighborhoodsQuery.data ?? []}
          neighborhoodsLoading={neighborhoodsQuery.isFetching}
          fieldKeys={{
            postalCode: "postalCode",
            neighborhoodFullCode: "neighborhoodFullCode",
            state: "state",
            city: "city",
          }}
          mergePatch={(patch) => {
            mergeFieldValues(patch as Partial<AddressTabValues>);
          }}
        />

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField
            fullWidth
            disabled
            label="Estado"
            value={values.state}
            onChange={(event) => onFieldChange("state", event.target.value)}
            error={Boolean(errors.state)}
            helperText={errors.state}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField
            fullWidth
            disabled
            label="Ciudad"
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
            disabled={saving}
            inputProps={{ maxLength: 128 }}
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
            disabled={saving}
            inputProps={{ maxLength: 128 }}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Stack spacing={2}>
            <Typography variant="h6">Propiedad de la vivienda</Typography>
            <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap">
              {
                housingTypesLoading ?
                  <Typography variant="body2" color="text.secondary">Cargando...</Typography>
                  :
                  housingTypeOptions.map((item) => (
                    <RadioButton
                      key={item.id}
                      value={String(item.id)}
                      label={item.name}
                      checked={values.housingType === String(item.id)}
                      disabled={housingTypesLoading || saving}
                      onChange={(event) => onFieldChange("housingType", event.target.value)}
                    />
                  ))
              }
            </Stack>
            {errors.housingType ? (
              <Typography variant="caption" color="error">
                {errors.housingType}
              </Typography>
            ) : null}
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
            disabled={saving}
            inputProps={{ maxLength: 32 }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 9 }}>
          <FormTextField
            fullWidth
            label="Domicilio anterior"
            placeholder="Ingresa"
            value={values.previousAddress}
            onChange={(event) => onFieldChange("previousAddress", event.target.value)}
            disabled={saving}
            inputProps={{ maxLength: 128 }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <FormTextField
            fullWidth
            label="Tiempo"
            placeholder="Ingresa"
            value={values.previousResidenceTime}
            onChange={(event) => onFieldChange("previousResidenceTime", event.target.value)}
            disabled={saving}
            inputProps={{ maxLength: 32 }}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Button
            variant="contained"
            onClick={onSave}
            disabled={saving}>
            {saving ? <CircularProgress size={20} color="inherit" /> : "Guardar"}
          </Button>
        </Grid>
      </Grid>
    </Card>
  );
}
