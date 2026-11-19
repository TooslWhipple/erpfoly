import { useEffect, useState } from "react";
import {
  Button,
  CircularProgress,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { SideModal } from "@/components/SideModal";
import type { DamagedPhysicalExitReason } from "@/services/damaged-products.service";

const CLOSURE_REASON_OPTIONS: Array<{
  value: DamagedPhysicalExitReason;
  label: string;
}> = [
  { value: "supplier_pickup", label: "Recolección por proveedor" },
  {
    value: "destruction_abandonment",
    label: "Destrucción por abandono",
  },
  {
    value: "transfer_to_liquidation",
    label: "Traspaso a liquidación",
  },
];

export interface PhysicalExitDamagedGoodsFormValues {
  closureReason: DamagedPhysicalExitReason;
  notes?: string;
}

export interface PhysicalExitDamagedGoodsModalProps {
  open: boolean;
  onClose: () => void;
  productName: string;
  productCode: string;
  willChargeSupplier: boolean;
  saving?: boolean;
  onSubmit: (values: PhysicalExitDamagedGoodsFormValues) => Promise<boolean>;
}

export function PhysicalExitDamagedGoodsModal({
  open,
  onClose,
  productName,
  productCode,
  willChargeSupplier,
  saving = false,
  onSubmit,
}: PhysicalExitDamagedGoodsModalProps) {
  const [closureReason, setClosureReason] = useState<
    DamagedPhysicalExitReason | ""
  >("");
  const [notes, setNotes] = useState("");
  const [reasonError, setReasonError] = useState<string | undefined>();

  useEffect(() => {
    if (!open) {
      setClosureReason("");
      setNotes("");
      setReasonError(undefined);
    }
  }, [open]);

  const handleClose = () => {
    if (saving) return;
    onClose();
  };

  const handleSubmit = async () => {
    if (!closureReason) {
      setReasonError("Selecciona el motivo de cierre");
      return;
    }
    setReasonError(undefined);
    const ok = await onSubmit({
      closureReason,
      notes: notes.trim() || undefined,
    });
    if (ok) {
      onClose();
    }
  };

  return (
    <SideModal
      open={open}
      onClose={handleClose}
      title="Dar salida física"
      maxWidth="sm"
    >
      <Stack spacing={2.5}>
        <Typography variant="body2" color="text.secondary">
          Confirma la salida de <strong>{productName}</strong> ({productCode})
          de la bodega. El folio pasará a histórico.
        </Typography>

        {willChargeSupplier ? (
          <Typography variant="body2" color="warning.main">
            El folio aún no está descontado: al confirmar se ejecutará el cargo
            al estado de cuenta del proveedor.
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary">
            El folio ya está cobrado; solo se registrará la salida física.
          </Typography>
        )}

        <FormControl fullWidth error={Boolean(reasonError)}>
          <InputLabel id="physical-exit-reason-label">Motivo de cierre</InputLabel>
          <Select
            labelId="physical-exit-reason-label"
            label="Motivo de cierre"
            value={closureReason}
            onChange={(event) => {
              setClosureReason(event.target.value as DamagedPhysicalExitReason);
              setReasonError(undefined);
            }}
            disabled={saving}
          >
            {CLOSURE_REASON_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {reasonError ? <FormHelperText>{reasonError}</FormHelperText> : null}
        </FormControl>

        <TextField
          label="Notas (opcional)"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          multiline
          minRows={2}
          disabled={saving}
          fullWidth
        />

        <Stack direction="row" spacing={1.5} justifyContent="flex-end">
          <Button onClick={handleClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => void handleSubmit()}
            disabled={saving}
            startIcon={
              saving ? <CircularProgress size={16} color="inherit" /> : undefined
            }
          >
            Confirmar salida
          </Button>
        </Stack>
      </Stack>
    </SideModal>
  );
}
