import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { MainLayout, Title, Tabs, OrderList } from "@/components";
import type { TitleAction } from "@/components/Title";
import type { TabItem } from "@/components/Tabs";
import type { OrderCardData } from "@/components/OrderCard";
import { PageContent, MainContent, TabsWrapper } from "@/styles/pedidos.styles";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type OrderStatus = "pending" | "in_progress" | "received";

interface GetOrdersParams {
    page: number;
    limit: number;
    status?: "all" | OrderStatus;
}

interface GetOrdersResponse {
    data: OrderCardData[];
    total: number;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const DUMMY_ORDERS: OrderCardData[] = [
    {
        id: 1,
        supplier: "Mabe S.A. de C.V.",
        supplierDate: "01 Junio, 2025",
        destination: "Bodega",
        deliveryDate: "08 Junio, 2025",
        itemCount: 19,
        status: "received",
        progress: 100,
    },
    {
        id: 2,
        supplier: "Mirage -Norage S.A. de C.V.",
        supplierDate: "01 Junio, 2025",
        destination: "Bodega",
        deliveryDate: "08 Junio, 2025",
        itemCount: 19,
        status: "in_progress",
        progress: 75,
    },
    {
        id: 3,
        supplier: "Mabe S.A. de C.V.",
        supplierDate: "01 Junio, 2025",
        destination: "Bodega",
        deliveryDate: "08 Junio, 2025",
        itemCount: 19,
        status: "in_progress",
        progress: 60,
    },
    {
        id: 4,
        supplier: "Mirage -Norage S.A. de C.V.",
        supplierDate: "01 Junio, 2025",
        destination: "Bodega",
        deliveryDate: "08 Junio, 2025",
        itemCount: 15,
        status: "pending",
        progress: 30,
    },
    {
        id: 5,
        supplier: "Mirage -Norage S.A. de C.V.",
        supplierDate: "01 Junio, 2025",
        destination: "Bodega",
        deliveryDate: "08 Junio, 2025",
        itemCount: 15,
        status: "pending",
        progress: 20,
    },
    {
        id: 6,
        supplier: "Mirage -Norage S.A. de C.V.",
        supplierDate: "01 Junio, 2025",
        destination: "Bodega",
        deliveryDate: "08 Junio, 2025",
        itemCount: 15,
        status: "pending",
        progress: 15,
    },
    {
        id: 7,
        supplier: "Electrodomésticos Premium",
        supplierDate: "28 Mayo, 2025",
        destination: "Bodega Central",
        deliveryDate: "05 Junio, 2025",
        itemCount: 22,
        status: "received",
        progress: 100,
    },
    {
        id: 8,
        supplier: "Muebles del Norte S.A.",
        supplierDate: "25 Mayo, 2025",
        destination: "Bodega Tampico",
        deliveryDate: "02 Junio, 2025",
        itemCount: 35,
        status: "received",
        progress: 100,
    },
];

// ============================================================================
// MOCK API FUNCTIONS
// ============================================================================

async function getOrders(params: GetOrdersParams): Promise<GetOrdersResponse> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    let filteredData = [...DUMMY_ORDERS];

    // Filter by status
    if (params.status && params.status !== "all") {
        filteredData = filteredData.filter((order) => order.status === params.status);
    }

    return {
        data: filteredData,
        total: filteredData.length,
    };
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Pedidos() {
    const router = useRouter();

    // State
    const [orders, setOrders] = useState<OrderCardData[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all");

    // Tab options
    const tabs: TabItem[] = [
        { value: "all", label: "Todos" },
        { value: "pending", label: "Por recibir" },
        { value: "in_progress", label: "En curso" },
        { value: "received", label: "Recibidos" },
    ];

    // Get status filter from tab
    const getStatusFilter = useCallback((): "all" | OrderStatus => {
        return activeTab as "all" | OrderStatus;
    }, [activeTab]);

    // Fetch orders
    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getOrders({
                page: 0,
                limit: 50,
                status: getStatusFilter(),
            });
            setOrders(response.data);
        } catch (err) {
            console.error("[Pedidos] Error fetching:", err);
        } finally {
            setLoading(false);
        }
    }, [getStatusFilter]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // Event handlers
    const handleTabChange = (value: string) => {
        setActiveTab(value);
    };

    const handleCreateOrder = () => {
        router.push("/pedidos/nuevo");
    };

    const handleOrderClick = (order: OrderCardData) => {
        router.push(`/pedidos/${order.id}`);
    };

    // Title actions
    const titleActions: TitleAction[] = [
        {
            id: "new-order",
            label: "Nuevo pedido",
            onClick: handleCreateOrder,
            variant: "contained",
            color: "primary",
        },
    ];

    return (
        <MainLayout>
            <Title title="Pedidos" actions={titleActions} />

            <PageContent>
                <MainContent>
                    <TabsWrapper>
                        <Tabs
                            tabs={tabs}
                            value={activeTab}
                            onChange={handleTabChange}
                        />
                    </TabsWrapper>

                    <OrderList
                        orders={orders}
                        onOrderClick={handleOrderClick}
                        loading={loading}
                        emptyMessage="No hay pedidos"
                    />
                </MainContent>
            </PageContent>
        </MainLayout>
    );
}
