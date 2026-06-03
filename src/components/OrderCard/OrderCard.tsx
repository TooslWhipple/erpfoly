import { Box, Typography } from "@mui/material";
import { ArrowForward as ArrowForwardIcon } from "@mui/icons-material";
import {
    CardContainer,
    ProgressBarContainer,
    ProgressBarFill,
    ContentRow,
    InfoSection,
    SupplierName,
    DateText,
    ArrowContainer,
    DestinationSection,
    DestinationName,
    ItemCountText,
    StatusChip,
    ListContainer,
    EmptyContainer,
} from "./styles";
import type { OrderStatus } from "./styles";

export type { OrderStatus } from "./styles";

export interface OrderCardData {
    id: number;
    supplier: string;
    supplierDate: string;
    destination: string;
    deliveryDate: string;
    itemCount: number;
    status: OrderStatus;
    /** Progress percentage 0-100 */
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
    const progressColor = getProgressColor(order.status);

    const handleClick = () => {
        onClick?.(order);
    };

    return (
        <CardContainer onClick={handleClick}>
            <ProgressBarContainer>
                <ProgressBarFill fillColor={progressColor} progress={order.progress} />
            </ProgressBarContainer>

            <ContentRow>
                <InfoSection>
                    <SupplierName>{order.supplier}</SupplierName>
                    <DateText>{order.supplierDate}</DateText>
                </InfoSection>

                <ArrowContainer>
                    <ArrowForwardIcon sx={{ fontSize: 20 }} />
                </ArrowContainer>

                <DestinationSection>
                    <DestinationName>{order.destination}</DestinationName>
                    <DateText>Entrega: {order.deliveryDate}</DateText>
                </DestinationSection>

                <ItemCountText>{order.itemCount} artículos</ItemCountText>

                <StatusChip
                    label={getStatusLabel(order.status)}
                    size="small"
                    statusType={order.status}
                />
            </ContentRow>
        </CardContainer>
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
            <ListContainer>
                {[1, 2, 3].map((i) => (
                    <CardContainer key={i} sx={{ opacity: 0.5 }}>
                        <ProgressBarContainer>
                            <ProgressBarFill fillColor="#d1d5db" progress={60} />
                        </ProgressBarContainer>
                        <ContentRow>
                            <Box sx={{ height: 40, width: "100%" }} />
                        </ContentRow>
                    </CardContainer>
                ))}
            </ListContainer>
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
        <ListContainer>
            {orders.map((order) => (
                <OrderCard key={order.id} order={order} onClick={onOrderClick} />
            ))}
        </ListContainer>
    );
}
