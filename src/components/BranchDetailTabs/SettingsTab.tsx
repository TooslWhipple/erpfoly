import { useState, useEffect, useCallback } from "react";
import { Stack, Button, Typography, CircularProgress } from "@mui/material";
import { Card } from "@/styles/catalogos/goals.styles";
import { getBranchSettings, saveBranchSettings } from "@/services/branchDetail.service";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { FormTextField } from "../Form";

interface SettingsTabProps {
  branchId: number;
  onSaved?: () => void;
}

export function SettingsTab({ branchId, onSaved }: SettingsTabProps) {
  const showSuccess = useSnackbarStore((s) => s.showSuccess);
  const showError = useSnackbarStore((s) => s.showError);

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    if (!branchId) return;
    setLoading(true);
    try {
      const data = await getBranchSettings(branchId);
      setName(data.name);
    } catch (err) {
      console.error("[SettingsTab] Error:", err);
      showError("No se pudo cargar la configuración de la sucursal.");
    } finally {
      setLoading(false);
    }
  }, [branchId, showError]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      await saveBranchSettings(branchId, { name: trimmed });
      showSuccess("Sucursal actualizada");
      onSaved?.();
    } catch (err) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : "No se pudo actualizar la información de la sucursal.";
      showError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Stack alignItems="center" justifyContent="center" minHeight={200} spacing={2}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Cargando configuración...
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <Card>
        <Typography variant="h6">Configuraciones de sucursal</Typography>
        <Stack spacing={2} direction={{ xs: "column", md: "row" }} alignItems="flex-end">
          <FormTextField
            label="Nombre"
            placeholder="Nombre de la sucursal"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving || !name.trim()}
            style={{ minWidth: 128 }}
          >
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </Stack>
      </Card>
    </Stack>
  );
}
