"use client";

import { useState } from "react";
import { Button, Stack } from "@mui/material";
import { SideModal } from "@/components/SideModal";
import { RecoverySheetBranchAutocomplete } from "@/components/RecoverySheets/RecoverySheetBranchAutocomplete";
import type { BranchCatalogItem } from "@/services/branches.service";

export interface PhysicalInventoryBranchModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (branch: BranchCatalogItem) => void;
}

export function PhysicalInventoryBranchModal({
  open,
  onClose,
  onConfirm,
}: PhysicalInventoryBranchModalProps) {
  const [branch, setBranch] = useState<BranchCatalogItem | null>(null);

  const handleClose = () => {
    setBranch(null);
    onClose();
  };

  const handleConfirm = () => {
    if (!branch) return;
    onConfirm(branch);
    setBranch(null);
  };

  return (
    <SideModal
      open={open}
      onClose={handleClose}
      title="Nuevo inventario físico"
      description="Selecciona la sucursal donde realizarás el conteo."
      maxWidth="sm"
      headerActions={
        <Button
          variant="contained"
          color="primary"
          onClick={handleConfirm}
          disabled={!branch}
        >
          Continuar
        </Button>
      }
    >
      <Stack spacing={2} sx={{ pt: 1 }}>
        <RecoverySheetBranchAutocomplete
          value={branch}
          onChange={setBranch}
          enabled={open}
        />
      </Stack>
    </SideModal>
  );
}
