import { useCallback, useEffect, useState } from "react";
import { Button, Stack } from "@mui/material";
import { usePermissions } from "@/hooks/usePermissions";
import { ORDERS_UPDATE } from "@/lib/permissions";
import {
  adjustOrder,
  closeOrderRemainder,
  getOrderAdjustmentContext,
} from "@/services/orders.service";
import type { OrderAdjustmentContext } from "@/types/orders.types";
import { AdjustOrderModal } from "./AdjustOrderModal";
import { CloseOrderModal } from "./CloseOrderModal";
import { useOrderActionRunner } from "./useOrderActionRunner";

export interface OrderAdjustmentActionsProps {
  orderId: number;
  /** El estatus cambia tras ajustar o cerrar; al cambiar se vuelve a pedir el contexto. */
  status: string;
  /** Se llama tras cualquier acción (o desfase 409) para recargar el detalle. */
  onChanged: () => void;
}

type ActiveDialog = "adjust" | "close" | null;

/** Botones "Ajustar pedido" y "Cerrar remanente" con sus diálogos, según `allowed_actions`. */
export function OrderAdjustmentActions({ orderId, status, onChanged }: OrderAdjustmentActionsProps) {
  const { hasPermission } = usePermissions();
  const canUpdate = hasPermission(ORDERS_UPDATE);
  const [context, setContext] = useState<OrderAdjustmentContext | null>(null);
  const [dialog, setDialog] = useState<ActiveDialog>(null);

  // `refreshKey` fuerza otra lectura tras una acción; `status` la fuerza si el pedido cambió por fuera.
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!canUpdate) return;
    let cancelled = false;
    getOrderAdjustmentContext(orderId)
      .then((result) => {
        if (!cancelled) setContext(result.data ?? null);
      })
      .catch(() => {
        if (!cancelled) setContext(null);
      });
    return () => {
      cancelled = true;
    };
  }, [canUpdate, orderId, status, refreshKey]);

  const handleChanged = useCallback(() => {
    setRefreshKey((key) => key + 1);
    onChanged();
  }, [onChanged]);

  const { run, busy } = useOrderActionRunner(handleChanged);

  if (!canUpdate || !context) return null;
  const { adjust, closeRemainder } = context.allowed_actions;
  const showClose = context.status === "partially_delivered";
  if (!adjust && !showClose) return null;

  const finish = async (promise: Promise<boolean>) => {
    if (await promise) setDialog(null);
  };

  return (
    <>
      <Stack direction="row" spacing={1}>
        {adjust && (
          <Button variant="outlined" size="small" onClick={() => setDialog("adjust")}>
            Ajustar pedido
          </Button>
        )}
        {showClose && (
          <Button
            variant="outlined"
            size="small"
            color="warning"
            onClick={() => setDialog("close")}
          >
            Cerrar remanente
          </Button>
        )}
      </Stack>

      {dialog === "adjust" && (
        <AdjustOrderModal
          context={context}
          loading={busy}
          onClose={() => setDialog(null)}
          onSubmit={(payload) =>
            finish(run(() => adjustOrder(orderId, payload), "Se ajustó el pedido."))
          }
        />
      )}
      {dialog === "close" && (
        <CloseOrderModal
          context={context}
          loading={busy}
          closeAllowed={closeRemainder}
          onClose={() => setDialog(null)}
          onSubmit={(reason) =>
            finish(
              run(() => closeOrderRemainder(orderId, { reason }), "Se cerró el remanente del pedido."),
            )
          }
        />
      )}
    </>
  );
}
