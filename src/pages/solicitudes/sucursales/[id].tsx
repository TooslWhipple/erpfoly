import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
    Button,
    CircularProgress,
    Divider,
    Stack,
    Typography,
} from "@mui/material";
import { MainLayout, Breadcrumbs, BranchOrderItemRow, StatusChip } from "@/components";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import type {
    BranchRequestFullDetail,
    BranchOrderDetail,
    BranchOrderLineItem,
    ScheduleBranchRequestPayload,
    UpdateBranchRequestPayload,
} from "@/types/solicitudes.types";
import {
    getBranchRequestFull,
    updateBranchRequest,
    scheduleBranchRequest,
} from "@/services/requests.service";
import {
    mapBranchOrderStatus,
    getBranchOrderStatusLabel,
    getBranchOrderStatusVariant,
    isBranchOrderEditable,
} from "@/utils/branchRequest";
import {
    PageContainer,
    OriginDestinationCard,
    ProductsSection,
    ProductHeaderSection,
} from "@/styles/solicitudes/detalle.styles";
import { theme } from "@/styles/theme";
import { ArrowRight } from "lucide-react";

const DELIVERY_DATE_REQUIRED_MESSAGE = "Selecciona la fecha de entrega.";

function formatScheduledDate(value: string | null | undefined): string {
    if (!value) return "";
    return new Date(value).toISOString().split("T")[0];
}

function mapBackendToBranchOrderDetail(detail: BranchRequestFullDetail): BranchOrderDetail {
    const items: BranchOrderLineItem[] = detail.order_items.map((item) => ({
        articleId: String(item.id),
        articleName: item.product?.short_name ?? "Sin nombre",
        deliveryDate: formatScheduledDate(item.scheduled_delivery_date),
        scheduledDeliveryDate: item.scheduled_delivery_date
            ? formatScheduledDate(item.scheduled_delivery_date)
            : null,
        quantity: item.requested_quantity,
        orderItemId: item.id,
        productId: item.product?.id ?? 0,
        requestedQuantity: item.requested_quantity,
        deliveredQuantity: item.delivered_quantity,
    }));

    return {
        id: detail.id,
        folio: detail.folio,
        createdAt: detail.created_at,
        status: mapBranchOrderStatus(detail.status),
        originId: String(detail.origin_branch?.id ?? ""),
        originLabel: detail.origin_branch?.name ?? "Sin sucursal",
        destinationId: String(detail.branch?.id ?? ""),
        destinationLabel: detail.branch?.name ?? "Sin sucursal",
        items,
    };
}

async function getBranchOrderDetail(orderId: string): Promise<BranchOrderDetail | null> {
    const id = parseInt(orderId, 10);
    if (Number.isNaN(id) || id < 1) return null;

    const result = await getBranchRequestFull(id);
    if (result.data) {
        return mapBackendToBranchOrderDetail(result.data);
    }
    return null;
}

function formatCreatedDate(isoDate: string): string {
    const d = new Date(isoDate);
    return d.toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}

type PageStatus = "loading" | "success" | "empty" | "error" | "submitting";

