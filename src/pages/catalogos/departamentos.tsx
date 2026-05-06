import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import { Box, Alert, Stack } from "@mui/material";
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
  type OriginPromotionPayload,
} from "@/services/departments.service";
import type { Department } from "@/services/departments.service";
import { useSnackbarStore } from "@/store/useSnackbarStore";
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

async function getAffectedItemsCount(): Promise<number> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return Math.floor(Math.random() * 50) + 10;
}

const SEARCH_DEBOUNCE_MS = 300;

type DepartmentFormShape = {
  id: string;
  name: string;
  margin: string;
  hasPromotion: boolean;
  promotionPercentage: string;
  promotionStartDate: string;
  promotionEndDate: string;
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
  {
    name: "hasPromotion",
    schema: z.boolean(),
    label: "Agregar Promoción para éste departamento",
    type: "switch",
  },
  {
    name: "promotionPercentage",
    schema: z.string(),
    label: "Promoción",
    type: "number",
    placeholder: "32",
    helperText: "Porcentaje de descuento (0-100)",
    when: (v) => Boolean(v.hasPromotion),
  },
  {
    name: "promotionStartDate",
    schema: z.string(),
    label: "Fecha de inicio",
    type: "date",
    when: (v) => Boolean(v.hasPromotion),
  },
  {
    name: "promotionEndDate",
    schema: z.string(),
    label: "Fecha fin",
    type: "date",
    when: (v) => Boolean(v.hasPromotion),
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
      hasPromotion: Boolean(editing.promotion),
      promotionPercentage:
        editing.promotion?.percentage != null ? String(editing.promotion.percentage) : "",
      promotionStartDate: editing.promotion?.startDate ?? "",
      promotionEndDate: editing.promotion?.endDate ?? "",
    };
  }
  return {
    id: nextId,
    name: "",
    margin: "",
    hasPromotion: false,
    promotionPercentage: "",
    promotionStartDate: "",
    promotionEndDate: "",
  };
}

function departmentModalSchemaSuperRefine(
  data: DepartmentFormOutput,
  ctx: z.RefinementCtx,
): void {
  if (!data.hasPromotion) return;

  const pctRaw = data.promotionPercentage?.trim() ?? "";
  if (pctRaw === "" || Number.isNaN(Number(pctRaw))) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "El porcentaje de promoción es requerido",
      path: ["promotionPercentage"],
    });
  } else {
    const n = Number(pctRaw);
    if (n < 0 || n > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El porcentaje debe estar entre 0 y 100",
        path: ["promotionPercentage"],
      });
    }
  }

  const start = data.promotionStartDate?.trim() ?? "";
  const end = data.promotionEndDate?.trim() ?? "";
  if (!start) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La fecha de inicio es requerida",
      path: ["promotionStartDate"],
    });
  }
  if (!end) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La fecha fin es requerida",
      path: ["promotionEndDate"],
    });
  }
  if (start && end && new Date(end) < new Date(start)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La fecha fin debe ser posterior a la fecha de inicio",
      path: ["promotionEndDate"],
    });
  }
}

function buildOriginPromotionPayload(
  data: DepartmentFormOutput,
): OriginPromotionPayload | undefined {
  if (!data.hasPromotion) {
    return undefined;
  }

  return {
    discount_rate: Number(data.promotionPercentage),
    start_date: data.promotionStartDate,
    end_date: data.promotionEndDate || null,
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
  const [hasPromotion, setHasPromotion] = useState(false);
  const [affectedItemsCount, setAffectedItemsCount] = useState<number | null>(null);

  const getNextId = useCallback(() => {
    if (departments.length === 0) return "01";
    const maxId = Math.max(...departments.map((d) => d.id));
    return String(maxId + 1).padStart(2, "0");
  }, [departments]);

  const departmentModalDefaultValues = useMemo(
    () => buildDepartmentFormDefaultValues(editingDepartment, getNextId()),
    [editingDepartment, getNextId],
  );

  useEffect(() => {
    if (hasPromotion && modalOpen) {
      void getAffectedItemsCount().then(setAffectedItemsCount);
    } else {
      queueMicrotask(() => setAffectedItemsCount(null));
    }
  }, [hasPromotion, modalOpen, editingDepartment]);

  const handleOpenCreateModal = () => {
    setEditingDepartment(null);
    setHasPromotion(false);
    setAffectedItemsCount(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingDepartment(null);
    setHasPromotion(false);
    setAffectedItemsCount(null);
  };

  const handleSaveDepartment = async (data: DepartmentFormOutput) => {
    const promotion = buildOriginPromotionPayload(data);

    setSaving(true);
    if (editingDepartment) {
      const removePromotion = Boolean(editingDepartment.promotion) && !data.hasPromotion;
      const result = await updateDepartment(editingDepartment.id, {
        name: data.name,
        margin: data.margin,
        promotion,
        removePromotion,
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
        promotion,
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

  const handleModalValuesChange = useCallback((values: Record<string, unknown>) => {
    setHasPromotion(Boolean(values.hasPromotion));
  }, []);

  const handleViewDetail = (department: Department) => {
    router.push(`/catalogos/departamentos/${department.id}`);
  };

  const handleEditDepartment = (department: Department) => {
    setEditingDepartment(department);
    setHasPromotion(Boolean(department.promotion));
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
        fields={departmentFormFields}
        defaultValues={departmentModalDefaultValues}
        onSubmit={handleSaveDepartment}
        loading={saving}
        confirmLabel={editingDepartment ? "Guardar" : "Crear"}
        maxWidth="sm"
        fullWidth
        validateOn="change"
        onValuesChange={handleModalValuesChange}
        schemaSuperRefine={departmentModalSchemaSuperRefine}
      >
        {hasPromotion && affectedItemsCount !== null && (
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ borderRadius: 1 }}>
              {affectedItemsCount} artículos serán afectados con esta promoción.
            </Alert>
          </Box>
        )}
      </ModalFormZod>
    </MainLayout>
  );
}
