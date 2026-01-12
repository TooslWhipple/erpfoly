import { useState, useEffect, useCallback } from "react";
import { MainLayout, Title, TabFilters, TableCrud } from "@/components";
import type { TabOption } from "@/components/TabFilters";
import type { Column, RowAction, ChipStyleConfig } from "@/components/TableCrud";

type SolicitudEstatus = "pendiente" | "aceptada" | "rechazada";
type SolicitudTipo = "nuevo" | "aumento";

interface SolicitudCredito {
  id: number;
  estatus: SolicitudEstatus;
  fullName: string;
  cellphone: string;
  createdAt: string;
  address: string;
  type: SolicitudTipo;
}

interface GetSolicitudesParams {
  page: number;
  limit: number;
  estatus?: SolicitudEstatus | "todas";
  search?: string;
}

interface GetSolicitudesResponse {
  data: SolicitudCredito[];
  total: number;
  page: number;
  limit: number;
}

const DUMMY_SOLICITUDES: SolicitudCredito[] = [
  {
    id: 2241,
    estatus: "pendiente",
    fullName: "Saúl Arturo Quintero Solís",
    cellphone: "667 123 4567",
    createdAt: "Hace 2 horas",
    address: "Circuito Universitario 2322. Colonia Universitarios",
    type: "nuevo"
  },
  {
    id: 2242,
    estatus: "pendiente",
    fullName: "Daniela Margarita Fuentes Robles",
    cellphone: "667 123 4567",
    createdAt: "Hace 30 min",
    address: "Circuito Universitario 2322. Colonia Universitarios",
    type: "nuevo"
  },
  {
    id: 2243,
    estatus: "pendiente",
    fullName: "Ricardo Aguilera Montañez",
    cellphone: "667 123 4567",
    createdAt: "Hace 20 min",
    address: "Circuito Universitario 2322. Colonia Universitarios",
    type: "nuevo"
  },
  {
    id: 2244,
    estatus: "pendiente",
    fullName: "Sofía Estrada Hernández",
    cellphone: "667 123 4567",
    createdAt: "Hace 5 min",
    address: "Circuito Universitario 2322. Colonia Universitarios",
    type: "aumento"
  },
  {
    id: 2245,
    estatus: "aceptada",
    fullName: "Jose Antonio Fuentes Molina",
    cellphone: "667 123 4567",
    createdAt: "Hace 1 día",
    address: "Circuito Universitario 2322. Colonia Universitarios",
    type: "nuevo"
  },
  {
    id: 2246,
    estatus: "aceptada",
    fullName: "Cristian Morales Morales",
    cellphone: "667 123 4567",
    createdAt: "7 de sep, 2025",
    address: "Circuito Universitario 2322. Colonia Universitarios",
    type: "nuevo"
  },
  {
    id: 2247,
    estatus: "aceptada",
    fullName: "Karla Lucía Nuñez López",
    cellphone: "667 123 4567",
    createdAt: "7 de sep, 2025",
    address: "Circuito Universitario 2322. Colonia Universitarios",
    type: "nuevo"
  },
  {
    id: 2248,
    estatus: "aceptada",
    fullName: "Angélica Pérez Montalvo",
    cellphone: "667 123 4567",
    createdAt: "7 de sep, 2025",
    address: "Circuito Universitario 2322. Colonia Universitarios",
    type: "aumento"
  },
  {
    id: 2249,
    estatus: "aceptada",
    fullName: "Daniel Alejandro Torres Urquijo",
    cellphone: "667 123 4567",
    createdAt: "7 de sep, 2025",
    address: "Circuito Universitario 2322. Colonia Universitarios",
    type: "nuevo"
  },
  {
    id: 2250,
    estatus: "aceptada",
    fullName: "Alejandro Paredes Bustamante",
    cellphone: "667 123 4567",
    createdAt: "8 de sep, 2025",
    address: "Circuito Universitario 2322. Colonia Universitarios",
    type: "nuevo"
  },
  {
    id: 2251,
    estatus: "aceptada",
    fullName: "Ricardo Torres Wong",
    cellphone: "667 123 4567",
    createdAt: "8 de sep, 2025",
    address: "Circuito Universitario 2322. Colonia Universitarios",
    type: "nuevo"
  },
  {
    id: 2252,
    estatus: "rechazada",
    fullName: "María Elena García López",
    cellphone: "667 123 4567",
    createdAt: "5 de sep, 2025",
    address: "Circuito Universitario 2322. Colonia Universitarios",
    type: "nuevo"
  },
  {
    id: 2253,
    estatus: "rechazada",
    fullName: "Juan Carlos Mendoza Ruiz",
    cellphone: "667 123 4567",
    createdAt: "4 de sep, 2025",
    address: "Circuito Universitario 2322. Colonia Universitarios",
    type: "aumento"
  },
];

