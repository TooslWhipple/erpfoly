import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { Title } from "@/components";
import { CurrencyInput } from "@/components/Folypuntos";
import { useMoratoryRateConfigPage } from "@/hooks/useMoratoryRateConfig";
import { usePermissions } from "@/hooks/usePermissions";
import { CATALOG_MORATORY_RATE_UPDATE } from "@/lib/permissions";

export default function TasaMora() {
  const { hasPermission } = usePermissions();
  const canUpdate = hasPermission(CATALOG_MORATORY_RATE_UPDATE);
  const { annualRate, updatedAt, handleChange, handleSave, loading, saving } =
    useMoratoryRateConfigPage();

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack direction="column" spacing={3}>
      <Title
        title="Tasa de mora"
        description="Tasa de interés moratorio anual aplicada al capital vencido de los créditos. El cambio aplica de inmediato, incluida la mora ya vencida de meses anteriores."
        actions={[
          {
            id: "save",
            label: "Guardar",
            onClick: handleSave,
            disabled: saving || !canUpdate,
            permission: CATALOG_MORATORY_RATE_UPDATE,
          },
        ]}
      />

      <CurrencyInput
        value={annualRate}
        onChange={handleChange}
        min={0}
        max={1000}
        step={0.5}
        decimals={2}
        disabled={saving || !canUpdate}
        currencySymbol=""
        unit="% anual"
      />

      {updatedAt && (
        <Typography variant="body2" color="text.secondary">
          Última actualización: {new Date(updatedAt).toLocaleString("es-MX")}
        </Typography>
      )}
    </Stack>
  );
}
