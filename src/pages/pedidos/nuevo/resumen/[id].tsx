import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Typography, Skeleton, Stack, Button, Divider, Grid, Box } from "@mui/material";
import { Edit as EditIcon, Download as DownloadIcon } from "@mui/icons-material";
import { MainLayout, Breadcrumbs } from "@/components";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import { getOrderFull } from "@/services/orders.service";
import type { OrderFullDetail } from "@/types/orders.types";
import {
    PageContainer,
    MainContent,
    SidePanel,
    HeaderSection,
    TitleSection,
    SummaryCard,
    ItemCard,
} from "@/styles/pedidos/styles";

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        minimumFractionDigits: 2,
    }).format(value);
}

const IVA_RATE = 0.16;

export default function ResumenPedido() {
    const router = useRouter();
    const { id } = router.query;

    const [order, setOrder] = useState<OrderFullDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id && typeof id === "string") {
            loadOrder(id);
        }
    }, [id]);

    const loadOrder = async (orderId: string) => {
        setLoading(true);
        try {
            const result = await getOrderFull(Number(orderId));
            if (result.data) {
                setOrder(result.data);
            }
        } catch (err) {
            console.error("[ResumenPedido] Error loading order:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        router.push(`/pedidos/${id}/editar`);
    };

    const handleDownloadPdf = () => {
        console.log("[ResumenPedido] Download PDF");
    };

    const handleContinue = () => {
        router.push("/pedidos");
    };

    const subtotal = order
        ? order.order_items.reduce((sum, item) => {
            const unitPrice = Number(item.unit_price ?? 0);
            return sum + unitPrice * item.requested_quantity;
        }, 0)
        : 0;
    const iva = subtotal * IVA_RATE;
    const total = subtotal + iva;

    const breadcrumbs: BreadcrumbItem[] = [
        { label: "Pedidos", href: "/pedidos" },
        { label: order?.supplier?.name || order?.branch?.name || "Nuevo pedido", href: "/pedidos" },
        { label: "Resumen del pedido" },
    ];

    if (loading) {
        return (
            <MainLayout>
                <Breadcrumbs items={breadcrumbs} />
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
                                <Skeleton variant="rectangular" height={80} />
                            </ItemCard>
                        ))}
                    </MainContent>
                    <SidePanel>
                        <Skeleton variant="rectangular" height={200} />
                    </SidePanel>
                </PageContainer>
            </MainLayout>
        );
    }

    if (!order) {
        return (
            <MainLayout>
                <Breadcrumbs items={breadcrumbs} />
                <Box sx={{ marginTop: 4, textAlign: "center" }}>
                    <Typography variant="h5" color="text.secondary">
                        Pedido no encontrado
                    </Typography>
                    <Button variant="contained" sx={{ marginTop: 2 }} onClick={() => router.push("/pedidos")}>
                        Volver a pedidos
                    </Button>
                </Box>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <Stack spacing={3}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }}>
                    <Breadcrumbs items={breadcrumbs} />
                    <Stack direction="row" spacing={2}>
                        <Button variant="outlined" startIcon={<EditIcon />} onClick={handleEdit}>
                            Editar
                        </Button>
                        <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleDownloadPdf}>
                            Descargar PDF
                        </Button>
                    </Stack>
                </Stack>

                <Divider />

                <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 0, sm: 2 }} alignItems={{ xs: "flex-start", sm: "center" }} flexWrap="wrap">
                    <Typography variant="h1">Resumen del pedido</Typography>
                    <Typography variant="body2" color="text.secondary">Proveedor: {order.supplier?.name || "—"}</Typography>
                </Stack>

                <Grid container spacing={4} justifyContent="revert">
                    <Grid size={{ xs: 12, md: 8, xl: 9 }}>
                        <Stack spacing={3}>
                            <Typography variant="h5" fontWeight={600}>Artículos ({order.order_items.length})</Typography>


                            {
                                order.order_items.map((item) => {
                                    const unitPrice = Number(item.unit_price ?? 0);
                                    const itemTotal = unitPrice * item.requested_quantity;
                                    const productImage = item.product?.product_images?.[0]?.image_url;

                                    return (
                                        <ItemCard key={item.id}>
                                            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent={{ xs: "flex-start", sm: "space-between" }}>
                                                <Stack direction="row" spacing={2} alignItems="center">
                                                    <Box
                                                        sx={{
                                                            width: 48,
                                                            height: 48,
                                                            borderRadius: 2,
                                                            overflow: "hidden",
                                                            flexShrink: 0,
                                                            backgroundColor: "background.lowGray",
                                                            border: (theme) => `1px solid ${theme.palette.app.border}`,
                                                        }}>
                                                        {
                                                            productImage ?
                                                                <Box
                                                                    component="img"
                                                                    src={productImage}
                                                                    alt={item.product?.short_name ?? ""}
                                                                    sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                                />
                                                                :
                                                                <Box sx={{ width: "100%", height: "100%" }} />
                                                        }
                                                    </Box>

                                                    <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
                                                        <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                                                            {item.product?.code ?? "—"}
                                                        </Typography>
                                                        <Typography variant="body1" fontWeight={600} sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                            {item.product?.short_name ?? "Producto sin nombre"}
                                                        </Typography>
                                                    </Stack>
                                                </Stack>

                                                <Stack direction="row" spacing={2} alignItems="center">
                                                    <Stack spacing={0.5} sx={{ minWidth: 100, textAlign: "center" }}>
                                                        <Typography variant="body2" color="text.secondary">Precio unitario</Typography>
                                                        <Typography variant="body1" fontWeight={600}>{formatCurrency(unitPrice)}</Typography>
                                                    </Stack>

                                                    <Stack spacing={0.5} sx={{ minWidth: 80, textAlign: "center" }}>
                                                        <Typography variant="body2" color="text.secondary">Cantidad</Typography>
                                                        <Typography variant="body1" fontWeight={600}>{item.requested_quantity}</Typography>
                                                    </Stack>

                                                    <Stack spacing={0.5} sx={{ minWidth: 100, textAlign: "right" }}>
                                                        <Typography variant="body2" color="text.secondary">Total</Typography>
                                                        <Typography variant="body1" fontWeight={600} color="primary.main">
                                                            {formatCurrency(itemTotal)}
                                                        </Typography>
                                                    </Stack>
                                                </Stack>
                                            </Stack>
                                        </ItemCard>
                                    );
                                })
                            }
                        </Stack>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4, xl: 3 }}>
                        <SummaryCard>
                            <Stack spacing={2}>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                                    <Typography variant="body1" fontWeight={600}>{formatCurrency(subtotal)}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">IVA (16%)</Typography>
                                    <Typography variant="body1" fontWeight={600}>{formatCurrency(iva)}</Typography>
                                </Stack>
                                <Divider />
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="h6" fontWeight={700}>Total</Typography>
                                    <Typography variant="h6" fontWeight={700} color="primary.main">{formatCurrency(total)}</Typography>
                                </Stack>
                                <Button variant="contained" color="primary" fullWidth size="large" onClick={handleContinue}>
                                    Continuar
                                </Button>
                            </Stack>
                        </SummaryCard>
                    </Grid>
                </Grid>
            </Stack>
        </MainLayout>
    );
}
