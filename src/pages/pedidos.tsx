import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import { Divider, Stack } from "@mui/material";
import { Title, OrderList, SuggestionsCard, SupplierSelectionModal, TabFilters } from "@/components";
import type { TitleAction } from "@/components/Title";
import type { TabItem } from "@/components/Tabs";
import type { OrderCardData } from "@/components/OrderCard";
import type { ProductSuggestion } from "@/types/suggestions.types";
import type { Supplier } from "@/types/pedidos.types";
import type { OrderListItem } from "@/types/orders.types";
import { getOrders, getSuggestions } from "@/services/orders.service";
import { SidebarPanel } from "@/styles/pedidos.styles";
import { ORDERS_CREATE } from "@/lib/permissions";
import dayjs from "@/lib/dayjs";

type OrderStatus = "pending" | "in_progress" | "received";

function mapBackendOrderToCardData(order: OrderListItem): OrderCardData {
    const totalRequested = order.order_items.reduce((sum, item) => sum + item.requested_quantity, 0);
    const totalDelivered = order.order_items.reduce((sum, item) => sum + item.delivered_quantity, 0);
    const progress = totalRequested > 0 ? Math.round((totalDelivered / totalRequested) * 100) : 0;

    let status: OrderStatus = "pending";
    if (order.status === "delivered") {
        status = "received";
    } else if (order.status === "partially_delivered") {
        status = "in_progress";
    } else if (order.status === "cancelled") {
        status = "pending";
    }

    const orderDate = dayjs(order.order_date);
    const estimatedDelivery = orderDate.add(7, "day");

    return {
        id: order.id,
        supplier: order.supplier?.name ?? "Sin proveedor",
        supplierDate: orderDate.toDate(),
        destination: order.branch?.name ?? "Bodega",
        deliveryDate: estimatedDelivery.toDate(),
        itemCount: order.order_items.length,
        status,
        progress,
    };
}

export default function Pedidos() {
    const router = useRouter();

    const [orders, setOrders] = useState<OrderCardData[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all");
    const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
    const [suggestionsLoading, setSuggestionsLoading] = useState(true);
    const [supplierModalOpen, setSupplierModalOpen] = useState(false);

    const tabs: TabItem[] = [
        { value: "all", label: "Todos" },
        { value: "pending", label: "Por recibir" },
        { value: "in_progress", label: "En curso" },
        { value: "received", label: "Recibidos" },
    ];

    const statusFilter = useMemo(() => {
        if (activeTab === "all") return undefined;
        if (activeTab === "pending") return "pending";
        if (activeTab === "in_progress") return "partially_delivered";
        if (activeTab === "received") return "delivered";
        return undefined;
    }, [activeTab]);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const result = await getOrders({
                page: 1,
                limit: 50,
                status: statusFilter,
            });
            if (result.data) {
                const mappedOrders = result.data.rows.map(mapBackendOrderToCardData);
                setOrders(mappedOrders);
            }
        } catch (err) {
            console.error("[Pedidos] Error fetching orders:", err);
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    const fetchSuggestions = useCallback(async () => {
        setSuggestionsLoading(true);
        try {
            const result = await getSuggestions(10);
            if (result.data) {
                setSuggestions(result.data);
            }
        } catch (err) {
            console.error("[Pedidos] Error fetching suggestions:", err);
        } finally {
            setSuggestionsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
        fetchSuggestions();
    }, [fetchOrders, fetchSuggestions]);

    const handleTabChange = (value: string) => {
        setActiveTab(value);
    };

    const handleCreateOrder = () => {
        setSupplierModalOpen(true);
    };

    const handleSupplierSelect = (supplier: Supplier) => {
        router.push({
            pathname: "/pedidos/nuevo",
            query: {
                supplierId: supplier.id,
                supplierName: supplier.name,
            },
        });
    };

    const handleCloseSupplierModal = () => {
        setSupplierModalOpen(false);
    };

    const handleOrderClick = (order: OrderCardData) => {
        router.push(`/pedidos/${order.id}`);
    };

    const titleActions: TitleAction[] = [
        {
            id: "new-order",
            label: "Nuevo pedido",
            onClick: handleCreateOrder,
            variant: "contained",
            color: "primary",
            permission: ORDERS_CREATE,
        },
    ];

    return (
        <>
            <Stack direction={{ xs: "column", md: "row" }} spacing={3} divider={<Divider orientation="vertical" flexItem />}>
                <Stack direction="column" spacing={3} flex="1 1 768px">
                    <Title title="Pedidos" actions={titleActions} />

                    <TabFilters
                        tabs={tabs}
                        activeTab={activeTab}
                        onTabChange={handleTabChange}
                    />

                    <OrderList
                        orders={orders}
                        onOrderClick={handleOrderClick}
                        loading={loading}
                        emptyMessage="No hay pedidos"
                    />
                </Stack>

                <SidebarPanel>
                    <SuggestionsCard products={suggestions} loading={suggestionsLoading} />
                </SidebarPanel>
            </Stack>

            <SupplierSelectionModal
                open={supplierModalOpen}
                onClose={handleCloseSupplierModal}
                onSelect={handleSupplierSelect}
            />
        </>
    );
}
