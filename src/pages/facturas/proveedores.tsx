import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { Grid, Stack, Typography } from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Title,
  TabFilters,
  TableCrud,
  DiscrepanciesAlert,
  DiscrepanciesModal,
  StatementDetailModal,
  SchedulePaymentDrawer,
} from "@/components";
import type { TabOption } from "@/components/TabFilters";
import type { Column, StatusChipVariant } from "@/components/TableCrud";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { useDebouncedInput } from "@/hooks/useDebouncedValue";
import {
  getSupplierPayableDiscrepancies,
  getSupplierPayables,
  getSupplierPayablesSummary,
} from "@/services/supplier-payables.service";
import type {
  SupplierPayableListItem,
  SupplierPayableStatement,
  SupplierPayableStatus,
  SupplierPayableStatusTab,
} from "@/types/supplier-payables.types";
import { formatDate } from "@/utils/date";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import {
  SummaryCard,
  SummaryCardIcon,
} from "@/styles/inventario/detalle.styles";
import { theme } from "@/styles/theme";
import numeral from "numeral";

const SEARCH_DEBOUNCE_MS = 300;

const STATUS_TABS: TabOption[] = [
  { label: "Todas", value: "all" },
  { label: "Pendientes", value: "pending" },
  { label: "Retrasadas", value: "overdue" },
  { label: "Pagadas", value: "paid" },
];

const STATUS_CHIP_LABELS: Record<SupplierPayableStatus, string> = {
  pending: "Pendiente",
  paid: "Pagado",
  overdue: "Retrasado",
};

const STATUS_CHIP_VARIANTS: Record<SupplierPayableStatus, StatusChipVariant> = {
  pending: "default",
  paid: "success",
  overdue: "error",
};

function formatCurrency(value: number): string {
  return numeral(value).format("$0,0.00");
}

