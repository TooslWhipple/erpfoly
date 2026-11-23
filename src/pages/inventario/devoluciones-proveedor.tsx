import { useCallback, useEffect, useMemo, useState } from "react";
import {
  TrendingUp as TrendingUpIcon,
  Edit as EditIcon,
  LocalShipping as LocalShippingIcon,
} from "@mui/icons-material";
import {
  Title,
  TableCrud,
  StatsCard,
  TabFilters,
  AddDamagedGoodsModal,
  PhysicalExitDamagedGoodsModal,
} from "@/components";
import type { PhysicalExitDamagedGoodsFormValues } from "@/components";
import { Grid, Skeleton, Stack, Typography } from "@mui/material";
import type { Column, RowAction } from "@/components/TableCrud";
import type { TabOption } from "@/components/TabFilters";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { useDebouncedInput } from "@/hooks/useDebouncedValue";
import {
  getDamagedProducts,
  getDamagedProductStats,
  physicalExitDamagedProduct,
  type DamagedProductListItem,
  type DamagedProductSortField,
  type DamagedProductSortOrder,
  type DamagedProductStats,
  type DamagedProductStatsParams,
  type DamagedProductSupplierLifecycle,
} from "@/services/damaged-products.service";
import { useSnackbarStore } from "@/store/useSnackbarStore";
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
const SUPPLIER_RETURN_AUDIENCE = "supplier_return" as const;
const TAB_ALL = "all" as const;

type SupplierReturnTab = typeof TAB_ALL | DamagedProductSupplierLifecycle;

const LIFECYCLE_TABS: Array<{
  label: string;
  value: SupplierReturnTab;
}> = [
  { label: "Todos", value: TAB_ALL },
  { label: "SLA en plazo", value: "pending_charge_sla" },
  { label: "SLA vencido", value: "sla_expired_pending_charge" },
  { label: "Pendiente de salida", value: "charged_pending_exit" },
  { label: "Concluidos", value: "history" },
];

const DISCOUNT_STATUS_CHIP_LABELS: Record<string, string> = {
  not_discounted: "Pendiente",
  discounted_pending_pickup: "Descontado",
  collected: "Recolectado",
};
const DISCOUNT_STATUS_CHIP_VARIANTS: Record<
  string,
  "pending" | "info" | "success"
> = {
  not_discounted: "pending",
  discounted_pending_pickup: "info",
  collected: "success",
};

function isFolioCompleted(row: DamagedProductListItem): boolean {
  return row.status.toLowerCase() === "completed";
}

