import { useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useBranchesSelect } from "@/hooks/branches/useBranchesSelect";
import {
  extendHold,
  getHoldDays,
  listExpiredHolds,
  releaseHold,
  updateHoldDays,
} from "@/services/sale-handover.service";
import { useAuthStore } from "@/store/useAuthStore";
import { useSnackbarStore } from "@/store/useSnackbarStore";

export default function ResguardoPage() {
  const user = useAuthStore((state) => state.user);
  const showError = useSnackbarStore((state) => state.showError);
  const showSuccess = useSnackbarStore((state) => state.showSuccess);
  const queryClient = useQueryClient();
  const { data: branches = [] } = useBranchesSelect();
  const [branchId, setBranchId] = useState<number | "">(
    user?.principalBranchId ?? "",
  );
  const [holdDays, setHoldDays] = useState("");
  const [action, setAction] = useState<{ id: number; kind: "extend" | "release" } | null>(
    null,
  );
  const [expiresAt, setExpiresAt] = useState("");
  const [reason, setReason] = useState("");

  const holds = useQuery({
    queryKey: ["expired-holds", branchId],
    queryFn: () => listExpiredHolds(Number(branchId)),
    enabled: branchId !== "",
  });
  const config = useQuery({
    queryKey: ["hold-days"],
    queryFn: getHoldDays,
  });

  const saveDays = useMutation({
    mutationFn: () => updateHoldDays(Number(holdDays || config.data?.holdDays)),
    onSuccess: (result) => {
      showSuccess(`El resguardo queda en ${result.holdDays} días.`);
      void queryClient.invalidateQueries({ queryKey: ["hold-days"] });
    },
    onError: (error: Error) => showError(error.message),
  });

  const apply = useMutation({
    mutationFn: async () => {
      if (!action) return;
      if (action.kind === "extend") {
        await extendHold(action.id, {
          expiresAt: `${expiresAt}T23:59:59`,
          reason: reason.trim(),
        });
        return;
      }
      await releaseHold(action.id, reason.trim());
    },
    onSuccess: () => {
      showSuccess(action?.kind === "extend" ? "Resguardo prorrogado." : "Saldo regularizado.");
      setAction(null);
      setReason("");
      setExpiresAt("");
      void queryClient.invalidateQueries({ queryKey: ["expired-holds"] });
    },
    onError: (error: Error) => showError(error.message),
  });

  return (
    <Stack spacing={2} sx={{ p: { xs: 2, md: 3 }, maxWidth: 860, mx: "auto" }}>
      <Typography variant="h5" fontWeight={700}>
        Resguardo vencido
      </Typography>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
        <TextField
          select
          label="Sucursal"
          value={branchId}
          onChange={(event) => setBranchId(Number(event.target.value))}
          SelectProps={{ native: true }}
          sx={{ minWidth: 220 }}
        >
          <option value="" />
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </TextField>
        <TextField
          label="Días de resguardo"
          type="number"
          value={holdDays || String(config.data?.holdDays ?? 15)}
          onChange={(event) => setHoldDays(event.target.value)}
          inputProps={{ min: 1 }}
        />
        <Button variant="outlined" onClick={() => saveDays.mutate()}>
          Guardar días
        </Button>
      </Stack>
      {holds.error instanceof Error && (
        <Alert severity="error">{holds.error.message}</Alert>
      )}
      {(holds.data ?? []).map((hold) => (
        <Stack
          key={hold.id}
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          spacing={1}
          sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, p: 2 }}
        >
          <div>
            <Typography fontWeight={700}>
              {hold.folio} · {hold.clientName}
            </Typography>
            <Typography color="text.secondary">{hold.label}</Typography>
          </div>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              onClick={() => {
                setAction({ id: hold.id, kind: "extend" });
                setReason("");
                setExpiresAt("");
              }}
            >
              Prorrogar
            </Button>
            <Button
              variant="contained"
              color="warning"
              onClick={() => {
                setAction({ id: hold.id, kind: "release" });
                setReason("");
              }}
            >
              Regularizar
            </Button>
          </Stack>
        </Stack>
      ))}
      {holds.data?.length === 0 && (
        <Typography color="text.secondary">No hay resguardos vencidos.</Typography>
      )}

      <Dialog open={action != null} onClose={() => setAction(null)} fullWidth>
        <DialogTitle>
          {action?.kind === "extend" ? "Prorrogar resguardo" : "Regularizar saldo"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {action?.kind === "extend" && (
              <TextField
                label="Nueva fecha"
                type="date"
                value={expiresAt}
                onChange={(event) => setExpiresAt(event.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            )}
            <TextField
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
            disabled={!reason.trim() || (action?.kind === "extend" && !expiresAt) || apply.isPending}
            onClick={() => apply.mutate()}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
