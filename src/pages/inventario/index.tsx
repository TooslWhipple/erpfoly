import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import {
    GridView as GridViewIcon,
    Sync as SyncIcon,
    LocalShipping as ShippingIcon,
    Build as BuildIcon,
    Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { MainLayout, Title, TableCrud, StatsCardGroup, TabFilters } from "@/components";
import { Box, Grid, Skeleton, Stack } from "@mui/material";
import type { Column, RowAction, StatusChipVariant } from "@/components/TableCrud";
import type { StatsCardData } from "@/components/StatsCard";
import type { TabOption } from "@/components/TabFilters";
import { INVENTORY_COLORS } from "@/styles/inventario/styles";
import { INVENTORY_READ } from "@/lib/permissions";

interface InventoryItem {
    id: number;
    code: string;
    status: "active" | "inactive";
    name: string;
    department: string;
    line: string;
    inStock: number;
    inTransit: number;
    damaged: number;
}

interface GetInventoryParams {
    page: number;
    limit: number;
    search?: string;
    status?: "all" | "active" | "inactive";
}

interface GetInventoryResponse {
    data: InventoryItem[];
    total: number;
    page: number;
    limit: number;
}

interface InventoryStats {
    totalItems: number;
    inStock: number;
    inTransit: number;
    damaged: number;
}

const DUMMY_INVENTORY: InventoryItem[] = [
    {
        id: 1,
        code: "04ET 12345",
        status: "active",
        name: "Lavadora Mabe 22kg LMH72205WBAB0",
        department: "04 - Línea Blanca",
        line: "LV - Lavadora",
        inStock: 32,
        inTransit: 15,
        damaged: 5,
    },
    {
        id: 2,
        code: "04ET 12345",
        status: "inactive",
        name: "Estufa Mabe 30\" de Piso EM7654BFIS2",
        department: "04 - Línea Blanca",
        line: "ET - Estufas",
        inStock: 32,
        inTransit: 15,
        damaged: 5,
    },
    {
        id: 3,
        code: "04ET 12345",
        status: "active",
        name: "Estufa Mabe 30\" de Piso EM7654BFIS2",
        department: "04 - Línea Blanca",
        line: "ET - Estufas",
        inStock: 32,
        inTransit: 15,
        damaged: 5,
    },
    {
        id: 4,
        code: "04ET 12345",
        status: "active",
        name: "Estufa Mabe 30\" de Piso EM7654BFIS2",
        department: "04 - Línea Blanca",
        line: "ET - Estufas",
        inStock: 32,
        inTransit: 15,
        damaged: 5,
    },
    {
        id: 5,
        code: "04ET 12345",
        status: "active",
        name: "Estufa Mabe 30\" de Piso EM7654BFIS2",
        department: "04 - Línea Blanca",
        line: "ET - Estufas",
        inStock: 32,
        inTransit: 15,
        damaged: 5,
    },
    {
        id: 6,
        code: "04ET 12345",
        status: "active",
        name: "Estufa Mabe 30\" de Piso EM7654BFIS2",
        department: "04 - Línea Blanca",
        line: "ET - Estufas",
        inStock: 32,
        inTransit: 15,
        damaged: 5,
    },
    {
        id: 7,
        code: "04ET 12345",
        status: "active",
        name: "Estufa Mabe 30\" de Piso EM7654BFIS2",
        department: "04 - Línea Blanca",
        line: "ET - Estufas",
        inStock: 32,
        inTransit: 15,
        damaged: 5,
    },
    {
        id: 8,
        code: "04ET 12345",
        status: "active",
        name: "Estufa Mabe 30\" de Piso EM7654BFIS2",
        department: "04 - Línea Blanca",
        line: "ET - Estufas",
        inStock: 32,
        inTransit: 15,
        damaged: 5,
    },
    {
        id: 9,
        code: "04ET 12345",
        status: "active",
        name: "Estufa Mabe 30\" de Piso EM7654BFIS2",
        department: "04 - Línea Blanca",
        line: "ET - Estufas",
        inStock: 32,
        inTransit: 15,
        damaged: 5,
    },
    {
        id: 10,
        code: "04ET 12345",
        status: "active",
        name: "Estufa Mabe 30\" de Piso EM7654BFIS2",
        department: "04 - Línea Blanca",
        line: "ET - Estufas",
        inStock: 32,
        inTransit: 15,
        damaged: 5,
    },
];

async function getInventoryStats(): Promise<InventoryStats> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
        totalItems: 512,
        inStock: 493,
        inTransit: 63,
        damaged: 190,
    };
}

