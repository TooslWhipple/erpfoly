import {
  cancelTransfer,
  correctTransferShipment,
  escalateTransferIncident,
  receiveTransfer,
  reportTransferIncident,
  shipTransfer,
  withdrawTransferIncident,
} from "@/services/transfers.service";
import type { TransferDetail } from "@/types/transfers.types";
import { CorrectShipmentModal } from "./CorrectShipmentModal";
import { NotesDialog } from "./NotesDialog";
import { ReportIncidentModal } from "./ReportIncidentModal";
import { ShipTransferModal } from "./ShipTransferModal";
import { useTransferActionRunner } from "./useTransferActionRunner";

export type TransferDialog =
  | { kind: "ship" | "receive" | "cancel" | "return_to_origin" | "report_incident" }
  | { kind: "correct_shipment" | "escalate" | "withdraw"; incidentId: number };

export interface TransferDialogsProps {
  detail: TransferDetail;
  active: TransferDialog | null;
  onClose: () => void;
  /** Se llama tras cualquier acción (o desfase 409) para recargar el detalle. */
  onChanged: () => void;
}

/** Los diálogos de las acciones del traspaso. Solo se monta el activo, así su estado no sobrevive. */
export function TransferDialogs({ detail, active, onClose, onChanged }: TransferDialogsProps) {
  const { run, busy } = useTransferActionRunner(onChanged);

  if (!active) return null;

  const finish = async (promise: Promise<boolean>) => {
    if (await promise) onClose();
  };

  switch (active.kind) {
    case "ship":
      return (
        <ShipTransferModal
          detail={detail}
          loading={busy}
          onClose={onClose}
          onSubmit={(items) =>
            finish(run(() => shipTransfer(detail.id, { items }), "Traspaso enviado."))
          }
        />
      );
    case "receive":
      return (
        <NotesDialog
          open
          onClose={onClose}
          loading={busy}
          title="Confirmar recepción"
          description="Se recibe todo lo enviado. Si algo no coincide, reporta la diferencia en lugar de confirmar."
          confirmLabel="Confirmar recepción"
          fieldLabel="Notas (opcional)"
          onSubmit={(notes) =>
            finish(run(() => receiveTransfer(detail.id, { notes: notes || undefined }), "Recepción confirmada."))
          }
        />
      );
    case "cancel":
    case "return_to_origin": {
      const isReturn = active.kind === "return_to_origin";
      return (
        <NotesDialog
          open
          onClose={onClose}
          loading={busy}
          type="error"
          title={isReturn ? "Regresar al origen" : "Cancelar traspaso"}
          description={
            isReturn
              ? "La mercancía en curso vuelve al inventario del origen."
              : "El traspaso se cancela y ya no podrá enviarse."
          }
          confirmLabel={isReturn ? "Regresar al origen" : "Cancelar traspaso"}
          fieldLabel="Motivo"
          required
          onSubmit={(reason) =>
            finish(
              run(
                () => cancelTransfer(detail.id, { reason }),
                isReturn ? "Regreso al origen registrado." : "Traspaso cancelado.",
              ),
            )
          }
        />
      );
    }
    case "report_incident":
      return (
        <ReportIncidentModal
          detail={detail}
          loading={busy}
          onClose={onClose}
          onSubmit={(payload) =>
            finish(run(() => reportTransferIncident(detail.id, payload), "Diferencia reportada."))
          }
        />
      );
    case "correct_shipment": {
      const incident = detail.incidents.find((entry) => entry.id === active.incidentId);
      if (!incident) return null;
      return (
        <CorrectShipmentModal
          detail={detail}
          incident={incident}
          loading={busy}
          onClose={onClose}
          onSubmit={(payload) =>
            finish(
              run(() => correctTransferShipment(detail.id, incident.id, payload), "Envío corregido."),
            )
          }
        />
      );
    }
    case "escalate":
      return (
        <NotesDialog
          open
          onClose={onClose}
          loading={busy}
          type="warning"
          title="Escalar a Auditoría"
          description="Auditoría decidirá si lo faltante es una pérdida en tránsito o apareció en el destino."
          confirmLabel="Escalar"
          fieldLabel="Notas"
          required
          onSubmit={(notes) =>
            finish(
              run(
                () => escalateTransferIncident(detail.id, active.incidentId, { notes }),
                "Incidencia escalada a Auditoría.",
              ),
            )
          }
        />
      );
    case "withdraw":
      return (
        <NotesDialog
          open
          onClose={onClose}
          loading={busy}
          title="Retirar incidencia"
          description="La incidencia se cancela y podrás confirmar la recepción."
          confirmLabel="Retirar"
          fieldLabel="Notas (opcional)"
          onSubmit={(notes) =>
            finish(
              run(
                () => withdrawTransferIncident(detail.id, active.incidentId, { notes: notes || undefined }),
                "Incidencia retirada.",
              ),
            )
          }
        />
      );
  }
}
