import { styled } from "@mui/material/styles";
import { Box, Chip, Typography } from "@mui/material";
import { ArrowForward as ArrowForwardIcon } from "@mui/icons-material";
import { colors } from "@/styles/theme";

// ============================================================================
// TYPES
// ============================================================================

export type OrderStatus = "pending" | "in_progress" | "received";

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

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const CardContainer = styled(Box)(({ theme }) => ({
    backgroundColor: colors.background.sidebar,
    border: `1px solid ${colors.border}`,
    borderRadius: 8,
    padding: theme.spacing(2),
    cursor: "pointer",
    transition: "background-color 0.15s ease",
    "&:hover": {
        backgroundColor: colors.background.main,
    },
}));

const ProgressBarContainer = styled(Box)({
    position: "relative",
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 12,
    backgroundColor: "#e5e7eb",
});

interface ProgressBarFillProps {
    fillColor: string;
    progress: number;
}

const ProgressBarFill = styled(Box)<ProgressBarFillProps>(({ fillColor, progress }) => ({
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: `${progress}%`,
    backgroundColor: fillColor,
    borderRadius: 3,
    transition: "width 0.3s ease",
}));

const ContentRow = styled(Box)({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
});

const InfoSection = styled(Box)({
    display: "flex",
    flexDirection: "column",
    gap: 2,
    minWidth: 0,
    flex: 1,
});

const SupplierName = styled(Typography)({
    fontSize: 15,
    fontWeight: 500,
    color: "#232325",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
});

const DateText = styled(Typography)({
    fontSize: 13,
    color: "#71717A",
});

const ArrowContainer = styled(Box)({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#9CA3AF",
    flexShrink: 0,
    padding: "0 8px",
});

const DestinationSection = styled(Box)({
    display: "flex",
    flexDirection: "column",
    gap: 2,
    minWidth: 0,
    flex: 1,
});

const DestinationName = styled(Typography)({
    fontSize: 15,
    fontWeight: 500,
    color: "#232325",
});

const ItemCountText = styled(Typography)({
    fontSize: 14,
    color: "#71717A",
    whiteSpace: "nowrap",
    flexShrink: 0,
});

const StatusChip = styled(Chip)<{ statusType: OrderStatus }>(({ statusType }) => {
    const statusStyles: Record<OrderStatus, { bg: string; text: string }> = {
        received: { bg: "#dcfce7", text: "#16a34a" },
        in_progress: { bg: "#dbeafe", text: "#2563eb" },
        pending: { bg: "#ffedd5", text: "#ea580c" },
    };
    const style = statusStyles[statusType];
    return {
        backgroundColor: style.bg,
        color: style.text,
        fontWeight: 500,
        fontSize: 13,
        borderRadius: 6,
        height: 28,
    };
});

// ============================================================================
// HELPERS
// ============================================================================

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

// ============================================================================
// COMPONENT
// ============================================================================

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

// ============================================================================
// ORDER LIST COMPONENT
// ============================================================================

interface OrderListProps {
    orders: OrderCardData[];
    onOrderClick?: (order: OrderCardData) => void;
    loading?: boolean;
    emptyMessage?: string;
}

const ListContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
}));

const EmptyContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(6),
    color: "#71717A",
}));

export function OrderList({ orders, onOrderClick, loading, emptyMessage = "No hay pedidos" }: OrderListProps) {
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
