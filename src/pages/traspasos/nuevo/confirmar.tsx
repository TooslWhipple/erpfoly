import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { Box, Typography, Button, CircularProgress, Stack, Grid } from "@mui/material";
import { Breadcrumbs } from "@/components";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import { SummaryCard, } from "@/styles/pedidos/confirmar.styles";
import { ConfirmOrderItemCard } from "@/components/ConfirmOrderItemCard";
import type { ConfirmOrderItem } from "@/components/ConfirmOrderItemCard";
import { createOrderWithItems } from "@/services/orders.service";
import { getMainWarehouse } from "@/services/branches.service";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { buildPlaceholderOnlinePrices } from "@/lib/onlinePrices";
import dayjs from "@/lib/dayjs";

interface ConfirmOrderData {
    orderType: "external" | "internal";
    supplierId?: string;
    supplierName?: string;
    branchId?: string;
    branchName?: string;
    originBranchId?: string;
    originBranchName?: string;
    items: ConfirmOrderItem[];
    total: number;
}

const IVA_RATE = 0.16;

function withPlaceholderOnlinePrices(item: ConfirmOrderItem): ConfirmOrderItem {
    if (item.onlinePrices) return item;

    return {
        ...item,
        onlinePrices: buildPlaceholderOnlinePrices(item.unitPrice),
    };
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        minimumFractionDigits: 2,
    }).format(value);
}

