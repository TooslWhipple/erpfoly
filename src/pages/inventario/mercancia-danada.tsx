import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  TrendingUp as TrendingUpIcon,
  Edit as EditIcon,
  LocalShipping as LocalShippingIcon,
} from "@mui/icons-material";
import {
  Title,
  TableCrud,
  StatsCardGroup,
  TabFilters,
  AddDamagedGoodsModal,
  PhysicalExitDamagedGoodsModal,
  StatusChip,
} from "@/components";
import type { PhysicalExitDamagedGoodsFormValues } from "@/components";
import type { AddDamagedGoodsPrefill } from "@/components/AddDamagedGoodsModal";
import { Grid, Skeleton, Stack, Typography } from "@mui/material";
import type {
  Column,
  RowAction,
  StatusChipVariant,
} from "@/components/TableCrud";
import type { StatsCardData } from "@/components/StatsCard";
import type { TabOption } from "@/components/TabFilters";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { useDebouncedInput } from "@/hooks/useDebouncedValue";
import { usePermissions } from "@/hooks/usePermissions";
import {
  getDamagedProducts,
  getDamagedProductStats,
  physicalExitDamagedProduct,
  type DamagedProductAudience,
  type DamagedProductListItem,
  type DamagedProductSortField,
  type DamagedProductSortOrder,
  type DamagedProductStats,
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

const SEARCH_DEBOUNCE_MS = 300;
const PREFILL_BRANCH_PARAM = "branch_id";
const PREFILL_PRODUCT_PARAM = "product_id";

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
  external_repair: "En reparación externa",
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
const DISCOUNT_STATUS_CHIP_LABELS: Record<string, string> = {
  not_discounted: "Pendiente",
  discounted_pending_pickup: "Descontado",
  collected: "Recolectado",
};
const DISCOUNT_STATUS_CHIP_VARIANTS: Record<string, StatusChipVariant> = {
  not_discounted: "pending",
  discounted_pending_pickup: "info",
  collected: "success",
};

function isFolioCompleted(row: DamagedProductListItem): boolean {
  return row.status.toLowerCase() === "completed";
}

export default function MercanciaDanada() {
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const showSuccess = useSnackbarStore((s) => s.showSuccess);
  const showError = useSnackbarStore((s) => s.showError);
  const [stats, setStats] = useState<DamagedProductStats | null>(null);
  const [audience, setAudience] = useState<DamagedProductAudience>("foly");
  const [activeTab, setActiveTab] = useState("all");
  const [supplierLifecycle, setSupplierLifecycle] =
    useState<DamagedProductSupplierLifecycle>("pending_charge_sla");
  const [sortField, setSortField] = useState<DamagedProductSortField | null>(
    null,
  );
  const [sortOrder, setSortOrder] = useState<DamagedProductSortOrder>("desc");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const canCreate = hasPermission(DAMAGED_INVENTORY_CREATE);
  const prefill = useMemo(
    () => (canCreate ? parsePrefill(router.query) : undefined),
    [canCreate, router.query],
  );
  const [exitItem, setExitItem] = useState<DamagedProductListItem | null>(null);
  const [exitSaving, setExitSaving] = useState(false);

  const listExtraParams = useMemo(() => {
    const params: {
      audience: DamagedProductAudience;
      status?: string;
      supplierLifecycle?: DamagedProductSupplierLifecycle;
      sortField?: DamagedProductSortField;
      sortOrder?: DamagedProductSortOrder;
    } = { audience };
    if (audience === "foly") {
      if (activeTab !== "all") {
        params.status = activeTab;
      }
    } else {
      params.supplierLifecycle = supplierLifecycle;
    }
    if (sortField) {
      params.sortField = sortField;
      params.sortOrder = sortOrder;
    }
    return params;
  }, [audience, activeTab, supplierLifecycle, sortField, sortOrder]);

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
    queryKey: ["damaged-products", "list", audience],
    queryFn: getDamagedProducts,
    initialPage: 0,
    initialRowsPerPage: 10,
    initialSearch: "",
    extraParams: listExtraParams,
  });

  useEffect(() => {
    setPage(0);
  }, [audience, activeTab, supplierLifecycle, sortField, sortOrder, setPage]);

  const [searchInput, setSearchInput, debouncedSearch] = useDebouncedInput(
    searchValue,
    SEARCH_DEBOUNCE_MS,
  );
  useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);

  const masterTabs: TabOption[] = useMemo(
    () => [
      { label: "Mercancía dañada Foly", value: "foly" },
      { label: "Devoluciones a proveedor", value: "supplier_return" },
    ],
    [],
  );

  const folyTabs: TabOption[] = useMemo(
    () => [
      { label: "Todos", value: "all" },
      { label: "Por realizar", value: "pending" },
      { label: "En reparación", value: "in_repair" },
      { label: "Finalizadas", value: "completed" },
      { label: "Canceladas", value: "cancelled" },
    ],
    [],
  );

  const supplierTabs: TabOption[] = useMemo(
    () => [
      { label: "Pendientes de cobro (SLA activo)", value: "pending_charge_sla" },
      {
        label: "Cobrados — pendientes de salida",
        value: "charged_pending_exit",
      },
      { label: "Concluidos / Histórico", value: "history" },
    ],
    [],
  );

  const loadStats = useCallback(async () => {
    try {
      const result = await getDamagedProductStats(audience);
      if (result.data != null) {
        setStats(result.data);
      }
    } catch (err) {
      console.error("[MercanciaDanada] Error loading stats:", err);
    }
  }, [audience]);

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

  const handleAudienceChange = useCallback((value: string) => {
    setAudience(value as DamagedProductAudience);
    setActiveTab("all");
    setSupplierLifecycle("pending_charge_sla");
    setStats(null);
  }, []);

  const handleTabChange = useCallback(
    (value: string) => {
      if (audience === "foly") {
        setActiveTab(value);
      } else {
        setSupplierLifecycle(value as DamagedProductSupplierLifecycle);
      }
    },
    [audience],
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
    ? audience === "foly"
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
      : [
          {
            id: "totalItems",
            label: "En bodega (pendientes)",
            value: stats.totalItems,
            icon: <TrendingUpIcon />,
          },
          {
            id: "pendingSla",
            label: "Pendientes de cobro (SLA)",
            value: stats.pendingChargeSlaCount ?? 0,
            icon: <TrendingUpIcon />,
          },
          {
            id: "chargedPending",
            label: "Cobrados sin salida",
            value: stats.chargedPendingExitCount ?? 0,
            icon: <TrendingUpIcon />,
          },
          {
            id: "intakeCost",
            label: "Costo en riesgo",
            value: stats.intakeCostAtRisk ?? stats.itemsCost,
            icon: <TrendingUpIcon />,
            isCurrency: true,
          },
        ]
    : [];

  const columns = useMemo<Column<DamagedProductListItem>[]>(() => {
    const base: Column<DamagedProductListItem>[] = [
      {
        id: "productCode",
        label: "Código",
        type: "text",
        size: "md",
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
            return String(
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
        size: "xl",
        truncate: true,
        sortable: true,
      },
    ];

    if (audience === "foly") {
      base.push(
        {
          id: "sourceLabel",
          label: "Origen",
          width: 300,
          format: (_value, row) => {
            const label =
              row.sourceLabel ??
              (row.isClientProperty && row.serviceOrderFolio
                ? "A Reparación (Cliente)"
                : null);
            if (!label) return "—";
            const variant: StatusChipVariant = row.isClientProperty
              ? "info"
              : "warning";
            return <StatusChip label={label} variant={variant} size="small" />;
          },
        },
        {
          id: "referenceLabel",
          label: "Referencia",
          size: "lg",
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
        },
        {
          id: "damageType",
          label: "Tipo de daño",
          size: "lg",
          truncate: true,
        },
        {
          id: "repairAssigneeLabel",
          label: "Proveedor / Técnico",
          size: "lg",
          truncate: true,
          format: (value) => {
            const text = typeof value === "string" ? value.trim() : "";
            return text || "—";
          },
        },
        {
          id: "statusDisplay",
          label: "Estatus",
          size: "lg",
          type: "chip",
          chipLabelMap: DAMAGE_STATUS_CHIP_LABELS,
          chipVariantMap: DAMAGE_STATUS_CHIP_VARIANTS,
        },
      );
    } else {
      base.push(
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
            return text || "—";
          },
        },
        {
          id: "damageType",
          label: "Tipo de daño",
          size: "lg",
          truncate: true,
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
          id: "slaDueDate",
          label: "Vence SLA",
          size: "md",
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
      );
    }

    base.push({
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
    });

    return base;
  }, [audience]);

  const actions = useMemo<RowAction<DamagedProductListItem>[]>(() => {
    const rowActions: RowAction<DamagedProductListItem>[] = [
      {
        id: "edit",
        label: "Editar",
        icon: <EditIcon fontSize="small" />,
        onClick: handleEdit,
        disabled: (row) => row.id == null || isFolioCompleted(row),
        permission: DAMAGED_INVENTORY_UPDATE,
      },
    ];

    if (audience === "supplier_return") {
      rowActions.push({
        id: "physical-exit",
        label: "Dar salida física",
        icon: <LocalShippingIcon fontSize="small" />,
        onClick: openExitModal,
        hidden: (row) =>
          isFolioCompleted(row) ||
          supplierLifecycle === "history" ||
          row.discountStatus === "collected",
        permission: DAMAGED_INVENTORY_UPDATE,
      });
    }

    return rowActions;
  }, [audience, handleEdit, openExitModal, supplierLifecycle]);

  return (
    <Stack direction="column" spacing={3}>
      <Title title="Mercancía dañada" />

      <TabFilters
        tabs={masterTabs}
        activeTab={audience}
        onTabChange={handleAudienceChange}
        showSearch={false}
      />

      <TabFilters
        tabs={audience === "foly" ? folyTabs : supplierTabs}
        activeTab={audience === "foly" ? activeTab : supplierLifecycle}
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
        emptyMessage={
          audience === "foly"
            ? "No hay mercancía dañada Foly registrada"
            : "No hay devoluciones a proveedor en este filtro"
        }
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
