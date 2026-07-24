import { useEffect, useMemo } from "react";
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
  state?: string;
  city?: string;
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
  state = "",
  city = "",
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
  const showNoResults =
    postalReady && !neighborhoodsLoading && neighborhoods.length === 0;

  const formCode = neighborhoodFullCode.trim() || "-1";
  // MUI Select must only bind to a value that exists in MenuItem options.
  const selectValue = useMemo(() => {
    if (formCode === "-1") return "-1";
    if (neighborhoods.some((row) => row.full_code === formCode)) {
      return formCode;
    }
    return "-1";
  }, [formCode, neighborhoods]);

  // When async options resolve, sync estado/ciudad from the matched colonia.
  useEffect(() => {
    if (neighborhoodsLoading || formCode === "-1") return;
    const row = neighborhoods.find((item) => item.full_code === formCode);
    if (!row) return;
    if (state === row.state_name && city === row.municipality_name) return;
    mergePatch({
      [stateKey]: row.state_name,
      [cityKey]: row.municipality_name,
    });
  }, [
    city,
    cityKey,
    formCode,
    mergePatch,
    neighborhoods,
    neighborhoodsLoading,
    state,
    stateKey,
  ]);

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
          label="Colonia"
          value={selectValue}
          onChange={(event) => handleNeighborhoodChange(event.target.value)}
          error={Boolean(neighborhoodError)}
          helperText={
            neighborhoodError ??
            (showNoResults
              ? "No hay colonias para este código postal."
              : undefined)
          }
          disabled={disabled || !postalReady || neighborhoodsLoading}
        >
          <MenuItem value="-1">
            {neighborhoodsLoading
              ? "Cargando..."
              : postalReady
                ? "Selecciona una colonia"
                : "Ingresa el código postal"}
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
