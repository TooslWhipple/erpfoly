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
  type InventoryQuantityFilter,
  type InventoryStats,
} from "@/services/inventory.service";

const SEARCH_DEBOUNCE_MS = 300;

const QUANTITY_FILTER_OPTIONS = [
  { label: "Todas", value: "all" },
  { label: "En existencia > 0", value: "inStock" },
  { label: "En tránsito > 0", value: "inTransit" },
  { label: "Dañada > 0", value: "damaged" },
];

export default function Inventario() {
  const router = useRouter();
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [quantityFilter, setQuantityFilter] =
    useState<InventoryQuantityFilter | null>(null);

  const listExtraParams = useMemo(() => {
    const params: {
      status?: string;
      quantityFilter?: InventoryQuantityFilter;
    } = {};
    if (activeTab !== "all") {
      params.status = activeTab;
    }
    if (quantityFilter) {
      params.quantityFilter = quantityFilter;
    }
    return params;
  }, [activeTab, quantityFilter]);

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
  }, [activeTab, quantityFilter, setPage]);

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

  const handleQuantityCardClick = useCallback((id: string) => {
    if (id === "total") {
      setQuantityFilter(null);
      return;
    }
    setQuantityFilter((current) =>
      current === id ? null : (id as InventoryQuantityFilter),
    );
  }, []);

  const handleQuantityFilterChange = useCallback((value: string) => {
    setQuantityFilter(
      value === "all" ? null : (value as InventoryQuantityFilter),
    );
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
          clickable: true,
        },
        {
          id: "inStock",
          label: "En existencia",
          value: stats.inStock,
          icon: <SyncIcon />,
          clickable: true,
        },
        {
          id: "inTransit",
          label: "En tránsito",
          value: stats.inTransit,
          icon: <ShippingIcon />,
          clickable: true,
        },
        {
          id: "damaged",
          label: "Mercancía dañada",
          value: stats.damaged,
          icon: <BuildIcon />,
          clickable: true,
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
        <StatsCardGroup
          cards={statsCards}
          columns={4}
          activeCardId={quantityFilter ?? "total"}
          onCardClick={handleQuantityCardClick}
        />
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
        selectFilters={[
          {
            label: "Cantidad",
            value: quantityFilter ?? "all",
            options: QUANTITY_FILTER_OPTIONS,
            onChange: handleQuantityFilterChange,
          },
        ]}
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
        emptyMessage={
          quantityFilter
            ? "No hay artículos con cantidad mayor a 0 en esa columna"
            : "No hay artículos en inventario"
        }
      />
    </Stack>
  );
}
