"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { BadgeInfo } from "lucide-react";
import { ModalFormZod } from "@/components/ModalFormZod";
import { ConfigurationTab } from "@/components/Promotions/ConfigurationTab";
import { defineFormFields } from "@/forms";
import { getApiErrorMessage } from "@/lib/axios";
import { buildSelectedTermOptionLabels } from "@/lib/promotionTermOptionLabels";
import { validatePromotionEndDate, validatePromotionAdvancePercentage, resolvePromotionAdvanceRate } from "@/lib/promotionFormValidation";
import {
  getPromotionFormConfiguration,
  type PromotionFormConfiguration,
  type SavePromotionPayload,
} from "@/services/promociones.service";
import type { ProductPromotionDraft } from "@/types/productos.types";
import type { FormErrors, PromotionFormState } from "@/types/promociones.types";
import { LiquidationNoticeLeft, LiquidationNoticeRoot } from "./ProductPromotionModal.styles";

const productPromotionModalFields = defineFormFields<Record<string, never>>()([]);

function emptyFormBase(): PromotionFormState {
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
    selectedBranchIds: [],
    suppliers: [],
  };
}

function mergeCustomerLevelsFromPayload(
  catalogLevels: PromotionFormConfiguration["customerLevels"],
  saved: SavePromotionPayload["customerLevelDownPayments"]
): PromotionFormState["customerLevelDownPayments"] {
  const list = saved ?? [];
  const byId = new Map(list.map((x) => [x.customerLevelId, x.percentage]));
  return catalogLevels.map((cl) => ({
    customer_level_id: cl.id,
    percentage: byId.get(cl.id) ?? 0,
  }));
}

function mapPayloadToFormState(
  payload: SavePromotionPayload,
  configuration: PromotionFormConfiguration,
  productId: number | null
): PromotionFormState {
  const productIds =
    productId != null
      ? Array.from(new Set([...(payload.productIds ?? []), productId]))
      : [...(payload.productIds ?? [])];

  const purchaseType = configuration.purchaseTypes.find(
    (p) => p.id === (payload.purchaseTypeId ?? null)
  );
  const isApartado = purchaseType?.code === "APARTADO";

  return {
    name: payload.name,
    percentage: String(payload.discountRate),
    advancePercentage: isApartado ? String(payload.advanceRate) : "",
    purchaseTypeId: payload.purchaseTypeId ?? null,
    creditTermIds: [...(payload.creditTermIds ?? [])],
    layawayTermIds: [...(payload.layawayTermIds ?? [])],
    customerLevelDownPayments: mergeCustomerLevelsFromPayload(
      configuration.customerLevels,
      payload.customerLevelDownPayments
    ),
    startDate: payload.startDate,
    endDate: payload.endDate ?? null,
    hasEndDate: payload.endDate != null,
    selectedDepartmentIds: [],
    selectedLineIds: [],
    selectedProductIds: productIds,
    selectedBranchIds: [...(payload.branchIds ?? [])],
    suppliers: (payload.supplierIds ?? []).map((sid, i) => ({
      id: i + 1,
      supplierId: sid,
      supplierName: `Proveedor ${sid}`,
    })),
  };
}

