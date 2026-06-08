import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import { Stack } from "@mui/material";
import { Visibility as VisibilityIcon, Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { MainLayout, Title, TableCrud, ModalFormZod, TabFilters } from "@/components";
import type { Column, RowAction } from "@/components/TableCrud";
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
import {
  CATALOG_DEPARTMENTS_CREATE,
  CATALOG_DEPARTMENTS_DELETE,
  CATALOG_DEPARTMENTS_READ,
  CATALOG_DEPARTMENTS_UPDATE,
} from "@/lib/permissions";
import {
  defineFormFields,
  schemas,
  type SchemaInputFromFields,
  type SchemaOutputFromFields,
} from "@/forms";
import { messages } from "@/forms/validation/messages";
import { z } from "zod";

export type { Department } from "@/services/departments.service";
export type { ProductGroup } from "@/services/departments.service";

const SEARCH_DEBOUNCE_MS = 300;

type DepartmentFormShape = {
  id: string;
  name: string;
  margin: string;
};

const departmentFormFields = defineFormFields<DepartmentFormShape>()([
  {
    name: "id",
    schema: z.string(),
    label: "ID",
    type: "text",
    disabled: true,
  },
  {
    name: "name",
    schema: schemas
      .requiredString(2, "El nombre es requerido")
      .max(100, messages.string.max(100)),
    label: "Nombre de la categoría",
    type: "text",
    placeholder: "Ej. Línea blanca",
  },
  {
    name: "margin",
    schema: z
      .string()
      .min(1, "El margen es requerido")
      .refine(
        (s) => s.trim() !== "" && !Number.isNaN(Number(s)) && /^-?\d*\.?\d*$/.test(s),
        "Debe ser un número válido",
      )
      .transform((s) => Number(s))
      .pipe(z.number().min(0, messages.number.min(0)).max(100, messages.number.max(100))),
    label: "Margen",
    type: "number",
    placeholder: "32",
    helperText: "Porcentaje de margen (0-100)",
  },
] as const);

type DepartmentFormOutput = SchemaOutputFromFields<typeof departmentFormFields>;

function buildDepartmentFormDefaultValues(
  editing: Department | null,
  nextId: string,
): SchemaInputFromFields<typeof departmentFormFields> {
  if (editing) {
    return {
      id: String(editing.id).padStart(2, "0"),
      name: editing.name,
      margin: String(editing.margin),
    };
  }
  return {
    id: nextId,
    name: "",
    margin: "",
  };
}

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

  const getNextId = useCallback(() => {
    if (departments.length === 0) return "01";
    const maxId = Math.max(...departments.map((d) => d.id));
    return String(maxId + 1).padStart(2, "0");
  }, [departments]);

  const departmentModalDefaultValues = useMemo(
    () => buildDepartmentFormDefaultValues(editingDepartment, getNextId()),
    [editingDepartment, getNextId],
  );

  const handleOpenCreateModal = () => {
    setEditingDepartment(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingDepartment(null);
  };

  const handleSaveDepartment = async (data: DepartmentFormOutput) => {
    setSaving(true);
    if (editingDepartment) {
      const result = await updateDepartment(editingDepartment.id, {
        name: data.name,
        margin: data.margin,
      });
      if (result.error) {
        setSaving(false);
        console.error("[Departamentos] Error saving:", result.error.message);
        showError(result.error.message);
        return;
      }
    } else {
      const result = await createDepartment({
        name: data.name,
        margin: data.margin,
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

  const handleViewDetail = (department: Department) => {
    router.push(`/catalogos/departamentos/${department.id}`);
  };

  const handleEditDepartment = (department: Department) => {
    setEditingDepartment(department);
    setModalOpen(true);
  };

  const handleDeleteDepartment = async (department: Department) => {
    const confirmed = window.confirm(
      `¿Estás seguro de eliminar el departamento "${department.name}"?`,
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
      size: "xl",
    },
  ];

  const actions: RowAction<Department>[] = [
    {
      id: "view",
      label: "Ver detalle",
      icon: <VisibilityIcon fontSize="small" />,
      onClick: handleViewDetail,
      permission: CATALOG_DEPARTMENTS_READ,
    },
    {
      id: "edit",
      label: "Editar",
      icon: <EditIcon fontSize="small" />,
      onClick: handleEditDepartment,
      permission: CATALOG_DEPARTMENTS_UPDATE,
    },
    {
      id: "delete",
      label: "Eliminar",
      icon: <DeleteIcon fontSize="small" />,
      onClick: handleDeleteDepartment,
      color: "error",
      permission: CATALOG_DEPARTMENTS_DELETE,
    },
  ];

  return (
    <MainLayout>
      <Stack direction="column" spacing={3}>
        <Title title="Departamentos" />

        <TabFilters
          tabs={[]}
          activeTab={""}
          onTabChange={() => {}}
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
              permission: CATALOG_DEPARTMENTS_CREATE,
            },
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

      <ModalFormZod
        key={editingDepartment?.id ?? "new"}
        open={modalOpen}
        onClose={handleCloseModal}
        title={editingDepartment ? "Editar departamento" : "Nuevo departamento"}
        fields={departmentFormFields}
        defaultValues={departmentModalDefaultValues}
        onSubmit={handleSaveDepartment}
        loading={saving}
        confirmLabel={editingDepartment ? "Guardar" : "Crear"}
        maxWidth="sm"
        fullWidth
        validateOn="change"
      />
    </MainLayout>
  );
}
