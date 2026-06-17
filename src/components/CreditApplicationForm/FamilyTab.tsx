import { Button, CircularProgress, Grid, Stack, Typography } from "@mui/material";
import { TrackSlider } from "@/components";
import { FormTextField } from "@/components/Form";
import type { FamilyTabErrors, FamilyTabValues } from "@/types/credit-application-form.types";
import { Card } from "./styles";

interface FamilyTabProps {
  values: FamilyTabValues;
  errors: FamilyTabErrors;
  spouseFieldsEnabled: boolean;
  onFieldChange: (field: keyof FamilyTabValues, value: FamilyTabValues[keyof FamilyTabValues]) => void;
  onContinue: () => Promise<boolean>;
  saving: boolean;
}

const DEPENDENTS_MARKS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export function FamilyTab({ values, errors, spouseFieldsEnabled, onFieldChange, onContinue, saving }: FamilyTabProps) {
  return (
    <Card>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField
            fullWidth
            required={spouseFieldsEnabled}
            label="Nombre del cónyuge"
            placeholder="Ingresa"
            value={values.spouseName}
            onChange={(event) => onFieldChange("spouseName", event.target.value)}
            error={Boolean(errors.spouseName)}
            helperText={errors.spouseName}
            disabled={!spouseFieldsEnabled || saving}
            inputProps={{ maxLength: 64 }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField
            fullWidth
            required={spouseFieldsEnabled}
            label="Teléfono celular"
            placeholder="Ingresa"
            value={values.spousePhone}
            onChange={(event) => onFieldChange("spousePhone", event.target.value.replace(/\D/g, '').slice(0, 10))}
            error={Boolean(errors.spousePhone)}
            helperText={errors.spousePhone}
            disabled={!spouseFieldsEnabled || saving}
            inputProps={{ maxLength: 10, inputMode: 'numeric', pattern: '[0-9]*' }}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Stack spacing={2}>
            <Typography variant="h6">Número de dependientes:</Typography>
            <TrackSlider
              value={values.dependentsCount}
              min={0}
              max={10}
              marks={DEPENDENTS_MARKS}
              onChange={(_, value) => onFieldChange("dependentsCount", value)}
              getMarkLabel={(markValue) => (markValue === 10 ? "+10" : String(markValue))}
              disabled={saving}
            />
          </Stack>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Button
            variant="contained"
            onClick={onContinue}
            disabled={saving}>
            {saving ? <CircularProgress size={20} color="inherit" /> : "Guardar"}
          </Button>
        </Grid>
      </Grid>
    </Card>
  );
}
