import { Box, Grid, Stack, Typography } from "@mui/material";
import { ArrowForward as ArrowForwardIcon } from "@mui/icons-material";
import {
    Card,
    ProgressBarContainer,
    ProgressBarFill,
    EmptyContainer,
} from "./styles";
import type { OrderStatus } from "./styles";
import { StatusChip, StatusChipVariant } from "../StatusChip";

export type { OrderStatus } from "./styles";

export interface OrderCardData {
    id: number;
    supplier: string;
    supplierDate: string;
    destination: string;
    deliveryDate: string;
    itemCount: number;
    status: OrderStatus;
    progress: number;
}

interface OrderCardProps {
    order: OrderCardData;
    onClick?: (order: OrderCardData) => void;
}

function getStatusLabel(status: OrderStatus): string {
    const labels: Record<OrderStatus, string> = {
        pending: "Por recibir",
        in_progress: "En curso",
        received: "Recibido",
    };
    return labels[status];
}

function getStatusVariant(status: OrderStatus): StatusChipVariant {
    const variants: Record<OrderStatus, string> = {
        pending: "pending",
        in_progress: "info",
        received: "success",
    };

    return variants[status] as StatusChipVariant;
}

function getProgressColor(status: OrderStatus): string {
    switch (status) {
        case "received":
            return "#16a34a";
        case "in_progress":
            return "#16a34a";
        case "pending":
            return "#ea580c";
        default:
            return "#d1d5db";
    }
}

export function OrderCard({ order, onClick }: OrderCardProps) {
    const statusVariant: StatusChipVariant = getStatusVariant(order.status);
    const progressColor = getProgressColor(order.status);

    const handleClick = () => {
        onClick?.(order);
    };

    return (
        <Card onClick={handleClick}>
            <Grid container spacing={2}>
                <Grid size={12}>
                    <ProgressBarContainer>
                        <ProgressBarFill fillColor={progressColor} progress={order.progress} />
                    </ProgressBarContainer>
                </Grid>
                <Grid size={12}>
                    <Stack direction={{ xs: "column", md: "row" }} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between" spacing={{ xs: 2, md: 0 }}>
                        <Stack direction="row" alignItems="center" width="100%" spacing={2} flex={5}>
                            <Stack spacing={0.5} width="100%" flex={3}>
                                <Typography variant="body1" fontWeight={500}>{order.supplier}</Typography>
                                <Typography variant="body2" color="text.secondary">{order.supplierDate}</Typography>
                            </Stack>
                            <ArrowForwardIcon sx={{ fontSize: 20 }} />
                            <Stack spacing={0.5} width="100%" flex={3}>
                                <Typography variant="body1" fontWeight={500}>{order.destination}</Typography>
                                <Typography variant="body2" color="text.secondary">Entrega: {order.deliveryDate}</Typography>
                            </Stack>
                        </Stack>
                        <Stack direction="row" alignItems="center" justifyContent={{ xs: "flex-start", md: "flex-end" }} spacing={2} flex={2}>
                            <Typography variant="body2">{order.itemCount} artículos</Typography>
                            <StatusChip
                                label={getStatusLabel(order.status)}
                                size="small"
                                variant={statusVariant}
                            />
                        </Stack>
                    </Stack>
                </Grid>
            </Grid>
        </Card>
    );
}
        
interface OrderListProps {
    orders: OrderCardData[];
    onOrderClick?: (order: OrderCardData) => void;
    loading?: boolean;
    emptyMessage?: string;
}

export function OrderList({
    orders,
    onOrderClick,
    loading,
    emptyMessage = "No hay pedidos",
}: OrderListProps) {
    if (loading) {
        return (
            <Stack direction="column" spacing={2}>
                {[1, 2, 3].map((i) => (
                    <Card key={i} sx={{ opacity: 0.5 }}>
                        <ProgressBarContainer>
                            <ProgressBarFill fillColor="#d1d5db" progress={60} />
                        </ProgressBarContainer>
                        <Stack direction={{ xs: "column", md: "row" }} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between" spacing={{ xs: 2, md: 0 }}>
                            <Box sx={{ height: 40, width: "100%" }} />
                        </Stack>
                    </Card>
                ))}
            </Stack>
        );
    }

    if (orders.length === 0) {
        return (
            <EmptyContainer>
                <Typography variant="body2">{emptyMessage}</Typography>
            </EmptyContainer>
        );
    }

    return (
        <Stack direction="column" spacing={2}>
            {
                orders.map((order) => (
                    <OrderCard key={order.id} order={order} onClick={onOrderClick} />
                ))
            }
        </Stack>
    );
}
