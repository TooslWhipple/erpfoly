import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Typography, Skeleton, Stack, Button, Divider, Grid, Box, LinearProgress, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText } from "@mui/material";
import {
    Download as DownloadIcon,
    LocalShipping as DeliveryIcon,
    CheckCircle as CheckCircleIcon,
    Schedule as ScheduleIcon,
    Send as SendIcon,
} from "@mui/icons-material";
import { MainLayout, Breadcrumbs } from "@/components";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import { getOrderFull, updateOrderStatus } from "@/services/orders.service";
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

type DisplayStatus = "pending" | "in_progress" | "received" | "cancelled";

function mapBackendStatus(status: string): DisplayStatus {
    switch (status) {
        case "pending":
            return "pending";
        case "partially_delivered":
            return "in_progress";
        case "delivered":
            return "received";
        case "cancelled":
            return "cancelled";
        default:
            return "pending";
    }
}

function getStatusLabel(status: DisplayStatus): string {
    const labels: Record<DisplayStatus, string> = {
        pending: "Por recibir",
        in_progress: "En curso",
        received: "Recibido",
        cancelled: "Cancelado",
    };
    return labels[status];
}

function getStatusColor(status: DisplayStatus): string {
    switch (status) {
        case "received":
            return "#16a34a";
        case "in_progress":
            return "#2563eb";
        case "pending":
            return "#ea580c";
        case "cancelled":
            return "#6b7280";
        default:
            return "#d1d5db";
    }
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}

