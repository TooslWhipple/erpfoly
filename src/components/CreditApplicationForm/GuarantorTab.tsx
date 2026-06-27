import { Button, CircularProgress, Grid, MenuItem, Stack, Switch, Typography } from "@mui/material";
import { FormDatePicker, FormTextField } from "@/components/Form";
import { FileUpload } from "@/components/FileUpload";
import type { UploadedFileItem } from "@/components/FileUpload";
import { useNeighborhoodsByPostalCode } from "@/hooks/credit-applications/useNeighborhoodsByPostalCode";
import type { MaritalStatusCatalogItem } from "@/services/catalog.service";
import type {
  CreditApplicationDocumentFile,
  GuarantorTabErrors,
  GuarantorTabValues,
} from "@/types/credit-application-form.types";
import { Card } from "./styles";
import { PostalCodeSettlementFields } from "./PostalCodeSettlementFields";
import { StreetAddressFields } from "./StreetAddressFields";

interface GuarantorTabProps {
  values: GuarantorTabValues;
  errors: GuarantorTabErrors;
  maritalStatusOptions: MaritalStatusCatalogItem[];
  maritalStatusesLoading: boolean;
  mergeFieldValues: (patch: Partial<GuarantorTabValues>) => GuarantorTabValues;
  onFieldChange: (field: keyof GuarantorTabValues, value: GuarantorTabValues[keyof GuarantorTabValues]) => void;
  onSave: () => Promise<boolean>;
  saving: boolean;
}

export function GuarantorTab({
  values,
  errors,
  maritalStatusOptions,
  maritalStatusesLoading,
  mergeFieldValues,
  onFieldChange,
  onSave,
  saving,
}: GuarantorTabProps) {
  const neighborhoodsQuery = useNeighborhoodsByPostalCode(values.postalCode);
  const mapStoredToUploadItems = (files: CreditApplicationDocumentFile[]): UploadedFileItem[] =>
    files.map((file) => ({
      id: file.id,
      name: file.name,
      file: file.file,
      url: file.url,
      uploadedAt: file.uploadedAt,
    }));

  const mapUploadToStoredItems = (files: UploadedFileItem[]): CreditApplicationDocumentFile[] =>
    files.map((file) => ({
      id: file.id,
      name: file.name,
      file: file.file,
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
            disabled={saving}
            inputProps={{ maxLength: 64 }}
          />
        </Grid>

        <PostalCodeSettlementFields
          postalCode={values.postalCode}
          neighborhoodFullCode={values.neighborhoodFullCode}
          postalCodeError={errors.postalCode}
          neighborhoodError={errors.neighborhoodFullCode}
          neighborhoods={neighborhoodsQuery.data ?? []}
          neighborhoodsLoading={neighborhoodsQuery.isFetching}
          fieldKeys={{
            postalCode: "postalCode",
            neighborhoodFullCode: "neighborhoodFullCode",
            state: "state",
            city: "city",
          }}
          mergePatch={(patch) => {
            mergeFieldValues(patch as Partial<GuarantorTabValues>);
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

        <Grid size={{ xs: 12 }}>
          <FormTextField
            fullWidth
            required
            label="Entre calles"
            placeholder="Ingresa"
            value={values.betweenStreets}
            onChange={(event) => onFieldChange("betweenStreets", event.target.value)}
            error={Boolean(errors.betweenStreets)}
            helperText={errors.betweenStreets}
            disabled={saving}
            inputProps={{ maxLength: 128 }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormDatePicker
            fullWidth
            required
            openTo="year"
            views={["year", "month", "day"]}
            label="Fecha de Nacimiento"
            placeholder="Selecciona"
            value={values.birthDate}
            onChange={(nextValue) => onFieldChange("birthDate", nextValue)}
            error={Boolean(errors.birthDate)}
            helperText={errors.birthDate}
            disabled={saving}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField
            fullWidth
            required
            label="Estado civil"
            select
            value={values.maritalStatus}
            onChange={(event) => onFieldChange("maritalStatus", event.target.value)}
            error={Boolean(errors.maritalStatus)}
            helperText={errors.maritalStatus}
            disabled={maritalStatusesLoading || saving}
          >
            <MenuItem value="">
              {maritalStatusesLoading ? "Cargando..." : "Selecciona"}
            </MenuItem>
            {maritalStatusOptions.map((item) => (
              <MenuItem key={item.id} value={String(item.id)}>
                {item.name}
              </MenuItem>
            ))}
          </FormTextField>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField
            fullWidth
            required
            label="CURP"
            placeholder="Ingresa"
            value={values.curp}
            onChange={(event) => onFieldChange("curp", event.target.value.toUpperCase())}
            error={Boolean(errors.curp)}
            helperText={errors.curp}
            disabled={saving}
            inputProps={{ maxLength: 18 }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField
            fullWidth
            required
            label="RFC"
            placeholder="Ingresa"
            value={values.rfc}
            onChange={(event) => onFieldChange("rfc", event.target.value.toUpperCase())}
            error={Boolean(errors.rfc)}
            helperText={errors.rfc}
            disabled={saving}
            inputProps={{ maxLength: 13 }}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <FormTextField
            fullWidth
            required
            label="Teléfono"
            placeholder="Ingresa"
            value={values.phone}
            onChange={(event) => onFieldChange("phone", event.target.value.replace(/\D/g, '').slice(0, 10))}
            error={Boolean(errors.phone)}
            helperText={errors.phone}
            disabled={saving}
            inputProps={{ maxLength: 10, inputMode: 'numeric', pattern: '[0-9]*' }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FileUpload
            value={mapStoredToUploadItems(values.identificationFrontFiles)}
            onChange={(files) => onFieldChange("identificationFrontFiles", mapUploadToStoredItems(files))}
            placeholder="INE frontal del aval"
            fileLabel="INE frontal del aval"
            disabled={saving}
            accept={["image/*", "image/jpeg", "image/png", "image/webp"]}
            error={errors.identificationFrontFiles}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FileUpload
            value={mapStoredToUploadItems(values.identificationBackFiles)}
            onChange={(files) => onFieldChange("identificationBackFiles", mapUploadToStoredItems(files))}
            placeholder="INE posterior del aval"
            fileLabel="INE posterior del aval"
            disabled={saving}
            accept={["image/*", "image/jpeg", "image/png", "image/webp"]}
            error={errors.identificationBackFiles}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Switch
              checked={values.hasSpouse}
              onChange={(event) => onFieldChange("hasSpouse", event.target.checked)}
              disabled={saving}
            />
            <Typography variant="body1">¿Cuenta con cónyuge?</Typography>
          </Stack>
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
