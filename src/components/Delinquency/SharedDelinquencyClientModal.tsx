import { useCallback, useEffect, useMemo, useState } from "react";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SideModal, StatusChip, TabFilters } from "@/components";
import type { StatusChipVariant } from "@/components/StatusChip";
import { ActivityTab } from "@/pages/clientes/components/ActivityTab";
import {
  createClientCollectionActivity,
  getClientCollectionActivities,
  getClientCollectionActivityTypes,
} from "@/services/clients.service";
import {
  applySharedListNegotiation,
  getSharedListClientDetail,
} from "@/services/delinquency-shared-list.service";
import { getPublicSharedListClientDetail } from "@/services/public-delinquency-shared-list.service";
import { unwrapOrThrow } from "@/lib/axios";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import type { SharedDelinquencyClientDetail } from "@/types/delinquency-shared-list.types";
import type { ClientStatus } from "@/types/clientes.types";
import { SharedDelinquencyClientHeader, formatClientSinceLabel } from "./SharedDelinquencyClientHeader";
import { NegotiationTab } from "./NegotiationTab";

const STATUS_LABELS: Record<ClientStatus, string> = {
  active: "Activo",
  inactive: "Inactivo",
  blocked: "Bloqueado",
};

const STATUS_VARIANTS: Record<ClientStatus, StatusChipVariant> = {
  active: "success",
  inactive: "default",
  blocked: "error",
};

export type SharedDelinquencyClientModalMode = "internal" | "public";

export interface SharedDelinquencyClientModalProps {
  open: boolean;
  onClose: () => void;
  listClientId: number | null;
  mode: SharedDelinquencyClientModalMode;
  listId?: number;
  shareToken?: string;
  accessToken?: string;
  onNegotiationSuccess?: () => void;
}

