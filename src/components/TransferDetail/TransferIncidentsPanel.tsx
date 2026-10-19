import { Button, Divider, Link, Stack, Typography } from "@mui/material";
import { StatusChip } from "@/components/StatusChip";
import type { TransferDialog } from "@/components/TransferActions";
import type { TransferDetail, TransferIncidentLineView, TransferIncidentView } from "@/types/transfers.types";
import { formatDate } from "@/utils/date";
import {
  DISCREPANCY_TYPE_LABELS,
  INCIDENT_RESOLUTION_LABELS,
  INCIDENT_STATUS_LABELS,
  INCIDENT_STATUS_VARIANTS,
  getIncidentButtons,
  type TransferViewer,
} from "@/utils/transfers";

export interface TransferIncidentsPanelProps {
  detail: TransferDetail;
  viewer: TransferViewer;
  onOpenDialog: (dialog: TransferDialog) => void;
  onRegisterDamage: (incident: TransferIncidentView, line: TransferIncidentLineView) => void;
}

export function TransferIncidentsPanel({
  detail,
  viewer,
  onOpenDialog,
  onRegisterDamage,
}: TransferIncidentsPanelProps) {
  if (detail.incidents.length === 0) return null;

  return (
    <Stack spacing={2}>
      <Typography variant="h6">Incidencias</Typography>
      {detail.incidents.map((incident) => {
        const buttons = getIncidentButtons(incident, detail, viewer);
        return (
          <Stack key={incident.id} spacing={1.5} p={2} border={1} borderColor="divider" borderRadius={2}>
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
              <Typography variant="subtitle1">
                Incidencia #{incident.id} · {formatDate(incident.created_at, "datetimeShort12h")}
              </Typography>
              <StatusChip
                size="small"
                label={INCIDENT_STATUS_LABELS[incident.status]}
                variant={INCIDENT_STATUS_VARIANTS[incident.status]}
              />
            </Stack>
            <Typography variant="body2">{incident.description}</Typography>
            <Stack spacing={0.5}>
              {incident.items.map((entry) => (
                <Stack key={entry.order_item_id} direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    {DISCREPANCY_TYPE_LABELS[entry.type]}: {entry.quantity} · {entry.product_name}
                  </Typography>
                  {buttons.registerDamage && (
                    <Button size="small" variant="text" onClick={() => onRegisterDamage(incident, entry)}>
                      Registrar daño
                    </Button>
                  )}
                </Stack>
              ))}
            </Stack>
            {incident.evidences.length > 0 && (
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
                <Typography variant="caption" color="text.secondary">
                  Evidencias:
                </Typography>
                {incident.evidences.map((evidence) => (
                  <Link
                    key={evidence.file_id}
                    href={evidence.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="caption"
                  >
                    {evidence.file_name}
                  </Link>
                ))}
              </Stack>
            )}
            {incident.resolution && (
              <>
                <Divider />
                <Typography variant="body2">
                  Resolución: {INCIDENT_RESOLUTION_LABELS[incident.resolution]}
                  {incident.resolution_notes ? ` · ${incident.resolution_notes}` : ""}
                </Typography>
              </>
            )}
            {(buttons.correct || buttons.escalate || buttons.withdraw) && (
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {buttons.correct && (
                  <Button
                    variant="contained"
                    onClick={() => onOpenDialog({ kind: "correct_shipment", incidentId: incident.id })}
                  >
                    Corregir envío
                  </Button>
                )}
                {buttons.escalate && (
                  <Button
                    variant="outlined"
                    onClick={() => onOpenDialog({ kind: "escalate", incidentId: incident.id })}
                  >
                    Escalar
                  </Button>
                )}
                {buttons.withdraw && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => onOpenDialog({ kind: "withdraw", incidentId: incident.id })}
                  >
                    Retirar
                  </Button>
                )}
              </Stack>
            )}
          </Stack>
        );
      })}
    </Stack>
  );
}
