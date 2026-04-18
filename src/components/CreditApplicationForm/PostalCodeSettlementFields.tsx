import { Grid, MenuItem } from "@mui/material";
import { FormTextField } from "@/components/Form";
import type { NeighborhoodPostalLookupItem } from "@/services/address.service";
import { sanitizeMxPostalCodeInput } from "@/forms/validation/schemas";

export type PostalSettlementFieldKeys = {
  postalCode: string;
  neighborhoodFullCode: string;
  state: string;
  city: string;
};

interface PostalCodeSettlementFieldsProps {
  postalCode: string;
  neighborhoodFullCode: string;
  postalCodeError?: string;
  neighborhoodError?: string;
  neighborhoods: NeighborhoodPostalLookupItem[];
  neighborhoodsLoading: boolean;
  disabled?: boolean;
  fieldKeys: PostalSettlementFieldKeys;
  mergePatch: (patch: Record<string, string>) => void;
}

export function PostalCodeSettlementFields({
  postalCode,
  neighborhoodFullCode,
  postalCodeError,
  neighborhoodError,
  neighborhoods,
  neighborhoodsLoading,
  disabled = false,
  fieldKeys,
  mergePatch,
}: PostalCodeSettlementFieldsProps) {
  const postalKey = fieldKeys.postalCode;
  const neighborhoodKey = fieldKeys.neighborhoodFullCode;
  const stateKey = fieldKeys.state;
  const cityKey = fieldKeys.city;

  const handlePostalChange = (raw: string) => {
    if (disabled) return;
    const sanitized = sanitizeMxPostalCodeInput(raw);
    if (sanitized !== postalCode) {
      mergePatch({
        [postalKey]: sanitized,
        [neighborhoodKey]: "-1",
        [stateKey]: "",
        [cityKey]: "",
      });
    } else {
      mergePatch({ [postalKey]: sanitized });
    }
  };

  const handleNeighborhoodChange = (fullCode: string) => {
    if (disabled) return;
    const row = neighborhoods.find((item) => item.full_code === fullCode);
    mergePatch({
      [neighborhoodKey]: fullCode,
      [stateKey]: row?.state_name ?? "",
      [cityKey]: row?.municipality_name ?? "",
    });
  };

  const postalReady = postalCode.trim().length === 5;
  const showNoResults = postalReady && !neighborhoodsLoading && neighborhoods.length === 0;

  return (
    <>
      <Grid size={{ xs: 12, md: 6 }}>
        <FormTextField
          fullWidth
          required
          label="Código postal"
          placeholder="5 dígitos"
          value={postalCode}
          onChange={(event) => handlePostalChange(event.target.value)}
          error={Boolean(postalCodeError)}
          helperText={postalCodeError}
          inputProps={{ inputMode: "numeric", maxLength: 5 }}
          disabled={disabled}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <FormTextField
          fullWidth
          required
          select
          defaultValue="-1"
          label="Colonia"
          value={neighborhoodFullCode}
          onChange={(event) => handleNeighborhoodChange(event.target.value)}
          error={Boolean(neighborhoodError)}
          helperText={
            neighborhoodError ??
            (showNoResults ? "No hay colonias para este código postal." : undefined)
          }
          disabled={disabled || !postalReady || neighborhoodsLoading}
        >
          <MenuItem value="-1">
            {
              neighborhoodsLoading ? "Cargando..." : postalReady ? "Selecciona una colonia" : "Ingresa el código postal"
            }
          </MenuItem>
          {neighborhoods.map((row) => (
            <MenuItem key={row.full_code} value={row.full_code}>
              {row.name}
            </MenuItem>
          ))}
        </FormTextField>
      </Grid>
    </>
  );
}
