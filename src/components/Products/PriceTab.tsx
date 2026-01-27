import { Box, Typography, Grid, Switch } from "@mui/material";
import numeral from "numeral";
import { FormTextField, FormSelect, Tabs } from "@/components";
import {
    Section,
    SectionTitle,
    SectionDescription,
    CostSummaryContainer,
    CostItem,
    CostLabel,
    CostValue,
    SaveButton,
} from "@/styles/catalogos/productos.styles";
import type { PriceFormState, CostHistoryEntry } from "@/types/productos.types";
import { CostHistoryModal } from "./CostHistoryModal";

// ============================================================================
// TYPES
// ============================================================================

interface PriceTabProps {
    formState: PriceFormState;
    onFieldChange: (field: keyof PriceFormState, value: string | boolean) => void;
    lastModified?: string;
    currencies: Array<{ value: string; label: string }>;
    costHistory: CostHistoryEntry[];
    costHistoryOpen: boolean;
    onCostHistoryOpen: () => void;
    onCostHistoryClose: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function PriceTab({
    formState,
    onFieldChange,
    lastModified,
    currencies,
    costHistory,
    costHistoryOpen,
    onCostHistoryOpen,
    onCostHistoryClose,
}: PriceTabProps) {
    const listCostNumber = Number(formState.listCost) || 0;

    return (
        <>
            <Section>
                <SectionTitle>Cálculo de precios</SectionTitle>
                <SectionDescription>
                    Registra los costos y descuentos que tendrá este artículo para obtener sus precios.
                </SectionDescription>
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, lg: 8 }}>
                        {/* Costos Section */}
                        <Box sx={{ mb: 3 }}>
                            {lastModified && (
                                <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: "block" }}>
                                    Modificado por última vez: {lastModified}
                                </Typography>
                            )}
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <FormTextField
                                        label="Costo de lista"
                                        placeholder="0.00"
                                        type="number"
                                        value={formState.listCost}
                                        onChange={(e) => onFieldChange("listCost", e.target.value)}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <FormSelect
                                        label="Moneda"
                                        value={formState.currency}
                                        onChange={(e) => onFieldChange("currency", String(e.target.value))}
                                        options={currencies}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <FormTextField
                                        label="Tipo de cambio"
                                        placeholder="1.00"
                                        type="number"
                                        value={formState.exchangeRate}
                                        onChange={(e) => onFieldChange("exchangeRate", e.target.value)}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <FormTextField
                                        label="IVA (%)"
                                        placeholder="16.00"
                                        type="number"
                                        value={formState.iva}
                                        onChange={(e) => onFieldChange("iva", e.target.value)}
                                    />
                                </Grid>
                            </Grid>
                            <CostSummaryContainer>
                                <CostItem>
                                    <CostLabel>Costo promedio</CostLabel>
                                    <CostValue>
                                        {numeral(listCostNumber).format("$0,0.00")}
                                    </CostValue>
                                </CostItem>
                                <CostItem>
                                    <CostLabel>Último costo</CostLabel>
                                    <CostValue>
                                        {numeral(listCostNumber).format("$0,0.00")}
                                    </CostValue>
                                </CostItem>
                                <Box sx={{ ml: "auto" }}>
                                    <SaveButton
                                        variant="outlined"
                                        size="small"
                                        onClick={onCostHistoryOpen}
                                    >
                                        Ver historial de costos
                                    </SaveButton>
                                </Box>
                            </CostSummaryContainer>
                        </Box>

                        {/* Liquidación Section */}
                        <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
                            <Switch
                                checked={formState.liquidation}
                                onChange={(e) => onFieldChange("liquidation", e.target.checked)}
                                color="primary"
                            />
                            <Typography>Liquidación</Typography>
                        </Box>

                        {/* Promociones Section */}
                        <Box>
                            <Tabs
                                tabs={[
                                    { value: "branches", label: "Sucursales" },
                                    { value: "suppliers", label: "Proveedores" },
                                ]}
                                value="suppliers"
                                onChange={() => {}}
                                withBorder={false}
                            />
                            <Box sx={{ mt: 2, p: 2, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Promoción configuración creada en artículo
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 12, lg: 4 }}>
                        {/* Price Summary Sidebar */}
                        <Box sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
                            <Typography variant="subtitle2" sx={{ mb: 2 }}>
                                Precio base
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
                                Este precio se calcula tomando el costo de lista y el margen definido por departamento.
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 2 }}>
                                Margen: 35.75%
                            </Typography>
                            <Typography variant="h6">
                                {numeral(listCostNumber).format("$0,0.00")}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Section>

            <CostHistoryModal
                open={costHistoryOpen}
                onClose={onCostHistoryClose}
                history={costHistory}
            />
        </>
    );
}