async function getSolicitudesCredito(
  params: GetSolicitudesParams
): Promise<GetSolicitudesResponse> {
  // Simular latencia de red
  await new Promise((resolve) => setTimeout(resolve, 500));

  let filteredData = [...DUMMY_SOLICITUDES];

  if (params.estatus && params.estatus !== "todas") {
    filteredData = filteredData.filter((s) => s.estatus === params.estatus);
  }

  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filteredData = filteredData.filter((s) =>
      s.fullName.toLowerCase().includes(searchLower)
    );
  }

  const total = filteredData.length;
  const start = params.page * params.limit;
  const end = start + params.limit;
  const paginatedData = filteredData.slice(start, end);

  return {
    data: paginatedData,
    total,
    page: params.page,
    limit: params.limit,
  };
}

async function getSolicitudById(id: number): Promise<SolicitudCredito | null> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return DUMMY_SOLICITUDES.find((s) => s.id === id) || null;
}

async function aprobarSolicitud(id: number): Promise<{ success: boolean }> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  console.log(`[API] Aprobando solicitud ${id}`);
  return { success: true };
}

async function rechazarSolicitud(
  id: number,
  motivo: string
): Promise<{ success: boolean }> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  console.log(`[API] Rechazando solicitud ${id}. Motivo: ${motivo}`);
  return { success: true };
}

const TABS: TabOption[] = [
  { label: "Todas", value: "todas" },
  { label: "Pendientes", value: "pendiente" },
  { label: "Aceptadas", value: "aceptada" },
  { label: "Rechazadas", value: "rechazada" },
];

const ESTATUS_CHIP_CONFIG: Record<SolicitudEstatus, ChipStyleConfig> = {
  pendiente: { label: "Pendiente", bgColor: "#F4F4F5", textColor: "#ACACB1" },
  aceptada: { label: "Aceptada", bgColor: "#DCFCE7", textColor: "#1B8854" },
  rechazada: { label: "Rechazada", bgColor: "#FCE4E4", textColor: "#E91E1F" },
};

const TIPO_CONFIG: Record<SolicitudTipo, { label: string; color: string }> = {
  nuevo: { label: "Nuevo", color: "#22c55e" },
  aumento: { label: "Aumento", color: "#ef4444" },
};

export default function SolicitudesCredito() {
  const [activeTab, setActiveTab] = useState("todas");
  const [searchValue, setSearchValue] = useState("");
  const [solicitudes, setSolicitudes] = useState<SolicitudCredito[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);

  const fetchSolicitudes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getSolicitudesCredito({
        page,
        limit: rowsPerPage,
        estatus: activeTab as SolicitudEstatus | "todas",
        search: searchValue,
      });
      
      setSolicitudes(response.data);
      setTotalRows(response.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, activeTab, searchValue]);

  useEffect(() => {
    fetchSolicitudes();
  }, [fetchSolicitudes]);

  useEffect(() => {
    setPage(0);
  }, [activeTab, searchValue]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleVerDetalle = async (solicitud: SolicitudCredito) => {
    const detalle = await getSolicitudById(solicitud.id);
  };

  const handleAprobar = async (solicitud: SolicitudCredito) => {
    const result = await aprobarSolicitud(solicitud.id);
    if (result.success) {
      fetchSolicitudes();
    }
  };

  const handleRechazar = async (solicitud: SolicitudCredito) => {
    const result = await rechazarSolicitud(
      solicitud.id,
      "Motivo de ejemplo"
    );
    if (result.success) {
      fetchSolicitudes(); 
    }
  };

  const columns: Column<SolicitudCredito>[] = [
    {
      id: "id",
      label: "ID",
      size: "sm",
    },
    {
      id: "estatus",
      label: "Estatus",
      size: "sm",
      type: "chip",
      chipConfig: ESTATUS_CHIP_CONFIG,
    },
    {
      id: "fullName",
      label: "Nombre",
      size: "lg",
    },
    {
      id: "cellphone",
      label: "Teléfono",
      size: "md",
    },
    {
      id: "createdAt",
      label: "Solicitado",
      size: "md",
    },
    {
      id: "address",
      label: "Domicilio",
      size: "xl",
      truncate: true
    },
    {
      id: "type",
      label: "Tipo",
      size: "sm",
      format: (value) => {
        const config = TIPO_CONFIG[value as SolicitudTipo];
        if (!config) return String(value ?? "");
        return (
          <span style={{ color: config.color, fontWeight: 500 }}>
            {config.label}
          </span>
        );
      },
    },
  ];

  // Acciones de fila
  const actions: RowAction<SolicitudCredito>[] = [
    {
      id: "ver",
      label: "Ver detalle",
      onClick: handleVerDetalle,
    },
    {
      id: "aprobar",
      label: "Aprobar",
      onClick: handleAprobar,
      color: "primary",
    },
    {
      id: "rechazar",
      label: "Rechazar",
      onClick: handleRechazar,
      color: "error",
    },
  ];

  return (
    <MainLayout>
      <Title title="Solicitudes de crédito" />

      <TabFilters
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        showSearch
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Buscar por fullName"
      />

      <TableCrud
        columns={columns}
        rows={solicitudes}
        actions={actions}
        loading={loading}
        rowKey="id"
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={totalRows}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        emptyMessage="No hay solicitudes de crédito"
      />
    </MainLayout>
  );
}
