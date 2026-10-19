import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Alert, Button, CircularProgress, Stack } from "@mui/material";
import { Title } from "@/components";
import { HandoverQueue } from "@/components/HandoverCounter";
import { InlineBranchSelect } from "@/components/InlineBranchSelect";
import { useHandoverBranches } from "@/hooks/sale-handover/useHandoverBranches";
import { useAuthStore } from "@/store/useAuthStore";

export default function EntregasPage() {
  const router = useRouter();
  const principalBranchId = useAuthStore((state) => state.user?.principalBranchId);
  const {
    data: branches = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useHandoverBranches();
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);

  const defaultBranchId = useMemo(() => {
    if (branches.length === 0) return null;
    const principal = branches.find((branch) => branch.id === principalBranchId);
    return (principal ?? branches[0]).id;
  }, [branches, principalBranchId]);

  const branchId =
    selectedBranchId !== null &&
    branches.some((branch) => branch.id === selectedBranchId)
      ? selectedBranchId
      : defaultBranchId;

  const handleOpenSale = (saleId: number) => {
    if (branchId === null) return;
    void router.push({
      pathname: "/entregas/[saleId]",
      query: { saleId: String(saleId), branchId: String(branchId) },
    });
  };

  return (
    <Stack spacing={3}>
      <Title title="Entregas" />

      {isLoading ? (
        <Stack alignItems="center" py={6}>
          <CircularProgress size={28} />
        </Stack>
      ) : null}

      {isError ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => void refetch()}>
              Reintentar
            </Button>
          }
        >
          {error instanceof Error
            ? error.message
            : "No se pudieron cargar las sucursales."}
        </Alert>
      ) : null}

      {!isLoading && !isError && branches.length === 0 ? (
        <Alert severity="info">
          No tienes sucursales asignadas para operar entregas.
        </Alert>
      ) : null}

      {branchId !== null ? (
        <>
          <InlineBranchSelect
            label="Sucursal de entrega"
            value={branchId}
            options={branches}
            onChange={setSelectedBranchId}
          />
          <HandoverQueue branchId={branchId} onOpenSale={handleOpenSale} />
        </>
      ) : null}
    </Stack>
  );
}
