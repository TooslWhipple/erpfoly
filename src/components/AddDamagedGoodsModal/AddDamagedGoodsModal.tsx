import { useState, useCallback } from "react";
import {
    Dialog,
    Stack,
    Typography,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    InputAdornment,
    Switch,
    CircularProgress,
    useTheme,
} from "@mui/material";
import { Search, Calendar, Upload, X } from "lucide-react";
import {
    StyledDialogContent,
    ModalHeader,
    ModalTitle,
    CloseButton,
} from "@/components/ModalForm/styles";
import { FormActions, ConfirmButton } from "@/components/Form/styles";
import { FormTextField, FormSelect } from "@/components/Form";
import type { SelectOption } from "@/components/Form";
import { TabsWrapper, StyledTabs, StyledTab } from "@/components/TabFilters/styles";
import { colors } from "@/styles/theme";

// ============================================================================
// TYPES
// ============================================================================

export type DamageOrigin = "provider" | "internal";
export type ActionWithArticle =
    | "internal_repair"
    | "repair_with_supplier"
    | "sell_auction"
    | "return_to_supplier";

export interface AddDamagedGoodsFormValues {
    // Report tab
    article: string;
    provider: string;
    damageOrigin: DamageOrigin;
    damageType: string;
    serialNumber: string;
    damageDetected: string;
    observations: string;
    // Instructions tab - action
    actionWithArticle: ActionWithArticle;
    // Return to supplier
    selectedProvider: string;
    nextVisitDate: string;
    acceptanceLetterFile: File | null;
    // Sell at auction
    cost: string;
    lastPrice: string;
    auctionPrice: string;
    // Common
    workAssignedTo: string;
    responsible: string;
    solution: string;
    completionDate: string;
    addCost: boolean;
    costAmount: string;
}

const DEFAULT_FORM_VALUES: AddDamagedGoodsFormValues = {
    article: "",
    provider: "",
    damageOrigin: "provider",
    damageType: "",
    serialNumber: "",
    damageDetected: "",
    observations: "",
    actionWithArticle: "internal_repair",
    selectedProvider: "",
    nextVisitDate: "",
    acceptanceLetterFile: null,
    cost: "",
    lastPrice: "",
    auctionPrice: "",
    workAssignedTo: "",
    responsible: "",
    solution: "",
    completionDate: "",
    addCost: true,
    costAmount: "",
};

const DAMAGE_TYPE_OPTIONS: SelectOption[] = [
    { value: "incomplete", label: "Mercancía incompleta" },
    { value: "factory_defect", label: "Defecto de fábrica" },
    { value: "transport", label: "Daño en transporte" },
];

const SOLUTION_OPTIONS: SelectOption[] = [
    { value: "repaired", label: "Reparado" },
    { value: "replaced", label: "Reemplazado" },
    { value: "discarded", label: "Desechado" },
];

// Mock data for demo
const MOCK_ARTICLE = "Frigobar Mabe 4pz Mod RF42623661234";
const MOCK_PROVIDER = "Mabe S.A de C.V.";
const MOCK_WORK_ASSIGNED = "Ebanista SLP Gerardo Ibarra";
const MOCK_RESPONSIBLE = "Ignacio Fuentes";
const MOCK_COST = "6924.50";
const MOCK_LAST_PRICE = "10890.00";
const MOCK_AUCTION_PRICE = "7790.00";
const MOCK_NEXT_VISIT = "15 de Agosto, 2025";

