import { Grid } from "@mui/material";
import { FormTextField, FormSelect } from "@/components";
import {
    Section,
    SectionTitle,
    SectionDescription,
    RadioGroupContainer,
    StyledRadioGroup,
    StyledFormControlLabel,
} from "@/styles/catalogos/productos.styles";
import type { GeneralDataFormState, WarrantyType, FormErrors } from "@/types/productos.types";
import { Box } from "@mui/material";

// ============================================================================
// TYPES
// ============================================================================

interface GeneralDataTabProps {
    formState: GeneralDataFormState;
    errors: FormErrors;
    onFieldChange: (field: keyof GeneralDataFormState, value: string | WarrantyType) => void;
    onErrorClear: (field: string) => void;
    departments: Array<{ value: string; label: string }>;
    lines: Array<{ value: string; label: string }>;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function GeneralDataTab({
    formState,
    errors,
    onFieldChange,
    onErrorClear,
    departments,
    lines,
}: GeneralDataTabProps) {
    return (
        <Section>
            <SectionTitle>Datos generales</SectionTitle>
            <SectionDescription>
                Registra los básicos del artículo
            </SectionDescription>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <FormSelect
                        label="Departamento"
                        placeholder="Selecciona"
                        value={formState.departmentId}
                        onChange={(e) => {
                            onFieldChange("departmentId", String(e.target.value));
                            onErrorClear("departmentId");
                        }}
                        options={departments}
                        error={Boolean(errors.departmentId)}
                        helperText={errors.departmentId}
                        required
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <FormSelect
                        label="Línea"
                        placeholder="Selecciona"
                        value={formState.lineId}
                        onChange={(e) => {
                            onFieldChange("lineId", String(e.target.value));
                            onErrorClear("lineId");
                        }}
                        options={lines}
                        error={Boolean(errors.lineId)}
                        helperText={errors.lineId}
                        required
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <FormTextField
                        label="Código"
                        placeholder="-"
                        value={formState.code}
                        onChange={(e) => onFieldChange("code", e.target.value)}
                        disabled
                    />
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <FormTextField
                        label="Descripción del artículo"
                        placeholder="Ingresa"
                        value={formState.description}
                        onChange={(e) => {
                            onFieldChange("description", e.target.value);
                            onErrorClear("description");
                        }}
                        error={Boolean(errors.description)}
                        helperText={errors.description}
                        required
                        autoFocus
                    />
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <FormTextField
                        label="Nombre corto"
                        placeholder="Ingresa"
                        value={formState.shortName}
                        onChange={(e) => {
                            onFieldChange("shortName", e.target.value);
                            onErrorClear("shortName");
                        }}
                        error={Boolean(errors.shortName)}
                        helperText={errors.shortName}
                        required
                    />
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <SectionTitle sx={{ fontSize: "0.875rem", mb: 1 }}>
                        Garantía
                    </SectionTitle>
                    <SectionDescription sx={{ mb: 2 }}>
                        Selecciona el tipo de garantía
                    </SectionDescription>
                    <RadioGroupContainer>
                        <StyledRadioGroup>
                            <StyledFormControlLabel
                                value="months"
                                label="Meses"
                                checked={formState.warrantyType === "months"}
                                onChange={(e) => onFieldChange("warrantyType", e.target.value as WarrantyType)}
                            />
                            <StyledFormControlLabel
                                value="policy"
                                label="Póliza anexa"
                                checked={formState.warrantyType === "policy"}
                                onChange={(e) => onFieldChange("warrantyType", e.target.value as WarrantyType)}
                            />
                        </StyledRadioGroup>
                    </RadioGroupContainer>
                    {formState.warrantyType === "months" && (
                        <Box sx={{ mt: 2 }}>
                            <FormTextField
                                label="Meses de garantía"
                                placeholder="12"
                                type="number"
                                value={formState.warrantyMonths}
                                onChange={(e) => {
                                    onFieldChange("warrantyMonths", e.target.value);
                                    onErrorClear("warrantyMonths");
                                }}
                                error={Boolean(errors.warrantyMonths)}
                                helperText={errors.warrantyMonths}
                                required
                            />
                        </Box>
                    )}
                </Grid>
            </Grid>
        </Section>
    );
}
