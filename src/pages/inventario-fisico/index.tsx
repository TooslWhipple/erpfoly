import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/router";
import { Chip, Stack, Typography } from "@mui/material";
import { Visibility as VisibilityIcon } from "@mui/icons-material";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Title, TabFilters, TableCrud } from "@/components";
import type { Column, RowAction } from "@/components/TableCrud";
import type { SelectFilterOption, TabOption } from "@/components/TabFilters";
import {
  PhysicalInventoryBranchModal,
  PhysicalInventoryUnifyModal,
} from "@/components/PhysicalInventory";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { useAuthStore } from "@/store/useAuthStore";
import { getPhysicalInventories } from "@/services/physical-inventory.service";
import { getBranchesCatalog } from "@/services/branches.service";
import type {
  HasVarianceFilter,
  PhysicalInventoryListItem,
  PhysicalInventoryRecordType,
  PhysicalInventoryStatus,
} from "@/types/physical-inventory.types";
import { formatDate } from "@/utils/date";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import {
  PHYSICAL_INVENTORY_CREATE,
  PHYSICAL_INVENTORY_READ,
} from "@/lib/permissions";
import { isHighPrivilegeRoleCode } from "@/constants/role-codes";
import { theme } from "@/styles/theme";

type VarianceTab = "all" | "faltantes" | "sobrantes";

const VARIANCE_TABS: TabOption[] = [
  { label: "Todos", value: "all" },
  { label: "Faltantes", value: "faltantes" },
  { label: "Sobrantes", value: "sobrantes" },
];

function formatVarianceValue(value: unknown): ReactNode {
  const amount = typeof value === "number" ? value : Number(value ?? 0);
  const isAlert = amount > 0;
  return (
    <Typography
      component="span"
      variant="body2"
      sx={{
        color: isAlert ? theme.palette.error.main : theme.palette.text.primary,
        fontWeight: isAlert ? 600 : 400,
      }}
    >
      {Number.isFinite(amount) ? amount : 0}
    </Typography>
  );
}

function statusLabel(
  status: PhysicalInventoryStatus | undefined,
  recordType: PhysicalInventoryRecordType | undefined,
): string {
  if (recordType === "unified_master") return "Inventario unificado";
  if (status === "unified") return "Concluido unificado";
  if (status === "in_progress") return "En proceso";
  return "Completado";
}

function statusColor(
  status: PhysicalInventoryStatus | undefined,
  recordType: PhysicalInventoryRecordType | undefined,
): "default" | "info" | "success" | "warning" {
  if (recordType === "unified_master") return "success";
  if (status === "unified") return "warning";
  if (status === "in_progress") return "info";
  return "default";
}

