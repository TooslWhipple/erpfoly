import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { Box, InputAdornment, TextField, CircularProgress, Typography, useTheme, Stack, Skeleton, Grid } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { MainLayout, Breadcrumbs, TableCrud, ProductSuggestionCard, AddArticleToOrderModal } from "@/components";
import SelectedItemsPanel from "@/components/SelectedItemsPanel";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import type { Column } from "@/components/TableCrud";
import type { Article, OrderItem } from "@/types/pedidos.types";
import type { ProductSuggestion, SelectedOrderItem, OrderFullDetail } from "@/types/orders.types";
import type { CostHistoryEntry } from "@/components";
import type { BranchCatalogItem } from "@/services/branches.service";
import { unwrapOrThrow } from "@/lib/axios";
import {
    getProductsBySupplier,
    getProductsByBranch,
    type ProductBySupplierItem,
} from "@/services/productos.service";
import {
    getSuggestionsBySupplier,
    getProductCostHistory,
    getOrderFull,
    updateOrderWithItems,
    getSuggestions,
} from "@/services/orders.service";
import { getMainWarehouse } from "@/services/branches.service";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import {
    SuggestionsList,
    StockCell,
    Card,
    StickySidebarGrid,
} from "@/styles/pedidos/nuevo.styles";
import { Search } from "lucide-react";

interface ArticleRow extends Article {
    image?: string;
}

function mapProductBySupplierToArticleRow(
    item: ProductBySupplierItem,
): ArticleRow {
    return {
        id: String(item.id),
        name: item.shortName,
        folio: item.code,
        salesYear: item.yearlySales,
        salesLastMonth: item.previousMonthSales,
        salesCurrentMonth: item.currentMonthSales,
        inRepair: item.underRepair,
        stock: item.inStock,
        pendingSupply: item.pendingSupply,
        image: item.previewImage ?? undefined,
    };
}

function articleMatchesQuery(article: ArticleRow, normalizedQuery: string): boolean {
    if (!normalizedQuery) return true;
    return (
        article.name.toLowerCase().includes(normalizedQuery) ||
        article.folio.toLowerCase().includes(normalizedQuery)
    );
}

interface OrderFormProps {
    mode: "create" | "edit";
    orderId?: number;
    orderType?: "external" | "internal";
    supplierId?: string;
    supplierName?: string;
    branchId?: string;
    branchName?: string;
    originBranchId?: string;
    originBranchName?: string;
}

