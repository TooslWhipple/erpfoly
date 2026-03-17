import { useState, useEffect, useCallback } from "react";
import { Stack, Button, Typography, CircularProgress } from "@mui/material";
import { Card } from "@/styles/catalogos/goals.styles";
import { getBranchSettings, saveBranchSettings } from "@/services/branchDetail.service";
import { FormTextField } from "../Form";

interface SettingsTabProps {
  branchId: number;
}

export function SettingsTab({ branchId }: SettingsTabProps) {
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
    try {
      await saveBranchSettings(branchId, { name: trimmed });
    } catch (err) {
      console.error("[SettingsTab] Error saving:", err);
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
