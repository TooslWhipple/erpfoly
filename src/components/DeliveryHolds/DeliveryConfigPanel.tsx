import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, CircularProgress, Stack, TextField, Typography } from "@mui/material";
import { handoverErrorMessage } from "@/components/HandoverCounter/handoverErrors";
import { unwrapOrThrow } from "@/lib/axios";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { getDeliveryConfig, updateDeliveryConfig } from "@/services/sale-handover.service";
import type { DeliveryConfig } from "@/types/saleHandover.types";

const CONFIG_QUERY_KEY = ["pos", "delivery-config"] as const;

type Draft = Record<keyof DeliveryConfig, string>;

const FIELDS: {
  key: keyof DeliveryConfig;
  label: string;
  help: string;
  min: number;
  max: number;
}[] = [
  {
    key: "pickup_hold_alert_days",
    label: "Días para vencer",
    help: "Desde que el pedido queda listo, 1 a 730.",
    min: 1,
    max: 730,
  },
  {
    key: "pickup_hold_audit_days",
    label: "Días para auditoría",
    help: "Mayor que los días para vencer, hasta 1095.",
    min: 1,
    max: 1095,
  },
  {
    key: "pickup_hold_max_extension_days",
    label: "Máximo de prórroga (días)",
    help: "Cuánto se puede extender un resguardo, 1 a 365.",
    min: 1,
    max: 365,
  },
];

function toDraft(config: DeliveryConfig): Draft {
  return {
    pickup_hold_alert_days: String(config.pickup_hold_alert_days),
    pickup_hold_audit_days: String(config.pickup_hold_audit_days),
    pickup_hold_max_extension_days: String(config.pickup_hold_max_extension_days),
  };
}

function validate(draft: Draft): string | null {
  for (const field of FIELDS) {
    const value = Number(draft[field.key]);
    if (!Number.isInteger(value) || value < field.min || value > field.max) {
      return `${field.label}: ingresa un entero entre ${field.min} y ${field.max}.`;
    }
  }
  if (Number(draft.pickup_hold_audit_days) <= Number(draft.pickup_hold_alert_days)) {
    return "Los días para auditoría deben ser mayores que los días para vencer.";
  }
  return null;
}

/** Configuración de resguardos (endpoint 20). Solo se monta para el Administrador. */
export function DeliveryConfigPanel() {
  const queryClient = useQueryClient();
  const showSuccess = useSnackbarStore((state) => state.showSuccess);
  const [edits, setEdits] = useState<Partial<Draft>>({});
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading, isError, error: loadError, refetch } = useQuery({
    queryKey: CONFIG_QUERY_KEY,
    queryFn: async () => unwrapOrThrow(await getDeliveryConfig()),
  });

  const draft: Draft | null = data ? { ...toDraft(data), ...edits } : null;

  const mutation = useMutation({
    mutationFn: async () => {
      if (!draft) return;
      const result = await updateDeliveryConfig({
        pickup_hold_alert_days: Number(draft.pickup_hold_alert_days),
        pickup_hold_audit_days: Number(draft.pickup_hold_audit_days),
        pickup_hold_max_extension_days: Number(draft.pickup_hold_max_extension_days),
      });
      if (result.error) {
        setError(handoverErrorMessage(result.error));
        return;
      }
      setError(null);
      setEdits({});
      showSuccess("Configuración de resguardos guardada.");
      await queryClient.invalidateQueries({ queryKey: CONFIG_QUERY_KEY });
    },
  });

  const validationError = draft ? validate(draft) : null;
  const dirty =
    data !== undefined &&
    draft !== null &&
    FIELDS.some((field) => draft[field.key] !== String(data[field.key]));

  return (
    <Stack spacing={2} sx={{ p: 2, border: 1, borderColor: "divider", borderRadius: 2 }}>
      <Stack spacing={0.25}>
        <Typography variant="subtitle1" fontWeight={700}>
          Configuración de resguardos
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Los cambios aplican a los resguardos nuevos y a los cálculos siguientes.
        </Typography>
      </Stack>

      {isLoading ? <CircularProgress size={24} /> : null}
      {isError ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => void refetch()}>
              Reintentar
            </Button>
          }
        >
          {loadError instanceof Error ? loadError.message : "No se pudo cargar la configuración."}
        </Alert>
      ) : null}

      {draft ? (
        <>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            {FIELDS.map((field) => (
              <TextField
                key={field.key}
                type="number"
                size="small"
                label={field.label}
                value={draft[field.key]}
                onChange={(event) =>
                  setEdits({ ...edits, [field.key]: event.target.value })
                }
                inputProps={{ min: field.min, max: field.max, step: 1 }}
                helperText={field.help}
                fullWidth
              />
            ))}
          </Stack>
          {validationError && dirty ? (
            <Alert severity="warning">{validationError}</Alert>
          ) : null}
          {error ? <Alert severity="error">{error}</Alert> : null}
          <Stack direction="row" justifyContent="flex-end">
            <Button
              variant="contained"
              disabled={!dirty || validationError !== null || mutation.isPending}
              onClick={() => mutation.mutate()}
            >
              {mutation.isPending ? <CircularProgress size={20} color="inherit" /> : "Guardar"}
            </Button>
          </Stack>
        </>
      ) : null}
    </Stack>
  );
}
