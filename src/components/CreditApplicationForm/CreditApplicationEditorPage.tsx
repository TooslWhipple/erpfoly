import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Button, Divider, Stack } from "@mui/material";
import { Breadcrumbs, MainLayout, TabFilters } from "@/components";
import { BasicInformationTab } from "./BasicInformationTab";
import { CreditApplicationIntakeModal } from "@/components/CreditApplicationIntakeModal";
import { useCreditApplicationForm } from "@/hooks/credit-applications";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";

interface CreditApplicationEditorPageProps {
  isCreateMode: boolean;
  applicationId?: string;
}

export function CreditApplicationEditorPage({ isCreateMode, applicationId }: CreditApplicationEditorPageProps) {
  const router = useRouter();

  const [intakeOpen, setIntakeOpen] = useState(isCreateMode);

  const showSuccess = useSnackbarStore((state) => state.showSuccess);
  const showError = useSnackbarStore((state) => state.showError);

  const {
    loading,
    saving,
    activeTab,
    tabs,
    setActiveTab,
    basicInformationTab,
    persistBasicInformation,
    handleSave,
    handleBiometricsCompleted,
  } = useCreditApplicationForm({ applicationId, isCreateMode });

  const breadcrumbItems: BreadcrumbItem[] = useMemo(() => [
    { label: "Solicitudes de crédito", href: "/solicitudes-credito" },
    { label: isCreateMode ? "Nueva solicitud" : "Editar solicitud" },
  ], [isCreateMode]);

  const handleGoBack = () => {
    router.push("/solicitudes-credito");
  };

  const handleContinueBasicTab = async () => {
    const wasSaved = await handleSave();
    if (wasSaved) {
      showSuccess("Solicitud guardada correctamente.");
    } else {
      showError("No fue posible guardar la solicitud.");
    }
    
    return wasSaved;
  };

  const handleBasicFieldChange = (field: Parameters<typeof basicInformationTab.setFieldValue>[0], value: string) => {
    const nextValues = basicInformationTab.setFieldValue(field, value);
    persistBasicInformation(nextValues);
  };

  return (
    <MainLayout>
      <CreditApplicationIntakeModal
        open={intakeOpen}
        onClose={() => setIntakeOpen(false)}
        onCompleted={(payload) => {
          handleBiometricsCompleted(payload);
          setIntakeOpen(false);
          showSuccess("Biometría registrada para la solicitud.");
        }}
      />

      <Stack spacing={3}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          alignItems={{ xs: "flex-start", md: "center" }}
          justifyContent="space-between"
          spacing={2}
        >
          <Breadcrumbs items={breadcrumbItems} showBackButton onBack={handleGoBack} />
          <Button variant="contained" color="inherit" disabled={saving} onClick={handleContinueBasicTab}>
            Enviar a C&C
          </Button>
        </Stack>

        <Divider />

        <TabFilters
          showSearch={false}
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(value) => setActiveTab(value as typeof activeTab)}
        />

        {
          activeTab === "basic-information" &&
          <BasicInformationTab
            values={basicInformationTab.values}
            errors={basicInformationTab.errors}
            validatingSecurityCode={basicInformationTab.validatingSecurityCode}
            isSecurityCodeValid={basicInformationTab.isSecurityCodeValid}
            onFieldChange={handleBasicFieldChange}
            onValidateSecurityCode={basicInformationTab.validateCurrentSecurityCode}
            onContinue={handleContinueBasicTab}
          />
        }

      </Stack>
    </MainLayout>
  );
}