async function getInventory(params: GetInventoryParams): Promise<GetInventoryResponse> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    let filteredData = [...DUMMY_INVENTORY];

    if (params.status && params.status !== "all") {
        filteredData = filteredData.filter((item) => item.status === params.status);
    }

    if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredData = filteredData.filter(
            (item) =>
                item.code.toLowerCase().includes(searchLower) ||
                item.name.toLowerCase().includes(searchLower) ||
                item.department.toLowerCase().includes(searchLower) ||
                item.line.toLowerCase().includes(searchLower)
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

export default function Inventario() {
    const router = useRouter();

    const [stats, setStats] = useState<InventoryStats | null>(null);
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchValue, setSearchValue] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalRows, setTotalRows] = useState(0);

    const tabs: TabOption[] = [
        { label: "Todos", value: "all" },
        { label: "Activos", value: "active" },
        { label: "Inactivos", value: "inactive" },
    ];

    const getStatusFilter = useCallback((): "all" | "active" | "inactive" => {
        return activeTab as "all" | "active" | "inactive";
    }, [activeTab]);

    useEffect(() => {
        async function loadStats() {
            try {
                const data = await getInventoryStats();
                setStats(data);
            } catch (err) {
                console.error("[Inventario] Error loading stats:", err);
            }
        }
        loadStats();
    }, []);

    const fetchInventory = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getInventory({
                page,
                limit: rowsPerPage,
                search: searchValue,
                status: getStatusFilter(),
            });
            setItems(response.data);
            setTotalRows(response.total);
        } catch (err) {
            console.error("[Inventario] Error fetching:", err);
        } finally {
            setLoading(false);
        }
    }, [page, rowsPerPage, searchValue, getStatusFilter]);

    useEffect(() => {
        fetchInventory();
    }, [fetchInventory]);

    useEffect(() => {
        setPage(0);
    }, [searchValue, activeTab]);

    const handleTabChange = (value: string) => {
        setActiveTab(value);
    };

    const handleSearchChange = (value: string) => {
        setSearchValue(value);
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (newRowsPerPage: number) => {
        setRowsPerPage(newRowsPerPage);
        setPage(0);
    };

    const handleViewDetail = (item: InventoryItem) => {
        const sku = item.code.replace(/\s+/g, "");
        router.push(`/inventario/${sku}`);
    };

    const handleRowClick = (item: InventoryItem) => {
        handleViewDetail(item);
    };

    const statsCards: StatsCardData[] = stats
        ? [
            {
                id: "total",
                label: "Total artículos",
                value: stats.totalItems,
                icon: <GridViewIcon />,
            },
            {
                id: "inStock",
                label: "En existencia",
                value: stats.inStock,
                icon: <SyncIcon />
            },
            {
                id: "inTransit",
                label: "En tránsito",
                value: stats.inTransit,
                icon: <ShippingIcon />
            },
            {
                id: "damaged",
                label: "Mercancía dañada",
                value: stats.damaged,
                icon: <BuildIcon />
            },
        ]
        : [];

    const columns: Column<InventoryItem>[] = [
        {
            id: "code",
            label: "Código",
            size: "md",
        },
        {
            id: "status",
            label: "Estatus",
            type: "chip",
            size: "sm",
            chipLabelMap: { active: "Activo", inactive: "Inactivo" },
            chipVariantMap: { active: "success", inactive: "default" } as Record<string, StatusChipVariant>,
        },
        {
            id: "name",
            label: "Nombre",
            size: "xl",
            truncate: true,
        },
        {
            id: "department",
            label: "Departamento",
            size: "lg",
            truncate: true,
        },
        {
            id: "line",
            label: "Línea",
            size: "md",
        },
        {
            id: "inStock",
            label: "En existencia",
            type: "number",
            size: "sm",
            align: "left",
            format: (value) => (
                <span style={{ color: INVENTORY_COLORS.green, fontWeight: 500 }}>
                    {String(value)}
                </span>
            ),
        },
        {
            id: "inTransit",
            label: "En tránsito",
            type: "number",
            size: "sm",
            align: "left",
            format: (value) => (
                <span style={{ color: INVENTORY_COLORS.yellow, fontWeight: 500 }}>
                    {String(value)}
                </span>
            ),
        },
        {
            id: "damaged",
            label: "Dañada",
            type: "number",
            size: "sm",
            align: "left",
            format: (value) => (
                <span style={{ color: INVENTORY_COLORS.red, fontWeight: 500 }}>
                    {String(value)}
                </span>
            ),
        },
    ];

    const rowActions: RowAction<InventoryItem>[] = [
        {
            id: "view-detail",
            label: "Ver detalle",
            icon: <VisibilityIcon fontSize="small" />,
            onClick: handleViewDetail,
            permission: INVENTORY_READ,
        },
    ];

    return (
        <MainLayout>
            <Stack direction="column" spacing={3}>
                <Title title="Inventario" />

                {
                    stats ? <StatsCardGroup cards={statsCards} /> :
                        <Grid container spacing={2}>
                            {[1, 2, 3, 4].map((i) => (
                                <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
                                    <Skeleton
                                        variant="rectangular"
                                        width="100%"
                                        height="128px"
                                        style={{ borderRadius: 8 }}
                                        animation="wave"
                                    />
                                </Grid>
                            ))}
                        </Grid>
                }

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
                    rows={items}
                    loading={loading}
                    rowKey="id"
                    page={page}
                    rowsPerPage={rowsPerPage}
                    totalRows={totalRows}
                    onPageChange={handlePageChange}
                    onRowsPerPageChange={handleRowsPerPageChange}
                    onRowClick={handleRowClick}
                    actions={rowActions}
                    emptyMessage="No hay artículos en inventario"
                />
            </Stack>
        </MainLayout>
    );
}
