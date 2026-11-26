import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Alert, MenuItem, TextField, Typography } from "@mui/material";
import {
  SupervisorCredentialsDialog,
  type SupervisorCredentials,
} from "@/components/SupervisorCredentialsDialog";
import { getBranchesCatalog } from "@/services/branches.service";
import {
  changeDeliveryBranch,
  getDeliveryBranchAvailability,
} from "@/services/sale-handover.service";
import type {
  ChangeDeliveryBranchResponse,
  HandoverLine,
  HandoverSaleDetail,
} from "@/types/saleHandover.types";
import { changeDeliveryBranchErrorMessage } from "./handoverErrors";

const BRANCHES_STALE_TIME_MS = 5 * 60 * 1000;

export interface ChangeDeliveryBranchDialogProps {
  detail: Pick<HandoverSaleDetail, "saleId" | "branch" | "deliveryBranch">;
  /** FOLY-276: con un artículo, solo cambia la ubicación de ese artículo. */
  line?: Pick<HandoverLine, "saleItemId" | "name" | "deliveryBranch">;
  onClose: () => void;
  onChanged: (result: ChangeDeliveryBranchResponse) => void;
}

/**
 * Cambia la sucursal que entrega la orden completa (o solo un artículo, con `line`). Lo autoriza un gerente de la
 * sucursal que vendió (o un administrador); se montan solo mientras está abierto.
 */
export function ChangeDeliveryBranchDialog({
  detail,
  line,
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
  const current = line?.deliveryBranch ?? detail.deliveryBranch;
  const saleItemId = line?.saleItemId;
  const options = branches.filter((branch) => branch.id !== current.id);

  // FOLY-258: la nueva sucursal entrega de su propia existencia (sin traspaso),
  // así que se revisa antes de pedir la contraseña del gerente.
  const availabilityQuery = useQuery({
    queryKey: [
      "sale-handover",
      "delivery-branch-availability",
      detail.saleId,
      saleItemId ?? "all",
      targetId,
    ],
    enabled: targetId !== "",
    queryFn: async () => {
      const response = await getDeliveryBranchAvailability(
        detail.saleId,
        Number(targetId),
        saleItemId,
      );
      if (response.error || !response.data) {
        throw new Error(
          response.error
            ? changeDeliveryBranchErrorMessage(response.error)
            : "No se pudo revisar la existencia de la sucursal.",
        );
      }
      return response.data;
    },
    staleTime: 0,
  });
  const availability = availabilityQuery.data;
  const stockBlocked =
    targetId !== "" &&
    (availabilityQuery.isFetching ||
      availabilityQuery.isError ||
      availability?.available === false);

  const handleConfirm = async (credentials: SupervisorCredentials) => {
    if (!targetId || !credentials.reason) return;
    setSubmitting(true);
    setError(null);
    const response = await changeDeliveryBranch(
      detail.saleId,
      {
        branchId: Number(targetId),
        username: credentials.username,
        password: credentials.password,
        reason: credentials.reason,
      },
      saleItemId,
    );
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
      title={line ? `Cambiar ubicación: ${line.name}` : "Cambiar ubicación de entrega"}
      description={`Hoy ${line ? "este artículo " : ""}se entrega en ${current.name}. La nueva sucursal entrega de su propio inventario, sin traspaso.`}
      confirmLabel="Cambiar ubicación"
      reasonLabel="Motivo del cambio (obligatorio)"
      reasonRequired
      loading={submitting}
      error={error}
      confirmDisabled={!targetId || stockBlocked}
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
      {targetId !== "" && availabilityQuery.isFetching && (
        <Typography variant="body2" color="text.secondary">
          Revisando existencia en la sucursal…
        </Typography>
      )}
      {availabilityQuery.isError && (
        <Alert severity="error">{availabilityQuery.error.message}</Alert>
      )}
      {availability?.available === false && (
        <Alert severity="warning">
          {availability.message ??
            `${availability.branchName} no tiene existencia suficiente.`}
        </Alert>
      )}
      <Typography variant="body2" color="text.secondary">
        Autoriza un gerente de {detail.branch.name}.
      </Typography>
    </SupervisorCredentialsDialog>
  );
}
