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
  ChipStyleConfig,
} from "@/components";
import { CLIENTES_CREAR, REPORTES_EXPORTAR } from "@/lib/permissions";

interface Cliente {
  id: number;
  fullName: string;
  email: string;
  cellphone: string;
  estatus: string;
  address: string;
}

const mockClientes: Cliente[] = [
  { id: 1, fullName: "Juan Pérez Solís", email: "juan@email.com", cellphone: "667 123 4567", estatus: "Al corriente", address: "Circuito Universitario 2322. Colonia Universitarios" },
  { id: 2, fullName: "María García Robles", email: "maria@email.com", cellphone: "667 123 4567", estatus: "En retraso", address: "Circuito Universitario 2322. Colonia Universitarios" },
  { id: 3, fullName: "Carlos López Montañez", email: "carlos@email.com", cellphone: "667 123 4567", estatus: "Al corriente", address: "Circuito Universitario 2322. Colonia Universitarios" },
  { id: 4, fullName: "Ana Martínez Hernández", email: "ana@email.com", cellphone: "667 123 4567", estatus: "En retraso", address: "Circuito Universitario 2322. Colonia Universitarios" },
  { id: 5, fullName: "Pedro Sánchez Estrada", email: "pedro@email.com", cellphone: "667 123 4567", estatus: "Al corriente", address: "Circuito Universitario 2322. Colonia Universitarios" },
];

const tabs: TabOption[] = [
  { label: "Todos", value: "all", count: 150 },
  { label: "Al corriente", value: "current", count: 120 },
  { label: "En retraso", value: "delayed", count: 30 },
];

const ESTATUS_CHIP_CONFIG: Record<string, ChipStyleConfig> = {
  "Al corriente": { label: "Al corriente", bgColor: "#DCFCE7", textColor: "#1B8854" },
  "En retraso": { label: "En retraso", bgColor: "#FCE4E4", textColor: "#E91E1F" },
};

const columns: Column<Cliente>[] = [
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
    id: "cellphone",
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
    id: "estatus",
    label: "Estatus",
    type: "chip",
    size: "sm",
    chipConfig: ESTATUS_CHIP_CONFIG,
  },
  {
    id: "address",
    label: "Domicilio",
    size: "xl",
    truncate: true,
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
        searchPlaceholder="Buscar por nombre"
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
