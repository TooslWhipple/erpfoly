import { styled } from "@mui/material/styles";
import { Box, Grid, Radio, Switch, Button, Divider } from "@mui/material";
import { FormTextField } from "@/components";
import { Section, SectionTitle, SectionDescription, StyledRadioGroup, StyledFormControlLabel } from "@/styles/catalogos/productos.styles";
import type { PromotionFormState, FormErrors, PromotionApplicationType, PromotionMonth, PromotionDay } from "../types";

// ============================================================================
// TYPES
// ============================================================================

interface ConfigurationTabProps {
    formState: PromotionFormState;
    errors: FormErrors;
    onFieldChange: (field: keyof PromotionFormState, value: any) => void;
    onErrorClear: (field: string) => void;
}

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const MonthButton = styled(Button)<{ selected?: boolean }>(({ theme, selected }) => ({
    minWidth: 48,
    height: 36,
    fontSize: "0.875rem",
    fontWeight: selected ? 600 : 400,
    backgroundColor: selected ? theme.palette.primary.main : "transparent",
    color: selected ? theme.palette.primary.contrastText : theme.palette.text.primary,
    border: `1px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
    "&:hover": {
        backgroundColor: selected ? theme.palette.primary.dark : theme.palette.action.hover,
    },
}));

const DayButton = styled(Button)<{ selected?: boolean }>(({ theme, selected }) => ({
    minWidth: 60,
    height: 36,
    fontSize: "0.875rem",
    fontWeight: selected ? 600 : 400,
    backgroundColor: selected ? theme.palette.primary.main : "transparent",
    color: selected ? theme.palette.primary.contrastText : theme.palette.text.primary,
    border: `1px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
    borderRadius: 8,
    "&:hover": {
        backgroundColor: selected ? theme.palette.primary.dark : theme.palette.action.hover,
    },
}));

const SwitchContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(2),
}));

// ============================================================================
// COMPONENT
// ============================================================================

