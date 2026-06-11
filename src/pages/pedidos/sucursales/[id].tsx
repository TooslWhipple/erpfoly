import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { Typography, Skeleton, Stack, Button, Divider, Grid, Box } from "@mui/material";
import { MainLayout, Breadcrumbs, StatusChipVariant, StatusChip, Pencil } from "@/components";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import { ConfirmOrderItemCard } from "@/components/ConfirmOrderItemCard";
import type { ConfirmOrderItem } from "@/components/ConfirmOrderItemCard";
import { getOrderFull } from "@/services/orders.service";
import type { OrderFullDetail } from "@/types/orders.types";
import { SummaryCard } from "@/styles/pedidos/confirmar.styles";
import { theme } from "@/styles/theme";
import { usePermissions } from "@/hooks/usePermissions";
import { BRANCH_ORDERS_UPDATE } from "@/lib/permissions";

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

function getStatusVariant(status: DisplayStatus): StatusChipVariant {
    const variants: Record<DisplayStatus, string> = {
        pending: "pending",
        in_progress: "info",
        received: "success",
        cancelled: "error",
    };

    return variants[status] as StatusChipVariant;
}

function mapOrderItemToConfirmItem(item: OrderFullDetail["order_items"][number]): ConfirmOrderItem {
    const quantity = item.requested_quantity;

    return {
        productId: item.product?.id ?? item.id,
        productCode: item.product?.code ?? "—",
        productName: item.product?.short_name ?? "Producto sin nombre",
        previewImage: item.product?.product_images?.[0]?.image_url ?? null,
        quantity,
        unitPrice: 0,
        totalPrice: 0,
    };
}

export default function PedidoSucursalDetalle() {
    const router = useRouter();
    const { id } = router.query;
    const { hasPermission } = usePermissions();
    const canEdit = hasPermission(BRANCH_ORDERS_UPDATE);

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
                if (result.data.order_type !== "internal") {
                    router.replace(`/pedidos/${orderId}`);
                    return;
                }
                setOrder(result.data);
            }
        } catch (err) {
            console.error("[PedidoSucursalDetalle] Error loading order:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        if (id && typeof id === "string") {
            router.push(`/pedidos/sucursales/${id}/editar`);
        }
    };

    const displayStatus = order ? mapBackendStatus(order.status) : "pending";

    const totalQuantity = order
        ? order.order_items.reduce((sum, item) => sum + item.requested_quantity, 0)
        : 0;

    const breadcrumbs: BreadcrumbItem[] = [
        { label: "Pedidos", href: "/pedidos/sucursales" },
        {
            label: order?.branch?.name ? `Sucursal ${order.branch.name}` : "...",
            href: order?.branch?.id ? `/pedidos/sucursales?branch=${order.branch.id}` : "/pedidos/sucursales",
        },
        { label: `Pedido ${order?.folio || "..."}` },
    ];

    if (loading) {
        return (
            <MainLayout>
                <Stack spacing={3}>
                    <Breadcrumbs items={breadcrumbs} showBackButton onBack={() => router.push("/pedidos/sucursales")} />
                    <Grid container spacing={4}>
                        <Grid size={{ xs: 12, md: 8, xl: 9 }}>
                            <Stack spacing={2}>
                                {[1, 2].map((i) => (
                                    <Skeleton key={i} variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
                                ))}
                            </Stack>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4, xl: 3 }}>
                            <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2 }} />
                        </Grid>
                    </Grid>
                </Stack>
            </MainLayout>
        );
    }

    if (!order) {
        return (
            <MainLayout>
                <Breadcrumbs items={breadcrumbs} showBackButton onBack={() => router.push("/pedidos/sucursales")} />
                <Box sx={{ marginTop: 4, textAlign: "center" }}>
                    <Typography variant="h5" color="text.secondary">
                        Pedido no encontrado
                    </Typography>
                    <Button variant="contained" sx={{ marginTop: 2 }} onClick={() => router.push("/pedidos/sucursales")}>
                        Volver a pedidos por sucursal
                    </Button>
                </Box>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <Stack spacing={3}>
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", sm: "center" }}>
                    <Stack spacing={1}>
                        <Breadcrumbs items={breadcrumbs} />
                        <Typography variant="h1">Pedido {order.folio}</Typography>
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>Fecha de alta: {dayjs(order.created_at).format("DD [de] MMMM, YYYY")}</Typography>
                    </Stack>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "flex-start", sm: "center" }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            {canEdit && (
                                <Button
                                    variant="option"
                                    startIcon={<Pencil size={16} color={theme.palette.text.secondary} />}
                                    onClick={handleEdit}>
                                    Editar
                                </Button>
                            )}
                        </Stack>
                        <StatusChip
                            size="small"
                            label={getStatusLabel(displayStatus)}
                            variant={getStatusVariant(displayStatus)}
                        />
                    </Stack>
                </Stack>

                <Divider />

                <Grid container spacing={4}>
                    <Grid size={{ xs: 12, md: 8, xl: 9 }}>
                        <Stack spacing={2}>
                            {
                                order.order_items.map((item) => (
                                    <ConfirmOrderItemCard
                                        key={item.id}
                                        item={mapOrderItemToConfirmItem(item)}
                                        readOnly
                                        hidePrices
                                    />
                                ))
                            }
                        </Stack>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4, xl: 3 }}>
                        <SummaryCard>
                            <Stack spacing={2}>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">Total:</Typography>
                                    <Typography variant="h6" fontWeight={700}>{totalQuantity} {(totalQuantity) > 1 ? "Artículos" : "Artículo"}</Typography>
                                </Stack>
                            </Stack>
                        </SummaryCard>
                    </Grid>
                </Grid>
            </Stack>
        </MainLayout>
    );
}
