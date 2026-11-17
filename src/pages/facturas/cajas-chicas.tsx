import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  ArrowLeft,
  Building2,
  Receipt,
  Wallet,
} from "lucide-react";
import {
  Button,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import numeral from "numeral";
import { TableCrud, TabFilters, Title } from "@/components";
import type { SelectFilterOption, TabOption } from "@/components/TabFilters";
import type { Column, StatusChipVariant } from "@/components/TableCrud";
import { PettyCashWithdrawalModal } from "@/components/PettyCash";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { useDebouncedInput } from "@/hooks/useDebouncedValue";
import { useAuthStore } from "@/store/useAuthStore";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { PETTY_CASH_CREATE } from "@/lib/permissions";
import {
  getPettyCashMovements,
  getPettyCashOverview,
  getPettyCashRequests,
} from "@/services/petty-cash.service";
import type {
  ExpenseRequestListItem,
  ExpenseRequestStatus,
} from "@/types/expense-requests.types";
import { EXPENSE_REQUEST_STATUS_LABELS } from "@/types/expense-requests.types";
import type {
  PettyCashBranchOverview,
  PettyCashMovementItem,
  PettyCashMovementType,
} from "@/types/petty-cash.types";
import { formatDate } from "@/utils/date";
import {
  SummaryCard,
  SummaryCardIcon,
} from "@/styles/inventario/detalle.styles";
import { theme } from "@/styles/theme";

const SEARCH_DEBOUNCE_MS = 300;

type ViewTab = "requests" | "movements";
type StatusFilter = "all" | ExpenseRequestStatus;

const VIEW_TABS: TabOption[] = [
  { label: "Movimientos de gastos (Retiros)", value: "requests" },
  { label: "Historial de saldo", value: "movements" },
];

const STATUS_FILTER_OPTIONS: SelectFilterOption[] = [
  { label: "Todos los estatus", value: "all" },
  {
    label: EXPENSE_REQUEST_STATUS_LABELS.PENDING_APPROVAL,
    value: "PENDING_APPROVAL",
  },
  { label: EXPENSE_REQUEST_STATUS_LABELS.APPROVED, value: "APPROVED" },
  {
    label: EXPENSE_REQUEST_STATUS_LABELS.IN_COMPROBATION,
    value: "IN_COMPROBATION",
  },
  {
    label: EXPENSE_REQUEST_STATUS_LABELS.IN_VERIFICATION,
    value: "IN_VERIFICATION",
  },
  {
    label: EXPENSE_REQUEST_STATUS_LABELS.IN_VERIFICATION_FINAL,
    value: "IN_VERIFICATION_FINAL",
  },
  { label: EXPENSE_REQUEST_STATUS_LABELS.COMPLETED, value: "COMPLETED" },
  { label: EXPENSE_REQUEST_STATUS_LABELS.REJECTED, value: "REJECTED" },
  { label: EXPENSE_REQUEST_STATUS_LABELS.CANCELLED, value: "CANCELLED" },
];

const STATUS_CHIP_VARIANTS: Record<ExpenseRequestStatus, StatusChipVariant> = {
  DRAFT: "default",
  PENDING_APPROVAL: "warning",
  APPROVED: "info",
  IN_COMPROBATION: "pending",
  IN_VERIFICATION: "warning",
  IN_VERIFICATION_FINAL: "info",
  COMPLETED: "success",
  REJECTED: "error",
  CANCELLED: "error",
};

const MOVEMENT_TYPE_LABELS: Record<PettyCashMovementType, string> = {
  FUNDING: "Fondeo",
  EXPENSE: "Retiro por gasto",
  REFUND: "Devolución al fondo",
};

const MOVEMENT_TYPE_VARIANTS: Record<PettyCashMovementType, StatusChipVariant> =
  {
    FUNDING: "success",
    EXPENSE: "warning",
    REFUND: "info",
  };

function formatCurrency(value: number): string {
  return numeral(value).format("$0,0.00");
}

export default function CajasChicasPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const showError = useSnackbarStore((s) => s.showError);
  const [selectedReturnRequest, setSelectedReturnRequest] = useState<{
    id: number;
    folio: string;
    amount: number;
  } | null>(null);
  const [returnAllPending, setReturnAllPending] = useState<{
    count: number;
    amount: number;
  } | null>(null);
  const currentUser = useAuthStore((s) => s.user);
  const canCreate = Boolean(
    currentUser?.permissions?.includes(PETTY_CASH_CREATE),
  );

  const [activeTab, setActiveTab] = useState<ViewTab>("requests");
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [branchSearch, setBranchSearch] = useState("");
  const [branchPage, setBranchPage] = useState(0);
  const [branchRowsPerPage, setBranchRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false);

  const {
    data: branchesOverview = [],
    isLoading: loadingOverview,
    isError: overviewError,
    error: overviewErrorObj,
  } = useQuery({
    queryKey: ["petty-cash-overview"],
    queryFn: async () => {
      const res = await getPettyCashOverview();
      if (res.error) throw new Error(res.error.message);
      return res.data ?? [];
    },
  });

  useEffect(() => {
    if (overviewError) {
      showError(
        overviewErrorObj?.message ??
          "No se pudieron cargar los saldos de cajas chicas",
      );
    }
  }, [overviewError, overviewErrorObj, showError]);

  const selectedBranch: PettyCashBranchOverview | null = useMemo(
    () =>
      selectedBranchId != null
        ? branchesOverview.find((b) => b.branchId === selectedBranchId) ?? null
        : null,
    [branchesOverview, selectedBranchId],
  );

  const filteredBranches = useMemo(() => {
    const q = branchSearch.trim().toLowerCase();
    if (!q) return branchesOverview;
    return branchesOverview.filter((b) =>
      b.branchName.toLowerCase().includes(q),
    );
  }, [branchesOverview, branchSearch]);

  const paginatedBranches = useMemo(() => {
    const start = branchPage * branchRowsPerPage;
    return filteredBranches.slice(start, start + branchRowsPerPage);
  }, [filteredBranches, branchPage, branchRowsPerPage]);

  const globalTotals = useMemo(
    () =>
      branchesOverview.reduce(
        (acc, b) => ({
          balance: acc.balance + b.balance,
          pendingAmount: acc.pendingAmount + (b.pendingVerificationAmount ?? 0),
          pendingCount: acc.pendingCount + b.pendingRequestsCount,
          openCash: acc.openCash + b.totalOpenCash,
        }),
        { balance: 0, pendingAmount: 0, pendingCount: 0, openCash: 0 },
      ),
    [branchesOverview],
  );

  const requestExtraParams = useMemo(
    () => ({
      ...(selectedBranch ? { branchId: String(selectedBranch.branchId) } : {}),
      ...(statusFilter === "all" ? {} : { status: statusFilter }),
    }),
    [selectedBranch, statusFilter],
  );

  const {
    data: requests,
    total: totalRequests,
    page: reqPage,
    rowsPerPage: reqRowsPerPage,
    search: reqSearch,
    setPage: setReqPage,
    setRowsPerPage: setReqRowsPerPage,
    setSearch: setReqSearch,
    isLoading: loadingRequests,
    refetch: refetchRequests,
  } = usePaginatedList<ExpenseRequestListItem>({
    queryKey: [
      "petty-cash-requests",
      String(selectedBranch?.branchId ?? 0),
      statusFilter,
    ],
    queryFn: getPettyCashRequests,
    initialPage: 0,
    initialRowsPerPage: 10,
    initialSearch: "",
    extraParams: requestExtraParams,
    enabled: Boolean(selectedBranch),
  });

  const [searchInput, setSearchInput, debouncedSearch] = useDebouncedInput(
    reqSearch,
    SEARCH_DEBOUNCE_MS,
  );

  useEffect(() => {
    setReqSearch(debouncedSearch);
  }, [debouncedSearch, setReqSearch]);

  const {
    data: movements,
    total: totalMovements,
    page: movPage,
    rowsPerPage: movRowsPerPage,
    setPage: setMovPage,
    setRowsPerPage: setMovRowsPerPage,
    isLoading: loadingMovements,
    refetch: refetchMovements,
  } = usePaginatedList<PettyCashMovementItem>({
    queryKey: ["petty-cash-movements", String(selectedBranch?.branchId ?? 0)],
    queryFn: (params) =>
      getPettyCashMovements(selectedBranch?.branchId ?? 0, params),
    initialPage: 0,
    initialRowsPerPage: 10,
    initialSearch: "",
    enabled: Boolean(selectedBranch) && activeTab === "movements",
  });

  const handleRefreshAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["petty-cash-overview"] }),
      refetchRequests(),
      refetchMovements(),
    ]);
  };

  const handleSelectBranch = (branch: PettyCashBranchOverview) => {
    setSelectedBranchId(branch.branchId);
    setActiveTab("requests");
    setStatusFilter("all");
    setReqPage(0);
    setMovPage(0);
  };

  const branchColumns: Column<PettyCashBranchOverview>[] = [
    {
      id: "branchName",
      label: "Sucursal",
      size: "lg",
      format: (value) => String(value ?? "—"),
    },
    {
      id: "balance",
      label: "Saldo actual",
      size: "md",
      type: "currency",
    },
    {
      id: "maxBalance",
      label: "Límite de saldo",
      size: "md",
      align: "right",
      format: (_, row) =>
        row.maxBalance != null ? formatCurrency(row.maxBalance) : "Sin límite",
    },
    {
      id: "pendingVerificationAmount",
      label: "Pendiente por comprobar",
      size: "md",
      align: "right",
      format: (_, row) =>
        `${formatCurrency(row.pendingVerificationAmount ?? 0)} (${row.pendingRequestsCount})`,
    },
    {
      id: "pendingReturnAmount",
      label: "Pendiente por devolver",
      size: "md",
      align: "right",
      format: (_, row) =>
        `${formatCurrency(row.pendingReturnAmount ?? 0)} (${row.pendingReturnCount ?? 0})`,
    },
  ];

  const handleOpenReturnModal = (
    e: React.MouseEvent,
    row: ExpenseRequestListItem,
  ) => {
    e.stopPropagation();
    if (!row.pettyCashReturnAmount || row.pettyCashReturnAmount <= 0) return;
    setSelectedReturnRequest({
      id: row.id,
      folio: row.folio,
      amount: row.pettyCashReturnAmount,
    });
    setWithdrawalModalOpen(true);
  };

  const requestColumns: Column<ExpenseRequestListItem>[] = [
    {
      id: "folio",
      label: "Folio",
      size: "sm",
    },
    {
      id: "applicant",
      label: "Solicitante",
      size: "md",
      truncate: true,
      format: (_, row) =>
        row.applicant?.fullName || row.applicant?.username || "—",
    },
    {
      id: "category",
      label: "Categoría",
      size: "md",
      truncate: true,
      format: (_, row) => row.category?.name ?? "—",
    },
    {
      id: "requestedAmount",
      label: "Retirado",
      size: "md",
      type: "currency",
    },
    {
      id: "verifiedAmount",
      label: "Comprobado",
      size: "md",
      type: "currency",
    },
    {
      id: "pettyCashReturnAmount",
      label: "Diferencia a devolver",
      size: "md",
      align: "right",
      format: (_, row) => {
        if (!row.pettyCashReturnAmount || row.pettyCashReturnAmount <= 0) {
          return "—";
        }
        if (row.pettyCashReturnStatus === "RETURNED") {
          return `${formatCurrency(row.pettyCashReturnAmount)} (Devuelta)`;
        }
        return (
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="flex-end"
          >
            <Typography variant="body2" fontWeight={600} color="warning.dark">
              {formatCurrency(row.pettyCashReturnAmount)}
            </Typography>
            <Button
              size="small"
              variant="outlined"
              color="success"
              onClick={(e) => handleOpenReturnModal(e, row)}
            >
              Devolver al fondo
            </Button>
          </Stack>
        );
      },
    },
    {
      id: "status",
      label: "Estatus",
      size: "sm",
      type: "chip",
      chipLabelMap: EXPENSE_REQUEST_STATUS_LABELS,
      chipVariantMap: STATUS_CHIP_VARIANTS,
    },
  ];

  const movementColumns: Column<PettyCashMovementItem>[] = [
    {
      id: "createdAt",
      label: "Fecha",
      size: "md",
      format: (value) => formatDate(String(value ?? ""), "DD/MM/YYYY"),
    },
    {
      id: "type",
      label: "Tipo",
      size: "sm",
      type: "chip",
      chipLabelMap: MOVEMENT_TYPE_LABELS,
      chipVariantMap: MOVEMENT_TYPE_VARIANTS,
    },
    {
      id: "amount",
      label: "Monto",
      size: "md",
      align: "right",
      format: (_, row) =>
        `${row.type === "EXPENSE" ? "-" : "+"}${formatCurrency(row.amount)}`,
    },
    {
      id: "balanceAfter",
      label: "Saldo resultante",
      size: "md",
      type: "currency",
    },
    {
      id: "bank",
      label: "Banco / Cheque",
      size: "md",
      format: (_, row) =>
        row.bank
          ? `${row.bank}${row.checkNumber ? ` · #${row.checkNumber}` : ""}`
          : row.expenseRequestFolio ?? "—",
    },
    {
      id: "cashRegisterName",
      label: "Caja / Referencia",
      size: "lg",
      truncate: true,
      format: (_, row) => row.cashRegisterName ?? row.notes ?? "—",
    },
    {
      id: "createdBy",
      label: "Usuario",
      size: "md",
      format: (value) => String(value || "—"),
    },
  ];

  if (!selectedBranch) {
    return (
      <Stack direction="column" spacing={3}>
        <Title title="Cajas chicas" />

        <Grid container spacing={2} alignItems="stretch">
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <SummaryCard>
              <Typography variant="h6">Saldo total cajas chicas</Typography>
              <Typography variant="h2">
                {formatCurrency(globalTotals.balance)}
              </Typography>
              <SummaryCardIcon>
                <Wallet size={18} color={theme.palette.primary.main} />
              </SummaryCardIcon>
            </SummaryCard>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <SummaryCard>
              <Typography variant="h6">Pendiente por comprobar</Typography>
              <Typography variant="h2">
                {formatCurrency(globalTotals.pendingAmount)}
              </Typography>
              <SummaryCardIcon>
                <Receipt size={18} color={theme.palette.warning.main} />
              </SummaryCardIcon>
            </SummaryCard>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <SummaryCard>
              <Typography variant="h6">Sucursales activas</Typography>
              <Typography variant="h2">{branchesOverview.length}</Typography>
              <SummaryCardIcon>
                <Building2 size={18} color={theme.palette.info.main} />
              </SummaryCardIcon>
            </SummaryCard>
          </Grid>
        </Grid>

        <TabFilters
          tabs={[{ label: "Sucursales", value: "branches", count: filteredBranches.length }]}
          activeTab="branches"
          onTabChange={() => {}}
          showSearch
          searchValue={branchSearch}
          onSearchChange={(v) => {
            setBranchSearch(v);
            setBranchPage(0);
          }}
          searchPlaceholder="Buscar sucursal..."
        />

        <TableCrud<PettyCashBranchOverview>
          columns={branchColumns}
          rows={paginatedBranches}
          rowKey="branchId"
          totalRows={filteredBranches.length}
          page={branchPage}
          rowsPerPage={branchRowsPerPage}
          onPageChange={setBranchPage}
          onRowsPerPageChange={setBranchRowsPerPage}
          loading={loadingOverview}
          onRowClick={handleSelectBranch}
          emptyMessage="No hay sucursales activas"
        />
      </Stack>
    );
  }

  return (
    <Stack direction="column" spacing={3}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={2}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Button
            variant="outlined"
            size="small"
            startIcon={<ArrowLeft size={16} />}
            onClick={() => setSelectedBranchId(null)}
          >
            Sucursales
          </Button>
          <Title title={`Caja chica · ${selectedBranch.branchName}`} />
        </Stack>

        {selectedBranch.pendingReturnAmount > 0 && (
          <Button
            variant="contained"
            color="success"
            onClick={() => {
              setSelectedReturnRequest(null);
              setReturnAllPending({
                count: selectedBranch.pendingReturnCount,
                amount: selectedBranch.pendingReturnAmount,
              });
              setWithdrawalModalOpen(true);
            }}
          >
            Devolver todo al fondo ({formatCurrency(selectedBranch.pendingReturnAmount)})
          </Button>
        )}
      </Stack>

      <Grid container spacing={2} alignItems="stretch">
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <SummaryCard>
            <Typography variant="h6">Saldo actual</Typography>
            <Typography variant="h2">
              {formatCurrency(selectedBranch.balance)}
            </Typography>
            <SummaryCardIcon>
              <Wallet size={18} color={theme.palette.primary.main} />
            </SummaryCardIcon>
          </SummaryCard>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <SummaryCard>
            <Typography variant="h6">
              Pendiente por comprobar ({selectedBranch.pendingRequestsCount})
            </Typography>
            <Typography variant="h2">
              {formatCurrency(selectedBranch.pendingVerificationAmount ?? 0)}
            </Typography>
            <SummaryCardIcon>
              <Receipt size={18} color={theme.palette.warning.main} />
            </SummaryCardIcon>
          </SummaryCard>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <SummaryCard>
            <Typography variant="h6">Límite de saldo</Typography>
            <Typography variant="h2">
              {selectedBranch.maxBalance != null
                ? formatCurrency(selectedBranch.maxBalance)
                : "Sin límite"}
            </Typography>
            <SummaryCardIcon>
              <Building2 size={18} color={theme.palette.info.main} />
            </SummaryCardIcon>
          </SummaryCard>
        </Grid>
      </Grid>

      <TabFilters
        tabs={VIEW_TABS}
        activeTab={activeTab}
        onTabChange={(v) => setActiveTab(v as ViewTab)}
        showSearch={activeTab === "requests"}
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        searchPlaceholder="Buscar por folio o descripción..."
        selectFilters={
          activeTab === "requests"
            ? [
                {
                  options: STATUS_FILTER_OPTIONS,
                  value: statusFilter,
                  onChange: (v) => {
                    setStatusFilter(v as StatusFilter);
                    setReqPage(0);
                  },
                  minWidth: 190,
                },
              ]
            : undefined
        }
      />

      {activeTab === "requests" ? (
        <TableCrud<ExpenseRequestListItem>
          columns={requestColumns}
          rows={requests}
          rowKey="id"
          totalRows={totalRequests}
          page={reqPage}
          rowsPerPage={reqRowsPerPage}
          onPageChange={setReqPage}
          onRowsPerPageChange={setReqRowsPerPage}
          loading={loadingRequests}
          onRowClick={(row) =>
            void router.push(`/facturas/solicitudes-gastos/${row.id}`)
          }
          emptyMessage="No hay movimientos de gastos desde caja chica para esta sucursal"
        />
      ) : (
        <TableCrud<PettyCashMovementItem>
          columns={movementColumns}
          rows={movements}
          rowKey="id"
          totalRows={totalMovements}
          page={movPage}
          rowsPerPage={movRowsPerPage}
          onPageChange={setMovPage}
          onRowsPerPageChange={setMovRowsPerPage}
          loading={loadingMovements}
          emptyMessage="No hay movimientos registrados en esta caja chica"
        />
      )}

      <PettyCashWithdrawalModal
        open={withdrawalModalOpen}
        onClose={() => {
          setWithdrawalModalOpen(false);
          setSelectedReturnRequest(null);
          setReturnAllPending(null);
        }}
        onSuccess={handleRefreshAll}
        branchId={selectedBranch.branchId}
        branchName={selectedBranch.branchName}
        currentPettyCashBalance={selectedBranch.balance}
        returnRequest={selectedReturnRequest}
        returnAll={returnAllPending}
      />
    </Stack>
  );
}