export default function PhysicalInventoryListPage() {
  const router = useRouter();
  const showError = useSnackbarStore((state) => state.showError);
  const user = useAuthStore((state) => state.user);
  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [unifyModalOpen, setUnifyModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<VarianceTab>("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const canUnify = isHighPrivilegeRoleCode(user?.role);

  const { data: branches = [] } = useQuery({
    queryKey: ["branches-catalog", "physical-inventory-filter"],
    queryFn: () => getBranchesCatalog(),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });

  const branchOptions: SelectFilterOption[] = useMemo(
    () => [
      { label: "Todas las sucursales", value: "all" },
      ...branches.map((branch) => ({
        label: branch.name,
        value: String(branch.id),
      })),
    ],
    [branches],
  );

  const branchId =
    branchFilter !== "all" ? Number(branchFilter) : undefined;

  const hasMissing: HasVarianceFilter =
    activeTab === "faltantes" ? "with" : "all";
  const hasSurplus: HasVarianceFilter =
    activeTab === "sobrantes" ? "with" : "all";

  const {
    data: rows,
    total: totalRows,
    page,
    rowsPerPage,
    setPage,
    setRowsPerPage,
    isLoading: loading,
    isError,
    error,
    refetch,
  } = usePaginatedList<PhysicalInventoryListItem>({
    queryKey: [
      "physical-inventories",
      activeTab,
      branchFilter,
      dateFrom,
      dateTo,
    ],
    queryFn: (params) =>
      getPhysicalInventories({
        ...params,
        branchId,
        hasMissing,
        hasSurplus,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      }),
    initialPage: 0,
    initialRowsPerPage: 10,
    extraParams: {
      branchId,
      hasMissing,
      hasSurplus,
      dateFrom,
      dateTo,
    },
  });

  useEffect(() => {
    if (isError) {
      showError(
        error?.message ?? "No se pudieron cargar los inventarios físicos",
      );
    }
  }, [error?.message, isError, showError]);

  const tabs = VARIANCE_TABS.map((tab) => ({
    ...tab,
    count: tab.value === activeTab ? totalRows : undefined,
  }));

  const columns: Column<PhysicalInventoryListItem>[] = [
    {
      id: "id",
      label: "ID",
      type: "id",
      size: "sm",
    },
    {
      id: "date",
      label: "Fecha",
      size: "lg",
      format: (value) => formatDate(String(value ?? ""), "datetimeShort12h"),
    },
    {
      id: "branch",
      label: "Sucursal",
      size: "md",
      format: (_value, row) => row.branch?.name ?? "—",
    },
    {
      id: "zoneName",
      label: "Zona/Nombre",
      size: "md",
      format: (value, row) =>
        row.recordType === "unified_master"
          ? "Inventario maestro"
          : String(value ?? "—"),
    },
    {
      id: "responsibleUser",
      label: "Responsable",
      size: "md",
      format: (value) => String(value ?? "—"),
    },
    {
      id: "status",
      label: "Estatus",
      size: "md",
      format: (_value, row) => (
        <Chip
          size="small"
          label={statusLabel(row.status, row.recordType)}
          color={statusColor(row.status, row.recordType)}
          variant="outlined"
        />
      ),
    },
    {
      id: "totalProducts",
      label: "Total de productos",
      type: "number",
      size: "md",
    },
    {
      id: "totalItems",
      label: "Total de artículos",
      type: "number",
      size: "md",
    },
    {
      id: "missingUnits",
      label: "Faltantes",
      size: "sm",
      format: (value) => formatVarianceValue(value),
    },
    {
      id: "surplusUnits",
      label: "Sobrantes",
      size: "sm",
      format: (value) => formatVarianceValue(value),
    },
  ];

  const actions: RowAction<PhysicalInventoryListItem>[] = [
    {
      id: "view",
      label: "Ver detalle",
      icon: <VisibilityIcon fontSize="small" />,
      permission: PHYSICAL_INVENTORY_READ,
      onClick: (row) => {
        void router.push(`/inventario-fisico/${row.id}`);
      },
    },
  ];

  const filterActions = [
    ...(canUnify
      ? [
          {
            label: "Unificar inventarios",
            onClick: () => setUnifyModalOpen(true),
            variant: "outlined" as const,
            color: "primary" as const,
            showIcon: false,
            permission: PHYSICAL_INVENTORY_CREATE,
          },
        ]
      : []),
    {
      label: "Nuevo",
      onClick: () => setBranchModalOpen(true),
      variant: "contained" as const,
      color: "primary" as const,
      showIcon: true,
      permission: PHYSICAL_INVENTORY_CREATE,
    },
  ];

  return (
    <Stack spacing={3}>
      <Title title="Inventarios" />

      <TabFilters
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(value) => {
          setActiveTab(value as VarianceTab);
          setPage(0);
        }}
        selectFilters={[
          {
            label: "Sucursal",
            value: branchFilter,
            options: branchOptions,
            onChange: (value) => {
              setBranchFilter(value);
              setPage(0);
            },
          },
        ]}
        dateRangeFilter={{
          label: "Fecha",
          dateFrom,
          dateTo,
          onChange: (range) => {
            setDateFrom(range.startDate);
            setDateTo(range.endDate);
            setPage(0);
          },
        }}
        actions={filterActions}
      />

      <TableCrud
        columns={columns}
        rows={rows}
        rowKey="id"
        loading={loading}
        totalRows={totalRows}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        actions={actions}
        onRowClick={(row) => {
          void router.push(`/inventario-fisico/${row.id}`);
        }}
      />

      <PhysicalInventoryBranchModal
        open={branchModalOpen}
        onClose={() => setBranchModalOpen(false)}
        onConfirm={({ branch, sessionId }) => {
          setBranchModalOpen(false);
          void router.push({
            pathname: "/inventario-fisico/nuevo",
            query: {
              sucursalId: String(branch.id),
              sessionId: String(sessionId),
            },
          });
        }}
      />

      <PhysicalInventoryUnifyModal
        open={unifyModalOpen}
        onClose={() => setUnifyModalOpen(false)}
        initialBranchId={branchId}
        onUnified={(masterId) => {
          setUnifyModalOpen(false);
          void refetch?.();
          void router.push(`/inventario-fisico/${masterId}`);
        }}
      />
    </Stack>
  );
}
