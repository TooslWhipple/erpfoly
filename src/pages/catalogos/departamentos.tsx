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
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { useDebouncedInput } from "@/hooks/useDebouncedValue";
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "@/services/departments.service";
import type { Department } from "@/services/departments.service";
import { useSnackbarStore } from "@/store/useSnackbarStore";

// Re-export types for consumers (e.g. detail page)
export type { Department } from "@/services/departments.service";
export type { ProductGroup } from "@/services/departments.service";

// ============================================================================
// HELPERS (affected items count for promotion info - can be replaced by API later)
// ============================================================================

async function getAffectedItemsCount(): Promise<number> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return Math.floor(Math.random() * 50) + 10;
}

const SEARCH_DEBOUNCE_MS = 300;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Departamentos() {
  const router = useRouter();

  const showSnackbar = useSnackbarStore((s) => s.showSuccess);
  const showError = useSnackbarStore((s) => s.showError);

  const {
    data: departments,
    total: totalRows,
    page,
    rowsPerPage,
    search: searchValue,
    setPage,
    setRowsPerPage,
    setSearch,
    isLoading: loading,
    refetch,
  } = usePaginatedList<Department>({
    queryKey: ["departments"],
    queryFn: getDepartments,
    initialPage: 0,
    initialRowsPerPage: 10,
    initialSearch: "",
  });

  const [searchInput, setSearchInput, debouncedSearch] = useDebouncedInput(
    searchValue,
    SEARCH_DEBOUNCE_MS,
  );

  useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [saving, setSaving] = useState(false);
  const [hasPromotion, setHasPromotion] = useState(false);
  const [affectedItemsCount, setAffectedItemsCount] = useState<number | null>(null);
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});

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
      getAffectedItemsCount().then(setAffectedItemsCount);
    } else {
      setAffectedItemsCount(null);
    }
  }, [hasPromotion, modalOpen, editingDepartment]);

  // Event handlers
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
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
      if (editingDepartment) {
        await updateDepartment(editingDepartment.id, {
          name: data.name as string,
          margin: Number(data.margin),
        });
      } else {
        await createDepartment({
          name: data.name as string,
          margin: Number(data.margin),
        });
      }
      handleCloseModal();
      refetch();
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
    setEditingDepartment(department);
    setHasPromotion(Boolean(department.promotion));
    setFormValues({});
    setModalOpen(true);
  };

  const handleDeleteDepartment = async (department: Department) => {
    const confirmed = window.confirm(
      `¿Estás seguro de eliminar el departamento "${department.name}"?`
    );
    if (!confirmed) return;

    try {
      await deleteDepartment(department.id);
      refetch();
      showSnackbar("Departamento desactivado correctamente.");
    } catch (err) {
      console.error("[Departamentos] Error deleting:", err);
      showError(
        err instanceof Error ? err.message : "Error al desactivar el departamento."
      );
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
            value={searchInput}
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
