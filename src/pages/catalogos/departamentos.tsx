import { useState, useEffect, useCallback } from "react";
import { InputAdornment } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { MainLayout, Title, TableCrud } from "@/components";
import type { Column, RowAction } from "@/components/TableCrud";
import {
  HeaderContainer,
  ControlsContainer,
  SearchInput,
  CreateButton,
  SearchIconStyled,
} from "@/styles/catalogos/catalogos.styledComponents";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface ProductGroup {
  id: string;
  name: string;
}

interface Department {
  id: number;
  name: string;
  margin: number;
  groups: ProductGroup[];
}

interface GetDepartmentsParams {
  page: number;
  limit: number;
  search?: string;
}

interface GetDepartmentsResponse {
  data: Department[];
  total: number;
  page: number;
  limit: number;
}

// ============================================================================
// MOCK DATA - Realistic e-commerce departments
// ============================================================================

const DUMMY_DEPARTMENTS: Department[] = [
  {
    id: 1,
    name: "Línea Blanca",
    margin: 32,
    groups: [
      { id: "g1", name: "Estufa" },
      { id: "g2", name: "Horno" },
      { id: "g3", name: "Parrillas" },
      { id: "g4", name: "Campana Cocina" },
      { id: "g5", name: "Microondas" },
      { id: "g6", name: "Lavadora" },
      { id: "g7", name: "Secadora" },
      { id: "g8", name: "Refrigerador" },
      { id: "g9", name: "Lavavajillas" },
      { id: "g10", name: "Congelador" },
    ],
  },
  {
    id: 2,
    name: "Colchón",
    margin: 29,
    groups: [
      { id: "g11", name: "Individual" },
      { id: "g12", name: "Matrimonial" },
      { id: "g13", name: "Queen" },
      { id: "g14", name: "King" },
      { id: "g15", name: "Almohadas y protectores" },
    ],
  },
  {
    id: 3,
    name: "Muebles casa",
    margin: 29,
    groups: [
      { id: "g16", name: "Individual" },
      { id: "g17", name: "Matrimonial" },
      { id: "g18", name: "Queen" },
      { id: "g19", name: "King" },
      { id: "g20", name: "Almohadas y protectores" },
    ],
  },
  {
    id: 4,
    name: "Electrodomésticos",
    margin: 29,
    groups: [
      { id: "g21", name: "Sartenes" },
      { id: "g22", name: "Hidrolavadora" },
      { id: "g23", name: "Licuadoras" },
      { id: "g24", name: "Freidoras de aire" },
      { id: "g25", name: "Microondas" },
      { id: "g26", name: "Batidoras" },
      { id: "g27", name: "Cafeteras" },
      { id: "g28", name: "Tostadoras" },
      { id: "g29", name: "Planchas" },
      { id: "g30", name: "Aspiradoras" },
    ],
  },
  {
    id: 5,
    name: "Aire Acondicionado",
    margin: 29,
    groups: [
      { id: "g31", name: "Minisplit" },
      { id: "g32", name: "Inverter" },
      { id: "g33", name: "Ventilador de techo" },
      { id: "g34", name: "Ventilador" },
    ],
  },
  {
    id: 6,
    name: "Electrónica",
    margin: 29,
    groups: [
      { id: "g35", name: "Pantalla - TV" },
      { id: "g36", name: "Audio" },
      { id: "g37", name: "Laptop" },
      { id: "g38", name: "Tabletas" },
      { id: "g39", name: "Celular" },
      { id: "g40", name: "Celular inteligente" },
      { id: "g41", name: "Consolas" },
      { id: "g42", name: "Accesorios" },
    ],
  },
  {
    id: 7,
    name: "Bicicletas",
    margin: 29,
    groups: [
      { id: "g43", name: "Bicicleta adulto" },
      { id: "g44", name: "Bicicleta niños" },
      { id: "g45", name: "Aparatos de ejercicio" },
    ],
  },
  {
    id: 8,
    name: "Herramientas",
    margin: 25,
    groups: [
      { id: "g46", name: "Taladros" },
      { id: "g47", name: "Sierras" },
      { id: "g48", name: "Lijadoras" },
      { id: "g49", name: "Rotomartillos" },
      { id: "g50", name: "Compresores" },
    ],
  },
  {
    id: 9,
    name: "Jardín",
    margin: 28,
    groups: [
      { id: "g51", name: "Podadoras" },
      { id: "g52", name: "Desbrozadoras" },
      { id: "g53", name: "Mangueras" },
      { id: "g54", name: "Macetas" },
    ],
  },
  {
    id: 10,
    name: "Motos",
    margin: 22,
    groups: [
      { id: "g55", name: "Motocicletas" },
      { id: "g56", name: "Motonetas" },
      { id: "g57", name: "Cuatrimotos" },
      { id: "g58", name: "Accesorios moto" },
    ],
  },
];

