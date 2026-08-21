import { useCallback, useEffect, useMemo, useState } from "react";
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
  ConfirmModal,
} from "@/components";
import { Grid, Skeleton, Stack } from "@mui/material";
import type {
  Column,
  RowAction,
  StatusChipVariant,
} from "@/components/TableCrud";
import type { StatsCardData } from "@/components/StatsCard";
import type { TabOption } from "@/components/TabFilters";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { useDebouncedInput } from "@/hooks/useDebouncedValue";
import {
  getDamagedProducts,
  getDamagedProductStats,
  updateDamagedProductStatus,
  type DamagedProductListItem,
  type DamagedProductStats,
  type DamagedProductTransitionStatus,
} from "@/services/damaged-products.service";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import {
  DAMAGED_INVENTORY_CREATE,
  DAMAGED_INVENTORY_UPDATE,
} from "@/lib/permissions";
const SEARCH_DEBOUNCE_MS = 300;
/** Only supplier returns are closed from this screen: the folio ends when the supplier collects. */
const RETURN_TO_SUPPLIER_CODE = "RETURN_TO_SUPPLIER";
const DAMAGE_STATUS_CHIP_LABELS: Record<string, string> = {
  pending: "Por realizar",
  completed: "Finalizada",
  cancelled: "Cancelada",
  PENDING: "Por realizar",
  COMPLETED: "Finalizada",
  CANCELLED: "Cancelada",
};
const DAMAGE_STATUS_CHIP_VARIANTS: Record<string, StatusChipVariant> = {
  pending: "pending",
  completed: "success",
  cancelled: "error",
  PENDING: "pending",
  COMPLETED: "success",
  CANCELLED: "error",
};
function isFolioCompleted(row: DamagedProductListItem): boolean {
  return row.status.toLowerCase() === "completed";
}
export default function MercanciaDanada() {
  const showSuccess = useSnackbarStore((s) => s.showSuccess);
  const showError = useSnackbarStore((s) => s.showError);
  const [stats, setStats] = useState<DamagedProductStats | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmState, setConfirmState] = useState<
    | { open: false }
    | {
        open: true;
        item: DamagedProductListItem;
        target: DamagedProductTransitionStatus;
      }
  >({ open: false });
  const [confirmLoading, setConfirmLoading] = useState(false);
  const listExtraParams = useMemo(() => {
    if (activeTab === "all") {
      return {};
    }
    return {
      status: activeTab,
    };
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
      {
        label: "Todos",
        value: "all",
      },
      {
        label: "Por realizar",
        value: "pending",
      },
      {
        label: "Finalizadas",
        value: "completed",
      },
      {
        label: "Canceladas",
        value: "cancelled",
      },
    ],
    [],
  );
  const loadStats = useCallback(async () => {
    try {
      const result = await getDamagedProductStats();
      if (result.data != null) {
        setStats(result.data);
      }
    } catch (err) {
      console.error("[MercanciaDanada] Error loading stats:", err);
    }
  }, []);

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
    setActiveTab(value);
  }, []);
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
  const openStatusConfirm = useCallback((item: DamagedProductListItem) => {
    setConfirmState({
      open: true,
      item,
      target: isFolioCompleted(item) ? "pending" : "completed",
    });
  }, []);
  const closeStatusConfirm = useCallback(() => {
    if (confirmLoading) {
      return;
    }
    setConfirmState({ open: false });
  }, [confirmLoading]);
  const handleConfirmStatusChange = useCallback(async () => {
    if (!confirmState.open) {
      return;
    }
    const { item, target } = confirmState;
    setConfirmLoading(true);
    const result = await updateDamagedProductStatus(item.id, target);
    setConfirmLoading(false);
    if (result.error) {
      showError(result.error.message);
      return;
    }
    setConfirmState({ open: false });
    showSuccess(
      target === "completed"
        ? "Folio marcado como recolectado"
        : "Folio reabierto correctamente",
    );
    void refetch();
  }, [confirmState, showError, showSuccess, refetch]);
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
        disabled: (row) => row.id == null || isFolioCompleted(row),
        permission: DAMAGED_INVENTORY_UPDATE,
      },
      {
        id: "toggle-collected",
        label: (row) =>
          isFolioCompleted(row) ? "Reabrir folio" : "Marcar como recolectado",
        icon: <LocalShippingIcon fontSize="small" />,
        onClick: openStatusConfirm,
        hidden: (row) => row.dispositionCode !== RETURN_TO_SUPPLIER_CODE,
        permission: DAMAGED_INVENTORY_UPDATE,
      },
    ],
    [handleEdit, openStatusConfirm],
  );
  return (
    <Stack direction="column" spacing={3}>
      <Title title="Mercancía dañada" />

      <TabFilters
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        showSearch
        searchValue={searchInput}
        onSearchChange={handleSearchChange}
        actions={[
          {
            label: "Ingresar",
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
        emptyMessage="No hay mercancía dañada registrada"
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

      <ConfirmModal
        open={confirmState.open}
        onClose={closeStatusConfirm}
        onConfirm={handleConfirmStatusChange}
        title={
          confirmState.open && confirmState.target === "pending"
            ? "Reabrir folio"
            : "Marcar como recolectado"
        }
        description={
          confirmState.open ? (
            confirmState.target === "completed" ? (
              <>
                ¿Confirmas que el proveedor recolectó{" "}
                <strong>{confirmState.item.productName}</strong> (
                {confirmState.item.productCode})? El folio pasará a
                &quot;Finalizadas&quot;.
              </>
            ) : (
              <>
                ¿Reabrir el folio de{" "}
                <strong>{confirmState.item.productName}</strong> (
                {confirmState.item.productCode})? Volverá a &quot;Por
                realizar&quot;.
              </>
            )
          ) : null
        }
        confirmLabel={
          confirmState.open && confirmState.target === "pending"
            ? "Reabrir"
            : "Marcar como recolectado"
        }
        confirmColor={
          confirmState.open && confirmState.target === "pending"
            ? "primary"
            : "success"
        }
        loading={confirmLoading}
      />
    </Stack>
  );
}
