import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import { Box, Alert, CircularProgress, Stack } from "@mui/material";
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import {
  MainLayout,
  Breadcrumbs,
  ModalForm,
  TableCrud,
  Title,
} from "@/components";
import type { Column, RowAction } from "@/components/TableCrud";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import type { FormFieldConfig } from "@/components/Form";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { getDepartmentById } from "@/services/departments.service";
import {
  getProductLines,
  createProductLine,
  updateProductLine,
  deleteProductLine,
  type ProductLineItem,
} from "@/services/product-lines.service";
import type { Department } from "@/services/departments.service";
import { useSnackbarStore } from "@/store/useSnackbarStore";

// ============================================================================
// TYPES - Row with mock articles count for table display
// ============================================================================

interface GroupRow extends ProductLineItem {
  articles: number;
}

// ============================================================================
// HELPERS - Affected items count for promotion info (can be replaced by API later)
// ============================================================================

async function getAffectedItemsCount(departmentId?: number): Promise<number> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  if (departmentId === 1) return 43;
  if (departmentId === 2) return 28;
  return Math.floor(Math.random() * 50) + 10;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function DepartmentDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const departmentId = id === "new" || id === "nuevo" ? null : Number(id);

  const showSnackbar = useSnackbarStore((s) => s.showSuccess);
  const showError = useSnackbarStore((s) => s.showError);

  const [department, setDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);

  const isDepartmentReady = departmentId != null && !Number.isNaN(departmentId);

  const {
    data: productLines,
    isLoading: loadingLines,
    refetch: refetchProductLines,
  } = usePaginatedList<ProductLineItem>({
    queryKey: ["product-lines", String(departmentId ?? "")],
    queryFn: (params) => getProductLines({ departmentId: departmentId!, ...params }),
    initialPage: 0,
    initialRowsPerPage: 10,
    initialSearch: "",
    enabled: isDepartmentReady,
  });

  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [editingLine, setEditingLine] = useState<ProductLineItem | null>(null);
  const [savingLine, setSavingLine] = useState(false);
  const [hasGroupPromotion, setHasGroupPromotion] = useState(false);
  const [groupAffectedCount, setGroupAffectedCount] = useState<number | null>(null);
  const [groupFormValues, setGroupFormValues] = useState<Record<string, unknown>>({});

  const fetchDepartment = useCallback(async () => {
    if (!isDepartmentReady) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const result = await getDepartmentById(departmentId);
    setLoading(false);
    if (result.error) {
      console.error("[DepartmentDetail] Error fetching department:", result.error.message);
      setDepartment(null);
      return;
    }
    setDepartment(result.data ?? null);
  }, [departmentId, isDepartmentReady]);

  useEffect(() => {
    fetchDepartment();
  }, [fetchDepartment]);

  useEffect(() => {
    if (hasGroupPromotion && groupModalOpen && department) {
      getAffectedItemsCount(department.id).then(setGroupAffectedCount);
    } else {
      setGroupAffectedCount(null);
    }
  }, [hasGroupPromotion, groupModalOpen, department]);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Departamentos", href: "/catalogos/departamentos" },
    { label: department ? department.name : "Detalle" },
  ];

  const handleOpenNewGroup = () => {
    setEditingLine(null);
    setHasGroupPromotion(false);
    setGroupAffectedCount(null);
    setGroupFormValues({});
    setGroupModalOpen(true);
  };

  const handleOpenEditGroup = (row: GroupRow) => {
    setEditingLine(row);
    setHasGroupPromotion(false);
    setGroupFormValues({});
    setGroupModalOpen(true);
  };

  const handleCloseGroupModal = () => {
    setGroupModalOpen(false);
    setEditingLine(null);
    setHasGroupPromotion(false);
    setGroupAffectedCount(null);
    setGroupFormValues({});
  };

  const handleGroupFormValuesChange = useCallback((values: Record<string, unknown>) => {
    setGroupFormValues(values);
    setHasGroupPromotion(Boolean(values.hasGroupPromotion));
  }, []);

  const handleSaveGroup = async (data: Record<string, unknown>) => {
    if (departmentId == null || Number.isNaN(departmentId)) return;

    const name = (data.name as string)?.trim();
    const code = (data.code as string)?.trim();

    setSavingLine(true);
    if (editingLine) {
      const result = await updateProductLine(editingLine.id, { name, code });
      setSavingLine(false);
      if (result.error) {
        console.error("[DepartmentDetail] Error saving line:", result.error.message);
        showError(result.error.message);
        return;
      }
      showSnackbar("Línea actualizada correctamente.");
    } else {
      const result = await createProductLine({ departmentId, name, code });
      setSavingLine(false);
      if (result.error) {
        console.error("[DepartmentDetail] Error saving line:", result.error.message);
        showError(result.error.message);
        return;
      }
      showSnackbar("Línea creada correctamente.");
    }
    handleCloseGroupModal();
    await Promise.all([refetchProductLines(), fetchDepartment()]);
  };

  const handleDeleteGroup = async (row: GroupRow) => {
    const confirmed = window.confirm(
      `¿Eliminar la línea "${row.name}"?`
    );
    if (!confirmed) return;

    const result = await deleteProductLine(row.id);
    if (result.error) {
      console.error("[DepartmentDetail] Error deleting line:", result.error.message);
      showError(result.error.message);
      return;
    }
    showSnackbar("Línea eliminada correctamente.");
    await Promise.all([refetchProductLines(), fetchDepartment()]);
  };

  const groupRows: GroupRow[] = useMemo(() => {
    const hash = (s: string) =>
      s.split("").reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0);
    return productLines.map((pl) => ({
      ...pl,
      articles: 10 + Math.abs(hash(String(pl.id) + pl.name)) % 35,
    }));
  }, [productLines]);

  const lineColumns: Column<GroupRow>[] = [
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
      size: "md",
    },
    {
      id: "code",
      label: "Código",
      size: "sm",
    },
    {
      id: "articles",
      label: "Artículos",
      type: "number",
      size: "sm",
    },
  ];

  const lineActions: RowAction<GroupRow>[] = [
    {
      id: "edit",
      label: "Editar",
      icon: <EditIcon fontSize="small" />,
      onClick: handleOpenEditGroup,
    },
    {
      id: "delete",
      label: "Eliminar",
      icon: <DeleteIcon fontSize="small" />,
      onClick: handleDeleteGroup,
      color: "error",
    },
  ];

  const groupFormFields: FormFieldConfig[] = useMemo(() => {
    const base: FormFieldConfig[] = [
      {
        name: "code",
        label: "Abreviación",
        type: "text",
        placeholder: "Ej. LB",
        validation: { required: true, minLength: 1, maxLength: 32 },
        disabled: !!editingLine,
        transformInput: (v) => v.toUpperCase(),
      },
      {
        name: "name",
        label: "Nombre de la categoría",
        type: "text",
        placeholder: "Ej. Línea blanca",
        validation: {
          required: true,
          minLength: 2,
          maxLength: 128,
        },
        autoFocus: true,
        showErrorOnlyAfterSubmit: true,
      },
      {
        name: "hasGroupPromotion",
        label: "Agregar Promoción para esta Línea",
        type: "switch",
        defaultValue: false,
      },
    ];
    if (hasGroupPromotion) {
      base.push(
        {
          name: "promotionPercentage",
          label: "Promoción",
          type: "number",
          placeholder: "32",
          validation: { required: true, min: 0, max: 100 },
          helperText: "Porcentaje de descuento (0-100)",
        },
        {
          name: "promotionStartDate",
          label: "Fecha de inicio",
          type: "date",
          validation: { required: true },
        },
        {
          name: "promotionEndDate",
          label: "Fecha fin",
          type: "date",
          validation: {
            required: true,
            custom: (value, allValues) => {
              const start = allValues.promotionStartDate as string | undefined;
              const end = value as string | undefined;
              if (start && end && new Date(end) < new Date(start)) {
                return "La fecha fin debe ser posterior a la fecha de inicio";
              }
              return undefined;
            },
          },
        }
      );
    }
    return base;
  }, [hasGroupPromotion, editingLine]);

  const groupModalInitialValues = useMemo(() => {
    if (Object.keys(groupFormValues).length > 0) return groupFormValues;
    if (editingLine) {
      return {
        code: (editingLine.code ?? "").toUpperCase(),
        name: editingLine.name,
        hasGroupPromotion: false,
      };
    }
    return { code: "", name: "", hasGroupPromotion: false };
  }, [editingLine, groupFormValues]);

  if (loading) {
    return (
      <MainLayout>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 400,
          }}
        >
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  if (!department) {
    return (
      <MainLayout>
        <Stack spacing={2}>
          <Breadcrumbs items={breadcrumbItems} />
          <Box sx={{ py: 2 }}>Departamento no encontrado.</Box>
        </Stack>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Stack spacing={2}>
        <Breadcrumbs items={breadcrumbItems} />
        <Title
          title={department.name}
          actions={[
            {
              id: "new-group",
              label: "Nuevo grupo",
              icon: <AddIcon />,
              onClick: handleOpenNewGroup,
            },
          ]}
        />
        <TableCrud
          columns={lineColumns}
          rows={groupRows}
          actions={lineActions}
          rowKey="id"
          loading={loadingLines}
          emptyMessage="No hay líneas en este departamento"
        />
      </Stack>

      <ModalForm
        open={groupModalOpen}
        onClose={handleCloseGroupModal}
        title={editingLine ? "Editar línea" : "Nueva línea"}
        fields={groupFormFields}
        onConfirm={handleSaveGroup}
        loading={savingLine}
        initialValues={groupModalInitialValues}
        confirmLabel={editingLine ? "Guardar" : "Crear"}
        cancelLabel="Cancelar"
        maxWidth="sm"
        onValuesChange={handleGroupFormValuesChange}
      >
        {hasGroupPromotion && groupAffectedCount !== null && (
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ borderRadius: 1 }}>
              {groupAffectedCount} artículos serán afectados con esta promoción.
            </Alert>
          </Box>
        )}
      </ModalForm>
    </MainLayout>
  );
}
