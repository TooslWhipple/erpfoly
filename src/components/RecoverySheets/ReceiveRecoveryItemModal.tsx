import { useEffect, useMemo, useState } from "react";
import {
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import {
  SideModal,
  FormDatePicker,
  RadioButton,
  RadioButtonGroup,
} from "@/components";
import {
  getBranchesCatalog,
  type BranchCatalogItem,
} from "@/services/branches.service";
import type { RecoverySheetItemCondition } from "@/types/recovery-sheets.types";
import { RECOVERY_SHEET_ITEM_CONDITION_LABELS } from "@/types/recovery-sheets.types";
import { RecoverySheetBranchAutocomplete } from "./RecoverySheetBranchAutocomplete";

const ITEM_CONDITION_OPTIONS: RecoverySheetItemCondition[] = [
  "sin_danos",
  "danado",
  "no_funciona",
];

export interface ReceiveRecoveryItemModalProps {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (payload: {
    branchId: number;
    branchName: string;
    receivedDate: string;
    itemCondition: RecoverySheetItemCondition;
  }) => void;
}

export function ReceiveRecoveryItemModal({
  open,
  loading = false,
  onConfirm,
  onClose,
}: ReceiveRecoveryItemModalProps) {
  const [selectedBranch, setSelectedBranch] =
    useState<BranchCatalogItem | null>(null);
  const [receivedDate, setReceivedDate] = useState<string>(
    new Date().toISOString().slice(0, 10),
  );
  const [itemCondition, setItemCondition] =
    useState<RecoverySheetItemCondition>("danado");

  const { data: initialBranches } = useQuery({
    queryKey: ["branches-catalog", "recovery-sheet-default"],
    queryFn: () => getBranchesCatalog(),
    enabled: open,
    staleTime: 60_000,
  });

  const defaultBranch = useMemo(() => {
    return (
      initialBranches?.find((branch) => branch.is_main_warehouse) ??
      initialBranches?.[0] ??
      null
    );
  }, [initialBranches]);

  useEffect(() => {
    if (open) {
      setSelectedBranch(defaultBranch);
      setReceivedDate(new Date().toISOString().slice(0, 10));
      setItemCondition("danado");
    }
  }, [open, defaultBranch]);

  const handleConfirm = () => {
    if (!selectedBranch) return;
    onConfirm({
      branchId: selectedBranch.id,
      branchName: selectedBranch.name,
      receivedDate,
      itemCondition,
    });
  };

  return (
    <SideModal
      open={open}
      onClose={onClose}
      disableClose={loading}
      maxWidth="sm"
      title="Sucursal dónde se recibió el artículo"
      description="Selecciona la sucursal dónde se recibió el artículo."
      headerActionsPosition="top"
      headerActions={
        <Button
          variant="contained"
          color="primary"
          onClick={handleConfirm}
          disabled={loading || !selectedBranch || !receivedDate}
          startIcon={
            loading ? <CircularProgress size={16} color="inherit" /> : undefined
          }
          sx={{ textTransform: "none", fontWeight: 600, minWidth: 112 }}
        >
          Confirmar
        </Button>
      }
    >
      <Stack spacing={2.5}>
        <RecoverySheetBranchAutocomplete
          value={selectedBranch}
          onChange={setSelectedBranch}
          disabled={loading}
          enabled={open}
        />

        <FormDatePicker
          label="Fecha"
          value={receivedDate}
          onChange={(value) => setReceivedDate(value ?? "")}
          disabled={loading}
          fullWidth
        />

        <Stack spacing={1}>
          <Typography variant="body2" fontWeight={600}>
            Estado del artículo
          </Typography>
          <RadioButtonGroup sx={{ width: "100%" }}>
            {ITEM_CONDITION_OPTIONS.map((value) => (
              <RadioButton
                key={value}
                value={value}
                label={RECOVERY_SHEET_ITEM_CONDITION_LABELS[value]}
                checked={itemCondition === value}
                disabled={loading}
                fullWidth
                onChange={() => setItemCondition(value)}
              />
            ))}
          </RadioButtonGroup>
        </Stack>
      </Stack>
    </SideModal>
  );
}
