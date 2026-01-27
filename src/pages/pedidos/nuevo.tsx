import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { Box, InputAdornment, TextField, CircularProgress, Typography, Select, MenuItem, FormControl, Drawer, useMediaQuery, useTheme } from "@mui/material";
import { Search as SearchIcon, ArrowDropDown as ArrowDropDownIcon } from "@mui/icons-material";
import { MainLayout, Breadcrumbs, TableCrud, ProductSuggestionCard, OrderSummarySidebar, AddArticleToOrderModal } from "@/components";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import type { Column } from "@/components/TableCrud";
import type { Supplier, Article, OrderItem } from "@/types/pedidos.types";
import type { ProductSuggestion } from "@/types/suggestions.types";
import { getArticles, getSuggestionsForOrder, getCostHistory } from "@/data/pedidos.mockData";
import type { CostHistoryEntry } from "@/components/AddArticleToOrderModal";
import { colors } from "@/styles/theme";
import {
    PageContainer,
    PageHeader,
    PageTitle,
    SupplierSelector,
    SuggestionsSection,
    SuggestionsTitle,
    SuggestionsList,
    ArticlesSection,
    ArticlesHeader,
    ArticlesTitle,
    SearchInput,
    MainContent,
    StockCell,
    DrawerContent,
    MobileCardContainer,
} from "@/styles/pedidos/nuevo.styles";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface ArticleRow extends Article {
    image?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function NuevoPedido() {
    const router = useRouter();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const { supplierId, supplierName } = router.query;

    // State
    const [supplier, setSupplier] = useState<Supplier | null>(null);
    const [articles, setArticles] = useState<ArticleRow[]>([]);
    const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [suggestionsLoading, setSuggestionsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [addArticleModalOpen, setAddArticleModalOpen] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState<ArticleRow | null>(null);
    const [costHistory, setCostHistory] = useState<CostHistoryEntry[]>([]);
    const [costHistoryLoading, setCostHistoryLoading] = useState(false);

    // Initialize supplier from query params
    useEffect(() => {
        if (supplierId && supplierName && typeof supplierId === "string" && typeof supplierName === "string") {
            setSupplier({ id: supplierId, name: supplierName });
        }
    }, [supplierId, supplierName]);

    // Fetch data when supplier is set
    useEffect(() => {
        if (supplier) {
            fetchArticles();
            fetchSuggestions();
        }
    }, [supplier]);

    // Filter articles based on search query
    const filteredArticles = articles.filter((article) => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
            article.name.toLowerCase().includes(query) ||
            article.folio.toLowerCase().includes(query)
        );
    });

    const fetchArticles = async () => {
        if (!supplier) return;
        setLoading(true);
        try {
            const data = await getArticles(supplier.id);
            setArticles(data);
        } catch (error) {
            console.error("[NuevoPedido] Error fetching articles:", error);
        } finally {
            setLoading(false);
        }
    };

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
            // Update quantity and price if already exists
            const updatedItems = [...orderItems];
            updatedItems[existingItemIndex] = {
                ...updatedItems[existingItemIndex],
                quantity: updatedItems[existingItemIndex].quantity + item.quantity,
                unitPrice: item.unitPrice, // Update to latest price
                totalPrice: item.unitPrice * (updatedItems[existingItemIndex].quantity + item.quantity),
            };
            setOrderItems(updatedItems);
        } else {
            // Add new item
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

    const handleRemoveItem = (articleId: string) => {
        setOrderItems(orderItems.filter((item) => item.articleId !== articleId));
    };

    const handleCloseAddArticleModal = () => {
        setAddArticleModalOpen(false);
        setSelectedArticle(null);
        setCostHistory([]);
    };

    const handleAddFromSuggestion = (suggestion: ProductSuggestion) => {
        // Find article by SKU
        const article = articles.find((a) => a.folio === suggestion.sku);
        if (article) {
            handleAddArticle(article);
        }
    };

    const handleContinue = () => {
        // TODO: Navigate to next step or save order
        console.log("[NuevoPedido] Continue with order:", orderItems);
    };

    // Breadcrumbs
    const breadcrumbs: BreadcrumbItem[] = [
        { label: "Pedidos", href: "/pedidos" },
        { label: supplier?.name || "...", href: supplier ? `/pedidos?supplier=${supplier.id}` : undefined },
        { label: "Nuevo pedido" },
    ];

    // Table columns
    const columns: Column<ArticleRow>[] = [
        {
            id: "name",
            label: "Nombre",
            size: "xl",
            truncate: true,
            format: (value, row) => (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 1,
                            backgroundColor: "#F3F4F6",
                            border: "1px solid #E4E4E7",
                            flexShrink: 0,
                        }}
                    />
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
            <Breadcrumbs items={breadcrumbs} />

            <Box sx={{
                display: "flex",
                marginTop: 2,
                marginRight: { xs: 0, sm: 0, md: "320px" },
                paddingBottom: { xs: "200px", sm: "200px", md: 0 },
            }}>
                <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}>
                    <PageHeader>
                        <PageTitle>Nuevo pedido</PageTitle>
                        <SupplierSelector
                            size="small"
                            value={supplier.id}
                            displayEmpty
                            renderValue={(value) => {
                                if (!value) return "Seleccionar proveedor";
                                return supplier.name;
                            }}
                            IconComponent={ArrowDropDownIcon}
                            disabled
                        >
                            <MenuItem value={supplier.id}>{supplier.name}</MenuItem>
                        </SupplierSelector>
                    </PageHeader>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <SuggestionsSection>
                            <SuggestionsTitle>Sugerencias</SuggestionsTitle>
                            {suggestionsLoading ? (
                                <Box sx={{ display: "flex", justifyContent: "center", padding: 4 }}>
                                    <CircularProgress size={24} />
                                </Box>
                            ) : (
                                <SuggestionsList>
                                    {suggestions.map((suggestion) => (
                                        <ProductSuggestionCard
                                            key={suggestion.id}
                                            product={suggestion}
                                            onAdd={handleAddFromSuggestion}
                                        />
                                    ))}
                                </SuggestionsList>
                            )}
                        </SuggestionsSection>

                        <ArticlesSection>
                            <ArticlesHeader>
                                <ArticlesTitle>Todos los artículos</ArticlesTitle>
                                <SearchInput
                                    placeholder="Buscar en artículos"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    size="small"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon sx={{ color: "#71717A", fontSize: 20 }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </ArticlesHeader>

                            <TableCrud
                                columns={columns}
                                rows={filteredArticles}
                                loading={loading}
                                emptyMessage="No hay artículos disponibles"
                                rowKey="id"
                            />
                        </ArticlesSection>
                    </Box>
                </Box>

                {isMobile ? (
                    <MobileCardContainer>
                        <OrderSummarySidebar
                            items={orderItems}
                            onContinue={handleContinue}
                            onQuantityChange={handleQuantityChange}
                            onRemoveItem={handleRemoveItem}
                        />
                    </MobileCardContainer>
                ) : (
                    <Drawer
                        anchor="right"
                        open={true}
                        variant="persistent"
                        sx={{
                            display: { xs: "none", md: "block" },
                            "& .MuiDrawer-paper": {
                                width: 320,
                                height: "100vh",
                                top: 0,
                                right: 0,
                                borderLeft: `1px solid ${colors.border}`,
                                borderRadius: 0,
                                boxShadow: "none",
                                zIndex: (theme) => theme.zIndex.drawer + 1,
                            },
                        }}
                    >
                        <DrawerContent>
                            <OrderSummarySidebar
                                items={orderItems}
                                onContinue={handleContinue}
                                onQuantityChange={handleQuantityChange}
                                onRemoveItem={handleRemoveItem}
                            />
                        </DrawerContent>
                    </Drawer>
                )}

                <AddArticleToOrderModal
                    open={addArticleModalOpen}
                    onClose={handleCloseAddArticleModal}
                    article={selectedArticle}
                    onAddToOrder={handleAddToOrder}
                    costHistory={costHistory}
                />
            </Box>
        </MainLayout>
    );
}
