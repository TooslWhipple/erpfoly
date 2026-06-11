import { Divider, Grid, Stack, Typography, FormControlLabel, Switch } from "@mui/material";
import { FormTextField } from "@/components";
import type { CreditApplicationDetail, EmploymentInfo } from "@/types/solicitud-credito-detail.types";
import { formControlLabelSpacingSx } from "./formControlLabelSpacing";

interface EmploymentSectionProps {
  detail: CreditApplicationDetail;
}

function EmploymentFields({ data }: { data: EmploymentInfo }) {
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <FormTextField label="Empresa" value={data.company} readOnly fullWidth />
      </Grid>
      <Grid size={{ xs: 6, sm: 4 }}>
        <FormTextField label="Código Postal" value={data.postalCode} readOnly fullWidth />
      </Grid>
      <Grid size={{ xs: 6, sm: 4 }}>
        <FormTextField label="Estado" value={data.state} readOnly fullWidth />
      </Grid>
      <Grid size={{ xs: 6, sm: 4 }}>
        <FormTextField label="Ciudad" value={data.city} readOnly fullWidth />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <FormTextField label="Calle y número" value={data.streetAndNumber} readOnly fullWidth />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <FormTextField label="Antigüedad (años)" value={String(data.tenureYears)} readOnly fullWidth />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <FormTextField label="Puesto" value={data.position} readOnly fullWidth />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <FormTextField label="Departamento" value={data.department} readOnly fullWidth />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormTextField label="Ingreso mensual" value={data.monthlyIncome} readOnly fullWidth />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormTextField label="Teléfono de la empresa" value={data.companyPhone} readOnly fullWidth />
      </Grid>
    </Grid>
  );
}

export function EmploymentSection({ detail }: EmploymentSectionProps) {
  const { employment } = detail;
  return (
    <Stack width="100%" spacing={3}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between">
        <Stack>
          <Typography variant="h6">Empleo</Typography>
          <Typography variant="body2" color="text.secondary">Información sobre el empleo e ingresos del cliente.</Typography>
        </Stack>
        <Stack width="100%" direction={{ xs: "row", md: "column" }} justifyContent={{ xs: "space-between", md: "flex-start" }}>
          <Typography variant="body2" color="text.secondary" >Sum. ingresos</Typography>
          <Typography variant="subtitle1">{employment.totalMonthlyIncome}</Typography>
        </Stack>
      </Stack>
      <Divider />
      <EmploymentFields data={employment.applicant} />
      <FormControlLabel
        sx={formControlLabelSpacingSx}
        control={<Switch checked={employment.hasOtherIncome} readOnly />}
        label="¿Cuenta con otros ingresos?"
      />
      {employment.spouse && (
        <>
          <Typography variant="subtitle1">Empleo del cónyuge</Typography>
          <EmploymentFields data={employment.spouse} />
        </>
      )}
    </Stack>
  );
}
