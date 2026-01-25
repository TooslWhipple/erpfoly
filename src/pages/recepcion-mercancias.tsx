import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { Edit as EditIcon } from "@mui/icons-material";
import { MainLayout, Title, TabFilters, TableCrud } from "@/components";
import type { Column, RowAction } from "@/components/TableCrud";
import type { TabOption } from "@/components/TabFilters";
import { StatusChip, ReceptionStatus } from "./recepcion-mercancias.styles";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface MerchandiseReception {
    id: number;
    warehouse: string;
    orderNumber: string;
    date: string;
    supplier: string;
    total: number;
    status: ReceptionStatus;
    receptionDate: string;
}

interface GetReceptionsParams {
    page: number;
    limit: number;
    search?: string;
    status?: "all" | ReceptionStatus;
}

interface GetReceptionsResponse {
    data: MerchandiseReception[];
    total: number;
    page: number;
    limit: number;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const DUMMY_RECEPTIONS: MerchandiseReception[] = [
    {
        id: 1,
        warehouse: "Bodega",
        orderNumber: "12345",
        date: "01, Junio de 2025",
        supplier: "Mirage - Norage S.A. De C.V.",
        total: 32221.90,
        status: "pre_captured",
        receptionDate: "08, Junio de 2025",
    },
    {
        id: 2,
        warehouse: "Bodega",
        orderNumber: "12345",
        date: "01, Junio de 2025",
        supplier: "Mirage - Norage S.A. De C.V.",
        total: 32221.90,
        status: "pre_captured",
        receptionDate: "08, Junio de 2025",
    },
    {
        id: 3,
        warehouse: "Bodega Central",
        orderNumber: "12346",
        date: "28, Mayo de 2025",
        supplier: "Muebles del Norte S.A.",
        total: 45890.50,
        status: "captured",
        receptionDate: "05, Junio de 2025",
    },
    {
        id: 4,
        warehouse: "Bodega Altamira",
        orderNumber: "12347",
        date: "25, Mayo de 2025",
        supplier: "Electrodomésticos Premium",
        total: 78432.00,
        status: "captured",
        receptionDate: "02, Junio de 2025",
    },
    {
        id: 5,
        warehouse: "Bodega",
        orderNumber: "12348",
        date: "20, Mayo de 2025",
        supplier: "Distribuidora Hogar Feliz",
        total: 15678.25,
        status: "costed",
        receptionDate: "28, Mayo de 2025",
    },
    {
        id: 6,
        warehouse: "Bodega Central",
        orderNumber: "12349",
        date: "18, Mayo de 2025",
        supplier: "Colchones y Más S.A.",
        total: 92150.00,
        status: "costed",
        receptionDate: "25, Mayo de 2025",
    },
    {
        id: 7,
        warehouse: "Bodega Tampico",
        orderNumber: "12350",
        date: "15, Mayo de 2025",
        supplier: "Línea Blanca Nacional",
        total: 125890.75,
        status: "costed",
        receptionDate: "22, Mayo de 2025",
    },
    {
        id: 8,
        warehouse: "Bodega",
        orderNumber: "12351",
        date: "10, Mayo de 2025",
        supplier: "Mirage - Norage S.A. De C.V.",
        total: 54320.00,
        status: "costed",
        receptionDate: "18, Mayo de 2025",
    },
    {
        id: 9,
        warehouse: "Bodega Veracruz",
        orderNumber: "12352",
        date: "08, Mayo de 2025",
        supplier: "Mueblería del Golfo",
        total: 38765.50,
        status: "costed",
        receptionDate: "15, Mayo de 2025",
    },
    {
        id: 10,
        warehouse: "Bodega Central",
        orderNumber: "12353",
        date: "05, Mayo de 2025",
        supplier: "Electrodomésticos Premium",
        total: 67890.25,
        status: "costed",
        receptionDate: "12, Mayo de 2025",
    },
];

// ============================================================================
// MOCK API FUNCTIONS
// ============================================================================

async function getReceptions(
    params: GetReceptionsParams
): Promise<GetReceptionsResponse> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    let filteredData = [...DUMMY_RECEPTIONS];

    // Filter by status
    if (params.status && params.status !== "all") {
        filteredData = filteredData.filter((item) => item.status === params.status);
    }

