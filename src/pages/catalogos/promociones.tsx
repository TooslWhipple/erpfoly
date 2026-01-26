import { useState, useEffect, useCallback } from "react";
import { InputAdornment } from "@mui/material";
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { MainLayout, Title, TableCrud, FilterMenu } from "@/components";
import type { Column, RowAction } from "@/components/TableCrud";
import type { FilterOption } from "@/components/FilterMenu";
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

export type PromotionType = "Crédito" | "Contado" | "Apartados";

export interface Promotion {
  id: number;
  name: string;
  margin: number;
  type: PromotionType;
  startDate: string;
  endDate: string | null;
  departments: string[] | "Todos";
  groups: string[] | "Todos";
  branches: string[] | "Todas";
}

interface GetPromotionsParams {
  page: number;
  limit: number;
  search?: string;
  branchFilter?: (string | number)[];
  departmentFilter?: (string | number)[];
}

interface GetPromotionsResponse {
  data: Promotion[];
  total: number;
  page: number;
  limit: number;
}

// ============================================================================
// MOCK DATA - Promotions for e-commerce platform
// ============================================================================

const DUMMY_PROMOTIONS: Promotion[] = [
  {
    id: 1,
    name: "Crédito permanente",
    margin: 5,
    type: "Crédito",
    startDate: "2025-09-01",
    endDate: null,
    departments: "Todos",
    groups: "Todos",
    branches: "Todas",
  },
  {
    id: 2,
    name: "Mes de línea blanca",
    margin: 32,
    type: "Crédito",
    startDate: "2025-09-01",
    endDate: "2025-09-30",
    departments: ["Línea blanca"],
    groups: ["Grupo 1", "Grupo 2", "Grupo 3", "Grupo 4", "Grupo 5", "Grupo 6", "Grupo 7"],
    branches: "Todas",
  },
  {
    id: 3,
    name: "Buen fin 2024",
    margin: 25,
    type: "Contado",
    startDate: "2025-11-13",
    endDate: "2025-11-17",
    departments: "Todos",
    groups: "Todos",
    branches: "Todas",
  },
  {
    id: 4,
    name: "Black Friday 2024",
    margin: 20,
    type: "Crédito",
    startDate: "2025-11-28",
    endDate: "2025-11-28",
    departments: "Todos",
    groups: "Todos",
    branches: "Todas",
  },
  {
    id: 5,
    name: "Día de las madres",
    margin: 29,
    type: "Contado",
    startDate: "2025-09-01",
    endDate: "2025-09-30",
    departments: ["Electrodomésticos", "Línea blanca", "Electrónica"],
    groups: ["Grupo 1", "Grupo 2", "Grupo 3", "Grupo 4", "Grupo 5", "Grupo 6", "Grupo 7"],
    branches: "Todas",
  },
  {
    id: 6,
    name: "Aniversario Foly",
    margin: 29,
    type: "Contado",
    startDate: "2025-09-01",
    endDate: "2025-09-30",
    departments: "Todos",
    groups: ["Grupo 1", "Grupo 2", "Grupo 3", "Grupo 4", "Grupo 5", "Grupo 6", "Grupo 7"],
    branches: "Todas",
  },
  {
    id: 7,
    name: "Día del padre",
    margin: 29,
    type: "Contado",
    startDate: "2025-09-01",
    endDate: "2025-09-30",
    departments: "Todos",
    groups: ["Grupo 1", "Grupo 2", "Grupo 3", "Grupo 4", "Grupo 5", "Grupo 6", "Grupo 7"],
    branches: "Todas",
  },
  {
    id: 8,
    name: "Temporada de calor",
    margin: 29,
    type: "Apartados",
    startDate: "2025-09-01",
    endDate: "2025-09-30",
    departments: ["Aire acondicionado"],
    groups: ["Minisplits"],
    branches: "Todas",
  },
];

// ============================================================================
// MOCK API FUNCTIONS
// ============================================================================

