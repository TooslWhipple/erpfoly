import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { CalendarDays, Receipt, Wallet } from "lucide-react";
import { Grid, Stack, Typography } from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Title,
  TabFilters,
  TableCrud,
} from "@/components";
import type { TabOption, SelectFilterOption } from "@/components/TabFilters";
import type { Column, StatusChipVariant } from "@/components/TableCrud";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { useDebouncedInput } from "@/hooks/useDebouncedValue";
import {
  getExpenseRequests,
  getExpenseRequestsSummary,
} from "@/services/expense-requests.service";
import type {
  ExpenseRequestClassification,
  ExpenseRequestListItem,
  ExpenseRequestStatus,
} from "@/types/expense-requests.types";
import {
  EXPENSE_REQUEST_CLASSIFICATION_LABELS,
  EXPENSE_REQUEST_STATUS_LABELS,
} from "@/types/expense-requests.types";
import { formatDate } from "@/utils/date";
import { EXPENSE_REQUESTS_CREATE } from "@/lib/permissions";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import {
  SummaryCard,
  SummaryCardIcon,
} from "@/styles/inventario/detalle.styles";
import { theme } from "@/styles/theme";
import numeral from "numeral";

const SEARCH_DEBOUNCE_MS = 300;

type FilterTab = "all" | ExpenseRequestClassification;
type StatusFilter = "all" | ExpenseRequestStatus;

const CLASSIFICATION_TABS: TabOption[] = [
  { label: "Todas", value: "all" },
  { label: "Viáticos", value: "VIATICOS" },
  { label: "Solicitud de gastos", value: "SOLICITUD_GASTOS" },
];

