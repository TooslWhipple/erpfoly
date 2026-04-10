import { Divider, Grid, Stack, Typography, Button } from "@mui/material";
import { FormTextField } from "@/components";
import type { CreditApplicationDetail } from "@/types/solicitud-credito-detail.types";
import { SectionCard } from "@/styles/solicitudes-credito.styles";
import { PlusCircle } from "lucide-react";

interface ReferencesSectionProps {
  detail: CreditApplicationDetail;
}

export function ReferencesSection({ detail }: ReferencesSectionProps) {
  const { references } = detail;
  return (
    <Stack width="100%" spacing={3}>
      <Stack>
        <Typography variant="h6">Referencias</Typography>
        <Typography variant="body2" color="text.secondary">
          Información sobre referencias laborales y personales del cliente.
        </Typography>
      </Stack>
      <Divider />
      <Typography variant="subtitle1">Referencia laboral</Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <FormTextField label="Empresa" value={references.work.company} disabled fullWidth />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <FormTextField label="Teléfono" value={references.work.phone} disabled fullWidth />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <FormTextField label="Puesto del cliente" value={references.work.clientPosition} disabled fullWidth />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <FormTextField label="Antigüedad (años)" value={String(references.work.tenureYears)} disabled fullWidth />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <FormTextField
            label="Persona que contestó y puesto"
            value={references.work.contactNameAndPosition}
            disabled
            fullWidth
          />
        </Grid>
      </Grid>
      <Typography variant="subtitle1">Referencias familiares</Typography>
      <Stack spacing={3}>
        {
          references.family.map((ref, index) => (
            <SectionCard key={index}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormTextField label="Nombre" value={ref.name} disabled fullWidth />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormTextField label="Parentesco" value={ref.relationship} disabled fullWidth />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <FormTextField label="Dirección" value={ref.address} disabled fullWidth />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormTextField label="Teléfono" value={ref.phone} disabled fullWidth />
                </Grid>
              </Grid>
            </SectionCard>
          ))
        }
      </Stack>
      <Button
        style={{ alignSelf: 'flex-start' }}
        variant="outlined"
        startIcon={<PlusCircle size={16} />}
        disabled>
        Agregar otra
      </Button>
    </Stack>
  );
}
