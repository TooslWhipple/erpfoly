import { Box, CircularProgress, Stack } from "@mui/material";
import { TabFilters, Title } from "@/components";
import { FolypuntosForm } from "@/components/Folypuntos/FolypuntosForm";
import { useFolypuntosPage } from "@/hooks/usePoints";
import { usePermissions } from "@/hooks/usePermissions";
import { CATALOG_POINTS_UPDATE } from "@/lib/permissions";
export default function Folypuntos() {
  const { hasPermission } = usePermissions();
  const canUpdatePoints = hasPermission(CATALOG_POINTS_UPDATE);
  const {
    purchaseTypes,
    formState,
    tabs,
    effectiveActiveTab,
    handleFieldChange,
    handleSave,
    handleTabChange,
    loading,
    saving,
  } = useFolypuntosPage();
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
  if (!purchaseTypes.length) {
    return (
      <>
        <Title title="Configuración de Folypuntos" />
        <Box
          sx={{
            p: 2,
          }}
        >
          No hay tipos de compra configurados.
        </Box>
      </>
    );
  }
  return (
    <Stack direction="column" spacing={3}>
      <Title
        title="Configuración de Folypuntos"
        actions={[
          {
            id: "save",
            label: "Guardar",
            onClick: handleSave,
            disabled: saving || !canUpdatePoints,
            permission: CATALOG_POINTS_UPDATE,
          },
        ]}
      />

      <TabFilters
        tabs={tabs}
        activeTab={effectiveActiveTab}
        onTabChange={handleTabChange}
      />

      <FolypuntosForm
        formState={formState}
        activePurchaseTypeId={effectiveActiveTab}
        onFieldChange={handleFieldChange}
        disabled={saving || !canUpdatePoints}
      />
    </Stack>
  );
}