export interface AddDamagedGoodsModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit?: (values: AddDamagedGoodsFormValues) => Promise<void>;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function AddDamagedGoodsModal({
    open,
    onClose,
    onSubmit,
}: AddDamagedGoodsModalProps) {
    const theme = useTheme();
    const [tabValue, setTabValue] = useState<"report" | "instructions">("report");
    const [values, setValues] = useState<AddDamagedGoodsFormValues>(DEFAULT_FORM_VALUES);
    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const handleClose = useCallback(() => {
        if (!loading) {
            setValues(DEFAULT_FORM_VALUES);
            setTabValue("report");
            setSubmitError(null);
            onClose();
        }
    }, [loading, onClose]);

    const updateField = useCallback(<K extends keyof AddDamagedGoodsFormValues>(
        field: K,
        value: AddDamagedGoodsFormValues[K]
    ) => {
        setValues((prev) => ({ ...prev, [field]: value }));
        setSubmitError(null);
    }, []);

    const handleSubmit = useCallback(async () => {
        setLoading(true);
        setSubmitError(null);
        try {
            const submit = onSubmit ?? (async () => {
                await new Promise((r) => setTimeout(r, 800));
            });
            await submit(values);
            handleClose();
        } catch (err) {
            setSubmitError(err instanceof Error ? err.message : "Error al guardar");
        } finally {
            setLoading(false);
        }
    }, [values, onSubmit, handleClose]);

    const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
        setTabValue(newValue as "report" | "instructions");
    };

    const showReturnToSupplier = values.actionWithArticle === "return_to_supplier";
    const showSellAuction = values.actionWithArticle === "sell_auction";

    return (
        <Dialog
            open={open}
            onClose={(_, reason) => {
                if (reason === "backdropClick" || reason === "escapeKeyDown") {
                    handleClose();
                }
            }}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    maxHeight: "90vh",
                },
            }}
        >
            <StyledDialogContent>
                <ModalHeader>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                        <ModalTitle>Agregar mercancía dañada</ModalTitle>
                    </div>
                    <CloseButton onClick={handleClose} disabled={loading} size="small">
                        <X size={20} />
                    </CloseButton>
                </ModalHeader>

                <TabsWrapper sx={{ mt: 2, mb: 2 }}>
                    <StyledTabs value={tabValue} onChange={handleTabChange}>
                        <StyledTab label="Reporte" value="report" />
                        <StyledTab label="Indicaciones y solución" value="instructions" />
                    </StyledTabs>
                </TabsWrapper>

                {submitError && (
                    <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                        {submitError}
                    </Typography>
                )}

                {tabValue === "report" && (
                    <Stack component="form" spacing={2} sx={{ pt: 1 }}>
                        <FormTextField
                            label="Artículo"
                            placeholder="Buscar"
                            value={values.article || MOCK_ARTICLE}
                            onChange={(e) => updateField("article", e.target.value)}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Search size={18} color={colors.text.secondary} />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <FormTextField
                            label="Proveedor"
                            value={MOCK_PROVIDER}
                            disabled
                            sx={{ "& .MuiInputBase-input": { color: "text.primary" } }}
                        />
                        <FormControl component="fieldset">
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Selecciona origen del daño
                            </Typography>
                            <RadioGroup
                                row
                                value={values.damageOrigin}
                                onChange={(e) => updateField("damageOrigin", e.target.value as DamageOrigin)}
                            >
                                <FormControlLabel value="provider" control={<Radio />} label="Daño del proveedor" />
                                <FormControlLabel value="internal" control={<Radio />} label="Daño interno" />
                            </RadioGroup>
                        </FormControl>
                        <FormSelect
                            label="Tipo de daño"
                            placeholder="Seleccione"
                            options={DAMAGE_TYPE_OPTIONS}
                            value={values.damageType || "incomplete"}
                            onChange={(e) => updateField("damageType", e.target.value)}
                        />
                        <FormTextField
                            label="Número de serie"
                            placeholder="Ingrese"
                            value={values.serialNumber}
                            onChange={(e) => updateField("serialNumber", e.target.value)}
                        />
                        <FormTextField
                            label="Daño detectado"
                            placeholder="Ingrese"
                            multiline
                            rows={3}
                            value={values.damageDetected}
                            onChange={(e) => updateField("damageDetected", e.target.value)}
                        />
                        <FormTextField
                            label="Observaciones"
                            placeholder="Ingrese"
                            multiline
                            rows={3}
                            value={values.observations}
                            onChange={(e) => updateField("observations", e.target.value)}
                        />
                    </Stack>
                )}

                {tabValue === "instructions" && (
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <FormControl component="fieldset">
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                ¿Qué se hará con el artículo?
                            </Typography>
                            <RadioGroup
                                value={values.actionWithArticle}
                                onChange={(e) => updateField("actionWithArticle", e.target.value as ActionWithArticle)}
                                sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}
                            >
                                <FormControlLabel value="internal_repair" control={<Radio />} label="Reparación interna" />
                                <FormControlLabel value="repair_with_supplier" control={<Radio />} label="Reparar con proveedor" />
                                <FormControlLabel value="sell_auction" control={<Radio />} label="Vender en remate" />
                                <FormControlLabel value="return_to_supplier" control={<Radio />} label="Regresar al proveedor" />
                            </RadioGroup>
                        </FormControl>

                        {showReturnToSupplier && (
                            <Stack spacing={2}>
                                <FormTextField
                                    label="Seleccione el Proveedor"
                                    value={values.selectedProvider || "MABE S.A de C.V."}
                                    onChange={(e) => updateField("selectedProvider", e.target.value)}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <Search size={18} color={colors.text.secondary} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <FormTextField
                                    label="Próxima visita del proveedor"
                                    value={MOCK_NEXT_VISIT}
                                    disabled
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <Calendar size={18} color={colors.text.secondary} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    spacing={1}
                                    sx={{
                                        border: "1px dashed",
                                        borderColor: "divider",
                                        borderRadius: 1,
                                        p: 2,
                                        cursor: "pointer",
                                    }}
                                    onClick={() => {}}
                                >
                                    <Upload size={20} color={theme.palette.primary.main} />
                                    <Typography variant="body2" color="primary">
                                        Cargar carta de aceptación
                                    </Typography>
                                </Stack>
                            </Stack>
                        )}

                        {showSellAuction && (
                            <Stack spacing={2}>
                                <FormTextField label="Costo" value={`$${MOCK_COST}`} disabled />
                                <FormTextField label="Último precio" value={`$${MOCK_LAST_PRICE}`} disabled />
                                <FormTextField
                                    label="Precio de remate"
                                    placeholder="Ingrese"
                                    value={values.auctionPrice || MOCK_AUCTION_PRICE}
                                    onChange={(e) => updateField("auctionPrice", e.target.value)}
                                />
                            </Stack>
                        )}

                        {!showSellAuction && !showReturnToSupplier && (
                            <>
                                <FormTextField
                                    label="Trabajo asignado a"
                                    placeholder="Ingrese"
                                    value={values.workAssignedTo || MOCK_WORK_ASSIGNED}
                                    onChange={(e) => updateField("workAssignedTo", e.target.value)}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <Search size={18} color={colors.text.secondary} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <FormTextField
                                    label="Responsable"
                                    placeholder="Ingrese"
                                    value={values.responsible || MOCK_RESPONSIBLE}
                                    onChange={(e) => updateField("responsible", e.target.value)}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <Search size={18} color={colors.text.secondary} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <FormSelect
                                    label="Solución"
                                    placeholder="Seleccione"
                                    options={SOLUTION_OPTIONS}
                                    value={values.solution}
                                    onChange={(e) => updateField("solution", e.target.value)}
                                />
                                <FormTextField
                                    label="Fecha de finalización"
                                    placeholder="Ingrese"
                                    value={values.completionDate}
                                    onChange={(e) => updateField("completionDate", e.target.value)}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <Calendar size={18} color={colors.text.secondary} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <Switch
                                        checked={values.addCost}
                                        onChange={(e) => updateField("addCost", e.target.checked)}
                                        color="primary"
                                    />
                                    <Typography variant="body2">¿Agregar costo?</Typography>
                                </Stack>
                                {values.addCost && (
                                    <FormTextField
                                        label="Costo"
                                        placeholder="Ingrese"
                                        value={values.costAmount}
                                        onChange={(e) => updateField("costAmount", e.target.value)}
                                    />
                                )}
                            </>
                        )}
                    </Stack>
                )}

                <FormActions>
                    <ConfirmButton
                        type="button"
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <CircularProgress size={20} color="inherit" />
                        ) : (
                            "Agregar"
                        )}
                    </ConfirmButton>
                </FormActions>
            </StyledDialogContent>
        </Dialog>
    );
}