export default function SupplierPayablesPage() {
  const showError = useSnackbarStore((state) => state.showError);
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("all");
  const [discrepanciesOpen, setDiscrepanciesOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedStatementId, setSelectedStatementId] = useState<string | null>(
    null,
  );
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleStatement, setScheduleStatement] =
    useState<SupplierPayableStatement | null>(null);

  const statusTabExtra:
    | { statusTab?: SupplierPayableStatusTab }
    | undefined =
    activeTab === "all"
      ? undefined
      : { statusTab: activeTab as SupplierPayableStatusTab };

  const {
    data: rows,
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
  } = usePaginatedList<SupplierPayableListItem>({
    queryKey: ["supplier-payables", activeTab],
    queryFn: getSupplierPayables,
    initialPage: 0,
    initialRowsPerPage: 10,
    initialSearch: "",
    extraParams: statusTabExtra,
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
    queryKey: ["supplier-payables-summary"],
    queryFn: async () => {
      const result = await getSupplierPayablesSummary();
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
  });

  const {
    data: discrepancies = [],
    isLoading: discrepanciesLoading,
    isError: discrepanciesError,
    error: discrepanciesErrorObj,
  } = useQuery({
    queryKey: ["supplier-payables-discrepancies"],
    queryFn: async () => {
      const result = await getSupplierPayableDiscrepancies();
      if (result.error) throw new Error(result.error.message);
      return result.data ?? [];
    },
  });

  useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);

  useEffect(() => {
    if (isError) {
      showError(error?.message ?? "No se pudieron cargar las cuentas por pagar");
    }
  }, [error?.message, isError, showError]);

  useEffect(() => {
    if (summaryError) {
      showError(
        summaryErrorObj?.message ?? "No se pudo cargar el resumen",
      );
    }
  }, [showError, summaryError, summaryErrorObj?.message]);

  useEffect(() => {
    if (discrepanciesError) {
      showError(
        discrepanciesErrorObj?.message ??
          "No se pudieron cargar las discrepancias",
      );
    }
  }, [discrepanciesError, discrepanciesErrorObj?.message, showError]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setPage(0);
  };

  const invalidateQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["supplier-payables"] }),
      queryClient.invalidateQueries({
        queryKey: ["supplier-payables-summary"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["supplier-payables-discrepancies"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["supplier-payable-statement"],
      }),
    ]);
  };

  const openDetail = (row: SupplierPayableListItem) => {
    setSelectedStatementId(row.id);
    setDetailOpen(true);
  };

  const columns: Column<SupplierPayableListItem>[] = [
    {
      id: "periodLabel",
      label: "Estado de cuenta",
      size: "md",
    },
    {
      id: "supplierName",
      label: "Proveedor",
      size: "lg",
    },
    {
      id: "dueDate",
      label: "Fecha de vencimiento",
      size: "md",
      format: (_value, row) => formatDate(row.dueDate, "dateLong"),
    },
    {
      id: "status",
      label: "Estatus",
      size: "sm",
      type: "chip",
      chipLabelMap: STATUS_CHIP_LABELS,
      chipVariantMap: STATUS_CHIP_VARIANTS,
    },
    {
      id: "amount",
      label: "Monto",
      size: "md",
      type: "currency",
    },
    {
      id: "paidAmount",
      label: "Pagos",
      size: "md",
      type: "currency",
    },
    {
      id: "balance",
      label: "Saldo",
      size: "md",
      type: "currency",
    },
  ];

  const kpiCards = [
    {
      title: "Total pendiente",
      value: summary?.totalPending ?? 0,
    },
    {
      title: "Vencido",
      value: summary?.overdue ?? 0,
    },
    {
      title: "Próximas a Vencer",
      value: summary?.dueSoon ?? 0,
    },
  ];

  return (
    <Stack direction="column" spacing={3}>
      <Title title="Proveedores - Cuentas por pagar" />

      <Grid container spacing={2} alignItems="stretch">
        {kpiCards.map((card) => (
          <Grid key={card.title} size={{ xs: 12, sm: 6, md: 4 }}>
            <SummaryCard>
              <Typography variant="h6">{card.title}</Typography>
              <Typography variant="h2">{formatCurrency(card.value)}</Typography>
              <SummaryCardIcon>
                <CalendarDays size={18} color={theme.palette.text.secondary} />
              </SummaryCardIcon>
            </SummaryCard>
          </Grid>
        ))}
      </Grid>

      <DiscrepanciesAlert
        count={discrepancies.length}
        loading={discrepanciesLoading}
        onReview={() => setDiscrepanciesOpen(true)}
      />

      <TabFilters
        tabs={STATUS_TABS}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        showSearch
        searchValue={searchInput}
        onSearchChange={setSearchInput}
      />

      <TableCrud
        columns={columns}
        rows={rows}
        loading={loading}
        rowKey="id"
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={totalRows}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        onRowClick={openDetail}
        emptyMessage="No hay cuentas por pagar"
      />

      <DiscrepanciesModal
        open={discrepanciesOpen}
        onClose={() => setDiscrepanciesOpen(false)}
        discrepancies={discrepancies}
        loading={discrepanciesLoading}
        onReviewStatement={(statementId) => {
          setDiscrepanciesOpen(false);
          setSelectedStatementId(statementId);
          setDetailOpen(true);
        }}
      />

      <StatementDetailModal
        open={detailOpen}
        statementId={selectedStatementId}
        onClose={() => {
          setDetailOpen(false);
          setSelectedStatementId(null);
        }}
        onRegisterPayment={(statement) => {
          setScheduleStatement(statement);
          setScheduleOpen(true);
        }}
        onReviewDiscrepancies={() => {
          setDiscrepanciesOpen(true);
        }}
      />

      <SchedulePaymentDrawer
        open={scheduleOpen}
        statement={scheduleStatement}
        onClose={() => {
          setScheduleOpen(false);
          setScheduleStatement(null);
        }}
        onSuccess={() => {
          void invalidateQueries();
        }}
      />
    </Stack>
  );
}
