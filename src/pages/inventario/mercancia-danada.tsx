import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
    TrendingUp as TrendingUpIcon,
    Edit as EditIcon,
} from "@mui/icons-material";
import { MainLayout, Title, TableCrud, StatsCardGroup, TabFilters, AddDamagedGoodsModal } from "@/components";
import { Grid, Skeleton, Stack } from "@mui/material";
import type { Column, RowAction, StatusChipVariant } from "@/components/TableCrud";
import type { StatsCardData } from "@/components/StatsCard";
import type { TabOption } from "@/components/TabFilters";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { useDebouncedInput } from "@/hooks/useDebouncedValue";
import {
    getDamagedProducts,
    type DamagedProductListItem,
} from "@/services/damaged-products.service";

const SEARCH_DEBOUNCE_MS = 300;

const DAMAGE_STATUS_CHIP_LABELS: Record<string, string> = {
    pending: "Por realizar",
    in_progress: "Realizando",
    completed: "Finalizada",
    cancelled: "Cancelada",
    PENDING: "Por realizar",
    IN_PROGRESS: "Realizando",
    COMPLETED: "Finalizada",
    CANCELLED: "Cancelada",
};

const DAMAGE_STATUS_CHIP_VARIANTS: Record<string, StatusChipVariant> = {
    pending: "pending",
    in_progress: "pending",
    completed: "success",
    cancelled: "error",
    PENDING: "pending",
    IN_PROGRESS: "pending",
    COMPLETED: "success",
    CANCELLED: "error",
};

interface DamagedStats {
    totalItems: number;
    itemsCost: number;
    itemsValue: number;
    itemsChange: number;
    costChange: number;
    valueChange: number;
}

async function getDamagedStats(): Promise<DamagedStats> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
        totalItems: 812,
        itemsCost: 1060539.59,
        itemsValue: 3421309.4,
        itemsChange: 12,
        costChange: 79502.4,
        valueChange: 79502.4,
    };
}

export default function MercanciaDanada() {
    const router = useRouter();

    const [stats, setStats] = useState<DamagedStats | null>(null);
    const [activeTab, setActiveTab] = useState("all");
    const [addModalOpen, setAddModalOpen] = useState(false);

    const listExtraParams = useMemo(() => {
        if (activeTab === "all") {
            return {};
        }
        return { status: activeTab };
    }, [activeTab]);

    const {
        data: items,
        total: totalRows,
        page,
        rowsPerPage,
        search: searchValue,
        setPage,
        setRowsPerPage: handleRowsPerPageChange,
        setSearch,
        isLoading: loading,
        refetch,
    } = usePaginatedList<DamagedProductListItem>({
        queryKey: ["damaged-products", "list"],
        queryFn: getDamagedProducts,
        initialPage: 0,
        initialRowsPerPage: 10,
        initialSearch: "",
        extraParams: listExtraParams,
    });

    useEffect(() => {
        setPage(0);
    }, [activeTab, setPage]);

    const [searchInput, setSearchInput, debouncedSearch] = useDebouncedInput(
        searchValue,
        SEARCH_DEBOUNCE_MS,
    );

    useEffect(() => {
        setSearch(debouncedSearch);
    }, [debouncedSearch, setSearch]);

    const tabs: TabOption[] = useMemo(
        () => [
            { label: "Todos", value: "all" },
            { label: "Por realizar", value: "pending" },
            { label: "Realizando", value: "in_progress" },
            { label: "Finalizadas", value: "completed" },
            { label: "Canceladas", value: "cancelled" },
        ],
        [],
    );

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

    const handleSearchChange = useCallback(
        (value: string) => {
            setSearchInput(value);
        },
        [setSearchInput],
    );

    const handleTabChange = useCallback((value: string) => {
        setActiveTab(value);
    }, []);

    const handleCreate = useCallback(() => {
        setAddModalOpen(true);
    }, []);

    const handleEdit = useCallback(
        (item: DamagedProductListItem) => {
            if (item.id == null) {
                return;
            }
            router.push(`/inventario/mercancia-danada/${item.id}`);
        },
        [router],
    );

    const handlePageChange = useCallback(
        (newPage: number) => {
            setPage(newPage);
        },
        [setPage],
    );

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

    const columns = useMemo<Column<DamagedProductListItem>[]>(
        () => [
            {
                id: "productCode",
                label: "Código",
                type: "text",
                size: "sm",
            },
            {
                id: "branch",
                label: "Sucursal",
                size: "xl",
                truncate: true,
                format: (value) => {
                    if (value && typeof value === "object" && "name" in value) {
                        return String((value as DamagedProductListItem["branch"]).name ?? "");
                    }
                    return "";
                },
            },
            {
                id: "registrationDate",
                label: "Registro",
                type: "date",
                size: "md",
            },
            {
                id: "productName",
                label: "Producto",
                size: "xl",
                truncate: true,
            },
            {
                id: "registeredByUser",
                label: "Registrado por",
                size: "lg",
                truncate: true,
            },
            {
                id: "damageType",
                label: "Tipo de daño",
                size: "lg",
            },
            {
                id: "status",
                label: "Estatus",
                size: "md",
                type: "chip",
                chipLabelMap: DAMAGE_STATUS_CHIP_LABELS,
                chipVariantMap: DAMAGE_STATUS_CHIP_VARIANTS,
            },
            {
                id: "elapsedSinceRegistration",
                label: "Tiempo transcurrido",
                size: "md",
                type: "text",
            },
        ],
        [],
    );

    const actions = useMemo<RowAction<DamagedProductListItem>[]>(
        () => [
            {
                id: "edit",
                label: "Editar",
                icon: <EditIcon fontSize="small" />,
                onClick: handleEdit,
                disabled: (row) => row.id == null,
            },
        ],
        [handleEdit],
    );

    const handleRowClick = useCallback(
        (row: DamagedProductListItem) => {
            if (row.id != null) {
                handleEdit(row);
            }
        },
        [handleEdit],
    );

    return (
        <MainLayout>
            <Stack direction="column" spacing={3}>
                <Title title="Mercancía dañada" />

                <TabFilters
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                    showSearch
                    searchValue={searchInput}
                    onSearchChange={handleSearchChange}
                    searchPlaceholder="Buscar por código, producto o sucursal"
                    actions={[
                        {
                            label: "Ingresar",
                            onClick: handleCreate,
                            variant: "contained",
                            color: "primary",
                        },
                    ]}
                />

                {stats ? (
                    <StatsCardGroup cards={statsCards} />
                ) : (
                    <Grid container spacing={2}>
                        {[1, 2, 3].map((i) => (
                            <Grid key={i} size={{ xs: 12, sm: 6, md: 'grow' }}>
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
                )}

                <TableCrud
                    columns={columns}
                    rows={items}
                    actions={actions}
                    loading={loading}
                    rowKey="rowKey"
                    page={page}
                    rowsPerPage={rowsPerPage}
                    totalRows={totalRows}
                    onPageChange={handlePageChange}
                    onRowsPerPageChange={handleRowsPerPageChange}
                    onRowClick={handleRowClick}
                    emptyMessage="No hay mercancía dañada registrada"
                />

                <AddDamagedGoodsModal
                    open={addModalOpen}
                    onClose={() => setAddModalOpen(false)}
                    onSubmit={async () => {
                        await new Promise((r) => setTimeout(r, 800));
                        refetch();
                    }}
                />
            </Stack>
        </MainLayout>
    );
}
