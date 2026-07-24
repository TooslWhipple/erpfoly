import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMoratoryRateConfig,
  updateMoratoryRateConfig,
} from "@/services/moratory-rate.service";
import { unwrapOrThrow } from "@/lib/axios";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import type { MoratoryRateConfigResponse } from "@/types/moratoryRate.types";

export const MORATORY_RATE_QUERY_KEY = ["moratory-rate-config"] as const;

export function useMoratoryRateConfigQuery() {
  return useQuery({
    queryKey: MORATORY_RATE_QUERY_KEY,
    queryFn: async (): Promise<MoratoryRateConfigResponse> => {
      const result = await getMoratoryRateConfig();
      return unwrapOrThrow(result);
    },
  });
}

export function useUpdateMoratoryRateConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (annualRate: number) => {
      const result = await updateMoratoryRateConfig({ annualRate });
      return unwrapOrThrow(result);
    },
    onSuccess: (data) => {
      queryClient.setQueryData<MoratoryRateConfigResponse>(
        MORATORY_RATE_QUERY_KEY,
        data
      );
    },
  });
}

export function useMoratoryRateConfigPage() {
  const showSuccess = useSnackbarStore((s) => s.showSuccess);
  const showError = useSnackbarStore((s) => s.showError);

  const { data, isLoading } = useMoratoryRateConfigQuery();
  const saveMutation = useUpdateMoratoryRateConfig();

  const [draftRate, setDraftRate] = useState<number | null>(null);

  const annualRate = draftRate ?? data?.annualRate ?? 0;

  const handleChange = useCallback((value: number) => {
    setDraftRate(value);
  }, []);

  const handleSave = useCallback(async () => {
    try {
      await saveMutation.mutateAsync(annualRate);
      setDraftRate(null);
      showSuccess("Tasa de mora actualizada exitosamente");
    } catch (err) {
      console.error("[MoratoryRateConfig] Error saving configuration:", err);
      const message = err instanceof Error ? err.message : "";
      showError(message.trim() || "Error al guardar la tasa de mora");
    }
  }, [annualRate, saveMutation, showSuccess, showError]);

  return {
    annualRate,
    updatedAt: data?.updatedAt ?? null,
    handleChange,
    handleSave,
    loading: isLoading,
    saving: saveMutation.isPending,
  };
}
