import { useCallback, useState } from "react";
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
  updateSharedListClientManagementStatus,
} from "@/services/delinquency-shared-list.service";
import { unwrapOrThrow } from "@/lib/axios";
import { usePermissions } from "@/hooks/usePermissions";
import {
  CUSTOMERS_READ,
  CUSTOMER_DELINQUENCY_LISTS_UPDATE,
  CUSTOMER_DELINQUENCY_UPDATE,
} from "@/lib/permissions";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import type {
  DelinquencyManagementStatus,
  SharedDelinquencyClientDetail,
} from "@/types/delinquency-shared-list.types";
import type { ClientStatus } from "@/types/clientes.types";
import { SharedDelinquencyClientHeader, formatClientSinceLabel } from "./SharedDelinquencyClientHeader";
import { NegotiationTab } from "./NegotiationTab";
import { GeneralInformationTab } from "./GeneralInformationTab";
import { ClientAddressTab } from "./ClientAddressTab";
import { GuarantorReadOnlyTab } from "./GuarantorReadOnlyTab";

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

export interface SharedDelinquencyClientModalProps {
  open: boolean;
  onClose: () => void;
  listClientId: number | null;
  listId: number;
  listClosed?: boolean;
  onNegotiationSuccess?: () => void;
}

export function SharedDelinquencyClientModal({
  open,
  onClose,
  listClientId,
  listId,
  listClosed = false,
  onNegotiationSuccess,
}: SharedDelinquencyClientModalProps) {
  const queryClient = useQueryClient();
  const showSuccess = useSnackbarStore((s) => s.showSuccess);
  const showError = useSnackbarStore((s) => s.showError);
  const { hasPermission, hasAnyPermission } = usePermissions();
  const canEdit = hasAnyPermission([
    CUSTOMER_DELINQUENCY_UPDATE,
    CUSTOMER_DELINQUENCY_LISTS_UPDATE,
  ]);
  const canReadActivity = hasPermission(CUSTOMERS_READ);
  const initialTab = canReadActivity ? "actividad" : "negociacion";
  const [activeTab, setActiveTab] = useState(initialTab);

  const handleClose = useCallback(() => {
    setActiveTab(initialTab);
    onClose();
  }, [onClose, initialTab]);

  const detailQuery = useQuery({
    queryKey: ["delinquency-shared-list-client", listId, listClientId],
    enabled: open && listClientId != null,
    queryFn: async (): Promise<SharedDelinquencyClientDetail> => {
      if (listClientId == null) {
        throw new Error("Cliente no seleccionado");
      }
      const result = await getSharedListClientDetail(listId, listClientId);
      return unwrapOrThrow(result);
    },
  });

  const client = detailQuery.data;
  const clientId = client?.clientId ?? null;
  const status = client?.status ?? "active";

  const activitiesQuery = useQuery({
    queryKey: ["clients", "collection-activities", clientId],
    enabled: open && canReadActivity && clientId != null,
    queryFn: async () => {
      const result = await getClientCollectionActivities(clientId as number);
      return unwrapOrThrow(result);
    },
  });

  const activityTypesQuery = useQuery({
    queryKey: ["clients", "collection-activity-types"],
    enabled: open && canReadActivity,
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
      if (listClientId == null) {
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
          queryKey: ["delinquency-shared-list-client", listId, listClientId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["clients", "delinquency", "shared-lists"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["clients", "delinquency", "shared-list", listId],
        }),
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

  const statusMutation = useMutation({
    mutationFn: async (status: DelinquencyManagementStatus) => {
      if (listClientId == null) {
        throw new Error("Cliente no seleccionado");
      }
      const result = await updateSharedListClientManagementStatus(
        listId,
        listClientId,
        { status },
      );
      return unwrapOrThrow(result);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["clients", "delinquency", "shared-list", listId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["delinquency-shared-list-client", listId, listClientId],
        }),
      ]);
    },
  });

  const tabs = [
    ...(canReadActivity ? [{ value: "actividad", label: "Actividad" }] : []),
    { value: "negociacion", label: "Negociación" },
    { value: "informacion-general", label: "Información general" },
    { value: "direccion", label: "Dirección" },
    { value: "aval", label: "Aval" },
  ];

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
      onClose={handleClose}
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
                activeTab === "actividad" && canReadActivity &&
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
                  key={`${client.id}-${client.interestAmount}-${client.negotiatedInterestAmount ?? "none"}`}
                  currentDebtAmount={client.currentDebtAmount}
                  maxDiscountAmount={client.collectorMaxNegotiationAmount}
                  maxDiscountPercent={client.collectorMaxNegotiationPercent}
                  managementStatus={client.managementStatus}
                  managementStatusUpdatedAt={client.managementStatusUpdatedAt}
                  updatingStatus={statusMutation.isPending}
                  onManagementStatusChange={(status) =>
                    statusMutation.mutate(status)
                  }
                  readOnly={!canEdit || listClosed}
                  principalAmount={client.principalAmount}
                  interestAmount={client.interestAmount}
                  negotiatedInterestAmount={client.negotiatedInterestAmount}
                  isNegotiated={client.isNegotiated}
                  applying={negotiationMutation.isPending}
                  onApply={handleApplyNegotiation}
                />
              }

              {
                activeTab === "informacion-general" &&
                <GeneralInformationTab basicInformation={client.basicInformation} />
              }

              {
                activeTab === "direccion" &&
                <ClientAddressTab address={client.address} />
              }

              {
                activeTab === "aval" &&
                <GuarantorReadOnlyTab guarantor={client.guarantor} />
              }
            </Stack>
      }
    </SideModal>
  );
}
