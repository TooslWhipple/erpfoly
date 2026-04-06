import { Button, Grid, MenuItem, Stack, Switch, Typography } from "@mui/material";
import { FormTextField } from "@/components/Form";
import { FileUpload } from "@/components/FileUpload";
import type { UploadedFileItem } from "@/components/FileUpload";
import type {
  CreditApplicationDocumentFile,
  GuarantorTabErrors,
  GuarantorTabValues,
} from "@/types/credit-application-form.types";
import { Card } from "./styles";

interface GuarantorTabProps {
  values: GuarantorTabValues;
  errors: GuarantorTabErrors;
  onFieldChange: (field: keyof GuarantorTabValues, value: GuarantorTabValues[keyof GuarantorTabValues]) => void;
  onSave: () => Promise<boolean>;
}

const MARITAL_STATUS_OPTIONS = ["Selecciona una opción", "Soltero", "Casado", "Divorciado", "Viudo", "Unión libre"];

export function GuarantorTab({ values, errors, onFieldChange, onSave }: GuarantorTabProps) {
  const mapStoredToUploadItems = (files: CreditApplicationDocumentFile[]): UploadedFileItem[] =>
    files.map((file) => ({
      id: file.id,
      name: file.name,
      url: file.url,
      uploadedAt: file.uploadedAt,
    }));

  const mapUploadToStoredItems = (files: UploadedFileItem[]): CreditApplicationDocumentFile[] =>
    files.map((file) => ({
      id: file.id,
      name: file.name,
      url: file.url,
      uploadedAt: file.uploadedAt,
    }));

  return (
    <Card>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <FormTextField
            fullWidth
            required
            label="Nombre completo"
            placeholder="Ingresa"
            value={values.fullName}
            onChange={(event) => onFieldChange("fullName", event.target.value)}
            error={Boolean(errors.fullName)}
            helperText={errors.fullName}
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

        <Grid size={{ xs: 12 }}>
          <FormTextField
            fullWidth
            required
            label="Entre calles"
            placeholder="Ingresa"
            value={values.betweenStreets}
            onChange={(event) => onFieldChange("betweenStreets", event.target.value)}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormTextField
            fullWidth
            required
            label="Fecha de Nacimiento"
            placeholder="Selecciona"
            type="date"
            value={values.birthDate}
            onChange={(event) => onFieldChange("birthDate", event.target.value)}
            error={Boolean(errors.birthDate)}
            helperText={errors.birthDate}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormTextField
            fullWidth
            required
            label="Estado Civil"
            defaultValue={MARITAL_STATUS_OPTIONS[0]}
            select
            value={values.maritalStatus}
            onChange={(event) => onFieldChange("maritalStatus", event.target.value)}
            error={Boolean(errors.maritalStatus)}
            helperText={errors.maritalStatus}
          >
            {
              MARITAL_STATUS_OPTIONS.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))
            }
          </FormTextField>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormTextField
            fullWidth
            required
            label="CURP"
            placeholder="Ingresa"
            value={values.curp}
            onChange={(event) => onFieldChange("curp", event.target.value)}
            error={Boolean(errors.curp)}
            helperText={errors.curp}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormTextField
            fullWidth
            required
            label="RFC"
            placeholder="Ingresa"
            value={values.rfc}
            onChange={(event) => onFieldChange("rfc", event.target.value)}
            error={Boolean(errors.rfc)}
            helperText={errors.rfc}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
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

        <Grid size={{ xs: 12, md: 6 }}>
          <FileUpload
            value={mapStoredToUploadItems(values.identificationFrontFiles)}
            onChange={(files) => onFieldChange("identificationFrontFiles", mapUploadToStoredItems(files))}
            placeholder="INE frontal del aval"
            accept={["image/*", "image/jpeg", "image/png", "image/webp"]}
            error={errors.identificationFrontFiles}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FileUpload
            value={mapStoredToUploadItems(values.identificationBackFiles)}
            onChange={(files) => onFieldChange("identificationBackFiles", mapUploadToStoredItems(files))}
            placeholder="INE posterior del aval"
            accept={["image/*", "image/jpeg", "image/png", "image/webp"]}
            error={errors.identificationBackFiles}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Switch
              checked={values.hasSpouse}
              onChange={(event) => onFieldChange("hasSpouse", event.target.checked)}
            />
            <Typography variant="body1">¿Cuenta con cónyuge?</Typography>
          </Stack>
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
