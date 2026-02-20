import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import { InputAdornment, Box, Alert } from "@mui/material";
import { Add as AddIcon, Visibility as VisibilityIcon, Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { MainLayout, Title, TableCrud, ModalForm } from "@/components";
import type { Column, RowAction } from "@/components/TableCrud";
import type { FormFieldConfig } from "@/components/Form";
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

export interface ProductGroup {
  id: string;
  name: string;
  promotion?: {
    percentage: number;
    startDate: string;
    endDate: string;
  };
}

export interface Department {
  id: number;
  name: string;
  margin: number;
  groups: ProductGroup[];
  promotion?: {
    percentage: number;
    startDate: string;
    endDate: string;
  };
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

async function updateDepartment(
  id: number,
  data: Omit<Department, "id">
): Promise<Department> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const updatedDepartment: Department = {
    id,
    ...data,
  };
  console.log("[API] Updated department:", updatedDepartment);
  return updatedDepartment;
}

// Mock function to get affected items count
async function getAffectedItemsCount(departmentId?: number): Promise<number> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  // Simulate different counts based on department
  if (departmentId === 1) return 43;
  if (departmentId === 2) return 28;
  return Math.floor(Math.random() * 50) + 10;
}

async function deleteDepartment(id: number): Promise<{ success: boolean }> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  console.log("[API] Deleted department:", id);
  return { success: true };
}

export async function getDepartmentById(id: number): Promise<Department | null> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return DUMMY_DEPARTMENTS.find((d) => d.id === id) ?? null;
}

