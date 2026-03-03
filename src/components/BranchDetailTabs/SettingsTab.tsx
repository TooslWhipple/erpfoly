import { useState, useEffect, useCallback } from "react";
import { Stack, TextField, Button, Typography, CircularProgress } from "@mui/material";
import { Card, CardTitle } from "@/styles/catalogos/goals.styles";
import { getBranchSettings, saveBranchSettings } from "@/services/branchDetail.service";

interface SettingsTabProps {
  branchId: number;
}

export function SettingsTab({ branchId }: SettingsTabProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    if (!branchId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getBranchSettings(branchId);
      setName(data.name);
    } catch (err) {
      console.error("[SettingsTab] Error:", err);
      setError("Error al cargar configuración");
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSaving(true);
    setError(null);
    try {
      await saveBranchSettings(branchId, { name: trimmed });
    } catch (err) {
      console.error("[SettingsTab] Error saving:", err);
      setError("Error al guardar");
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
        <CardTitle>Configuraciones de sucursal</CardTitle>
        {error && (
          <Typography color="error" variant="body2" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        <Stack spacing={2} maxWidth={400}>
          <TextField
            label="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            size="medium"
          />
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving || !name.trim()}
          >
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </Stack>
      </Card>
    </Stack>
  );
}
