import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { Box, InputAdornment, TextField, CircularProgress, Typography, Select, MenuItem, FormControl, Drawer, useMediaQuery, useTheme } from "@mui/material";
import { Search as SearchIcon, ArrowDropDown as ArrowDropDownIcon } from "@mui/icons-material";
import { MainLayout, Breadcrumbs, TableCrud, ProductSuggestionCard, OrderSummarySidebar, AddArticleToOrderModal } from "@/components";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import type { Column } from "@/components/TableCrud";
import type { Supplier, Article, OrderItem } from "@/types/pedidos.types";
import type { ProductSuggestion } from "@/types/suggestions.types";
import { getArticles, getSuggestionsForOrder, getCostHistory, getSuppliers } from "@/data/pedidos.mockData";
import type { CostHistoryEntry } from "@/components/AddArticleToOrderModal";
import { colors } from "@/styles/theme";
import {
    PageContainer,
    PageHeader,
    SuggestionsSection,
    SuggestionsList,
    ArticlesSection,
    ArticlesHeader,
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

export default function NuevoPedidoSucursal() {
    const router = useRouter();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const { supplierId, supplierName } = router.query;

    // State
    const [supplier, setSupplier] = useState<Supplier | null>(null);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [suppliersLoading, setSuppliersLoading] = useState(false);
    const [articles, setArticles] = useState<ArticleRow[]>([]);
    const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [addArticleModalOpen, setAddArticleModalOpen] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState<ArticleRow | null>(null);
    const [costHistory, setCostHistory] = useState<CostHistoryEntry[]>([]);
    const [costHistoryLoading, setCostHistoryLoading] = useState(false);

    // Fetch suppliers list
    useEffect(() => {
        fetchSuppliers();
    }, []);

    // Initialize supplier from query params or use first supplier as default
    useEffect(() => {
        if (supplierId && supplierName && typeof supplierId === "string" && typeof supplierName === "string") {
            setSupplier({ id: supplierId, name: supplierName });
        } else if (suppliers.length > 0 && !supplier) {
            // If no supplier in query params, use first supplier as default (Almacén Central)
            const defaultSupplier = suppliers.find(s => s.name.includes("Central")) || suppliers[0];
            if (defaultSupplier) {
                setSupplier(defaultSupplier);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [supplierId, supplierName, suppliers]);

    // Fetch data when supplier is set
    useEffect(() => {
        if (supplier) {
            fetchArticles();
            fetchSuggestions();
        }
    }, [supplier]);

    const fetchSuppliers = async () => {
        setSuppliersLoading(true);
        try {
            const data = await getSuppliers();
            setSuppliers(data);
        } catch (error) {
            console.error("[NuevoPedidoSucursal] Error fetching suppliers:", error);
        } finally {
            setSuppliersLoading(false);
        }
    };

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
            console.error("[NuevoPedidoSucursal] Error fetching articles:", error);
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
            console.error("[NuevoPedidoSucursal] Error fetching suggestions:", error);
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
            console.error("[NuevoPedidoSucursal] Error fetching cost history:", error);
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
        console.log("[NuevoPedidoSucursal] Continue with order:", orderItems);
    };

    const handleSupplierChange = (event: any) => {
        const selectedId = event.target.value;
        const selected = suppliers.find(s => s.id === selectedId);
        if (selected) {
            // Clear previous data when changing supplier
            setArticles([]);
            setSuggestions([]);
            setOrderItems([]);
            setSupplier(selected);
        }
    };

    // Breadcrumbs
    const breadcrumbs: BreadcrumbItem[] = [
        { label: "Pedidos", href: "/pedidos" },
        { label: supplier?.name ? `Sucursal ${supplier.name}` : "Sucursales", href: supplier ? `/pedidos/sucursales?supplier=${supplier.id}` : "/pedidos/sucursales" },
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

    if (suppliersLoading || !supplier) {
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
                        <Typography variant="h1">Nuevo pedido</Typography>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500, color: "#232325" }}>
                                Almacén
                            </Typography>
                            <Select
                                size="small"
                                value={supplier.id}
                                displayEmpty
                                onChange={handleSupplierChange}
                                renderValue={(value) => {
                                    if (!value) return "Seleccionar almacén";
                                    return supplier.name;
                                }}
                                IconComponent={ArrowDropDownIcon}
                                sx={{
                                    maxWidth: 400,
                                    backgroundColor: colors.background.sidebar,
                                    "& .MuiOutlinedInput-notchedOutline": {
                                        borderColor: colors.border,
                                    },
                                    "&:hover .MuiOutlinedInput-notchedOutline": {
                                        borderColor: colors.border,
                                    },
                                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                        borderColor: "#2663EB",
                                    },
                                }}
                            >
                                {suppliers.map((s) => (
                                    <MenuItem key={s.id} value={s.id}>
                                        {s.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </Box>
                    </PageHeader>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <SuggestionsSection>
                            <Typography variant="h4">Sugerencias</Typography>
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
                                <Typography variant="h4">Todos los artículos</Typography>
                                <TextField
                                    placeholder="Buscar en artículos"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    size="small"
                                    sx={{
                                        maxWidth: 400,
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: 2,
                                            backgroundColor: colors.background.sidebar,
                                            "& fieldset": {
                                                borderColor: colors.border,
                                            },
                                            "&:hover fieldset": {
                                                borderColor: colors.border,
                                            },
                                            "&.Mui-focused fieldset": {
                                                borderColor: "#2663EB",
                                            },
                                        },
                                    }}
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
