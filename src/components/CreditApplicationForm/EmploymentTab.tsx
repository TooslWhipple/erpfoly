import { Button, Grid, Stack, Switch, Typography } from "@mui/material";
import { FormTextField } from "@/components/Form";
import type { EmploymentTabErrors, EmploymentTabValues } from "@/types/credit-application-form.types";
import { Card } from "./styles";

interface EmploymentTabProps {
  values: EmploymentTabValues;
  errors: EmploymentTabErrors;
  onFieldChange: (field: keyof EmploymentTabValues, value: EmploymentTabValues[keyof EmploymentTabValues]) => void;
  onSave: () => Promise<boolean>;
}

export function EmploymentTab({ values, errors, onFieldChange, onSave }: EmploymentTabProps) {
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
        <Grid size={{ xs: 12, md: 4 }}>
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
        <Grid size={{ xs: 12, md: 4 }}>
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
        <Grid size={{ xs: 12, md: 4 }}>
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
        <Grid size={{ xs: 12, md: 4 }}>
          <FormTextField
            fullWidth
            required
            label="Antiguedad (años)"
            placeholder="Ingresa"
            value={values.seniorityYears}
            onChange={(event) => onFieldChange("seniorityYears", event.target.value)}
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
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <FormTextField
            fullWidth
            label="Código Postal"
            placeholder="Ingresa"
            value={values.spousePostalCode}
            onChange={(event) => onFieldChange("spousePostalCode", event.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <FormTextField
            fullWidth
            disabled
            label="Estado"
            placeholder="Selecciona"
            value={values.spouseState}
            onChange={(event) => onFieldChange("spouseState", event.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <FormTextField
            fullWidth
            disabled
            label="Ciudad"
            placeholder="Selecciona"
            value={values.spouseCity}
            onChange={(event) => onFieldChange("spouseCity", event.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <FormTextField
            fullWidth
            label="Calle y número"
            placeholder="Ingresa"
            value={values.spouseStreetAndNumber}
            onChange={(event) => onFieldChange("spouseStreetAndNumber", event.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <FormTextField
            fullWidth
            label="Antiguedad (años)"
            placeholder="Ingresa"
            value={values.spouseSeniorityYears}
            onChange={(event) => onFieldChange("spouseSeniorityYears", event.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <FormTextField
            fullWidth
            label="Puesto"
            placeholder="Ingresa"
            value={values.spousePosition}
            onChange={(event) => onFieldChange("spousePosition", event.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <FormTextField
            fullWidth
            label="Departamento"
            placeholder="Ingresa"
            value={values.spouseDepartment}
            onChange={(event) => onFieldChange("spouseDepartment", event.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormTextField
            fullWidth
            label="Ingreso mensual"
            placeholder="Ingresa"
            value={values.spouseMonthlyIncome}
            onChange={(event) => onFieldChange("spouseMonthlyIncome", event.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormTextField
            fullWidth
            label="Teléfono de la empresa"
            placeholder="Ingresa"
            value={values.spouseCompanyPhone}
            onChange={(event) => onFieldChange("spouseCompanyPhone", event.target.value)}
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