// ============================================================================
// MOCK API FUNCTIONS
// ============================================================================

async function getDepartments(
  params: GetDepartmentsParams
): Promise<GetDepartmentsResponse> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  let filteredData = [...DUMMY_DEPARTMENTS];

  // Filter by search
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filteredData = filteredData.filter(
      (d) =>
        d.name.toLowerCase().includes(searchLower) ||
        d.groups.some((g) => g.name.toLowerCase().includes(searchLower))
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

async function createDepartment(
  data: Omit<Department, "id">
): Promise<Department> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const newDepartment: Department = {
    id: Date.now(),
    ...data,
  };
  console.log("[API] Created department:", newDepartment);
  return newDepartment;
}

async function deleteDepartment(id: number): Promise<{ success: boolean }> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  console.log("[API] Deleted department:", id);
  return { success: true };
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Departamentos() {
  // State management
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);

  // Fetch departments
  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getDepartments({
        page,
        limit: rowsPerPage,
        search: searchValue,
      });
      setDepartments(response.data);
      setTotalRows(response.total);
    } catch (err) {
      console.error("[Departamentos] Error fetching:", err);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchValue]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  useEffect(() => {
    setPage(0);
  }, [searchValue]);

  // Event handlers
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };

  const handleCreateDepartment = () => {
    console.log("[Departamentos] Open create modal");
    // Open create/edit modal
  };

  const handleEditDepartment = (department: Department) => {
    console.log("[Departamentos] Edit:", department.id);
    // Open edit modal
  };

  const handleDeleteDepartment = async (department: Department) => {
    const confirmed = window.confirm(
      `¿Estás seguro de eliminar el departamento "${department.name}"?`
    );
    if (!confirmed) return;

    try {
      await deleteDepartment(department.id);
      fetchDepartments();
    } catch (err) {
      console.error("[Departamentos] Error deleting:", err);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  // Table columns
  const columns: Column<Department>[] = [
    {
      id: "id",
      label: "ID",
      type: "id",
      size: "xs",
      idPadding: 2,
    },
    {
      id: "name",
      label: "NOMBRE",
      size: "sm",
    },
    {
      id: "margin",
      label: "MARGEN",
      size: "xs",
      type: "percentage",
      align: "left",
    },
    {
      id: "groups",
      label: "GRUPOS",
      type: "chipGroup",
      chipGroupKey: "name",
      chipGroupMaxVisible: 6,
      size: "xl"
    },
  ];

  // Row actions
  const actions: RowAction<Department>[] = [
    {
      id: "edit",
      label: "Editar",
      onClick: handleEditDepartment,
    },
    {
      id: "delete",
      label: "Eliminar",
      onClick: handleDeleteDepartment,
      color: "error",
    },
  ];

  return (
    <MainLayout>
      <HeaderContainer>
        <Title title="Departamentos" />
        <ControlsContainer>
          <SearchInput
            size="small"
            placeholder="Buscar"
            value={searchValue}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIconStyled />
                </InputAdornment>
              ),
            }}
          />
          <CreateButton
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateDepartment}
          >
            Nuevo
          </CreateButton>
        </ControlsContainer>
      </HeaderContainer>

      <TableCrud
        columns={columns}
        rows={departments}
        actions={actions}
        loading={loading}
        rowKey="id"
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={totalRows}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        emptyMessage="No hay departamentos registrados"
      />
    </MainLayout>
  );
}