export default function PedidoDetalle() {
    const router = useRouter();
    const { id } = router.query;

    const [order, setOrder] = useState<OrderFullDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [sendModalOpen, setSendModalOpen] = useState(false);
    const [sending, setSending] = useState(false);

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
            console.error("[PedidoDetalle] Error loading order:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPdf = () => {
        console.log("[PedidoDetalle] Download PDF");
    };

    const handleSendToWarehouse = async () => {
        if (!order || !id) return;
        setSending(true);
        try {
            await updateOrderStatus(Number(id), "partially_delivered");
            setSendModalOpen(false);
            await loadOrder(String(id));
        } catch (err) {
            console.error("[PedidoDetalle] Error sending to warehouse:", err);
        } finally {
            setSending(false);
        }
    };

    const displayStatus = order ? mapBackendStatus(order.status) : "pending";
    const showSendButton = order?.order_type === "external" && displayStatus === "pending";

    const totalRequested = order
        ? order.order_items.reduce((sum, item) => sum + item.requested_quantity, 0)
        : 0;
    const totalDelivered = order
        ? order.order_items.reduce((sum, item) => sum + item.delivered_quantity, 0)
        : 0;
    const progress = totalRequested > 0 ? Math.round((totalDelivered / totalRequested) * 100) : 0;

    const breadcrumbs: BreadcrumbItem[] = [
        { label: "Pedidos", href: "/pedidos" },
        { label: order?.supplier?.name || order?.branch?.name || "...", href: "/pedidos" },
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
                                <Skeleton variant="rectangular" height={80} />
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
                <Breadcrumbs items={breadcrumbs} showBackButton onBack={() => router.push("/pedidos")} />
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
                    <Breadcrumbs
                        showBackButton
                        items={breadcrumbs}
                        onBack={() => router.push("/pedidos")} />
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Button
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            onClick={handleDownloadPdf}>
                            Descargar PDF
                        </Button>
                        <Box
                            sx={{
                                backgroundColor: getStatusColor(displayStatus) + "18",
                                color: getStatusColor(displayStatus),
                                fontWeight: 500,
                                fontSize: 13,
                                borderRadius: 1.5,
                                padding: "4px 12px",
                                height: 24,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            {getStatusLabel(displayStatus)}
                        </Box>
                    </Stack>
                </Stack>

                <Divider />

                <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                    <Typography variant="h1">Pedido {order.folio}</Typography>
                    <Typography variant="body2" color="text.secondary">
                        {order.supplier?.name ?? order.branch?.name} · {formatDate(order.order_date)}
                    </Typography>
                    {order.requested_by_user && (
                        <Typography variant="body2" color="text.secondary">
                            Solicitado por: {order.requested_by_user.first_name} {order.requested_by_user.last_name}
                        </Typography>
                    )}
                </Stack>

                {progress > 0 && progress < 100 && (
                    <Stack spacing={1}>
                        <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2" color="text.secondary">
                                Progreso de entrega
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                                {totalDelivered} de {totalRequested} artículos
                            </Typography>
                        </Stack>
                        <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: "background.lowGray",
                                "& .MuiLinearProgress-bar": {
                                    borderRadius: 4,
                                    backgroundColor: getStatusColor(displayStatus),
                                },
                            }}
                        />
                    </Stack>
                )}

                {showSendButton && (
                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<SendIcon />}
                            onClick={() => setSendModalOpen(true)}
                        >
                            Enviar a Almacén
                        </Button>
                    </Box>
                )}

                <Grid container spacing={4} justifyContent="revert">
                    <Grid size={{ xs: 12, md: 8, xl: 9 }}>
                        <Stack spacing={3}>
                            <Typography variant="h5" fontWeight={600}>
                                Artículos ({order.order_items.length})
                            </Typography>

                            {order.order_items.map((item) => {
                                const itemDelivered = item.delivered_quantity;
                                const itemRequested = item.requested_quantity;
                                const itemProgress = itemRequested > 0 ? Math.round((itemDelivered / itemRequested) * 100) : 0;
                                const isFullyDelivered = itemDelivered >= itemRequested;
                                const productImage = item.product?.product_images?.[0]?.image_url;

                                return (
                                    <ItemCard key={item.id}>
                                        <Stack direction="row" spacing={2} alignItems="flex-start">
                                            <Box
                                                sx={{
                                                    width: 48,
                                                    height: 48,
                                                    borderRadius: 2,
                                                    overflow: "hidden",
                                                    flexShrink: 0,
                                                    backgroundColor: "background.lowGray",
                                                    border: (theme) => `1px solid ${theme.palette.app.border}`,
                                                }}
                                            >
                                                {productImage ? (
                                                    <Box
                                                        component="img"
                                                        src={productImage}
                                                        alt={item.product?.short_name ?? ""}
                                                        sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                    />
                                                ) : (
                                                    <Box sx={{ width: "100%", height: "100%" }} />
                                                )}
                                            </Box>

                                            <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                                                    {item.product?.code ?? "—"}
                                                </Typography>
                                                <Typography
                                                    variant="body1"
                                                    fontWeight={600}
                                                    sx={{
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    {item.product?.short_name ?? "Producto sin nombre"}
                                                </Typography>
                                            </Stack>

                                            <Stack spacing={0.5} sx={{ minWidth: 100, textAlign: "center" }}>
                                                <Typography variant="body2" color="text.secondary">Solicitado</Typography>
                                                <Typography variant="body1" fontWeight={600}>{itemRequested}</Typography>
                                            </Stack>

                                            <Stack spacing={0.5} sx={{ minWidth: 100, textAlign: "center" }}>
                                                <Typography variant="body2" color="text.secondary">Entregado</Typography>
                                                <Typography variant="body1" fontWeight={600} color={isFullyDelivered ? "success.main" : "text.primary"}>
                                                    {itemDelivered}
                                                </Typography>
                                            </Stack>

                                            <Stack spacing={0.5} sx={{ minWidth: 80, textAlign: "right" }}>
                                                <Typography variant="body2" color="text.secondary">Estado</Typography>
                                                {isFullyDelivered ? (
                                                    <CheckCircleIcon sx={{ fontSize: 20, color: "success.main" }} />
                                                ) : itemDelivered > 0 ? (
                                                    <ScheduleIcon sx={{ fontSize: 20, color: "warning.main" }} />
                                                ) : (
                                                    <ScheduleIcon sx={{ fontSize: 20, color: "text.disabled" }} />
                                                )}
                                            </Stack>
                                        </Stack>

                                        {itemProgress > 0 && itemProgress < 100 && (
                                            <Box sx={{ marginTop: 2 }}>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={itemProgress}
                                                    sx={{
                                                        height: 4,
                                                        borderRadius: 2,
                                                        backgroundColor: "background.lowGray",
                                                        "& .MuiLinearProgress-bar": {
                                                            borderRadius: 2,
                                                            backgroundColor: "primary.main",
                                                        },
                                                    }}
                                                />
                                            </Box>
                                        )}
                                    </ItemCard>
                                );
                            })}

                            {order.order_deliveries.length > 0 && (
                                <>
                                    <Divider sx={{ marginTop: 2 }} />
                                    <Typography variant="h5" fontWeight={600}>
                                        Entregas ({order.order_deliveries.length})
                                    </Typography>

                                    {order.order_deliveries.map((delivery) => (
                                        <ItemCard key={delivery.id}>
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <DeliveryIcon sx={{ color: "primary.main" }} />
                                                <Stack spacing={0.5} sx={{ flex: 1 }}>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {formatDate(delivery.delivery_date)}
                                                    </Typography>
                                                    {delivery.received_by_user && (
                                                        <Typography variant="caption" color="text.secondary">
                                                            Recibido por: {delivery.received_by_user.first_name} {delivery.received_by_user.last_name}
                                                        </Typography>
                                                    )}
                                                    <Typography variant="caption" color="text.secondary">
                                                        {delivery.order_delivery_items.length} artículo(s)
                                                    </Typography>
                                                </Stack>
                                                <Stack spacing={0.5} sx={{ minWidth: 100, textAlign: "right" }}>
                                                    <Typography variant="body2" color="text.secondary">Cantidad</Typography>
                                                    <Typography variant="body1" fontWeight={600}>
                                                        {delivery.order_delivery_items.reduce((sum, di) => sum + di.quantity, 0)}
                                                    </Typography>
                                                </Stack>
                                            </Stack>
                                        </ItemCard>
                                    ))}
                                </>
                            )}
                        </Stack>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4, xl: 3 }}>
                        <SummaryCard>
                            <Stack spacing={2}>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">Total artículos</Typography>
                                    <Typography variant="body1" fontWeight={600}>{totalRequested}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">Entregados</Typography>
                                    <Typography variant="body1" fontWeight={600} color="success.main">{totalDelivered}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">Pendientes</Typography>
                                    <Typography variant="body1" fontWeight={600} color="warning.main">{totalRequested - totalDelivered}</Typography>
                                </Stack>
                                <Divider />
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">Entregas</Typography>
                                    <Typography variant="body1" fontWeight={600}>{order.order_deliveries.length}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">Progreso</Typography>
                                    <Typography variant="body1" fontWeight={700}>{progress}%</Typography>
                                </Stack>
                            </Stack>
                        </SummaryCard>
                    </Grid>
                </Grid>
            </Stack>

            <Dialog open={sendModalOpen} onClose={() => !sending && setSendModalOpen(false)}>
                <DialogTitle>Enviar pedido a Almacén</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Al realizar esta acción los artículos ahora serán gestionados por el área de Recepción de Mercancía.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSendModalOpen(false)} disabled={sending}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSendToWarehouse} variant="contained" color="primary" disabled={sending}>
                        {sending ? "Enviando..." : "Enviar"}
                    </Button>
                </DialogActions>
            </Dialog>
        </MainLayout>
    );
}
