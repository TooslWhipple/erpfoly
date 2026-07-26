import { useEffect, useState } from "react";
import { Stack } from "@mui/material";
import numeral from "numeral";
import { Title, TabFilters, TableCrud, CreateInvoiceRequestModal } from "@/components";
import type { TabOption } from "@/components/TabFilters";
import type { Column, StatusChipVariant } from "@/components/TableCrud";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { useDebouncedInput } from "@/hooks/useDebouncedValue";
import {
  getInvoiceRequests,
  type InvoiceRequestListItem,
  type InvoiceRequestStatusTab,
} from "@/services/invoice-requests.service";
import type {
  InvoiceRequestOrigin,
  InvoiceRequestStatus,
} from "@/types/invoice-requests.types";
import { formatDate } from "@/utils/date";
import { INVOICE_REQUESTS_CREATE } from "@/lib/permissions";
import { useSnackbarStore } from "@/store/useSnackbarStore";

const SEARCH_DEBOUNCE_MS = 300;

const STATUS_TABS: TabOption[] = [
  { label: "Todas", value: "all" },
  { label: "Pendientes", value: "pending" },
  { label: "Rechazadas", value: "rejected" },
  { label: "Aceptadas", value: "accepted" },
];

const STATUS_CHIP_LABELS: Record<InvoiceRequestStatus, string> = {
  pending: "Pendiente",
  accepted: "Aceptada",
  rejected: "Rechazada",
};

const STATUS_CHIP_VARIANTS: Record<InvoiceRequestStatus, StatusChipVariant> = {
  pending: "default",
  accepted: "success",
  rejected: "error",
};

const ORIGIN_LABELS: Record<InvoiceRequestOrigin, string> = {
  providers: "Proveedores",
  administration: "Administración",
};

export default function InvoiceRequestsPage() {
  const showError = useSnackbarStore((state) => state.showError);
  const [activeTab, setActiveTab] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);

  const statusTabExtra:
    | { statusTab?: InvoiceRequestStatusTab }
    | undefined =
    activeTab === "all"
      ? undefined
      : { statusTab: activeTab as InvoiceRequestStatusTab };

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
  } = usePaginatedList<InvoiceRequestListItem>({
    queryKey: ["invoice-requests", activeTab],
    queryFn: getInvoiceRequests,
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

  useEffect(() => {
    if (isError) {
      showError(error?.message ?? "No se pudieron cargar las solicitudes");
    }
  }, [isError, error, showError]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setPage(0);
  };

  const tabs = STATUS_TABS.map((tab) => ({
    ...tab,
    count: tab.value === activeTab ? totalRows : undefined,
  }));

  const columns: Column<InvoiceRequestListItem>[] = [
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
      id: "requestedAt",
      label: "Fecha de solicitud",
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
      format: (value) => numeral(Number(value ?? 0)).format("$0,0.00"),
    },
  ];

  return (
    <Stack direction="column" spacing={3}>
      <Title title="Solicitudes de facturas" />

      <TabFilters
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        showSearch
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        actions={[
          {
            label: "Nueva solicitud",
            onClick: () => setModalOpen(true),
            variant: "contained",
            permission: INVOICE_REQUESTS_CREATE,
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
        emptyMessage="No hay solicitudes de facturas"
      />

      <CreateInvoiceRequestModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          void refetch();
        }}
      />
    </Stack>
  );
}
