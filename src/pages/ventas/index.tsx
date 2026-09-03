import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Box, Stack } from "@mui/material";
import { Title, TabFilters, TableCrud, StatusChip, DateRangeFilter } from "@/components";
import type { TabOption } from "@/components/TabFilters";
import type { Column, RowAction } from "@/components/TableCrud";
import type { StatusChipVariant } from "@/components/StatusChip/styles";
import {
  PRESET_HOY,
  PRESET_PERIODO,
  PRESET_SEMANA,
} from "@/components/DateRangePopover";
import type { DateRangeSelectOption } from "@/components/DateRangePopover";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { useDebouncedInput } from "@/hooks/useDebouncedValue";
import { getSales, cancelSale } from "@/services/ventas.service";
import type {
  SaleListItem,
  SalePaymentType,
  SaleStatusTab,
} from "@/types/ventas.types";
import dayjs from "@/lib/dayjs";
import { SALES_CREATE } from "@/lib/permissions";
import {
  SALE_STATUS_CHIP_LABELS,
  SALE_STATUS_CHIP_VARIANTS,
} from "@/utils/saleStatus";
import { useSnackbarStore } from "@/store/useSnackbarStore";

const SEARCH_DEBOUNCE_MS = 300;
const MEXICO_CITY_TZ = "America/Mexico_City";
const STATUS_TABS: TabOption[] = [
  { label: "Todas", value: "all" },
  { label: "Pendiente de cobro", value: "pendingCollection" },
  { label: "En apartado", value: "pendingPayment" },
  { label: "Pagada", value: "paid" },
  { label: "Cancelada", value: "cancelled" },
];
const SALES_DATE_OPTIONS: DateRangeSelectOption[] = [
  { value: PRESET_HOY, label: "Hoy" },
  { value: PRESET_SEMANA, label: "Esta semana" },
  { value: PRESET_PERIODO, label: "Fecha personalizable" },
];

function todayInMexicoCity(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: MEXICO_CITY_TZ });
}
const PAYMENT_TYPE_LABELS: Record<SalePaymentType, string> = {
  CREDIT: "Crédito",
  CASH: "Contado",
  LAYAWAY: "Apartado",
};
const PAYMENT_TYPE_CHIP_VARIANTS: Record<SalePaymentType, StatusChipVariant> = {
  CREDIT: "warning",
  CASH: "success",
  LAYAWAY: "infoAlt",
};

function formatAbsoluteListDate(value: unknown): string {
  const d = value == null ? null : dayjs(value as string | number | Date);
  if (!d?.isValid()) return "—";
  const day = d.format("D");
  const month = d.format("MMM");
  const year = d.format("YYYY");
  const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
  return `${day} ${capitalizedMonth} ${year}`;
}

function formatItemCount(count: number): string {
  if (count === 1) return "1 artículo";
  return `${count} artículos`;
}

export default function Ventas() {
  const router = useRouter();
  const showSuccess = useSnackbarStore((s) => s.showSuccess);
  const showError = useSnackbarStore((s) => s.showError);
  const [activeTab, setActiveTab] = useState("all");
  const [dateFrom, setDateFrom] = useState(todayInMexicoCity);
  const [dateTo, setDateTo] = useState(todayInMexicoCity);
  const statusTabExtra = {
    statusTab: activeTab as SaleStatusTab,
    dateFrom,
    dateTo,
  };
  const {
    data: ventas,
    total: totalRows,
    page,
    rowsPerPage,
    search: searchValue,
    setPage,
    setRowsPerPage,
    setSearch,
    isLoading: loading,
    refetch,
  } = usePaginatedList<SaleListItem>({
    queryKey: ["sales", activeTab],
    queryFn: getSales,
    initialPage: 0,
    initialRowsPerPage: 10,
    initialSearch: "",
    extraParams: statusTabExtra,
  });
  const [searchInput, setSearchInput, debouncedSearch] = useDebouncedInput(
    searchValue,
    SEARCH_DEBOUNCE_MS,
  );
  useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setPage(0);
  };
  const handleDateRangeChange = (range: { startDate: string; endDate: string }) => {
    const today = todayInMexicoCity();
    setDateFrom(range.startDate || today);
    setDateTo(range.endDate || range.startDate || today);
    setPage(0);
  };
  const handleCancelSale = async (row: SaleListItem) => {
    const res = await cancelSale(row.id);
    if (res.error) {
      showError(res.error.message);
      return;
    }
    showSuccess(`Venta ${row.folio} cancelada. Inventario liberado.`);
    void refetch();
  };
  const tabs = STATUS_TABS.map((t) => ({
    ...t,
    count: t.value === activeTab ? totalRows : undefined,
  }));
  const handleRowClick = (row: SaleListItem) => {
    void router.push(`/ventas/${row.id}`);
  };
  const columns: Column<SaleListItem>[] = [
    {
      id: "folio",
      label: "Folio",
      size: "sm",
      format: (value) => String(value ?? "—"),
    },
    {
      id: "status",
      label: "Estatus",
      size: "sm",
      type: "chip",
      chipLabelMap: SALE_STATUS_CHIP_LABELS,
      chipVariantMap: SALE_STATUS_CHIP_VARIANTS,
    },
    {
      id: "clientName",
      label: "Cliente",
      size: "lg",
      format: (value) => String(value ?? "—"),
    },
    {
      id: "itemCount",
      label: "Nº artículos",
      size: "sm",
      format: (value) => formatItemCount(typeof value === "number" ? value : 0),
    },
    {
      id: "createdAt",
      label: "Fecha",
      size: "md",
      format: (value) => formatAbsoluteListDate(value),
    },
    {
      id: "paymentType",
      label: "Tipo",
      size: "sm",
      format: (value) => {
        const type = value as SalePaymentType;
        const label = PAYMENT_TYPE_LABELS[type] ?? String(value);
        return (
          <StatusChip
            label={label}
            size="small"
            variant={PAYMENT_TYPE_CHIP_VARIANTS[type] ?? "default"}
          />
        );
      },
    },
    {
      id: "totalAmount",
      label: "Total",
      size: "md",
      type: "currency",
      align: "right",
    },
  ];
  const actions: RowAction<SaleListItem>[] = [
    {
      id: "cancelar",
      label: "Cancelar venta",
      color: "error",
      hidden: (row) => row.status !== "PENDING_CASHIER",
      onClick: (row) => void handleCancelSale(row),
    },
  ];
  return (
    <Stack direction="column" spacing={3}>
      <Title
        title={
          <>
            <Box component="span" sx={{ whiteSpace: "nowrap" }}>
              Órdenes de ventas de
            </Box>
            <DateRangeFilter
              variant="title"
              dateFrom={dateFrom}
              dateTo={dateTo}
              onChange={handleDateRangeChange}
              options={SALES_DATE_OPTIONS}
              timeZone={MEXICO_CITY_TZ}
              label="Hoy"
            />
          </>
        }
        actions={[
          {
            id: "nueva-venta",
            label: "Nueva venta",
            onClick: () => void router.push("/ventas/nueva"),
            variant: "contained",
            color: "primary",
            size: "large",
            permission: SALES_CREATE,
          },
        ]}
      />

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
        rows={ventas}
        actions={actions}
        loading={loading}
        rowKey="id"
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={totalRows}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        onRowClick={handleRowClick}
        emptyMessage="No hay órdenes registradas"
      />
    </Stack>
  );
}
