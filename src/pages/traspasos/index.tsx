import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { Edit as EditIcon, Visibility as VisibilityIcon } from "@mui/icons-material";
import { Title, TabFilters, TableCrud, StatusChip, BranchSelectionModal } from "@/components";
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
import { TRASPASOS_CREATE, TRASPASOS_READ, TRASPASOS_UPDATE } from "@/lib/permissions";
import dayjs from "@/lib/dayjs";
import { formatDate, formatDateOnly } from "@/utils/date";

interface BranchOrder {
    id: number;
    folio: string;
    date: string | Date;
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

const ALL_TAB = "all";
const PENDING_TAB = "pending";
const SCHEDULED_TAB = "scheduled";
const IN_PROGRESS_TAB = "partially_delivered";
const DELIVERED_TAB = "delivered";

function mapBackendOrderToBranchOrder(order: BranchRequestListItem): BranchOrder {
    const totalRequested = order.order_items.reduce((sum, item) => sum + item.requested_quantity, 0);
    const totalDelivered = order.order_items.reduce((sum, item) => sum + item.delivered_quantity, 0);

    return {
        id: order.id,
        folio: order.folio,
        date: dayjs.utc(order.order_date).toDate(),
        originBranch: order.origin_branch?.name ?? "—",
        branch: order.branch?.name ?? "Sin sucursal",
        requestedBy: order.created_by_user
            ? `${order.created_by_user.first_name} ${order.created_by_user.last_name}`
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

export default function TraspasosPage() {
    const router = useRouter();

    const [orders, setOrders] = useState<BranchOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchValue, setSearchValue] = useState("");
    const [activeTab, setActiveTab] = useState(ALL_TAB);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalRows, setTotalRows] = useState(0);
    const [branchModalOpen, setBranchModalOpen] = useState(false);

    const tabs: TabOption[] = [
        { label: "Todos", value: ALL_TAB },
        { label: "Pendientes", value: PENDING_TAB },
        { label: "Agendados", value: SCHEDULED_TAB },
        { label: "En curso", value: IN_PROGRESS_TAB },
        { label: "Entregados", value: DELIVERED_TAB },
    ];

    const getStatusFilter = useCallback((): "all" | BranchOrderStatus => {
        if (activeTab === SCHEDULED_TAB) return PENDING_TAB as BranchOrderStatus;
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
            console.error("[Traspasos] Error fetching:", err);
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

    const handleBranchSelect = (selection: { origin: { id: number; name: string }; destination: { id: number; name: string } }) => {
        router.push({
            pathname: "/traspasos/nuevo",
            query: {
                orderType: "internal",
                originBranchId: String(selection.origin.id),
                originBranchName: selection.origin.name,
                branchId: String(selection.destination.id),
                branchName: selection.destination.name,
            },
        });
    };

    const handleCloseBranchModal = () => {
        setBranchModalOpen(false);
    };

    const handleViewOrder = (order: BranchOrder) => {
        router.push(`/traspasos/${order.id}`);
    };

    const handleEditOrder = (order: BranchOrder) => {
        router.push(`/traspasos/${order.id}/editar`);
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (newRowsPerPage: number) => {
        setRowsPerPage(newRowsPerPage);
        setPage(0);
    };

    const filteredOrders =
        activeTab === SCHEDULED_TAB
            ? orders.filter((order) => order.status === "scheduled")
            : activeTab === PENDING_TAB
                ? orders.filter((order) => order.status === "pending")
                : orders;

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
            format: (value) => formatDateOnly(value, "dateLong"),
        },
        {
            id: "originBranch",
            label: "Origen",
            size: "xl",
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
            icon: <VisibilityIcon fontSize="small" />,
            onClick: handleViewOrder,
            permission: TRASPASOS_READ,
        },
        {
            id: "edit",
            label: "Editar",
            icon: <EditIcon fontSize="small" />,
            onClick: handleEditOrder,
            permission: TRASPASOS_UPDATE,
            hidden: (row) => row.status !== "pending",
        },
    ];

    return (
        <>
            <Stack direction="column" spacing={3}>
                <Title title="Traspasos" />

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
                            permission: TRASPASOS_CREATE,
                        },
                    ]}
                />

                <TableCrud
                    columns={columns}
                    rows={filteredOrders}
                    actions={actions}
                    loading={loading}
                    rowKey="id"
                    page={page}
                    rowsPerPage={rowsPerPage}
                    totalRows={totalRows}
                    onPageChange={handlePageChange}
                    onRowsPerPageChange={handleRowsPerPageChange}
                    onRowClick={handleViewOrder}
                    emptyMessage="No hay traspasos"
                />
            </Stack>

            <BranchSelectionModal
                open={branchModalOpen}
                onClose={handleCloseBranchModal}
                onSelect={handleBranchSelect}
            />
        </>
    );
}
