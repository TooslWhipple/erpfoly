import { Alert, type SxProps, type Theme } from "@mui/material";
import type { BlockReason, IncomingTransfer } from "@/types/saleHandover.types";
import { getOrderStatusLabel } from "@/utils/orderStatus";
import { handoverNotice } from "./handover";

type Props = {
  blockReason: BlockReason | null;
  incomingTransfers: IncomingTransfer[];
  sx?: SxProps<Theme>;
};

/** Aviso de bloqueo y/o traspasos entrantes de una venta (tarjeta y detalle). */
export function HandoverNotice({ blockReason, incomingTransfers, sx }: Props) {
  const { warning, transferLines } = handoverNotice(
    blockReason,
    incomingTransfers,
    getOrderStatusLabel,
  );
  if (!warning && transferLines.length === 0) return null;
  return (
    <>
      {warning ? (
        <Alert severity="warning" sx={sx}>
          {warning}
        </Alert>
      ) : null}
      {transferLines.length > 0 ? (
        <Alert severity="info" sx={sx}>
          {transferLines.map((line) => (
            <div key={line}>{line}</div>
          ))}
        </Alert>
      ) : null}
    </>
  );
}
