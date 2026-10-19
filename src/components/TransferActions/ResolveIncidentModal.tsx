import { useState } from "react";
import { Button, CircularProgress, Stack, Typography } from "@mui/material";
import { AccountingAccountSearchField } from "@/components/AccountingAccountSearchField";
import { SideModal } from "@/components/SideModal";
import { FormSelect } from "@/components/Form/FormSelect";
import { FormTextField } from "@/components/Form/FormTextField";
import { FormActions, ConfirmButton } from "@/components/Form/styles";
import type {
  AuditorIncidentResolution,
  ResolveIncidentPayload,
  TransferIncidentView,
} from "@/types/transfers.types";
import {
  DISCREPANCY_TYPE_LABELS,
  INCIDENT_RESOLUTION_LABELS,
  requiresAccountingAccount,
} from "@/utils/transfers";

const RESOLUTION_OPTIONS = (
  ["LOSS_IN_TRANSIT", "FOUND_AT_DESTINATION"] as const satisfies readonly AuditorIncidentResolution[]
).map((resolution) => ({ value: resolution, label: INCIDENT_RESOLUTION_LABELS[resolution] }));

export interface ResolveIncidentModalProps {
  incident: TransferIncidentView;
  loading: boolean;
  onClose: () => void;
  onSubmit: (payload: ResolveIncidentPayload) => Promise<unknown>;
}

/** El Auditor da de baja la pérdida (con cuenta contable, RN-069) o repone lo encontrado en el destino. */
export function ResolveIncidentModal({ incident, loading, onClose, onSubmit }: ResolveIncidentModalProps) {
  const [resolution, setResolution] = useState<AuditorIncidentResolution>("LOSS_IN_TRANSIT");
  const [accountId, setAccountId] = useState("");
  const [notes, setNotes] = useState("");

  const needsAccount = requiresAccountingAccount(resolution);
  const canSubmit = notes.trim().length > 0 && (!needsAccount || accountId.length > 0);

  const handleSubmit = () =>
    onSubmit({
      resolution,
      accounting_account_id: needsAccount ? accountId : undefined,
      notes: notes.trim(),
    });

  return (
    <SideModal
      open
      onClose={onClose}
      title={`Resolver incidencia #${incident.id}`}
      description={`Traspaso ${incident.order.folio}`}
      maxWidth="sm"
      disableClose={loading}
    >
      <Stack spacing={2}>
        <Typography variant="body2">{incident.description}</Typography>
        <Stack spacing={0.5}>
          {incident.items.map((entry) => (
            <Typography key={entry.order_item_id} variant="body2" color="text.secondary">
              {DISCREPANCY_TYPE_LABELS[entry.type]}: {entry.quantity} · {entry.product_name}
            </Typography>
          ))}
        </Stack>
        <FormSelect
          label="Resolución"
          required
          value={resolution}
          options={RESOLUTION_OPTIONS}
          onChange={(event) => setResolution(event.target.value as AuditorIncidentResolution)}
        />
        {needsAccount && (
          <AccountingAccountSearchField
            required
            value={accountId}
            onChange={setAccountId}
            helperText="Cuenta contable a la que se da de baja la pérdida."
          />
        )}
        <FormTextField
          label="Notas"
          required
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          multiline
          minRows={2}
        />
        <FormActions>
          <Button variant="outlined" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <ConfirmButton variant="contained" onClick={handleSubmit} disabled={loading || !canSubmit}>
            {loading ? <CircularProgress size={20} color="inherit" /> : "Resolver"}
          </ConfirmButton>
        </FormActions>
      </Stack>
    </SideModal>
  );
}
