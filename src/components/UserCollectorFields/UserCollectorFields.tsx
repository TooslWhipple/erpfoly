import { Grid, Typography } from "@mui/material";
import { FormTextField } from "@/components/Form";
import { filters } from "@/forms/validation/filters";
import { isCollectorRoleCode } from "@/constants/role-codes";

export type CollectorFormState = {
  maxNegotiationPercent: string;
};

export type CollectorFormErrors = Partial<Record<keyof CollectorFormState, string>>;

export const initialCollectorForm: CollectorFormState = {
  maxNegotiationPercent: "",
};

const percentFilter = filters.decimal(2, 3);

interface UserCollectorFieldsProps {
  roleCode: string | undefined;
  values: CollectorFormState;
  errors: CollectorFormErrors;
  onFieldChange: <K extends keyof CollectorFormState>(
    key: K,
    value: CollectorFormState[K],
  ) => void;
  disabled?: boolean;
}

export function UserCollectorFields({
  roleCode,
  values,
  errors,
  onFieldChange,
  disabled = false,
}: UserCollectorFieldsProps) {
  if (!isCollectorRoleCode(roleCode)) {
    return null;
  }

  return (
    <>
      <Typography variant="subtitle2" fontWeight={600}>
        Datos de cobranza externa
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormTextField
            label="Tope de negociación (%)"
            placeholder="Ej. 30"
            required
            value={values.maxNegotiationPercent}
            onChange={(event) =>
              onFieldChange("maxNegotiationPercent", percentFilter(event.target.value))
            }
            error={Boolean(errors.maxNegotiationPercent)}
            helperText={
              errors.maxNegotiationPercent ||
              "Porcentaje máximo de descuento sobre la mora que puede negociar (0 a 100)"
            }
            disabled={disabled}
          />
        </Grid>
      </Grid>
    </>
  );
}
