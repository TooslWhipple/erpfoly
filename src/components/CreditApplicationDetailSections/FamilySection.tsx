import { Divider, Grid, Stack, Typography } from "@mui/material";
import { FormTextField, TrackSlider } from "@/components";
import type { CreditApplicationDetail } from "@/types/solicitud-credito-detail.types";

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
      {
        family.hasSpouse && (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormTextField label="Nombre del cónyuge" value={family.spouseName} readOnly fullWidth />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormTextField label="Teléfono celular" value={family.spousePhone} readOnly fullWidth />
            </Grid>
          </Grid>
        )
      }
      <Typography variant="body2">Número de dependientes:</Typography>
      <TrackSlider
        value={family.numberOfDependents}
        min={0}
        max={10}
        step={1}
        marks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
        readOnly
        onChange={() => {
          /* read-only display */
        }}
        getMarkLabel={(markValue) => (markValue === 10 ? "+10" : String(markValue))}
      />
    </Stack>
  );
}