    // Filter by search
    if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredData = filteredData.filter(
            (item) =>
                item.orderNumber.toLowerCase().includes(searchLower) ||
                item.warehouse.toLowerCase().includes(searchLower) ||
                item.supplier.toLowerCase().includes(searchLower)
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

// ============================================================================
// HELPERS
// ============================================================================

function getStatusLabel(status: ReceptionStatus): string {
    const labels: Record<ReceptionStatus, string> = {
        pre_captured: "Precapturado",
        captured: "Capturado",
        costed: "Costeado",
    };
    return labels[status];
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function RecepcionMercancias() {
    const router = useRouter();

    // State
    const [receptions, setReceptions] = useState<MerchandiseReception[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchValue, setSearchValue] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalRows, setTotalRows] = useState(0);

    // Tab options
    const tabs: TabOption[] = [
        { label: "Todos", value: "all" },
        { label: "Capturados", value: "captured" },
        { label: "Costeados", value: "costed" },
    ];

    // Get status filter from tab
    const getStatusFilter = (): "all" | ReceptionStatus => {
        return activeTab as "all" | ReceptionStatus;
    };

    // Fetch receptions
    const fetchReceptions = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getReceptions({
                page,
                limit: rowsPerPage,
                search: searchValue,
                status: getStatusFilter(),
            });
            setReceptions(response.data);
            setTotalRows(response.total);
        } catch (err) {
            console.error("[RecepcionMercancias] Error fetching:", err);
        } finally {
            setLoading(false);
        }
    }, [page, rowsPerPage, searchValue, activeTab, getStatusFilter]);

    useEffect(() => {
        fetchReceptions();
    }, [fetchReceptions]);

    useEffect(() => {
        setPage(0);
    }, [searchValue, activeTab]);

    // Event handlers
    const handleTabChange = (value: string) => {
        setActiveTab(value);
    };

    const handleSearchChange = (value: string) => {
        setSearchValue(value);
    };

    const handleCreate = () => {
        router.push("/recepcion-mercancias/nuevo");
    };

    const handleViewReception = (reception: MerchandiseReception) => {
        router.push(`/recepcion-mercancias/${reception.id}`);
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (newRowsPerPage: number) => {
        setRowsPerPage(newRowsPerPage);
        setPage(0);
    };

    // Table columns
    const columns: Column<MerchandiseReception>[] = [
        {
            id: "warehouse",
            label: "Almacén",
            size: "md",
        },
        {
            id: "orderNumber",
            label: "Pedido",
            size: "sm",
        },
        {
            id: "date",
            label: "Fecha",
            size: "lg",
        },
        {
            id: "supplier",
            label: "Proveedor",
            size: "xl",
            truncate: true,
        },
        {
            id: "total",
            label: "Total",
            type: "currency",
            size: "md",
            align: "left",
        },
        {
            id: "status",
            label: "Estatus",
            size: "md",
            format: (value) => (
                <StatusChip
                    label={getStatusLabel(value as ReceptionStatus)}
                    size="small"
                    statusType={value as ReceptionStatus}
                />
            ),
        },
        {
            id: "receptionDate",
            label: "Fecha de recepción",
            size: "lg",
        },
    ];

    // Row actions
    const actions: RowAction<MerchandiseReception>[] = [
        {
            id: "view",
            label: "Ver detalle",
            icon: <EditIcon fontSize="small" />,
            onClick: handleViewReception,
        },
    ];

    return (
        <MainLayout>
            <Title title="Recepción de mercancía" />

            <TabFilters
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={handleTabChange}
                showSearch
                searchValue={searchValue}
                onSearchChange={handleSearchChange}
                searchPlaceholder="Buscar"
                actions={[
                    {
                        label: "Nuevo",
                        onClick: handleCreate,
                        variant: "contained",
                        color: "primary",
                    },
                ]}
            />

            <TableCrud
                columns={columns}
                rows={receptions}
                actions={actions}
                loading={loading}
                rowKey="id"
                page={page}
                rowsPerPage={rowsPerPage}
                totalRows={totalRows}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                onRowClick={handleViewReception}
                emptyMessage="No hay recepciones de mercancía"
            />
        </MainLayout>
    );
}
