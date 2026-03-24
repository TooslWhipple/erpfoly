import { FormControlLabel, Grid, RadioGroup, Typography, Radio, Stack, Divider, Box } from "@mui/material";
import { Remove, Add } from "@mui/icons-material";
import { FormTextField, FormSelect } from "@/components";
import { FormCard, InventoryInput, InventoryButton } from "@/styles/catalogos/productos.styles";
import type { GeneralDataFormState, WarrantyType, FormErrors } from "@/types/productos.types";

const MIN_PIECES = 1;
const MAX_PIECES = 9999;

const DEFAULT_WARRANTY_OPTIONS: Array<{ value: WarrantyType; label: string }> = [
    { value: "months", label: "Meses" },
    { value: "policy", label: "Póliza anexa" },
];

interface GeneralDataTabProps {
    formState: GeneralDataFormState;
    errors: FormErrors;
    onFieldChange: (field: keyof GeneralDataFormState, value: string | WarrantyType) => void;
    onErrorClear: (field: string) => void;
    departments: Array<{ value: string; label: string }>;
    lines: Array<{ value: string; label: string }>;
    /** From GET /products/catalog; falls back to default labels when omitted or empty */
    warrantyOptions?: Array<{ value: WarrantyType; label: string }>;
}

export function GeneralDataTab({
    formState,
    errors,
    onFieldChange,
    onErrorClear,
    departments,
    lines,
    warrantyOptions,
}: GeneralDataTabProps) {
    const warrantyChoices =
        warrantyOptions && warrantyOptions.length > 0 ? warrantyOptions : DEFAULT_WARRANTY_OPTIONS;

    return (
        <FormCard>
            <Stack spacing={0.5}>
                <Typography variant="h6">Datos generales</Typography>
                <Typography variant="body2" color="text.secondary">Registra los básicos del artículo</Typography>
            </Stack>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
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
                <Grid size={{ xs: 12, md: 4 }}>
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
                        helperText={
                            errors.lineId ||
                            (!formState.departmentId ? "Selecciona un departamento primero" : undefined)
                        }
                        disabled={!formState.departmentId}
                        required
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
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
                        multiline
                        rows={3}
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
                    <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                        <Typography variant="body1" fontWeight={600} component="span">
                            Número de piezas:
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <InventoryButton
                                size="small"
                                aria-label="Reducir piezas"
                                onClick={() => {
                                    const current = Math.max(MIN_PIECES, parseInt(formState.piecesCount, 10) || MIN_PIECES);
                                    const next = Math.max(MIN_PIECES, current - 1);
                                    onFieldChange("piecesCount", String(next));
                                    onErrorClear("piecesCount");
                                }}
                            >
                                <Remove fontSize="small" />
                            </InventoryButton>
                            <InventoryInput
                                type="number"
                                inputProps={{
                                    min: MIN_PIECES,
                                    max: MAX_PIECES,
                                }}
                                value={formState.piecesCount}
                                onChange={(e) => {
                                    const raw = e.target.value;
                                    if (raw === "" || /^\d+$/.test(raw)) {
                                        onFieldChange("piecesCount", raw);
                                        onErrorClear("piecesCount");
                                    }
                                }}
                                onBlur={(e) => {
                                    const num = parseInt(e.target.value, 10);
                                    if (Number.isNaN(num) || num < MIN_PIECES) {
                                        onFieldChange("piecesCount", String(MIN_PIECES));
                                    } else if (num > MAX_PIECES) {
                                        onFieldChange("piecesCount", String(MAX_PIECES));
                                    }
                                }}
                            />
                            <InventoryButton
                                size="small"
                                aria-label="Aumentar piezas"
                                onClick={() => {
                                    const current = Math.min(MAX_PIECES, parseInt(formState.piecesCount, 10) || MIN_PIECES);
                                    const next = Math.min(MAX_PIECES, current + 1);
                                    onFieldChange("piecesCount", String(next));
                                    onErrorClear("piecesCount");
                                }}
                            >
                                <Add fontSize="small" />
                            </InventoryButton>
                        </Stack>
                    </Box>
                    {errors.piecesCount && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block" }}>
                            {errors.piecesCount}
                        </Typography>
                    )}
                </Grid>
            </Grid>
            <Stack spacing={3}>
                <Stack spacing={0.5}>
                    <Typography variant="h6">Garantía</Typography>
                    <Typography variant="body2" color="text.secondary">Selecciona el tipo de garantía</Typography>
                </Stack>
                <RadioGroup row>
                    {warrantyChoices.map((opt) => (
                        <FormControlLabel
                            key={opt.value}
                            control={<Radio />}
                            label={opt.label}
                            checked={formState.warrantyType === opt.value}
                            onChange={() => onFieldChange("warrantyType", opt.value)}
                        />
                    ))}
                </RadioGroup>
                {
                    formState.warrantyType === "months" &&
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
                }
                {
                    formState.warrantyType === "policy" &&
                    <FormTextField
                        label="Texto de póliza anexa"
                        placeholder="Ej. Garantía según póliza anexa al comprobante de compra."
                        multiline
                        minRows={2}
                        value={formState.warrantyPolicy}
                        onChange={(e) => {
                            onFieldChange("warrantyPolicy", e.target.value);
                            onErrorClear("warrantyPolicy");
                        }}
                        error={Boolean(errors.warrantyPolicy)}
                        helperText={errors.warrantyPolicy}
                        required
                    />
                }
            </Stack>
        </FormCard>
    );
}
