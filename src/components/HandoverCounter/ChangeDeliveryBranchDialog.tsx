import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MenuItem, TextField, Typography } from "@mui/material";
import {
  SupervisorCredentialsDialog,
  type SupervisorCredentials,
} from "@/components/SupervisorCredentialsDialog";
import { getBranchesCatalog } from "@/services/branches.service";
import { changeDeliveryBranch } from "@/services/sale-handover.service";
import type {
  ChangeDeliveryBranchResponse,
  HandoverSaleDetail,
} from "@/types/saleHandover.types";
import { changeDeliveryBranchErrorMessage } from "./handoverErrors";

const BRANCHES_STALE_TIME_MS = 5 * 60 * 1000;

export interface ChangeDeliveryBranchDialogProps {
  detail: Pick<HandoverSaleDetail, "saleId" | "branch" | "deliveryBranch">;
  onClose: () => void;
  onChanged: (result: ChangeDeliveryBranchResponse) => void;
}

/**
 * Cambia la sucursal que entrega la orden completa. Lo autoriza un gerente de la
 * sucursal que vendió (o un administrador); se montan solo mientras está abierto.
 */
export function ChangeDeliveryBranchDialog({
  detail,
  onClose,
  onChanged,
}: ChangeDeliveryBranchDialogProps) {
  const [targetId, setTargetId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: branches = [], isLoading } = useQuery({
    queryKey: ["catalog", "branches", "delivery-change"],
    queryFn: () => getBranchesCatalog(),
    staleTime: BRANCHES_STALE_TIME_MS,
  });
  const options = branches.filter((branch) => branch.id !== detail.deliveryBranch.id);

  const handleConfirm = async (credentials: SupervisorCredentials) => {
    if (!targetId || !credentials.reason) return;
    setSubmitting(true);
    setError(null);
    const response = await changeDeliveryBranch(detail.saleId, {
      branchId: Number(targetId),
      username: credentials.username,
      password: credentials.password,
      reason: credentials.reason,
    });
    setSubmitting(false);
    if (response.error || !response.data) {
      setError(
        response.error
          ? changeDeliveryBranchErrorMessage(response.error)
          : "No se pudo cambiar la ubicación de entrega.",
      );
      return;
    }
    onChanged(response.data);
  };

  return (
    <SupervisorCredentialsDialog
      open
      title="Cambiar ubicación de entrega"
      description={`Hoy se entrega en ${detail.deliveryBranch.name}. El cambio aplica a lo pendiente de toda la orden.`}
      confirmLabel="Cambiar ubicación"
      reasonLabel="Motivo del cambio (obligatorio)"
      reasonRequired
      loading={submitting}
      error={error}
      confirmDisabled={!targetId}
      onClose={onClose}
      onConfirm={(credentials) => void handleConfirm(credentials)}
    >
      <TextField
        select
        label="Nueva sucursal de entrega"
        value={targetId}
        onChange={(event) => setTargetId(event.target.value)}
        disabled={submitting || isLoading}
        fullWidth
      >
        {options.map((branch) => (
          <MenuItem key={branch.id} value={String(branch.id)}>
            {branch.name}
          </MenuItem>
        ))}
      </TextField>
      <Typography variant="body2" color="text.secondary">
        Autoriza un gerente de {detail.branch.name}.
      </Typography>
    </SupervisorCredentialsDialog>
  );
}
