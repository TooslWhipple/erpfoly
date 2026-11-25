"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Stack,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { SideModal } from "@/components/SideModal";
import { RecoverySheetBranchAutocomplete } from "@/components/RecoverySheets/RecoverySheetBranchAutocomplete";
import {
  getBranchesCatalog,
  type BranchCatalogItem,
} from "@/services/branches.service";
import {
  getPhysicalInventories,
  unifyPhysicalInventories,
} from "@/services/physical-inventory.service";
import type { PhysicalInventoryListItem } from "@/types/physical-inventory.types";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { formatDate } from "@/utils/date";

export interface PhysicalInventoryUnifyModalProps {
  open: boolean;
  onClose: () => void;
  initialBranchId?: number;
  onUnified: (masterId: number) => void;
}

export function PhysicalInventoryUnifyModal({
  open,
  onClose,
  initialBranchId,
  onUnified,
}: PhysicalInventoryUnifyModalProps) {
  const { showError, showSuccess } = useSnackbarStore();
  const [branch, setBranch] = useState<BranchCatalogItem | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const { data: branches = [] } = useQuery({
    queryKey: ["branches-catalog", "physical-inventory-unify"],
    queryFn: () => getBranchesCatalog(),
    enabled: open,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!open) {
      setSelectedIds([]);
      setSubmitting(false);
      return;
    }
    if (initialBranchId && initialBranchId > 0 && branches.length > 0) {
      const match = branches.find((b) => b.id === initialBranchId) ?? null;
      setBranch(match);
    }
  }, [branches, initialBranchId, open]);

  const branchId = branch?.id;

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["physical-inventories-unifiable", branchId],
    queryFn: async () => {
      if (!branchId) return { rows: [] as PhysicalInventoryListItem[] };
      const result = await getPhysicalInventories({
        page: 1,
        limit: 100,
        branchId,
        unifiableOnly: true,
      });
      if (result.error) throw new Error(result.error.message);
      return result.data ?? { rows: [] };
    },
    enabled: open && Boolean(branchId),
  });

  const rows = data?.rows ?? [];

  const selectedCount = selectedIds.length;
  const canSubmit = Boolean(branchId) && selectedCount >= 2 && !submitting;

  const toggleId = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleClose = () => {
    if (submitting) return;
    setSelectedIds([]);
    onClose();
  };

  const handleConfirm = async () => {
    if (!branchId || selectedIds.length < 2) return;
    setSubmitting(true);
    const result = await unifyPhysicalInventories({
      branchId,
      sessionIds: selectedIds,
    });
    setSubmitting(false);
    if (result.error || !result.data) {
      showError(result.error?.message ?? "No se pudo unificar");
      return;
    }
    showSuccess("Inventarios unificados (reporte de auditoría)");
    onUnified(result.data.id);
    setSelectedIds([]);
  };

  const emptyMessage = useMemo(() => {
    if (!branchId) return "Selecciona una sucursal para ver las sesiones.";
    if (isLoading) return null;
    if (rows.length === 0) {
      return "No hay sesiones en proceso unificables para esta sucursal.";
    }
    return null;
  }, [branchId, isLoading, rows.length]);

  return (
    <SideModal
      open={open}
      onClose={handleClose}
      title="Unificar inventarios"
      description="Selecciona manualmente las sesiones de zona en proceso que deseas consolidar. El resultado es un reporte de auditoría; no ajusta existencias."
      maxWidth="sm"
      headerActions={
        <Button
          variant="contained"
          color="primary"
          onClick={() => void handleConfirm()}
          disabled={!canSubmit}
        >
          {submitting ? "Unificando..." : "Unificar"}
        </Button>
      }
    >
      <Stack spacing={2} sx={{ pt: 1 }}>
        <RecoverySheetBranchAutocomplete
          value={branch}
          onChange={(next) => {
            setBranch(next);
            setSelectedIds([]);
          }}
          enabled={open}
        />

        {isLoading ? (
          <Stack alignItems="center" py={3}>
            <CircularProgress size={28} />
          </Stack>
        ) : null}

        {isError ? (
          <Stack spacing={1}>
            <Typography color="error">
              {error instanceof Error
                ? error.message
                : "No se pudieron cargar las sesiones"}
            </Typography>
            <Button onClick={() => void refetch()}>Reintentar</Button>
          </Stack>
        ) : null}

        {emptyMessage ? (
          <Typography color="text.secondary">{emptyMessage}</Typography>
        ) : null}

        {!isLoading && rows.length > 0 ? (
          <Stack spacing={0.5}>
            <Typography variant="body2" color="text.secondary">
              Sesiones seleccionadas: {selectedCount}
            </Typography>
            {rows.map((row) => {
              const disabled = row.totalItems <= 0;
              return (
                <FormControlLabel
                  key={row.id}
                  disabled={disabled}
                  control={
                    <Checkbox
                      checked={selectedIds.includes(row.id)}
                      onChange={() => toggleId(row.id)}
                    />
                  }
                  label={
                    <Stack>
                      <Typography variant="body1">
                        #{row.id}
                        {row.zoneName ? ` · ${row.zoneName}` : ""}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {row.responsibleUser}
                        {" · "}
                        {formatDate(String(row.date), "datetimeShort12h")}
                        {" · "}
                        {row.totalItems} artículos
                        {disabled ? " (sin conteos)" : ""}
                      </Typography>
                    </Stack>
                  }
                />
              );
            })}
          </Stack>
        ) : null}
      </Stack>
    </SideModal>
  );
}
