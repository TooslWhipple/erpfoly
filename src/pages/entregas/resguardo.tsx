import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormSelect, FormTextField, TableCrud, Title } from "@/components";
import type { Column, RowAction } from "@/components/TableCrud";
import { useHandoverBranches } from "@/hooks/useHandoverBranches";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { DELIVERY_HOLD_UPDATE } from "@/lib/permissions";
import {
  extendHold,
  getHoldDays,
  listExpiredHolds,
  releaseHold,
  updateHoldDays,
  type PickupHoldRow,
} from "@/services/sale-handover.service";
import { useSnackbarStore } from "@/store/useSnackbarStore";

export default function ResguardoPage() {
  const showError = useSnackbarStore((state) => state.showError);
  const showSuccess = useSnackbarStore((state) => state.showSuccess);
  const queryClient = useQueryClient();
  const {
    branches,
    branchId,
    setBranchId,
    isLoading: branchesLoading,
    isError: branchesError,
    error: branchesQueryError,
  } = useHandoverBranches();
  const [holdDays, setHoldDays] = useState("");
  const [action, setAction] = useState<{
    id: number;
    kind: "extend" | "release";
  } | null>(null);
  const [expiresAt, setExpiresAt] = useState("");
  const [reason, setReason] = useState("");
  const numericBranchId = branchId === "" ? 0 : branchId;

  const config = useQuery({
    queryKey: ["handover-config"],
    queryFn: getHoldDays,
  });
  const {
    data: holds,
    total,
    page,
    rowsPerPage,
    setPage,
    setRowsPerPage,
    isLoading,
    isError,
    error,
  } = usePaginatedList<PickupHoldRow>({
    queryKey: ["handover-holds", String(numericBranchId)],
    queryFn: listExpiredHolds,
    initialRowsPerPage: 10,
    extraParams: { branchId: numericBranchId },
    enabled: branchId !== "",
  });

  const saveDays = useMutation({
    mutationFn: () => updateHoldDays(Number(holdDays)),
    onSuccess: (result) => {
      setHoldDays(String(result.holdDays));
      showSuccess("Días de resguardo actualizados.");
      void queryClient.invalidateQueries({ queryKey: ["handover-config"] });
    },
    onError: (saveError: Error) => showError(saveError.message),
  });

  const apply = useMutation({
    mutationFn: async () => {
      if (!action) throw new Error("Selecciona un resguardo.");
      if (action.kind === "extend") {
        return extendHold(action.id, {
          expiresAt: new Date(expiresAt).toISOString(),
          reason,
        });
      }
      return releaseHold(action.id, reason);
    },
    onSuccess: (result) => {
      showSuccess(
        typeof result === "object" && result && "message" in result
          ? String(result.message)
          : "Resguardo actualizado.",
      );
      setAction(null);
      void queryClient.invalidateQueries({ queryKey: ["handover-holds"] });
    },
    onError: (applyError: Error) => showError(applyError.message),
  });

  const columns: Column<PickupHoldRow>[] = [
    { id: "folio", label: "Folio", size: "lg" },
    {
      id: "clientName",
      label: "Cliente",
      size: "lg",
      format: (value) => (value == null || value === "" ? "—" : String(value)),
    },
    { id: "branchName", label: "Sucursal", size: "md" },
    { id: "expiresAt", label: "Venció", size: "md", type: "date" },
    {
      id: "label",
      label: "Estado",
      size: "xl",
      format: (value) => (value == null || value === "" ? "—" : String(value)),
    },
  ];
  const actions: RowAction<PickupHoldRow>[] = [
    {
      id: "extend",
      label: "Prorrogar",
      permission: DELIVERY_HOLD_UPDATE,
      onClick: (row) => {
        setAction({ id: row.id, kind: "extend" });
        setReason("");
        setExpiresAt("");
      },
    },
    {
      id: "release",
      label: "Regularizar",
      permission: DELIVERY_HOLD_UPDATE,
      onClick: (row) => {
        setAction({ id: row.id, kind: "release" });
        setReason("");
      },
    },
  ];

  return (
    <Stack spacing={3}>
      <Title
        title="Resguardo vencido"
        description="Ventas que ya cumplieron el plazo y siguen sin entregarse."
      />
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        alignItems={{ md: "flex-end" }}
      >
        <Box sx={{ width: { xs: "100%", md: 280 } }}>
          <FormSelect
            label="Sucursal"
            value={branchId}
            options={branches.map((branch) => ({
              value: branch.id,
              label: branch.name,
            }))}
            onChange={(event) => {
              const next = Number(event.target.value);
              setBranchId(Number.isFinite(next) && next > 0 ? next : "");
              setPage(0);
            }}
          />
        </Box>
        <Box sx={{ width: { xs: "100%", md: 180 } }}>
          <FormTextField
            label="Días de resguardo"
            type="number"
            value={holdDays || String(config.data?.holdDays ?? 15)}
            onChange={(event) => setHoldDays(event.target.value)}
            inputProps={{ min: 1 }}
          />
        </Box>
        <Button
          variant="outlined"
          onClick={() => saveDays.mutate()}
          disabled={saveDays.isPending}
          sx={{ mb: { md: 0.5 } }}
        >
          Guardar días
        </Button>
      </Stack>
      {branchesError && (
        <Alert severity="error">
          {branchesQueryError instanceof Error
            ? branchesQueryError.message
            : "No se pudieron cargar tus sucursales."}
        </Alert>
      )}
      {!branchesLoading && branches.length === 0 && !branchesError && (
        <Alert severity="info">
          No tienes sucursales asignadas. Pide que te vinculen a la tienda donde trabajas.
        </Alert>
      )}
      {isError && (
        <Alert severity="error">
          {error instanceof Error
            ? error.message
            : "No se pudieron cargar los resguardos."}
        </Alert>
      )}
      <TableCrud
        columns={columns}
        rows={holds}
        actions={actions}
        loading={isLoading}
        rowKey="id"
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={total}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        balanced
        emptyMessage="No hay resguardos vencidos"
      />

      <Dialog open={action != null} onClose={() => setAction(null)} fullWidth>
        <DialogTitle>
          {action?.kind === "extend" ? "Prorrogar resguardo" : "Regularizar saldo"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {action?.kind === "extend" && (
              <FormTextField
                label="Nueva fecha"
                type="date"
                value={expiresAt}
                onChange={(event) => setExpiresAt(event.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            )}
            <FormTextField
              label="Motivo"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              required
              multiline
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAction(null)}>Cancelar</Button>
          <Button
            variant="contained"
            disabled={
              !reason.trim() ||
              (action?.kind === "extend" && !expiresAt) ||
              apply.isPending
            }
            onClick={() => apply.mutate()}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
