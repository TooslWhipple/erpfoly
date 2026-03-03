import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import {
    TrendingUp as TrendingUpIcon,
    Edit as EditIcon,
} from "@mui/icons-material";
import { MainLayout, Title, TableCrud, StatsCardGroup, TabFilters, AddDamagedGoodsModal } from "@/components";
import { Box, Skeleton, Stack } from "@mui/material";
import type { Column, RowAction } from "@/components/TableCrud";
import type { StatsCardData } from "@/components/StatsCard";
import type { TabOption } from "@/components/TabFilters";
import { DamageStatus } from "@/styles/inventario/styles";
import { colors } from "@/styles/theme";
import type { ChipStyleConfig } from "@/components/TableCrud";

interface DamagedItem {
    id: number;
    folio: string;
    invoice: string;
    location: string;
    createdAt: string;
    article: string;
    generatedBy: string;
    damageType: string;
    status: DamageStatus;
    timeElapsed: string;
    hasWarning: boolean;
}

interface GetDamagedItemsParams {
    page: number;
    limit: number;
    search?: string;
    status?: "all" | DamageStatus;
}

interface GetDamagedItemsResponse {
    data: DamagedItem[];
    total: number;
    page: number;
    limit: number;
}

interface DamagedStats {
    totalItems: number;
    itemsCost: number;
    itemsValue: number;
    itemsChange: number;
    costChange: number;
    valueChange: number;
}

const DUMMY_DAMAGED_ITEMS: DamagedItem[] = [
    {
        id: 1,
        folio: "000001",
        invoice: "123456",
        location: "Foly Muebles Tampico Centro",
        createdAt: "15 Julio 2025",
        article: "Lavadora Mabe 1...",
        generatedBy: "Julio Huerta",
        damageType: "Defecto de fábrica",
        status: "pending",
        timeElapsed: "1 año",
        hasWarning: true,
    },
    {
        id: 2,
        folio: "000001",
        invoice: "123456",
        location: "Foly Muebles Altamira",
        createdAt: "15 Julio 2025",
        article: "Lavadora Mabe 1...",
        generatedBy: "Julio Huerta",
        damageType: "Defecto de fábrica",
        status: "pending",
        timeElapsed: "10 meses",
        hasWarning: true,
    },
    {
        id: 3,
        folio: "000001",
        invoice: "123456",
        location: "Foly Muebles Ejército Mexicano",
        createdAt: "15 Julio 2025",
        article: "Lavadora Mabe 1...",
        generatedBy: "Julio Huerta",
        damageType: "Defecto de fábrica",
        status: "pending",
        timeElapsed: "7 meses",
        hasWarning: true,
    },
    {
        id: 4,
        folio: "000001",
        invoice: "123456",
        location: "Foly Muebles Pánuco",
        createdAt: "15 Julio 2025",
        article: "Lavadora Mabe 1...",
        generatedBy: "Julio Huerta",
        damageType: "Defecto de fábrica",
        status: "pending",
        timeElapsed: "6 meses",
        hasWarning: true,
    },
    {
        id: 5,
        folio: "000001",
        invoice: "123456",
        location: "Foly Muebles Coatzacualcos",
        createdAt: "15 Julio 2025",
        article: "Lavadora Mabe 1...",
        generatedBy: "Julio Huerta",
        damageType: "Defecto de fábrica",
        status: "pending",
        timeElapsed: "5 meses",
        hasWarning: false,
    },
    {
        id: 6,
        folio: "000001",
        invoice: "123456",
        location: "Foly Muebles San Luis Potosí Carranza",
        createdAt: "15 Julio 2025",
        article: "Lavadora Mabe 1...",
        generatedBy: "Julio Huerta",
        damageType: "Defecto de fábrica",
        status: "pending",
        timeElapsed: "2 meses",
        hasWarning: false,
    },
    {
        id: 7,
        folio: "000002",
        invoice: "123457",
        location: "Foly Muebles Matriz",
        createdAt: "10 Julio 2025",
        article: "Estufa Mabe 30\"...",
        generatedBy: "María López",
        damageType: "Daño en transporte",
        status: "in_progress",
        timeElapsed: "3 meses",
        hasWarning: false,
    },
    {
        id: 8,
        folio: "000003",
        invoice: "123458",
        location: "Foly Muebles Veracruz Puerto",
        createdAt: "5 Julio 2025",
        article: "Refrigerador LG...",
        generatedBy: "Carlos Mendez",
        damageType: "Defecto de fábrica",
        status: "completed",
        timeElapsed: "1 mes",
        hasWarning: false,
    },
];

