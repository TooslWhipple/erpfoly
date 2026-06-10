import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { Edit as EditIcon } from "@mui/icons-material";
import { MainLayout, Title, TabFilters, TableCrud, SupplierSelectionModal, BranchSelectionModal } from "@/components";
import type { Column, RowAction, StatusChipVariant } from "@/components/TableCrud";
import type { TabOption } from "@/components/TabFilters";
import type { Supplier } from "@/types/pedidos.types";
import type { OrderListItem } from "@/types/orders.types";
import { getOrders } from "@/services/orders.service";
import { Stack } from "@mui/material";
import { BRANCH_ORDERS_CREATE, BRANCH_ORDERS_READ } from "@/lib/permissions";

type OrderStatus = "pending" | "partially_delivered" | "delivered" | "cancelled";

interface BranchOrder {
    id: number;
    folio: string;
    date: string;
    branch: string;
    requestedBy: string;
    requestedItems: number;
    deliveredItems: number;
    status: OrderStatus;
}

interface GetBranchOrdersParams {
    page: number;
    limit: number;
    search?: string;
    status?: "all" | OrderStatus;
}

interface GetBranchOrdersResponse {
    data: BranchOrder[];
    total: number;
    page: number;
    limit: number;
}

const ESTATUS_CHIP_LABELS: Record<OrderStatus, string> = {
    pending: "Pendiente",
    partially_delivered: "En curso",
    delivered: "Recibido",
    cancelled: "Cancelado",
};
const ESTATUS_CHIP_VARIANTS: Record<OrderStatus, StatusChipVariant> = {
    pending: "pending",
    partially_delivered: "warning",
    delivered: "success",
    cancelled: "error",
};

function mapBackendOrderToBranchOrder(order: OrderListItem): BranchOrder {
    const totalRequested = order.order_items.reduce((sum, item) => sum + item.requested_quantity, 0);
    const totalDelivered = order.order_items.reduce((sum, item) => sum + item.delivered_quantity, 0);

    const orderDate = new Date(order.order_date);
    const formattedDate = orderDate.toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });

    return {
        id: order.id,
        folio: order.folio,
        date: formattedDate,
        branch: order.branch?.name ?? "Sin sucursal",
        requestedBy: order.requested_by_user
            ? `${order.requested_by_user.first_name} ${order.requested_by_user.last_name}`
            : "—",
        requestedItems: totalRequested,
        deliveredItems: totalDelivered,
        status: order.status as OrderStatus,
    };
}

async function getBranchOrders(
    params: GetBranchOrdersParams
): Promise<GetBranchOrdersResponse> {
    const statusFilter = params.status && params.status !== "all"
        ? params.status
        : undefined;

    const result = await getOrders({
        page: params.page + 1,
        limit: params.limit,
        search: params.search,
        order_type: "internal",
        status: statusFilter,
    });

    if (result.data) {
        return {
            data: result.data.rows.map(mapBackendOrderToBranchOrder),
            total: result.data.total,
            page: params.page,
            limit: params.limit,
        };
    }

    return { data: [], total: 0, page: params.page, limit: params.limit };
}

export default function PedidosSucursales() {
    const router = useRouter();

    const [orders, setOrders] = useState<BranchOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchValue, setSearchValue] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalRows, setTotalRows] = useState(0);
    const [supplierModalOpen, setSupplierModalOpen] = useState(false);
    const [branchModalOpen, setBranchModalOpen] = useState(false);

    const tabs: TabOption[] = [
        { label: "Todos", value: "all" },
        { label: "Pendientes", value: "pending" },
        { label: "En curso", value: "partially_delivered" },
        { label: "Recibidos", value: "delivered" },
    ];

    const getStatusFilter = useCallback((): "all" | OrderStatus => {
        return activeTab as "all" | OrderStatus;
    }, [activeTab]);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getBranchOrders({
                page,
                limit: rowsPerPage,
                search: searchValue,
                status: getStatusFilter(),
            });
            setOrders(response.data);
            setTotalRows(response.total);
        } catch (err) {
            console.error("[PedidosSucursales] Error fetching:", err);
        } finally {
            setLoading(false);
        }
    }, [page, rowsPerPage, searchValue, getStatusFilter]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    useEffect(() => {
        setPage(0);
    }, [searchValue, activeTab]);

    const handleTabChange = (value: string) => {
        setActiveTab(value);
    };

    const handleSearchChange = (value: string) => {
        setSearchValue(value);
    };

    const handleCreate = () => {
        setBranchModalOpen(true);
    };

    const handleBranchSelect = (branch: { id: number; name: string }) => {
        router.push({
            pathname: "/pedidos/sucursales/nuevo",
            query: {
                orderType: "internal",
                branchId: String(branch.id),
                branchName: branch.name,
            },
        });
    };

    const handleCloseBranchModal = () => {
        setBranchModalOpen(false);
    };

    const handleViewOrder = (order: BranchOrder) => {
        router.push(`/pedidos/sucursales/${order.id}`);
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (newRowsPerPage: number) => {
        setRowsPerPage(newRowsPerPage);
        setPage(0);
    };

    const columns: Column<BranchOrder>[] = [
        {
            id: "folio",
            label: "Pedido",
            size: "md",
        },
        {
            id: "date",
            label: "Fecha",
            size: "lg",
        },
        {
            id: "branch",
            label: "Sucursal",
            size: "xl",
            truncate: true,
        },
        {
            id: "requestedBy",
            label: "Solicitado",
            size: "lg",
        },
        {
            id: "requestedItems",
            label: "Artículos solicitados",
            type: "number",
            size: "md"
        },
        {
            id: "deliveredItems",
            label: "Artículos entregados",
            type: "number",
            size: "md",
        },
        {
            id: "status",
            label: "Estatus",
            size: "md",
            type: "chip",
            chipLabelMap: ESTATUS_CHIP_LABELS,
            chipVariantMap: ESTATUS_CHIP_VARIANTS,
        },
    ];

    const actions: RowAction<BranchOrder>[] = [
        {
            id: "view",
            label: "Ver detalle",
            icon: <EditIcon fontSize="small" />,
            onClick: handleViewOrder,
            permission: BRANCH_ORDERS_READ,
        },
    ];

    return (
        <MainLayout>
            <Stack direction="column" spacing={3}>
                <Title title="Pedidos por sucursal" />

                <TabFilters
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                    showSearch
                    searchValue={searchValue}
                    onSearchChange={handleSearchChange}
                    actions={[
                        {
                            label: "Nuevo",
                            onClick: handleCreate,
                            variant: "contained",
                            color: "primary",
                            showIcon: true,
                            permission: BRANCH_ORDERS_CREATE,
                        },
                    ]}
                />

                <TableCrud
                    columns={columns}
                    rows={orders}
                    actions={actions}
                    loading={loading}
                    rowKey="id"
                    page={page}
                    rowsPerPage={rowsPerPage}
                    totalRows={totalRows}
                    onPageChange={handlePageChange}
                    onRowsPerPageChange={handleRowsPerPageChange}
                    onRowClick={handleViewOrder}
                    emptyMessage="No hay pedidos de sucursales"
                />
            </Stack>

            <BranchSelectionModal
                open={branchModalOpen}
                onClose={handleCloseBranchModal}
                onSelect={handleBranchSelect}
            />
        </MainLayout>
    );
}
