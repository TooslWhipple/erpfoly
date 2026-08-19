import { useState } from "react";
import { useRouter } from "next/router";
import { Skeleton, Typography, Button, Stack, Divider, Box } from "@mui/material";
import numeral from "numeral";
import { Breadcrumbs, CreditLimitBar, TabFilters } from "@/components";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import {
  ActivityTab,
  ClientDetailActions,
  DeactivateClientModal,
  MovementsTab,
  PurchasesTab,
  PaymentsTab,
  InformationTab,
} from "../components";
import { Card, ErrorState } from "@/styles/clientes/detalle.styles";
import { useTheme } from "@mui/material/styles";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createClientCollectionActivity,
  getClientCollectionActivities,
  getClientCollectionActivityTypes,
  getClientDetail,
} from "@/services/clients.service";
import {
  getClientMovements,
  getClientPayments,
  getClientPurchases,
} from "@/services/client-movements.service";
import { getActiveSaleCredits } from "@/services/sale-credit.service";
import { getApiErrorMessage, unwrapOrThrow } from "@/lib/axios";
import { isCreditClient as checkIsCreditClient } from "@/utils/client";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { usePermissions } from "@/hooks/usePermissions";
import { CUSTOMERS_DELETE } from "@/lib/permissions";
import type { ClientStatus } from "@/types/clientes.types";

function formatCurrency(value: number): string {
  return numeral(value).format("$0,0.00");
}

const TABS = [
  { value: "actividad", label: "Actividad" },
  { value: "movimientos", label: "Movimientos" },
  { value: "compras", label: "Compras" },
  { value: "abonos", label: "Abonos" },
  { value: "informacion", label: "Información" },
];

const TAB_SKELETON_WIDTHS = [88, 110, 84, 80, 104];

