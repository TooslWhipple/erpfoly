import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  TrendingUp as TrendingUpIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import {
  Title,
  TableCrud,
  StatsCardGroup,
  TabFilters,
  AddDamagedGoodsModal,
  StatusChip,
} from "@/components";
import type { AddDamagedGoodsPrefill } from "@/components/AddDamagedGoodsModal";
import { Grid, Skeleton, Stack, Typography } from "@mui/material";
import type {
  Column,
  RowAction,
  StatusChipVariant,
} from "@/components/TableCrud";
import type { StatsCardData } from "@/components/StatsCard";
import type {
  SelectFilterConfig,
  SelectFilterOption,
} from "@/components/TabFilters";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { useDebouncedInput } from "@/hooks/useDebouncedValue";
import { usePermissions } from "@/hooks/usePermissions";
import {
  getDamagedProducts,
  getDamagedProductsCatalog,
  getDamagedProductStats,
  type DamagedProductCatalogItem,
  type DamagedProductListItem,
  type DamagedProductSortField,
  type DamagedProductSortOrder,
  type DamagedProductStats,
  type DamagedProductStatsParams,
} from "@/services/damaged-products.service";
import {
  DAMAGED_INVENTORY_CREATE,
  DAMAGED_INVENTORY_UPDATE,
} from "@/lib/permissions";
import {
  formatElapsedCompact,
  formatElapsedDetailEs,
} from "@/utils/damagedGoodsElapsed";
import { toTitleCase } from "@/utils/strings";

/** Title Case for list cells; keeps placeholders like "—" untouched. */
function displayTitleCase(value: unknown): string {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed || trimmed === "—") return trimmed || "";
  return toTitleCase(trimmed);
}

const SEARCH_DEBOUNCE_MS = 300;
const PREFILL_BRANCH_PARAM = "branch_id";
const PREFILL_PRODUCT_PARAM = "product_id";
const FILTER_ALL = "all";
const FOLY_AUDIENCE = "foly" as const;

function parsePrefill(
  query: Record<string, string | string[] | undefined>,
): AddDamagedGoodsPrefill | undefined {
  const branchId = Number(query[PREFILL_BRANCH_PARAM]);
  const productId = Number(query[PREFILL_PRODUCT_PARAM]);
  return Number.isInteger(branchId) &&
    branchId > 0 &&
    Number.isInteger(productId) &&
    productId > 0
    ? { branchId, productId }
    : undefined;
}

const DAMAGE_STATUS_CHIP_LABELS: Record<string, string> = {
  pending: "Por realizar",
  completed: "Finalizada",
  cancelled: "Cancelada",
  PENDING: "Por realizar",
  COMPLETED: "Finalizada",
  CANCELLED: "Cancelada",
  external_repair: "En reparación",
  internal_repair: "En reparación",
};
const DAMAGE_STATUS_CHIP_VARIANTS: Record<string, StatusChipVariant> = {
  pending: "pending",
  completed: "success",
  cancelled: "error",
  PENDING: "pending",
  COMPLETED: "success",
  CANCELLED: "error",
  external_repair: "info",
  internal_repair: "info",
};

function isFolioCompleted(row: DamagedProductListItem): boolean {
  return row.status.toLowerCase() === "completed";
}

