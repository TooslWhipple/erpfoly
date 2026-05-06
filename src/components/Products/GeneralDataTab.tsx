import { Grid, Typography, Stack, Divider, Button } from "@mui/material";
import { FormTextField, FormSelect, Plus, Minus, RadioButton } from "@/components";
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
    warrantyOptions?: Array<{ value: WarrantyType; label: string }>;
    onOpenNewDepartmentModal?: () => void;
    onOpenNewLineModal?: () => void;
}

export function GeneralDataTab({
    formState,
    errors,
    onFieldChange,
    onErrorClear,
    departments,
    lines,
    warrantyOptions,
    onOpenNewDepartmentModal,
    onOpenNewLineModal,
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
                    <Button
                        type="button"
                        variant="text"
                        size="small"
                        color="primary"
                        onClick={() => onOpenNewDepartmentModal?.()}
                    >
                        <Plus size={16} />
                        <span style={{ marginLeft: 8 }}>
                            Nuevo departamento
                        </span>
                    </Button>
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
                        helperText={errors.lineId}
                        disabled={!formState.departmentId}
                        required
                    />
                    <Button
                        type="button"
                        variant="text"
                        size="small"
                        color="primary"
                        disabled={!formState.departmentId}
                        onClick={() => onOpenNewLineModal?.()}
                    >
                        <Plus size={16} />
                        <span style={{ marginLeft: 8 }}>
                            Nueva línea
                        </span>
                    </Button>
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
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="body1" fontWeight={600} component="span">
                            Número de piezas:
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <InventoryButton
                                size="small"
                                onClick={() => {
                                    const current = Math.max(MIN_PIECES, parseInt(formState.piecesCount, 10) || MIN_PIECES);
                                    const next = Math.max(MIN_PIECES, current - 1);
                                    onFieldChange("piecesCount", String(next));
                                    onErrorClear("piecesCount");
                                }}
                            >
                                <Minus size={16} />
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
                                onClick={() => {
                                    const current = Math.min(MAX_PIECES, parseInt(formState.piecesCount, 10) || MIN_PIECES);
                                    const next = Math.min(MAX_PIECES, current + 1);
                                    onFieldChange("piecesCount", String(next));
                                    onErrorClear("piecesCount");
                                }}
                            >
                                <Plus size={16} />
                            </InventoryButton>
                        </Stack>
                    </Stack>
                </Grid>
            </Grid>
            <Divider />
            <Stack spacing={3}>
                <Stack spacing={0.5}>
                    <Typography variant="h6">Garantía</Typography>
                    <Typography variant="body2" color="text.secondary">Selecciona el tipo de garantía</Typography>
                </Stack>
                <Stack direction="row" spacing={2}>
                    {
                        warrantyChoices.map((opt) => (
                            <RadioButton
                                key={opt.value}
                                value={opt.value}
                                label={opt.label}
                                checked={formState.warrantyType === opt.value}
                                onChange={() => onFieldChange("warrantyType", opt.value)}

                            />
                        ))}
                </Stack>
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
