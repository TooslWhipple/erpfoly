import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { Edit as EditIcon, Visibility as VisibilityIcon } from "@mui/icons-material";
import { Title, TabFilters, TableCrud, StatusChip, BranchSelectionModal } from "@/components";
import type { Column, RowAction } from "@/components/TableCrud";
import type { TabOption } from "@/components/TabFilters";
import type { BranchOrderStatus } from "@/types/solicitudes.types";
import type { TransferListItem, TransferStats } from "@/types/transfers.types";
import { getTransfers, getTransferStats } from "@/services/transfers.service";
import {
    mapBranchOrderStatus,
    getBranchOrderStatusLabel,
    getBranchOrderStatusVariant,
    getTransferTabFilters,
    isBranchOrderEditable,
    TRANSFER_TAB_ALL,
    TRANSFER_TAB_CANCELLED,
    TRANSFER_TAB_DELIVERED,
    TRANSFER_TAB_INCIDENT,
    TRANSFER_TAB_IN_COURSE,
    TRANSFER_TAB_TO_RECEIVE,
    TRANSFER_TAB_TO_SHIP,
} from "@/utils/branchRequest";
import { Stack } from "@mui/material";
import { TRASPASOS_CREATE, TRASPASOS_EDIT, TRASPASOS_READ } from "@/lib/permissions";
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
    saleFolio: string | null;
    status: BranchOrderStatus;
}

interface GetBranchOrdersParams {
    page: number;
    limit: number;
    search?: string;
    tab: string;
}

interface GetBranchOrdersResponse {
    data: BranchOrder[];
    total: number;
    page: number;
    limit: number;
}

function mapBackendOrderToBranchOrder(order: TransferListItem): BranchOrder {
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
        saleFolio: order.sale_folio,
        status: mapBranchOrderStatus(order.status),
    };
}

async function getBranchOrders(
    params: GetBranchOrdersParams
): Promise<GetBranchOrdersResponse> {
    const result = await getTransfers({
        page: params.page + 1,
        limit: params.limit,
        search: params.search,
        ...getTransferTabFilters(params.tab),
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
    const [activeTab, setActiveTab] = useState(TRANSFER_TAB_ALL);
    const [stats, setStats] = useState<TransferStats | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalRows, setTotalRows] = useState(0);
    const [branchModalOpen, setBranchModalOpen] = useState(false);

    const tabs: TabOption[] = [
        { label: "Todos", value: TRANSFER_TAB_ALL, count: stats?.total },
        { label: "Por enviar", value: TRANSFER_TAB_TO_SHIP, count: stats?.toShip },
        { label: "Por recibir", value: TRANSFER_TAB_TO_RECEIVE, count: stats?.toReceive },
        { label: "En curso", value: TRANSFER_TAB_IN_COURSE, count: stats?.shipped },
        { label: "Entregados", value: TRANSFER_TAB_DELIVERED, count: stats?.delivered },
        { label: "Con incidencia", value: TRANSFER_TAB_INCIDENT, count: stats?.openIncidents },
        { label: "Canceladas", value: TRANSFER_TAB_CANCELLED, count: stats?.cancelled },
    ];

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getBranchOrders({
                page,
                limit: rowsPerPage,
                search: searchValue,
                tab: activeTab,
            });
            setOrders(response.data);
            setTotalRows(response.total);
        } catch (err) {
            console.error("[Traspasos] Error fetching:", err);
        } finally {
            setLoading(false);
        }
    }, [page, rowsPerPage, searchValue, activeTab]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    useEffect(() => {
        getTransferStats().then((result) => setStats(result.data));
    }, []);

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
            id: "saleFolio",
            label: "Venta",
            size: "md",
            format: (value) => (value ? String(value) : "-"),
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
            permission: TRASPASOS_EDIT,
            hidden: (row) => !isBranchOrderEditable(row.status, row.saleFolio !== null),
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
