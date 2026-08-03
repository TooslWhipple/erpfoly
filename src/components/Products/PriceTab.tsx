import { useEffect, useMemo, useState, useCallback } from "react";
import { Typography, Grid, Button, Stack, Divider, Box, CircularProgress, useTheme } from "@mui/material";
import numeral from "numeral";
import { useQuery } from "@tanstack/react-query";
import { FormTextField, FormSelect } from "@/components";
import { ProductPromotionModal } from "@/components/ProductPromotionModal";
import { TabFilters } from "@/components/TabFilters";
import type { TabOption } from "@/components/TabFilters";
import { useProductPricePreview } from "@/hooks/useProductPricePreview";
import { getPromotionFormConfiguration } from "@/services/promociones.service";
import { getProductCostHistory } from "@/services/productos.service";
import { FormCard, Card, LuquidationCard, LiquidationSwitch, LastCostCard } from "@/styles/catalogos/productos.styles";
import type {
    PriceFormState,
    CostHistoryEntry,
    ProductBasePrice,
    ProductPromotionDraft,
    FormErrors,
} from "@/types/productos.types";
import { CostHistoryModal } from "./CostHistoryModal";
import { AddBasePriceModal } from "./AddBasePriceModal";
import { ProductPromotionDraftCard } from "./ProductPromotionDraftCard";
import { formatDate } from "@/utils/date";
import { costBasisLabel, resolveEffectiveCost } from "@/utils/product-cost";
import type { CostBasisForCalculation } from "@/types/productos.types";

/**
 * Estimated shelf price for a promotion line: base price (ya calculado y redondeado
 * por Apifoly) con el descuento de la promoción aplicado encima, sin volver a redondear.
 * discountRate is stored as a whole percent (e.g. 10 → 10% off → multiply by 0.9).
 */
function computeEstimatedPromotionalPrice(
    basePrice: number,
    discountRatePercent: number
): number {
    const clamped = Math.min(100, Math.max(0, discountRatePercent));
    return basePrice * (1 - clamped / 100);
}

interface BasePriceRowProps {
    row: ProductBasePrice;
    referenceCost: number;
}

function BasePriceRow({ row, referenceCost }: BasePriceRowProps) {
    const { subtotal, price, isLoading, isError } = useProductPricePreview(referenceCost, row.marginPercent);

    return (
        <Card backgroundColor="#CBD5E1">
            <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                    <Stack>
                        <Typography variant="subtitle2" color="text.secondary">Margen</Typography>
                        <Typography variant="body1">
                            {numeral(row.marginPercent).format("0,0.00")}%
                        </Typography>
                    </Stack>
                    {
                        isLoading ? (
                            <CircularProgress size={20} />
                        ) : isError ? (
                            <Typography variant="h5">No se pudo calcular</Typography>
                        ) : (
                            <Stack alignItems="flex-end">
                                <Typography variant="caption" color="text.secondary">
                                    Precio {numeral(subtotal).format("$0,0.00")}
                                </Typography>
                                <Typography variant="h5">
                                    Precio final {numeral(price).format("$0,0.00")}
                                </Typography>
                            </Stack>
                        )
                    }
                </Stack>
            </Stack>
        </Card>
    );
}

interface PriceTabProps {
    formState: PriceFormState;
    errors?: FormErrors;
    onFieldChange: (field: keyof PriceFormState, value: string | boolean) => void;
    currencies: Array<{ value: string; label: string }>;
    costBasisOptions: Array<{ value: string; label: string }>;
    basePrices: ProductBasePrice[];
    onAddBasePrice: (entry: Omit<ProductBasePrice, "id">) => void;
    costHistoryOpen: boolean;
    onCostHistoryOpen: () => void;
    onCostHistoryClose: () => void;
    /** Persisted product id when editing; null on "nuevo producto". */
    productNumericId: number | null;
    promotionDrafts: ProductPromotionDraft[];
    onPromotionDraftsChange: (next: ProductPromotionDraft[]) => void;
    /** True while a Banxico exchange-rate lookup (currency change or refresh) is in flight. */
    exchangeRateLoading?: boolean;
    /** Repeats the Banxico lookup for an existing USD product without changing currency. */
    onRefreshExchangeRate?: () => void;
}

