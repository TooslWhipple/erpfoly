import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Button, Divider, Skeleton, Stack, Typography } from "@mui/material";
import { Breadcrumbs, TabFilters } from "@/components";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import { useClientPurchaseDetail } from "@/hooks/clientes/useClientPurchaseDetail";
import {
  PaymentHistoryTab,
  PurchaseDataTab,
  PurchaseDetailActions,
  PurchaseDetailSummary,
} from "../../compras/components";
import { ErrorState } from "@/styles/clientes/detalle.styles";

const PURCHASE_TABS = [
  { value: "payment-history", label: "Historial de pagos" },
  { value: "purchase-data", label: "Datos de la compra" },
];

export default function ClientPurchaseDetailPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("payment-history");

  const {
    routerReady,
    clientId,
    purchase,
    loading,
    error,
    refetch,
  } = useClientPurchaseDetail();

  const breadcrumbs: BreadcrumbItem[] = useMemo(
    () => [
      { label: "Clientes", href: "/clientes" },
      {
        label: purchase?.clientName ?? "...",
        href: clientId ? `/clientes/${clientId}` : undefined,
      },
      { label: purchase?.productName ?? "..." },
    ],
    [clientId, purchase?.clientName, purchase?.productName],
  );

  const handleBack = () => {
    if (clientId) {
      router.push(`/clientes/${clientId}`);
      return;
    }
    router.push("/clientes");
  };

  if (!routerReady || loading) {
    return (
      <>
        <Stack spacing={3}>
          <Skeleton variant="text" width="60%" height={32} />
          <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rectangular" height={48} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rectangular" height={360} sx={{ borderRadius: 2 }} />
        </Stack>
      </>
    );
  }

  if (error || !purchase) {
    return (
      <>
        <Stack spacing={3}>
          <Breadcrumbs items={breadcrumbs} showBackButton onBack={handleBack} />
          <ErrorState>
            <Typography>{error ?? "Compra no encontrada"}</Typography>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" onClick={handleBack}>
                Volver al cliente
              </Button>
              <Button variant="contained" onClick={refetch}>
                Reintentar
              </Button>
            </Stack>
          </ErrorState>
        </Stack>
      </>
    );
  }

  return (
    <>
      <Stack spacing={3}>
        <Stack
          direction={{ xs: "column", lg: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", lg: "center" }}
          spacing={2}
        >
          <Breadcrumbs items={breadcrumbs} showBackButton onBack={handleBack} />
          <PurchaseDetailActions
            status={purchase.status}
            purchaseId={purchase.id}
            productName={purchase.productName}
            productSku={purchase.productSku}
            productImageUrl={purchase.productImageUrl}
          />
        </Stack>

        <PurchaseDetailSummary purchase={purchase} />

        <Divider />
        <TabFilters
          tabs={PURCHASE_TABS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {
          activeTab === "payment-history" &&
          <PaymentHistoryTab payments={purchase.payments} />
        }

        {
          activeTab === "purchase-data" &&
          <PurchaseDataTab purchaseInfo={purchase.purchaseInfo} />
        }
      </Stack>
    </>
  );
}
