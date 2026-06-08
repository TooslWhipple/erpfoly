import { useMemo } from "react";
import { useRouter } from "next/router";
import { Button, Divider, Skeleton, Stack, Typography } from "@mui/material";
import { MainLayout, Breadcrumbs } from "@/components";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import { useClientPayment } from "@/hooks/clientes/useClientPayment";
import {
  CreditAccountCard,
  PaymentCapturePanel,
  PaymentSuccessView,
  PaymentSummaryPanel,
} from "../../abonos/components";
import { ErrorState } from "@/styles/clientes/detalle.styles";
import { Card, PageLayout, SidebarColumn } from "@/styles/clientes/abonos.styles";

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
    totalInterest,
    totalDue,
    change,
    canRegister,
    setPaymentMethod,
    setIsCashDeposit,
    setPaymentAmount,
    toggleInstallment,
    updateAmountToPay,
    submitPayment,
    refetch,
  } = useClientPayment();

  const breadcrumbs: BreadcrumbItem[] = useMemo(() => {
    const clientName = context?.clientName ?? "...";

    if (fromCashRegister) {
      return [
        { label: cashRegisterName ?? "Caja", href: "/cajas" },
        { label: "Abonos", href: "/cajas" },
        { label: "Clientes", href: "/clientes" },
        {
          label: clientName,
          href: clientId ? `/clientes/${clientId}` : undefined,
        },
        { label: "Abono" },
      ];
    }

    return [
      { label: "Clientes", href: "/clientes" },
      {
        label: clientName,
        href: clientId ? `/clientes/${clientId}` : undefined,
      },
      { label: "Abono" },
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
      <MainLayout>
        <Stack spacing={3}>
          <Skeleton variant="text" width="60%" height={32} />
          <Skeleton variant="rectangular" height={420} sx={{ borderRadius: 2 }} />
        </Stack>
      </MainLayout>
    );
  }

  if (error && !context) {
    return (
      <MainLayout>
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
      </MainLayout>
    );
  }

  if (!context) {
    return null;
  }

  if (paymentResult) {
    return (
      <MainLayout>
        <Stack spacing={3}>
          <Breadcrumbs items={breadcrumbs} showBackButton onBack={handleBack} />
          <PaymentSuccessView
            result={paymentResult}
            onDownloadReceipt={handleDownloadReceipt}
          />
        </Stack>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Stack spacing={3}>
        <Breadcrumbs items={breadcrumbs} showBackButton onBack={handleBack} />
        <Divider />
        <PageLayout>
          <Card>
            <Typography variant="h6" fontWeight={600}>Selecciona las letras que deseas cobrar:</Typography>

            {
              context.creditAccounts.map((account) => (
                <CreditAccountCard
                  key={account.id}
                  account={account}
                  selections={selections}
                  onToggleInstallment={toggleInstallment}
                  onAmountChange={updateAmountToPay}
                />
              ))
            }
          </Card>

          <SidebarColumn>
            <PaymentSummaryPanel
              subtotal={subtotal}
              totalInterest={totalInterest}
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
          </SidebarColumn>
        </PageLayout>

        {
          error && (
            <Typography variant="body2" color="error.main">
              {error}
            </Typography>
          )
        }
      </Stack>
    </MainLayout>
  );
}