export function SharedDelinquencyClientModal({
  open,
  onClose,
  listClientId,
  mode,
  listId,
  shareToken,
  accessToken,
  onNegotiationSuccess,
}: SharedDelinquencyClientModalProps) {
  const queryClient = useQueryClient();
  const showSuccess = useSnackbarStore((s) => s.showSuccess);
  const showError = useSnackbarStore((s) => s.showError);
  const [activeTab, setActiveTab] = useState(
    mode === "public" ? "negociacion" : "actividad",
  );

  useEffect(() => {
    if (open) {
      setActiveTab(mode === "public" ? "negociacion" : "actividad");
    }
  }, [open, mode, listClientId]);

  const detailQuery = useQuery({
    queryKey: [
      "delinquency-shared-list-client",
      mode,
      listId,
      shareToken,
      listClientId,
    ],
    enabled:
      open &&
      listClientId != null &&
      (mode === "internal"
        ? listId != null
        : Boolean(shareToken && accessToken)),
    queryFn: async (): Promise<SharedDelinquencyClientDetail> => {
      if (listClientId == null) {
        throw new Error("Cliente no seleccionado");
      }
      if (mode === "internal") {
        if (listId == null) {
          throw new Error("Lista no especificada");
        }
        const result = await getSharedListClientDetail(listId, listClientId);
        return unwrapOrThrow(result);
      }
      if (!shareToken || !accessToken) {
        throw new Error("Sesión pública inválida");
      }
      return getPublicSharedListClientDetail(
        shareToken,
        listClientId,
        accessToken,
      );
    },
  });

  const client = detailQuery.data;
  const clientId = client?.clientId ?? null;
  const status = client?.status ?? "active";

  const activitiesQuery = useQuery({
    queryKey: ["clients", "collection-activities", clientId],
    enabled: open && mode === "internal" && clientId != null,
    queryFn: async () => {
      const result = await getClientCollectionActivities(clientId as number);
      return unwrapOrThrow(result);
    },
  });

  const activityTypesQuery = useQuery({
    queryKey: ["clients", "collection-activity-types"],
    enabled: open && mode === "internal",
    queryFn: async () => {
      const result = await getClientCollectionActivityTypes();
      return unwrapOrThrow(result);
    },
  });

  const createActivityMutation = useMutation({
    mutationFn: async (payload: {
      activityTypeId: number;
      comment: string;
    }) => {
      if (clientId == null) {
        throw new Error("Cliente no disponible");
      }
      const result = await createClientCollectionActivity(clientId, payload);
      return unwrapOrThrow(result);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["clients", "collection-activities", clientId],
      });
      showSuccess("Actividad registrada");
    },
  });

  const negotiationMutation = useMutation({
    mutationFn: async (negotiatedInterestAmount: number) => {
      if (listId == null || listClientId == null) {
        throw new Error("Datos de negociación incompletos");
      }
      const result = await applySharedListNegotiation(listId, listClientId, {
        negotiatedInterestAmount,
      });
      return unwrapOrThrow(result);
    },
    onSuccess: async () => {
      showSuccess("Negociación aplicada");
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [
            "delinquency-shared-list-client",
            mode,
            listId,
            shareToken,
            listClientId,
          ],
        }),
        queryClient.invalidateQueries({
          queryKey: ["clients", "delinquency", "shared-lists"],
        }),
        listId != null
          ? queryClient.invalidateQueries({
            queryKey: ["clients", "delinquency", "shared-list", listId],
          })
          : Promise.resolve(),
      ]);
      onNegotiationSuccess?.();
    },
    onError: (error) => {
      showError(
        error instanceof Error
          ? error.message
          : "No se pudo aplicar la negociación",
      );
    },
  });

  const tabs = useMemo(() => {
    if (mode === "public") {
      return [{ value: "negociacion", label: "Negociación" }];
    }
    return [
      { value: "actividad", label: "Actividad" },
      { value: "negociacion", label: "Negociación" },
    ];
  }, [mode]);

  const handleCreateActivity = useCallback(
    async (payload: { activityTypeId: number; comment: string }) => {
      await createActivityMutation.mutateAsync(payload);
    },
    [createActivityMutation],
  );

  const handleApplyNegotiation = useCallback(
    async (negotiatedInterestAmount: number) => {
      await negotiationMutation.mutateAsync(negotiatedInterestAmount);
    },
    [negotiationMutation],
  );

  return (
    <SideModal
      open={open}
      onClose={onClose}
      maxWidth="lg"
      headerActionsPosition="top"
      headerActions={
        client &&
        <StatusChip label={STATUS_LABELS[status]} variant={STATUS_VARIANTS[status]} size="small" />
      }
      header={
        client && <SharedDelinquencyClientHeader client={client} />
      }
      title={!client && detailQuery.isLoading ? "Cargando..." : undefined}
    >
      {
        detailQuery.isLoading ?
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress />
          </Box>
          : detailQuery.isError || !client ?
            <Typography color="error">{(detailQuery.error instanceof Error) ? detailQuery.error.message : "No se pudo cargar el detalle del cliente"}</Typography>
            :
            <Stack spacing={2}>
              <TabFilters
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                showSearch={false}
              />

              {
                activeTab === "actividad" && mode === "internal" &&
                <ActivityTab
                  activities={activitiesQuery.data ?? []}
                  activityTypes={activityTypesQuery.data ?? []}
                  loadingActivities={activitiesQuery.isLoading}
                  onCreateActivity={handleCreateActivity}
                />
              }

              {
                activeTab === "negociacion" &&
                <NegotiationTab
                  principalAmount={client.principalAmount}
                  interestAmount={client.interestAmount}
                  negotiatedInterestAmount={client.negotiatedInterestAmount}
                  isNegotiated={client.isNegotiated}
                  readOnly={mode === "public"}
                  applying={negotiationMutation.isPending}
                  onApply={
                    mode === "internal" ? handleApplyNegotiation : undefined
                  }
                />
              }
            </Stack>
      }
    </SideModal>
  );
}
