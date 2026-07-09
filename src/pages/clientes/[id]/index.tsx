import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Skeleton, Typography, Button, Stack, Divider } from "@mui/material";
import numeral from "numeral";
import { Breadcrumbs, CreditLimitBar, TabFilters } from "@/components";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import type { ClientDetail } from "@/types/clientes.types";
import { getClientDetail as getClientDetailMock } from "@/data/clientes.mockData";
import {
  ActivityTab,
  MovementsTab,
  PurchasesTab,
  PaymentsTab,
  InformationTab,
} from "../components";
import { ErrorState } from "@/styles/clientes/detalle.styles";
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
import { unwrapOrThrow } from "@/lib/axios";
function formatCurrency(value: number): string {
  return numeral(value).format("$0,0.00");
}
const TABS = [
  {
    value: "actividad",
    label: "Actividad",
  },
  {
    value: "movimientos",
    label: "Movimientos",
  },
  {
    value: "compras",
    label: "Compras",
  },
  {
    value: "abonos",
    label: "Abonos",
  },
  {
    value: "informacion",
    label: "Información",
  },
];
export default function ClientDetailPage() {
  const router = useRouter();
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { id } = router.query;
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("actividad");
  useEffect(() => {
    if (id && typeof id === "string") {
      loadClient(id);
    }
  }, [id]);
  const numericClientId =
    typeof id === "string" && Number.isFinite(Number(id)) ? Number(id) : null;
  const loadClient = async (clientId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getClientDetailMock(clientId);
      setClient(data ?? null);
      if (!data) setError("Cliente no encontrado");
    } catch (err) {
      console.error("[ClientDetail] Error loading client:", err);
      setError("Error al cargar el cliente");
    } finally {
      setLoading(false);
    }
  };
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
  const clientHeaderQuery = useQuery({
    queryKey: ["clients", "detail", numericClientId],
    enabled: numericClientId !== null,
    queryFn: async () => {
      const result = await getClientDetail(numericClientId as number);
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
  const breadcrumbs: BreadcrumbItem[] = [
    {
      label: "Clientes",
      href: "/clientes",
    },
    {
      label: clientHeaderQuery.data?.fullName ?? client?.fullName ?? "...",
      href: client ? `/clientes/${client.id}` : undefined,
    },
  ];
  if (loading) {
    return (
      <Stack spacing={3}>
        <Breadcrumbs
          items={breadcrumbs}
          showBackButton
          onBack={() => router.push("/clientes")}
        />
        <Stack spacing={3}>
          <Skeleton
            variant="rectangular"
            height={220}
            sx={{
              borderRadius: 2,
            }}
          />
          <Skeleton
            variant="rectangular"
            height={320}
            sx={{
              borderRadius: 2,
            }}
          />
        </Stack>
      </Stack>
    );
  }
  if (error || !client) {
    return (
      <Stack spacing={3}>
        <Breadcrumbs
          items={breadcrumbs}
          showBackButton
          onBack={() => router.push("/clientes")}
        />
        <ErrorState>
          <Typography>{error ?? "Cliente no encontrado"}</Typography>
          <Button variant="outlined" onClick={() => router.push("/clientes")}>
            Volver al listado
          </Button>
        </ErrorState>
      </Stack>
    );
  }
  const renderTabContent = () => {
    switch (activeTab) {
      case "actividad":
        return (
          <ActivityTab
            client={client}
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
        return <InformationTab />;
      default:
        return null;
    }
  };
  return (
    <Stack spacing={3}>
      <Breadcrumbs
        items={breadcrumbs}
        showBackButton
        onBack={() => router.push("/clientes")}
      />
      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        spacing={{
          xs: 1,
          sm: 0,
        }}
        justifyContent="space-between"
        alignItems={{
          xs: "flex-start",
          sm: "center",
        }}
      >
        <Stack spacing={0.5} flex={1}>
          <Typography variant="body2" color="text.secondary">
            {clientHeaderQuery.data?.curp || client.clientId}
          </Typography>
          <Typography variant="h5">
            {clientHeaderQuery.data?.fullName ?? client.fullName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Línea de crédito:{" "}
            <span
              style={{
                color: theme.palette.primary.main,
              }}
            >
              {formatCurrency(
                clientHeaderQuery.data?.creditLine.authorized ??
                  client.creditLine,
              )}
            </span>
          </Typography>
          <Typography variant="body2" color="text.primary">
            Pago requerido{" "}
            <strong>{formatCurrency(client.requiredPayment)}</strong>{" "}
            <span
              style={{
                color: theme.palette.error.main,
              }}
            >
              {client.requiredPaymentDate} ({client.requiredPaymentLabel})
            </span>
          </Typography>
        </Stack>
        <CreditLimitBar
          creditLimit={
            clientHeaderQuery.data?.creditLine.authorized ?? client.creditLine
          }
          creditUsed={
            clientHeaderQuery.data
              ? Math.max(
                  clientHeaderQuery.data.creditLine.authorized -
                    (clientHeaderQuery.data.creditLine.available ?? 0),
                  0,
                )
              : client.creditUsed
          }
          creditAvailable={
            clientHeaderQuery.data?.creditLine.available ??
            client.creditAvailable
          }
        />
      </Stack>
      <Divider />
      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
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
          sx={{
            minWidth: {
              xs: "100%",
              sm: "144px",
            },
          }}
          onClick={() => router.push(`/clientes/${id}/abonos`)}
        >
          Agregar abono
        </Button>
      </Stack>

      {renderTabContent()}
    </Stack>
  );
}