export { deleteDepartment, updateDepartment, createDepartment };
export type { GetDepartmentsParams, GetDepartmentsResponse };

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Departamentos() {
  const router = useRouter();

  // State management
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [saving, setSaving] = useState(false);
  const [hasPromotion, setHasPromotion] = useState(false);
  const [affectedItemsCount, setAffectedItemsCount] = useState<number | null>(null);
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});

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

  // Calculate next available ID for new departments
  const getNextId = useCallback(() => {
    if (departments.length === 0) return "01";
    const maxId = Math.max(...departments.map((d) => d.id));
    return String(maxId + 1).padStart(2, "0");
  }, [departments]);

  // Form fields configuration with conditional promotion fields
  const departmentFormFields: FormFieldConfig[] = useMemo(() => {
    const baseFields: FormFieldConfig[] = [
      {
        name: "id",
        label: "ID",
        type: "text",
        disabled: true,
        defaultValue: editingDepartment ? String(editingDepartment.id).padStart(2, "0") : getNextId(),
      },
      {
        name: "name",
        label: "Nombre de la categoría",
        type: "text",
        placeholder: "Ej. Línea blanca",
        validation: {
          required: true,
          minLength: 2,
          maxLength: 100,
        },
        autoFocus: true,
      },
      {
        name: "margin",
        label: "Margen",
        type: "number",
        placeholder: "32",
        validation: {
          required: true,
          min: 0,
          max: 100,
        },
        helperText: "Porcentaje de margen (0-100)",
      },
      {
        name: "hasPromotion",
        label: "Agregar promoción para éste departamento",
        type: "switch",
        defaultValue: false,
      },
    ];

    // Add promotion fields conditionally
    if (hasPromotion) {
      baseFields.push(
        {
          name: "promotionPercentage",
          label: "Promoción",
          type: "number",
          placeholder: "32",
          validation: {
            required: true,
            min: 0,
            max: 100,
          },
          helperText: "Porcentaje de descuento (0-100)",
        },
        {
          name: "promotionStartDate",
          label: "Fecha de inicio",
          type: "date",
          validation: {
            required: true,
          },
        },
        {
          name: "promotionEndDate",
          label: "Fecha fin",
          type: "date",
          validation: {
            required: true,
            custom: (value, allValues) => {
              const startDate = allValues.promotionStartDate as string | undefined;
              const endDate = value as string | undefined;
              if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
                return "La fecha fin debe ser posterior a la fecha de inicio";
              }
              return undefined;
            },
          },
        }
      );
    }

    return baseFields;
  }, [hasPromotion, editingDepartment, getNextId]);

  // Load affected items count when promotion is enabled
  useEffect(() => {
    if (hasPromotion && modalOpen) {
      getAffectedItemsCount(editingDepartment?.id).then(setAffectedItemsCount);
    } else {
      setAffectedItemsCount(null);
    }
  }, [hasPromotion, modalOpen, editingDepartment]);

  // Event handlers
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };

  const handleOpenCreateModal = () => {
    setEditingDepartment(null);
    setHasPromotion(false);
    setAffectedItemsCount(null);
    setFormValues({});
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingDepartment(null);
    setHasPromotion(false);
    setAffectedItemsCount(null);
    setFormValues({});
  };

  const handleSaveDepartment = async (data: Record<string, unknown>) => {
    setSaving(true);
    try {
      const departmentData: Omit<Department, "id"> = {
        name: data.name as string,
        margin: Number(data.margin),
        groups: editingDepartment?.groups || [],
      };

      if (data.hasPromotion && data.promotionPercentage && data.promotionStartDate && data.promotionEndDate) {
        departmentData.promotion = {
          percentage: Number(data.promotionPercentage),
          startDate: data.promotionStartDate as string,
          endDate: data.promotionEndDate as string,
        };
      }

      if (editingDepartment) {
        await updateDepartment(editingDepartment.id, departmentData);
      } else {
        await createDepartment(departmentData);
      }
      handleCloseModal();
      fetchDepartments();
    } catch (err) {
      console.error("[Departamentos] Error saving:", err);
    } finally {
      setSaving(false);
    }
  };

  // Handle form value changes to update promotion toggle and preserve values
  const handleFormValuesChange = useCallback((values: Record<string, unknown>) => {
    // Preserve form values
    setFormValues(values);
    
    // Update promotion toggle state
    const promotionEnabled = Boolean(values.hasPromotion);
    if (promotionEnabled !== hasPromotion) {
      setHasPromotion(promotionEnabled);
    }
  }, [hasPromotion]);

  const handleViewDetail = (department: Department) => {
    router.push(`/catalogos/departamentos/${department.id}`);
  };

  const handleEditDepartment = (department: Department) => {
    router.push(`/catalogos/departamentos/${department.id}`);
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

  // Row actions (detail from row click or menu; edit goes to detail page; delete from list)
  const actions: RowAction<Department>[] = [
    {
      id: "view",
      label: "Ver detalle",
      icon: <VisibilityIcon fontSize="small" />,
      onClick: handleViewDetail,
    },
    {
      id: "edit",
      label: "Editar",
      icon: <EditIcon fontSize="small" />,
      onClick: handleEditDepartment,
    },
    {
      id: "delete",
      label: "Eliminar",
      icon: <DeleteIcon fontSize="small" />,
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
            onClick={handleOpenCreateModal}
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
        onRowClick={handleViewDetail}
        emptyMessage="No hay departamentos registrados"
      />

      {/* Create/Edit Department Modal */}
      <ModalForm
        open={modalOpen}
        onClose={handleCloseModal}
        title={editingDepartment ? "Editar departamento" : "Nuevo departamento"}
        fields={departmentFormFields}
        onConfirm={handleSaveDepartment}
        loading={saving}
        initialValues={
          Object.keys(formValues).length > 0
            ? formValues
            : editingDepartment
            ? {
                id: String(editingDepartment.id).padStart(2, "0"),
                name: editingDepartment.name,
                margin: editingDepartment.margin,
                hasPromotion: Boolean(editingDepartment.promotion),
                promotionPercentage: editingDepartment.promotion?.percentage,
                promotionStartDate: editingDepartment.promotion?.startDate,
                promotionEndDate: editingDepartment.promotion?.endDate,
              }
            : {
                id: getNextId(),
                hasPromotion: false,
              }
        }
        confirmLabel={editingDepartment ? "Guardar" : "Crear"}
        cancelLabel="Cancelar"
        maxWidth="sm"
        onValuesChange={handleFormValuesChange}
      >
        {/* Promotion info message */}
        {hasPromotion && affectedItemsCount !== null && (
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ borderRadius: 1 }}>
              {affectedItemsCount} artículos serán afectados con esta promoción.
            </Alert>
          </Box>
        )}
      </ModalForm>
    </MainLayout>
  );
}