export function PriceTab({
    formState,
    errors = {},
    onFieldChange,
    currencies,
    costBasisOptions,
    basePrices,
    onAddBasePrice,
    costHistoryOpen,
    onCostHistoryOpen,
    onCostHistoryClose,
    productNumericId,
    promotionDrafts,
    onPromotionDraftsChange,
    exchangeRateLoading = false,
    onRefreshExchangeRate,
}: PriceTabProps) {
    const theme = useTheme();
    const [addBasePriceOpen, setAddBasePriceOpen] = useState(false);
    const [promotionModalOpen, setPromotionModalOpen] = useState(false);
    const [editingPromotionId, setEditingPromotionId] = useState<string | null>(null);
    const [activePurchaseTypeTab, setActivePurchaseTypeTab] = useState("");
    const [costHistory, setCostHistory] = useState<CostHistoryEntry[]>([]);
    const [costHistoryLoading, setCostHistoryLoading] = useState(false);
    const [costHistoryError, setCostHistoryError] = useState<string | null>(null);

    const promotionFormConfigurationQuery = useQuery({
        queryKey: ["promotion-form-configuration", "price-tab"],
        queryFn: () => getPromotionFormConfiguration(),
        staleTime: 10 * 60 * 1000,
        enabled: promotionDrafts.length > 0,
    });

    const purchaseTypes = promotionFormConfigurationQuery.data?.purchaseTypes ?? [];

    useEffect(() => {
        if (purchaseTypes.length === 0) return;
        const validIds = new Set(purchaseTypes.map((p) => String(p.id)));
        if (!validIds.has(activePurchaseTypeTab)) {
            setActivePurchaseTypeTab(String(purchaseTypes[0].id));
        }
    }, [purchaseTypes, activePurchaseTypeTab]);

    const purchaseTypeTabs: TabOption[] = useMemo(
        () =>
            purchaseTypes.map((pt) => ({
                value: String(pt.id),
                label: pt.label,
                count: promotionDrafts.filter((d) => d.payload.purchaseTypeId === pt.id).length,
            })),
        [purchaseTypes, promotionDrafts]
    );

    const filteredPromotionDrafts = useMemo(() => {
        const selectedId = Number(activePurchaseTypeTab);
        if (!Number.isFinite(selectedId)) return [];
        return promotionDrafts.filter((d) => d.payload.purchaseTypeId === selectedId);
    }, [promotionDrafts, activePurchaseTypeTab]);

    // formState.listCost is in USD when currency is USD (see productDetailDtoToFormSnapshot);
    // resolveEffectiveCost and the price preview always expect pesos, same conversion the backend does on save.
    const listCostInPesos =
        formState.currency === "USD"
            ? (Number(formState.listCost) || 0) * (Number(formState.exchangeRate) || 0)
            : Number(formState.listCost) || 0;

    // Cost basis selected in the form (fallback to list cost when derived costs are zero).
    const referenceCost = useMemo(
        () =>
            resolveEffectiveCost({
                listCost: listCostInPesos,
                lastCost: Number(formState.lastCost) || 0,
                averageCost: Number(formState.averageCost) || 0,
                costBasis: formState.costBasisForCalculation,
            }),
        [
            listCostInPesos,
            formState.lastCost,
            formState.averageCost,
            formState.costBasisForCalculation,
        ],
    );
    const selectedCostBasisLabel = costBasisLabel(
        formState.costBasisForCalculation as CostBasisForCalculation,
    );
    const firstBaseMarginPercent = basePrices[0]?.marginPercent ?? 0;
    const {
        price: firstBasePrice,
        isLoading: firstBasePriceLoading,
        isError: firstBasePriceError,
    } = useProductPricePreview(referenceCost, firstBaseMarginPercent, {
        enabled: promotionDrafts.length > 0,
    });

    const editingPromotionDraft = editingPromotionId != null
        ? promotionDrafts.find((d) => d.id === editingPromotionId) ?? null
        : null;

    const openCreatePromotionModal = () => {
        setEditingPromotionId(null);
        setPromotionModalOpen(true);
    };

    const openEditPromotionModal = (id: string) => {
        setEditingPromotionId(id);
        setPromotionModalOpen(true);
    };

    const handleClosePromotionModal = () => {
        setPromotionModalOpen(false);
        setEditingPromotionId(null);
    };

    const handleSavePromotionDraft = (draft: ProductPromotionDraft) => {
        const exists = promotionDrafts.some((d) => d.id === draft.id);
        if (exists) {
            onPromotionDraftsChange(promotionDrafts.map((d) => (d.id === draft.id ? draft : d)));
        } else {
            onPromotionDraftsChange([...promotionDrafts, draft]);
        }
    };

    const handleRemovePromotionDraft = (id: string) => {
        onPromotionDraftsChange(promotionDrafts.filter((d) => d.id !== id));
    };

    const loadCostHistory = useCallback(async () => {
        if (productNumericId == null) {
            setCostHistory([]);
            setCostHistoryError(null);
            setCostHistoryLoading(false);
            return;
        }

        setCostHistoryLoading(true);
        setCostHistoryError(null);
        try {
            const result = await getProductCostHistory(productNumericId);
            if (result.error) {
                setCostHistory([]);
                setCostHistoryError(result.error.message);
                return;
            }
            setCostHistory(result.data ?? []);
        } catch (err) {
            console.error("[PriceTab] Error loading cost history:", err);
            setCostHistory([]);
            setCostHistoryError("No se pudo cargar el historial de costos.");
        } finally {
            setCostHistoryLoading(false);
        }
    }, [productNumericId]);

    useEffect(() => {
        if (!costHistoryOpen) {
            return;
        }
        void loadCostHistory();
    }, [costHistoryOpen, loadCostHistory]);

    const handleOpenCostHistory = () => {
        onCostHistoryOpen();
    };

    const costHistoryEmptyMessage =
        productNumericId == null
            ? "Guarda el artículo para consultar el historial de costos."
            : "Este artículo aún no cuenta con histórico de costos.";

    return (
        <>
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 8 }}>
                    <FormCard>
                        <Stack spacing={0.5}>
                            <Typography variant="h6">Cálculo de precios</Typography>
                            <Typography variant="body2" color="text.secondary">Registra los costos y descuentos que tendrá este artículo para obtener sus precios.</Typography>
                        </Stack>
                        <FormCard>
                            <Typography variant="subtitle2">Costos</Typography>
                            {(formState.lastEditedDate || formState.lastEditedBy) && (
                                <Typography variant="body2" color="text.secondary">
                                    Modificado por última vez
                                    {formState.lastEditedDate
                                        ? `: ${formatDate(formState.lastEditedDate, "dateMonthTime12h")}`
                                        : ""}
                                    {formState.lastEditedBy
                                        ? `${formState.lastEditedDate ? " · " : ": "}${formState.lastEditedBy}`
                                        : ""}
                                </Typography>
                            )}
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <FormTextField
                                        label="Costo de lista"
                                        placeholder="0.00"
                                        type="number"
                                        required
                                        value={formState.listCost}
                                        onChange={(e) => onFieldChange("listCost", e.target.value)}
                                        error={Boolean(errors.listCost)}
                                        helperText={errors.listCost}
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
                                        readOnly
                                        value={formState.exchangeRate}
                                        error={Boolean(errors.exchangeRate)}
                                        helperText={errors.exchangeRate}
                                        InputProps={{
                                            endAdornment: exchangeRateLoading ? (
                                                <CircularProgress size={16} />
                                            ) : undefined,
                                        }}
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
                                {
                                    formState.currency === "USD" && productNumericId != null &&
                                    <Grid size={12}>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={onRefreshExchangeRate}
                                            disabled={exchangeRateLoading}
                                            sx={{ alignSelf: "flex-start" }}>
                                            Actualizar tipo de cambio
                                        </Button>
                                    </Grid>
                                }
                            </Grid>

                            <LastCostCard>
                                <Stack
                                    spacing={3}
                                    width="100%"
                                    direction="row"
                                    alignItems="center"
                                    flexWrap="nowrap"
                                    divider={<Divider orientation="vertical" flexItem />}>
                                    <Stack>
                                        <Typography variant="body2" color="text.secondary">Costo promedio:</Typography>
                                        <Typography variant="h6">{numeral(formState.averageCost).format("$0,0.00")}</Typography>
                                    </Stack>
                                    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={3} flexGrow={1}>
                                        <Stack>
                                            <Typography variant="body2" color="text.secondary">Costo último:</Typography>
                                            <Typography variant="h6">{numeral(formState.lastCost).format("$0,0.00")}</Typography>
                                        </Stack>
                                        <Button
                                            variant="text"
                                            onClick={handleOpenCostHistory}>
                                            Ver historial de costos
                                        </Button>
                                    </Stack>
                                </Stack>
                            </LastCostCard>
                            <LuquidationCard checked={formState.liquidation}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <LiquidationSwitch
                                        checked={formState.liquidation}
                                        onChange={(e) => onFieldChange("liquidation", e.target.checked)}
                                        color="primary"
                                    />
                                    <Typography variant="body1">Liquidación</Typography>
                                </Stack>
                                <Typography variant="body2">Se imprimirá con etiqueta roja.</Typography>
                            </LuquidationCard>
                        </FormCard>
                        <FormCard>
                            <Typography variant="subtitle2">Promociones</Typography>
                            <Stack spacing={1.5}>
                                {
                                    promotionDrafts.length === 0 ? (
                                        <Typography variant="body2" color="text.secondary">
                                            No hay promociones. Agrega una para vincularla al guardar el artículo.
                                        </Typography>
                                    ) : (
                                        promotionDrafts.map((row) => (
                                            <ProductPromotionDraftCard
                                                key={row.id}
                                                draft={row}
                                                handleEdit={() => openEditPromotionModal(row.id)}
                                                handleDelete={() => handleRemovePromotionDraft(row.id)}
                                            />
                                        ))
                                    )
                                }
                            </Stack>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={openCreatePromotionModal}
                                sx={{ alignSelf: "flex-start" }}>
                                Agregar promoción
                            </Button>
                        </FormCard>
                    </FormCard>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }} sx={{ minWidth: 0 }}>
                    <Stack spacing={2} sx={{ minWidth: 0 }}>
                        <Card backgroundColor="#E2E8F0">
                            <Stack spacing={1.5}>
                                <Typography variant="body1">Costo a considerar para el cálculo</Typography>
                                <FormSelect
                                    value={formState.costBasisForCalculation}
                                    onChange={(e) =>
                                        onFieldChange("costBasisForCalculation", String(e.target.value))
                                    }
                                    options={costBasisOptions}
                                    sx={{ backgroundColor: "transparent" }}
                                />
                            </Stack>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap">
                                <Typography variant="subtitle2">Precios base</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Este precio se calcula tomando el {selectedCostBasisLabel} y el margen definido por departamento.
                                </Typography>
                            </Stack>
                            <Stack spacing={2}>
                                {
                                    basePrices.length === 0 && (
                                        <Typography variant="body2" color="text.secondary">
                                            No hay precios base. Usa Agregar para crear uno.
                                        </Typography>
                                    )
                                }
                                {
                                    basePrices.map((row) => (
                                        <BasePriceRow key={row.id} row={row} referenceCost={referenceCost} />
                                    ))
                                }
                            </Stack>
                        </Card>
                        {
                            promotionDrafts.length > 0 &&
                            <FormCard style={{ minWidth: 0, maxWidth: "100%", overflow: "hidden" }}>
                                <Stack spacing={2} sx={{ minWidth: 0, width: "100%" }}>
                                    <Stack spacing={0.5}>
                                        <Typography variant="subtitle2">Otros precios</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Vista previa por tipo de compra: {selectedCostBasisLabel}, margen del primer precio base y descuento de la promoción.
                                        </Typography>
                                    </Stack>
                                    {
                                        !promotionFormConfigurationQuery.isPending &&
                                        !promotionFormConfigurationQuery.isError &&
                                        purchaseTypeTabs.length > 0 &&
                                        <>
                                            <Box sx={{ width: "100%", minWidth: 0 }}>
                                                <TabFilters
                                                    tabs={purchaseTypeTabs}
                                                    activeTab={activePurchaseTypeTab}
                                                    onTabChange={setActivePurchaseTypeTab}
                                                    layout="contained"
                                                />
                                            </Box>
                                            <Stack spacing={2}>
                                                {
                                                    filteredPromotionDrafts.length === 0 ?
                                                        <Typography variant="body2" color="text.secondary">
                                                            No hay promociones para este tipo de compra.
                                                        </Typography>
                                                        :
                                                        filteredPromotionDrafts.map((draft) => {
                                                            const estimatedPrice = computeEstimatedPromotionalPrice(
                                                                firstBasePrice,
                                                                draft.payload.discountRate
                                                            );
                                                            return (
                                                                <Card
                                                                    key={draft.id}
                                                                    backgroundColor={theme.palette.grey[200]}>
                                                                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} flexWrap="wrap">
                                                                        <Stack spacing={1}>
                                                                            <Typography variant="body2" color="text.secondary">{draft.payload.name}</Typography>
                                                                            <Typography variant="body1">{numeral(draft.payload.discountRate).format("0,0.00")}%</Typography>
                                                                        </Stack>
                                                                        {
                                                                            firstBasePriceLoading ? (
                                                                                <CircularProgress size={20} />
                                                                            ) : (
                                                                                <Typography variant="h5">
                                                                                    {firstBasePriceError ? "No se pudo calcular" : numeral(estimatedPrice).format("$0,0.00")}
                                                                                </Typography>
                                                                            )
                                                                        }
                                                                    </Stack>
                                                                </Card>
                                                            );
                                                        }
                                                        )
                                                }
                                            </Stack>
                                        </>
                                    }
                                    {
                                        !promotionFormConfigurationQuery.isPending &&
                                        !promotionFormConfigurationQuery.isError &&
                                        purchaseTypeTabs.length === 0 &&
                                        <Typography variant="body2" color="text.secondary">
                                            No hay tipos de compra en la configuración de promociones.
                                        </Typography>
                                    }
                                </Stack>
                            </FormCard>
                        }
                    </Stack>
                </Grid>
            </Grid>

            <CostHistoryModal
                open={costHistoryOpen}
                onClose={onCostHistoryClose}
                history={costHistory}
                loading={costHistoryLoading}
                errorMessage={costHistoryError}
                emptyMessage={costHistoryEmptyMessage}
            />

            <AddBasePriceModal
                open={addBasePriceOpen}
                onClose={() => setAddBasePriceOpen(false)}
                referenceCost={referenceCost}
                onAdd={onAddBasePrice}
            />

            <ProductPromotionModal
                open={promotionModalOpen}
                onClose={handleClosePromotionModal}
                productId={productNumericId}
                editingDraft={editingPromotionDraft}
                isLiquidation={formState.liquidation}
                onSave={handleSavePromotionDraft}
            />
        </>
    );
}
