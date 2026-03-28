import { useCallback, useEffect, useState } from "react";
import { Button, Grid, Stack } from "@mui/material";
import { FormTextField } from "@/components/Form";
import { SideModal } from "@/components/SideModal";
import { createDepartment, type Department } from "@/services/departments.service";
import { useSnackbarStore } from "@/store/useSnackbarStore";

export interface CreateDepartmentSideModalProps {
  open: boolean;
  onClose: () => void;
  /** Called after a successful create with the API entity (e.g. refetch + select). */
  onCreated?: (created: Department) => void | Promise<void>;
}

function parseMargin(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === "") return null;
  const n = Number(trimmed);
  if (!Number.isFinite(n) || n < 0 || n > 100) return null;
  return n;
}

export function CreateDepartmentSideModal({
  open,
  onClose,
  onCreated,
}: CreateDepartmentSideModalProps) {
  const showSuccess = useSnackbarStore((s) => s.showSuccess);
  const showError = useSnackbarStore((s) => s.showError);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [margin, setMargin] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setName("");
      setCode("");
      setMargin("");
      setSubmitting(false);
    }
  }, [open]);

  const marginParsed = parseMargin(margin);
  const nameTrimmed = name.trim();
  const canSubmit =
    nameTrimmed.length >= 2 && marginParsed !== null && !submitting;

  const handleSubmit = useCallback(async () => {
    if (!canSubmit || marginParsed === null) return;

    setSubmitting(true);
    const payload = {
      name: nameTrimmed,
      margin: marginParsed,
      ...(code.trim() ? { code: code.trim() } : {}),
    };

    const result = await createDepartment(payload);
    setSubmitting(false);

    if (result.error) {
      showError(result.error.message);
      return;
    }

    const created = result.data;
    if (!created) {
      showError("No se recibió el departamento creado.");
      return;
    }

    showSuccess("Departamento creado correctamente.");
    onClose();
    await onCreated?.(created);
  }, [
    canSubmit,
    marginParsed,
    nameTrimmed,
    code,
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
      title="Nuevo departamento"
      headerActions={
        <Button
          variant="contained"
          color="primary"
          disabled={!canSubmit}
          onClick={() => handleSubmit()}
        >
          Crear
        </Button>
      }
    >
      <Stack spacing={2} sx={{ flex: 1 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <FormTextField
              label="Nombre"
              placeholder="Ej. Línea blanca"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              autoFocus
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormTextField
              label="Margen (%)"
              placeholder="0 — 100"
              type="number"
              value={margin}
              onChange={(e) => setMargin(e.target.value)}
              fullWidth
              inputProps={{ min: 0, max: 100, step: "0.01" }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormTextField
              label="Código (opcional)"
              placeholder="Ej. LB"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              fullWidth
            />
          </Grid>
        </Grid>
      </Stack>
    </SideModal>
  );
}
