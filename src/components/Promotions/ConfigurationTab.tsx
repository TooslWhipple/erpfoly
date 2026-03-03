import { Box, Grid, Switch, Stack, Typography } from "@mui/material";
import { FormTextField, RadioButton, RadioButtonGroup } from "@/components";
import {
    FormCard
} from "@/styles/catalogos/productos.styles";
import {
    MonthButton,
    MonthButtonIcon,
    DayButton,
    SwitchContainer,
} from "@/styles/catalogos/promociones.styles";
import { Check as CheckIcon } from "@mui/icons-material";
import type {
    PromotionFormState,
    FormErrors,
    PromotionApplicationType,
    PromotionMonth,
    PromotionDay
} from "@/types/promociones.types";

interface ConfigurationTabProps {
    formState: PromotionFormState;
    errors: FormErrors;
    onFieldChange: (field: keyof PromotionFormState, value: any) => void;
    onErrorClear: (field: string) => void;
}

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

    const handleMonthSelect = (month: PromotionMonth) => {
        onFieldChange("months", [month]);
    };

    const handleDaySelect = (day: PromotionDay) => {
        onFieldChange("days", [day]);
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
        <>
            <FormCard>
                <Stack spacing={0.5}>
                    <Typography variant="h6">Configuraciones de la promoción</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Ingresa un nombre y porcentaje para tu nueva promoción.
                    </Typography>
                </Stack>
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
                    <Grid size={{ xs: 12, sm: 3 }}>
                        <FormTextField
                            label="Porcentaje"
                            value={formState.percentage}
                            onChange={(e) => {
                                onFieldChange("percentage", e.target.value);
                                if (errors.percentage) onErrorClear("percentage");
                            }}
                            error={Boolean(errors.percentage)}
                            helperText={errors.percentage}
                            placeholder="15"
                            InputProps={{
                                endAdornment: <Box component="span" sx={{ color: "text.secondary" }}>%</Box>,
                            }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 3 }}>
                        <FormTextField
                            label="Anticipo"
                            value={formState.advancePercentage}
                            onChange={(e) => {
                                const v = e.target.value;
                                if (v === "" || /^\d{0,3}(\.\d*)?$/.test(v)) {
                                    onFieldChange("advancePercentage", v);
                                    if (errors.advancePercentage) onErrorClear("advancePercentage");
                                }
                            }}
                            error={Boolean(errors.advancePercentage)}
                            helperText={errors.advancePercentage}
                            placeholder="0"
                            InputProps={{
                                endAdornment: <Box component="span" sx={{ color: "text.secondary" }}>%</Box>,
                            }}
                        />
                    </Grid>
                </Grid>
            </FormCard>

            <FormCard>
                <Stack spacing={0.5}>
                    <Typography variant="h6">Aplicación</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Selecciona a qué tipo de venta se aplicará la promoción.
                    </Typography>
                </Stack>
                <Grid container spacing={3} width="100%">
                    <Grid size={{ xs: 12, sm: 'auto' }}>
                        <Stack spacing={1}>
                            <Typography variant="body1" fontWeight={500}>Aplicación</Typography>
                            <RadioButtonGroup>
                                <RadioButton
                                    value="Crédito"
                                    label="Crédito"
                                    checked={formState.applicationType === "Crédito"}
                                    onChange={(e) => handleApplicationTypeChange(e.target.value as PromotionApplicationType)}
                                />
                                <RadioButton
                                    value="Contado"
                                    label="Contado"
                                    checked={formState.applicationType === "Contado"}
                                    onChange={(e) => handleApplicationTypeChange(e.target.value as PromotionApplicationType)}
                                />
                                <RadioButton
                                    value="Apartados"
                                    label="Apartados"
                                    checked={formState.applicationType === "Apartados"}
                                    onChange={(e) => handleApplicationTypeChange(e.target.value as PromotionApplicationType)}
                                />
                            </RadioButtonGroup>
                        </Stack>
                    </Grid>
                    {formState.applicationType === "Crédito" && (
                        <Stack spacing={1}>
                            <Typography variant="body1" fontWeight={500}>Meses</Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap">
                                {([3, 6, 9, 12, 18, 24] as PromotionMonth[]).map((month) => {
                                    const isSelected = formState.months?.includes(month);
                                    return (
                                        <MonthButton
                                            key={month}
                                            onClick={() => handleMonthSelect(month)}
                                            selected={isSelected}
                                        >
                                            <MonthButtonIcon selected={isSelected}>
                                                {isSelected ? <CheckIcon /> : null}
                                            </MonthButtonIcon>
                                            {month}
                                        </MonthButton>
                                    );
                                })}
                            </Stack>
                        </Stack>
                    )}
                    {formState.applicationType === "Apartados" && (
                        <Stack spacing={1}>
                            <Typography variant="body1" fontWeight={500}>Días</Typography>
                            <RadioButtonGroup>
                                {
                                    ([30, 45, 60] as PromotionDay[]).map((day) => (
                                        <RadioButton
                                            key={day}
                                            value={day.toString()}
                                            label={day.toString()}
                                            checked={formState.days?.includes(day)}
                                            onChange={(e) => handleDaySelect(Number(e.target.value) as PromotionDay)}
                                        />
                                    ))
                                }
                            </RadioButtonGroup>
                        </Stack>
                    )}
                </Grid>
            </FormCard>

            {(formState.applicationType === "Crédito" || formState.applicationType === "Apartados") && (
                <FormCard>
                    <Stack spacing={0.5}>
                        <Typography variant="h6">Enganche por nivel de cliente</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Configure el porcentaje de enganche que se aplicará a cada nivel de cliente.
                        </Typography>
                    </Stack>
                    <Grid container spacing={2} width="100%">
                        {[1, 2, 3].map((level) => {
                            const levelData = formState.clientLevels.find((l) => l.level === level) || {
                                level,
                                advancePercentage: 0,
                            };
                            return (
                                <Grid size={{ xs: 12, sm: 'auto' }} key={level}>
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
                </FormCard>
            )}

            <FormCard>
                <Stack spacing={0.5}>
                    <Typography variant="h6">Periodo de vigencia</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Define el periodo de vigencia para la promoción.
                    </Typography>
                </Stack>
                <Grid container spacing={2} alignItems="flex-end" width="100%">
                    <Grid size={{ xs: 12, sm: 'auto' }}>
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
                    <Grid size={{ xs: 12, sm: 'auto' }}>
                        <SwitchContainer>
                            <Switch
                                checked={formState.hasEndDate}
                                onChange={(e) => handleEndDateToggle(e.target.checked)}
                            />
                        </SwitchContainer>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 'auto' }}>
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
            </FormCard>
        </>
    );
}