export default function OrderForm({
    mode,
    orderId,
    orderType: propOrderType,
    supplierId: propSupplierId,
    supplierName: propSupplierName,
    branchId: propBranchId,
    branchName: propBranchName,
    originBranchId: propOriginBranchId,
    originBranchName: propOriginBranchName,
}: OrderFormProps) {
    const router = useRouter();
    const theme = useTheme();
    const { showError } = useSnackbarStore();

    const orderType = propOrderType ?? (router.query.orderType as "external" | "internal" | undefined) ?? "external";

    const [supplier, setSupplier] = useState<{ id: string; name: string } | null>(null);
    const [branch, setBranch] = useState<{ id: string; name: string } | null>(null);
    const [originBranch, setOriginBranch] = useState<BranchCatalogItem | null>(null);
    const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
    const [suggestionsLoading, setSuggestionsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [addArticleModalOpen, setAddArticleModalOpen] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState<ArticleRow | null>(null);
    const [costHistory, setCostHistory] = useState<CostHistoryEntry[]>([]);
    const [costHistoryLoading, setCostHistoryLoading] = useState(false);
    const [selectedItems, setSelectedItems] = useState<SelectedOrderItem[]>([]);
    const [orderLoading, setOrderLoading] = useState(mode === "edit");
    const [originalOrder, setOriginalOrder] = useState<OrderFullDetail | null>(null);

    const effectiveOrderType = useMemo((): "external" | "internal" => {
        if (mode === "edit" && originalOrder) {
            return originalOrder.order_type;
        }
        return orderType;
    }, [mode, originalOrder, orderType]);

    const isInternalOrder = effectiveOrderType === "internal";

    const resolvedSupplierId = propSupplierId ?? (router.query.supplierId as string | undefined);
    const resolvedSupplierName = propSupplierName ?? (router.query.supplierName as string | undefined);
    const resolvedBranchId = propBranchId ?? (router.query.branchId as string | undefined);
    const resolvedBranchName = propBranchName ?? (router.query.branchName as string | undefined);
    const resolvedOriginBranchId = propOriginBranchId ?? (router.query.originBranchId as string | undefined);
    const resolvedOriginBranchName = propOriginBranchName ?? (router.query.originBranchName as string | undefined);

    useEffect(() => {
        if (mode === "create") {
            if (orderType === "external" && resolvedSupplierId && resolvedSupplierName) {
                setSupplier({ id: resolvedSupplierId, name: resolvedSupplierName });
            } else if (orderType === "internal" && resolvedBranchId && resolvedBranchName) {
                setBranch({ id: resolvedBranchId, name: resolvedBranchName });
                if (resolvedOriginBranchId && resolvedOriginBranchName) {
                    setOriginBranch({
                        id: Number(resolvedOriginBranchId),
                        name: resolvedOriginBranchName,
                        is_main_warehouse: false,
                    });
                } else {
                    getMainWarehouse().then((mw) => {
                        if (mw) setOriginBranch(mw);
                    });
                }
            }
        }
    }, [
        mode,
        orderType,
        resolvedSupplierId,
        resolvedSupplierName,
        resolvedBranchId,
        resolvedBranchName,
        resolvedOriginBranchId,
        resolvedOriginBranchName,
    ]);

    useEffect(() => {
        if (mode === "edit" && orderId) {
            loadOrder(orderId);
        }
    }, [mode, orderId]);

    const loadOrder = async (id: number) => {
        setOrderLoading(true);
        try {
            const result = await getOrderFull(id);
            const orderData = result.data;
            if (orderData) {
                setOriginalOrder(orderData);

                if (orderData.order_type === "internal") {
                    setBranch({
                        id: String(orderData.branch?.id ?? ""),
                        name: orderData.branch?.name ?? "",
                    });
                    if (orderData.origin_branch) {
                        setOriginBranch({
                            id: orderData.origin_branch.id,
                            name: orderData.origin_branch.name,
                            is_main_warehouse: false,
                        });
                    } else {
                        getMainWarehouse().then((mw) => {
                            if (mw) setOriginBranch(mw);
                        });
                    }
                } else {
                    setSupplier({
                        id: String(orderData.supplier?.id ?? ""),
                        name: orderData.supplier?.name ?? "",
                    });
                }

                const isInternal = orderData.order_type === "internal";
                const items: SelectedOrderItem[] = orderData.order_items.map((item) => ({
                    productId: item.product?.id ?? 0,
                    productCode: item.product?.code ?? "",
                    productName: item.product?.short_name ?? "",
                    previewImage: item.product?.product_images?.[0]?.image_url ?? null,
                    quantity: item.requested_quantity,
                    unitPrice: isInternal
                        ? 0
                        : Number(item.unit_price ?? item.product?.list_cost ?? 0),
                    totalPrice: isInternal
                        ? 0
                        : Number(item.unit_price ?? item.product?.list_cost ?? 0) * item.requested_quantity,
                }));
                setSelectedItems(items);
            }
        } catch (error) {
            console.error("[OrderForm] Error loading order:", error);
        } finally {
            setOrderLoading(false);
        }
    };

    const sourceEntityId = useMemo(() => {
        if (effectiveOrderType === "external") {
            if (!supplier) return 0;
            const parsed = Number(supplier.id);
            return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
        }
        if (effectiveOrderType === "internal") {
            if (!originBranch) return 0;
            const parsed = Number(originBranch.id);
            return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
        }
        return 0;
    }, [effectiveOrderType, supplier, originBranch]);

    useEffect(() => {
        if (!sourceEntityId) return;

        const fetchSuggestions = async () => {
            setSuggestionsLoading(true);
            try {
                if (effectiveOrderType === "external") {
                    const result = await getSuggestionsBySupplier(sourceEntityId, 10);
                    if (result.data) {
                        setSuggestions(result.data);
                    }
                } else {
                    const result = await getSuggestions(10);
                    if (result.data) {
                        setSuggestions(result.data);
                    }
                }
            } catch (error) {
                console.error("[OrderForm] Error fetching suggestions:", error);
            } finally {
                setSuggestionsLoading(false);
            }
        };

        fetchSuggestions();
    }, [sourceEntityId, effectiveOrderType]);

    const {
        data: productRows,
        isFetching: articlesFetching,
    } = useQuery({
        queryKey: [effectiveOrderType === "external" ? "products-by-supplier" : "products-by-branch", sourceEntityId],
        queryFn: async () => {
            if (effectiveOrderType === "external") {
                return unwrapOrThrow(await getProductsBySupplier(sourceEntityId));
            }
            return unwrapOrThrow(await getProductsByBranch(sourceEntityId));
        },
        enabled: sourceEntityId > 0,
        staleTime: 30_000,
    });

    const articles = useMemo<ArticleRow[]>(
        () => (productRows ?? []).map(mapProductBySupplierToArticleRow),
        [productRows],
    );

    const filteredArticles = useMemo<ArticleRow[]>(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase();
        if (!normalizedQuery) return articles;
        return articles.filter((article) => articleMatchesQuery(article, normalizedQuery));
    }, [articles, searchQuery]);

    const isSearchActive = searchQuery.trim().length > 0;
    const articlesLoading = sourceEntityId > 0 && articlesFetching;
    const emptyArticlesMessage = isSearchActive
        ? "No se encontraron artículos para la búsqueda"
        : isInternalOrder
            ? "No hay artículos disponibles para esta sucursal"
            : "No hay artículos disponibles para este proveedor";

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    const handleAddArticle = async (article: ArticleRow) => {
        if (isInternalOrder) {
            handleAddToOrder({
                articleId: article.id,
                articleName: article.name,
                folio: article.folio,
                quantity: 1,
                unitPrice: 0,
                totalPrice: 0,
            });
            return;
        }

        setSelectedArticle(article);
        setAddArticleModalOpen(true);
        setCostHistoryLoading(true);

        try {
            const productId = Number(article.id);
            if (Number.isFinite(productId) && productId > 0) {
                const result = await getProductCostHistory(productId);
                if (result.data) {
                    setCostHistory(result.data);
                } else {
                    setCostHistory([]);
                }
            } else {
                setCostHistory([]);
            }
        } catch (error) {
            console.error("[OrderForm] Error fetching cost history:", error);
            setCostHistory([]);
        } finally {
            setCostHistoryLoading(false);
        }
    };

    const handleAddToOrder = (item: OrderItem) => {
        const productId = Number(item.articleId);
        const existingItemIndex = selectedItems.findIndex(
            (selectedItem) => selectedItem.productId === productId
        );

        if (existingItemIndex >= 0) {
            const updatedItems = [...selectedItems];
            const existing = updatedItems[existingItemIndex];
            const newQuantity = existing.quantity + item.quantity;
            updatedItems[existingItemIndex] = {
                ...existing,
                quantity: newQuantity,
                totalPrice: item.unitPrice * newQuantity,
            };
            setSelectedItems(updatedItems);
        } else {
            const article = articles.find((a) => a.id === item.articleId);
            const newSelectedItem: SelectedOrderItem = {
                productId,
                productCode: item.folio,
                productName: item.articleName,
                previewImage: article?.image ?? null,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.totalPrice,
            };
            setSelectedItems([...selectedItems, newSelectedItem]);
        }
    };

    const handleQuantityChange = (productId: number, quantity: number) => {
        if (quantity <= 0) {
            setSelectedItems(selectedItems.filter((item) => item.productId !== productId));
            return;
        }
        const updatedItems = selectedItems.map((item) => {
            if (item.productId === productId) {
                return {
                    ...item,
                    quantity,
                    totalPrice: item.unitPrice * quantity,
                };
            }
            return item;
        });
        setSelectedItems(updatedItems);
    };

    const handleRemoveItem = (productId: number) => {
        setSelectedItems(selectedItems.filter((item) => item.productId !== productId));
    };

    const handleCloseAddArticleModal = () => {
        setAddArticleModalOpen(false);
        setSelectedArticle(null);
        setCostHistory([]);
    };

    const handleAddFromSuggestion = (suggestion: ProductSuggestion) => {
        const article = articles.find((a) => a.folio === suggestion.sku);
        if (article) {
            handleAddArticle(article);
        }
    };

    const handleContinue = async () => {
        if (selectedItems.length === 0) return;

        if (mode === "create") {
            if (effectiveOrderType === "external") {
                const orderData = {
                    orderType: "external" as const,
                    supplierId: supplier?.id,
                    supplierName: supplier?.name,
                    items: selectedItems.map((item) => ({
                        productId: item.productId,
                        productCode: item.productCode,
                        productName: item.productName,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        totalPrice: item.totalPrice,
                    })),
                    total: selectedItems.reduce((sum, item) => sum + item.totalPrice, 0),
                };

                sessionStorage.setItem("newOrderData", JSON.stringify(orderData));
                router.push("/pedidos/sucursales/nuevo/confirmar");
            } else {
                if (originBranch && branch && originBranch.id === Number(branch.id)) {
                    showError("La sucursal de origen y destino deben ser distintas.");
                    return;
                }

                const orderData = {
                    orderType: "internal" as const,
                    branchId: branch?.id,
                    branchName: branch?.name,
                    originBranchId: originBranch ? String(originBranch.id) : undefined,
                    originBranchName: originBranch?.name,
                    items: selectedItems.map((item) => ({
                        productId: item.productId,
                        productCode: item.productCode,
                        productName: item.productName,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        totalPrice: item.totalPrice,
                    })),
                    total: selectedItems.reduce((sum, item) => sum + item.totalPrice, 0),
                };

                sessionStorage.setItem("newOrderData", JSON.stringify(orderData));
                router.push("/pedidos/sucursales/nuevo/confirmar");
            }
        } else if (mode === "edit" && orderId) {
            const payload = {
                items: selectedItems.map((item) => ({
                    product_id: item.productId,
                    requested_quantity: item.quantity,
                    unit_price: item.unitPrice,
                })),
            };

            try {
                const result = await updateOrderWithItems(orderId, payload);
                if (result.data) {
                    const returnUrl = originalOrder?.order_type === "internal"
                        ? `/pedidos/sucursales/${orderId}`
                        : `/pedidos/${orderId}`;
                    router.push(returnUrl);
                }
            } catch (error) {
                console.error("[OrderForm] Error updating order:", error);
            }
        }
    };

    const truncatedName = (name: string | undefined) => {
        if (name === undefined) return "...";
        if (name.length <= 40) return name;

        return name
            .slice(0, 40)
            .split(' ')
            .slice(0, -1)
            .join(' ') + '...';
    }

    const displayName = effectiveOrderType === "external"
        ? supplier?.name
        : (originBranch && branch
            ? `${originBranch.name} → ${branch.name}`
            : branch?.name);

    const breadcrumbs: BreadcrumbItem[] = mode === "create"
        ? [
            { label: "Pedidos", href: effectiveOrderType === "internal" ? "/pedidos/sucursales" : "/pedidos" },
            { label: truncatedName(displayName), href: displayName && branch ? (effectiveOrderType === "internal" ? `/pedidos/sucursales?branch=${branch?.id}` : `/pedidos?supplier=${supplier?.id}`) : undefined },
            { label: effectiveOrderType === "internal" ? "Nuevo pedido sucursal" : "Nuevo pedido" },
        ]
        : [
            { label: "Pedidos", href: originalOrder?.order_type === "internal" ? "/pedidos/sucursales" : "/pedidos" },
            { label: originalOrder?.folio ? `Pedido ${originalOrder.folio}` : "...", href: originalOrder ? (originalOrder.order_type === "internal" ? `/pedidos/sucursales/${originalOrder.id}` : `/pedidos/${originalOrder.id}`) : undefined },
            { label: "Editar pedido" },
        ];

    const pageTitle = mode === "create"
        ? (effectiveOrderType === "internal" ? "Nuevo pedido sucursal" : "Nuevo pedido")
        : `Editar pedido ${originalOrder?.folio ?? ""}`;

    const columns: Column<ArticleRow>[] = [
        {
            id: "name",
            label: "Nombre",
            size: "lg",
            truncate: true,
            format: (value, row) => (
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    {
                        row.image ?
                            <Box
                                component="img"
                                src={row.image}
                                alt={String(value)}
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 1,
                                    objectFit: "cover",
                                    border: `1px solid ${theme.palette.app.border}`,
                                    flexShrink: 0,
                                }}
                            />
                            :
                            <Box
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 1,
                                    backgroundColor: theme.palette.background.lowGray,
                                    border: `1px solid ${theme.palette.app.border}`,
                                    flexShrink: 0,
                                }}
                            />
                    }
                    <Typography variant="body2" sx={{ flex: 1 }}>{String(value)}</Typography>
                </Stack>
            ),
        },
        {
            id: "folio",
            label: "Folio",
            size: "sm",
        },
        {
            id: "salesYear",
            label: "Vtas en el año",
            type: "number",
            size: "sm",
            align: "center",
        },
        {
            id: "salesLastMonth",
            label: "Vtas Mes anterior",
            type: "number",
            size: "sm",
            align: "center",
        },
        {
            id: "salesCurrentMonth",
            label: "Vtas en el mes",
            type: "number",
            size: "sm",
            align: "center",
        },
        {
            id: "inRepair",
            label: "En reparación",
            type: "number",
            size: "sm",
            align: "center",
        },
        {
            id: "stock",
            label: "Existencia",
            type: "number",
            size: "md",
            align: "center",
            format: (value) => {
                const stock = Number(value);
                const isLowStock = stock <= 2;
                return (
                    <StockCell isLow={isLowStock}>
                        {stock} unidades
                    </StockCell>
                );
            },
        },
        {
            id: "pendingSupply",
            label: "Por surtir",
            type: "number",
            size: "sm",
            align: "center",
        },
        {
            id: "add",
            label: "Pedido",
            type: "button",
            size: "md",
            buttonLabel: "Agregar",
            buttonVariant: "white",
            onButtonClick: (row) => handleAddArticle(row),
            sticky: true,
            stickyPosition: "right",
        },
    ];

    if (orderLoading) {
        return (
            <MainLayout>
                <Stack direction="row" justifyContent="center" alignItems="center" sx={{ minHeight: 400 }}>
                    <CircularProgress />
                </Stack>
            </MainLayout>
        );
    }

    if (mode === "edit" && (!originalOrder)) {
        return (
            <MainLayout>
                <Box sx={{ marginTop: 4, textAlign: "center" }}>
                    <Typography variant="h5" color="text.secondary">Pedido no encontrado</Typography>
                </Box>
            </MainLayout>
        );
    }

    if (mode === "create" && effectiveOrderType === "external" && !supplier) {
        return (
            <MainLayout>
                <Stack direction="row" justifyContent="center" alignItems="center" sx={{ minHeight: 400 }}>
                    <CircularProgress />
                </Stack>
            </MainLayout>
        );
    }

    if (effectiveOrderType === "internal" && (!branch || !originBranch)) {
        return (
            <MainLayout>
                <Stack direction="row" justifyContent="center" alignItems="center" sx={{ minHeight: 400 }}>
                    <CircularProgress />
                </Stack>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 8, xl: 9 }}>
                    <Stack direction="column" spacing={3}>
                        <Breadcrumbs items={breadcrumbs} />
                        <Typography variant="h1">{pageTitle}</Typography>
                        <SuggestionsList>
                            {
                                suggestionsLoading
                                    ? [1, 2, 3, 4].map((i) => (
                                        <Skeleton
                                            key={i}
                                            variant="rectangular"
                                            style={{ borderRadius: "12px", flex: "1 1 272px", minWidth: "272px", maxWidth: "272px", height: "304px" }}
                                        />
                                    ))
                                    : suggestions.map((suggestion) => (
                                        <ProductSuggestionCard
                                            key={suggestion.id}
                                            product={suggestion}
                                            onAdd={handleAddFromSuggestion}
                                        />
                                    ))
                            }
                        </SuggestionsList>
                        <Card>
                            <Stack spacing={1}>
                                <Typography variant="h5">Todos los artículos</Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Buscar en artículos"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Search size={18} color={theme.palette.text.secondary} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <Typography variant="body2" color="text.secondary">{filteredArticles?.length ?? 0} Resultados</Typography>
                            </Stack>
                        </Card>

                        <TableCrud
                            columns={columns}
                            rows={filteredArticles}
                            loading={articlesLoading}
                            emptyMessage={emptyArticlesMessage}
                            rowKey="id"
                        />
                    </Stack>
                </Grid>
                <StickySidebarGrid size={{ xs: 12, md: 4, xl: 3 }}>
                    <SelectedItemsPanel
                        items={selectedItems}
                        onQuantityChange={handleQuantityChange}
                        onRemove={handleRemoveItem}
                        onContinue={handleContinue}
                        continueLabel={mode === "edit" ? "Guardar cambios" : "Continuar"}
                        hidePrices={isInternalOrder}
                    />
                </StickySidebarGrid>
            </Grid>

            {!isInternalOrder && (
                <AddArticleToOrderModal
                    open={addArticleModalOpen}
                    onClose={handleCloseAddArticleModal}
                    article={selectedArticle}
                    onAddToOrder={handleAddToOrder}
                    costHistory={costHistory}
                />
            )}
        </MainLayout>
    );
}
