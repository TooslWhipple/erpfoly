import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import { Divider, Stack } from "@mui/material";
import {
    Title,
    OrderList,
    SuggestionsCard,
    SupplierSelectionModal,
    TabFilters,
    CardListPagination,
} from "@/components";
import type { TitleAction } from "@/components/Title";
import type { TabItem } from "@/components/Tabs";
import type { OrderCardData } from "@/components/OrderCard";
import type { ProductSuggestion } from "@/types/suggestions.types";
import type { Supplier } from "@/types/pedidos.types";
import type { OrderListItem } from "@/types/orders.types";
import { getOrders, getSuggestions } from "@/services/orders.service";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { useDebouncedInput } from "@/hooks/useDebouncedValue";
import { SidebarPanel } from "@/styles/pedidos.styles";
import { ORDERS_CREATE } from "@/lib/permissions";
import dayjs from "@/lib/dayjs";

const SEARCH_DEBOUNCE_MS = 300;

type OrderStatus = "pending" | "scheduled" | "in_progress" | "received";

function mapBackendOrderToCardData(order: OrderListItem): OrderCardData {
    const totalRequested = order.order_items.reduce((sum, item) => sum + item.requested_quantity, 0);
    const totalDelivered = order.order_items.reduce((sum, item) => sum + item.delivered_quantity, 0);
    const progress = totalRequested > 0 ? Math.round((totalDelivered / totalRequested) * 100) : 0;

    let status: OrderStatus = "pending";
    if (order.status === "delivered") {
        status = "received";
    } else if (order.status === "partially_delivered") {
        status = "in_progress";
    } else if (order.status === "scheduled" || order.status === "shipped") {
        status = "scheduled";
    } else if (order.status === "cancelled") {
        status = "pending";
    }

    const orderDate = dayjs.utc(order.order_date);
    // La fecha de entrega la confirma el proveedor desde el portal
    // (order_deliveries) — no se muestra hasta que exista.
    const confirmedDelivery = order.order_deliveries[0]?.delivery_date;

    return {
        id: order.id,
        supplier: order.supplier?.name ?? "Sin proveedor",
        supplierDate: orderDate.toDate(),
        destination: order.branch?.name ?? "Bodega",
        deliveryDate: confirmedDelivery ? dayjs.utc(confirmedDelivery).toDate() : null,
        itemCount: order.order_items.length,
        status,
        progress,
    };
}

export default function Pedidos() {
    const router = useRouter();

    const [activeTab, setActiveTab] = useState("all");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
    const [suggestionsLoading, setSuggestionsLoading] = useState(true);
    const [supplierModalOpen, setSupplierModalOpen] = useState(false);

    const tabs: TabItem[] = [
        { value: "all", label: "Todos" },
        { value: "pending", label: "Solicitado" },
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

    const extraParams = useMemo(
        () => ({
            order_type: "external" as const,
            ...(statusFilter ? { status: statusFilter } : {}),
            ...(dateFrom ? { date_from: dateFrom } : {}),
            ...(dateTo ? { date_to: dateTo } : {}),
        }),
        [statusFilter, dateFrom, dateTo],
    );

    const {
        data: orderRows,
        total,
        page,
        setPage,
        search: searchValue,
        setSearch,
        isLoading: loading,
    } = usePaginatedList<OrderListItem>({
        queryKey: ["orders", activeTab, dateFrom, dateTo],
        queryFn: getOrders,
        initialPage: 0,
        initialRowsPerPage: 10,
        extraParams,
    });

    const [searchInput, setSearchInput, debouncedSearch] = useDebouncedInput(
        searchValue,
        SEARCH_DEBOUNCE_MS,
    );

    useEffect(() => {
        setSearch(debouncedSearch);
    }, [debouncedSearch, setSearch]);

    const orders = useMemo(
        () => orderRows.map(mapBackendOrderToCardData),
        [orderRows],
    );

    const hasActiveFilters = Boolean(searchValue.trim() || dateFrom || dateTo);

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
        fetchSuggestions();
    }, [fetchSuggestions]);

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        setPage(0);
    };

    const handleDateRangeChange = (range: { startDate: string; endDate: string }) => {
        setDateFrom(range.startDate);
        setDateTo(range.endDate);
        setPage(0);
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
                        showSearch
                        searchValue={searchInput}
                        onSearchChange={setSearchInput}
                        searchPlaceholder="Buscar por proveedor o sucursal destino"
                        dateRangeFilter={{
                            dateFrom,
                            dateTo,
                            onChange: handleDateRangeChange,
                            label: "Fecha del pedido",
                        }}
                    />

                    <OrderList
                        orders={orders}
                        onOrderClick={handleOrderClick}
                        loading={loading}
                        emptyMessage={
                            hasActiveFilters
                                ? "No hay pedidos con los filtros aplicados"
                                : "No hay pedidos"
                        }
                    />

                    <CardListPagination
                        page={page}
                        total={total}
                        onPageChange={setPage}
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
