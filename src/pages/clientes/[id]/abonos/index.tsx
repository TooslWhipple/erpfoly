import { useMemo } from "react";
import { useRouter } from "next/router";
import {
  Alert,
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
import { Card } from "@/styles/clientes/abonos.styles";

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
    selections,
    paymentMethod,
    isCashDeposit,
    paymentAmount,
    isSubmitting,
    paymentResult,
    subtotal,
    totalIva,
    totalDue,
    change,
    canRegister,
    setPaymentMethod,
    setIsCashDeposit,
    setPaymentAmount,
    canSelectInstallment,
    canEditAmount,
    toggleInstallment,
    updateAmountToPay,
    clearError,
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
          onDownloadReceipt={paymentResult.receiptUrl ? handleDownloadReceipt : undefined}
        />
      </Stack>
    );
  }

  const hasCredits = context.creditAccounts.length > 0;

  return (
    <Stack spacing={3}>
      <Breadcrumbs items={breadcrumbs} showBackButton onBack={handleBack} />
      <Divider />

      {error && (
        <Alert severity="error" onClose={clearError}>
          {error}
        </Alert>
      )}

      {!hasCredits ? (
        <Card>
          <Stack spacing={2} alignItems="flex-start">
            <Typography variant="h6" fontWeight={600}>
              Sin créditos activos
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Este cliente no tiene ventas a crédito pendientes de cobro.
            </Typography>
            <Button variant="outlined" onClick={handleBack}>
              Volver
            </Button>
          </Stack>
        </Card>
      ) : (
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
              <Typography variant="body2" color="text.secondary">
                Deben ir en orden por crédito (sin saltar parcialidades). Solo la última seleccionada puede ser un abono parcial.
              </Typography>

              {context.creditAccounts.map((account) => (
                <CreditAccountCard
                  key={account.id}
                  account={account}
                  selections={selections}
                  canSelectInstallment={canSelectInstallment}
                  canEditAmount={canEditAmount}
                  onToggleInstallment={toggleInstallment}
                  onAmountChange={updateAmountToPay}
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
                subtotal={subtotal}
                totalIva={totalIva}
                totalDue={totalDue}
              />
              <PaymentCapturePanel
                paymentAmount={paymentAmount}
                paymentMethod={paymentMethod}
                isCashDeposit={isCashDeposit}
                change={change}
                canRegister={canRegister}
                isSubmitting={isSubmitting}
                onPaymentAmountChange={setPaymentAmount}
                onPaymentMethodChange={setPaymentMethod}
                onCashDepositChange={setIsCashDeposit}
                onSubmit={() => void submitPayment()}
              />
            </Stack>
          </Grid>
        </Grid>
      )}
    </Stack>
  );
}
