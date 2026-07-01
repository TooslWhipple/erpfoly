import { Grid } from "@mui/material";
import { FormTextField } from "@/components/Form";

export interface StreetAddressFieldErrors {
  street?: string;
  externalNumber?: string;
  internalNumber?: string;
}

interface StreetAddressFieldsProps<TStreetKey extends string> {
  street: string;
  externalNumber: string;
  internalNumber: string;
  fieldKeys: {
    street: TStreetKey;
    externalNumber: TStreetKey;
    internalNumber: TStreetKey;
  };
  errors?: StreetAddressFieldErrors;
  onFieldChange: (field: TStreetKey, value: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
}

export function StreetAddressFields<TStreetKey extends string>({
  street,
  externalNumber,
  internalNumber,
  fieldKeys,
  errors,
  onFieldChange,
  disabled = false,
  readOnly = false,
  required = true,
}: StreetAddressFieldsProps<TStreetKey>) {
  return (
    <>
      <Grid size={{ xs: 12, md: 6 }}>
        <FormTextField
          fullWidth
          required={required && !readOnly}
          readOnly={readOnly}
          label="Calle"
          placeholder="Ej. Av. Revolución"
          value={street}
          onChange={(event) => onFieldChange(fieldKeys.street, event.target.value)}
          error={Boolean(errors?.street)}
          helperText={errors?.street}
          disabled={disabled}
          inputProps={{ maxLength: 256 }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <FormTextField
          fullWidth
          required={required && !readOnly}
          readOnly={readOnly}
          label="Número exterior"
          placeholder="Ej. 742"
          value={externalNumber}
          onChange={(event) => onFieldChange(fieldKeys.externalNumber, event.target.value)}
          error={Boolean(errors?.externalNumber)}
          helperText={errors?.externalNumber}
          disabled={disabled}
          inputProps={{ maxLength: 32 }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <FormTextField
          fullWidth
          readOnly={readOnly}
          label="Número interior"
          placeholder="Opcional"
          value={internalNumber}
          onChange={(event) => onFieldChange(fieldKeys.internalNumber, event.target.value)}
          error={Boolean(errors?.internalNumber)}
          helperText={errors?.internalNumber}
          disabled={disabled}
          inputProps={{ maxLength: 32 }}
        />
      </Grid>
    </>
  );
}