function newDraftId(): string {
  return `promo-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export interface ProductPromotionModalProps {
  open: boolean;
  onClose: () => void;
  productId: number | null;
  editingDraft: ProductPromotionDraft | null;
  isLiquidation?: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  onSave: (draft: ProductPromotionDraft) => void;
}

export function ProductPromotionModal({
  open,
  onClose,
  productId,
  editingDraft,
  isLiquidation = false,
  title,
  description,
  confirmLabel = "Guardar",
  onSave,
}: ProductPromotionModalProps) {
  const [formState, setFormState] = useState<PromotionFormState>(() => ({
    ...emptyFormBase(),
    selectedProductIds: productId != null ? [productId] : [],
  }));
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  const hydratedDraftIdRef = useRef<string | null>(null);

  const configurationQuery = useQuery({
    queryKey: ["promotion-form-configuration"],
    queryFn: () => getPromotionFormConfiguration(),
    staleTime: 10 * 60 * 1000,
    enabled: open,
  });

  const configuration = configurationQuery.data;

  const purchaseTypeMeta = configuration?.purchaseTypes.find(
    (p) => p.id === formState.purchaseTypeId
  );

  useEffect(() => {
    if (!open) return;
    hydratedDraftIdRef.current = null;
    setErrors({});
    setFormState({
      ...emptyFormBase(),
      selectedProductIds: productId != null ? [productId] : [],
    });
  }, [open, productId, editingDraft?.id]);

  useEffect(() => {
    if (!open || !configurationQuery.data || editingDraft) return;
    setFormState((prev) => ({
      ...prev,
      selectedProductIds: productId != null ? [productId] : [],
      customerLevelDownPayments: configurationQuery.data!.customerLevels.map((cl) => ({
        customer_level_id: cl.id,
        percentage: 0,
      })),
    }));
  }, [open, configurationQuery.data, editingDraft, productId]);

  useEffect(() => {
    if (
      !open ||
      !editingDraft ||
      !configurationQuery.data ||
      hydratedDraftIdRef.current === editingDraft.id
    ) {
      return;
    }
    hydratedDraftIdRef.current = editingDraft.id;
    setFormState(
      mapPayloadToFormState(editingDraft.payload, configurationQuery.data, productId)
    );
  }, [open, editingDraft, configurationQuery.data, productId]);

  const handleFieldChange = useCallback(
    (field: keyof PromotionFormState, value: unknown) => {
      if (field === "selectedProductIds") {
        const next = Array.isArray(value) ? (value as number[]) : [];
        if (productId != null) {
          const merged = Array.from(new Set([...next, productId]));
          setFormState((prev) => ({ ...prev, selectedProductIds: merged }));
        } else {
          setFormState((prev) => ({ ...prev, selectedProductIds: next }));
        }
        return;
      }
      setFormState((prev) => ({ ...prev, [field]: value }));
    },
    [productId]
  );

  const handleErrorClear = useCallback((field: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const runValidation = (): { ok: boolean; nextErrors: FormErrors } => {
    const newErrors: FormErrors = {};
    const code = purchaseTypeMeta?.code;

    if (!formState.name.trim()) {
      newErrors.name = "El nombre es requerido";
    }

    if (!formState.percentage || Number(formState.percentage) <= 0) {
      newErrors.percentage = "El porcentaje debe ser mayor a 0";
    }

    const advancePercentageError = validatePromotionAdvancePercentage(
      code,
      formState.advancePercentage
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

    if (code === "CREDITO" && formState.creditTermIds.length === 0) {
      newErrors.creditTermIds = "Selecciona al menos una opción de meses";
    }

    if (code === "APARTADO" && formState.layawayTermIds.length === 0) {
      newErrors.layawayTermIds = "Selecciona al menos una opción de días";
    }

    if (code === "CREDITO" || code === "APARTADO") {
      const invalidPct = formState.customerLevelDownPayments.some(
        (r) => r.percentage < 0 || r.percentage > 100
      );
      if (invalidPct) {
        newErrors.customerLevelDownPayments =
          "Los porcentajes por nivel deben estar entre 0 y 100";
      }
    }

    if (productId != null && !formState.selectedProductIds.includes(productId)) {
      newErrors.selectedProductIds = "La promoción debe incluir este producto";
    }

    return { ok: Object.keys(newErrors).length === 0, nextErrors: newErrors };
  };

  const buildPayload = (): SavePromotionPayload => {
    const code = purchaseTypeMeta?.code;
    const productIds =
      productId != null
        ? Array.from(new Set([...formState.selectedProductIds, productId]))
        : [...formState.selectedProductIds];

    const termLabels = buildSelectedTermOptionLabels(
      code,
      purchaseTypeMeta,
      formState.creditTermIds,
      formState.layawayTermIds
    );

    return {
      name: formState.name.trim(),
      discountRate: Number(formState.percentage),
      advanceRate: resolvePromotionAdvanceRate(code, formState.advancePercentage),
      startDate: formState.startDate,
      endDate:
        formState.hasEndDate && formState.endDate && String(formState.endDate).trim()
          ? formState.endDate
          : null,
      purchaseTypeId: formState.purchaseTypeId,
      creditTermIds: code === "CREDITO" ? formState.creditTermIds : [],
      layawayTermIds: code === "APARTADO" ? formState.layawayTermIds : [],
      ...termLabels,
      customerLevelDownPayments:
        code === "CREDITO" || code === "APARTADO"
          ? formState.customerLevelDownPayments.map((r) => ({
              customerLevelId: r.customer_level_id,
              percentage: r.percentage,
            }))
          : [],
      productIds,
      branchIds: formState.selectedBranchIds,
      supplierIds: formState.suppliers.map((s) => s.supplierId),
    };
  };

  const handleSubmit = async () => {
    const { ok, nextErrors } = runValidation();
    setErrors(nextErrors);
    if (!ok) return;

    setSaving(true);
    try {
      const payload = buildPayload();
      const draft: ProductPromotionDraft = {
        id: editingDraft?.id ?? newDraftId(),
        isLiquidation: Boolean(isLiquidation),
        purchaseTypeCode: purchaseTypeMeta?.code ?? "",
        payload,
      };
      onSave(draft);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const modalTitle = title ?? (editingDraft ? "Editar promoción" : "Nueva promoción");
  const loadingConfig = configurationQuery.isPending;

  return (
    <ModalFormZod
      key={`ppm-${productId ?? "new"}-${editingDraft?.id ?? "create"}`}
      open={open}
      onClose={onClose}
      title={modalTitle}
      description={description}
      fields={productPromotionModalFields}
      defaultValues={{}}
      onSubmit={handleSubmit}
      confirmLabel={confirmLabel}
      loading={saving}
      maxWidth="md"
      fullWidth
      validateOn="submit"
    >
      <Stack spacing={2} sx={{ pt: 0.5 }}>
        {
          isLiquidation &&
          <LiquidationNoticeRoot>
            <LiquidationNoticeLeft>
              <BadgeInfo size={18} aria-hidden />
              <Typography variant="body1">Liquidación</Typography>
            </LiquidationNoticeLeft>
            <Typography variant="body2">Se imprimirá con etiqueta roja.</Typography>
          </LiquidationNoticeRoot>
        }

        {
          loadingConfig ?
            <Box style={{ display: "flex", justifyContent: "center", paddingTop: "32px" }}>
              <CircularProgress />
            </Box>
            :
            <ConfigurationTab
              isModal={true}
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
        }
      </Stack>
    </ModalFormZod>
  );
}
