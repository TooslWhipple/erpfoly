import { Grid, Typography, Stack, Divider, Button } from "@mui/material";
import { FormTextField, FormSelect, Plus, RadioButton } from "@/components";
import { SatCatalogSearchField } from "@/components/SatCatalogSearchField";
import { FormCard } from "@/styles/catalogos/productos.styles";
import type { GeneralDataFormState, WarrantyType, FormErrors } from "@/types/productos.types";
import NumberSpinner from "../NumberSpinner";

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
    linesLoading?: boolean;
    warrantyOptions?: Array<{ value: WarrantyType; label: string }>;
    onOpenNewDepartmentModal?: () => void;
    onOpenNewLineModal?: () => void;
    readOnly?: boolean;
}

export function GeneralDataTab({
    formState,
    errors,
    onFieldChange,
    onErrorClear,
    departments,
    lines,
    linesLoading = false,
    warrantyOptions,
    onOpenNewDepartmentModal,
    onOpenNewLineModal,
    readOnly = false,
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
                        disabled={readOnly}
                    />
                    {!readOnly && (
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
                    )}
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
                            linesLoading ? "Cargando líneas…" : errors.lineId
                        }
                        disabled={!formState.departmentId || linesLoading || readOnly}
                        required
                    />
                    {!readOnly && (
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
                    )}
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
                        autoFocus={!readOnly}
                        disabled={readOnly}
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
                        disabled={readOnly}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <SatCatalogSearchField
                        type="product-service-key"
                        label="Clave de producto/servicio SAT"
                        placeholder="Buscar clave SAT"
                        value={formState.satProductServiceKey}
                        onChange={(value) => {
                            onFieldChange("satProductServiceKey", value);
                            onErrorClear("satProductServiceKey");
                        }}
                        onBlur={() => onErrorClear("satProductServiceKey")}
                        error={Boolean(errors.satProductServiceKey)}
                        helperText={errors.satProductServiceKey}
                        required
                        disabled={readOnly}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <SatCatalogSearchField
                        type="unit-of-measure"
                        label="Clave de unidad de medida SAT"
                        placeholder="Buscar unidad SAT"
                        value={formState.satUnitOfMeasureKey}
                        onChange={(value) => {
                            onFieldChange("satUnitOfMeasureKey", value);
                            onErrorClear("satUnitOfMeasureKey");
                        }}
                        onBlur={() => onErrorClear("satUnitOfMeasureKey")}
                        error={Boolean(errors.satUnitOfMeasureKey)}
                        helperText={errors.satUnitOfMeasureKey}
                        required
                        disabled={readOnly}
                    />
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="body1" fontWeight={600} component="span">
                            Número de piezas:
                        </Typography>
                        <NumberSpinner
                            value={parseInt(formState.piecesCount, 10)}
                            onChange={(value) => {
                                onFieldChange("piecesCount", String(value));
                                onErrorClear("piecesCount");
                            }}
                            min={MIN_PIECES}
                            max={MAX_PIECES}
                            disabled={readOnly}
                        />
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
                                disabled={readOnly}
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
                        disabled={readOnly}
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
                        disabled={readOnly}
                    />
                }
            </Stack>
        </FormCard>
    );
}
