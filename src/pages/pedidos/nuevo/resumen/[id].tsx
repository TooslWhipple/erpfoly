import { useState, useEffect } from "react";
import dayjs from "@/lib/dayjs";
import { useRouter } from "next/router";
import { Typography, Skeleton, Stack, Button, Divider, Grid, Box } from "@mui/material";
import { Breadcrumbs, Pencil, StatusChip } from "@/components";
import type { StatusChipVariant } from "@/components";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import { OnlinePriceBar } from "@/components/ConfirmOrderItemCard";
import { getOrderFull } from "@/services/orders.service";
import type { OrderFullDetail } from "@/types/orders.types";
import { buildPlaceholderOnlinePrices } from "@/lib/onlinePrices";
import {
    SummaryCard,
    ItemCard,
} from "@/styles/pedidos/styles";
import { theme } from "@/styles/theme";

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        minimumFractionDigits: 2,
    }).format(value);
}

const IVA_RATE = 0.16;

type DisplayStatus = "pending" | "partially_delivered" | "delivered" | "cancelled";

function getStatusLabel(status: string): string {
    const labels: Record<DisplayStatus, string> = {
        pending: "Por recibir",
        partially_delivered: "En curso",
        delivered: "Recibido",
        cancelled: "Cancelado",
    };
    return labels[status as DisplayStatus] ?? labels.pending;
}

function getStatusVariant(status: string): StatusChipVariant {
    const variants: Record<DisplayStatus, StatusChipVariant> = {
        pending: "pending",
        partially_delivered: "info",
        delivered: "success",
        cancelled: "error",
    };
    return variants[status as DisplayStatus] ?? "pending";
}

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
            <>
                <Stack spacing={3}>
                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={2}
                        justifyContent="space-between"
                        alignItems={{ xs: "flex-start", sm: "center" }}
                    >
                        <Stack spacing={1} sx={{ width: "100%" }}>
                            <Breadcrumbs items={breadcrumbs} />
                            <Skeleton variant="text" width={240} height={48} />
                            <Skeleton variant="text" width={200} height={20} />
                        </Stack>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Skeleton variant="rounded" width={96} height={36} />
                            <Skeleton variant="rounded" width={96} height={24} sx={{ borderRadius: "6px" }} />
                        </Stack>
                    </Stack>

                    <Divider />

                    <Grid container spacing={4} justifyContent="revert">
                        <Grid size={{ xs: 12, md: 8, xl: 9 }}>
                            <Stack spacing={2}>
                                {[1, 2, 3].map((i) => (
                                    <ItemCard key={i}>
                                        <Stack spacing={2}>
                                            <Stack
                                                direction={{ xs: "column", sm: "row" }}
                                                spacing={2}
                                                alignItems={{ xs: "flex-start", sm: "center" }}
                                                justifyContent={{ xs: "flex-start", sm: "space-between" }}
                                            >
                                                <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
                                                    <Skeleton
                                                        variant="rounded"
                                                        width={48}
                                                        height={48}
                                                        sx={{ borderRadius: 2, flexShrink: 0 }}
                                                    />
                                                    <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
                                                        <Skeleton variant="text" width="35%" height={16} />
                                                        <Skeleton variant="text" width="75%" height={24} />
                                                    </Stack>
                                                </Stack>

                                                <Stack direction="row" spacing={2} alignItems="center">
                                                    {[100, 80, 100].map((minWidth) => (
                                                        <Stack
                                                            key={minWidth}
                                                            spacing={0.5}
                                                            sx={{ minWidth, alignItems: "center" }}
                                                        >
                                                            <Skeleton variant="text" width={72} height={16} />
                                                            <Skeleton variant="text" width={56} height={24} />
                                                        </Stack>
                                                    ))}
                                                </Stack>
                                            </Stack>

                                            <Skeleton variant="rounded" height={36} sx={{ borderRadius: 1 }} />
                                        </Stack>
                                    </ItemCard>
                                ))}
                            </Stack>
                        </Grid>

                        <Grid size={{ xs: 12, md: 4, xl: 3 }}>
                            <SummaryCard>
                                <Stack spacing={2}>
                                    {[1, 2, 3].map((i) => (
                                        <Stack key={i} direction="row" justifyContent="space-between" alignItems="center">
                                            <Skeleton variant="text" width={i === 3 ? 48 : 64} height={i === 3 ? 28 : 20} />
                                            <Skeleton variant="text" width={80} height={i === 3 ? 28 : 20} />
                                        </Stack>
                                    ))}
                                </Stack>
                            </SummaryCard>
                        </Grid>
                    </Grid>
                </Stack>
            </>
        );
    }

    if (!order) {
        return (
            <>
                <Breadcrumbs items={breadcrumbs} />
                <Box sx={{ marginTop: 4, textAlign: "center" }}>
                    <Typography variant="h5" color="text.secondary">
                        Pedido no encontrado
                    </Typography>
                    <Button variant="contained" sx={{ marginTop: 2 }} onClick={() => router.push("/pedidos")}>
                        Volver a pedidos
                    </Button>
                </Box>
            </>
        );
    }

    return (
        <>
            <Stack spacing={3}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }}>
                    <Stack spacing={1}>
                        <Breadcrumbs items={breadcrumbs} />
                        <Typography variant="h1">Pedido {order.folio}</Typography>
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>Fecha de alta: {dayjs(order.created_at).format("D [de] MMMM, YYYY")}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Button
                            variant="option"
                            color="inherit"
                            startIcon={<Pencil size={16} color={theme.palette.text.secondary} />}
                            onClick={handleEdit}>
                            Editar
                        </Button>
                        <StatusChip
                            label={getStatusLabel(order.status)}
                            size="small"
                            variant={getStatusVariant(order.status)}
                        />
                    </Stack>
                </Stack>

                <Divider />

                <Grid container spacing={4} justifyContent="revert">
                    <Grid size={{ xs: 12, md: 8, xl: 9 }}>
                        <Stack spacing={2}>
                            {
                                order.order_items.map((item) => {
                                    const unitPrice = Number(item.unit_price ?? 0);
                                    const itemTotal = unitPrice * item.requested_quantity;
                                    const productImage = item.product?.product_images?.[0]?.image_url;

                                    return (
                                        <ItemCard key={item.id}>
                                            <Stack spacing={2}>
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

                                                        <Stack spacing={0.5} sx={{ minWidth: 100 }}>
                                                            <Typography variant="body2" color="text.secondary">Total</Typography>
                                                            <Typography variant="body1" fontWeight={600}>{formatCurrency(itemTotal)}</Typography>
                                                        </Stack>
                                                    </Stack>
                                                </Stack>

                                                <OnlinePriceBar onlinePrices={buildPlaceholderOnlinePrices(unitPrice)} />
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
                                    <Typography variant="body2" color="text.secondary">IVA</Typography>
                                    <Typography variant="body1" fontWeight={600}>{formatCurrency(iva)}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="h6" fontWeight={700}>Total</Typography>
                                    <Typography variant="h6" fontWeight={700}>{formatCurrency(total)}</Typography>
                                </Stack>
                            </Stack>
                        </SummaryCard>
                    </Grid>
                </Grid>
            </Stack>
        </>
    );
}
