import { Button, Grid, Stack, Switch, Typography } from "@mui/material";
import { FormTextField } from "@/components/Form";
import { useNeighborhoodsByPostalCode } from "@/hooks/credit-applications/useNeighborhoodsByPostalCode";
import type { EmploymentTabErrors, EmploymentTabValues } from "@/types/credit-application-form.types";
import { Card } from "./styles";
import { PostalCodeSettlementFields } from "./PostalCodeSettlementFields";

interface EmploymentTabProps {
  values: EmploymentTabValues;
  errors: EmploymentTabErrors;
  spouseSectionEnabled: boolean;
  mergeFieldValues: (patch: Partial<EmploymentTabValues>) => EmploymentTabValues;
  onFieldChange: (field: keyof EmploymentTabValues, value: EmploymentTabValues[keyof EmploymentTabValues]) => void;
  onSave: () => Promise<boolean>;
}

export function EmploymentTab({
  values,
  errors,
  spouseSectionEnabled,
  mergeFieldValues,
  onFieldChange,
  onSave,
}: EmploymentTabProps) {
  const mainNeighborhoodsQuery = useNeighborhoodsByPostalCode(values.postalCode);
  const spouseNeighborhoodsQuery = useNeighborhoodsByPostalCode(values.spousePostalCode);
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
          />
        </Grid>
        <PostalCodeSettlementFields
          postalCode={values.postalCode}
          neighborhoodFullCode={values.neighborhoodFullCode}
          postalCodeError={errors.postalCode}
          neighborhoodError={errors.neighborhoodFullCode}
          neighborhoods={mainNeighborhoodsQuery.data ?? []}
          neighborhoodsLoading={mainNeighborhoodsQuery.isFetching}
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
        <Grid size={{ xs: 12, md: 6 }}>
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
        <Grid size={{ xs: 12, md: 6 }}>
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
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <FormTextField
            fullWidth
            required
            label="Antiguedad (años)"
            placeholder="Ingresa"
            value={values.seniorityYears}
            onChange={(event) => onFieldChange("seniorityYears", event.target.value)}
            error={Boolean(errors.seniorityYears)}
            helperText={errors.seniorityYears}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <FormTextField
            fullWidth
            required
            label="Puesto"
            placeholder="Ingresa"
            value={values.position}
            onChange={(event) => onFieldChange("position", event.target.value)}
            error={Boolean(errors.position)}
            helperText={errors.position}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <FormTextField
            fullWidth
            required
            label="Departamento"
            placeholder="Ingresa"
            value={values.department}
            onChange={(event) => onFieldChange("department", event.target.value)}
            error={Boolean(errors.department)}
            helperText={errors.department}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormTextField
            fullWidth
            required
            label="Ingreso mensual"
            placeholder="Ingresa"
            value={values.monthlyIncome}
            onChange={(event) => onFieldChange("monthlyIncome", event.target.value)}
            error={Boolean(errors.monthlyIncome)}
            helperText={errors.monthlyIncome}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormTextField
            fullWidth
            required
            label="Teléfono de la empresa"
            placeholder="Ingresa"
            value={values.companyPhone}
            onChange={(event) => onFieldChange("companyPhone", event.target.value)}
            error={Boolean(errors.companyPhone)}
            helperText={errors.companyPhone}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Switch
              checked={values.hasOtherIncome}
              onChange={(event) => onFieldChange("hasOtherIncome", event.target.checked)}
            />
            <Typography variant="body1">¿Cuenta con otros ingresos?</Typography>
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormTextField
            fullWidth
            label="Monto"
            placeholder="Ingresa"
            value={values.otherIncomeAmount}
            onChange={(event) => onFieldChange("otherIncomeAmount", event.target.value)}
            disabled={!values.hasOtherIncome}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormTextField
            fullWidth
            label="Especifique"
            placeholder="Ingresa"
            value={values.otherIncomeSource}
            onChange={(event) => onFieldChange("otherIncomeSource", event.target.value)}
            disabled={!values.hasOtherIncome}
          />
        </Grid>
      </Grid>

      <Typography variant="h5">Empleo del cónyuge</Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <FormTextField
            fullWidth
            label="Empresa"
            placeholder="Ingresa"
            value={values.spouseCompany}
            onChange={(event) => onFieldChange("spouseCompany", event.target.value)}
            disabled={!spouseSectionEnabled}
          />
        </Grid>
        <PostalCodeSettlementFields
          postalCode={values.spousePostalCode}
          neighborhoodFullCode={values.spouseNeighborhoodFullCode}
          postalCodeError={errors.spousePostalCode}
          neighborhoodError={errors.spouseNeighborhoodFullCode}
          neighborhoods={spouseNeighborhoodsQuery.data ?? []}
          neighborhoodsLoading={spouseNeighborhoodsQuery.isFetching}
          disabled={!spouseSectionEnabled}
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
        <Grid size={{ xs: 12, md: 6 }}>
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
        <Grid size={{ xs: 12, md: 6 }}>
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
        <Grid size={{ xs: 12 }}>
          <FormTextField
            fullWidth
            label="Calle y número"
            placeholder="Ingresa"
            value={values.spouseStreetAndNumber}
            onChange={(event) => onFieldChange("spouseStreetAndNumber", event.target.value)}
            disabled={!spouseSectionEnabled}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <FormTextField
            fullWidth
            label="Antiguedad (años)"
            placeholder="Ingresa"
            value={values.spouseSeniorityYears}
            onChange={(event) => onFieldChange("spouseSeniorityYears", event.target.value)}
            disabled={!spouseSectionEnabled}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <FormTextField
            fullWidth
            label="Puesto"
            placeholder="Ingresa"
            value={values.spousePosition}
            onChange={(event) => onFieldChange("spousePosition", event.target.value)}
            disabled={!spouseSectionEnabled}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <FormTextField
            fullWidth
            label="Departamento"
            placeholder="Ingresa"
            value={values.spouseDepartment}
            onChange={(event) => onFieldChange("spouseDepartment", event.target.value)}
            disabled={!spouseSectionEnabled}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormTextField
            fullWidth
            label="Ingreso mensual"
            placeholder="Ingresa"
            value={values.spouseMonthlyIncome}
            onChange={(event) => onFieldChange("spouseMonthlyIncome", event.target.value)}
            disabled={!spouseSectionEnabled}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormTextField
            fullWidth
            label="Teléfono de la empresa"
            placeholder="Ingresa"
            value={values.spouseCompanyPhone}
            onChange={(event) => onFieldChange("spouseCompanyPhone", event.target.value)}
            disabled={!spouseSectionEnabled}
          />
        </Grid>
      </Grid>
      <Button
        variant="contained"
        style={{ alignSelf: "flex-start" }}
        onClick={onSave}>
        Guardar
      </Button>
    </Card>
  );
}
