import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { Edit as EditIcon } from "@mui/icons-material";
import { MainLayout, Title, TabFilters, TableCrud } from "@/components";
import type { Column, RowAction } from "@/components/TableCrud";
import type { TabOption } from "@/components/TabFilters";
import { Stack } from "@mui/material";

type OrderStatus = "pending" | "delivered";

interface BranchOrder {
    id: number;
    folio: string;
    date: string;
    branch: string;
    requestedBy: string;
    requestedItems: number;
    deliveredItems: number | null;
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

const DUMMY_BRANCH_ORDERS: BranchOrder[] = [
    {
        id: 1,
        folio: "FOL-20231",
        date: "05, Noviembre de 2025",
        branch: "Foly Muebles Tampico Centro",
        requestedBy: "Ana López",
        requestedItems: 12,
        deliveredItems: null,
        status: "pending",
    },
    {
        id: 2,
        folio: "FOL-20232",
        date: "05, Noviembre de 2025",
        branch: "Foly Muebles Altamira",
        requestedBy: "Ricardo Montes",
        requestedItems: 6,
        deliveredItems: null,
        status: "pending",
    },
    {
        id: 3,
        folio: "FOL-20212",
        date: "03, Noviembre de 2025",
        branch: "Foly Muebles Ejército Mexicano",
        requestedBy: "María Fernanda Juárez",
        requestedItems: 9,
        deliveredItems: 4,
        status: "delivered",
    },
    {
        id: 4,
        folio: "FOL-20198",
        date: "02, Noviembre de 2025",
        branch: "Foly Muebles Pánuco",
        requestedBy: "Luis Hernández",
        requestedItems: 3,
        deliveredItems: 3,
        status: "delivered",
    },
    {
        id: 5,
        folio: "FOL-20195",
        date: "01, Noviembre de 2025",
        branch: "Foly Muebles Coatzacoalcos",
        requestedBy: "Pamela Salinas",
        requestedItems: 7,
        deliveredItems: 7,
        status: "delivered",
    },
    {
        id: 6,
        folio: "FOL-20176",
        date: "29, Octubre de 2025",
        branch: "Foly Muebles San Luis Potosí Carranza",
        requestedBy: "Jorge Carrillo",
        requestedItems: 5,
        deliveredItems: 2,
        status: "delivered",
    },
    {
        id: 7,
        folio: "FOL-20160",
        date: "28, Octubre de 2025",
        branch: "Foly Muebles Poza Rica",
        requestedBy: "Claudia Pérez",
        requestedItems: 14,
        deliveredItems: 14,
        status: "delivered",
    },
    {
        id: 8,
        folio: "FOL-20145",
        date: "25, Octubre de 2025",
        branch: "Foly Muebles Veracruz Puerto",
        requestedBy: "Fernando Sánchez",
        requestedItems: 8,
        deliveredItems: 8,
        status: "delivered",
    },
    {
        id: 9,
        folio: "FOL-20130",
        date: "22, Octubre de 2025",
        branch: "Foly Muebles Xalapa",
        requestedBy: "Diana Torres",
        requestedItems: 10,
        deliveredItems: 10,
        status: "delivered",
    },
    {
        id: 10,
        folio: "FOL-20115",
        date: "20, Octubre de 2025",
        branch: "Foly Muebles Córdoba",
        requestedBy: "Miguel Ángel Ruiz",
        requestedItems: 6,
        deliveredItems: 6,
        status: "delivered",
    },
];

// ============================================================================
async function getBranchOrders(
    params: GetBranchOrdersParams
): Promise<GetBranchOrdersResponse> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    let filteredData = [...DUMMY_BRANCH_ORDERS];

    if (params.status && params.status !== "all") {
        filteredData = filteredData.filter((order) => order.status === params.status);
    }

    if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredData = filteredData.filter(
            (order) =>
                order.folio.toLowerCase().includes(searchLower) ||
                order.branch.toLowerCase().includes(searchLower) ||
                order.requestedBy.toLowerCase().includes(searchLower)
        );
    }

    const total = filteredData.length;
    const start = params.page * params.limit;
    const end = start + params.limit;
    const paginatedData = filteredData.slice(start, end);

    return {
        data: paginatedData,
        total,
        page: params.page,
        limit: params.limit,
    };
}

function getStatusLabel(status: OrderStatus): string {
    const labels: Record<OrderStatus, string> = {
        pending: "Pendiente",
        delivered: "Entregado",
    };
    return labels[status];
}

function getStatusColor(status: OrderStatus): string {
    const colors: Record<OrderStatus, string> = {
        pending: "#ea580c",
        delivered: "#16a34a",
    };
    return colors[status];
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

    // Tab options
    const tabs: TabOption[] = [
        { label: "Todos", value: "all" },
        { label: "Pendientes", value: "pending" },
        { label: "Entregados", value: "delivered" },
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
            format: (value) => (
                <span style={{ color: getStatusColor(value as OrderStatus), fontWeight: 500 }}>
                    {getStatusLabel(value as OrderStatus)}
                </span>
            ),
        },
    ];

    const actions: RowAction<BranchOrder>[] = [
        {
            id: "view",
            label: "Ver detalle",
            icon: <EditIcon fontSize="small" />,
            onClick: handleViewOrder,
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
                    searchPlaceholder="Buscar (folio, sucursal, solicitante)"
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
