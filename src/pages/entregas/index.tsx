import { useState } from "react";
import { useRouter } from "next/router";
import {
  Alert,
  Button,
  CircularProgress,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import { Title } from "@/components";
import { HandoverQueue } from "@/components/HandoverCounter";
import { useHandoverBranches } from "@/hooks/sale-handover/useHandoverBranches";

export default function EntregasPage() {
  const router = useRouter();
  const {
    data: branches = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useHandoverBranches();
  // `null` = «Todas las sucursales» (se omite `branchId` en la cola).
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);

  const branchId =
    selectedBranchId !== null &&
    branches.some((branch) => branch.id === selectedBranchId)
      ? selectedBranchId
      : null;

  // FOLY-276: una venta puede listarse en varias ubicaciones; se abre en la
  // de la fila.
  const handleOpenSale = (saleId: number, deliveryBranchId?: number) => {
    void router.push({
      pathname: "/entregas/[saleId]",
      query: {
        saleId: String(saleId),
        ...(deliveryBranchId ? { branchId: String(deliveryBranchId) } : {}),
      },
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

      {branches.length > 0 ? (
        <>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
            <TextField
              select
              size="small"
              label="Sucursal de entrega"
              value={branchId === null ? "all" : String(branchId)}
              onChange={(event) =>
                setSelectedBranchId(
                  event.target.value === "all" ? null : Number(event.target.value),
                )
              }
              sx={{ minWidth: 240 }}
            >
              <MenuItem value="all">Todas las sucursales</MenuItem>
              {branches.map((branch) => (
                <MenuItem key={branch.id} value={String(branch.id)}>
                  {branch.name}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          <HandoverQueue
            branchId={branchId}
            onOpenSale={handleOpenSale}
          />
        </>
      ) : null}
    </Stack>
  );
}
