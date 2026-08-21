import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Box, Stack } from "@mui/material";
import { Title, TabFilters, TableCrud, StatusChip } from "@/components";
import type { TabOption } from "@/components/TabFilters";
import type { Column, RowAction } from "@/components/TableCrud";
import type { StatusChipVariant } from "@/components/StatusChip/styles";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { useDebouncedInput } from "@/hooks/useDebouncedValue";
import { getSales, cancelSale } from "@/services/ventas.service";
import type {
  SaleListItem,
  SalePaymentType,
  SaleStatusTab,
} from "@/types/ventas.types";
import { formatDate } from "@/utils/date";
import dayjs from "@/lib/dayjs";
import { SALES_CREATE } from "@/lib/permissions";
import {
  SALE_STATUS_CHIP_LABELS,
  SALE_STATUS_CHIP_VARIANTS,
} from "@/utils/saleStatus";
import { useSnackbarStore } from "@/store/useSnackbarStore";

const SEARCH_DEBOUNCE_MS = 300;
const STATUS_TABS: TabOption[] = [
  {
    label: "Todas",
    value: "all",
  },
  {
    label: "Finalizadas",
    value: "finalized",
  },
  {
    label: "Realizadas",
    value: "completed",
  },
  {
    label: "Pendientes",
    value: "pending",
  },
];
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
function formatRelativeDate(value: unknown): string {
  const d = value == null ? dayjs() : dayjs(value as string | number | Date);
  if (!d.isValid()) return "—";
  const now = dayjs();
  const diffMin = now.diff(d, "minute");
  const diffHours = now.diff(d, "hour");
  const diffDays = now.diff(d, "day");
  if (diffMin < 60) return `Hace ${diffMin} min`;
  if (diffHours < 24) return `Hace ${diffHours} h`;
  if (diffDays === 1) return "Ayer";
  return formatDate(d, "D MMM");
}
export default function Ventas() {
  const router = useRouter();
  const showSuccess = useSnackbarStore((s) => s.showSuccess);
  const showError = useSnackbarStore((s) => s.showError);
  const [activeTab, setActiveTab] = useState("all");
  const statusTabExtra =
    activeTab === "all"
      ? undefined
      : {
          statusTab: activeTab as SaleStatusTab,
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
      id: "status",
      label: "Estatus",
      size: "sm",
      type: "chip",
      chipLabelMap: SALE_STATUS_CHIP_LABELS,
      chipVariantMap: SALE_STATUS_CHIP_VARIANTS,
    },
    {
      id: "folio",
      label: "Folio",
      size: "sm",
      format: (value) => String(value ?? "—"),
    },
    {
      id: "productName",
      label: "Artículo",
      size: "xl",
      format: (value, row) => (
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            component="img"
            src={row.productImageUrl ?? "/placeholder-product.png"}
            alt={String(value ?? "")}
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1,
              objectFit: "cover",
              flexShrink: 0,
              bgcolor: "grey.100",
            }}
          />
          <span>{String(value ?? "—")}</span>
        </Stack>
      ),
    },
    {
      id: "clientName",
      label: "Cliente",
      size: "lg",
      format: (value) => String(value ?? "—"),
    },
    {
      id: "createdAt",
      label: "Fecha",
      size: "md",
      format: (value) => formatRelativeDate(value),
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
        title="Ventas"
        actions={[
          {
            id: "nueva-venta",
            label: "Nueva",
            onClick: () => void router.push("/ventas/nueva"),
            variant: "contained",
            color: "primary",
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
        emptyMessage="No hay ventas registradas"
      />
    </Stack>
  );
}
