import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
    Button,
    CircularProgress,
    Divider,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Typography,
} from "@mui/material";
import { MainLayout, Breadcrumbs, BranchOrderItemRow } from "@/components";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import type { BranchOrderDetail, BranchOrderStatus } from "@/types/solicitudes.types";
import {
    OriginDestinationRow,
    PageContainer,
    ProductHeaderSection,
    ProductsSection,
    StatusValue
} from "@/styles/solicitudes/detalle.styles";
import { ArrowRight } from "lucide-react";
import { colors } from "@/styles/theme";

// ============================================================================
// MOCK DATA & API
// ============================================================================

const MOCK_ORIGINS = [
    { id: "warehouse", label: "Bodega" },
    { id: "matamoros", label: "Matamoros" },
];

const MOCK_DESTINATIONS = [
    { id: "matamoros-pedro", label: "Matamoros-Pedro Cárdenas" },
    { id: "tampico-centro", label: "Foly Muebles Tampico Centro" },
];

function buildMockOrder(id: number): BranchOrderDetail {
    return {
        id,
        folio: `FOL-${String(id).padStart(5, "0")}`,
        createdAt: "2025-10-02",
        status: "pending",
        originId: "warehouse",
        originLabel: "Bodega",
        destinationId: "matamoros-pedro",
        destinationLabel: "Matamoros-Pedro Cárdenas",
        items: [
            {
                articleId: "art-1",
                articleName: "Secadora Mabe 20kg SMG26N5MNBABO Blanca",
                deliveryDate: "2025-10-15",
                quantity: 5,
            },
            {
                articleId: "art-2",
                articleName: "Lavadora Samsung 18kg WA18T6260BY Blanca",
                deliveryDate: "2025-10-18",
                quantity: 7,
            },
            {
                articleId: "art-3",
                articleName: "Estufa Mabe 4 quemadores EM4442DBAB0 Blanca",
                deliveryDate: "2025-10-20",
                quantity: 3,
            },
        ],
    };
}

async function getBranchOrderDetail(orderId: string): Promise<BranchOrderDetail | null> {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const id = parseInt(orderId, 10);
    if (Number.isNaN(id) || id < 1) return null;
    return buildMockOrder(id);
}

async function updateBranchOrder(_orderId: string, _payload: Partial<BranchOrderDetail>): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return true;
}

// ============================================================================
// HELPERS
// ============================================================================

function formatCreatedDate(isoDate: string): string {
    const d = new Date(isoDate);
    return d.toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}

function getStatusLabel(status: BranchOrderStatus): string {
    const labels: Record<BranchOrderStatus, string> = {
        pending: "Pendiente",
        delivered: "Entregado",
    };
    return labels[status];
}

function getStatusChipBackgroundColor(status: BranchOrderStatus): string {
    return status === "pending" ? "#FFEDD5" : "#F3E8FF";
}

function getStatusChipColor(status: BranchOrderStatus): string {
    return status === "pending" ? "#EA580C" : "#7E22CE";
}

// ============================================================================
// PAGE
// ============================================================================

type PageStatus = "loading" | "success" | "empty" | "error" | "submitting";

export default function SolicitudSucursalDetallePage() {
    const router = useRouter();
    const id = typeof router.query.id === "string" ? router.query.id : null;

    const [status, setStatus] = useState<PageStatus>("loading");
    const [order, setOrder] = useState<BranchOrderDetail | null>(null);
    const [originId, setOriginId] = useState<string>("");
    const [destinationId, setDestinationId] = useState<string>("");

    const fetchOrder = useCallback(async () => {
        if (!id) return;
        setStatus("loading");
        try {
            const data = await getBranchOrderDetail(id);
            if (data) {
                setOrder(data);
                setOriginId(data.originId);
                setDestinationId(data.destinationId);
                setStatus("success");
            } else {
                setOrder(null);
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
        if (id) fetchOrder();
    };

    const handleUpdate = async () => {
        if (!id || !order) return;
        setStatus("submitting");
        try {
            const success = await updateBranchOrder(id, {
                originId,
                destinationId,
                items: order.items,
            });
            if (success) {
                const updated = await getBranchOrderDetail(id);
                if (updated) {
                    setOrder(updated);
                    setOriginId(updated.originId);
                    setDestinationId(updated.destinationId);
                }
            } else {
                setStatus("error");
            }
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
        { label: id ?? "" },
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

    return (
        <MainLayout>
            <Stack direction="row" justifyContent="space-between">
                <Breadcrumbs items={breadcrumbs} showBackButton onBack={handleBack} />
                <Stack direction="row" spacing={2}>
                    <Button variant="outlined" onClick={handleDiscard} disabled={status === "submitting"}>
                        Descartar cambios
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleUpdate}
                        disabled={status === "submitting"}>
                        {
                            (status === "submitting") ? <CircularProgress size={24} color="inherit" /> : "Actualizar pedido"
                        }
                    </Button>
                </Stack>
            </Stack>

            <PageContainer>
                <Stack spacing={3}>
                    <Stack spacing={0.5}>
                        <Typography variant="caption" color="text.secondary">Factura</Typography>
                        <Typography variant="h4">Pedido {order.id}</Typography>
                        <Typography variant="body2" color="text.secondary">Creado el {formatCreatedDate(order.createdAt)}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body1">Pedido:</Typography>
                        <StatusValue
                            color={getStatusChipColor(order.status)}
                            backgroundColor={getStatusChipBackgroundColor(order.status)}>
                            <Typography variant="body1">{getStatusLabel(order.status)}</Typography>
                        </StatusValue>
                    </Stack>
                </Stack>

                <OriginDestinationRow>
                    <FormControl size="small">
                        <InputLabel id="origin-label">Origen</InputLabel>
                        <Select
                            labelId="origin-label"
                            value={originId}
                            label="Origen"
                            onChange={(e) => setOriginId(e.target.value)}
                        >
                            {MOCK_ORIGINS.map((o) => (
                                <MenuItem key={o.id} value={o.id}>
                                    {o.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <ArrowRight size={12} color={colors.text.secondary} />
                    <FormControl size="small">
                        <InputLabel id="destination-label">Por recibir</InputLabel>
                        <Select
                            labelId="destination-label"
                            value={destinationId}
                            label="Por recibir"
                            onChange={(e) => setDestinationId(e.target.value)}
                        >
                            {MOCK_DESTINATIONS.map((d) => (
                                <MenuItem key={d.id} value={d.id}>
                                    {d.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </OriginDestinationRow>

                <ProductsSection>
                    <ProductHeaderSection>
                        <Typography variant="subtitle2" color="text.secondary" flex={6}>Nombre</Typography>
                        <Typography variant="subtitle2" color="text.secondary" flex={2}>Fecha de entrega</Typography>
                        <Typography variant="subtitle2" color="text.secondary" flex={2}>Pedido</Typography>
                    </ProductHeaderSection>
                    <Divider />
                    <Stack>
                        {
                            order.items.map((item) => (
                                <BranchOrderItemRow
                                    key={item.articleId}
                                    item={item}
                                    onDeliveryDateChange={handleDeliveryDateChange}
                                    onQuantityChange={handleQuantityChange}
                                />
                            ))
                        }
                    </Stack>
                </ProductsSection>
            </PageContainer>
        </MainLayout>
    );
}
