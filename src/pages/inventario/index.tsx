import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/router";
import {
  GridView as GridViewIcon,
  Sync as SyncIcon,
  LocalShipping as ShippingIcon,
  Build as BuildIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { Title, TableCrud, StatsCardGroup, TabFilters } from "@/components";
import { Grid, Skeleton, Stack } from "@mui/material";
import type {
  Column,
  RowAction,
  StatusChipVariant,
} from "@/components/TableCrud";
import type { StatsCardData } from "@/components/StatsCard";
import type { TabOption } from "@/components/TabFilters";
import { INVENTORY_COLORS } from "@/styles/inventario/styles";
import { INVENTORY_READ } from "@/lib/permissions";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { useDebouncedInput } from "@/hooks/useDebouncedValue";
import {
  getInventoryList,
  getInventoryStats,
  type InventoryListItem,
  type InventoryStats,
} from "@/services/inventory.service";

const SEARCH_DEBOUNCE_MS = 300;

export default function Inventario() {
  const router = useRouter();
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [activeTab, setActiveTab] = useState("all");

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
  } = usePaginatedList<InventoryListItem>({
    queryKey: ["inventory", "list"],
    queryFn: getInventoryList,
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

  useEffect(() => {
    async function loadStats() {
      try {
        const result = await getInventoryStats();
        if (result.data) {
          setStats(result.data);
        }
      } catch (err) {
        console.error("[Inventario] Error loading stats:", err);
      }
    }
    loadStats();
  }, []);

  const tabs: TabOption[] = useMemo(
    () => [
      { label: "Todos", value: "all" },
      { label: "Activos", value: "active" },
      { label: "Inactivos", value: "inactive" },
    ],
    [],
  );

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
  }, []);

  const handleViewDetail = useCallback(
    (item: InventoryListItem) => {
      const sku = item.code.replace(/\s+/g, "");
      router.push(`/inventario/${encodeURIComponent(sku)}`);
    },
    [router],
  );

  const handleRowClick = useCallback(
    (item: InventoryListItem) => {
      handleViewDetail(item);
    },
    [handleViewDetail],
  );

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
          icon: <SyncIcon />,
        },
        {
          id: "inTransit",
          label: "En tránsito",
          value: stats.inTransit,
          icon: <ShippingIcon />,
        },
        {
          id: "damaged",
          label: "Mercancía dañada",
          value: stats.damaged,
          icon: <BuildIcon />,
        },
      ]
    : [];

  const columns: Column<InventoryListItem>[] = [
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
      chipLabelMap: {
        active: "Activo",
        inactive: "Inactivo",
      },
      chipVariantMap: {
        active: "success",
        inactive: "default",
      } as Record<string, StatusChipVariant>,
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
        <span
          style={{
            color: INVENTORY_COLORS.green,
            fontWeight: 500,
          }}
        >
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
        <span
          style={{
            color: INVENTORY_COLORS.yellow,
            fontWeight: 500,
          }}
        >
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
        <span
          style={{
            color: INVENTORY_COLORS.red,
            fontWeight: 500,
          }}
        >
          {String(value)}
        </span>
      ),
    },
  ];

  const rowActions: RowAction<InventoryListItem>[] = [
    {
      id: "view-detail",
      label: "Ver detalle",
      icon: <VisibilityIcon fontSize="small" />,
      onClick: handleViewDetail,
      permission: INVENTORY_READ,
    },
  ];

  return (
    <Stack direction="column" spacing={3}>
      <Title title="Inventario" />

      {stats ? (
        <StatsCardGroup cards={statsCards} columns={4} />
      ) : (
        <Grid container spacing={2}>
          {[1, 2, 3, 4].map((i) => (
            <Grid
              key={i}
              size={{
                xs: 12,
                sm: 6,
                md: 3,
              }}
            >
              <Skeleton
                variant="rectangular"
                width="100%"
                height="128px"
                style={{
                  borderRadius: 8,
                }}
                animation="wave"
              />
            </Grid>
          ))}
        </Grid>
      )}

      <TabFilters
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        showSearch
        searchValue={searchInput}
        onSearchChange={setSearchInput}
      />

      <TableCrud
        columns={columns}
        rows={items}
        loading={loading}
        rowKey="id"
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={totalRows}
        onPageChange={setPage}
        onRowsPerPageChange={handleRowsPerPageChange}
        onRowClick={handleRowClick}
        actions={rowActions}
        emptyMessage="No hay artículos en inventario"
      />
    </Stack>
  );
}
