import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { Edit as EditIcon } from "@mui/icons-material";
import { MainLayout, Title, TabFilters, TableCrud, StatusChip } from "@/components";
import type { Column, RowAction } from "@/components/TableCrud";
import type { TabOption } from "@/components/TabFilters";
import type { BranchOrderStatus, BranchRequestListItem } from "@/types/solicitudes.types";
import { getBranchRequests } from "@/services/requests.service";
import {
    mapBranchOrderStatus,
    getBranchOrderStatusLabel,
    getBranchOrderStatusVariant,
} from "@/utils/branchRequest";
import { Stack } from "@mui/material";
import { BRANCH_REQUESTS_READ } from "@/lib/permissions";

interface BranchOrder {
    id: number;
    folio: string;
    date: string;
    originBranch: string;
    branch: string;
    requestedBy: string;
    requestedItems: number;
    deliveredItems: number | null;
    status: BranchOrderStatus;
}

interface GetBranchOrdersParams {
    page: number;
    limit: number;
    search?: string;
    status?: "all" | BranchOrderStatus;
}

interface GetBranchOrdersResponse {
    data: BranchOrder[];
    total: number;
    page: number;
    limit: number;
}

function mapBackendOrderToBranchOrder(order: BranchRequestListItem): BranchOrder {
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
        originBranch: order.origin_branch?.name ?? "—",
        branch: order.branch?.name ?? "Sin sucursal",
        requestedBy: order.requested_by_user
            ? `${order.requested_by_user.first_name} ${order.requested_by_user.last_name}`
            : "—",
        requestedItems: totalRequested,
        deliveredItems: totalDelivered > 0 ? totalDelivered : null,
        status: mapBranchOrderStatus(order.status),
    };
}

async function getBranchOrders(
    params: GetBranchOrdersParams
): Promise<GetBranchOrdersResponse> {
    const statusFilter = params.status && params.status !== "all"
        ? params.status
        : undefined;

    const result = await getBranchRequests({
        page: params.page + 1,
        limit: params.limit,
        search: params.search,
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

export default function SolicitudesSucursales() {
    const router = useRouter();

    const [orders, setOrders] = useState<BranchOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchValue, setSearchValue] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalRows, setTotalRows] = useState(0);

    const tabs: TabOption[] = [
        { label: "Todos", value: "all" },
        { label: "Pendientes", value: "pending" },
        { label: "Agendados", value: "scheduled" },
        { label: "Entregados", value: "delivered" },
    ];

    const getStatusFilter = useCallback((): "all" | BranchOrderStatus => {
        return activeTab as "all" | BranchOrderStatus;
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
            console.error("[SolicitudesSucursales] Error fetching:", err);
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

    const handleViewOrder = (order: BranchOrder) => {
        router.push(`/solicitudes/sucursales/${order.id}`);
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
            id: "originBranch",
            label: "Origen",
            size: "lg",
            truncate: true,
        },
        {
            id: "branch",
            label: "Destino",
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
            size: "md",
            align: "left",
        },
        {
            id: "deliveredItems",
            label: "Artículos entregados",
            type: "number",
            size: "md",
            align: "left",
            format: (value) => (value === null ? "-" : String(value)),
        },
        {
            id: "status",
            label: "Estatus",
            size: "md",
            format: (value) => {
                const status = value as BranchOrderStatus;
                return (
                    <StatusChip
                        size="small"
                        label={getBranchOrderStatusLabel(status)}
                        variant={getBranchOrderStatusVariant(status)}
                    />
                );
            },
        },
    ];

    const actions: RowAction<BranchOrder>[] = [
        {
            id: "view",
            label: "Ver detalle",
            icon: <EditIcon fontSize="small" />,
            onClick: handleViewOrder,
            permission: BRANCH_REQUESTS_READ,
        },
    ];

    return (
        <MainLayout>
            <Stack direction="column" spacing={3}>
                <Title title="Pedidos" />

                <TabFilters
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                    showSearch
                    searchValue={searchValue}
                    onSearchChange={handleSearchChange}
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
        </MainLayout>
    );
}
