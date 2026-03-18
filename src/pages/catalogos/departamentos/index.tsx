import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import { Box, Alert, Stack } from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
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
import { defineFormFields, messages, schemas } from "@/forms";
import { z } from "zod";

export type { Department } from "@/services/departments.service";
export type { ProductGroup } from "@/services/departments.service";

async function getAffectedItemsCount(): Promise<number> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return Math.floor(Math.random() * 50) + 10;
}

const SEARCH_DEBOUNCE_MS = 300;

type DepartmentModalFormValues = {
  id: string;
  name: string;
  margin: string;
  hasPromotion: boolean;
  promotionPercentage: string;
  promotionStartDate: string;
  promotionEndDate: string;
};

const marginSchema = z
  .string()
  .min(1, messages.required)
  .refine((s) => {
    const n = Number(s);
    return !Number.isNaN(n) && n >= 0 && n <= 100;
  }, "Margin must be between 0 and 100");

const departmentModalFields = defineFormFields<DepartmentModalFormValues>()([
  {
    name: "id",
    schema: z.string(),
    label: "ID",
    type: "text",
    slotProps: { input: { readOnly: true } },
  },
  {
    name: "name",
    schema: schemas.stringRange(2, 100),
    label: "Nombre de la categoría",
    type: "text",
    placeholder: "Ej. Línea blanca",
  },
  {
    name: "margin",
    schema: marginSchema,
    label: "Margen",
    type: "number",
    placeholder: "32",
    helperText: "Porcentaje de margen (0-100)",
  },
  {
    name: "hasPromotion",
    schema: z.boolean(),
    label: "Agregar promoción para éste departamento",
    type: "switch",
  },
  {
    name: "promotionPercentage",
    schema: z.string(),
    label: "Promoción",
    type: "number",
    placeholder: "32",
    helperText: "Porcentaje de descuento (0-100)",
    visibleWhen: { field: "hasPromotion", equals: true },
  },
  {
    name: "promotionStartDate",
    schema: z.string(),
    label: "Fecha de inicio",
    type: "date",
    visibleWhen: { field: "hasPromotion", equals: true },
  },
  {
    name: "promotionEndDate",
    schema: z.string(),
    label: "Fecha fin",
    type: "date",
    visibleWhen: { field: "hasPromotion", equals: true },
  },
] as const);

function AffectedPromotionBanner({ enabled }: { enabled: boolean }) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      setCount(null);
      return;
    }
    let cancelled = false;
    getAffectedItemsCount().then((n) => {
      if (!cancelled) setCount(n);
    });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  if (!enabled || count === null) return null;
  return (
    <Box sx={{ mt: 2 }}>
      <Alert severity="info" sx={{ borderRadius: 1 }}>
        {count} artículos serán afectados con esta promoción.
      </Alert>
    </Box>
  );
}

function validatePromotionBlock(data: DepartmentModalFormValues, showError: (m: string) => void) {
  if (!data.hasPromotion) return true;
  const pct = String(data.promotionPercentage ?? "").trim();
  const n = Number(pct);
  if (!pct || Number.isNaN(n) || n < 0 || n > 100) {
    showError("Indica un porcentaje de promoción válido (0-100).");
    return false;
  }
  const start = data.promotionStartDate?.trim();
  const end = data.promotionEndDate?.trim();
  if (!start || !end) {
    showError("Las fechas de promoción son obligatorias.");
    return false;
  }
  if (new Date(end) < new Date(start)) {
    showError("La fecha fin debe ser posterior a la fecha de inicio.");
    return false;
  }
  return true;
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

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
  };

  const handleOpenCreateModal = () => {
    setEditingDepartment(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingDepartment(null);
  };

  const handleSaveDepartment = async (data: DepartmentModalFormValues) => {
    if (!validatePromotionBlock(data, showError)) return;

    setSaving(true);
    if (editingDepartment) {
      const result = await updateDepartment(editingDepartment.id, {
        name: data.name,
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
        name: data.name,
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

  const departmentDefaultValues = useMemo((): DepartmentModalFormValues => {
    if (editingDepartment) {
      return {
        id: String(editingDepartment.id).padStart(2, "0"),
        name: editingDepartment.name,
        margin: String(editingDepartment.margin),
        hasPromotion: Boolean(editingDepartment.promotion),
        promotionPercentage:
          editingDepartment.promotion?.percentage != null
            ? String(editingDepartment.promotion.percentage)
            : "",
        promotionStartDate: editingDepartment.promotion?.startDate ?? "",
        promotionEndDate: editingDepartment.promotion?.endDate ?? "",
      };
    }
    return {
      id: getNextId(),
      name: "",
      margin: "",
      hasPromotion: false,
      promotionPercentage: "",
      promotionStartDate: "",
      promotionEndDate: "",
    };
  }, [editingDepartment, getNextId]);

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
        fields={departmentModalFields}
        defaultValues={departmentDefaultValues}
        onSubmit={handleSaveDepartment}
        loading={saving}
        confirmLabel={editingDepartment ? "Guardar" : "Crear"}
        maxWidth="sm"
      >
        {(values) => (
          <AffectedPromotionBanner enabled={Boolean(values.hasPromotion)} />
        )}
      </ModalFormZod>
    </MainLayout>
  );
}
