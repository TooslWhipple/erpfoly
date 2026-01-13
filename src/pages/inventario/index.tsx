import { useState, useEffect, useCallback } from "react";
import { styled } from "@mui/material/styles";
import { Box, InputAdornment, Tabs, Tab } from "@mui/material";
import {
    GridView as GridViewIcon,
    Sync as SyncIcon,
    LocalShipping as ShippingIcon,
    Build as BuildIcon,
} from "@mui/icons-material";
import { MainLayout, Title, TableCrud, StatsCardGroup } from "@/components";
import type { Column } from "@/components/TableCrud";
import type { StatsCardData } from "@/components/StatsCard";
import { colors } from "@/styles/theme";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

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

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const StatsSection = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(3),
}));

const FiltersRow = styled(Box)(({ theme }) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(2),
    gap: theme.spacing(2),
    flexWrap: "wrap",
}));

const TabsContainer = styled(Box)({
    borderBottom: `1px solid ${colors.border}`,
});

const StyledTabs = styled(Tabs)({
    minHeight: 40,
    "& .MuiTabs-indicator": {
        backgroundColor: "#232325",
        height: 2,
    },
});

const StyledTab = styled(Tab)({
    textTransform: "none",
    fontSize: "0.9375rem",
    fontWeight: 500,
    color: "#71717A",
    minWidth: 80,
    minHeight: 40,
    padding: "8px 16px",
    "&.Mui-selected": {
        color: "#232325",
    },
});

const SearchContainer = styled(Box)({
    display: "flex",
    alignItems: "center",
    gap: 12,
});

const SearchInput = styled("input")(({ theme }) => ({
    height: 40,
    width: 240,
    padding: "0 12px 0 40px",
    fontSize: "0.875rem",
    border: `1px solid ${colors.border}`,
    borderRadius: 8,
    outline: "none",
    backgroundColor: "transparent",
    "&:focus": {
        borderColor: theme.palette.primary.main,
    },
    "&::placeholder": {
        color: "#9CA3AF",
    },
}));

const SearchWrapper = styled(Box)({
    position: "relative",
    display: "flex",
    alignItems: "center",
});

const SearchIconWrapper = styled(Box)({
    position: "absolute",
    left: 12,
    color: "#9CA3AF",
    display: "flex",
    alignItems: "center",
    "& svg": {
        width: 20,
        height: 20,
    },
});

// Colors for inventory
const COLORS = {
    green: "#16a34a",
    greenBorder: "#86efac",
    yellow: "#ca8a04",
    yellowBorder: "#fde047",
    red: "#dc2626",
    redBorder: "#fca5a5",
};

// ============================================================================
// MOCK DATA
// ============================================================================

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

// ============================================================================
// MOCK API FUNCTIONS
// ============================================================================

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

    // Filter by status
    if (params.status && params.status !== "all") {
        filteredData = filteredData.filter((item) => item.status === params.status);
    }

    // Filter by search
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

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Inventario() {
    // State
    const [stats, setStats] = useState<InventoryStats | null>(null);
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchValue, setSearchValue] = useState("");
    const [activeTab, setActiveTab] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalRows, setTotalRows] = useState(0);

    // Get status filter from tab
    const getStatusFilter = (): "all" | "active" | "inactive" => {
        switch (activeTab) {
            case 1:
                return "active";
            case 2:
                return "inactive";
            default:
                return "all";
        }
    };

    // Fetch stats
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

    // Fetch inventory
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
    }, [page, rowsPerPage, searchValue, activeTab]);

    useEffect(() => {
        fetchInventory();
    }, [fetchInventory]);

    useEffect(() => {
        setPage(0);
    }, [searchValue, activeTab]);

    // Event handlers
    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(event.target.value);
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (newRowsPerPage: number) => {
        setRowsPerPage(newRowsPerPage);
        setPage(0);
    };

    // Stats cards data
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

    // Table columns
    const columns: Column<InventoryItem>[] = [
        {
            id: "code",
            label: "CÓDIGO",
            size: "md",
        },
        {
            id: "status",
            label: "ESTATUS",
            type: "chip",
            size: "sm",
            chipConfig: {
                active: {
                    label: "Activo",
                    bgColor: "#dcfce7",
                    textColor: "#16a34a",
                },
                inactive: {
                    label: "Inactivo",
                    bgColor: "#f3f4f6",
                    textColor: "#6b7280",
                },
            },
        },
        {
            id: "name",
            label: "NOMBRE",
            size: "xl",
            truncate: true,
        },
        {
            id: "department",
            label: "DEPARTAMENTO",
            size: "lg",
            truncate: true,
        },
        {
            id: "line",
            label: "LÍNEA",
            size: "md",
        },
        {
            id: "inStock",
            label: "EN EXISTENCIA",
            type: "number",
            size: "sm",
            align: "left",
            format: (value) => (
                <span style={{ color: COLORS.green, fontWeight: 500 }}>
                    {String(value)}
                </span>
            ),
        },
        {
            id: "inTransit",
            label: "EN TRÁNSITO",
            type: "number",
            size: "sm",
            align: "left",
            format: (value) => (
                <span style={{ color: COLORS.yellow, fontWeight: 500 }}>
                    {String(value)}
                </span>
            ),
        },
        {
            id: "damaged",
            label: "DAÑADA",
            type: "number",
            size: "sm",
            align: "left",
            format: (value) => (
                <span style={{ color: COLORS.red, fontWeight: 500 }}>
                    {String(value)}
                </span>
            ),
        },
    ];

    return (
        <MainLayout>
            <Title title="Inventario" />

            <StatsSection>
                <StatsCardGroup cards={statsCards} />
            </StatsSection>

            <FiltersRow>
                <TabsContainer>
                    <StyledTabs value={activeTab} onChange={handleTabChange}>
                        <StyledTab label="Todos" />
                        <StyledTab label="Activos" />
                        <StyledTab label="Inactivos" />
                    </StyledTabs>
                </TabsContainer>

                <SearchContainer>
                    <SearchWrapper>
                        <SearchIconWrapper>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                                />
                            </svg>
                        </SearchIconWrapper>
                        <SearchInput
                            placeholder="Buscar"
                            value={searchValue}
                            onChange={handleSearchChange}
                        />
                    </SearchWrapper>
                </SearchContainer>
            </FiltersRow>

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
                emptyMessage="No hay artículos en inventario"
            />
        </MainLayout>
    );
}
