import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { Box, InputAdornment, TextField, CircularProgress, Typography, useTheme, Stack, Skeleton, Grid, Divider, Button } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { MainLayout, Breadcrumbs, TableCrud, ProductSuggestionCard, AddArticleToOrderModal } from "@/components";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import type { Column } from "@/components/TableCrud";
import type { Supplier, Article, OrderItem } from "@/types/pedidos.types";
import type { ProductSuggestion } from "@/types/suggestions.types";
import { getSuggestionsForOrder, getCostHistory } from "@/data/pedidos.mockData";
import type { CostHistoryEntry } from "@/components/AddArticleToOrderModal";
import { unwrapOrThrow } from "@/lib/axios";
import {
    getProductsBySupplier,
    type ProductBySupplierItem,
} from "@/services/productos.service";
import {
    SuggestionsList,
    StockCell,
    Card,
    GrayCard
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

export default function NuevoPedido() {
    const router = useRouter();
    const theme = useTheme();
    const { supplierId, supplierName } = router.query;

    // State
    const [supplier, setSupplier] = useState<Supplier | null>(null);
    const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [suggestionsLoading, setSuggestionsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [addArticleModalOpen, setAddArticleModalOpen] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState<ArticleRow | null>(null);
    const [costHistory, setCostHistory] = useState<CostHistoryEntry[]>([]);
    const [costHistoryLoading, setCostHistoryLoading] = useState(false);

    useEffect(() => {
        if (supplierId && supplierName && typeof supplierId === "string" && typeof supplierName === "string") {
            setSupplier({ id: supplierId, name: supplierName });
        }
    }, [supplierId, supplierName]);

    useEffect(() => {
        if (supplier) {
            fetchSuggestions();
        }
    }, [supplier]);

    const supplierIdNumber = useMemo(() => {
        if (!supplier) return 0;
        const parsed = Number(supplier.id);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
    }, [supplier]);

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

    const fetchSuggestions = async () => {
        if (!supplier) return;
        setSuggestionsLoading(true);
        try {
            const data = await getSuggestionsForOrder(supplier.id);
            setSuggestions(data);
        } catch (error) {
            console.error("[NuevoPedido] Error fetching suggestions:", error);
        } finally {
            setSuggestionsLoading(false);
        }
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    const handleAddArticle = async (article: ArticleRow) => {
        setSelectedArticle(article);
        setAddArticleModalOpen(true);
        setCostHistoryLoading(true);

        try {
            const history = await getCostHistory(article.id);
            setCostHistory(history);
        } catch (error) {
            console.error("[NuevoPedido] Error fetching cost history:", error);
            setCostHistory([]);
        } finally {
            setCostHistoryLoading(false);
        }
    };

    const handleAddToOrder = (item: OrderItem) => {
        const existingItemIndex = orderItems.findIndex((orderItem) => orderItem.articleId === item.articleId);

        if (existingItemIndex >= 0) {
            const updatedItems = [...orderItems];
            updatedItems[existingItemIndex] = {
                ...updatedItems[existingItemIndex],
                quantity: updatedItems[existingItemIndex].quantity + item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.unitPrice * (updatedItems[existingItemIndex].quantity + item.quantity),
            };
            setOrderItems(updatedItems);
        } else {
            setOrderItems([...orderItems, item]);
        }
    };

    const handleQuantityChange = (articleId: string, quantity: number) => {
        const updatedItems = orderItems.map((item) => {
            if (item.articleId === articleId) {
                return {
                    ...item,
                    quantity,
                    totalPrice: item.unitPrice * quantity,
                };
            }
            return item;
        });
        setOrderItems(updatedItems);
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

    const handleContinue = () => {
        console.log("[NuevoPedido] Continue with order:", orderItems);
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

    const breadcrumbs: BreadcrumbItem[] = [
        { label: "Pedidos", href: "/pedidos" },
        { label: truncatedSupplierName(supplier?.name), href: supplier ? `/pedidos?supplier=${supplier.id}` : undefined },
        { label: "Nuevo pedido" },
    ];

    const columns: Column<ArticleRow>[] = [
        {
            id: "name",
            label: "Nombre",
            size: "xl",
            truncate: true,
            format: (value, row) => (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
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
                </Box>
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

    if (!supplier) {
        return (
            <MainLayout>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        minHeight: 400,
                    }}
                >
                    <CircularProgress />
                </Box>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 8, xl: 9 }}>
                    <Stack direction="column" spacing={3}>
                        <Breadcrumbs items={breadcrumbs} />
                        <Typography variant="h1">Nuevo pedido</Typography>
                        <SuggestionsList>
                            {
                                suggestions.length === 0 ?
                                    [1, 2, 3, 4].map((i) => (
                                        <Skeleton
                                            key={i}
                                            variant="rectangular"
                                            style={{ borderRadius: "12px", flex: "1 1 272px", minWidth: "272px", maxWidth: "272px", height: "304px" }}
                                        />
                                    ))
                                    :
                                    suggestions.map((suggestion) => (
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
                <Grid size={{ xs: 12, md: 4, xl: 3 }}>
                    <GrayCard>
                        <Stack style={{ padding: "0px 16px" }}>
                            <Typography variant="body1">Articulos</Typography>
                            <Typography variant="body2" color="text.secondary">Comienza a agregar artículos a tu pedido</Typography>
                        </Stack>
                        <Divider />
                        <Stack style={{ padding: "0px 16px" }}>
                            <Button
                                fullWidth
                                variant="contained"
                                color="primary" >
                                Continuar
                            </Button>
                        </Stack>
                    </GrayCard>
                </Grid>
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
