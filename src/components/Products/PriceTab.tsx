import { useMemo, useState } from "react";
import { Typography, Grid, Button, Stack, Divider, IconButton } from "@mui/material";
import numeral from "numeral";
import { Pencil, Trash2 } from "lucide-react";
import { FormTextField, FormSelect } from "@/components";
import { ProductPromotionModal } from "@/components/ProductPromotionModal";
import { FormCard, Card, LuquidationCard, LiquidationSwitch, LastCostCard } from "@/styles/catalogos/productos.styles";
import type {
    PriceFormState,
    CostHistoryEntry,
    ProductBasePrice,
    ProductPromotionDraft,
} from "@/types/productos.types";
import { CostHistoryModal } from "./CostHistoryModal";
import { AddBasePriceModal } from "./AddBasePriceModal";
import { ProductPromotionDraftCard } from "./ProductPromotionDraftCard";

function getReferenceCostForCalculation(formState: PriceFormState): number {
    const list = Number(formState.listCost) || 0;
    const last = Number(formState.lastCost) || list;
    const avg = Number(formState.averageCost) || list;
    switch (formState.costBasisForCalculation) {
        case "list_cost":
            return list;
        case "average_cost":
            return avg;
        case "last_cost":
        default:
            return last;
    }
}

interface PriceTabProps {
    formState: PriceFormState;
    onFieldChange: (field: keyof PriceFormState, value: string | boolean) => void;
    currencies: Array<{ value: string; label: string }>;
    costBasisOptions: Array<{ value: string; label: string }>;
    basePrices: ProductBasePrice[];
    onAddBasePrice: (entry: Omit<ProductBasePrice, "id">) => void;
    costHistory: CostHistoryEntry[];
    costHistoryOpen: boolean;
    onCostHistoryOpen: () => void;
    onCostHistoryClose: () => void;
    /** Persisted product id when editing; null on "nuevo producto". */
    productNumericId: number | null;
    promotionDrafts: ProductPromotionDraft[];
    onPromotionDraftsChange: (next: ProductPromotionDraft[]) => void;
}

export function PriceTab({
    formState,
    onFieldChange,
    currencies,
    costBasisOptions,
    basePrices,
    onAddBasePrice,
    costHistory,
    costHistoryOpen,
    onCostHistoryOpen,
    onCostHistoryClose,
    productNumericId,
    promotionDrafts,
    onPromotionDraftsChange,
}: PriceTabProps) {
    const [addBasePriceOpen, setAddBasePriceOpen] = useState(false);
    const [promotionModalOpen, setPromotionModalOpen] = useState(false);
    const [editingPromotionId, setEditingPromotionId] = useState<string | null>(null);

    const editingPromotionDraft =
        editingPromotionId != null
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

    const referenceCost = useMemo(() => getReferenceCostForCalculation(formState), [formState]);

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
                                    {formState.lastEditedDate ? `: ${formState.lastEditedDate}` : ""}
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
                                            onClick={onCostHistoryOpen}>
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
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={openCreatePromotionModal}
                                sx={{ alignSelf: "flex-start", mt: 1 }}
                            >
                                Agregar promoción
                            </Button>
                            <Stack spacing={1.5} sx={{ mt: 2 }}>
                                {promotionDrafts.length === 0 ? (
                                    <Typography variant="body2" color="text.secondary">
                                        No hay promociones. Agrega una para vincularla al guardar el producto.
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
                                )}
                            </Stack>
                        </FormCard>
                    </FormCard>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
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
                                Este precio se calcula tomando el costo de lista y el margen definido por departamento.
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
                                basePrices.map((row) => {
                                    const linePrice = referenceCost * (1 + row.marginPercent / 100);
                                    return (
                                        <Card key={row.id} backgroundColor="#CBD5E1">
                                            <Stack spacing={1}>
                                                <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                                                    <Stack>
                                                        <Typography variant="subtitle2" color="text.secondary">Margen</Typography>
                                                        <Typography variant="body1">
                                                            {numeral(row.marginPercent).format("0,0.00")}%
                                                        </Typography>
                                                    </Stack>
                                                    <Typography variant="h5">{numeral(linePrice).format("$0,0.00")}</Typography>
                                                </Stack>
                                            </Stack>
                                        </Card>
                                    );
                                })
                            }
                        </Stack>
                    </Card>
                </Grid>
            </Grid>

            <CostHistoryModal
                open={costHistoryOpen}
                onClose={onCostHistoryClose}
                history={costHistory} />

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
