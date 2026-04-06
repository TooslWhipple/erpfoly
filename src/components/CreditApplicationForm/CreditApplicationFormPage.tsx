import { useMemo } from "react";
import { useRouter } from "next/router";
import { Button, Divider, Stack } from "@mui/material";
import { Breadcrumbs, MainLayout, TabFilters } from "@/components";
import { AddressTab } from "./AddressTab";
import { BasicInformationTab } from "./BasicInformationTab";
import { DocumentationTab } from "./DocumentationTab";
import { EmploymentTab } from "./EmploymentTab";
import { FamilyTab } from "./FamilyTab";
import { GuarantorTab } from "./GuarantorTab";
import { ReferencesTab } from "./ReferencesTab";
import { useCreditApplicationForm } from "@/hooks/credit-applications";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";

interface CreditApplicationFormPageProps {
  isCreateMode: boolean;
  applicationId?: string;
}

export function CreditApplicationFormPage({ isCreateMode, applicationId }: CreditApplicationFormPageProps) {
  const router = useRouter();

  const showSuccess = useSnackbarStore((state) => state.showSuccess);
  const showError = useSnackbarStore((state) => state.showError);

  const {
    saving,
    activeTab,
    tabs,
    setActiveTab,
    basicInformationTab,
    familyTab,
    addressTab,
    employmentTab,
    referencesTab,
    documentationTab,
    guarantorTab,
    persistBasicInformation,
    persistFamily,
    persistAddress,
    persistEmployment,
    persistReferences,
    persistDocumentation,
    persistGuarantor,
    handleSave,
    handleSaveActiveTab,
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

  const handleContinueToNextTab = async () => {
    const wasSaved = await handleSaveActiveTab();
    if (!wasSaved) {
      showError("Completa los campos requeridos para continuar.");
      return false;
    }
    const currentTabIndex = tabs.findIndex((tab) => tab.value === activeTab);
    const nextTab = tabs[currentTabIndex + 1];
    if (nextTab) {
      setActiveTab(nextTab.value);
    }
    return true;
  };

  return (
    <MainLayout>
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
            onContinue={handleContinueToNextTab}
          />
        }
        {
          activeTab === "family" &&
          <FamilyTab
            values={familyTab.values}
            errors={familyTab.errors}
            onFieldChange={(field, value) => {
              const nextValues = familyTab.setFieldValue(field, value);
              persistFamily(nextValues);
            }}
            onContinue={handleContinueToNextTab}
          />
        }
        {
          activeTab === "address" &&
          <AddressTab
            values={addressTab.values}
            errors={addressTab.errors}
            onFieldChange={(field, value) => {
              const nextValues = addressTab.setFieldValue(field, value);
              persistAddress(nextValues);
            }}
            onSave={handleContinueToNextTab}
          />
        }
        {
          activeTab === "employment" &&
          <EmploymentTab
            values={employmentTab.values}
            errors={employmentTab.errors}
            onFieldChange={(field, value) => {
              const nextValues = employmentTab.setFieldValue(field, value);
              persistEmployment(nextValues);
            }}
            onSave={handleContinueToNextTab}
          />
        }
        {
          activeTab === "references" &&
          <ReferencesTab
            values={referencesTab.values}
            errors={referencesTab.errors}
            onFieldChange={(field, value) => {
              const nextValues = referencesTab.setFieldValue(field, value);
              persistReferences(nextValues);
            }}
            onReferenceFieldChange={(referenceId, field, value) => {
              const nextValues = referencesTab.setReferenceFieldValue(referenceId, field, value);
              persistReferences(nextValues);
            }}
            onAddReference={() => {
              const nextValues = referencesTab.addReference();
              persistReferences(nextValues);
            }}
            onRemoveReference={(referenceId) => {
              const nextValues = referencesTab.removeReference(referenceId);
              persistReferences(nextValues);
            }}
            onSave={handleContinueToNextTab}
          />
        }
        {
          activeTab === "documentation" &&
          <DocumentationTab
            values={documentationTab.values}
            onIncomeProofChange={(files) => {
              const nextValues = documentationTab.setFieldValue("incomeProofFiles", files);
              persistDocumentation(nextValues);
            }}
            onIneFrontChange={(files) => {
              const nextValues = documentationTab.setFieldValue("ineFrontFiles", files);
              persistDocumentation(nextValues);
            }}
            onIneBackChange={(files) => {
              const nextValues = documentationTab.setFieldValue("ineBackFiles", files);
              persistDocumentation(nextValues);
            }}
            onSave={handleContinueBasicTab}
          />
        }
        {
          activeTab === "guarantor" &&
          <GuarantorTab
            values={guarantorTab.values}
            errors={guarantorTab.errors}
            onFieldChange={(field, value) => {
              const nextValues = guarantorTab.setFieldValue(field, value);
              persistGuarantor(nextValues);
            }}
            onSave={handleContinueBasicTab}
          />
        }

      </Stack>
    </MainLayout>
  );
}
