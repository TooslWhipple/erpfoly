"use client";

import { useState } from "react";
import { Button, Stack } from "@mui/material";
import { SideModal } from "@/components/SideModal";
import { FormTextField } from "@/components/Form";
import { RecoverySheetBranchAutocomplete } from "@/components/RecoverySheets/RecoverySheetBranchAutocomplete";
import type { BranchCatalogItem } from "@/services/branches.service";
import { startPhysicalInventorySession } from "@/services/physical-inventory.service";
import { useSnackbarStore } from "@/store/useSnackbarStore";

export interface PhysicalInventoryBranchModalConfirm {
  branch: BranchCatalogItem;
  sessionId: number;
  zoneName: string;
}

export interface PhysicalInventoryBranchModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (payload: PhysicalInventoryBranchModalConfirm) => void;
}

export function PhysicalInventoryBranchModal({
  open,
  onClose,
  onConfirm,
}: PhysicalInventoryBranchModalProps) {
  const showError = useSnackbarStore((state) => state.showError);
  const [branch, setBranch] = useState<BranchCatalogItem | null>(null);
  const [zoneName, setZoneName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => {
    if (submitting) return;
    setBranch(null);
    setZoneName("");
    onClose();
  };

  const trimmedZone = zoneName.trim();
  const canContinue = Boolean(branch && trimmedZone) && !submitting;

  const handleConfirm = async () => {
    if (!branch || !trimmedZone) return;
    setSubmitting(true);
    const result = await startPhysicalInventorySession({
      branchId: branch.id,
      zoneName: trimmedZone,
      captureMethod: "device_camera",
    });
    setSubmitting(false);

    if (result.error || !result.data) {
      showError(
        result.error?.message ?? "No se pudo iniciar la sesión de inventario",
      );
      return;
    }

    onConfirm({
      branch,
      sessionId: result.data.id,
      zoneName: result.data.zoneName ?? trimmedZone,
    });
    setBranch(null);
    setZoneName("");
  };

  return (
    <SideModal
      open={open}
      onClose={handleClose}
      title="Nuevo inventario físico"
      description="Selecciona la sucursal y el nombre de la zona o captura."
      maxWidth="sm"
      headerActions={
        <Button
          variant="contained"
          color="primary"
          onClick={() => void handleConfirm()}
          disabled={!canContinue}
        >
          {submitting ? "Iniciando..." : "Continuar"}
        </Button>
      }
    >
      <Stack spacing={2} sx={{ pt: 1 }}>
        <RecoverySheetBranchAutocomplete
          value={branch}
          onChange={setBranch}
          enabled={open}
        />
        <FormTextField
          label="Nombre de la zona o captura"
          placeholder="Ej. Piso 1, Bodega pasillo A"
          value={zoneName}
          onChange={(event) => setZoneName(event.target.value)}
          required
          fullWidth
          inputProps={{ maxLength: 120 }}
        />
      </Stack>
    </SideModal>
  );
}
