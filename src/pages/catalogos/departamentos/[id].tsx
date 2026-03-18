import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import { Box, Alert, CircularProgress, Stack } from "@mui/material";
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import {
  MainLayout,
  Breadcrumbs,
  ModalFormZod,
  TableCrud,
  Title,
} from "@/components";
import type { Column, RowAction } from "@/components/TableCrud";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
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
import { defineFormFields, messages, schemas } from "@/forms";
import { z } from "zod";

// ============================================================================
// TYPES - Row with mock articles count for table display
// ============================================================================

interface GroupRow extends ProductLineItem {
  articles: number;
}

type ProductLineModalFormValues = {
  code: string;
  name: string;
  hasGroupPromotion: boolean;
  promotionPercentage: string;
  promotionStartDate: string;
  promotionEndDate: string;
};

// ============================================================================
// HELPERS - Affected items count for promotion info (can be replaced by API later)
// ============================================================================

async function getAffectedItemsCount(departmentId?: number): Promise<number> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  if (departmentId === 1) return 43;
  if (departmentId === 2) return 28;
  return Math.floor(Math.random() * 50) + 10;
}

function validateGroupPromotionBlock(
  data: ProductLineModalFormValues,
  showError: (m: string) => void,
) {
  if (!data.hasGroupPromotion) return true;
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

function GroupAffectedBanner({
  enabled,
  departmentId,
}: {
  enabled: boolean;
  departmentId: number;
}) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      setCount(null);
      return;
    }
    let cancelled = false;
    getAffectedItemsCount(departmentId).then((n) => {
      if (!cancelled) setCount(n);
    });
    return () => {
      cancelled = true;
    };
  }, [enabled, departmentId]);

  if (!enabled || count === null) return null;
  return (
    <Box sx={{ mt: 2 }}>
      <Alert severity="info" sx={{ borderRadius: 1 }}>
        {count} artículos serán afectados con esta promoción.
      </Alert>
    </Box>
  );
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

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Departamentos", href: "/catalogos/departamentos" },
    { label: department ? department.name : "Detalle" },
  ];

  const handleOpenNewGroup = () => {
    setEditingLine(null);
    setGroupModalOpen(true);
  };

  const handleOpenEditGroup = (row: GroupRow) => {
    setEditingLine(row);
    setGroupModalOpen(true);
  };

  const handleCloseGroupModal = () => {
    setGroupModalOpen(false);
    setEditingLine(null);
  };

  const handleSaveGroup = async (data: ProductLineModalFormValues) => {
    if (departmentId == null || Number.isNaN(departmentId)) return;
    if (!validateGroupPromotionBlock(data, showError)) return;

    const name = data.name?.trim();
    const code = data.code?.trim();

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
    const confirmed = window.confirm(`¿Eliminar la línea "${row.name}"?`);
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

  const groupModalFields = useMemo(
    () =>
      defineFormFields<ProductLineModalFormValues>()([
        {
          name: "code",
          schema: z
            .string()
            .min(1, messages.required)
            .max(32, messages.string.max(32)),
          label: "Abreviación",
          type: "text",
          placeholder: "Ej. LB",
          filter: (v: string) => v.toUpperCase(),
          slotProps: editingLine
            ? { input: { readOnly: true } as Record<string, unknown> }
            : undefined,
        },
        {
          name: "name",
          schema: schemas.stringRange(2, 128),
          label: "Nombre de la categoría",
          type: "text",
          placeholder: "Ej. Línea blanca",
        },
        {
          name: "hasGroupPromotion",
          schema: z.boolean(),
          label: "Agregar Promoción para esta Línea",
          type: "switch",
        },
        {
          name: "promotionPercentage",
          schema: z.string(),
          label: "Promoción",
          type: "number",
          placeholder: "32",
          helperText: "Porcentaje de descuento (0-100)",
          visibleWhen: { field: "hasGroupPromotion", equals: true },
        },
        {
          name: "promotionStartDate",
          schema: z.string(),
          label: "Fecha de inicio",
          type: "date",
          visibleWhen: { field: "hasGroupPromotion", equals: true },
        },
        {
          name: "promotionEndDate",
          schema: z.string(),
          label: "Fecha fin",
          type: "date",
          visibleWhen: { field: "hasGroupPromotion", equals: true },
        },
      ] as const),
    [editingLine],
  );

  const groupModalDefaultValues = useMemo((): ProductLineModalFormValues => {
    if (editingLine) {
      return {
        code: (editingLine.code ?? "").toUpperCase(),
        name: editingLine.name,
        hasGroupPromotion: false,
        promotionPercentage: "",
        promotionStartDate: "",
        promotionEndDate: "",
      };
    }
    return {
      code: "",
      name: "",
      hasGroupPromotion: false,
      promotionPercentage: "",
      promotionStartDate: "",
      promotionEndDate: "",
    };
  }, [editingLine]);

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

      <ModalFormZod
        key={editingLine?.id ?? "new-line"}
        open={groupModalOpen}
        onClose={handleCloseGroupModal}
        title={editingLine ? "Editar línea" : "Nueva línea"}
        fields={groupModalFields}
        defaultValues={groupModalDefaultValues}
        onSubmit={handleSaveGroup}
        loading={savingLine}
        confirmLabel={editingLine ? "Guardar" : "Crear"}
        maxWidth="sm"
      >
        {(values) => (
          <GroupAffectedBanner
            enabled={Boolean(values.hasGroupPromotion)}
            departmentId={department.id}
          />
        )}
      </ModalFormZod>
    </MainLayout>
  );
}
