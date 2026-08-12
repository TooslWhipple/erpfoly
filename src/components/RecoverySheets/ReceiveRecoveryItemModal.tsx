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
import { MOCK_RECOVERY_SHEET_BRANCHES } from "@/data/recovery-sheets.mockData";
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

const DEFAULT_MOCK_BRANCH: BranchCatalogItem = {
  id: MOCK_RECOVERY_SHEET_BRANCHES[0].id,
  name: MOCK_RECOVERY_SHEET_BRANCHES[0].name,
  is_main_warehouse: true,
};

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
    useState<BranchCatalogItem | null>(DEFAULT_MOCK_BRANCH);
  const [receivedDate, setReceivedDate] = useState<string>(
    new Date().toISOString().slice(0, 10),
  );
  const [itemCondition, setItemCondition] =
    useState<RecoverySheetItemCondition>("danado");

  const { data: initialBranches } = useQuery({
    queryKey: ["branches-catalog", "recovery-sheet-default"],
    queryFn: async () => {
      try {
        return await getBranchesCatalog();
      } catch {
        return MOCK_RECOVERY_SHEET_BRANCHES.map((branch) => ({
          id: branch.id,
          name: branch.name,
          is_main_warehouse: branch.id === 1,
        }));
      }
    },
    enabled: open,
    staleTime: 60_000,
  });

  const defaultBranch = useMemo(() => {
    return (
      initialBranches?.find((branch) => branch.is_main_warehouse) ??
      initialBranches?.[0] ??
      DEFAULT_MOCK_BRANCH
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
