import { useState } from "react";
import { Stack, Typography } from "@mui/material";
import { ConfirmModal } from "@/components/ConfirmModal";
import NumberSpinner from "@/components/NumberSpinner";
import type { TransferDetail } from "@/types/transfers.types";

export interface ShipTransferModalProps {
  detail: TransferDetail;
  loading: boolean;
  onClose: () => void;
  /** `items` va vacío en los ligados: salen completos. */
  onSubmit: (items: Array<{ order_item_id: number; quantity: number }> | undefined) => Promise<unknown>;
}

/** Envío: en los normales el origen decide cuánto sale por artículo (RN-056); los ligados salen completos. */
export function ShipTransferModal({ detail, loading, onClose, onSubmit }: ShipTransferModalProps) {
  const linked = detail.sale !== null;
  const [quantities, setQuantities] = useState<Record<number, number>>(() =>
    Object.fromEntries(detail.order_items.map((item) => [item.id, item.requested_quantity])),
  );

  const handleConfirm = async () => {
    await onSubmit(
      linked
        ? undefined
        : detail.order_items.map((item) => ({
            order_item_id: item.id,
            quantity: quantities[item.id],
          })),
    );
  };

  return (
    <ConfirmModal
      open
      onClose={onClose}
      onConfirm={handleConfirm}
      loading={loading}
      title="Enviar traspaso"
      description={
        linked
          ? `El traspaso está ligado a la venta ${detail.sale?.folio} y sale completo.`
          : "Indica cuántas piezas salen de cada artículo. Lo que no se envíe queda sin atender."
      }
      confirmLabel="Enviar"
      type="primary"
    >
      <Stack spacing={1.5}>
        {detail.order_items.map((item) => (
          <Stack key={item.id} direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
            <Stack minWidth={0}>
              <Typography variant="subtitle2" noWrap title={item.product?.short_name}>
                {item.product?.short_name ?? "Sin nombre"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Pedido: {item.requested_quantity}
              </Typography>
            </Stack>
            {linked ? (
              <Typography variant="subtitle2">{item.requested_quantity}</Typography>
            ) : (
              <NumberSpinner
                value={quantities[item.id]}
                min={0}
                max={item.requested_quantity}
                onChange={(value) => setQuantities((prev) => ({ ...prev, [item.id]: value }))}
                inputAriaLabel={`Piezas a enviar de ${item.product?.short_name ?? "artículo"}`}
              />
            )}
          </Stack>
        ))}
      </Stack>
    </ConfirmModal>
  );
}
