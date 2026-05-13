import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Typography, Skeleton, Stack, Button, Divider, Grid } from "@mui/material";
import {
    Edit as EditIcon,
    Download as DownloadIcon
} from "@mui/icons-material";
import numeral from "numeral";
import { MainLayout, Breadcrumbs, StatusChip } from "@/components";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import {
    PageContainer,
    MainContent,
    SidePanel,
    HeaderSection,
    TitleSection,
    SummaryCard,
    ItemCard,
    ItemImage,
    OrderStatus,
} from "@/styles/pedidos/styles";
interface PriceComparison {
    store: string;
    price: number;
    url?: string;
}

interface OrderItem {
    id: number;
    code: string;
    name: string;
    imageUrl?: string;
    unitPrice: number;
    quantity: number;
    total: number;
    averageInternetPrice?: number;
    priceComparisons?: PriceComparison[];
}

interface OrderDetail {
    id: number;
    folio: string;
    supplier: string;
    createdAt: string;
    status: OrderStatus;
    subtotal: number;
    tax: number;
    total: number;
    items: OrderItem[];
}

// ============================================================================
// MOCK DATA
// ============================================================================

const DUMMY_ORDER: OrderDetail = {
    id: 239392,
    folio: "239392",
    supplier: "Mabe S.A. de C.V.",
    createdAt: "15 de Julio, 2025",
    status: "received",
    subtotal: 291449.40,
    tax: 35901.56,
    total: 327400.96,
    items: [
        {
            id: 1,
            code: "04ET-123456",
            name: "Secadora Whirlpool 18 kg Carga Superior Blanca Eléctrica",
            unitPrice: 9349.00,
            quantity: 12,
            total: 112188.00,
            averageInternetPrice: 20944.45,
            priceComparisons: [
                { store: "Liverpool", price: 21898.50, url: "#" },
                { store: "Walmart", price: 19990.40, url: "#" },
            ],
        },
        {
            id: 2,
            code: "04ET-123456",
            name: "Secadora Whirlpool 26 kg Carga Superior Blanca",
            unitPrice: 15122.50,
            quantity: 8,
            total: 120980.00,
            averageInternetPrice: 26890.50,
            priceComparisons: [
                { store: "Liverpool", price: 26890.50, url: "#" },
                { store: "Walmart", price: 26890.50, url: "#" },
                { store: "Coppel", price: 26890.50, url: "#" },
            ],
        },
    ],
};

async function getOrderDetail(id: string): Promise<OrderDetail> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { ...DUMMY_ORDER, id: parseInt(id), folio: id };
}

function formatCurrency(value: number): string {
    return numeral(value).format("$0,0.00");
}

export default function PedidoDetalle() {
    const router = useRouter();
    const { id } = router.query;

    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id && typeof id === "string") {
            loadOrder(id);
        }
    }, [id]);

    const loadOrder = async (orderId: string) => {
        setLoading(true);
        try {
            const data = await getOrderDetail(orderId);
            setOrder(data);
        } catch (err) {
            console.error("[PedidoDetalle] Error loading order:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        router.push(`/pedidos/${id}/editar`);
    };

    const handleDownloadPdf = () => {
        console.log("[PedidoDetalle] Download PDF");
    };

    // Breadcrumbs
    const breadcrumbs: BreadcrumbItem[] = [
        { label: "Pedidos", href: "/pedidos" },
        { label: order?.supplier || "...", href: "/pedidos" },
        { label: `Pedido ${order?.folio || "..."}` },
    ];

    if (loading) {
        return (
            <MainLayout>
                <Breadcrumbs items={breadcrumbs} showBackButton onBack={() => router.push("/pedidos")} />
                <HeaderSection>
                    <TitleSection>
                        <Skeleton variant="text" width={200} height={40} />
                        <Skeleton variant="text" width={150} height={20} />
                    </TitleSection>
                </HeaderSection>
                <PageContainer>
                    <MainContent>
                        {[1, 2].map((i) => (
                            <ItemCard key={i}>
                                <Skeleton variant="rectangular" height={120} />
                            </ItemCard>
                        ))}
                    </MainContent>
                    <SidePanel>
                        <Skeleton variant="rectangular" height={150} />
                    </SidePanel>
                </PageContainer>
            </MainLayout>
        );
    }

    if (!order) {
        return (
            <MainLayout>
                <Typography>Pedido no encontrado</Typography>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <Stack spacing={3}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }}>
                    <Breadcrumbs
                        showBackButton
                        items={breadcrumbs}
                        onBack={() => router.push("/pedidos")} />
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                        <Button
                            variant="outlined"
                            startIcon={<EditIcon />}
                            onClick={handleEdit}>
                            Editar
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            onClick={handleDownloadPdf}>
                            Descargar PDF
                        </Button>
                        <StatusChip label={order.status} />
                    </Stack>
                </Stack>
                <Divider />
                <Grid container spacing={4} justifyContent="revert">
                    <Grid size={{ xs: 12, md: 8, xl: 9 }}>
                        <Stack spacing={2}>
                            {
                                order.items.map((item) => (
                                    <ItemCard key={item.id}>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <ItemImage />
                                            <Stack direction={{ xs: "column", md: "row" }} spacing={4} style={{ width: "100%" }}>
                                                <Stack spacing={0.5} sx={{ width: { xs: "100%", md: "50%" } }}>
                                                    <Typography variant="caption" color="text.secondary">{item.code}</Typography>
                                                    <Typography
                                                        variant="body1"
                                                        fontWeight={600}
                                                        style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{item.name}</Typography>
                                                </Stack>
                                                <Stack direction="row" spacing={2} width={{ xs: "100%", md: "50%" }} flex={1} justifyContent="space-between">
                                                    <Stack spacing={0.5}>
                                                        <Typography variant="body2" color="text.secondary">Precio unitario</Typography>
                                                        <Typography variant="body1">{formatCurrency(item.unitPrice)}</Typography>
                                                    </Stack>
                                                    <Stack spacing={0.5}>
                                                        <Typography variant="body2" color="text.secondary">Cantidad</Typography>
                                                        <Typography>{item.quantity}</Typography>
                                                    </Stack>
                                                    <Stack spacing={0.5}>
                                                        <Typography variant="body2" color="text.secondary">Total</Typography>
                                                        <Typography variant="body1" fontWeight={700}>{formatCurrency(item.total)}</Typography>
                                                    </Stack>
                                                </Stack>
                                            </Stack>
                                        </Stack>
                                    </ItemCard>
                                ))
                            }
                        </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4, xl: 3 }}>
                        <SummaryCard>
                            <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
                                <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                                <Typography variant="body1" fontWeight={600}>{formatCurrency(order.subtotal)}</Typography>
                            </Stack>
                            <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
                                <Typography variant="body2" color="text.secondary">IVA</Typography>
                                <Typography variant="body1" fontWeight={600}>{formatCurrency(order.tax)}</Typography>
                            </Stack>
                            <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
                                <Typography variant="h5" fontWeight={700}>Total:</Typography>
                                <Typography variant="h5" fontWeight={700}>{formatCurrency(order.total)}</Typography>
                            </Stack>
                        </SummaryCard>
                    </Grid>
                </Grid>
            </Stack>
        </MainLayout>
    );
}
