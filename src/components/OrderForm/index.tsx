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
import { unwrapOrThrow } from "@/lib/axios";
import {
    getProductsBySupplier,
    type ProductBySupplierItem,
} from "@/services/productos.service";
import {
    getSuggestionsBySupplier,
    getProductCostHistory,
    getOrderFull,
    createOrderWithItems,
    updateOrderWithItems,
} from "@/services/orders.service";
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
    supplierId?: string;
    supplierName?: string;
}

export default function OrderForm({ mode, orderId, supplierId: propSupplierId, supplierName: propSupplierName }: OrderFormProps) {
    const router = useRouter();
    const theme = useTheme();

    const [supplier, setSupplier] = useState<{ id: string; name: string } | null>(null);
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

    const resolvedSupplierId = propSupplierId ?? (router.query.supplierId as string | undefined);
    const resolvedSupplierName = propSupplierName ?? (router.query.supplierName as string | undefined);

    useEffect(() => {
        if (mode === "create" && resolvedSupplierId && resolvedSupplierName) {
            setSupplier({ id: resolvedSupplierId, name: resolvedSupplierName });
        }
    }, [mode, resolvedSupplierId, resolvedSupplierName]);

    useEffect(() => {
        if (mode === "edit" && orderId) {
            loadOrder(orderId);
        }
    }, [mode, orderId]);

    const loadOrder = async (id: number) => {
        setOrderLoading(true);
        try {
            const result = await getOrderFull(id);
            if (result.data) {
                setOriginalOrder(result.data);

                const supplierId = result.data.order_items.find(
                    (item) => item.product?.product_suppliers?.[0]?.supplier_id
                )?.product?.product_suppliers?.[0]?.supplier_id;

                setSupplier({
                    id: String(supplierId ?? ""),
                    name: result.data.branch?.name ?? "",
                });

                const items: SelectedOrderItem[] = result.data.order_items.map((item) => ({
                    productId: item.product?.id ?? 0,
                    productCode: item.product?.code ?? "",
                    productName: item.product?.short_name ?? "",
                    previewImage: item.product?.product_images?.[0]?.image_url ?? null,
                    quantity: item.requested_quantity,
                    unitPrice: Number(item.product?.list_cost ?? 0),
                    totalPrice: Number(item.product?.list_cost ?? 0) * item.requested_quantity,
                }));
                setSelectedItems(items);
            }
        } catch (error) {
            console.error("[OrderForm] Error loading order:", error);
        } finally {
            setOrderLoading(false);
        }
    };

    const supplierIdNumber = useMemo(() => {
        if (!supplier) return 0;
        const parsed = Number(supplier.id);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
    }, [supplier]);

    useEffect(() => {
        if (!supplierIdNumber) return;

        const fetchSuggestions = async () => {
            setSuggestionsLoading(true);
            try {
                const result = await getSuggestionsBySupplier(supplierIdNumber, 10);
                if (result.data) {
                    setSuggestions(result.data);
                }
            } catch (error) {
                console.error("[OrderForm] Error fetching suggestions:", error);
            } finally {
                setSuggestionsLoading(false);
            }
        };

        fetchSuggestions();
    }, [supplierIdNumber]);

    const {
        data: productRows,
        isFetching: articlesFetching,
    } = useQuery({
        queryKey: ["products-by-supplier", supplierIdNumber],
        queryFn: async () =>
            unwrapOrThrow(await getProductsBySupplier(supplierIdNumber)),
        enabled: supplierIdNumber > 0,
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
    const articlesLoading = supplierIdNumber > 0 && articlesFetching;
    const emptyArticlesMessage = isSearchActive
        ? "No se encontraron artículos para la búsqueda"
        : "No hay artículos disponibles para este proveedor";

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    const handleAddArticle = async (article: ArticleRow) => {
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
            const orderData = {
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
                    router.push(`/pedidos/${orderId}`);
                }
            } catch (error) {
                console.error("[OrderForm] Error updating order:", error);
            }
        }
    };

    const truncatedSupplierName = (name: string | undefined) => {
        if (name === undefined) return "...";
        if (name.length <= 40) return name;

        return name
            .slice(0, 40)
            .split(' ')
            .slice(0, -1)
            .join(' ') + '...';
    }

    const breadcrumbs: BreadcrumbItem[] = mode === "create"
        ? [
            { label: "Pedidos", href: "/pedidos" },
            { label: truncatedSupplierName(supplier?.name), href: supplier ? `/pedidos?supplier=${supplier.id}` : undefined },
            { label: "Nuevo pedido" },
        ]
        : [
            { label: "Pedidos", href: "/pedidos" },
            { label: originalOrder?.folio ? `Pedido ${originalOrder.folio}` : "...", href: originalOrder ? `/pedidos/${originalOrder.id}` : undefined },
            { label: "Editar pedido" },
        ];

    const pageTitle = mode === "create" ? "Nuevo pedido" : `Editar pedido ${originalOrder?.folio ?? ""}`;

    const columns: Column<ArticleRow>[] = [
        {
            id: "name",
            label: "Nombre",
            size: "xl",
            truncate: true,
            format: (value, row) => (
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    {row.image ? (
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
                    ) : (
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
                    )}
                    <Typography variant="body2" sx={{ flex: 1 }}>
                        {String(value)}
                    </Typography>
                </Stack>
            ),
        },
        {
            id: "folio",
            label: "Folio",
            size: "md",
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
            buttonVariant: "text",
            buttonColor: "primary",
            onButtonClick: (row) => handleAddArticle(row),
            sticky: true,
            stickyPosition: "right",
        },
    ];

    if (orderLoading) {
        return (
            <MainLayout>
                <Stack
                    direction="row"
                    justifyContent="center"
                    alignItems="center"
                    sx={{ minHeight: 400 }}
                >
                    <CircularProgress />
                </Stack>
            </MainLayout>
        );
    }

    if (mode === "edit" && (!supplier || !originalOrder)) {
        return (
            <MainLayout>
                <Box sx={{ marginTop: 4, textAlign: "center" }}>
                    <Typography variant="h5" color="text.secondary">
                        Pedido no encontrado
                    </Typography>
                </Box>
            </MainLayout>
        );
    }

    if (mode === "create" && !supplier) {
        return (
            <MainLayout>
                <Stack
                    direction="row"
                    justifyContent="center"
                    alignItems="center"
                    sx={{ minHeight: 400 }}
                >
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
                            {suggestionsLoading
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
                                ))}
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
                    />
                </StickySidebarGrid>
            </Grid>

            <AddArticleToOrderModal
                open={addArticleModalOpen}
                onClose={handleCloseAddArticleModal}
                article={selectedArticle}
                onAddToOrder={handleAddToOrder}
                costHistory={costHistory}
            />
        </MainLayout>
    );
}
