import { Button, CircularProgress, Grid, Stack, Switch, Typography } from "@mui/material";
import { FormTextField } from "@/components/Form";
import { useNeighborhoodsByPostalCode } from "@/hooks/credit-applications/useNeighborhoodsByPostalCode";
import type { EmploymentTabErrors, EmploymentTabValues } from "@/types/credit-application-form.types";
import { Card } from "./styles";
import { PostalCodeSettlementFields } from "./PostalCodeSettlementFields";
import { StreetAddressFields } from "./StreetAddressFields";

interface EmploymentTabProps {
  values: EmploymentTabValues;
  errors: EmploymentTabErrors;
  spouseSectionEnabled: boolean;
  mergeFieldValues: (patch: Partial<EmploymentTabValues>) => EmploymentTabValues;
  onFieldChange: (field: keyof EmploymentTabValues, value: EmploymentTabValues[keyof EmploymentTabValues]) => void;
  onSave: () => Promise<boolean>;
  saving: boolean;
}

export function EmploymentTab({
  values,
  errors,
  spouseSectionEnabled,
  mergeFieldValues,
  onFieldChange,
  onSave,
  saving,
}: EmploymentTabProps) {
  const mainNeighborhoodsQuery = useNeighborhoodsByPostalCode(values.postalCode);
  const spouseNeighborhoodsQuery = useNeighborhoodsByPostalCode(values.spousePostalCode);
  const spouseEmploymentEnabled = spouseSectionEnabled && values.spouseHasEmployment;

  return (
    <Card>
      <Typography variant="h5">Empleo</Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <FormTextField
            fullWidth
            required
            label="Empresa"
            placeholder="Ingresa"
            value={values.company}
            onChange={(event) => onFieldChange("company", event.target.value)}
            error={Boolean(errors.company)}
            helperText={errors.company}
            disabled={saving}
            inputProps={{ maxLength: 128 }}
          />
        </Grid>
        <PostalCodeSettlementFields
          postalCode={values.postalCode}
          neighborhoodFullCode={values.neighborhoodFullCode}
          state={values.state}
          city={values.city}
          postalCodeError={errors.postalCode}
          neighborhoodError={errors.neighborhoodFullCode}
          neighborhoods={mainNeighborhoodsQuery.data ?? []}
          neighborhoodsLoading={mainNeighborhoodsQuery.isPending}
          fieldKeys={{
            postalCode: "postalCode",
            neighborhoodFullCode: "neighborhoodFullCode",
            state: "state",
            city: "city",
          }}
          mergePatch={(patch) => {
            mergeFieldValues(patch as Partial<EmploymentTabValues>);
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
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormTextField
            fullWidth
            required
            label="Antiguedad (años)"
            placeholder="Ingresa"
            value={values.seniorityYears}
            onChange={(event) => onFieldChange("seniorityYears", event.target.value.replace(/\D/g, '').slice(0, 4))}
            error={Boolean(errors.seniorityYears)}
            helperText={errors.seniorityYears}
            disabled={saving}
            inputProps={{ maxLength: 4, inputMode: 'numeric', pattern: '[0-9]*' }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormTextField
            fullWidth
            required
            label="Puesto"
            placeholder="Ingresa"
            value={values.position}
            onChange={(event) => onFieldChange("position", event.target.value)}
            error={Boolean(errors.position)}
            helperText={errors.position}
            disabled={saving}
            inputProps={{ maxLength: 64 }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormTextField
            fullWidth
            required
            label="Departamento"
            placeholder="Ingresa"
            value={values.department}
            onChange={(event) => onFieldChange("department", event.target.value)}
            error={Boolean(errors.department)}
            helperText={errors.department}
            disabled={saving}
            inputProps={{ maxLength: 64 }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField
            fullWidth
            required
            label="Ingreso mensual"
            placeholder="Ingresa"
            value={values.monthlyIncome}
            onChange={(event) => {
              const val = event.target.value.replace(/[^0-9.]/g, '');
              const parts = val.split('.');
              const sanitized = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : val;
              onFieldChange("monthlyIncome", sanitized.slice(0, 16));
            }}
            error={Boolean(errors.monthlyIncome)}
            helperText={errors.monthlyIncome}
            disabled={saving}
            inputProps={{ maxLength: 16, inputMode: 'decimal' }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField
            fullWidth
            required
            label="Teléfono de la empresa"
            placeholder="Ingresa"
            value={values.companyPhone}
            onChange={(event) => onFieldChange("companyPhone", event.target.value.replace(/\D/g, '').slice(0, 10))}
            error={Boolean(errors.companyPhone)}
            helperText={errors.companyPhone}
            disabled={saving}
            inputProps={{ maxLength: 10, inputMode: 'numeric', pattern: '[0-9]*' }}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Switch
              checked={values.hasOtherIncome}
              onChange={(event) => onFieldChange("hasOtherIncome", event.target.checked)}
              disabled={saving}
            />
            <Typography variant="body1">¿Cuenta con otros ingresos?</Typography>
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField
            fullWidth
            label="Monto"
            placeholder="Ingresa"
            value={values.otherIncomeAmount}
            onChange={(event) => {
              const val = event.target.value.replace(/[^0-9.]/g, '');
              const parts = val.split('.');
              const sanitized = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : val;
              onFieldChange("otherIncomeAmount", sanitized.slice(0, 16));
            }}
            disabled={!values.hasOtherIncome || saving}
            error={Boolean(errors.otherIncomeAmount)}
            helperText={errors.otherIncomeAmount}
            inputProps={{ maxLength: 16, inputMode: 'decimal' }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField
            fullWidth
            label="Especifique"
            placeholder="Ingresa"
            value={values.otherIncomeSource}
            onChange={(event) => onFieldChange("otherIncomeSource", event.target.value)}
            disabled={!values.hasOtherIncome || saving}
            error={Boolean(errors.otherIncomeSource)}
            helperText={errors.otherIncomeSource}
            inputProps={{ maxLength: 64 }}
          />
        </Grid>
      </Grid>

      <Typography variant="h5">Empleo del cónyuge</Typography>
      {spouseSectionEnabled ? (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Switch
                checked={values.spouseHasEmployment}
                onChange={(event) => onFieldChange("spouseHasEmployment", event.target.checked)}
                disabled={saving}
              />
              <Typography variant="body1">¿El cónyuge cuenta con empleo?</Typography>
            </Stack>
          </Grid>
        </Grid>
      ) : null}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <FormTextField
            fullWidth
            required={spouseEmploymentEnabled}
            label="Empresa"
            placeholder="Ingresa"
            value={values.spouseCompany}
            onChange={(event) => onFieldChange("spouseCompany", event.target.value)}
            error={Boolean(errors.spouseCompany)}
            helperText={errors.spouseCompany}
            disabled={!spouseEmploymentEnabled || saving}
            inputProps={{ maxLength: 128 }}
          />
        </Grid>
        <PostalCodeSettlementFields
          postalCode={values.spousePostalCode}
          neighborhoodFullCode={values.spouseNeighborhoodFullCode}
          state={values.spouseState}
          city={values.spouseCity}
          postalCodeError={errors.spousePostalCode}
          neighborhoodError={errors.spouseNeighborhoodFullCode}
          neighborhoods={spouseNeighborhoodsQuery.data ?? []}
          neighborhoodsLoading={spouseNeighborhoodsQuery.isPending}
          disabled={!spouseEmploymentEnabled || saving}
          fieldKeys={{
            postalCode: "spousePostalCode",
            neighborhoodFullCode: "spouseNeighborhoodFullCode",
            state: "spouseState",
            city: "spouseCity",
          }}
          mergePatch={(patch) => {
            mergeFieldValues(patch as Partial<EmploymentTabValues>);
          }}
        />
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField
            fullWidth
            disabled
            label="Estado"
            value={values.spouseState}
            onChange={(event) => onFieldChange("spouseState", event.target.value)}
            error={Boolean(errors.spouseState)}
            helperText={errors.spouseState}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField
            fullWidth
            disabled
            label="Ciudad"
            value={values.spouseCity}
            onChange={(event) => onFieldChange("spouseCity", event.target.value)}
            error={Boolean(errors.spouseCity)}
            helperText={errors.spouseCity}
          />
        </Grid>
        <StreetAddressFields
          street={values.spouseStreet}
          externalNumber={values.spouseExternalNumber}
          internalNumber={values.spouseInternalNumber}
          fieldKeys={{
            street: "spouseStreet",
            externalNumber: "spouseExternalNumber",
            internalNumber: "spouseInternalNumber",
          }}
          errors={{
            street: errors.spouseStreet,
            externalNumber: errors.spouseExternalNumber,
            internalNumber: errors.spouseInternalNumber,
          }}
          onFieldChange={onFieldChange}
          disabled={!spouseEmploymentEnabled || saving}
          required={spouseEmploymentEnabled}
        />
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormTextField
            fullWidth
            required={spouseEmploymentEnabled}
            label="Antiguedad (años)"
            placeholder="Ingresa"
            value={values.spouseSeniorityYears}
            onChange={(event) => onFieldChange("spouseSeniorityYears", event.target.value.replace(/\D/g, '').slice(0, 4))}
            error={Boolean(errors.spouseSeniorityYears)}
            helperText={errors.spouseSeniorityYears}
            disabled={!spouseEmploymentEnabled || saving}
            inputProps={{ maxLength: 4, inputMode: 'numeric', pattern: '[0-9]*' }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormTextField
            fullWidth
            required={spouseEmploymentEnabled}
            label="Puesto"
            placeholder="Ingresa"
            value={values.spousePosition}
            onChange={(event) => onFieldChange("spousePosition", event.target.value)}
            error={Boolean(errors.spousePosition)}
            helperText={errors.spousePosition}
            disabled={!spouseEmploymentEnabled || saving}
            inputProps={{ maxLength: 64 }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormTextField
            fullWidth
            required={spouseEmploymentEnabled}
            label="Departamento"
            placeholder="Ingresa"
            value={values.spouseDepartment}
            onChange={(event) => onFieldChange("spouseDepartment", event.target.value)}
            error={Boolean(errors.spouseDepartment)}
            helperText={errors.spouseDepartment}
            disabled={!spouseEmploymentEnabled || saving}
            inputProps={{ maxLength: 64 }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField
            fullWidth
            required={spouseEmploymentEnabled}
            label="Ingreso mensual"
            placeholder="Ingresa"
            value={values.spouseMonthlyIncome}
            onChange={(event) => {
              const val = event.target.value.replace(/[^0-9.]/g, '');
              const parts = val.split('.');
              const sanitized = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : val;
              onFieldChange("spouseMonthlyIncome", sanitized.slice(0, 16));
            }}
            error={Boolean(errors.spouseMonthlyIncome)}
            helperText={errors.spouseMonthlyIncome}
            disabled={!spouseEmploymentEnabled || saving}
            inputProps={{ maxLength: 16, inputMode: 'decimal' }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField
            fullWidth
            required={spouseEmploymentEnabled}
            label="Teléfono de la empresa"
            placeholder="Ingresa"
            value={values.spouseCompanyPhone}
            onChange={(event) => onFieldChange("spouseCompanyPhone", event.target.value.replace(/\D/g, '').slice(0, 10))}
            error={Boolean(errors.spouseCompanyPhone)}
            helperText={errors.spouseCompanyPhone}
            disabled={!spouseEmploymentEnabled || saving}
            inputProps={{ maxLength: 10, inputMode: 'numeric', pattern: '[0-9]*' }}
          />
        </Grid>
      </Grid>
      <Button
        variant="contained"
        style={{ alignSelf: "flex-start" }}
        onClick={onSave}
        disabled={saving}>
        {saving ? <CircularProgress size={20} color="inherit" /> : "Guardar"}
      </Button>
    </Card>
  );
}
