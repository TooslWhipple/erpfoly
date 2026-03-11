import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import { Box, Alert, Stack } from "@mui/material";
import { Visibility as VisibilityIcon, Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { MainLayout, Title, TableCrud, ModalForm, TabFilters } from "@/components";
import type { Column, RowAction } from "@/components/TableCrud";
import type { FormFieldConfig } from "@/components/Form";
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

export type { Department } from "@/services/departments.service";
export type { ProductGroup } from "@/services/departments.service";

async function getAffectedItemsCount(): Promise<number> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return Math.floor(Math.random() * 50) + 10;
}

const SEARCH_DEBOUNCE_MS = 300;

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

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [saving, setSaving] = useState(false);
  const [hasPromotion, setHasPromotion] = useState(false);
  const [affectedItemsCount, setAffectedItemsCount] = useState<number | null>(null);
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});

  const getNextId = useCallback(() => {
    if (departments.length === 0) return "01";
    const maxId = Math.max(...departments.map((d) => d.id));
    return String(maxId + 1).padStart(2, "0");
  }, [departments]);

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

  useEffect(() => {
    if (hasPromotion && modalOpen) {
      getAffectedItemsCount().then(setAffectedItemsCount);
    } else {
      queueMicrotask(() => setAffectedItemsCount(null));
    }
  }, [hasPromotion, modalOpen, editingDepartment]);

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
    if (editingDepartment) {
      const result = await updateDepartment(editingDepartment.id, {
        name: data.name as string,
        margin: Number(data.margin),
      });
      if (result.error) {
        setSaving(false);
        console.error("[Departamentos] Error saving:", result.error.message);
        showError(result.error.message);
        return;
      }
    } else {
      const result = await createDepartment({
        name: data.name as string,
        margin: Number(data.margin),
      });
      if (result.error) {
        setSaving(false);
        console.error("[Departamentos] Error saving:", result.error.message);
        showError(result.error.message);
        return;
      }
    }
    setSaving(false);
    handleCloseModal();
    refetch();
  };

  const handleFormValuesChange = useCallback((values: Record<string, unknown>) => {
    setFormValues(values);

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

    const result = await deleteDepartment(department.id);
    if (result.error) {
      console.error("[Departamentos] Error deleting:", result.error.message);
      showError(result.error.message);
      return;
    }
    refetch();
    showSnackbar("Departamento desactivado correctamente.");
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

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
      label: "Nombre",
      size: "sm",
    },
    {
      id: "margin",
      label: "Margen",
      size: "xs",
      type: "percentage",
      align: "left",
    },
    {
      id: "groups",
      label: "Lineas",
      type: "chipGroup",
      chipGroupKey: "name",
      chipGroupMaxVisible: 6,
      size: "xl"
    },
  ];

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
      <Stack direction="column" spacing={3}>
        <Title title="Departamentos" />

        <TabFilters
          tabs={[]}
          activeTab={''}
          onTabChange={() => { }}
          showSearch
          searchValue={searchInput}
          onSearchChange={(value) => setSearchInput(value)}
          searchPlaceholder="Buscar"
          actions={[
            {
              label: "Nuevo",
              onClick: handleOpenCreateModal,
              variant: "contained",
              color: "primary",
            }
          ]}
        />

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
      </Stack>

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
