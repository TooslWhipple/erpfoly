import { useCallback, useEffect, useState } from "react";
import { Button, Grid, Stack } from "@mui/material";
import { FormTextField } from "@/components/Form";
import { SideModal } from "@/components/SideModal";
import { createProductLine, type ProductLineItem } from "@/services/product-lines.service";
import { useSnackbarStore } from "@/store/useSnackbarStore";

export interface CreateProductLineSideModalProps {
  open: boolean;
  onClose: () => void;
  /** Parent department for the new product line. */
  departmentId: number;
  /** Called after a successful create with the API entity (e.g. refetch + select). */
  onCreated?: (created: ProductLineItem) => void | Promise<void>;
}

export function CreateProductLineSideModal({
  open,
  onClose,
  departmentId,
  onCreated,
}: CreateProductLineSideModalProps) {
  const showSuccess = useSnackbarStore((s) => s.showSuccess);
  const showError = useSnackbarStore((s) => s.showError);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setCode("");
      setName("");
      setSubmitting(false);
    }
  }, [open]);

  const codeTrimmed = code.trim().toUpperCase();
  const nameTrimmed = name.trim();
  const canSubmit =
    codeTrimmed.length >= 1 &&
    nameTrimmed.length >= 2 &&
    Number.isFinite(departmentId) &&
    !submitting;

  const handleSubmit = useCallback(async () => {
    if (!canSubmit || !Number.isFinite(departmentId)) return;

    setSubmitting(true);
    const result = await createProductLine({
      departmentId,
      name: nameTrimmed,
      code: codeTrimmed,
    });
    setSubmitting(false);

    if (result.error) {
      showError(result.error.message);
      return;
    }

    const created = result.data;
    if (!created) {
      showError("No se recibió la línea creada.");
      return;
    }

    showSuccess("Línea creada correctamente.");
    onClose();
    await onCreated?.(created);
  }, [
    canSubmit,
    departmentId,
    nameTrimmed,
    codeTrimmed,
    onClose,
    onCreated,
    showError,
    showSuccess,
  ]);

  return (
    <SideModal
      open={open}
      onClose={onClose}
      disableClose={submitting}
      maxWidth="sm"
      title="Nueva línea"
      headerActions={
        <Button
          variant="contained"
          color="primary"
          disabled={!canSubmit}
          onClick={() => void handleSubmit()}
        >
          Crear
        </Button>
      }
    >
      <Stack spacing={2} sx={{ flex: 1 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormTextField
              label="Abreviación"
              placeholder="Ej. LB"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              fullWidth
              autoFocus
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 8 }}>
            <FormTextField
              label="Nombre"
              placeholder="Ej. Línea blanca"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
            />
          </Grid>
        </Grid>
      </Stack>
    </SideModal>
  );
}
