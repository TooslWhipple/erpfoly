import { useEffect } from "react";
import { useRouter } from "next/router";
import { Stack, Typography } from "@mui/material";
import { ArrowLeft } from "lucide-react";
import { CashRegisterHistory } from "@/components/CashRegister";
import { InlineMobileMenuButton } from "@/components/Layout";
import { BackButton } from "@/components/Breadcrumbs/Breadcrumbs.styles";
import { PageHeader, PageShell } from "@/components/SaleBuilder/styles";
import { CashRegisterPageContent } from "@/styles/cajas.styles";
import { useCashRegisterSession } from "@/hooks/useCashRegisterSession";
import { useSnackbarStore } from "@/store/useSnackbarStore";

export default function CajasHistorialPage() {
  const router = useRouter();
  const showError = useSnackbarStore((state) => state.showError);
  const { cashRegister, movements, isLoading } = useCashRegisterSession({
    loadMovementsOnOpen: true,
  });
  useEffect(() => {
    if (isLoading || !cashRegister) return;
    if (cashRegister.status === "closed") {
      showError("La caja debe estar abierta para ver el historial.");
      router.replace("/cajas");
    }
  }, [isLoading, cashRegister, showError, router]);
  const handleBack = () => {
    router.push("/cajas");
  };
  if (isLoading) {
    return (
      <PageShell
        sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}
      >
        <PageHeader>
          <InlineMobileMenuButton />
        </PageHeader>
        <Stack flex={1} justifyContent="center" alignItems="center">
          <Typography variant="body1">Cargando...</Typography>
        </Stack>
      </PageShell>
    );
  }
  if (!cashRegister) {
    return (
      <PageShell
        sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}
      >
        <PageHeader>
          <InlineMobileMenuButton />
        </PageHeader>
        <Stack flex={1} justifyContent="center" alignItems="center" px={2}>
          <Typography variant="h6" color="text.secondary">
            No tienes una caja asignada
          </Typography>
        </Stack>
      </PageShell>
    );
  }
  if (cashRegister.status === "closed") {
    return null;
  }
  return (
    <PageShell>
      <PageHeader>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          minWidth={0}
          flex="1 1 auto"
        >
          <InlineMobileMenuButton />
          <BackButton onClick={handleBack} size="small">
            <ArrowLeft size={20} />
          </BackButton>
          <Typography variant="h6" fontWeight={700} noWrap>
            Historial de actividad de la caja
          </Typography>
        </Stack>
      </PageHeader>
      <CashRegisterPageContent>
        <CashRegisterHistory movements={movements} />
      </CashRegisterPageContent>
    </PageShell>
  );
}