export default function SolicitudSucursalDetallePage() {
    const router = useRouter();
    const id = typeof router.query.id === "string" ? router.query.id : null;

    const [status, setStatus] = useState<PageStatus>("loading");
    const [order, setOrder] = useState<BranchOrderDetail | null>(null);
    const [originalOrder, setOriginalOrder] = useState<BranchOrderDetail | null>(null);
    const [deliveryDateErrors, setDeliveryDateErrors] = useState<Record<string, string>>({});

    const fetchOrder = useCallback(async () => {
        if (!id) return;
        setStatus("loading");
        try {
            const data = await getBranchOrderDetail(id);
            if (data) {
                setOrder(data);
                setOriginalOrder(JSON.parse(JSON.stringify(data)));
                setDeliveryDateErrors({});
                setStatus("success");
            } else {
                setOrder(null);
                setOriginalOrder(null);
                setStatus("empty");
            }
        } catch {
            setStatus("error");
        }
    }, [id]);

    useEffect(() => {
        if (id) fetchOrder();
    }, [id, fetchOrder]);

    const handleBack = () => {
        router.push("/solicitudes/sucursales");
    };

    const handleDiscard = () => {
        if (originalOrder) {
            setOrder(JSON.parse(JSON.stringify(originalOrder)));
            setDeliveryDateErrors({});
        }
    };

    const validateDeliveryDates = (items: BranchOrderLineItem[]): Record<string, string> => {
        const errors: Record<string, string> = {};
        for (const item of items) {
            if (!item.deliveryDate.trim()) {
                errors[item.articleId] = DELIVERY_DATE_REQUIRED_MESSAGE;
            }
        }
        return errors;
    };

    const handleUpdate = async () => {
        if (!id || !order || !originalOrder) return;

        const errors = validateDeliveryDates(order.items);
        setDeliveryDateErrors(errors);
        if (Object.keys(errors).length > 0) return;

        setStatus("submitting");
        try {
            const quantityChanges = order.items.filter(
                (item, index) => item.quantity !== originalOrder.items[index].requestedQuantity
            );
            const scheduleChanges = order.items.filter(
                (item, index) => item.deliveryDate !== originalOrder.items[index].deliveryDate
            );

            if (quantityChanges.length > 0) {
                const payload: UpdateBranchRequestPayload = {
                    items: order.items.map((item, index) => ({
                        id: originalOrder.items[index].orderItemId,
                        product_id: item.productId,
                        requested_quantity: item.quantity,
                        unit_price: 0,
                        scheduled_delivery_date: item.deliveryDate || undefined,
                    })),
                };
                await updateBranchRequest(parseInt(id, 10), payload);
            }

            if (scheduleChanges.length > 0 && quantityChanges.length === 0) {
                const payload: ScheduleBranchRequestPayload = {
                    items: order.items.map((item) => ({
                        order_item_id: item.orderItemId,
                        scheduled_delivery_date: item.deliveryDate,
                    })),
                };
                await scheduleBranchRequest(parseInt(id, 10), payload);
            }

            await fetchOrder();
        } catch {
            setStatus("error");
        } finally {
            setStatus((prev) => (prev === "submitting" ? "success" : prev));
        }
    };

    const handleDeliveryDateChange = (articleId: string, date: string) => {
        setOrder((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                items: prev.items.map((item) =>
                    item.articleId === articleId ? { ...item, deliveryDate: date } : item
                ),
            };
        });
        setDeliveryDateErrors((prev) => {
            if (!prev[articleId]) return prev;
            const next = { ...prev };
            delete next[articleId];
            return next;
        });
    };

    const handleQuantityChange = (articleId: string, quantity: number) => {
        setOrder((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                items: prev.items.map((item) =>
                    item.articleId === articleId ? { ...item, quantity } : item
                ),
            };
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { label: "Pedidos", href: "/solicitudes/sucursales" },
        { label: order?.folio ?? id ?? "" },
    ];

    if (status === "loading" && !order) {
        return (
            <MainLayout>
                <Breadcrumbs items={breadcrumbs} showBackButton onBack={handleBack} />
                <Stack alignItems="center" justifyContent="center" minHeight={400}>
                    <CircularProgress />
                </Stack>
            </MainLayout>
        );
    }

    if (status === "empty") {
        return (
            <MainLayout>
                <Breadcrumbs items={breadcrumbs} showBackButton onBack={handleBack} />
                <Stack spacing={2} sx={{ marginTop: 3 }} alignItems="center">
                    <Typography variant="body1" color="text.secondary">
                        No se encontró el pedido.
                    </Typography>
                    <Button variant="contained" onClick={handleBack}>
                        Volver a solicitudes
                    </Button>
                </Stack>
            </MainLayout>
        );
    }

    if (status === "error") {
        return (
            <MainLayout>
                <Breadcrumbs items={breadcrumbs} showBackButton onBack={handleBack} />
                <Stack spacing={2} sx={{ marginTop: 3 }} alignItems="center">
                    <Typography variant="body1" color="error">
                        Error al cargar el pedido.
                    </Typography>
                    <Button variant="contained" onClick={() => id && fetchOrder()}>
                        Reintentar
                    </Button>
                </Stack>
            </MainLayout>
        );
    }

    if (!order) return null;

    const isEditable = isBranchOrderEditable(order.status);
    const isSubmitting = status === "submitting";

    return (
        <MainLayout>
            <Stack direction="row" justifyContent="space-between">
                <Breadcrumbs items={breadcrumbs} showBackButton onBack={handleBack} />
                {isEditable && (
                    <Stack direction="row" spacing={2}>
                        <Button
                            variant="outlined"
                            onClick={handleDiscard}
                            disabled={isSubmitting}
                        >
                            Descartar cambios
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleUpdate}
                            disabled={isSubmitting}
                        >
                            {isSubmitting
                                ? <CircularProgress size={24} color="inherit" />
                                : "Actualizar pedido"}
                        </Button>
                    </Stack>
                )}
            </Stack>

            <PageContainer>
                <Stack spacing={3}>
                    <Stack spacing={0.5}>
                        <Typography variant="caption" color="text.secondary">Factura</Typography>
                        <Typography variant="h4">Pedido {order.folio}</Typography>
                        <Typography variant="body2" color="text.secondary">Creado el {formatCreatedDate(order.createdAt)}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body1">Pedido:</Typography>
                        <StatusChip
                            size="small"
                            label={getBranchOrderStatusLabel(order.status)}
                            variant={getBranchOrderStatusVariant(order.status)}
                        />
                    </Stack>
                </Stack>

                <Divider />

                <OriginDestinationCard>
                    <Stack>
                        <Typography variant="subtitle1">{order.originLabel}</Typography>
                        <Typography variant="body2" color="text.secondary">Origen</Typography>
                    </Stack>
                    <ArrowRight size={16} color={theme.palette.text.secondary} />
                    <Stack>
                        <Typography variant="subtitle1">{order.destinationLabel}</Typography>
                        <Typography variant="body2" color="text.secondary">Por recibir</Typography>
                    </Stack>
                </OriginDestinationCard>

                <ProductsSection>
                    <ProductHeaderSection>
                        <Typography variant="subtitle2" color="text.secondary" flex={6}>Nombre</Typography>
                        <Typography variant="subtitle2" color="text.secondary" flex={2}>Fecha de entrega</Typography>
                        <Typography variant="subtitle2" color="text.secondary" flex={2}>Pedido</Typography>
                    </ProductHeaderSection>
                    <Divider />
                    <Stack divider={<Divider />}>
                        {order.items.map((item) => (
                            <BranchOrderItemRow
                                key={item.articleId}
                                item={item}
                                dateError={deliveryDateErrors[item.articleId]}
                                disabled={!isEditable || isSubmitting}
                                onDeliveryDateChange={handleDeliveryDateChange}
                                onQuantityChange={handleQuantityChange}
                            />
                        ))}
                    </Stack>
                </ProductsSection>
            </PageContainer>
        </MainLayout>
    );
}