export default function MercanciaDanada() {
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const [stats, setStats] = useState<DamagedProductStats | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [sortField, setSortField] = useState<DamagedProductSortField | null>(
    null,
  );
  const [sortOrder, setSortOrder] = useState<DamagedProductSortOrder>("desc");
  const [branchFilter, setBranchFilter] = useState(FILTER_ALL);
  const [repairAssigneeFilter, setRepairAssigneeFilter] = useState(FILTER_ALL);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [catalogBranches, setCatalogBranches] = useState<
    DamagedProductCatalogItem[]
  >([]);
  const [catalogRepairSuppliers, setCatalogRepairSuppliers] = useState<
    DamagedProductCatalogItem[]
  >([]);
  const [catalogRepairResponsibles, setCatalogRepairResponsibles] = useState<
    DamagedProductCatalogItem[]
  >([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const canCreate = hasPermission(DAMAGED_INVENTORY_CREATE);
  const prefill = useMemo(
    () => (canCreate ? parsePrefill(router.query) : undefined),
    [canCreate, router.query],
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const result = await getDamagedProductsCatalog();
      if (cancelled || result.error || !result.data) return;
      setCatalogBranches(result.data.branches ?? []);
      setCatalogRepairSuppliers(result.data.repairSuppliers ?? []);
      setCatalogRepairResponsibles(result.data.repairResponsibles ?? []);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const branchOptions: SelectFilterOption[] = useMemo(
    () => [
      { label: "Todas las sucursales", value: FILTER_ALL },
      ...catalogBranches.map((branch) => ({
        label: branch.label,
        value: String(branch.id),
      })),
    ],
    [catalogBranches],
  );

  const statusOptions: SelectFilterOption[] = useMemo(
    () => [
      { label: "Todos", value: "all" },
      { label: "Por realizar", value: "pending" },
      { label: "En reparación", value: "in_repair" },
      { label: "Finalizadas", value: "completed" },
      { label: "Canceladas", value: "cancelled" },
    ],
    [],
  );

  const repairAssigneeOptions: SelectFilterOption[] = useMemo(
    () => [
      { label: "Todos", value: FILTER_ALL },
      { label: "Foly (interna)", value: "internal" },
      ...catalogRepairSuppliers.map((supplier) => ({
        label: supplier.label,
        value: `supplier:${supplier.id}`,
      })),
      ...catalogRepairResponsibles.map((user) => ({
        label: user.label,
        value: `user:${user.id}`,
      })),
    ],
    [catalogRepairSuppliers, catalogRepairResponsibles],
  );

  const listExtraParams = useMemo(() => {
    const params: {
      audience: typeof FOLY_AUDIENCE;
      status?: string;
      branchId?: number;
      dateFrom?: string;
      dateTo?: string;
      repairAssigneeKey?: string;
      sortField?: DamagedProductSortField;
      sortOrder?: DamagedProductSortOrder;
    } = { audience: FOLY_AUDIENCE };
    if (activeTab !== "all") {
      params.status = activeTab;
    }
    if (branchFilter !== FILTER_ALL) {
      const branchId = Number(branchFilter);
      if (Number.isInteger(branchId) && branchId > 0) {
        params.branchId = branchId;
      }
    }
    if (repairAssigneeFilter !== FILTER_ALL) {
      params.repairAssigneeKey = repairAssigneeFilter;
    }
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;
    if (sortField) {
      params.sortField = sortField;
      params.sortOrder = sortOrder;
    }
    return params;
  }, [
    activeTab,
    branchFilter,
    repairAssigneeFilter,
    dateFrom,
    dateTo,
    sortField,
    sortOrder,
  ]);

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
    queryKey: ["damaged-products", "list", FOLY_AUDIENCE],
    queryFn: getDamagedProducts,
    initialPage: 0,
    initialRowsPerPage: 10,
    initialSearch: "",
    extraParams: listExtraParams,
  });

  useEffect(() => {
    setPage(0);
  }, [
    activeTab,
    branchFilter,
    repairAssigneeFilter,
    dateFrom,
    dateTo,
    sortField,
    sortOrder,
    setPage,
  ]);

  const [searchInput, setSearchInput, debouncedSearch] = useDebouncedInput(
    searchValue,
    SEARCH_DEBOUNCE_MS,
  );
  useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);

  const toolbarSelectFilters = useMemo((): SelectFilterConfig[] => {
    return [
      {
        label: "Estatus",
        value: activeTab,
        options: statusOptions,
        onChange: setActiveTab,
        minWidth: 180,
      },
      {
        label: "Sucursal",
        value: branchFilter,
        options: branchOptions,
        onChange: setBranchFilter,
        minWidth: 200,
      },
      {
        label: "Proveedor / Técnico",
        value: repairAssigneeFilter,
        options: repairAssigneeOptions,
        onChange: setRepairAssigneeFilter,
        minWidth: 220,
      },
    ];
  }, [
    activeTab,
    statusOptions,
    branchFilter,
    branchOptions,
    repairAssigneeFilter,
    repairAssigneeOptions,
  ]);

  const statsQueryParams = useMemo(() => {
    const params: DamagedProductStatsParams = {
      audience: FOLY_AUDIENCE,
    };
    if (listExtraParams.status) {
      params.status = listExtraParams.status;
    }
    if (listExtraParams.branchId != null) {
      params.branchId = listExtraParams.branchId;
    }
    if (listExtraParams.dateFrom) {
      params.dateFrom = listExtraParams.dateFrom;
    }
    if (listExtraParams.dateTo) {
      params.dateTo = listExtraParams.dateTo;
    }
    if (listExtraParams.repairAssigneeKey) {
      params.repairAssigneeKey = listExtraParams.repairAssigneeKey;
    }
    const term = searchValue.trim();
    if (term) {
      params.search = term;
    }
    return params;
  }, [listExtraParams, searchValue]);

  const loadStats = useCallback(async () => {
    try {
      const result = await getDamagedProductStats(statsQueryParams);
      if (result.data != null) {
        setStats(result.data);
      }
    } catch (err) {
      console.error("[MercanciaDanada] Error loading stats:", err);
    }
  }, [statsQueryParams]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  const handleAddSuccess = useCallback(() => {
    void refetch();
    void loadStats();
  }, [refetch, loadStats]);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchInput(value);
    },
    [setSearchInput],
  );

  const handleSortChange = useCallback(
    (field: string, order: DamagedProductSortOrder) => {
      setSortField(field as DamagedProductSortField);
      setSortOrder(order);
    },
    [],
  );

  const handleCreate = useCallback(() => {
    setAddModalOpen(true);
  }, []);

  const handleEdit = useCallback((item: DamagedProductListItem) => {
    if (item.id == null) {
      return;
    }
    setEditingId(item.id);
    setAddModalOpen(true);
  }, []);

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);
    },
    [setPage],
  );

  const toComparison = (
    change: number,
  ): StatsCardData["comparison"] | undefined => {
    if (change === 0) {
      return undefined;
    }
    return {
      value: Math.abs(change),
      type: change > 0 ? "increase" : "decrease",
      period: "el mes anterior",
    };
  };

  const statsCards: StatsCardData[] = stats
    ? [
        {
          id: "totalItems",
          label: "Artículos dañados",
          value: stats.totalItems,
          icon: <TrendingUpIcon />,
          comparison: toComparison(stats.itemsChange),
        },
        {
          id: "itemsCost",
          label: "Costo de los artículos",
          value: stats.itemsCost,
          icon: <TrendingUpIcon />,
          isCurrency: true,
          comparison: toComparison(stats.costChange),
        },
        {
          id: "itemsValue",
          label: "Valor de los artículos",
          value: stats.itemsValue,
          icon: <TrendingUpIcon />,
          isCurrency: true,
          comparison: toComparison(stats.valueChange),
        },
      ]
    : [];

  const columns = useMemo<Column<DamagedProductListItem>[]>(
    () => [
      {
        id: "productCode",
        label: "Código",
        type: "text",
        size: "md",
        sortable: true,
        format: (value) => (
          <Typography variant="body2" component="span" noWrap>
            {String(value ?? "")}
          </Typography>
        ),
      },
      {
        id: "branch",
        label: "Sucursal",
        size: "xl",
        truncate: true,
        sortable: true,
        format: (value) => {
          if (value && typeof value === "object" && "name" in value) {
            return displayTitleCase(
              (value as DamagedProductListItem["branch"]).name ?? "",
            );
          }
          return "";
        },
      },
      {
        id: "registrationDate",
        label: "Registro",
        type: "date",
        size: "md",
        sortable: true,
      },
      {
        id: "productName",
        label: "Producto",
        width: 300,
        minWidth: 280,
        truncate: true,
        sortable: true,
        format: (value) => displayTitleCase(value),
      },
      {
        id: "damageOriginName",
        label: "Origen",
        size: "lg",
        truncate: true,
        format: (value) => displayTitleCase(value) || "—",
      },
      {
        id: "statusDisplay",
        label: "Estatus",
        size: "lg",
        format: (value) => {
          const key = String(value ?? "");
          const label = DAMAGE_STATUS_CHIP_LABELS[key] ?? key;
          const variant =
            DAMAGE_STATUS_CHIP_VARIANTS[key] ?? ("default" as StatusChipVariant);
          const chip = (
            <StatusChip label={label} variant={variant} size="small" />
          );
          if (key === "external_repair") {
            return <span title="Reparación externa">{chip}</span>;
          }
          return chip;
        },
      },
      {
        id: "referenceLabel",
        label: "Referencia",
        width: 220,
        truncate: true,
        format: (value) => {
          const text = typeof value === "string" ? value.trim() : "";
          return text || "—";
        },
      },
      {
        id: "registeredByUser",
        label: "Registrado por",
        size: "lg",
        truncate: true,
        format: (value) => displayTitleCase(value) || "—",
      },
      {
        id: "damageType",
        label: "Tipo de daño",
        size: "lg",
        truncate: true,
        format: (value) => displayTitleCase(value),
      },
      {
        id: "repairAssigneeLabel",
        label: "Proveedor / Técnico",
        size: "lg",
        truncate: true,
        sortable: true,
        format: (value) => displayTitleCase(value) || "—",
      },
      {
        id: "elapsedSinceRegistration",
        label: "Tiempo transcurrido",
        size: "md",
        sortable: true,
        format: (_value, row) => {
          const compact = formatElapsedCompact(row.registrationDate);
          const detail = formatElapsedDetailEs(row.registrationDate);
          return (
            <Typography variant="body2" component="span" noWrap title={detail}>
              {compact}
            </Typography>
          );
        },
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
        disabled: (row) => row.id == null || isFolioCompleted(row),
        permission: DAMAGED_INVENTORY_UPDATE,
      },
    ],
    [handleEdit],
  );

  return (
    <Stack direction="column" spacing={3}>
      <Title title="Mercancía dañada" />

      <TabFilters
        tabs={[]}
        activeTab=""
        onTabChange={() => {}}
        showSearch
        searchValue={searchInput}
        onSearchChange={handleSearchChange}
        selectFilters={toolbarSelectFilters}
        dateRangeFilter={{
          label: "Registro",
          dateFrom,
          dateTo,
          onChange: (range) => {
            setDateFrom(range.startDate);
            setDateTo(range.endDate);
          },
        }}
        actions={[
          {
            label: "Registrar daño",
            onClick: handleCreate,
            variant: "contained",
            color: "primary",
            permission: DAMAGED_INVENTORY_CREATE,
          },
        ]}
      />

      {stats ? (
        <StatsCardGroup cards={statsCards} />
      ) : (
        <Grid container spacing={2}>
          {[1, 2, 3].map((i) => (
            <Grid
              key={i}
              size={{
                xs: 12,
                sm: 6,
                md: "grow",
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
        sortField={sortField ?? undefined}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        emptyMessage="No hay mercancía dañada Foly registrada"
      />

      <AddDamagedGoodsModal
        open={addModalOpen || prefill != null}
        onClose={() => {
          setAddModalOpen(false);
          setEditingId(null);
          if (prefill != null) {
            void router.replace(router.pathname, undefined, { shallow: true });
          }
        }}
        onSuccess={handleAddSuccess}
        damagedProductId={editingId}
        prefill={prefill}
      />
    </Stack>
  );
}
