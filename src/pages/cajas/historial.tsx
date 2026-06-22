import { useEffect } from "react";
import { useRouter } from "next/router";
import { Divider, Stack, Typography } from "@mui/material";
import { MainLayout } from "@/components";
import { CashRegisterHistory } from "@/components/CashRegister";
import type { CashRegisterStatus } from "@/styles/cajas.styles";
import { useCashRegisterSession } from "@/hooks/useCashRegisterSession";
import { useSnackbarStore } from "@/store/useSnackbarStore";

function getCashRegisterStatusLabel(status: CashRegisterStatus): string {
  return status === "open" ? "Abierta" : "Cerrada";
}

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
      <MainLayout>
        <Stack justifyContent="center" alignItems="center" style={{ marginTop: "112px", minHeight: "200px" }}>
          <Typography variant="body1">Cargando...</Typography>
        </Stack>
      </MainLayout>
    );
  }

  if (!cashRegister) {
    return (
      <MainLayout>
        <Stack justifyContent="center" alignItems="center" style={{ marginTop: "112px", minHeight: "200px" }}>
          <Typography variant="h6" color="text.secondary">
            No tienes una caja asignada
          </Typography>
        </Stack>
      </MainLayout>
    );
  }

  if (cashRegister.status === "closed") {
    return null;
  }

  return (
    <MainLayout>
      <Stack spacing={3} justifyContent="center" alignItems="stretch">
        <CashRegisterHistory
          cashRegisterName={cashRegister.name}
          cashRegisterStatusLabel={getCashRegisterStatusLabel(cashRegister.status)}
          cashRegisterStatus={cashRegister.status}
          movements={movements}
          onBack={handleBack}
        />
      </Stack>
    </MainLayout>
  );
}
