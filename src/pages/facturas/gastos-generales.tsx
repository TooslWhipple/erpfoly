import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { CalendarDays } from "lucide-react";
import { Grid, Stack, Typography } from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Title,
  TabFilters,
  TableCrud,
  UnassignedInvoicesAlert,
  UnassignedInvoicesModal,
} from "@/components";
import type { TabOption } from "@/components/TabFilters";
import type { Column, StatusChipVariant } from "@/components/TableCrud";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { useDebouncedInput } from "@/hooks/useDebouncedValue";
import {
  createExpenseFromUnassignedInvoice,
  getGeneralExpenses,
  getGeneralExpensesSummary,
  getUnassignedInvoices,
} from "@/services/general-expenses.service";
import type {
  GeneralExpenseListItem,
  GeneralExpenseStatus,
  GeneralExpenseStatusTab,
  UnassignedInvoice,
} from "@/types/general-expenses.types";
import { formatDate } from "@/utils/date";
import { GENERAL_EXPENSES_CREATE } from "@/lib/permissions";
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

const STATUS_CHIP_LABELS: Record<GeneralExpenseStatus, string> = {
  pending: "Pendiente",
  paid: "Pagado",
  overdue: "Retrasado",
};

const STATUS_CHIP_VARIANTS: Record<GeneralExpenseStatus, StatusChipVariant> = {
  pending: "default",
  paid: "success",
  overdue: "error",
};

function formatCurrency(value: number): string {
  return numeral(value).format("$0,0.00");
}

export default function GeneralExpensesPage() {
  const router = useRouter();
  const showError = useSnackbarStore((state) => state.showError);
  const showSuccess = useSnackbarStore((state) => state.showSuccess);
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("all");
  const [unassignedOpen, setUnassignedOpen] = useState(false);
  const [registeringUnassignedId, setRegisteringUnassignedId] = useState<
    string | null
  >(null);

  const statusTabExtra:
    | { statusTab?: GeneralExpenseStatusTab }
    | undefined =
    activeTab === "all"
      ? undefined
      : { statusTab: activeTab as GeneralExpenseStatusTab };

  const {
    data: expenses,
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
  } = usePaginatedList<GeneralExpenseListItem>({
    queryKey: ["general-expenses", activeTab],
    queryFn: getGeneralExpenses,
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
    queryKey: ["general-expenses-summary"],
    queryFn: async () => {
      const result = await getGeneralExpensesSummary();
      if (result.error) throw new Error(result.error.message);
      return (
        result.data ?? {
          totalPending: 0,
          overdue: 0,
          dueSoon: 0,
        }
      );
    },
  });

  const {
    data: unassignedInvoices = [],
    isLoading: unassignedLoading,
    isError: unassignedError,
    error: unassignedErrorObj,
    refetch: refetchUnassigned,
  } = useQuery({
    queryKey: ["general-expenses-unassigned"],
    queryFn: async () => {
      const result = await getUnassignedInvoices();
      if (result.error) throw new Error(result.error.message);
      return result.data ?? [];
    },
  });

  useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);

  useEffect(() => {
    if (isError) {
      showError(error?.message ?? "No se pudieron cargar los gastos generales");
    }
  }, [isError, error, showError]);

  useEffect(() => {
    if (summaryError) {
      showError(
        summaryErrorObj?.message ?? "No se pudieron cargar los totales",
      );
    }
  }, [summaryError, summaryErrorObj, showError]);

  useEffect(() => {
    if (unassignedError) {
      showError(
        unassignedErrorObj?.message ??
          "No se pudieron cargar las facturas sin asignar",
      );
    }
  }, [unassignedError, unassignedErrorObj, showError]);

  const invalidateExpenseQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["general-expenses"] }),
      queryClient.invalidateQueries({ queryKey: ["general-expenses-summary"] }),
      queryClient.invalidateQueries({
        queryKey: ["general-expenses-unassigned"],
      }),
    ]);
    void refetch();
    void refetchUnassigned();
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setPage(0);
  };

  const openCreatePage = () => {
    void router.push("/facturas/gastos-generales/nuevo");
  };

  const openEditPage = (row: GeneralExpenseListItem) => {
    void router.push(`/facturas/gastos-generales/${row.id}`);
  };

  const handleRegisterFromUnassigned = async (invoice: UnassignedInvoice) => {
    setRegisteringUnassignedId(invoice.id);
    try {
      const result = await createExpenseFromUnassignedInvoice(invoice.id);
      if (result.error || !result.data) {
        showError(result.error?.message ?? "No se pudo registrar el gasto");
        return;
      }

      showSuccess("Gasto registrado desde la factura");
      setUnassignedOpen(false);
      await invalidateExpenseQueries();
      void router.push(`/facturas/gastos-generales/${result.data.id}`);
    } finally {
      setRegisteringUnassignedId(null);
    }
  };

  const tabs = STATUS_TABS.map((tab) => ({
    ...tab,
    count: tab.value === activeTab ? totalRows : undefined,
  }));

  const columns: Column<GeneralExpenseListItem>[] = [
    {
      id: "supplierName",
      label: "Proveedor",
      size: "lg",
      truncate: true,
    },
    {
      id: "dueDate",
      label: "Fecha de vencimiento",
      size: "md",
      format: (value) => formatDate(String(value ?? ""), "dateLong"),
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
    {
      id: "status",
      label: "Estatus",
      size: "sm",
      type: "chip",
      chipLabelMap: STATUS_CHIP_LABELS,
      chipVariantMap: STATUS_CHIP_VARIANTS,
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
      <Title title="Interno - Cuentas por pagar" />

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

      <UnassignedInvoicesAlert
        count={unassignedInvoices.length}
        loading={unassignedLoading}
        onReview={() => setUnassignedOpen(true)}
      />

      <TabFilters
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        showSearch
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        actions={[
          {
            label: "Nuevo",
            onClick: openCreatePage,
            variant: "contained",
            permission: GENERAL_EXPENSES_CREATE,
          },
        ]}
      />

      <TableCrud
        columns={columns}
        rows={expenses}
        loading={loading}
        rowKey="id"
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={totalRows}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        onRowClick={openEditPage}
        emptyMessage="No hay gastos generales"
      />

      <UnassignedInvoicesModal
        open={unassignedOpen}
        onClose={() => setUnassignedOpen(false)}
        invoices={unassignedInvoices}
        loading={unassignedLoading}
        registeringId={registeringUnassignedId}
        onRegisterExpense={(invoice) => {
          void handleRegisterFromUnassigned(invoice);
        }}
      />

    </Stack>
  );
}