export function ConfigurationTab({
    formState,
    errors,
    onFieldChange,
    onErrorClear,
}: ConfigurationTabProps) {
    const handleApplicationTypeChange = (type: PromotionApplicationType) => {
        onFieldChange("applicationType", type);
        if (errors.applicationType) {
            onErrorClear("applicationType");
        }
    };

    const handleMonthToggle = (month: PromotionMonth) => {
        const currentMonths = formState.months || [];
        const isSelected = currentMonths.includes(month);
        const newMonths = isSelected
            ? currentMonths.filter((m) => m !== month)
            : [...currentMonths, month];
        onFieldChange("months", newMonths);
    };

    const handleDayToggle = (day: PromotionDay) => {
        const currentDays = formState.days || [];
        const isSelected = currentDays.includes(day);
        const newDays = isSelected
            ? currentDays.filter((d) => d !== day)
            : [...currentDays, day];
        onFieldChange("days", newDays);
    };

    const handleClientLevelChange = (level: number, field: "level" | "advancePercentage", value: number | string) => {
        const currentLevels = [...formState.clientLevels];
        const levelIndex = currentLevels.findIndex((l) => l.level === level);

        if (levelIndex >= 0) {
            const updatedLevel = {
                ...currentLevels[levelIndex],
                [field]: field === "advancePercentage" ? Number(value) : value,
            };
            currentLevels[levelIndex] = updatedLevel;
        } else {
            currentLevels.push({
                level,
                advancePercentage: field === "advancePercentage" ? Number(value) : 0,
            });
        }

        onFieldChange("clientLevels", currentLevels);
    };

    const handleEndDateToggle = (checked: boolean) => {
        onFieldChange("hasEndDate", checked);
        if (!checked) {
            onFieldChange("endDate", null);
        }
    };

    return (
        <Box>
            {/* Promotion Configuration Section */}
            <Section>
                <SectionTitle>Configuraciones de la promoción</SectionTitle>
                <SectionDescription>
                    Ingresa un nombre y porcentaje para tu nueva promoción.
                </SectionDescription>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <FormTextField
                            label="Nombre"
                            value={formState.name}
                            onChange={(e) => {
                                onFieldChange("name", e.target.value);
                                if (errors.name) onErrorClear("name");
                            }}
                            error={Boolean(errors.name)}
                            helperText={errors.name}
                            placeholder="Ej. Buen fin"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <FormTextField
                            label="Porcentaje"
                            value={formState.percentage}
                            onChange={(e) => {
                                onFieldChange("percentage", e.target.value);
                                if (errors.percentage) onErrorClear("percentage");
                            }}
                            error={Boolean(errors.percentage)}
                            helperText={errors.percentage}
                            placeholder="15%"
                            InputProps={{
                                endAdornment: <Box component="span" sx={{ color: "text.secondary" }}>%</Box>,
                            }}
                        />
                    </Grid>
                </Grid>
            </Section>

            {/* Application Section */}
            <Section>
                <SectionTitle>Aplicación</SectionTitle>
                <SectionDescription>
                    Selecciona a qué tipo de venta se aplicará la promoción.
                </SectionDescription>
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12 }}>
                        <Box>
                            <Box sx={{ mb: 2, fontSize: "0.875rem", fontWeight: 500 }}>
                                Aplicación
                            </Box>
                            <StyledRadioGroup
                                value={formState.applicationType}
                                onChange={(e) => handleApplicationTypeChange(e.target.value as PromotionApplicationType)}
                            >
                                <StyledFormControlLabel
                                    value="Crédito"
                                    control={<Radio />}
                                    label="Crédito"
                                    checked={formState.applicationType === "Crédito"}
                                />
                                <StyledFormControlLabel
                                    value="Contado"
                                    control={<Radio />}
                                    label="Contado"
                                    checked={formState.applicationType === "Contado"}
                                />
                                <StyledFormControlLabel
                                    value="Apartados"
                                    control={<Radio />}
                                    label="Apartados"
                                    checked={formState.applicationType === "Apartados"}
                                />
                            </StyledRadioGroup>
                        </Box>
                    </Grid>
                    {formState.applicationType === "Crédito" && (
                        <Grid size={{ xs: 12 }}>
                            <Box>
                                <Box sx={{ mb: 2, fontSize: "0.875rem", fontWeight: 500 }}>
                                    Meses
                                </Box>
                                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                                    {([3, 6, 9, 12, 18, 24] as PromotionMonth[]).map((month) => (
                                        <MonthButton
                                            key={month}
                                            variant={formState.months?.includes(month) ? "contained" : "outlined"}
                                            onClick={() => handleMonthToggle(month)}
                                            selected={formState.months?.includes(month)}
                                        >
                                            {month}
                                        </MonthButton>
                                    ))}
                                </Box>
                            </Box>
                        </Grid>
                    )}
                    {formState.applicationType === "Apartados" && (
                        <Grid size={{ xs: 12 }}>
                            <Box>
                                <Box sx={{ mb: 2, fontSize: "0.875rem", fontWeight: 500 }}>
                                    Días
                                </Box>
                                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                                    {([30, 45, 60] as PromotionDay[]).map((day) => (
                                        <DayButton
                                            key={day}
                                            variant={formState.days?.includes(day) ? "contained" : "outlined"}
                                            onClick={() => handleDayToggle(day)}
                                            selected={formState.days?.includes(day)}
                                        >
                                            {day}
                                        </DayButton>
                                    ))}
                                </Box>
                            </Box>
                        </Grid>
                    )}
                </Grid>
            </Section>

            {/* Client Level Advance Section */}
            {(formState.applicationType === "Crédito" || formState.applicationType === "Apartados") && (
                <Section>
                    <SectionTitle>Anticipo por nivel de cliente</SectionTitle>
                    <SectionDescription>
                        Configure el porcentaje de anticipo que se aplicará a cada nivel de cliente.
                    </SectionDescription>
                    <Grid container spacing={2}>
                        {[1, 2, 3].map((level) => {
                            const levelData = formState.clientLevels.find((l) => l.level === level) || {
                                level,
                                advancePercentage: 0,
                            };
                            return (
                                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={level}>
                                    <FormTextField
                                        label={`Nivel ${level}`}
                                        value={levelData.advancePercentage.toString()}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value === "" || /^\d+$/.test(value)) {
                                                handleClientLevelChange(level, "advancePercentage", value || "0");
                                            }
                                        }}
                                        placeholder="0"
                                        InputProps={{
                                            endAdornment: <Box component="span" sx={{ color: "text.secondary" }}>%</Box>,
                                        }}
                                    />
                                </Grid>
                            );
                        })}
                    </Grid>
                </Section>
            )}

            {/* Validity Period Section */}
            <Section>
                <SectionTitle>Periodo de vigencia</SectionTitle>
                <SectionDescription>
                    Define el periodo de vigencia para la promoción.
                </SectionDescription>
                <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, sm: 5 }}>
                        <FormTextField
                            label="Fecha de inicio"
                            type="date"
                            value={formState.startDate}
                            onChange={(e) => {
                                onFieldChange("startDate", e.target.value);
                                if (errors.startDate) onErrorClear("startDate");
                            }}
                            error={Boolean(errors.startDate)}
                            helperText={errors.startDate}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 2 }}>
                        <SwitchContainer>
                            <Switch
                                checked={formState.hasEndDate}
                                onChange={(e) => handleEndDateToggle(e.target.checked)}
                            />
                        </SwitchContainer>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 5 }}>
                        <FormTextField
                            label="Fecha de fin"
                            type="date"
                            value={formState.endDate || ""}
                            onChange={(e) => {
                                onFieldChange("endDate", e.target.value);
                                if (errors.endDate) onErrorClear("endDate");
                            }}
                            error={Boolean(errors.endDate)}
                            helperText={errors.endDate}
                            disabled={!formState.hasEndDate}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </Grid>
                </Grid>
            </Section>
        </Box>
    );
}