export default function DevolucionesProveedor() {
  const showSuccess = useSnackbarStore((s) => s.showSuccess);
  const showError = useSnackbarStore((s) => s.showError);
  const [stats, setStats] = useState<DamagedProductStats | null>(null);
  const [activeTab, setActiveTab] = useState<SupplierReturnTab>(TAB_ALL);
  const [sortField, setSortField] = useState<DamagedProductSortField | null>(
    null,
  );
  const [sortOrder, setSortOrder] = useState<DamagedProductSortOrder>("desc");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [exitItem, setExitItem] = useState<DamagedProductListItem | null>(null);
  const [exitSaving, setExitSaving] = useState(false);

  const listExtraParams = useMemo(() => {
    const params: {
      audience: typeof SUPPLIER_RETURN_AUDIENCE;
      supplierLifecycle?: DamagedProductSupplierLifecycle;
      sortField?: DamagedProductSortField;
      sortOrder?: DamagedProductSortOrder;
    } = {
      audience: SUPPLIER_RETURN_AUDIENCE,
    };
    if (activeTab !== TAB_ALL) {
      params.supplierLifecycle = activeTab;
    }
    if (sortField) {
      params.sortField = sortField;
      params.sortOrder = sortOrder;
    }
    return params;
  }, [activeTab, sortField, sortOrder]);

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
    queryKey: ["damaged-products", "list", SUPPLIER_RETURN_AUDIENCE],
    queryFn: getDamagedProducts,
    initialPage: 0,
    initialRowsPerPage: 10,
    initialSearch: "",
    extraParams: listExtraParams,
  });

  useEffect(() => {
    setPage(0);
  }, [activeTab, sortField, sortOrder, setPage]);

  const [searchInput, setSearchInput, debouncedSearch] = useDebouncedInput(
    searchValue,
    SEARCH_DEBOUNCE_MS,
  );
  useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);

  const tabs: TabOption[] = useMemo(() => {
    const pendingSla = stats?.pendingChargeSlaCount;
    const slaExpired = stats?.slaExpiredPendingChargeCount;
    const chargedPending = stats?.chargedPendingExitCount;
    const history = stats?.historyCount;
    const allReady =
      pendingSla != null &&
      slaExpired != null &&
      chargedPending != null &&
      history != null;
    const countByTab: Record<SupplierReturnTab, number | undefined> = {
      [TAB_ALL]: allReady
        ? pendingSla + slaExpired + chargedPending + history
        : undefined,
      pending_charge_sla: pendingSla ?? undefined,
      sla_expired_pending_charge: slaExpired ?? undefined,
      charged_pending_exit: chargedPending ?? undefined,
      history: history ?? undefined,
    };
    return LIFECYCLE_TABS.map((tab) => ({
      ...tab,
      count: countByTab[tab.value],
    }));
  }, [stats]);

  const statsQueryParams = useMemo(() => {
    const params: DamagedProductStatsParams = {
      audience: SUPPLIER_RETURN_AUDIENCE,
    };
    const term = searchValue.trim();
    if (term) {
      params.search = term;
    }
    return params;
  }, [searchValue]);

  const loadStats = useCallback(async () => {
    try {
      const result = await getDamagedProductStats(statsQueryParams);
      if (result.data != null) {
        setStats(result.data);
      }
    } catch (err) {
      console.error("[DevolucionesProveedor] Error loading stats:", err);
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

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value as SupplierReturnTab);
  }, []);

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

  const openExitModal = useCallback((item: DamagedProductListItem) => {
    setExitItem(item);
  }, []);

  const closeExitModal = useCallback(() => {
    if (exitSaving) return;
    setExitItem(null);
  }, [exitSaving]);

  const handleSubmitExit = useCallback(
    async (values: PhysicalExitDamagedGoodsFormValues) => {
      if (!exitItem) return false;
      setExitSaving(true);
      const result = await physicalExitDamagedProduct(exitItem.id, values);
      setExitSaving(false);
      if (result.error) {
        showError(result.error.message);
        return false;
      }
      setExitItem(null);
      showSuccess(
        result.data?.discountApplied
          ? "Salida física registrada y cargo aplicado al proveedor"
          : "Salida física registrada",
      );
      void refetch();
      void loadStats();
      return true;
    },
    [exitItem, showError, showSuccess, refetch, loadStats],
  );

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
        id: "returnSupplierName",
        label: "Proveedor destino",
        size: "lg",
        truncate: true,
        format: (value, row) => {
          const text =
            (typeof value === "string" && value.trim()) ||
            row.repairAssigneeLabel?.trim() ||
            "";
          return displayTitleCase(text) || "—";
        },
      },
      {
        id: "damageType",
        label: "Tipo de daño",
        size: "lg",
        truncate: true,
        format: (value) => displayTitleCase(value),
      },
      {
        id: "discountStatus",
        label: "Descuento a proveedor",
        size: "lg",
        type: "chip",
        chipLabelMap: DISCOUNT_STATUS_CHIP_LABELS,
        chipVariantMap: DISCOUNT_STATUS_CHIP_VARIANTS,
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
        id: "slaDueDate",
        label: "Vence SLA",
        size: "md",
        sortable: true,
        format: (_value, row) => {
          if (!row.slaDueDate) return "—";
          return (
            <Typography
              variant="body2"
              component="span"
              noWrap
              color={row.isSlaActive ? "text.primary" : "error.main"}
            >
              {row.slaDueDate}
              {!row.isSlaActive ? " (vencido)" : ""}
            </Typography>
          );
        },
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
      {
        id: "physical-exit",
        label: "Dar salida física",
        icon: <LocalShippingIcon fontSize="small" />,
        onClick: openExitModal,
        hidden: (row) =>
          isFolioCompleted(row) ||
          activeTab === "history" ||
          row.discountStatus === "collected",
        permission: DAMAGED_INVENTORY_UPDATE,
      },
    ],
    [handleEdit, openExitModal, activeTab],
  );

  return (
    <Stack direction="column" spacing={3}>
      <Title title="Devoluciones a proveedor" />

      <TabFilters
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        showSearch
        searchValue={searchInput}
        onSearchChange={handleSearchChange}
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
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <StatsCard
              label="Costo en riesgo"
              value={stats.intakeCostAtRisk ?? stats.itemsCost ?? 0}
              isCurrency
              icon={<TrendingUpIcon />}
            />
          </Grid>
        </Grid>
      ) : (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
        emptyMessage={
          activeTab === "sla_expired_pending_charge"
            ? "No hay devoluciones con SLA vencido sin cobro"
            : "No hay devoluciones en esta vista"
        }
      />

      <AddDamagedGoodsModal
        open={addModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          setEditingId(null);
        }}
        onSuccess={handleAddSuccess}
        damagedProductId={editingId}
      />

      <PhysicalExitDamagedGoodsModal
        open={exitItem != null}
        onClose={closeExitModal}
        productName={exitItem?.productName ?? ""}
        productCode={exitItem?.productCode ?? ""}
        willChargeSupplier={exitItem?.discountStatus === "not_discounted"}
        saving={exitSaving}
        onSubmit={handleSubmitExit}
      />
    </Stack>
  );
}
