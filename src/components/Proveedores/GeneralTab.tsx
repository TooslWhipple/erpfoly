import { Grid, Radio } from "@mui/material";
import { FormTextField } from "@/components";
import { AccountingAccountSearchField } from "@/components/AccountingAccountSearchField";
import {
    FormCard,
    RadioGroupContainer,
    RadioLabel,
    StyledRadioGroup,
    StyledFormControlLabel,
} from "@/styles/catalogos/proveedores.styles";
import { SUPPLIER_TEXT_MAX_LENGTH } from "@/hooks/proveedores/supplierForm.constants";
import type { GeneralFormValues } from "@/types/proveedores.types";

export interface GeneralTabProps {
    values: GeneralFormValues;
    errors: Record<string, string>;
    onFieldChange: (field: keyof GeneralFormValues, value: string) => void;
}

export function GeneralTab({ values, errors, onFieldChange }: GeneralTabProps) {
    const handleChange = (field: keyof GeneralFormValues) => (value: string) => {
        onFieldChange(field, value);
    };

    return (
        <FormCard>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                    <FormTextField
                        label="Nombre"
                        placeholder="Ingresa..."
                        value={values.name}
                        onChange={(e) => handleChange("name")(e.target.value)}
                        error={Boolean(errors.name)}
                        helperText={errors.name}
                        required
                        autoFocus
                        inputProps={{ maxLength: SUPPLIER_TEXT_MAX_LENGTH }}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <FormTextField
                        label="Razón social"
                        placeholder="Ingresa..."
                        value={values.businessName}
                        onChange={(e) => handleChange("businessName")(e.target.value)}
                        error={Boolean(errors.businessName)}
                        helperText={errors.businessName}
                        required
                        inputProps={{ maxLength: SUPPLIER_TEXT_MAX_LENGTH }}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <FormTextField
                        label="RFC"
                        placeholder="Ingresa..."
                        value={values.rfc}
                        onChange={(e) => handleChange("rfc")(e.target.value)}
                        error={Boolean(errors.rfc)}
                        helperText={errors.rfc}
                        required
                        inputProps={{ maxLength: 13 }}
                    />
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <FormTextField
                        label="Página web"
                        placeholder="https://..."
                        value={values.website}
                        onChange={(e) => handleChange("website")(e.target.value)}
                        error={Boolean(errors.website)}
                        helperText={errors.website}
                    />
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <FormTextField
                        label="Email"
                        placeholder="Ingresa..."
                        type="email"
                        value={values.email}
                        onChange={(e) => handleChange("email")(e.target.value)}
                        error={Boolean(errors.email)}
                        helperText={errors.email}
                    />
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <RadioGroupContainer>
                        <RadioLabel>Tipo:</RadioLabel>
                        <StyledRadioGroup
                            value={values.type}
                            onChange={(e) =>
                                handleChange("type")(e.target.value as "nacional" | "extranjera")
                            }
                        >
                            <StyledFormControlLabel
                                value="nacional"
                                control={<Radio size="small" />}
                                label="Nacional"
                            />
                            <StyledFormControlLabel
                                value="extranjera"
                                control={<Radio size="small" />}
                                label="Extranjera"
                            />
                        </StyledRadioGroup>
                    </RadioGroupContainer>
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <FormTextField
                        label="Plazo de pagos (días)"
                        placeholder="Ingresa..."
                        type="number"
                        value={values.paymentTerm}
                        onChange={(e) => handleChange("paymentTerm")(e.target.value)}
                        error={Boolean(errors.paymentTerm)}
                        helperText={errors.paymentTerm}
                        required
                    />
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <RadioGroupContainer>
                        <RadioLabel>Flete:</RadioLabel>
                        <StyledRadioGroup
                            value={values.freight}
                            onChange={(e) =>
                                handleChange("freight")(e.target.value as "pagado" | "cobrar")
                            }
                        >
                            <StyledFormControlLabel
                                value="pagado"
                                control={<Radio size="small" />}
                                label="Pagado"
                            />
                            <StyledFormControlLabel
                                value="cobrar"
                                control={<Radio size="small" />}
                                label="Cobrar"
                            />
                        </StyledRadioGroup>
                    </RadioGroupContainer>
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <AccountingAccountSearchField
                        label="Cuenta contable"
                        placeholder="Buscar cuenta contable (contabilidad.cuentas)..."
                        value={values.accountingAccount}
                        onChange={handleChange("accountingAccount")}
                        error={Boolean(errors.accountingAccount)}
                        helperText={errors.accountingAccount}
                    />
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <FormTextField
                        label="Observaciones"
                        placeholder="Ingresa observaciones..."
                        value={values.observations}
                        onChange={(e) => handleChange("observations")(e.target.value)}
                        error={Boolean(errors.observations)}
                        helperText={errors.observations}
                        multiline
                        rows={4}
                        fullWidth
                    />
                </Grid>
            </Grid>
        </FormCard>
    );
}
