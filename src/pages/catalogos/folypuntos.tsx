import { Box, CircularProgress } from "@mui/material";
import { MainLayout, TabFilters, Title } from "@/components";
import { FolypuntosForm } from "@/components/Folypuntos/FolypuntosForm";
import { useFolypuntosPage } from "@/hooks/usePoints";

export default function Folypuntos() {
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
      <MainLayout>
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
      </MainLayout>
    );
  }

  if (!purchaseTypes.length) {
    return (
      <MainLayout>
        <Title title="Configuración de Folypuntos" />
        <Box sx={{ p: 2 }}>No hay tipos de compra configurados.</Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Title
        title="Configuración de Folypuntos"
        actions={[
          {
            id: "save",
            label: "Guardar",
            onClick: handleSave,
            disabled: saving,
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
        disabled={saving}
      />
    </MainLayout>
  );
}
