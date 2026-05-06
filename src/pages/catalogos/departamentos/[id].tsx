import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import { Box, Alert, CircularProgress, Stack, Button } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import {
  MainLayout,
  Breadcrumbs,
  ModalFormZod,
  TableCrud,
  Title,
  TabFilters,
} from "@/components";
import type { Column, RowAction } from "@/components/TableCrud";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { useDebouncedInput } from "@/hooks/useDebouncedValue";
import { getDepartmentById } from "@/services/departments.service";
import {
  getProductLines,
  createProductLine,
  updateProductLine,
  deleteProductLine,
  type OriginPromotionPayload,
  type ProductLineItem,
} from "@/services/product-lines.service";
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
import {
  SettingsGrid,
  SettingsCard,
  SettingsTitle,
  SettingsDescription,
  SettingsValue,
  PromotionsCard,
  PromotionsHeader,
} from "@/styles/catalogos/departamentos-detail.styles";

// ============================================================================
// TYPES - Row with mock articles count for table display
// ============================================================================

interface GroupRow extends ProductLineItem {
  articles: number;
}

type DepartmentDetailTab = "lines" | "settings";

type LineFormShape = {
  code: string;
  name: string;
  hasLinePromotion: boolean;
  promotionPercentage: string;
  promotionStartDate: string;
  promotionEndDate: string;
};

const lineFormFields = defineFormFields<LineFormShape>()([
  {
    name: "name",
    schema: schemas
      .requiredString(2, "El nombre de la línea es requerido")
      .max(128, messages.string.max(128)),
    label: "Nombre de la categoría",
    type: "text",
    placeholder: "Ej. Sillas",
  },
  {
    name: "code",
    schema: schemas
      .requiredString(1, "La abreviación es requerida")
      .max(32, messages.string.max(32))
      .transform((s) => s.toUpperCase()),
    label: "Abreviación",
    type: "text",
    placeholder: "Ej. SL",
    filter: (v) => v.toUpperCase(),
  },
  {
    name: "hasLinePromotion",
    schema: z.boolean(),
    label: "Agregar Promoción para ésta Línea",
    type: "switch",
  },
  {
    name: "promotionPercentage",
    schema: z.string(),
    label: "Promoción",
    type: "number",
    placeholder: "32",
    when: (values) => Boolean(values.hasLinePromotion),
  },
  {
    name: "promotionStartDate",
    schema: z.string(),
    label: "Fecha de inicio",
    type: "date",
    when: (values) => Boolean(values.hasLinePromotion),
  },
  {
    name: "promotionEndDate",
    schema: z.string(),
    label: "Fecha fin",
    type: "date",
    when: (values) => Boolean(values.hasLinePromotion),
  },
] as const);

type LineFormOutput = SchemaOutputFromFields<typeof lineFormFields>;

interface PromotionMockRow {
  id: number;
  status: "active" | "inactive";
  name: string;
  promotion: string;
  endDate: string;
  products: number;
}

const promotionMockRows: PromotionMockRow[] = [
  {
    id: 1,
    status: "active",
    name: "Mes de la línea blanca",
    promotion: "12%",
    endDate: "Octubre",
    products: 298,
  },
  {
    id: 2,
    status: "inactive",
    name: "Día de las madres",
    promotion: "30%",
    endDate: "10, Mayo de 2025",
    products: 122,
  },
];

function lineModalSchemaSuperRefine(data: LineFormOutput, ctx: z.RefinementCtx): void {
  if (!data.hasLinePromotion) return;

  const percentageRaw = data.promotionPercentage?.trim() ?? "";
  if (!percentageRaw || Number.isNaN(Number(percentageRaw))) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "El porcentaje de promoción es requerido",
      path: ["promotionPercentage"],
    });
  } else {
    const value = Number(percentageRaw);
    if (value < 0 || value > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El porcentaje debe estar entre 0 y 100",
        path: ["promotionPercentage"],
      });
    }
  }

  const startDate = data.promotionStartDate?.trim() ?? "";
  const endDate = data.promotionEndDate?.trim() ?? "";
  if (!startDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La fecha de inicio es requerida",
      path: ["promotionStartDate"],
    });
  }
  if (!endDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La fecha fin es requerida",
      path: ["promotionEndDate"],
    });
  }
  if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La fecha fin debe ser posterior a la fecha de inicio",
      path: ["promotionEndDate"],
    });
  }
}

