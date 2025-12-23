import { useState } from "react";
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
  TabOption,
  TableCrud,
  Column,
  RowAction,
} from "@/components";
import { CLIENTES_CREAR, REPORTES_EXPORTAR } from "@/lib/permissions";

interface Cliente {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  estatus: string;
  saldo: number;
}

const mockClientes: Cliente[] = [
  { id: 1, nombre: "Juan Pérez", email: "juan@email.com", telefono: "555-1234", estatus: "Al corriente", saldo: 0 },
  { id: 2, nombre: "María García", email: "maria@email.com", telefono: "555-5678", estatus: "En retraso", saldo: 1500 },
  { id: 3, nombre: "Carlos López", email: "carlos@email.com", telefono: "555-9012", estatus: "Al corriente", saldo: 0 },
  { id: 4, nombre: "Ana Martínez", email: "ana@email.com", telefono: "555-3456", estatus: "En retraso", saldo: 3200 },
  { id: 5, nombre: "Pedro Sánchez", email: "pedro@email.com", telefono: "555-7890", estatus: "Al corriente", saldo: 0 },
];

const tabs: TabOption[] = [
  { label: "Todos", value: "all", count: 150 },
  { label: "Al corriente", value: "current", count: 120 },
  { label: "En retraso", value: "delayed", count: 30 },
];

const columns: Column<Cliente>[] = [
  { 
    id: "id", 
    label: "ID", 
    type: "number",
    size: "xs",
  },
  { 
    id: "nombre", 
    label: "Nombre", 
    type: "text",
    size: "lg",
  },
  { 
    id: "email", 
    label: "Email", 
    type: "text",
    size: "xl",
  },
  { 
    id: "telefono", 
    label: "Teléfono", 
    type: "text",
    size: "sm",
  },
  { 
    id: "estatus", 
    label: "Estatus", 
    type: "chip",
    size: "sm",
    chipColor: "default",
  },
  {
    id: "saldo",
    label: "Saldo",
    type: "currency",
    size: "sm",
    align: "right",
  },
];

export default function Clientes() {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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

  const rowActions: RowAction<Cliente>[] = [
    {
      id: "view",
      label: "Ver detalles",
      icon: <ViewIcon />,
      onClick: (row) => console.log("Ver:", row),
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
        searchPlaceholder="Buscar cliente..."
      />
      <TableCrud
        columns={columns}
        rows={mockClientes}
        actions={rowActions}
        rowKey="id"
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={mockClientes.length}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
      />
    </MainLayout>
  );
}
