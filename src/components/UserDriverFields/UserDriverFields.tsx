import { useEffect } from "react";
import { Grid, Typography } from "@mui/material";
import { FormTextField } from "@/components/Form";
import { PostalCodeSettlementFields } from "@/components/CreditApplicationForm/PostalCodeSettlementFields";
import { useNeighborhoodsByPostalCode } from "@/hooks/credit-applications/useNeighborhoodsByPostalCode";
import { ROLE_CODES } from "@/constants/role-codes";

export type DriverFormState = {
  licenseNumber: string;
  postalCode: string;
  neighborhoodFullCode: string;
  state: string;
  city: string;
  street: string;
  externalNumber: string;
  internalNumber: string;
};

export type DriverFormErrors = Partial<Record<keyof DriverFormState, string>>;

export const initialDriverForm: DriverFormState = {
  licenseNumber: "",
  postalCode: "",
  neighborhoodFullCode: "-1",
  state: "",
  city: "",
  street: "",
  externalNumber: "",
  internalNumber: "",
};

interface UserDriverFieldsProps {
  roleCode: string | undefined;
  values: DriverFormState;
  errors: DriverFormErrors;
  onFieldChange: <K extends keyof DriverFormState>(key: K, value: DriverFormState[K]) => void;
  onMergePatch: (patch: Partial<DriverFormState>) => void;
  disabled?: boolean;
}

export function UserDriverFields({
  roleCode,
  values,
  errors,
  onFieldChange,
  onMergePatch,
  disabled = false,
}: UserDriverFieldsProps) {
  const neighborhoodsQuery = useNeighborhoodsByPostalCode(values.postalCode);
  const showAddress = roleCode === ROLE_CODES.CHOFER;

  useEffect(() => {
    if (!showAddress) return;

    const neighborhoodFullCode = values.neighborhoodFullCode;
    if (!neighborhoodFullCode || neighborhoodFullCode === "-1") return;

    const row = neighborhoodsQuery.data?.find(
      (item) => item.full_code === neighborhoodFullCode,
    );
    if (!row) return;

    const nextState = row.state_name ?? "";
    const nextCity = row.municipality_name ?? "";
    if (values.state === nextState && values.city === nextCity) return;

    onMergePatch({ state: nextState, city: nextCity });
  }, [
    showAddress,
    values.neighborhoodFullCode,
    values.state,
    values.city,
    neighborhoodsQuery.data,
    onMergePatch,
  ]);

  if (!roleCode || (roleCode !== ROLE_CODES.CHOFER && roleCode !== ROLE_CODES.AYUDANTE_CHOFER)) {
    return null;
  }

  return (
    <>
      <Typography variant="subtitle2" fontWeight={600}>
        {roleCode === ROLE_CODES.CHOFER ? "Datos de chofer" : "Datos de ayudante chofer"}
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormTextField
            label="Licencia"
            placeholder="10 caracteres alfanuméricos"
            required
            value={values.licenseNumber}
            onChange={(event) =>
              onFieldChange(
                "licenseNumber",
                event.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 10),
              )
            }
            error={Boolean(errors.licenseNumber)}
            helperText={errors.licenseNumber || "Solo letras y números, en mayúsculas"}
            inputProps={{ maxLength: 10 }}
            disabled={disabled}
          />
        </Grid>
        {showAddress && (
          <>
            <PostalCodeSettlementFields
              postalCode={values.postalCode}
              neighborhoodFullCode={values.neighborhoodFullCode}
              postalCodeError={errors.postalCode}
              neighborhoodError={errors.neighborhoodFullCode}
              neighborhoods={neighborhoodsQuery.data ?? []}
              neighborhoodsLoading={neighborhoodsQuery.isFetching}
              disabled={disabled}
              fieldKeys={{
                postalCode: "postalCode",
                neighborhoodFullCode: "neighborhoodFullCode",
                state: "state",
                city: "city",
              }}
              mergePatch={(patch) => onMergePatch(patch as Partial<DriverFormState>)}
            />
            <Grid size={{ xs: 12, md: 6 }}>
              <FormTextField
                fullWidth
                label="Estado"
                value={values.state}
                disabled
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormTextField
                fullWidth
                label="Ciudad"
                value={values.city}
                disabled
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormTextField
                fullWidth
                required
                label="Calle"
                placeholder="Ej. Av. Revolución"
                value={values.street}
                onChange={(event) => onFieldChange("street", event.target.value)}
                error={Boolean(errors.street)}
                helperText={errors.street}
                disabled={disabled}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormTextField
                fullWidth
                required
                label="Número exterior"
                placeholder="Ej. 742"
                value={values.externalNumber}
                onChange={(event) => onFieldChange("externalNumber", event.target.value)}
                error={Boolean(errors.externalNumber)}
                helperText={errors.externalNumber}
                disabled={disabled}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormTextField
                fullWidth
                label="Número interior"
                value={values.internalNumber}
                onChange={(event) => onFieldChange("internalNumber", event.target.value)}
                disabled={disabled}
              />
            </Grid>
          </>
        )}
      </Grid>
    </>
  );
}
