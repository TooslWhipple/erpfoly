import { Divider, Grid, Stack, Typography, FormControlLabel, Switch, Slider } from "@mui/material";
import { FormTextField } from "@/components";
import type { CreditApplicationDetail } from "@/types/solicitud-credito-detail.types";
import { formControlLabelSpacingSx } from "./formControlLabelSpacing";

interface FamilySectionProps {
  detail: CreditApplicationDetail;
}

export function FamilySection({ detail }: FamilySectionProps) {
  const { family } = detail;
  return (
    <Stack width="100%" spacing={3}>
      <Stack>
        <Typography variant="h6">Familia</Typography>
        <Typography variant="body2" color="text.secondary">
          Información acerca del cónyuge y dependientes económicos.
        </Typography>
      </Stack>
      <Divider />
      <FormControlLabel
        sx={formControlLabelSpacingSx}
        control={<Switch checked={family.hasSpouse} disabled />}
        label="¿Cuenta con cónyuge?"
      />
      {
        family.hasSpouse && (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormTextField label="Nombre del cónyuge" value={family.spouseName} disabled fullWidth />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormTextField label="Teléfono celular" value={family.spousePhone} disabled fullWidth />
            </Grid>
          </Grid>
        )
      }
      <Typography variant="body2">Número de dependientes:</Typography>
      <Slider
        sx={{ width: '100%' }}
        value={family.numberOfDependents}
        min={0}
        max={10}
        step={1}
        disabled
        marks={[
          { value: 0, label: '0' },
          { value: 1, label: '1' },
          { value: 2, label: '2' },
          { value: 3, label: '3' },
          { value: 4, label: '4' },
          { value: 5, label: '5' },
          { value: 6, label: '6' },
          { value: 7, label: '7' },
          { value: 8, label: '8' },
          { value: 9, label: '9' },
          { value: 10, label: '+10' }
        ]}
      />
    </Stack>
  );
}
