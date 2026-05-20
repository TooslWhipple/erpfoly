import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { Box, Typography, Button, CircularProgress, Stack, Grid, Divider } from "@mui/material";
import { MainLayout, Breadcrumbs } from "@/components";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import {
    PageContainer,
    PageHeader,
    SummaryCard,
    ItemCard,
    ItemImage,
} from "@/styles/pedidos/confirmar.styles";
import {
    StepperContainer,
    StepperButton,
    StepperInput,
} from "@/components/SelectedItemsPanel/styles";
import { createOrderWithItems } from "@/services/orders.service";
import { getMainWarehouse } from "@/services/branches.service";

interface ConfirmOrderItem {
    productId: number;
    productCode: string;
    productName: string;
    previewImage: string | null;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

interface ConfirmOrderData {
    orderType: "external" | "internal";
    supplierId?: string;
    supplierName?: string;
    branchId?: string;
    branchName?: string;
    items: ConfirmOrderItem[];
    total: number;
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        minimumFractionDigits: 2,
    }).format(value);
}

export default function ConfirmarArticulosPage() {
    const router = useRouter();
    const [orderData, setOrderData] = useState<ConfirmOrderData | null>(null);
    const [items, setItems] = useState<ConfirmOrderItem[]>([]);
    const [status, setStatus] = useState<"loading" | "idle" | "submitting" | "empty" | "error">("loading");

    useEffect(() => {
        if (typeof window === "undefined") return;

        const stored = sessionStorage.getItem("newOrderData");
        if (stored) {
            try {
                const parsed = JSON.parse(stored) as ConfirmOrderData;
                if (parsed.items?.length) {
                    setOrderData(parsed);
                    setItems(parsed.items);
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

    const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
    const totalPrice = useMemo(() => items.reduce((sum, item) => sum + item.totalPrice, 0), [items]);

    const supplierName = orderData?.supplierName;

    const handleBack = () => {
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

    const handleDecrement = (productId: number) => {
        const item = items.find((i) => i.productId === productId);
        if (item && item.quantity > 1) {
            handleQuantityChange(productId, item.quantity - 1);
        }
    };

    const handleIncrement = (productId: number) => {
        const item = items.find((i) => i.productId === productId);
        if (item) {
            handleQuantityChange(productId, item.quantity + 1);
        }
    };

    const handleInputChange = (productId: number, raw: string) => {
        if (raw === "") return;
        const parsed = parseInt(raw, 10);
        if (Number.isFinite(parsed) && parsed > 0) {
            handleQuantityChange(productId, parsed);
        }
    };

    const handleSolicitarPedido = async () => {
        if (!items.length || !orderData) return;
        setStatus("submitting");
        try {
            let branchId = 1;

            if (orderData.orderType === "external") {
                const mainWarehouse = await getMainWarehouse();
                if (!mainWarehouse) {
                    console.error("[ConfirmarPedido] No se encontró la matriz");
                    setStatus("error");
                    return;
                }
                branchId = mainWarehouse.id;
            } else if (orderData.orderType === "internal" && orderData.branchId) {
                branchId = Number(orderData.branchId);
            }

            const payload = {
                order_type: orderData.orderType,
                branch_id: branchId,
                folio: `PED-${Date.now()}`,
                order_date: new Date().toISOString().split("T")[0],
                items: items.map((item) => ({
                    product_id: item.productId,
                    requested_quantity: item.quantity,
                    unit_price: item.unitPrice,
                })),
            };

            const result = await createOrderWithItems(payload);

            if (result.error || !result.data) {
                console.error("[ConfirmarPedido] Error:", result.error);
                setStatus("error");
                return;
            }

            sessionStorage.removeItem("newOrderData");
            const returnUrl = orderData.orderType === "internal"
                ? "/pedidos/sucursales"
                : `/pedidos/nuevo/resumen/${result.data.id}`;
            router.push(returnUrl);
        } catch (err) {
            console.error("[ConfirmarPedido] Exception:", err);
            setStatus("error");
        } finally {
            setStatus((prev) => (prev === "submitting" ? "idle" : prev));
        }
    };

    const breadcrumbs: BreadcrumbItem[] = orderData
        ? [
            { label: "Pedidos", href: orderData.orderType === "internal" ? "/pedidos/sucursales" : "/pedidos" },
            {
                label: orderData.orderType === "internal"
                    ? (orderData.branchName ? `Sucursal ${orderData.branchName}` : "Sucursales")
                    : (orderData.supplierName ? `Proveedor ${orderData.supplierName}` : "Proveedores"),
                href: orderData.orderType === "internal"
                    ? (orderData.branchId ? `/pedidos/sucursales?branch=${orderData.branchId}` : "/pedidos/sucursales")
                    : (orderData.supplierId ? `/pedidos?supplier=${orderData.supplierId}` : "/pedidos"),
            },
            { label: "Nuevo pedido" },
        ]
        : [{ label: "Pedidos", href: "/pedidos" }, { label: "Nuevo pedido" }];

    if (status === "loading") {
        return (
            <MainLayout>
                <Stack direction="row" justifyContent="center" alignItems="center" sx={{ minHeight: 400 }}>
                    <CircularProgress />
                </Stack>
            </MainLayout>
        );
    }

    if (status === "empty") {
        return (
            <MainLayout>
                <Breadcrumbs items={breadcrumbs} showBackButton onBack={handleBack} />
                <Box sx={{ marginTop: 3, textAlign: "center" }}>
                    <Typography variant="body1" color="text.secondary">
                        No hay artículos para confirmar. Agrega artículos en el nuevo pedido.
                    </Typography>
                    <Button variant="contained" onClick={handleBack} sx={{ marginTop: 2 }}>
                        Volver a nuevo pedido
                    </Button>
                </Box>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <Breadcrumbs items={breadcrumbs} showBackButton onBack={handleBack} />

            <PageContainer>
                <PageHeader>
                    <Typography variant="h1">Confirmar artículos</Typography>
                </PageHeader>

                <Grid container spacing={4}>
                    <Grid size={{ xs: 12, md: 8, xl: 9 }}>
                        <Stack spacing={2}>
                            {items.map((item) => (
                                <ItemCard key={item.productId}>
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
                                            }}
                                        >
                                            {item.previewImage ? (
                                                <Box
                                                    component="img"
                                                    src={item.previewImage}
                                                    alt={item.productName}
                                                    sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                />
                                            ) : (
                                                <ItemImage />
                                            )}
                                        </Box>

                                        <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                                                {item.productCode}
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
                                                {item.productName}
                                            </Typography>
                                        </Stack>

                                        <Stack spacing={0.5} sx={{ minWidth: 80, textAlign: "center" }}>
                                            <Typography variant="body2" color="text.secondary">Precio</Typography>
                                            <Typography variant="body1">{formatCurrency(item.unitPrice)}</Typography>
                                        </Stack>

                                        <Stack spacing={0.5} sx={{ minWidth: 100 }}>
                                            <Typography variant="body2" color="text.secondary" textAlign="center">
                                                Cantidad
                                            </Typography>
                                            <StepperContainer sx={{ justifyContent: "center" }}>
                                                <StepperButton
                                                    size="small"
                                                    onClick={() => handleDecrement(item.productId)}
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <line x1="5" y1="12" x2="19" y2="12" />
                                                    </svg>
                                                </StepperButton>
                                                <StepperInput
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => handleInputChange(item.productId, e.target.value)}
                                                    min={1}
                                                    max={9999}
                                                />
                                                <StepperButton
                                                    size="small"
                                                    onClick={() => handleIncrement(item.productId)}
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <line x1="12" y1="5" x2="12" y2="19" />
                                                        <line x1="5" y1="12" x2="19" y2="12" />
                                                    </svg>
                                                </StepperButton>
                                            </StepperContainer>
                                        </Stack>

                                        <Stack spacing={0.5} sx={{ minWidth: 100, textAlign: "right" }}>
                                            <Typography variant="body2" color="text.secondary">Total</Typography>
                                            <Typography variant="body1" fontWeight={700} color="primary.main">
                                                {formatCurrency(item.totalPrice)}
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                </ItemCard>
                            ))}
                        </Stack>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4, xl: 3 }}>
                        <SummaryCard>
                            <Stack spacing={2}>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">Artículos</Typography>
                                    <Typography variant="body1" fontWeight={600}>{totalItems}</Typography>
                                </Stack>
                                <Divider />
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="h5" fontWeight={700}>Total:</Typography>
                                    <Typography variant="h5" fontWeight={700} color="primary.main">
                                        {formatCurrency(totalPrice)}
                                    </Typography>
                                </Stack>
                            </Stack>
                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                size="large"
                                disabled={status === "submitting" || items.length === 0}
                                onClick={handleSolicitarPedido}
                            >
                                {status === "submitting" ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    "Solicitar pedido"
                                )}
                            </Button>
                            {status === "error" && (
                                <Typography variant="body2" color="error.main" textAlign="center">
                                    Error al solicitar el pedido. Intenta de nuevo.
                                </Typography>
                            )}
                        </SummaryCard>
                    </Grid>
                </Grid>
            </PageContainer>
        </MainLayout>
    );
}