async function getPromotions(params: GetPromotionsParams): Promise<GetPromotionsResponse> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  let filteredData = [...DUMMY_PROMOTIONS];

  // Filter by search (name)
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filteredData = filteredData.filter((p) =>
      p.name.toLowerCase().includes(searchLower)
    );
  }

  // Filter by branch (mock - would filter by branchFilter in real implementation)
  if (params.branchFilter && params.branchFilter.length > 0 && !params.branchFilter.includes("all")) {
    // In real implementation, this would filter by specific branches
    // For now, we keep all data
  }

  // Filter by department (mock - would filter by departmentFilter in real implementation)
  if (params.departmentFilter && params.departmentFilter.length > 0 && !params.departmentFilter.includes("all")) {
    // In real implementation, this would filter by specific departments
    // For now, we keep all data
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

async function deletePromotion(id: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  // In real implementation, this would call the API to delete
  console.log(`[Promociones] Deleting promotion with id: ${id}`);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = date.toLocaleDateString("es-MX", { month: "short" });
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatDepartments = (departments: string[] | "Todos"): string => {
  if (departments === "Todos") return "Todos";
  if (departments.length === 1) return departments[0];
  return `${departments.length} dptos`;
};

const formatGroups = (groups: string[] | "Todos"): string => {
  if (groups === "Todos") return "Todos";
  if (groups.length === 1) return groups[0];
  return `${groups.length} grupos`;
};

const formatBranches = (branches: string[] | "Todas"): string => {
  if (branches === "Todas") return "Todas";
  if (branches.length === 1) return branches[0];
  return `${branches.length} sucursales`;
};

// ============================================================================
// MOCK FILTER DATA
// ============================================================================

const BRANCH_OPTIONS: FilterOption[] = [
  { id: "all", label: "Todas" },
  { id: "matriz", label: "Matriz" },
  { id: "campestre", label: "Campestre" },
  { id: "estacion", label: "Estación" },
  { id: "matamoros-pedro-cardenas", label: "Matamoros-Pedro Cárdenas" },
  { id: "matamoros-plaza-patio", label: "Matamoros-Plaza Patio" },
  { id: "matamoros-brisas", label: "Matamoros-Brisas" },
  { id: "reynosa-av-hidalgo", label: "Reynosa-Av. Hidalgo" },
];

const DEPARTMENT_OPTIONS: FilterOption[] = [
  { id: "all", label: "Todos" },
  { id: "muebles", label: "Muebles" },
  { id: "colchones", label: "Colchones" },
  { id: "linea-infantil", label: "Línea Infantil" },
  { id: "muebles-tubulares", label: "Muebles Tubulares" },
  { id: "cocinetas", label: "Cocinetas" },
  { id: "ventiladores-climas", label: "Ventiladores / Climas" },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Promociones() {
  // State management
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [selectedBranches, setSelectedBranches] = useState<(string | number)[]>(["all"]);
  const [selectedDepartments, setSelectedDepartments] = useState<(string | number)[]>(["all"]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);

  // Fetch promotions
  const fetchPromotions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getPromotions({
        page,
        limit: rowsPerPage,
        search: searchValue || undefined,
        branchFilter: selectedBranches.length > 0 ? selectedBranches : undefined,
        departmentFilter: selectedDepartments.length > 0 ? selectedDepartments : undefined,
      });
      setPromotions(response.data);
      setTotalRows(response.total);
    } catch (err) {
      console.error("[Promociones] Error fetching:", err);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchValue, selectedBranches, selectedDepartments]);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  useEffect(() => {
    setPage(0);
  }, [searchValue, selectedBranches, selectedDepartments]);

  // Event handlers
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };

  const handleCreatePromotion = () => {
    // TODO: Implement form modal/page
    console.log("[Promociones] Create promotion clicked");
  };

  const handleViewDetails = (promotion: Promotion) => {
    // TODO: Implement details view
    console.log("[Promociones] View details for:", promotion);
  };

  const handleEditPromotion = (promotion: Promotion) => {
    // TODO: Navigate to edit page or open edit modal
    console.log("[Promociones] Edit promotion:", promotion);
  };

  const handleDeletePromotion = async (promotion: Promotion) => {
    if (window.confirm(`¿Estás seguro de eliminar la promoción "${promotion.name}"?`)) {
      try {
        await deletePromotion(promotion.id);
        // Refresh list
        fetchPromotions();
      } catch (err) {
        console.error("[Promociones] Error deleting:", err);
        alert("Error al eliminar la promoción");
      }
    }
  };

  const handleBranchFilterChange = (selectedIds: (string | number)[]) => {
    setSelectedBranches(selectedIds);
  };

  const handleDepartmentFilterChange = (selectedIds: (string | number)[]) => {
    setSelectedDepartments(selectedIds);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  // Table columns
  const columns: Column<Promotion>[] = [
    {
      id: "id",
      label: "ID",
      type: "id",
      size: "sm",
      maxSize: "xs",
      idPadding: 2,
    },
    {
      id: "name",
      label: "Nombre",
      size: "xl",
    },
    {
      id: "margin",
      label: "Margen",
      type: "percentage",
      size: "sm",
      align: "left",
    },
    {
      id: "type",
      label: "Tipo",
      size: "md",
      type: "chip",
      chipConfig: {
        Crédito: {
          bgColor: "#E0F2FE",
          textColor: "#0369A1",
        },
        Contado: {
          bgColor: "#F0FDF4",
          textColor: "#166534",
        },
        Apartados: {
          bgColor: "#FEF3C7",
          textColor: "#92400E",
        },
      },
    },
    {
      id: "startDate",
      label: "Inicio",
      type: "date",
      size: "md",
      format: (value) => formatDate(String(value)),
    },
    {
      id: "endDate",
      label: "Fin",
      size: "md",
      format: (value, row) => {
        if (!value || value === "null") return "Sin fecha fin";
        return formatDate(String(value));
      },
    },
    {
      id: "departments",
      label: "Departamentos",
      size: "lg",
      format: (value) => formatDepartments(value as string[] | "Todos"),
    },
    {
      id: "groups",
      label: "Grupos",
      size: "lg",
      format: (value) => formatGroups(value as string[] | "Todos"),
    },
    {
      id: "branches",
      label: "Sucursales",
      size: "lg",
      format: (value) => formatBranches(value as string[] | "Todas"),
    },
  ];

  // Row actions (for menu)
  const actions: RowAction<Promotion>[] = [
    {
      id: "view",
      label: "Ver detalles",
      icon: <VisibilityIcon fontSize="small" />,
      onClick: handleViewDetails,
    },
    {
      id: "edit",
      label: "Editar",
      icon: <EditIcon fontSize="small" />,
      onClick: handleEditPromotion,
    },
    {
      id: "delete",
      label: "Eliminar",
      icon: <DeleteIcon fontSize="small" />,
      onClick: handleDeletePromotion,
      color: "error",
    },
  ];

  return (
    <MainLayout>
      <HeaderContainer>
        <Title title="Promociones" />
        <ControlsContainer>
          <FilterMenu
            label="sucursales"
            title="Sucursales"
            options={BRANCH_OPTIONS.filter((opt) => opt.id !== "all")}
            selectedIds={selectedBranches}
            onChange={handleBranchFilterChange}
            allOptionId="all"
            allOptionLabel="Todas"
          />
          <FilterMenu
            label="departamentos"
            title="Departamentos"
            options={DEPARTMENT_OPTIONS.filter((opt) => opt.id !== "all")}
            selectedIds={selectedDepartments}
            onChange={handleDepartmentFilterChange}
            allOptionId="all"
            allOptionLabel="Todos"
          />
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
            onClick={handleCreatePromotion}
          >
            Nuevo
          </CreateButton>
        </ControlsContainer>
      </HeaderContainer>

      <TableCrud
        columns={columns}
        rows={promotions}
        actions={actions}
        loading={loading}
        rowKey="id"
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={totalRows}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        emptyMessage="No hay promociones registradas"
      />
    </MainLayout>
  );
}