export default function ConfirmarTraspasoPage() {
    const router = useRouter();
    const [orderData, setOrderData] = useState<ConfirmOrderData | null>(null);
    const [items, setItems] = useState<ConfirmOrderItem[]>([]);
    const [status, setStatus] = useState<"loading" | "idle" | "submitting" | "empty" | "error">("loading");
    const { showError, showSuccess } = useSnackbarStore();

    useEffect(() => {
        if (typeof window === "undefined") return;

        const stored = sessionStorage.getItem("newOrderData");
        if (stored) {
            try {
                const parsed = JSON.parse(stored) as ConfirmOrderData;
                if (parsed.items?.length) {
                    setOrderData(parsed);
                    const isInternal = parsed.orderType === "internal";
                    setItems(
                        isInternal
                            ? parsed.items
                            : parsed.items.map(withPlaceholderOnlinePrices)
                    );
                    setStatus("idle");
                } else {
                    setStatus("empty");
                }
            } catch {
                setStatus("empty");
            }
        } else {
            setStatus("empty");
        }
    }, []);

    const isInternalOrder = orderData?.orderType === "internal";

    const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.totalPrice, 0), [items]);
    const iva = useMemo(() => subtotal * IVA_RATE, [subtotal]);
    const total = useMemo(() => subtotal + iva, [subtotal, iva]);
    const totalQuantity = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

    const handleBack = () => {
        if (orderData?.orderType === "internal") {
            router.push({
                pathname: "/traspasos/nuevo",
                query: {
                    orderType: "internal",
                    originBranchId: orderData.originBranchId,
                    originBranchName: orderData.originBranchName,
                    branchId: orderData.branchId,
                    branchName: orderData.branchName,
                },
            });
            return;
        }

        router.push({
            pathname: "/pedidos/nuevo",
            query: orderData?.supplierId && orderData?.supplierName
                ? { supplierId: orderData.supplierId, supplierName: orderData.supplierName }
                : undefined,
        });
    };

    const handleQuantityChange = (productId: number, quantity: number) => {
        if (quantity <= 0) return;
        setItems((prev) =>
            prev.map((item) =>
                item.productId === productId
                    ? { ...item, quantity, totalPrice: item.unitPrice * quantity }
                    : item
            )
        );
    };

    const handleSolicitarPedido = async () => {
        if (!items.length || !orderData) return;
        setStatus("submitting");
        try {
            let branchId = 1;

            if (orderData.orderType === "external") {
                const mainWarehouse = await getMainWarehouse();
                if (!mainWarehouse) {
                    showError("No se encontró la sucursal matriz. Contacta a soporte.");
                    setStatus("error");
                    return;
                }
                branchId = mainWarehouse.id;
            } else if (orderData.orderType === "internal" && orderData.branchId) {
                if (
                    orderData.originBranchId
                    && Number(orderData.originBranchId) === Number(orderData.branchId)
                ) {
                    showError("La sucursal de origen y destino deben ser distintas.");
                    setStatus("error");
                    return;
                }
                if (!orderData.originBranchId) {
                    showError("Falta la sucursal de origen. Vuelve al formulario e intenta de nuevo.");
                    setStatus("error");
                    return;
                }
                branchId = Number(orderData.branchId);
            }

            const payload = {
                order_type: orderData.orderType,
                branch_id: branchId,
                origin_branch_id: orderData.orderType === "internal" && orderData.originBranchId
                    ? Number(orderData.originBranchId)
                    : undefined,
                folio: `PED-${Date.now()}`,
                order_date: dayjs().format("YYYY-MM-DD"),
                supplier_id: orderData.orderType === "external" && orderData.supplierId
                    ? Number(orderData.supplierId)
                    : undefined,
                items: items.map((item) => ({
                    product_id: item.productId,
                    requested_quantity: item.quantity,
                    unit_price: item.unitPrice,
                })),
            };

            const result = await createOrderWithItems(payload);

            if (result.error || !result.data) {
                const msg = result.error?.message || "Error al solicitar el pedido. Intenta de nuevo.";
                showError(msg);
                setStatus("error");
                return;
            }

            sessionStorage.removeItem("newOrderData");
            showSuccess(result.data?.message ?? "El pedido fue confirmado correctamente.");
            const returnUrl = orderData.orderType === "internal"
                ? "/traspasos"
                : `/pedidos/nuevo/resumen/${result.data.id}`;
            router.push(returnUrl);
        } catch (err) {
            const msg = err instanceof Error && err.message ? "Error al solicitar el pedido. Intenta de nuevo." : "Error al solicitar el pedido. Intenta de nuevo.";
            showError(msg);
            setStatus("error");
        } finally {
            setStatus((prev) => (prev === "submitting" ? "idle" : prev));
        }
    };

    const breadcrumbs: BreadcrumbItem[] = orderData
        ? [
            { label: "Traspasos", href: orderData.orderType === "internal" ? "/traspasos" : "/pedidos" },
            {
                label: orderData.orderType === "internal"
                    ? (orderData.branchName ? `Sucursal ${orderData.branchName}` : "Sucursales")
                    : (orderData.supplierName ? `Proveedor ${orderData.supplierName}` : "Proveedores"),
                href: orderData.orderType === "internal"
                    ? (orderData.branchId ? `/traspasos?branch=${orderData.branchId}` : "/traspasos")
                    : (orderData.supplierId ? `/pedidos?supplier=${orderData.supplierId}` : "/pedidos"),
            },
            { label: "Nuevo traspaso" },
        ]
        : [{ label: "Traspasos", href: "/traspasos" }, { label: "Nuevo traspaso" }];

    if (status === "loading") {
        return (
            <>
                <Stack direction="row" justifyContent="center" alignItems="center" sx={{ minHeight: 400 }}>
                    <CircularProgress />
                </Stack>
            </>
        );
    }

    if (status === "empty") {
        return (
            <>
                <Breadcrumbs items={breadcrumbs} showBackButton onBack={handleBack} />
                <Box sx={{ marginTop: 3, textAlign: "center" }}>
                    <Typography variant="body1" color="text.secondary">
                        No hay artículos para confirmar. Agrega artículos en el nuevo traspaso.
                    </Typography>
                    <Button variant="contained" onClick={handleBack} sx={{ marginTop: 2 }}>
                        Volver a nuevo traspaso
                    </Button>
                </Box>
            </>
        );
    }

    return (
        <>

            <Stack direction="column" spacing={3}>
                <Breadcrumbs items={breadcrumbs} showBackButton onBack={handleBack} />
                <Typography variant="h1">Confirmar artículos</Typography>

                <Grid container spacing={4}>
                    <Grid size={{ xs: 12, md: 7, lg: 8, xl: 9 }}>
                        <Stack spacing={2}>
                            {
                                items.map((item) => (
                                    <ConfirmOrderItemCard
                                        key={item.productId}
                                        item={item}
                                        readOnly={isInternalOrder}
                                        hidePrices={isInternalOrder}
                                        onQuantityChange={isInternalOrder ? undefined : handleQuantityChange}
                                    />
                                ))
                            }
                        </Stack>
                    </Grid>

                    <Grid size={{ xs: 12, md: 5, lg: 4, xl: 3 }}>
                        <SummaryCard>
                            <Stack spacing={2}>
                                {isInternalOrder ? (
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="body2" color="text.secondary">Total:</Typography>
                                        <Typography variant="h6" fontWeight={700}>{totalQuantity} {(totalQuantity) > 1 ? "Artículos" : "Artículo"}</Typography>
                                    </Stack>
                                ) : (
                                    <>
                                        <Stack direction="row" justifyContent="space-between">
                                            <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                                            <Typography variant="body1">{formatCurrency(subtotal)}</Typography>
                                        </Stack>
                                        <Stack direction="row" justifyContent="space-between">
                                            <Typography variant="body2" color="text.secondary">IVA</Typography>
                                            <Typography variant="body1">{formatCurrency(iva)}</Typography>
                                        </Stack>
                                        <Stack direction="row" justifyContent="space-between">
                                            <Typography variant="h6" fontWeight={700}>Total:</Typography>
                                            <Typography variant="h6" fontWeight={700}>{formatCurrency(total)}</Typography>
                                        </Stack>
                                    </>
                                )}
                                <Button
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    size="large"
                                    disabled={status === "submitting" || items.length === 0}
                                    onClick={handleSolicitarPedido}
                                    sx={{ textTransform: "none", fontWeight: 600 }}>
                                    {
                                        (status === "submitting") ?
                                            <CircularProgress size={24} color="inherit" />
                                            :
                                            isInternalOrder ? "Solicitar traspaso" : "Guardar pedido"
                                    }
                                </Button>
                            </Stack>
                        </SummaryCard>
                    </Grid>
                </Grid>
            </Stack>
        </>
    );
}
