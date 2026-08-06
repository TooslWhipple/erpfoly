import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { Grid, Stack, Typography } from "@mui/material";
import numeral from "numeral";
import { useQuery } from "@tanstack/react-query";
import { Title, TabFilters, TableCrud } from "@/components";
import type { TabOption } from "@/components/TabFilters";
import type { Column, StatusChipVariant } from "@/components/TableCrud";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { useDebouncedInput } from "@/hooks/useDebouncedValue";
import {
  getPayableInvoices,
  getPayableInvoicesSummary,
  type PayableInvoiceListItem,
  type PayableInvoiceStatusTab,
} from "@/services/payable-invoices.service";
import type { InvoiceRequestOrigin } from "@/types/invoice-requests.types";
import type { PayableInvoiceDisplayStatus } from "@/types/payable-invoices.types";
import { formatDate } from "@/utils/date";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import {
  SummaryCard,
  SummaryCardIcon,
} from "@/styles/inventario/detalle.styles";
import { theme } from "@/styles/theme";

const SEARCH_DEBOUNCE_MS = 300;

const STATUS_TABS: TabOption[] = [
  { label: "Todas", value: "all" },
  { label: "Pendientes", value: "pending" },
  { label: "Retrasadas", value: "overdue" },
  { label: "Pagadas", value: "paid" },
];

const STATUS_CHIP_LABELS: Record<PayableInvoiceDisplayStatus, string> = {
  pending: "Pendiente",
  paid: "Pagado",
  overdue: "Retrasado",
};

const STATUS_CHIP_VARIANTS: Record<
  PayableInvoiceDisplayStatus,
  StatusChipVariant
> = {
  pending: "default",
  paid: "success",
  overdue: "error",
};

const ORIGIN_LABELS: Record<InvoiceRequestOrigin, string> = {
  providers: "Proveedores",
  administration: "Administración",
};

function formatCurrency(value: number): string {
  return numeral(value).format("$0,0.00");
}

export default function PayableInvoicesPage() {
  const showError = useSnackbarStore((state) => state.showError);
  const [activeTab, setActiveTab] = useState("all");

  const statusTabExtra:
    | { statusTab?: PayableInvoiceStatusTab }
    | undefined =
    activeTab === "all"
      ? undefined
      : { statusTab: activeTab as PayableInvoiceStatusTab };

  const {
    data: invoices,
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
  } = usePaginatedList<PayableInvoiceListItem>({
    queryKey: ["payable-invoices", activeTab],
    queryFn: getPayableInvoices,
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
    queryKey: ["payable-invoices-summary"],
    queryFn: async () => {
      const result = await getPayableInvoicesSummary();
      if (result.error) throw new Error(result.error.message);
      return (
        result.data ?? {
          totalPending: 0,
          overdue: 0,
          dueSoon: 0,
          pendingApproval: 0,
        }
      );
    },
  });

  useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);

  useEffect(() => {
    if (isError) {
      showError(error?.message ?? "No se pudieron cargar las facturas");
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
    setActiveTab(value);
    setPage(0);
  };

  const tabs = STATUS_TABS.map((tab) => ({
    ...tab,
    count: tab.value === activeTab ? totalRows : undefined,
  }));

  const columns: Column<PayableInvoiceListItem>[] = [
    {
      id: "invoiceNumber",
      label: "Factura",
      size: "md",
    },
    {
      id: "origin",
      label: "Origen",
      size: "md",
      format: (value) =>
        ORIGIN_LABELS[value as InvoiceRequestOrigin] ?? String(value ?? "—"),
    },
    {
      id: "details",
      label: "Detalles",
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
    {
      title: "Pendientes de aprobación",
      value: summary?.pendingApproval ?? 0,
    },
  ];

  return (
    <Stack direction="column" spacing={3}>
      <Title title="Facturas" />

      <Grid container spacing={2} alignItems="stretch">
        {
          kpiCards.map((card) => (
            <Grid key={card.title} size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard>
                <Typography variant="h6">{card.title}</Typography>
                <Typography variant="h2">{formatCurrency(card.value)}</Typography>
                <SummaryCardIcon>
                  <CalendarDays size={18} color={theme.palette.text.secondary} />
                </SummaryCardIcon>
              </SummaryCard>
            </Grid>
          ))
        }
      </Grid>

      <TabFilters
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        showSearch
        searchValue={searchInput}
        onSearchChange={setSearchInput}
      />

      <TableCrud
        columns={columns}
        rows={invoices}
        loading={loading}
        rowKey="id"
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={totalRows}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        emptyMessage="No hay facturas"
      />
    </Stack>
  );
}
