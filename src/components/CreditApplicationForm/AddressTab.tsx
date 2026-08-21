import { Button, CircularProgress, Grid, Stack, Typography } from "@mui/material";
import { FormTextField, FormSelect } from "@/components/Form";
import type { SelectOption } from "@/components/Form/FormSelect";
import type { HousingTypeCatalogItem } from "@/services/address.service";
import type { AddressTabErrors, AddressTabValues } from "@/types/credit-application-form.types";
import { useNeighborhoodsByPostalCode } from "@/hooks/credit-applications/useNeighborhoodsByPostalCode";
import { RadioButton } from "@/components";
import { Card } from "./styles";
import { PostalCodeSettlementFields } from "./PostalCodeSettlementFields";
import { StreetAddressFields } from "./StreetAddressFields";

const RESIDENCE_TIME_UNIT_OPTIONS: SelectOption[] = [
  { value: "months", label: "Meses" },
  { value: "years", label: "Años" },
];

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
          state={values.state}
          city={values.city}
          postalCodeError={errors.postalCode}
          neighborhoodError={errors.neighborhoodFullCode}
          neighborhoods={neighborhoodsQuery.data ?? []}
          neighborhoodsLoading={neighborhoodsQuery.isPending}
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

        <StreetAddressFields
          street={values.street}
          externalNumber={values.externalNumber}
          internalNumber={values.internalNumber}
          fieldKeys={{
            street: "street",
            externalNumber: "externalNumber",
            internalNumber: "internalNumber",
          }}
          errors={errors}
          onFieldChange={onFieldChange}
          disabled={saving}
        />

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

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField
            fullWidth
            required
            label="Tiempo en el domicilio"
            placeholder="Ingresa"
            value={values.residenceTimeValue}
            onChange={(event) => onFieldChange("residenceTimeValue", event.target.value)}
            error={Boolean(errors.residenceTimeValue)}
            helperText={errors.residenceTimeValue}
            disabled={saving}
            inputProps={{ inputMode: "numeric", pattern: "[0-9]*", maxLength: 2 }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormSelect
            label="Meses / años"
            placeholder="Selecciona"
            required
            value={values.residenceTimeUnit}
            onChange={(event) => onFieldChange("residenceTimeUnit", event.target.value as AddressTabValues["residenceTimeUnit"])}
            options={RESIDENCE_TIME_UNIT_OPTIONS}
            error={Boolean(errors.residenceTimeUnit)}
            helperText={errors.residenceTimeUnit}
            disabled={saving}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
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
            value={values.previousResidenceTimeValue}
            onChange={(event) => onFieldChange("previousResidenceTimeValue", event.target.value)}
            disabled={saving}
            inputProps={{ inputMode: "numeric", pattern: "[0-9]*", maxLength: 2 }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <FormSelect
            label="Meses / años"
            placeholder="Selecciona"
            value={values.previousResidenceTimeUnit}
            onChange={(event) => onFieldChange("previousResidenceTimeUnit", event.target.value as AddressTabValues["previousResidenceTimeUnit"])}
            options={RESIDENCE_TIME_UNIT_OPTIONS}
            disabled={saving}
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