function ClientDetailSkeleton({
  breadcrumbs,
  onBack,
}: {
  breadcrumbs: BreadcrumbItem[];
  onBack: () => void;
}) {
  return (
    <Stack spacing={3}>
      <Breadcrumbs items={breadcrumbs} showBackButton onBack={onBack} />

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={{ xs: 1, sm: 0 }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
      >
        <Stack spacing={0.5} flex={1}>
          <Skeleton variant="text" width={180} height={20} />
          <Skeleton variant="text" width={280} height={36} />
          <Skeleton variant="text" width={220} height={20} />
        </Stack>
        <Skeleton
          variant="rounded"
          width={180}
          height={56}
          sx={{ borderRadius: 2 }}
        />
      </Stack>

      <Divider />

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        justifyContent="space-between"
        alignItems="center"
      >
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {TAB_SKELETON_WIDTHS.map((width) => (
            <Skeleton
              key={width}
              variant="rounded"
              width={width}
              height={36}
              sx={{ borderRadius: 1 }}
            />
          ))}
        </Stack>
        <Skeleton
          variant="rounded"
          width={144}
          height={36}
          sx={{
            borderRadius: 1,
            width: { xs: "100%", sm: 144 },
          }}
        />
      </Stack>

      <Card>
        <Skeleton variant="text" width={200} height={28} />
        <Stack spacing={3}>
          {[0, 1, 2, 3].map((index) => (
            <Stack key={index} direction="row" spacing={2} alignItems="flex-start">
              <Skeleton variant="circular" width={32} height={32} />
              <Stack spacing={0.5} flex={1}>
                <Skeleton variant="text" width="40%" height={20} />
                <Skeleton variant="text" width="70%" height={20} />
              </Stack>
            </Stack>
          ))}
        </Stack>
      </Card>
    </Stack>
  );
}

export default function ClientDetailPage() {
  const router = useRouter();
  const theme = useTheme();
  const queryClient = useQueryClient();
  const showWarning = useSnackbarStore((s) => s.showWarning);
  const { hasPermission } = usePermissions();
  const { id } = router.query;
  const [activeTab, setActiveTab] = useState("actividad");
  const [validatingPayment, setValidatingPayment] = useState(false);
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const numericClientId =
    typeof id === "string" && Number.isFinite(Number(id)) ? Number(id) : null;

  const clientHeaderQuery = useQuery({
    queryKey: ["clients", "detail", numericClientId],
    enabled: numericClientId !== null,
    queryFn: async () => {
      const result = await getClientDetail(numericClientId as number);
      return unwrapOrThrow(result);
    },
  });

  const isCreditClient = checkIsCreditClient({
    creditApplicationId: clientHeaderQuery.data?.creditApplicationId ?? null,
  });

  const activeCreditsQuery = useQuery({
    queryKey: ["sale-credits", "active", numericClientId],
    enabled: numericClientId !== null && isCreditClient,
    queryFn: async () => {
      const result = await getActiveSaleCredits(numericClientId as number, 1, 50);
      return unwrapOrThrow(result);
    },
  });

  const activityListQuery = useQuery({
    queryKey: ["clients", "collection-activities", numericClientId],
    enabled: numericClientId !== null,
    queryFn: async () => {
      const result = await getClientCollectionActivities(
        numericClientId as number,
      );
      return unwrapOrThrow(result);
    },
  });

  const activityTypesQuery = useQuery({
    queryKey: ["clients", "collection-activity-types"],
    queryFn: async () => {
      const result = await getClientCollectionActivityTypes();
      return unwrapOrThrow(result);
    },
    staleTime: 6 * 60 * 60 * 1000,
    gcTime: 12 * 60 * 60 * 1000,
  });

  const createActivityMutation = useMutation({
    mutationFn: async (payload: {
      activityTypeId: number;
      comment: string;
    }) => {
      const result = await createClientCollectionActivity(
        numericClientId as number,
        payload,
      );
      return unwrapOrThrow(result);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["clients", "collection-activities", numericClientId],
      });
    },
  });

  const movementsQuery = useQuery({
    queryKey: ["clients", "movements", numericClientId],
    enabled: numericClientId !== null,
    queryFn: async () => {
      const result = await getClientMovements(numericClientId as number, {
        limit: 100,
      });
      return unwrapOrThrow(result);
    },
  });

  const purchasesQuery = useQuery({
    queryKey: ["clients", "purchases", numericClientId],
    enabled: numericClientId !== null,
    queryFn: async () => {
      const result = await getClientPurchases(numericClientId as number, {
        limit: 100,
      });
      return unwrapOrThrow(result);
    },
  });

  const paymentsQuery = useQuery({
    queryKey: ["clients", "payments", numericClientId],
    enabled: numericClientId !== null,
    queryFn: async () => {
      const result = await getClientPayments(numericClientId as number, {
        limit: 100,
      });
      return unwrapOrThrow(result);
    },
  });

  const header = clientHeaderQuery.data;
  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Clientes", href: "/clientes" },
    {
      label: header?.fullName ?? "...",
      href: header ? `/clientes/${header.id}` : undefined,
    },
  ];

  const handleBack = () => router.push("/clientes");

  if (!router.isReady || (numericClientId !== null && clientHeaderQuery.isLoading && !header)) {
    return (
      <ClientDetailSkeleton breadcrumbs={breadcrumbs} onBack={handleBack} />
    );
  }

  if (numericClientId === null || clientHeaderQuery.isError || !header) {
    return (
      <Stack spacing={3}>
        <Breadcrumbs
          items={breadcrumbs}
          showBackButton
          onBack={handleBack}
        />
        <ErrorState>
          <Typography>
            {clientHeaderQuery.error
              ? getApiErrorMessage(clientHeaderQuery.error)
              : "Cliente no encontrado"}
          </Typography>
          <Button variant="outlined" onClick={handleBack}>
            Volver al listado
          </Button>
        </ErrorState>
      </Stack>
    );
  }

  const creditAuthorized = header.creditLine.authorized;
  const creditAvailable = header.creditLine.available ?? 0;
  const creditUsed = Math.max(creditAuthorized - creditAvailable, 0);
  const clientStatus = (header.status ?? "active") as ClientStatus;
  const isClientActive = clientStatus === "active";
  const canDeactivateClient = hasPermission(CUSTOMERS_DELETE);

  const handleAddPaymentClick = async () => {
    if (!isClientActive) {
      return;
    }

    if (!isCreditClient) {
      showWarning(
        "Este cliente es de contado y no puede registrar abonos.",
      );
      return;
    }

    setValidatingPayment(true);
    try {
      const result = await activeCreditsQuery.refetch();
      const hasPayableCredit = (result.data?.rows ?? []).some(
        (credit) => credit.outstanding_balance > 0,
      );

      if (!hasPayableCredit) {
        showWarning(
          "El cliente no tiene compras a crédito vigentes con parcialidades pendientes.",
        );
        return;
      }

      await router.push(`/clientes/${header.id}/abonos`);
    } catch (error) {
      showWarning(getApiErrorMessage(error));
    } finally {
      setValidatingPayment(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "actividad":
        return (
          <ActivityTab
            activities={activityListQuery.data ?? []}
            activityTypes={activityTypesQuery.data ?? []}
            loadingActivities={activityListQuery.isLoading}
            onCreateActivity={async (payload) => {
              await createActivityMutation.mutateAsync(payload);
            }}
          />
        );
      case "movimientos":
        return (
          <MovementsTab
            movements={movementsQuery.data?.rows ?? []}
            loading={movementsQuery.isLoading}
          />
        );
      case "compras":
        return (
          <PurchasesTab
            purchases={purchasesQuery.data?.rows ?? []}
            loading={purchasesQuery.isLoading}
          />
        );
      case "abonos":
        return (
          <PaymentsTab
            payments={paymentsQuery.data?.rows ?? []}
            loading={paymentsQuery.isLoading}
          />
        );
      case "informacion":
        return <InformationTab isCreditClient={isCreditClient} />;
      default:
        return null;
    }
  };

  return (
    <Stack spacing={3}>
      <Breadcrumbs items={breadcrumbs} showBackButton onBack={handleBack} />
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={{ xs: 1, sm: 0 }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
      >
        <Stack spacing={0.5} flex={1}>
          <Typography variant="body2" color="text.secondary">
            {header.curp}
          </Typography>
          <Typography variant="h5">{header.fullName}</Typography>
          {isCreditClient && (
            <Typography variant="body2" color="text.secondary">
              Línea de crédito:{" "}
              <Box
                component="span"
                sx={{ color: theme.palette.primary.main }}
              >
                {formatCurrency(creditAuthorized)}
              </Box>
            </Typography>
          )}
        </Stack>
        <Stack
          spacing={1.5}
          alignItems={{ xs: "flex-start", sm: "flex-end" }}
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          <ClientDetailActions
            status={clientStatus}
            showDeactivateAction={canDeactivateClient}
            deactivateDisabled={!isClientActive}
            onDeactivateClick={() => setDeactivateModalOpen(true)}
          />
          {isCreditClient && (
            <CreditLimitBar
              creditLimit={creditAuthorized}
              creditUsed={creditUsed}
              creditAvailable={creditAvailable}
            />
          )}
        </Stack>
      </Stack>
      <DeactivateClientModal
        open={deactivateModalOpen}
        clientId={header.id}
        onClose={() => setDeactivateModalOpen(false)}
        onSuccess={async () => {
          await Promise.all([
            queryClient.invalidateQueries({
              queryKey: ["clients", "detail", numericClientId],
            }),
            queryClient.invalidateQueries({
              queryKey: ["clients", "collection-activities", numericClientId],
            }),
            queryClient.invalidateQueries({
              queryKey: ["sale-credits", "active", numericClientId],
            }),
          ]);
        }}
      />
      <Divider />
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        justifyContent="space-between"
        alignItems="center"
      >
        <TabFilters
          showSearch={false}
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={(value: string) => setActiveTab(value)}
        />

        <Button
          variant="contained"
          color="primary"
          disabled={validatingPayment || !isClientActive}
          sx={{
            minWidth: {
              xs: "100%",
              sm: "144px",
            },
          }}
          onClick={() => {
            void handleAddPaymentClick();
          }}
        >
          Agregar abono
        </Button>
      </Stack>

      {renderTabContent()}
    </Stack>
  );
}
