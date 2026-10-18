import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Alert, Button, CircularProgress, Stack } from "@mui/material";
import { Title } from "@/components";
import {
  DeliveryConfigPanel,
  ExtendHoldDialog,
  HoldDetailModal,
  HoldsList,
  ReleaseHoldDialog,
} from "@/components/DeliveryHolds";
import { ROLE_CODES } from "@/constants/role-codes";
import { useHandoverBranches } from "@/hooks/sale-handover/useHandoverBranches";
import { usePermissions } from "@/hooks/usePermissions";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import type { HoldRow, ReleaseHoldResponse } from "@/types/saleHandover.types";
import { formatHoldAmount } from "@/components/DeliveryHolds/holds";

const HOLDS_QUERY_KEY = ["sale-handover", "holds"] as const;

export default function ResguardosPage() {
  const queryClient = useQueryClient();
  const { hasRole } = usePermissions();
  const showSuccess = useSnackbarStore((state) => state.showSuccess);
  const {
    data: branches = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useHandoverBranches();

  const [openSaleId, setOpenSaleId] = useState<number | null>(null);
  const [extendTarget, setExtendTarget] = useState<HoldRow | null>(null);
  const [releaseTarget, setReleaseTarget] = useState<HoldRow | null>(null);

  const refreshHolds = () =>
    queryClient.invalidateQueries({ queryKey: HOLDS_QUERY_KEY });

  const handleExtendDone = (extended: boolean) => {
    setExtendTarget(null);
    if (extended) showSuccess("Resguardo prorrogado.");
    void refreshHolds();
  };

  const handleReleaseDone = (result: ReleaseHoldResponse | null) => {
    setReleaseTarget(null);
    if (result) {
      const credited = formatHoldAmount(result.creditedAmount);
      showSuccess(
        result.saleCancelled
          ? `Resguardo regularizado: venta cancelada y ${credited} abonados como saldo a favor.`
          : `Resguardo regularizado: ${credited} abonados como saldo a favor.`,
      );
      setOpenSaleId(null);
    }
    void refreshHolds();
  };

  return (
    <Stack spacing={3}>
      <Title title="Resguardos" />

      {hasRole(ROLE_CODES.ADMINISTRADOR) ? <DeliveryConfigPanel /> : null}

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
          {error instanceof Error ? error.message : "No se pudieron cargar las sucursales."}
        </Alert>
      ) : null}

      {!isLoading && !isError ? (
        <HoldsList branches={branches} onOpenHold={setOpenSaleId} />
      ) : null}

      <HoldDetailModal
        saleId={openSaleId}
        onClose={() => setOpenSaleId(null)}
        onExtend={setExtendTarget}
        onRelease={setReleaseTarget}
      />
      <ExtendHoldDialog
        hold={extendTarget}
        onClose={() => setExtendTarget(null)}
        onDone={handleExtendDone}
      />
      <ReleaseHoldDialog
        hold={releaseTarget}
        onClose={() => setReleaseTarget(null)}
        onDone={handleReleaseDone}
      />
    </Stack>
  );
}
