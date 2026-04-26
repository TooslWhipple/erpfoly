import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Skeleton, Typography, Button, Stack, Divider } from "@mui/material";
import numeral from "numeral";
import { MainLayout, Breadcrumbs, Tabs, CreditLimitBar, TabFilters } from "@/components";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import type { ClientDetail } from "@/types/clientes.types";
import { getClientDetail } from "@/data/clientes.mockData";
import {
  ActivityTab,
  MovementsTab,
  PurchasesTab,
  PaymentsTab,
  InformationTab,
} from "./components";
import {
  ErrorState,
} from "@/styles/clientes/detalle.styles";
import { useTheme } from "@mui/material/styles";

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

export default function ClientDetailPage() {
  const router = useRouter();
  const theme = useTheme();

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

  const loadClient = async (clientId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getClientDetail(clientId);
      setClient(data ?? null);
      if (!data) setError("Cliente no encontrado");
    } catch (err) {
      console.error("[ClientDetail] Error loading client:", err);
      setError("Error al cargar el cliente");
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Clientes", href: "/clientes" },
    { label: client?.fullName ?? "...", href: client ? `/clientes/${client.id}` : undefined },
  ];

  if (loading) {
    return (
      <MainLayout>
        <Stack spacing={3}>
          <Breadcrumbs items={breadcrumbs} showBackButton onBack={() => router.push("/clientes")} />
          <Stack spacing={3}>
            <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 2 }} />
          </Stack>
        </Stack>
      </MainLayout>
    );
  }

  if (error || !client) {
    return (
      <MainLayout>
        <Stack spacing={3}>
          <Breadcrumbs items={breadcrumbs} showBackButton onBack={() => router.push("/clientes")} />
          <ErrorState>
            <Typography>{error ?? "Cliente no encontrado"}</Typography>
            <Button variant="outlined" onClick={() => router.push("/clientes")}>
              Volver al listado
            </Button>
          </ErrorState>
        </Stack>
      </MainLayout>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "actividad":
        return <ActivityTab client={client} />;
      case "movimientos":
        return <MovementsTab client={client} />;
      case "compras":
        return <PurchasesTab client={client} />;
      case "abonos":
        return <PaymentsTab client={client} />;
      case "informacion":
        return <InformationTab />;
      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <Stack spacing={3}>
        <Breadcrumbs items={breadcrumbs} showBackButton onBack={() => router.push("/clientes")} />
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems="center">
          <Stack spacing={0.5} flex={1}>
            <Typography variant="body2" color="text.secondary">{client.clientId}</Typography>
            <Typography variant="h5">{client.fullName}</Typography>
            <Typography variant="body2" color="text.secondary">Línea de crédito: <span style={{ color: theme.palette.primary.main }}>{formatCurrency(client.creditLine)}</span></Typography>
            <Typography variant="body2" color="text.primary">
              Pago requerido <strong>{formatCurrency(client.requiredPayment)}</strong>{" "}
              <span style={{ color: theme.palette.error.main }}>{client.requiredPaymentDate} ({client.requiredPaymentLabel})</span>
            </Typography>
          </Stack>
          <CreditLimitBar
            creditLimit={client.creditLine}
            creditUsed={client.creditUsed}
            creditAvailable={client.creditAvailable}
          />
        </Stack>
        <Divider />
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" alignItems="center">
          <TabFilters
            showSearch={false}
            tabs={TABS}
            activeTab={activeTab}
            onTabChange={(value: string) => setActiveTab(value)}
          />

          <Button variant="contained" color="primary">
            Agregar abono
          </Button>
        </Stack>

        {
          renderTabContent()
        }
      </Stack>

    </MainLayout>
  );
}
