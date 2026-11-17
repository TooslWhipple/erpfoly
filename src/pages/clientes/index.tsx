import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/router";
import { Visibility as ViewIcon } from "@mui/icons-material";
import { Title, TabFilters, TableCrud } from "@/components";
import type { Column, RowAction } from "@/components";
import type { StatusChipVariant } from "@/components/TableCrud";
import { CUSTOMERS_READ } from "@/lib/permissions";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { useDebouncedInput } from "@/hooks/useDebouncedValue";
import {
  getClients,
  type Client,
  type ClientSortField,
  type ClientSortOrder,
  type ClientStatus,
  type ClientType,
} from "@/services/clients.service";
import { Stack } from "@mui/material";

const SEARCH_DEBOUNCE_MS = 300;

const STATUS_TABS: {
  label: string;
  value: string;
}[] = [
  {
    label: "Todos",
    value: "all",
  },
  {
    label: "Activos",
    value: "active",
  },
  {
    label: "Inactivos",
    value: "inactive",
  },
  {
    label: "Bloqueados",
    value: "blocked",
  },
];

const STATUS_CHIP_LABELS: Record<string, string> = {
  active: "Activo",
  inactive: "Inactivo",
  blocked: "Bloqueado",
};

const STATUS_CHIP_VARIANTS: Record<string, StatusChipVariant> = {
  active: "success",
  inactive: "default",
  blocked: "error",
};

const CLIENT_TYPE_CHIP_LABELS: Record<ClientType, string> = {
  CASH: "Contado",
  CREDIT: "Crédito",
};

const CLIENT_TYPE_CHIP_VARIANTS: Record<ClientType, StatusChipVariant> = {
  CASH: "info",
  CREDIT: "warning",
};

const columns: Column<Client>[] = [
  {
    id: "id",
    label: "ID",
    type: "number",
    size: "xs",
    sortable: true,
  },
  {
    id: "fullName",
    label: "Nombre",
    type: "text",
    size: "xl",
    sortable: true,
  },
  {
    id: "phoneNumber",
    label: "Teléfono",
    type: "text",
    size: "md",
  },
  {
    id: "email",
    label: "Correo electrónico",
    type: "text",
    size: "lg",
  },
  {
    id: "clientType",
    label: "Tipo",
    type: "chip",
    size: "sm",
    chipLabelMap: CLIENT_TYPE_CHIP_LABELS,
    chipVariantMap: CLIENT_TYPE_CHIP_VARIANTS,
  },
  {
    id: "status",
    label: "Estatus",
    type: "chip",
    size: "sm",
    chipLabelMap: STATUS_CHIP_LABELS,
    chipVariantMap: STATUS_CHIP_VARIANTS,
  },
  {
    id: "primaryAddressFormatted",
    label: "Domicilio",
    size: "xl",
    truncate: true,
  },
];

export default function Clientes() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [sortField, setSortField] = useState<ClientSortField>("fullName");
  const [sortOrder, setSortOrder] = useState<ClientSortOrder>("asc");

  const listExtraParams = useMemo(() => {
    const params: {
      status?: ClientStatus;
      sortField: ClientSortField;
      sortOrder: ClientSortOrder;
    } = {
      sortField,
      sortOrder,
    };
    if (activeTab !== "all") {
      params.status = activeTab as ClientStatus;
    }
    return params;
  }, [activeTab, sortField, sortOrder]);

  const {
    data: clients,
    total: totalRows,
    page,
    rowsPerPage,
    search: searchValue,
    setPage,
    setRowsPerPage,
    setSearch,
    isLoading: loading,
  } = usePaginatedList<Client>({
    queryKey: ["clients"],
    queryFn: getClients,
    initialPage: 0,
    initialRowsPerPage: 10,
    initialSearch: "",
    extraParams: listExtraParams,
  });

  useEffect(() => {
    setPage(0);
  }, [activeTab, sortField, sortOrder, setPage]);

  const [searchInput, setSearchInput, debouncedSearch] = useDebouncedInput(
    searchValue,
    SEARCH_DEBOUNCE_MS,
  );

  useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleSortChange = useCallback(
    (field: string, order: ClientSortOrder) => {
      setSortField(field as ClientSortField);
      setSortOrder(order);
    },
    [],
  );

  const tabs = STATUS_TABS.map((t) => ({
    ...t,
    count: t.value === activeTab ? totalRows : undefined,
  }));

  const rowActions: RowAction<Client>[] = [
    {
      id: "view",
      label: "Ver detalles",
      icon: <ViewIcon />,
      onClick: (row) => router.push(`/clientes/${row.id}`),
      permission: CUSTOMERS_READ,
    },
  ];

  return (
    <Stack direction="column" spacing={3}>
      <Title title="Clientes" />
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
        rows={clients}
        actions={rowActions}
        loading={loading}
        rowKey="id"
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={totalRows}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        onRowClick={(row) => router.push(`/clientes/${row.id}`)}
        sortField={sortField}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        emptyMessage="No hay clientes registrados"
      />
    </Stack>
  );
}
