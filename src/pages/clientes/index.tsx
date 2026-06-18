import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Add as AddIcon,
  FileDownload as ExportIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import {
  MainLayout,
  Title,
  TabFilters,
  TableCrud,
} from "@/components";
<<<<<<< Updated upstream
import type { Column, RowAction, TitleAction } from "@/components";
import type { StatusChipVariant } from "@/components/TableCrud";
import { CUSTOMERS_CREATE, CUSTOMERS_DELETE, CUSTOMERS_READ, CUSTOMERS_UPDATE, REPORTS_READ } from "@/lib/permissions";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { useDebouncedInput } from "@/hooks/useDebouncedValue";
import { getClients, type Client, type ClientStatus } from "@/services/clients.service";
import { Stack } from "@mui/material";

const SEARCH_DEBOUNCE_MS = 300;

const STATUS_TABS: { label: string; value: string }[] = [
  { label: "Todos", value: "all" },
  { label: "Activos", value: "active" },
  { label: "Inactivos", value: "inactive" },
  { label: "Bloqueados", value: "blocked" },
];
=======
import { CLIENTES_CREAR, REPORTES_EXPORTAR } from "@/lib/permissions";
import { useClientes } from "@/hooks/useClientes";
import type { ClienteListItem } from "@/types/clientes.types";
>>>>>>> Stashed changes

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

<<<<<<< Updated upstream
const columns: Column<Client>[] = [
=======
const columns: Column<ClienteListItem>[] = [
>>>>>>> Stashed changes
  {
    id: "id",
    label: "ID",
    type: "number",
    size: "xs",
  },
  {
    id: "fullName",
    label: "Nombre",
    type: "text",
    size: "lg",
  },
  {
<<<<<<< Updated upstream
    id: "phoneNumber",
=======
    id: "phone",
>>>>>>> Stashed changes
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
    id: "status",
    label: "Estatus",
    type: "chip",
    size: "sm",
    chipLabelMap: STATUS_CHIP_LABELS,
    chipVariantMap: STATUS_CHIP_VARIANTS,
  },
  {
<<<<<<< Updated upstream
    id: "primaryAddressFormatted",
=======
    id: "domicilio",
>>>>>>> Stashed changes
    label: "Domicilio",
    size: "xl",
    truncate: true,
  },
];

export default function Clientes() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");

<<<<<<< Updated upstream
  const statusParam: { status?: ClientStatus } | undefined =
    activeTab === "all" ? undefined : { status: activeTab as ClientStatus };

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
    queryKey: ["clients", activeTab],
    queryFn: getClients,
    initialPage: 0,
    initialRowsPerPage: 10,
    initialSearch: "",
    extraParams: statusParam,
  });

  const [searchInput, setSearchInput, debouncedSearch] = useDebouncedInput(
    searchValue,
    SEARCH_DEBOUNCE_MS
  );

  useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setPage(0);
  };

  const tabs = STATUS_TABS.map((t) => ({
    ...t,
    count: t.value === activeTab ? totalRows : undefined,
  }));

  const rowActions: RowAction<Client>[] = [
=======
  const { data, isLoading, isError } = useClientes();
  const rows = data?.rows ?? [];
  const totalRows = rows.length;

  const actions: TitleAction[] = [
    {
      id: "export",
      label: "Exportar",
      icon: <ExportIcon />,
      variant: "outlined",
      onClick: () => console.log("Exportar clientes"),
      permission: REPORTES_EXPORTAR,
    },
    {
      id: "create",
      label: "Nuevo cliente",
      icon: <AddIcon />,
      variant: "contained",
      href: "/clientes/nuevo",
      permission: CLIENTES_CREAR,
    },
  ];

  const rowActions: RowAction<ClienteListItem>[] = [
>>>>>>> Stashed changes
    {
      id: "view",
      label: "Ver detalles",
      icon: <ViewIcon />,
      onClick: (row) => router.push(`/clientes/${row.id}`),
      permission: CUSTOMERS_READ,
    }
  ];

  return (
    <MainLayout>
<<<<<<< Updated upstream
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
          emptyMessage="No hay clientes registrados"
        />
      </Stack>
=======
      <Title
        title="Clientes"
        actions={actions}
      />
      <TabFilters
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        showSearch
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nombre"
      />
      <TableCrud
        columns={columns}
        rows={rows}
        actions={rowActions}
        rowKey="id"
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={totalRows}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        onRowClick={(row) => router.push(`/clientes/${row.id}`)}
        loading={isLoading}
      />
>>>>>>> Stashed changes
    </MainLayout>
  );
}
