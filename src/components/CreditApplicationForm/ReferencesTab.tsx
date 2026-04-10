import { Button, Grid, IconButton, Stack, Typography } from "@mui/material";
import { Plus, Trash2 } from "lucide-react";
import { FormTextField } from "@/components/Form";
import type { ReferencesTabErrors, ReferencesTabValues } from "@/types/credit-application-form.types";
import { Card, ReferenceCard } from "./styles";

interface ReferencesTabProps {
  values: ReferencesTabValues;
  errors: ReferencesTabErrors;
  onFieldChange: (field: keyof Omit<ReferencesTabValues, "familyReferences">, value: string) => void;
  onReferenceFieldChange: (
    referenceId: string,
    field: "name" | "relationship" | "address" | "phone",
    value: string
  ) => void;
  onAddReference: () => void;
  onRemoveReference: (referenceId: string) => void;
  onSave: () => Promise<boolean>;
}

export function ReferencesTab({
  values,
  errors,
  onFieldChange,
  onReferenceFieldChange,
  onAddReference,
  onRemoveReference,
  onSave,
}: ReferencesTabProps) {
  return (
    <Card>
      <Typography variant="h5">Referencia laboral</Typography>
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
            label="Teléfono"
            placeholder="Ingresa"
            value={values.phone}
            onChange={(event) => onFieldChange("phone", event.target.value)}
            error={Boolean(errors.phone)}
            helperText={errors.phone}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <FormTextField
            fullWidth
            required
            label="Puesto del cliente"
            placeholder="Ingresa"
            value={values.clientPosition}
            onChange={(event) => onFieldChange("clientPosition", event.target.value)}
            error={Boolean(errors.clientPosition)}
            helperText={errors.clientPosition}
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
        <Grid size={{ xs: 12 }}>
          <FormTextField
            fullWidth
            required
            label="Persona que contestó y puesto"
            placeholder="Ingresa"
            value={values.respondentNameAndPosition}
            onChange={(event) => onFieldChange("respondentNameAndPosition", event.target.value)}
            error={Boolean(errors.respondentNameAndPosition)}
            helperText={errors.respondentNameAndPosition}
          />
        </Grid>
      </Grid>

      <Typography variant="h5">Referencias familiares</Typography>
      <Stack spacing={2} width="100%">
        {values.familyReferences.map((reference, index) => (
          <ReferenceCard key={reference.id}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Referencia {index + 1}</Typography>
              {values.familyReferences.length > 1 && (
                <IconButton onClick={() => onRemoveReference(reference.id)} size="small">
                  <Trash2 size={18} />
                </IconButton>
              )}
            </Stack>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 8 }}>
                <FormTextField
                  fullWidth
                  required
                  label="Nombre"
                  placeholder="Ingresa"
                  value={reference.name}
                  onChange={(event) => onReferenceFieldChange(reference.id, "name", event.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <FormTextField
                  fullWidth
                  required
                  label="Parentesco"
                  placeholder="Ingresa"
                  value={reference.relationship}
                  onChange={(event) => onReferenceFieldChange(reference.id, "relationship", event.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 8 }}>
                <FormTextField
                  fullWidth
                  required
                  label="Dirección"
                  placeholder="Ingresa"
                  value={reference.address}
                  onChange={(event) => onReferenceFieldChange(reference.id, "address", event.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <FormTextField
                  fullWidth
                  required
                  label="Teléfono"
                  placeholder="Ingresa"
                  value={reference.phone}
                  onChange={(event) => onReferenceFieldChange(reference.id, "phone", event.target.value)}
                />
              </Grid>
            </Grid>
          </ReferenceCard>
        ))}
      </Stack>

      <Button
        variant="outlined"
        style={{ alignSelf: "flex-start" }}
        startIcon={<Plus size={16} />}
        onClick={onAddReference}>
        Agregar otra
      </Button>

      <Button
        variant="contained"
        style={{ alignSelf: "flex-start" }}
        onClick={onSave}>
        Guardar
      </Button>
    </Card>
  );
}
