import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPurchaseTypes,
  getPointsConfig,
  savePointsConfig,
} from "@/services/points.service";
import { unwrapOrThrow } from "@/lib/axios";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import type {
  PurchaseType,
  PointEarningRuleConfig,
  PointsFormState,
  PointsConfigResponse,
} from "@/types/folypuntos.types";

export const POINTS_QUERY_KEYS = {
  purchaseTypes: ["points", "purchase-types"] as const,
  config: ["points", "config"] as const,
};

export function usePurchaseTypes() {
  return useQuery({
    queryKey: POINTS_QUERY_KEYS.purchaseTypes,
    queryFn: async (): Promise<PurchaseType[]> => {
      const result = await getPurchaseTypes();
      return unwrapOrThrow(result);
    },
  });
}

export function usePointsConfig() {
  return useQuery({
    queryKey: POINTS_QUERY_KEYS.config,
    queryFn: async (): Promise<PointsConfigResponse> => {
      const result = await getPointsConfig();
      return unwrapOrThrow(result);
    },
  });
}

export function useSavePointsConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rules: PointEarningRuleConfig[]) => {
      const result = await savePointsConfig({ rules });
      return unwrapOrThrow(result);
    },
    onSuccess: (_data, rules) => {
      const current = queryClient.getQueryData<PointsConfigResponse>(
        POINTS_QUERY_KEYS.config
      );
      if (current) {
        queryClient.setQueryData<PointsConfigResponse>(
          POINTS_QUERY_KEYS.config,
          { ...current, config: rules }
        );
      } else {
        queryClient.invalidateQueries({ queryKey: POINTS_QUERY_KEYS.config });
      }
    },
  });
}

function configArrayToFormState(config: PointEarningRuleConfig[]): PointsFormState {
  const state: PointsFormState = {};
  for (const r of config) {
    state[String(r.purchaseTypeId)] = {
      amountToSpend: r.amountToSpend,
      pointsAwarded: r.pointsAwarded,
      amountPerPoint: r.amountPerPoint,
    };
  }
  return state;
}

function formStateToRules(
  formState: PointsFormState,
  purchaseTypes: PurchaseType[]
): PointEarningRuleConfig[] {
  return purchaseTypes
    .filter((pt) => formState[String(pt.id)])
    .map((pt) => {
      const c = formState[String(pt.id)];
      return {
        purchaseTypeId: pt.id,
        amountToSpend: c.amountToSpend,
        pointsAwarded: c.pointsAwarded,
        amountPerPoint: c.amountPerPoint,
      };
    });
}

export function useFolypuntosPage() {
  const showSuccess = useSnackbarStore((s) => s.showSuccess);
  const showError = useSnackbarStore((s) => s.showError);

  const { data: configData, isLoading } = usePointsConfig();
  const saveMutation = useSavePointsConfig();

  const [localEdits, setLocalEdits] = useState<
    Record<
      string,
      Partial<{
        amountToSpend: number;
        pointsAwarded: number;
        amountPerPoint: number;
      }>
    >
  >({});
  const [activeTab, setActiveTab] = useState<string>("");

  const purchaseTypes = useMemo(
    () => configData?.purchaseTypes ?? [],
    [configData]
  );

  const serverConfigFormState = useMemo(
    () =>
      configData?.config != null
        ? configArrayToFormState(configData.config)
        : {},
    [configData]
  );

  const formState = useMemo<PointsFormState>(() => {
    const merged: PointsFormState = {};
    for (const pt of purchaseTypes) {
      const id = String(pt.id);
      merged[id] = {
        ...(serverConfigFormState[id] ?? {
          amountToSpend: 10,
          pointsAwarded: 1,
          amountPerPoint: 1,
        }),
        ...localEdits[id],
      };
    }
    return merged;
  }, [purchaseTypes, serverConfigFormState, localEdits]);

  const tabs = useMemo(
    () => purchaseTypes.map((pt) => ({ value: String(pt.id), label: pt.name })),
    [purchaseTypes]
  );

  const effectiveActiveTab =
    activeTab && tabs.some((t) => t.value === activeTab)
      ? activeTab
      : tabs[0]?.value ?? "";

  const handleFieldChange = useCallback(
    (
      purchaseTypeId: string,
      field: "amountToSpend" | "pointsAwarded" | "amountPerPoint",
      value: number
    ) => {
      setLocalEdits((prev) => ({
        ...prev,
        [purchaseTypeId]: {
          ...prev[purchaseTypeId],
          [field]: value,
        },
      }));
    },
    []
  );

  const handleSave = useCallback(async () => {
    const rules = formStateToRules(formState, purchaseTypes);
    if (rules.length === 0) {
      showError("No hay configuración para guardar.");
      return;
    }
    try {
      const response = await saveMutation.mutateAsync(rules);
      showSuccess(
        response?.message?.trim() || "Configuración guardada exitosamente"
      );
      setLocalEdits({});
    } catch (err) {
      console.error("[Folypuntos] Error saving configuration:", err);
      const message = err instanceof Error ? err.message : "";
      showError(message.trim() || "Error al guardar la configuración");
    }
  }, [formState, purchaseTypes, saveMutation, showSuccess, showError]);

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
  }, []);

  return {
    purchaseTypes,
    formState,
    tabs,
    effectiveActiveTab,
    handleFieldChange,
    handleSave,
    handleTabChange,
    loading: isLoading,
    saving: saveMutation.isPending,
  };
}