const STATUS_FILTER_OPTIONS: SelectFilterOption[] = [
  { label: "Todos los estatus", value: "all" },
  { label: EXPENSE_REQUEST_STATUS_LABELS.PENDING_APPROVAL, value: "PENDING_APPROVAL" },
  { label: EXPENSE_REQUEST_STATUS_LABELS.APPROVED, value: "APPROVED" },
  { label: EXPENSE_REQUEST_STATUS_LABELS.IN_COMPROBATION, value: "IN_COMPROBATION" },
  { label: EXPENSE_REQUEST_STATUS_LABELS.IN_VERIFICATION, value: "IN_VERIFICATION" },
  { label: EXPENSE_REQUEST_STATUS_LABELS.IN_VERIFICATION_FINAL, value: "IN_VERIFICATION_FINAL" },
  { label: EXPENSE_REQUEST_STATUS_LABELS.COMPLETED, value: "COMPLETED" },
  { label: EXPENSE_REQUEST_STATUS_LABELS.REJECTED, value: "REJECTED" },
  { label: EXPENSE_REQUEST_STATUS_LABELS.CANCELLED, value: "CANCELLED" },
  { label: EXPENSE_REQUEST_STATUS_LABELS.DRAFT, value: "DRAFT" },
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

const CLASSIFICATION_CHIP_VARIANTS: Record<
  ExpenseRequestClassification,
  StatusChipVariant
> = {
  VIATICOS: "info",
  SOLICITUD_GASTOS: "default",
  CAJA_CHICA: "success",
};

function formatCurrency(value: number): string {
  return numeral(value).format("$0,0.00");
}

export default function SolicitudesGastosPage() {
  const router = useRouter();
  const showError = useSnackbarStore((state) => state.showError);
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const listExtraParams = useMemo(
    () => ({
      ...(activeTab === "all"
        ? {}
        : { classification: activeTab as ExpenseRequestClassification }),
      ...(statusFilter === "all"
        ? {}
        : { status: statusFilter as ExpenseRequestStatus }),
    }),
    [activeTab, statusFilter],
  );

  const {
    data: requests,
    total: totalRows,
    page,
    rowsPerPage,
    search: searchValue,
    setPage,
    setRowsPerPage,
    setSearch,
    isLoading: loading,
    isError,
    error,
    refetch,
  } = usePaginatedList<ExpenseRequestListItem>({
    queryKey: ["expense-requests", activeTab, statusFilter],
    queryFn: getExpenseRequests,
    initialPage: 0,
    initialRowsPerPage: 10,
    initialSearch: "",
    extraParams: listExtraParams,
  });

  const [searchInput, setSearchInput, debouncedSearch] = useDebouncedInput(
    searchValue,
    SEARCH_DEBOUNCE_MS,
  );

  const {
    data: summary,
    isError: summaryError,
    error: summaryErrorObj,
  } = useQuery({
    queryKey: ["expense-requests-summary", activeTab, statusFilter],
    queryFn: async () => {
      const summaryParams = {
        ...(activeTab === "all"
          ? {}
          : { classification: activeTab as ExpenseRequestClassification }),
        ...(statusFilter === "all"
          ? {}
          : { status: statusFilter as ExpenseRequestStatus }),
      };
      const result = await getExpenseRequestsSummary(
        Object.keys(summaryParams).length > 0 ? summaryParams : undefined,
      );
      if (result.error) throw new Error(result.error.message);
      return (
        result.data ?? {
          totalRequested: 0,
          totalVerified: 0,
          totalPending: 0,
        }
      );
    },
  });

  useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);

  useEffect(() => {
    if (isError) {
      showError(error?.message ?? "No se pudieron cargar las solicitudes de gastos");
    }
  }, [isError, error, showError]);

  useEffect(() => {
    if (summaryError) {
      showError(
        summaryErrorObj?.message ?? "No se pudieron cargar los totales",
      );
    }
  }, [summaryError, summaryErrorObj, showError]);

  const handleTabChange = (value: string) => {
    setActiveTab(value as FilterTab);
    setPage(0);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value as StatusFilter);
    setPage(0);
  };

  const openCreatePage = () => {
    const query =
      activeTab !== "all" ? { classification: activeTab } : undefined;
    void router.push({
      pathname: "/facturas/solicitudes-gastos/nuevo",
      query,
    });
  };

  const openEditPage = (row: ExpenseRequestListItem) => {
    void router.push(`/facturas/solicitudes-gastos/${row.id}`);
  };

  const tabs = CLASSIFICATION_TABS.map((tab) => ({
    ...tab,
    count: tab.value === activeTab ? totalRows : undefined,
  }));

  const columns: Column<ExpenseRequestListItem>[] = [
    {
      id: "folio",
      label: "Folio",
      size: "sm",
    },
    {
      id: "debtor",
      label: "Empleado / Beneficiario",
      size: "lg",
      truncate: true,
      format: (_, row) =>
        row.debtor?.fullName ||
        row.applicant?.fullName ||
        row.applicant?.username ||
        "-",
    },
    {
      id: "classification",
      label: "Clasificación",
      size: "md",
      type: "chip",
      chipLabelMap: EXPENSE_REQUEST_CLASSIFICATION_LABELS,
      chipVariantMap: CLASSIFICATION_CHIP_VARIANTS,
    },
    {
      id: "startDate",
      label: "Vigencia",
      size: "md",
      format: (_, row) => {
        const start = formatDate(row.startDate, "DD/MM/YYYY");
        const end = formatDate(row.endDate, "DD/MM/YYYY");
        return start === end ? start : `${start} - ${end}`;
      },
    },
    {
      id: "requestedAmount",
      label: "Monto",
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
      id: "id",
      label: "Saldo",
      size: "md",
      type: "currency",
      format: (_, row) => {
        const bal = Math.max(0, row.requestedAmount - row.verifiedAmount);
        return formatCurrency(bal);
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

  const kpiCards = [
    {
      title: "Total Solicitado",
      value: summary?.totalRequested ?? 0,
      icon: <CalendarDays size={18} color={theme.palette.text.secondary} />,
    },
    {
      title: "Total Comprobado",
      value: summary?.totalVerified ?? 0,
      icon: <Receipt size={18} color={theme.palette.text.secondary} />,
    },
    {
      title: "Saldo Pendiente",
      value: summary?.totalPending ?? 0,
      icon: <Wallet size={18} color={theme.palette.text.secondary} />,
    },
  ];

  return (
    <Stack direction="column" spacing={3}>
      <Title title="Solicitud de gastos" />

      <Grid container spacing={2} alignItems="stretch">
        {kpiCards.map((card) => (
          <Grid key={card.title} size={{ xs: 12, sm: 6, md: 4 }}>
            <SummaryCard>
              <Typography variant="h6">{card.title}</Typography>
              <Typography variant="h2">{formatCurrency(card.value)}</Typography>
              <SummaryCardIcon>{card.icon}</SummaryCardIcon>
            </SummaryCard>
          </Grid>
        ))}
      </Grid>

      <TabFilters
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        selectFilters={[
          {
            options: STATUS_FILTER_OPTIONS,
            value: statusFilter,
            onChange: handleStatusFilterChange,
            minWidth: 190,
          },
        ]}
        showSearch
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        actions={[
          {
            label: "Nuevo",
            onClick: openCreatePage,
            variant: "contained",
            permission: EXPENSE_REQUESTS_CREATE,
          },
        ]}
      />

      <TableCrud
        columns={columns}
        rows={requests}
        loading={loading}
        rowKey="id"
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={totalRows}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        onRowClick={openEditPage}
        emptyMessage="No hay solicitudes de gastos"
      />
    </Stack>
  );
}
