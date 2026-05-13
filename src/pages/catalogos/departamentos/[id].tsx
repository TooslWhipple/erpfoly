import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import { Box, Alert, CircularProgress, Stack } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import {
  MainLayout,
  Breadcrumbs,
  ModalFormZod,
  TableCrud,
  Title,
  TabFilters,
} from "@/components";
import type { Column, RowAction, BreadcrumbItem } from "@/components";
import {
  DepartmentSettingsTab,
  buildLineModalDefaultValues,
  buildLinePromotionPayload,
  departmentLineFormFields,
  lineModalSchemaSuperRefine,
  type DepartmentLineTableRow,
  type LineFormOutput,
} from "@/components/DepartmentDetailTabs";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { useDebouncedInput } from "@/hooks/useDebouncedValue";
import { getDepartmentById, updateDepartment } from "@/services/departments.service";
import {
  getProductLines,
  createProductLine,
  updateProductLine,
  deleteProductLine,
  type ProductLineItem,
} from "@/services/product-lines.service";
import type { Department } from "@/services/departments.service";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { formatPercentFieldValue, getProfitMarginFieldState } from "@/utils/percentInput";

type DepartmentDetailTab = "lines" | "settings";

export default function DepartmentDetailPage() {
  const { id } = useRouter().query;
  const departmentId = id === "new" || id === "nuevo" ? null : Number(id);

  const showSnackbar = useSnackbarStore((s) => s.showSuccess);
  const showError = useSnackbarStore((s) => s.showError);

  const [activeTab, setActiveTab] = useState<DepartmentDetailTab>("lines");
  const [department, setDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);
  const [marginDraft, setMarginDraft] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);

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
      setMarginDraft("");
      return;
    }

    const data = result.data ?? null;
    setDepartment(data);
    if (data) {
      setMarginDraft(formatPercentFieldValue(data.margin));
    }
  }, [departmentId, isDepartmentReady]);

  useEffect(() => {
    fetchDepartment();
  }, [fetchDepartment]);

  useEffect(() => {
    if (activeTab === "lines") {
      setSearch(debouncedSearch);
    }
  }, [activeTab, debouncedSearch, setSearch]);

  const marginFieldState = useMemo(
    () => (department ? getProfitMarginFieldState(marginDraft, department.margin) : null),
    [marginDraft, department],
  );

  const breadcrumbItems: BreadcrumbItem[] = useMemo(
    () => [
      { label: "Departamentos", href: "/catalogos/departamentos" },
      { label: department ? department.name : "Detalle" },
    ],
    [department],
  );

  const handleOpenNewGroup = useCallback(() => {
    setEditingLine(null);
    setHasGroupPromotion(false);
    setGroupModalOpen(true);
  }, []);

  const handleOpenEditGroup = useCallback((row: DepartmentLineTableRow) => {
    setEditingLine(row);
    setHasGroupPromotion(Boolean(row.promotion));
    setGroupModalOpen(true);
  }, []);

  const handleCloseGroupModal = useCallback(() => {
    setGroupModalOpen(false);
    setEditingLine(null);
    setHasGroupPromotion(false);
  }, []);

  const handleGroupFormValuesChange = useCallback((values: Record<string, unknown>) => {
    setHasGroupPromotion(Boolean(values.hasLinePromotion));
  }, []);

  const handleSaveGroup = useCallback(
    async (data: LineFormOutput) => {
      if (departmentId == null || Number.isNaN(departmentId)) return;

      const name = data.name.trim();
      const code = data.code.trim().toUpperCase();
      const promotion = buildLinePromotionPayload(data);

      setSavingLine(true);
      if (editingLine) {
        const linePromotionRemoval = Boolean(editingLine.promotion) && !data.hasLinePromotion;
        const result = await updateProductLine(editingLine.id, {
          name,
          code,
          promotion,
          removePromotion: linePromotionRemoval,
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
    },
    [
      departmentId,
      editingLine,
      fetchDepartment,
      handleCloseGroupModal,
      refetchProductLines,
      showError,
      showSnackbar,
    ],
  );

  const handleDeleteGroup = useCallback(
    async (row: DepartmentLineTableRow) => {
      if (!window.confirm(`¿Eliminar la línea "${row.name}"?`)) return;

      const result = await deleteProductLine(row.id);
      if (result.error) {
        console.error("[DepartmentDetail] Error deleting line:", result.error.message);
        showError(result.error.message);
        return;
      }
      showSnackbar("Línea eliminada correctamente.");
      await Promise.all([refetchProductLines(), fetchDepartment()]);
    },
    [fetchDepartment, refetchProductLines, showError, showSnackbar],
  );

  const handleSaveSettings = useCallback(async () => {
    if (
      departmentId == null ||
      department == null ||
      marginFieldState == null ||
      !marginFieldState.canSave ||
      marginFieldState.parsed === null
    ) {
      return;
    }

    setSavingSettings(true);
    const result = await updateDepartment(departmentId, { margin: marginFieldState.parsed });
    setSavingSettings(false);

    if (result.error) {
      console.error("[DepartmentDetail] Error updating margin:", result.error.message);
      showError(result.error.message);
      return;
    }

    const updated = result.data;
    if (!updated) {
      showError("No se recibió respuesta del servidor.");
      return;
    }

    setDepartment(updated);
    setMarginDraft(formatPercentFieldValue(updated.margin));
    showSnackbar("Margen de utilidad guardado correctamente.");
  }, [department, departmentId, marginFieldState, showError, showSnackbar]);

  const groupRows: DepartmentLineTableRow[] = useMemo(
    () =>
      productLines.map((pl) => ({
        ...pl,
        articles: pl.articles ?? 0,
      })),
    [productLines],
  );

  const lineColumns: Column<DepartmentLineTableRow>[] = useMemo(
    () => [
      {
        id: "id",
        label: "Identificador",
        type: "text",
        size: "xs",
        format: (_value, row) => row.code ?? "-",
      },
      { id: "name", label: "Nombre", size: "md" },
      { id: "articles", label: "Artículos", type: "number", size: "sm" },
    ],
    [],
  );

  const lineActions: RowAction<DepartmentLineTableRow>[] = useMemo(
    () => [
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
    ],
    [handleOpenEditGroup, handleDeleteGroup],
  );

  const groupModalInitialValues = useMemo(
    () => buildLineModalDefaultValues(editingLine),
    [editingLine],
  );

  const tabs = useMemo(
    () => [
      { value: "lines", label: "Líneas" },
      { value: "settings", label: "Ajustes" },
    ],
    [],
  );

  const settingsSaveDisabled =
    marginFieldState == null || !marginFieldState.canSave || savingSettings;

  const groupAffectedCount = hasGroupPromotion ? (editingLine?.articles ?? 0) : null;

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
                    onClick: handleSaveSettings,
                    variant: "contained",
                    color: "primary",
                    disabled: settingsSaveDisabled,
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
          <DepartmentSettingsTab
            marginDraft={marginDraft}
            onMarginDraftChange={setMarginDraft}
            marginFieldError={marginFieldState?.displayError ?? false}
            marginHelperText={marginFieldState?.helperText ?? ""}
            savingMargin={savingSettings}
          />
        )}
      </Stack>

      <ModalFormZod
        key={editingLine?.id ?? "new"}
        open={groupModalOpen}
        onClose={handleCloseGroupModal}
        title={editingLine ? "Editar línea" : "Nueva línea"}
        description={`Línea: ${department.name}`}
        fields={departmentLineFormFields}
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
