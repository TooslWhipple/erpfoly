import { useMemo } from "react";
import { useRouter } from "next/router";
import {
  Button,
  Divider,
  Grid,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { Breadcrumbs } from "@/components";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import { useClientPayment } from "@/hooks/clientes/useClientPayment";
import {
  CreditAccountCard,
  PaymentCapturePanel,
  PaymentSuccessView,
  PaymentSummaryPanel,
} from "../../abonos/components";
import { ErrorState } from "@/styles/clientes/detalle.styles";
import {
  Card,
  PageLayout,
  SidebarColumn,
} from "@/styles/clientes/abonos.styles";
export default function ClientPaymentPage() {
  const router = useRouter();
  const {
    routerReady,
    clientId,
    fromCashRegister,
    cashRegisterName,
    context,
    loading,
    error,
    paymentMethod,
    isCashDeposit,
    paymentAmount,
    isSubmitting,
    paymentResult,
    totalOutstanding,
    change,
    canRegister,
    orderedCreditAccounts,
    excludedCreditIds,
    cascadePreview,
    totalPendingInstallmentsCount,
    paymentTerminalId,
    paymentTerminals,
    paymentTerminalsLoading,
    setPaymentMethod,
    setIsCashDeposit,
    setPaymentAmount,
    setPaymentAmountByInstallmentCount,
    setPaymentTerminalId,
    toggleCreditExcluded,
    moveCreditOrder,
    submitPayment,
    refetch,
  } = useClientPayment();
  const breadcrumbs: BreadcrumbItem[] = useMemo(() => {
    const clientName = context?.clientName ?? "...";
    if (fromCashRegister) {
      return [
        {
          label: cashRegisterName ?? "Caja",
          href: "/cajas",
        },
        {
          label: "Abonos",
          href: "/cajas",
        },
        {
          label: "Clientes",
          href: "/clientes",
        },
        {
          label: clientName,
          href: clientId ? `/clientes/${clientId}` : undefined,
        },
        {
          label: "Abono",
        },
      ];
    }
    return [
      {
        label: "Clientes",
        href: "/clientes",
      },
      {
        label: clientName,
        href: clientId ? `/clientes/${clientId}` : undefined,
      },
      {
        label: "Abono",
      },
    ];
  }, [cashRegisterName, clientId, context?.clientName, fromCashRegister]);
  const handleBack = () => {
    if (fromCashRegister) {
      router.push("/cajas");
      return;
    }
    if (clientId) {
      router.push(`/clientes/${clientId}`);
      return;
    }
    router.push("/clientes");
  };
  const handleDownloadReceipt = () => {
    if (!paymentResult?.receiptUrl) return;
    const link = document.createElement("a");
    link.href = paymentResult.receiptUrl;
    link.download = `comprobante-${paymentResult.id}.pdf`;
    link.click();
  };
  if (!routerReady || loading) {
    return (
      <Stack spacing={3}>
        <Skeleton variant="text" width="60%" height={32} />
        <Skeleton
          variant="rectangular"
          height={420}
          sx={{
            borderRadius: 2,
          }}
        />
      </Stack>
    );
  }
  if (error && !context) {
    return (
      <Stack spacing={3}>
        <Breadcrumbs items={breadcrumbs} showBackButton onBack={handleBack} />
        <ErrorState>
          <Typography>{error}</Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={handleBack}>
              Volver
            </Button>
            <Button variant="contained" onClick={refetch}>
              Reintentar
            </Button>
          </Stack>
        </ErrorState>
      </Stack>
    );
  }
  if (!context) {
    return null;
  }
  if (paymentResult) {
    return (
      <Stack spacing={3}>
        <Breadcrumbs items={breadcrumbs} showBackButton onBack={handleBack} />
        <PaymentSuccessView
          result={paymentResult}
          onDownloadReceipt={handleDownloadReceipt}
        />
      </Stack>
    );
  }
  return (
    <Stack spacing={3}>
      <Breadcrumbs items={breadcrumbs} showBackButton onBack={handleBack} />
      <Divider />
      <Grid container spacing={3}>
        <Grid
          size={{
            xs: 12,
            lg: 8,
            xl: 9,
          }}
        >
          <Card>
            <Typography variant="h6" fontWeight={600}>
              Selecciona las letras que deseas cobrar:
            </Typography>

            {orderedCreditAccounts.map((account, index) => (
              <CreditAccountCard
                key={account.id}
                account={account}
                cascadePreview={cascadePreview}
                excludedFromCascade={excludedCreditIds.includes(account.id)}
                onToggleExcluded={toggleCreditExcluded}
                canMoveUp={index > 0}
                canMoveDown={index < orderedCreditAccounts.length - 1}
                onMoveUp={(purchaseId) => moveCreditOrder(purchaseId, "up")}
                onMoveDown={(purchaseId) => moveCreditOrder(purchaseId, "down")}
              />
            ))}
          </Card>
        </Grid>
        <Grid
          size={{
            xs: 12,
            lg: 4,
            xl: 3,
          }}
        >
          <Stack width="100%" spacing={2}>
            <PaymentSummaryPanel
              totalOutstanding={totalOutstanding}
              paymentAmount={paymentAmount}
            />
            <PaymentCapturePanel
              paymentAmount={paymentAmount}
              paymentMethod={paymentMethod}
              isCashDeposit={isCashDeposit}
              change={change}
              canRegister={canRegister}
              isSubmitting={isSubmitting}
              paymentTerminalId={paymentTerminalId}
              paymentTerminals={paymentTerminals}
              paymentTerminalsLoading={paymentTerminalsLoading}
              totalPendingInstallmentsCount={totalPendingInstallmentsCount}
              onPaymentAmountChange={setPaymentAmount}
              onPaymentMethodChange={setPaymentMethod}
              onCashDepositChange={setIsCashDeposit}
              onPaymentTerminalChange={setPaymentTerminalId}
              onInstallmentCountChange={setPaymentAmountByInstallmentCount}
              onSubmit={() => void submitPayment()}
            />
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}
