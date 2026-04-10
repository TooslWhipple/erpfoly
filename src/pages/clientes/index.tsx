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
  TitleAction,
  TabFilters,
  TableCrud,
  Column,
  RowAction,
} from "@/components";
import type { StatusChipVariant } from "@/components/TableCrud";
import { CLIENTES_CREAR, REPORTES_EXPORTAR } from "@/lib/permissions";
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

const columns: Column<Client>[] = [
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

  const rowActions: RowAction<Client>[] = [
    {
      id: "view",
      label: "Ver detalles",
      icon: <ViewIcon />,
      onClick: (row) => router.push(`/clientes/${row.id}`),
    },
    {
      id: "edit",
      label: "Editar",
      icon: <EditIcon />,
      onClick: (row) => console.log("Editar:", row),
    },
    {
      id: "delete",
      label: "Eliminar",
      icon: <DeleteIcon />,
      onClick: (row) => console.log("Eliminar:", row),
      color: "error",
    },
  ];

  return (
    <MainLayout>
      <Stack direction="column" spacing={3}>
        <Title title="Clientes" actions={actions} />
        <TabFilters
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          showSearch
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          searchPlaceholder="Buscar por nombre, correo o teléfono"
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
    </MainLayout>
  );
}
