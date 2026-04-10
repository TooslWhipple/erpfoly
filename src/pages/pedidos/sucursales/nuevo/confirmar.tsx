import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Box, Typography, Button, CircularProgress, Stack, Grid } from "@mui/material";
import { MainLayout, Breadcrumbs, OrderItemCard } from "@/components";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import type { OrderItem } from "@/types/pedidos.types";
import {
    PageContainer,
    PageHeader,
    SummaryCard,
} from "@/styles/pedidos/confirmar.styles";

export interface ConfirmarOrderState {
    orderItems: OrderItem[];
    supplierId?: string;
    supplierName?: string;
}

async function submitOrder(_payload: {
    items: OrderItem[];
    supplierId?: string;
}): Promise<{ success: boolean; orderId?: string }> {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return { success: true, orderId: "FOL-" + Date.now() };
}

export default function ConfirmarArticulosPage() {
    const router = useRouter();
    const [state, setState] = useState<ConfirmarOrderState | null>(null);
    const [status, setStatus] = useState<"idle" | "loading" | "submitting" | "empty" | "error">("idle");

    useEffect(() => {
        if (typeof window === "undefined") return;

        const stored = sessionStorage.getItem("pedidos-confirmar-state");
        if (stored) {
            try {
                const parsed = JSON.parse(stored) as ConfirmarOrderState;
                if (parsed.orderItems?.length) {
                    setState(parsed);
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

    const orderItems = state?.orderItems ?? [];
    const supplierName = state?.supplierName;
    const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0);

    const handleBack = () => {
        router.push({
            pathname: "/pedidos/sucursales/nuevo",
            query: state?.supplierId && state?.supplierName
                ? { supplierId: state.supplierId, supplierName: state.supplierName }
                : undefined,
        });
    };

    const handleSolicitarPedido = async () => {
        if (!orderItems.length) return;
        setStatus("submitting");
        try {
            const result = await submitOrder({
                items: orderItems,
                supplierId: state?.supplierId,
            });
            if (result.success) {
                sessionStorage.removeItem("pedidos-confirmar-state");
                router.push("/pedidos/sucursales");
            } else {
                setStatus("error");
            }
        } catch {
            setStatus("error");
        } finally {
            setStatus((prev) => (prev === "submitting" ? "idle" : prev));
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { label: "Pedidos", href: "/pedidos" },
        {
            label: supplierName ? `Sucursal ${supplierName}` : "Sucursales",
            href: state?.supplierId ? `/pedidos/sucursales?supplier=${state.supplierId}` : "/pedidos/sucursales",
        },
        { label: "Nuevo pedido" },
    ];

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

    if (!state) {
        return (
            <MainLayout>
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
                    <CircularProgress />
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

                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 8, lg: 9 }}>
                        <Stack spacing={2}>
                            {
                                orderItems.map((item, index) => (
                                    <OrderItemCard key={`${item.articleId}-${index}`} item={item} />
                                ))
                            }
                        </Stack>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4, lg: 3 }}>
                        <SummaryCard>
                            <Stack spacing={2} direction="row" justifyContent="space-between">
                                <Typography variant="h5" fontWeight={700}>Total:</Typography>
                                <Typography variant="h5" fontWeight={700}>{totalItems} {(totalItems) === 1 ? "artículo" : "artículos"}</Typography>
                            </Stack>
                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                disabled={status === "submitting"}
                                onClick={handleSolicitarPedido}
                            >
                                {status === "submitting" ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    "Solicitar pedido"
                                )}
                            </Button>
                        </SummaryCard>
                    </Grid>


                </Grid>
            </PageContainer>
        </MainLayout>
    );
}
