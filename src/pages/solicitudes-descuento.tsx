import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Title, TabFilters, TableCrud } from "@/components";
import type { TabOption } from "@/components/TabFilters";
import type { Column, StatusChipVariant } from "@/components/TableCrud";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { useDebouncedInput } from "@/hooks/useDebouncedValue";
import { getDiscountRequests } from "@/services/discount-requests.service";
import type {
  DiscountRequest,
  DiscountRequestStatus,
  DiscountRequestType,
} from "@/types/discount-requests.types";
import { formatDateTimeShort } from "@/utils/date";
import { formatDiscountRequestReasonList } from "@/utils/discountRequest";
import { Stack } from "@mui/material";
const SEARCH_DEBOUNCE_MS = 300;
const TABS: TabOption[] = [
  {
    label: "Pendientes",
    value: "pending",
  },
  {
    label: "Aceptadas",
    value: "approved",
  },
  {
    label: "Rechazadas",
    value: "rejected",
  },
];
const TYPE_CHIP_LABELS: Record<DiscountRequestType, string> = {
  contado: "Contado",
  credito: "Crédito",
  apartado: "Apartado",
};
const TYPE_CHIP_VARIANTS: Record<DiscountRequestType, StatusChipVariant> = {
  contado: "info",
  credito: "infoAlt",
  apartado: "default",
};
function formatArticleCount(count: number): string {
  return count === 1 ? "1 artículo" : `${count} artículos`;
}
export default function SolicitudesDescuentoPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("pending");
  const statusExtra: {
    status?: DiscountRequestStatus;
  } = {
    status: activeTab as DiscountRequestStatus,
  };
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
  } = usePaginatedList<DiscountRequest>({
    queryKey: ["discount-requests", activeTab],
    queryFn: getDiscountRequests,
    initialPage: 0,
    initialRowsPerPage: 10,
    initialSearch: "",
    extraParams: statusExtra,
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
  const handleRowClick = (row: DiscountRequest) => {
    void router.push(`/solicitudes-descuento/${row.id}`);
  };
  const columns: Column<DiscountRequest>[] = [
    {
      id: "id",
      label: "ID",
      size: "sm",
      type: "id",
      idPadding: 6,
    },
    {
      id: "createdAt",
      label: "FECHA Y HORA",
      size: "md",
      format: (value) =>
        formatDateTimeShort(value != null ? String(value) : null),
    },
    {
      id: "type",
      label: "TIPO",
      size: "sm",
      type: "chip",
      chipLabelMap: TYPE_CHIP_LABELS,
      chipVariantMap: TYPE_CHIP_VARIANTS,
    },
    {
      id: "customerName",
      label: "CLIENTE",
      size: "lg",
      truncate: true,
      format: (value) => (value == null || value === "" ? "—" : String(value)),
    },
    {
      id: "articleCount",
      label: "ARTÍCULOS",
      size: "sm",
      format: (value) => formatArticleCount(Number(value ?? 0)),
    },
    {
      id: "amount",
      label: "MONTO",
      size: "md",
      type: "currency",
      currencySymbol: "$",
    },
    {
      id: "reason",
      label: "MOTIVO",
      size: "xl",
      truncate: true,
      format: (_, row) =>
        formatDiscountRequestReasonList(row.reason, row.reasonCode, row.notes),
    },
  ];
  return (
    <Stack spacing={3}>
      <Title title="Solicitudes de descuentos" />
      <TabFilters
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        showSearch
        searchValue={searchInput}
        onSearchChange={setSearchInput}
      />
      <TableCrud<DiscountRequest>
        columns={columns}
        rows={requests}
        loading={loading}
        rowKey="id"
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={totalRows}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        emptyMessage="No hay solicitudes de descuento"
        onRowClick={handleRowClick}
      />
    </Stack>
  );
}
