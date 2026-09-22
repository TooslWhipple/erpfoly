import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Box, CircularProgress, Stack } from "@mui/material";
import { Breadcrumbs, Title, TabFilters } from "@/components";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import type { PromotionFormState, FormErrors } from "@/types/promociones.types";
import { EMPTY_PRODUCT_SELECTION } from "@/types/promociones.types";
import {
  getPromotionFormConfiguration,
  getPromotionById,
  createPromotion,
  updatePromotion,
  type PromotionDetail,
  type PromotionFormConfiguration,
  type SavePromotionPayload,
} from "@/services/promociones.service";
import { ConfigurationTab } from "@/components/Promotions/ConfigurationTab";
import { DepartmentsTab } from "@/components/Promotions/DepartmentsTab";
import { BranchesTab } from "@/components/Promotions/BranchesTab";
import { SuppliersTab } from "@/components/Promotions/SuppliersTab";
import { usePromotionDepartmentsCatalog } from "@/hooks/usePromotionDepartmentsCatalog";
import { usePromotionBranchesCatalog } from "@/hooks/usePromotionBranchesCatalog";
import { getApiErrorMessage, unwrapOrThrow } from "@/lib/axios";
import {
  validatePromotionEndDate,
  validatePromotionAdvancePercentage,
  resolvePromotionAdvanceRate,
} from "@/lib/promotionFormValidation";
import {
  CATALOG_PROMOTIONS_CREATE,
  CATALOG_PROMOTIONS_UPDATE,
} from "@/lib/permissions";
import { parsePositiveIntParam } from "@/utils/query";
import { toDateOnlyString } from "@/utils/date";
function emptyForm(): PromotionFormState {
  return {
    name: "",
    percentage: "",
    advancePercentage: "",
    purchaseTypeId: null,
    creditTermIds: [],
    layawayTermIds: [],
    customerLevelDownPayments: [],
    startDate: "",
    endDate: null,
    hasEndDate: true,
    selectedDepartmentIds: [],
    selectedLineIds: [],
    selectedProductIds: [],
    productSelection: EMPTY_PRODUCT_SELECTION,
    selectedBranchIds: [],
    suppliers: [],
  };
}
function mergeCustomerLevels(
  catalogLevels: PromotionFormConfiguration["customerLevels"],
  saved: PromotionDetail["customer_level_down_payments"],
): PromotionFormState["customerLevelDownPayments"] {
  const byId = new Map(saved.map((x) => [x.customer_level_id, x.percentage]));
  return catalogLevels.map((cl) => ({
    customer_level_id: cl.id,
    percentage: byId.get(cl.id) ?? 0,
  }));
}
function mapDetailToForm(
  detail: PromotionDetail,
  configuration: PromotionFormConfiguration,
): PromotionFormState {
  const snapshots = detail.products ?? [];
  const deptIds = detail.department_ids?.length
    ? [...detail.department_ids]
    : [...new Set(snapshots.map((p) => p.department_id))];
  const lineIds = detail.line_ids?.length
    ? [...detail.line_ids]
    : [...new Set(snapshots.map((p) => p.line_id))];
  const purchaseType = configuration.purchaseTypes.find(
    (p) => p.id === detail.purchase_type_id,
  );
  const isApartado = purchaseType?.code === "APARTADO";
  const selection = detail.product_selection;
  return {
    name: detail.name,
    percentage: String(detail.discount_rate),
    advancePercentage: isApartado ? String(detail.advance_rate) : "",
    purchaseTypeId: detail.purchase_type_id,
    creditTermIds: [...detail.credit_term_ids],
    layawayTermIds: [...detail.layaway_term_ids],
    customerLevelDownPayments: mergeCustomerLevels(
      configuration.customerLevels,
      detail.customer_level_down_payments,
    ),
    startDate: toDateOnlyString(detail.start_date),
    endDate: detail.end_date ? toDateOnlyString(detail.end_date) : null,
    hasEndDate: Boolean(detail.end_date),
    selectedDepartmentIds: deptIds,
    selectedLineIds: lineIds,
    selectedProductIds: selection?.select_all
      ? []
      : [...(selection?.included_product_ids ?? detail.product_ids)],
    productSelection: {
      selectAll: Boolean(selection?.select_all),
      excludedIds: [...(selection?.excluded_product_ids ?? [])],
      includedIds: selection?.select_all
        ? []
        : [...(selection?.included_product_ids ?? detail.product_ids)],
    },
    selectedBranchIds: [...detail.branch_ids],
    suppliers: detail.supplier_ids.map((sid, i) => ({
      id: i + 1,
      supplierId: sid,
      supplierName: `Proveedor ${sid}`,
    })),
  };
}
export default function PromotionFormPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const rawId = router.query.id;
  const isNew = rawId === "nuevo";
  const promotionId =
    typeof rawId === "string" && rawId !== "nuevo" && rawId !== ""
      ? Number(rawId)
      : NaN;
  const [activeTab, setActiveTab] = useState("configuration");
  const [saving, setSaving] = useState(false);
  const [formState, setFormState] = useState<PromotionFormState>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const lastHydratedDetailAtRef = useRef<number | null>(null);
  const prefillAppliedRef = useRef(false);
  const configurationQuery = useQuery({
    queryKey: ["promotion-form-configuration"],
    queryFn: () => getPromotionFormConfiguration(),
    staleTime: 10 * 60 * 1000,
    enabled: router.isReady,
  });
  const promotionQuery = useQuery({
    queryKey: ["promotion-detail", promotionId],
    queryFn: () => getPromotionById(promotionId),
    enabled: router.isReady && !isNew && Number.isFinite(promotionId),
    staleTime: 0,
    refetchOnMount: "always",
  });
  const departmentsCatalogQuery = usePromotionDepartmentsCatalog(
    router.isReady,
  );
  const branchesCatalogQuery = usePromotionBranchesCatalog(router.isReady);
  useEffect(() => {
    lastHydratedDetailAtRef.current = null;
  }, [promotionId]);
  useEffect(() => {
    if (!configurationQuery.data || !isNew) return;
    setFormState((prev) => {
      if (prev.customerLevelDownPayments.length > 0) return prev;
      return {
        ...prev,
        customerLevelDownPayments: configurationQuery.data!.customerLevels.map(
          (cl) => ({
            customer_level_id: cl.id,
            percentage: 0,
          }),
        ),
      };
    });
  }, [configurationQuery.data, isNew]);
  useEffect(() => {
    if (!router.isReady || !isNew || prefillAppliedRef.current) return;
    const departmentId = parsePositiveIntParam(router.query.departmentId);
    if (departmentId == null) return;
    prefillAppliedRef.current = true;
    setFormState((prev) => {
      if (prev.selectedDepartmentIds.length > 0) return prev;
      return {
        ...prev,
        selectedDepartmentIds: [departmentId],
      };
    });
    setActiveTab("departments");
  }, [router.isReady, isNew, router.query.departmentId]);
  useEffect(() => {
    if (
      isNew ||
      !promotionQuery.data ||
      !configurationQuery.data ||
      promotionQuery.isFetching
    ) {
      return;
    }
    if (lastHydratedDetailAtRef.current === promotionQuery.dataUpdatedAt) {
      return;
    }
    lastHydratedDetailAtRef.current = promotionQuery.dataUpdatedAt;
    setFormState(mapDetailToForm(promotionQuery.data, configurationQuery.data));
  }, [
    isNew,
    promotionId,
    promotionQuery.data,
    promotionQuery.dataUpdatedAt,
    promotionQuery.isFetching,
    configurationQuery.data,
  ]);
  const configuration = configurationQuery.data;
  const purchaseTypeMeta = configuration?.purchaseTypes.find(
    (p) => p.id === formState.purchaseTypeId,
  );
  const loading =
    !router.isReady ||
    (!isNew &&
      (promotionQuery.isLoading ||
        promotionQuery.isFetching ||
        !promotionQuery.data));
  const runValidation = (): {
    ok: boolean;
    nextErrors: FormErrors;
  } => {
    const newErrors: FormErrors = {};
    if (!formState.name.trim()) {
      newErrors.name = "El nombre es requerido";
    }
    if (!formState.percentage || Number(formState.percentage) <= 0) {
      newErrors.percentage = "El porcentaje debe ser mayor a 0";
    }
    const advancePercentageError = validatePromotionAdvancePercentage(
      purchaseTypeMeta?.code,
      formState.advancePercentage,
    );
    if (advancePercentageError) {
      newErrors.advancePercentage = advancePercentageError;
    }
    if (!formState.startDate) {
      newErrors.startDate = "La fecha de inicio es requerida";
    }
    const endDateError = validatePromotionEndDate(formState);
    if (endDateError) {
      newErrors.endDate = endDateError;
    }
    if (formState.purchaseTypeId == null) {
      newErrors.purchaseTypeId = "Selecciona un tipo de aplicación";
    }
    if (
      purchaseTypeMeta?.code === "CREDITO" &&
      formState.creditTermIds.length === 0
    ) {
      newErrors.creditTermIds = "Selecciona al menos una opción de meses";
    }
    if (
      purchaseTypeMeta?.code === "APARTADO" &&
      formState.layawayTermIds.length === 0
    ) {
      newErrors.layawayTermIds = "Selecciona al menos una opción de días";
    }
    if (
      purchaseTypeMeta?.code === "CREDITO" ||
      purchaseTypeMeta?.code === "APARTADO"
    ) {
      const invalidPct = formState.customerLevelDownPayments.some(
        (r) => r.percentage < 0 || r.percentage > 100,
      );
      if (invalidPct) {
        newErrors.customerLevelDownPayments =
          "Los porcentajes por nivel deben estar entre 0 y 100";
      }
    }
    const hasProducts =
      formState.productSelection.selectAll ||
      formState.productSelection.includedIds.length > 0;
    const hasBranches = formState.selectedBranchIds.length > 0;
    const hasSuppliers = (formState.suppliers?.length ?? 0) > 0;
    if (!hasProducts && !hasBranches && !hasSuppliers) {
      newErrors.scopeSelection =
        "Debes elegir al menos una opción: productos (tab Departamentos), sucursales o proveedores.";
    }
    return {
      ok: Object.keys(newErrors).length === 0,
      nextErrors: newErrors,
    };
  };
  const buildPayload = (): SavePromotionPayload => {
    const code = purchaseTypeMeta?.code;
    return {
      name: formState.name.trim(),
      discountRate: Number(formState.percentage),
      advanceRate: resolvePromotionAdvanceRate(
        purchaseTypeMeta?.code,
        formState.advancePercentage,
      ),
      startDate: formState.startDate,
      endDate:
        formState.hasEndDate &&
        formState.endDate &&
        String(formState.endDate).trim()
          ? formState.endDate
          : null,
      purchaseTypeId: formState.purchaseTypeId,
      creditTermIds: code === "CREDITO" ? formState.creditTermIds : [],
      layawayTermIds: code === "APARTADO" ? formState.layawayTermIds : [],
      customerLevelDownPayments:
        code === "CREDITO" || code === "APARTADO"
          ? formState.customerLevelDownPayments.map((r) => ({
              customerLevelId: r.customer_level_id,
              percentage: r.percentage,
            }))
          : [],
      productSelection:
        formState.selectedLineIds.length > 0 &&
        (formState.productSelection.selectAll ||
          formState.productSelection.includedIds.length > 0)
          ? {
              selectAll: formState.productSelection.selectAll,
              lineIds: formState.selectedLineIds,
              excludedProductIds: formState.productSelection.excludedIds,
              includedProductIds: formState.productSelection.includedIds,
            }
          : undefined,
      productIds: formState.productSelection.selectAll
        ? []
        : formState.productSelection.includedIds,
      branchIds: formState.selectedBranchIds,
      supplierIds: formState.suppliers.map((s) => s.supplierId),
    };
  };
  const handleSave = async () => {
    const { ok, nextErrors } = runValidation();
    setErrors(nextErrors);
    if (!ok) {
      const hasConfigurationError = Boolean(
        nextErrors.name ||
        nextErrors.percentage ||
        nextErrors.advancePercentage ||
        nextErrors.startDate ||
        nextErrors.endDate ||
        nextErrors.purchaseTypeId ||
        nextErrors.creditTermIds ||
        nextErrors.layawayTermIds ||
        nextErrors.customerLevelDownPayments,
      );
      if (hasConfigurationError) {
        setActiveTab("configuration");
      } else if (nextErrors.scopeSelection) {
        setActiveTab("departments");
      }
      return;
    }
    setSaving(true);
    try {
      const payload = buildPayload();
      if (isNew) {
        await unwrapOrThrow(await createPromotion(payload));
      } else {
        await unwrapOrThrow(await updatePromotion(promotionId, payload));
        await queryClient.invalidateQueries({
          queryKey: ["promotion-detail", promotionId],
        });
      }
      await queryClient.invalidateQueries({
        queryKey: ["promotions", "list"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["promotions", "list", "department"],
      });
      router.push("/catalogos/promociones");
    } catch (err) {
      console.error("[PromotionForm] Error saving:", err);
    } finally {
      setSaving(false);
    }
  };
  const handleDiscard = () => {
    if (window.confirm("¿Estás seguro de descartar los cambios?")) {
      router.push("/catalogos/promociones");
    }
  };
  const handleFieldChange = useCallback(
    (field: keyof PromotionFormState, value: unknown) => {
      setFormState((prev) => ({
        ...prev,
        [field]: value,
      }));
      if (
        field === "productSelection" ||
        field === "selectedBranchIds" ||
        field === "suppliers"
      ) {
        setErrors((prev) => {
          if (!prev.scopeSelection) return prev;
          const next = {
            ...prev,
          };
          delete next.scopeSelection;
          return next;
        });
      }
    },
    [],
  );
  const handleErrorClear = (field: string) => {
    setErrors((prev) => {
      const next = {
        ...prev,
      };
      delete next[field];
      return next;
    });
  };
  const breadcrumbItems: BreadcrumbItem[] = [
    {
      label: "Promociones",
      href: "/catalogos/promociones",
    },
    {
      label: isNew ? "Nuevo" : "Editar",
    },
  ];
  const tabs = [
    {
      value: "configuration",
      label: "Configuración",
    },
    {
      value: "departments",
      label: "Departamentos",
    },
    {
      value: "branches",
      label: "Sucursales",
    },
    {
      value: "suppliers",
      label: "Proveedores",
    },
  ];
  if (loading) {
    return (
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
    );
  }
  return (
    <Stack spacing={2}>
      <Breadcrumbs items={breadcrumbItems} />
      <Title
        title={isNew ? "Nueva promoción" : "Editar promoción"}
        actions={[
          {
            id: "discard",
            label: "Descartar cambios",
            onClick: handleDiscard,
            disabled: saving,
            variant: "outlined",
          },
          {
            id: "save",
            label: "Guardar",
            onClick: handleSave,
            disabled: saving,
            permission: isNew
              ? CATALOG_PROMOTIONS_CREATE
              : CATALOG_PROMOTIONS_UPDATE,
          },
        ]}
      />
      <TabFilters
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {errors.scopeSelection ? (
        <Alert
          severity="error"
          onClose={() => handleErrorClear("scopeSelection")}
        >
          {errors.scopeSelection}
        </Alert>
      ) : null}

      {activeTab === "configuration" && (
        <ConfigurationTab
          formState={formState}
          errors={errors}
          configuration={configuration}
          configurationLoading={configurationQuery.isPending}
          configurationError={
            configurationQuery.isError
              ? getApiErrorMessage(configurationQuery.error)
              : null
          }
          onFieldChange={handleFieldChange}
          onErrorClear={handleErrorClear}
        />
      )}

      {activeTab === "departments" && (
        <>
          <DepartmentsTab
            formState={formState}
            onFieldChange={handleFieldChange}
            departmentCatalog={departmentsCatalogQuery.data ?? []}
            departmentsCatalogLoading={departmentsCatalogQuery.isPending}
            departmentsCatalogError={
              departmentsCatalogQuery.isError
                ? getApiErrorMessage(departmentsCatalogQuery.error)
                : null
            }
          />
        </>
      )}

      {activeTab === "branches" && (
        <BranchesTab
          formState={formState}
          onFieldChange={handleFieldChange}
          branchCatalog={branchesCatalogQuery.data ?? []}
          branchesCatalogLoading={branchesCatalogQuery.isPending}
        />
      )}

      <Box sx={{ display: activeTab === "suppliers" ? "block" : "none" }}>
        <SuppliersTab
          formState={formState}
          onFieldChange={handleFieldChange}
          isActive
        />
      </Box>
    </Stack>
  );
}