function buildLineModalDefaultValues(
  editingLine: ProductLineItem | null,
): SchemaInputFromFields<typeof lineFormFields> {
  if (editingLine) {
    const hasPromotion = Boolean(editingLine.promotion);
    return {
      name: editingLine.name,
      code: (editingLine.code ?? "").toUpperCase(),
      hasLinePromotion: hasPromotion,
      promotionPercentage:
        editingLine.promotion?.percentage != null
          ? String(editingLine.promotion.percentage)
          : "",
      promotionStartDate: editingLine.promotion?.startDate ?? "",
      promotionEndDate: editingLine.promotion?.endDate ?? "",
    };
  }
  return {
    name: "",
    code: "",
    hasLinePromotion: false,
    promotionPercentage: "",
    promotionStartDate: "",
    promotionEndDate: "",
  };
}

function buildLinePromotionPayload(data: LineFormOutput): OriginPromotionPayload | undefined {
  if (!data.hasLinePromotion) {
    return undefined;
  }

  return {
    discount_rate: Number(data.promotionPercentage),
    start_date: data.promotionStartDate,
    end_date: data.promotionEndDate || null,
  };
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

  const [activeTab, setActiveTab] = useState<DepartmentDetailTab>("lines");
  const [department, setDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);

  const [searchInput, setSearchInput, debouncedSearch] = useDebouncedInput("", 300);
  const isDepartmentReady = departmentId != null && !Number.isNaN(departmentId);

  const {
    data: productLines,
    total: totalRows,
    page,
    rowsPerPage,
    setPage,
    setRowsPerPage,
    setSearch,
    isLoading: loadingLines,
    refetch: refetchProductLines,
  } = usePaginatedList<ProductLineItem>({
    queryKey: ["product-lines", String(departmentId ?? "")],
    queryFn: (params) => getProductLines({ departmentId: departmentId!, ...params }),
    initialPage: 0,
    initialRowsPerPage: 10,
    initialSearch: "",
    enabled: isDepartmentReady && activeTab === "lines",
  });

  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [editingLine, setEditingLine] = useState<ProductLineItem | null>(null);
  const [savingLine, setSavingLine] = useState(false);
  const [hasGroupPromotion, setHasGroupPromotion] = useState(false);

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
    if (activeTab === "lines") {
      setSearch(debouncedSearch);
    }
  }, [activeTab, debouncedSearch, setSearch]);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Departamentos", href: "/catalogos/departamentos" },
    { label: department ? department.name : "Detalle" },
  ];

  const handleOpenNewGroup = () => {
    setEditingLine(null);
    setHasGroupPromotion(false);
    setGroupModalOpen(true);
  };

  const handleOpenEditGroup = (row: GroupRow) => {
    setEditingLine(row);
    setHasGroupPromotion(Boolean(row.promotion));
    setGroupModalOpen(true);
  };

  const handleCloseGroupModal = () => {
    setGroupModalOpen(false);
    setEditingLine(null);
    setHasGroupPromotion(false);
  };

  const handleGroupFormValuesChange = useCallback((values: Record<string, unknown>) => {
    setHasGroupPromotion(Boolean(values.hasLinePromotion));
  }, []);

  const handleSaveGroup = async (data: LineFormOutput) => {
    if (departmentId == null || Number.isNaN(departmentId)) return;

    const name = data.name.trim();
    const code = data.code.trim().toUpperCase();
    const promotion = buildLinePromotionPayload(data);

    setSavingLine(true);
    if (editingLine) {
      const removePromotion = Boolean(editingLine.promotion) && !data.hasLinePromotion;
      const result = await updateProductLine(editingLine.id, {
        name,
        code,
        promotion,
        removePromotion,
      });
      setSavingLine(false);
      if (result.error) {
        console.error("[DepartmentDetail] Error saving line:", result.error.message);
        showError(result.error.message);
        return;
      }
      showSnackbar("Línea actualizada correctamente.");
    } else {
      const result = await createProductLine({ departmentId, name, code, promotion });
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

  const groupRows: GroupRow[] = useMemo(
    () =>
      productLines.map((pl) => ({
        ...pl,
        articles: pl.articles ?? 0,
      })),
    [productLines],
  );

  const groupAffectedCount = hasGroupPromotion ? (editingLine?.articles ?? 0) : null;

  const settingsPromotionColumns: Column<PromotionMockRow>[] = [
    {
      id: "status",
      label: "Estatus",
      type: "chip",
      size: "sm",
      chipLabelMap: {
        active: "Activo",
        inactive: "Inactivo",
      },
      chipVariantMap: {
        active: "success",
        inactive: "default",
      },
    },
    { id: "name", label: "Nombre", size: "xl" },
    { id: "promotion", label: "Promoción", size: "sm" },
    { id: "endDate", label: "Finalización", size: "md" },
    { id: "products", label: "Productos", type: "number", size: "sm", align: "left" },
  ];

  const lineColumns: Column<GroupRow>[] = [
    {
      id: "id",
      label: "Identificador",
      type: "text",
      size: "xs",
      format: (_value, row) => row.code ?? "-",
    },
    {
      id: "name",
      label: "Nombre",
      size: "md",
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

  const groupModalInitialValues = useMemo(
    () => buildLineModalDefaultValues(editingLine),
    [editingLine],
  );

  const tabs = [
    { value: "lines", label: "Líneas" },
    { value: "settings", label: "Ajustes" },
  ];

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
        <Title title={department.name} />
        <TabFilters
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(value) => setActiveTab(value as DepartmentDetailTab)}
          showSearch={activeTab === "lines"}
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          searchPlaceholder="Buscar"
          actions={
            activeTab === "lines"
              ? [
                  {
                    label: "Nueva línea",
                    onClick: handleOpenNewGroup,
                    variant: "contained",
                    color: "primary",
                  },
                ]
              : [
                  {
                    label: "Guardar cambios",
                    onClick: () => showSnackbar("Cambios guardados correctamente."),
                    variant: "contained",
                    color: "primary",
                  },
                ]
          }
        />
        {activeTab === "lines" ? (
          <TableCrud
            columns={lineColumns}
            rows={groupRows}
            actions={lineActions}
            rowKey="id"
            loading={loadingLines}
            page={page}
            rowsPerPage={rowsPerPage}
            totalRows={totalRows}
            onPageChange={setPage}
            onRowsPerPageChange={setRowsPerPage}
            emptyMessage="No hay líneas en este departamento"
          />
        ) : (
          <Stack spacing={2}>
            <SettingsGrid>
              <SettingsCard>
                <SettingsTitle>Margen de utilidad</SettingsTitle>
                <SettingsDescription>
                  Se aplicará para todos los artículos dentro de este departamento. Éste
                  precio será tomado como el precio de crédito de los artículos.
                </SettingsDescription>
                <SettingsValue>32%</SettingsValue>
              </SettingsCard>

              <SettingsCard>
                <SettingsTitle>Promoción de contado</SettingsTitle>
                <SettingsDescription>
                  Configura el porcentaje que los artículos obtendrán para su precio de contado.
                </SettingsDescription>
                <SettingsValue>20%</SettingsValue>
              </SettingsCard>
            </SettingsGrid>

            <PromotionsCard>
              <PromotionsHeader>
                <SettingsTitle sx={{ fontSize: "1.25rem" }}>Promociones</SettingsTitle>
                <Button variant="outlined">Nueva promoción</Button>
              </PromotionsHeader>
              <TableCrud
                columns={settingsPromotionColumns}
                rows={promotionMockRows}
                rowKey="id"
                loading={false}
                emptyMessage="No hay promociones registradas"
              />
            </PromotionsCard>
          </Stack>
        )}
      </Stack>

      <ModalFormZod
        key={editingLine?.id ?? "new"}
        open={groupModalOpen}
        onClose={handleCloseGroupModal}
        title={editingLine ? "Editar línea" : "Nueva línea"}
        description={department ? `Línea: ${department.name}` : undefined}
        fields={lineFormFields}
        defaultValues={groupModalInitialValues}
        onSubmit={handleSaveGroup}
        loading={savingLine}
        confirmLabel={editingLine ? "Guardar" : "Crear"}
        maxWidth="sm"
        fullWidth
        validateOn="change"
        onValuesChange={handleGroupFormValuesChange}
        schemaSuperRefine={lineModalSchemaSuperRefine}
      >
        {hasGroupPromotion && groupAffectedCount !== null && (
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ borderRadius: 1 }}>
              {groupAffectedCount} artículos serán afectados con esta promoción.
            </Alert>
          </Box>
        )}
      </ModalFormZod>
    </MainLayout>
  );
}