async function getDamagedStats(): Promise<DamagedStats> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
        totalItems: 812,
        itemsCost: 1060539.59,
        itemsValue: 3421309.40,
        itemsChange: 12,
        costChange: 79502.40,
        valueChange: 79502.40,
    };
}

async function getDamagedItems(
    params: GetDamagedItemsParams
): Promise<GetDamagedItemsResponse> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    let filteredData = [...DUMMY_DAMAGED_ITEMS];

    if (params.status && params.status !== "all") {
        filteredData = filteredData.filter((item) => item.status === params.status);
    }

    if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredData = filteredData.filter(
            (item) =>
                item.folio.toLowerCase().includes(searchLower) ||
                item.invoice.toLowerCase().includes(searchLower) ||
                item.location.toLowerCase().includes(searchLower) ||
                item.article.toLowerCase().includes(searchLower) ||
                item.generatedBy.toLowerCase().includes(searchLower)
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

function getStatusLabel(status: DamageStatus): string {
    const labels: Record<DamageStatus, string> = {
        pending: "Por realizar",
        in_progress: "Realizando",
        completed: "Finalizada",
        cancelled: "Cancelada",
    };
    return labels[status];
}

/** Builds chipConfig for timeElapsed: critical (red + icon), warning (orange + icon), normal (gray) */
function buildTimeElapsedChipConfig(): Record<string, ChipStyleConfig> {
    const config: Record<string, ChipStyleConfig> = {};
    const critical: ChipStyleConfig = {
        bgColor: "#FEF2F2",
        textColor: "#DC2626",
        showWarningIcon: true,
    };
    const warning: ChipStyleConfig = {
        bgColor: "#FFF7ED",
        textColor: "#EA580C",
        showWarningIcon: true,
    };
    const normal: ChipStyleConfig = {
        bgColor: colors.chip.background,
        textColor: colors.chip.text,
    };
    for (let i = 1; i <= 10; i++) {
        config[i === 1 ? "1 año" : `${i} años`] = critical;
    }
    for (let i = 6; i <= 11; i++) {
        config[`${i} meses`] = warning;
    }
    config["1 mes"] = normal;
    for (let i = 2; i <= 5; i++) {
        config[`${i} meses`] = normal;
    }
    config["1 día"] = normal;
    for (let i = 2; i <= 31; i++) {
        config[`${i} días`] = normal;
    }
    return config;
}

const TIME_ELAPSED_CHIP_CONFIG = buildTimeElapsedChipConfig();

export default function MercanciaDanada() {
    const router = useRouter();

    const [stats, setStats] = useState<DamagedStats | null>(null);
    const [items, setItems] = useState<DamagedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchValue, setSearchValue] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalRows, setTotalRows] = useState(0);
    const [addModalOpen, setAddModalOpen] = useState(false);

    const tabs: TabOption[] = [
        { label: "Todos", value: "all" },
        { label: "Por realizar", value: "pending" },
        { label: "Realizando", value: "in_progress" },
        { label: "Finalizadas", value: "completed" },
        { label: "Canceladas", value: "cancelled" },
    ];

    const getStatusFilter = useCallback((): "all" | DamageStatus => {
        return activeTab as "all" | DamageStatus;
    }, [activeTab]);

    useEffect(() => {
        async function loadStats() {
            try {
                const data = await getDamagedStats();
                setStats(data);
            } catch (err) {
                console.error("[MercanciaDanada] Error loading stats:", err);
            }
        }
        loadStats();
    }, []);

    const fetchItems = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getDamagedItems({
                page,
                limit: rowsPerPage,
                search: searchValue,
                status: getStatusFilter(),
            });
            setItems(response.data);
            setTotalRows(response.total);
        } catch (err) {
            console.error("[MercanciaDanada] Error fetching:", err);
        } finally {
            setLoading(false);
        }
    }, [page, rowsPerPage, searchValue, getStatusFilter]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

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
        setAddModalOpen(true);
    };

    const handleEdit = (item: DamagedItem) => {
        router.push(`/inventario/mercancia-danada/${item.id}`);
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (newRowsPerPage: number) => {
        setRowsPerPage(newRowsPerPage);
        setPage(0);
    };

    const statsCards: StatsCardData[] = stats
        ? [
            {
                id: "totalItems",
                label: "Artículos dañados",
                value: stats.totalItems,
                icon: <TrendingUpIcon />,
                comparison: {
                    value: stats.itemsChange,
                    type: "increase",
                    period: "el mes anterior",
                },
            },
            {
                id: "itemsCost",
                label: "Costo de los artículos",
                value: stats.itemsCost,
                icon: <TrendingUpIcon />,
                isCurrency: true,
                comparison: {
                    value: stats.costChange,
                    type: "increase",
                    period: "el mes anterior",
                },
            },
            {
                id: "itemsValue",
                label: "Valor de los artículos",
                value: stats.itemsValue,
                icon: <TrendingUpIcon />,
                isCurrency: true,
                comparison: {
                    value: stats.valueChange,
                    type: "increase",
                    period: "el mes anterior",
                },
            },
        ]
        : [];

    const columns: Column<DamagedItem>[] = [
        {
            id: "folio",
            label: "Folio",
            size: "sm",
        },
        {
            id: "invoice",
            label: "Factura",
            size: "sm",
        },
        {
            id: "location",
            label: "Ubicación",
            size: "xl",
            truncate: true,
        },
        {
            id: "createdAt",
            label: "Elaboración",
            size: "md",
        },
        {
            id: "article",
            label: "Artículo",
            size: "xl",
            truncate: true,
        },
        {
            id: "generatedBy",
            label: "Generada",
            size: "xl",
            truncate: true,
        },
        {
            id: "damageType",
            label: "Daño",
            size: "lg",
        },
        {
            id: "status",
            label: "Estatus",
            size: "md",
            type: "chip",
            chipConfig: {
                pending: {
                    label: "Por realizar",
                    bgColor: "#FFF7ED",
                    textColor: "#EA580C",
                },
                in_progress: {
                    label: "Realizando",
                    bgColor: "#FFF7ED",
                    textColor: "#EA580C",
                },
                completed: {
                    label: "Finalizada",
                    bgColor: "#DCFCE7",
                    textColor: "#16A34A",
                },
                cancelled: {
                    label: "Cancelada",
                    bgColor: "#FEF2F2",
                    textColor: "#EF4444",
                },
            }
        },
        {
            id: "timeElapsed",
            label: "Tiempo",
            size: "md",
            type: "chip",
            chipConfig: TIME_ELAPSED_CHIP_CONFIG,
        },
    ];

    // Row actions
    const actions: RowAction<DamagedItem>[] = [
        {
            id: "edit",
            label: "Editar",
            icon: <EditIcon fontSize="small" />,
            onClick: handleEdit,
        },
    ];

    return (
        <MainLayout>
            <Stack direction="column" spacing={3}>
                <Title title="Mercancía dañada" />

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
                            label: "Ingresar",
                            onClick: handleCreate,
                            variant: "contained",
                            color: "primary",
                        },
                    ]}
                />

                {
                    stats ? <StatsCardGroup cards={statsCards} />
                        :
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: "repeat(3, 1fr)",
                                gap: 2,
                            }}
                        >
                            {[1, 2, 3].map((i) => (
                                <Skeleton
                                    key={i}
                                    variant="rectangular"
                                    height={120}
                                    sx={{ borderRadius: 2 }}
                                    animation="wave"
                                />
                            ))}
                        </Box>

                }

                <TableCrud
                    columns={columns}
                    rows={items}
                    actions={actions}
                    loading={loading}
                    rowKey="id"
                    page={page}
                    rowsPerPage={rowsPerPage}
                    totalRows={totalRows}
                    onPageChange={handlePageChange}
                    onRowsPerPageChange={handleRowsPerPageChange}
                    onRowClick={handleEdit}
                    emptyMessage="No hay mercancía dañada registrada"
                />

                <AddDamagedGoodsModal
                    open={addModalOpen}
                    onClose={() => setAddModalOpen(false)}
                    onSubmit={async () => {
                        await new Promise((r) => setTimeout(r, 800));
                        fetchItems();
                    }}
                />
            </Stack>

        </MainLayout>
    );
}
