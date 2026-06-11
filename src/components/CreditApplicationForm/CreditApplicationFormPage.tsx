import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Button, CircularProgress, IconButton, Stack, Typography } from "@mui/material";
import { CircleAlert } from "lucide-react";
import { X } from "@/components/Icons";
import { MainLayout, TabFilters } from "@/components";
import { AddressTab } from "./AddressTab";
import { BasicInformationTab } from "./BasicInformationTab";
import { DocumentationTab } from "./DocumentationTab";
import { EmploymentTab } from "./EmploymentTab";
import { FamilyTab } from "./FamilyTab";
import { GuarantorTab } from "./GuarantorTab";
import { ReferencesTab } from "./ReferencesTab";
import { StatusAlertCard } from "./StatusAlertCard";
import { useCreditApplicationForm } from "@/hooks/credit-applications";
import { useHousingTypes } from "@/hooks/useHousingTypes";
import { useFamilyRelationships } from "@/hooks/useFamilyRelationships";
import { useMaritalStatuses } from "@/hooks/useMaritalStatuses";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { theme } from "@/styles/theme";
import type { CreditApplicationTabId } from "@/types/credit-application-form.types";

interface CreditApplicationFormPageProps {
  isCreateMode: boolean;
  applicationId?: string;
}

export function CreditApplicationFormPage({ isCreateMode, applicationId }: CreditApplicationFormPageProps) {
  const router = useRouter();
  const [tabsWithSubmissionValidationErrors, setTabsWithSubmissionValidationErrors] = useState<
    CreditApplicationTabId[]
  >([]);

  const showSuccess = useSnackbarStore((state) => state.showSuccess);
  const showError = useSnackbarStore((state) => state.showError);

  const {
    loading,
    saving,
    isFormLocked,
    isFormComplete,
    formAction,
    activeTab,
    tabs,
    requiresIncomeProof,
    requiresEmploymentProofLetter,
    requiresGuarantorInformation,
    missingAdditionalInformationLabels,
    tabsWithMissingRequestedInformation,
    error,
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
    handleSaveActiveTab,
    handleSubmitApplication,
  } = useCreditApplicationForm({ applicationId, isCreateMode });

  const { data: maritalStatuses = [], isPending: maritalStatusesLoading } = useMaritalStatuses();
  const { data: familyRelationships = [], isPending: familyRelationshipsLoading } =
    useFamilyRelationships();
  const { data: housingTypes = [], isPending: housingTypesLoading } = useHousingTypes();

  // const pageTitle = isCreateMode ? "Nueva solicitud de crédito" : "Editar solicitud de crédito";

  const additionalInformationAlertMessage = useMemo(() => {
    if (missingAdditionalInformationLabels.length === 0) {
      return "";
    }

    return missingAdditionalInformationLabels.join(", ");
  }, [missingAdditionalInformationLabels]);

  const tabsWithErrorStateSet = useMemo(
    () =>
      new Set<CreditApplicationTabId>([
        ...tabsWithMissingRequestedInformation,
        ...tabsWithSubmissionValidationErrors,
      ]),
    [tabsWithMissingRequestedInformation, tabsWithSubmissionValidationErrors]
  );

  const tabsWithErrorState = useMemo(
    () =>
      tabs.map((tab) => ({
        ...tab,
        label:
          tabsWithErrorStateSet.has(tab.value as CreditApplicationTabId)
            ? (
              <Stack direction="row" spacing={0.75} alignItems="center">
                <CircleAlert size={14} />
                <span>{tab.label}</span>
              </Stack>
            )
            : tab.label,
        textColor:
          tabsWithErrorStateSet.has(tab.value as CreditApplicationTabId)
            ? theme.palette.app.chip.variants.error.color
            : undefined,
      })),
    [tabs, tabsWithErrorStateSet]
  );

  const handleGoBack = () => {
    router.push("/solicitudes-credito");
  };

  const handleSubmitApplicationClick = async () => {
    const submitResult = await handleSubmitApplication();
    if (!submitResult.success) {
      if (submitResult.invalidTabs.length > 0) {
        setTabsWithSubmissionValidationErrors(submitResult.invalidTabs);
        const invalidTabLabels = submitResult.invalidTabs
          .map((tabId) => tabs.find((tab) => tab.value === tabId)?.label)
          .filter((label): label is string => typeof label === "string");
        const uniqueInvalidTabLabels = Array.from(new Set(invalidTabLabels));

        if (submitResult.invalidTabs[0]) {
          setActiveTab(submitResult.invalidTabs[0]);
        }

        showError(
          uniqueInvalidTabLabels.length > 0
            ? `Hay errores en: ${uniqueInvalidTabLabels.join(", ")}.`
            : "Hay errores en los campos. Revisa y corrige antes de continuar."
        );
      } else {
        showError(error || "No fue posible enviar la solicitud a revisión. Verifica la información e intenta nuevamente.");
      }
      return false;
    }

    setTabsWithSubmissionValidationErrors([]);
    showSuccess(submitResult.message || "Solicitud enviada a revisión correctamente.");
    router.push("/solicitudes-credito");
    return true;
  };

  const handleContinueToNextTab = async () => {
    const wasSaved = await handleSaveActiveTab();
    if (!wasSaved) {
      if (error) {
        showError("Hay errores en los campos. Revisa y corrige antes de continuar.");
      } else {
        showError("Completa los campos requeridos para continuar.");
      }
      return false;
    }

    setTabsWithSubmissionValidationErrors((previousTabs) =>
      previousTabs.filter((tabId) => tabId !== activeTab)
    );

    const currentTabIndex = tabs.findIndex((tab) => tab.value === activeTab);
    const nextTab = tabs[currentTabIndex + 1];
    if (nextTab) {
      setActiveTab(nextTab.value);
    }
    return true;
  };

  const handleGuarantorSave = async () => {
    if (!requiresGuarantorInformation) {
      return handleSubmitApplicationClick();
    }
    return handleContinueToNextTab();
  };

  const isSubmitButtonLoading = formAction === "saving" || formAction === "submitting";

  const spouseFieldsEnabled = useMemo(() => {
    const selectedStatus = maritalStatuses.find(
      (status) => String(status.id) === basicInformationTab.values.maritalStatus
    );
    return selectedStatus?.code === "CASADO" || selectedStatus?.code === "UNION_LIBRE";
  }, [maritalStatuses, basicInformationTab.values.maritalStatus]);

  const handleBasicFieldChange = (field: Parameters<typeof basicInformationTab.setFieldValue>[0], value: string) => {
    const nextValues = basicInformationTab.setFieldValue(field, value);
    persistBasicInformation(nextValues);

    if (field === "maritalStatus") {
      const selectedStatus = maritalStatuses.find(
        (status) => String(status.id) === value
      );
      const hasSpouse = selectedStatus?.code === "CASADO" || selectedStatus?.code === "UNION_LIBRE";

      if (hasSpouse) {
        const nextFamilyValues = familyTab.setFieldValue("hasSpouse", true);
        persistFamily(nextFamilyValues);
      } else {
        const nextFamilyValues = familyTab.setFieldValue("hasSpouse", false);
        familyTab.setFieldValue("spouseName", "");
        familyTab.setFieldValue("spousePhone", "");
        persistFamily(nextFamilyValues);

        employmentTab.setFieldValue("spouseCompany", "");
        employmentTab.setFieldValue("spousePostalCode", "");
        employmentTab.setFieldValue("spouseNeighborhoodFullCode", "");
        employmentTab.setFieldValue("spouseState", "");
        employmentTab.setFieldValue("spouseCity", "");
        employmentTab.setFieldValue("spouseStreetAndNumber", "");
        employmentTab.setFieldValue("spouseSeniorityYears", "");
        employmentTab.setFieldValue("spousePosition", "");
        employmentTab.setFieldValue("spouseDepartment", "");
        employmentTab.setFieldValue("spouseMonthlyIncome", "");
        employmentTab.setFieldValue("spouseCompanyPhone", "");

        const nextEmploymentValues = employmentTab.values;
        persistEmployment(nextEmploymentValues);
      }
    }
  };

  return (
    <MainLayout>
      <Stack spacing={3}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <IconButton size="small" onClick={handleGoBack} disabled={isFormLocked}><X size={18} /></IconButton>
            <Typography variant="h6" fontWeight={700}>Nueva solicitud de crédito</Typography>
          </Stack>
          <Button
            variant="contained"
            style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}
            disabled={isFormLocked || loading || !isFormComplete}
            onClick={handleSubmitApplicationClick}
            sx={{ minWidth: 160 }}
          >
            {
              (isSubmitButtonLoading) ?
                <CircularProgress size={20} color="inherit" />
                :
                "Enviar solicitud"
            }
          </Button>
        </Stack>

        {
          error &&
          <StatusAlertCard
            variant="error"
            title="Error al guardar"
            message={error}
            icon={<CircleAlert size={18} />}
          />
        }

        {
          missingAdditionalInformationLabels.length > 0 &&
          <StatusAlertCard
            variant="error"
            title="Documentación adicional requerida"
            message={additionalInformationAlertMessage}
            icon={<CircleAlert size={18} />}
          />
        }

        <TabFilters
          showSearch={false}
          tabs={tabsWithErrorState}
          activeTab={activeTab}
          disabled={isFormLocked}
          onTabChange={(value) => {
            if (isFormLocked) return;
            setActiveTab(value as typeof activeTab);
          }}
        />

        {
          activeTab === "basic-information" &&
          <BasicInformationTab
            values={basicInformationTab.values}
            errors={basicInformationTab.errors}
            validatingSecurityCode={basicInformationTab.validatingSecurityCode}
            isSecurityCodeValid={basicInformationTab.isSecurityCodeValid}
            otpActionLabel={basicInformationTab.otpActionLabel}
            isOtpActionDisabled={basicInformationTab.isOtpActionDisabled}
            isSecurityCodeFieldDisabled={basicInformationTab.isSecurityCodeFieldDisabled}
            maritalStatusOptions={maritalStatuses}
            maritalStatusesLoading={maritalStatusesLoading}
            onFieldChange={handleBasicFieldChange}
            onValidateSecurityCode={basicInformationTab.validateCurrentSecurityCode}
            onContinue={handleContinueToNextTab}
            saving={saving}
          />
        }
        {
          activeTab === "family" &&
          <FamilyTab
            values={familyTab.values}
            errors={familyTab.errors}
            spouseFieldsEnabled={spouseFieldsEnabled}
            onFieldChange={(field, value) => {
              const nextValues = familyTab.setFieldValue(field, value);
              persistFamily(nextValues);
            }}
            onContinue={handleContinueToNextTab}
            saving={saving}
          />
        }
        {
          activeTab === "address" &&
          <AddressTab
            values={addressTab.values}
            errors={addressTab.errors}
            housingTypeOptions={housingTypes}
            housingTypesLoading={housingTypesLoading}
            mergeFieldValues={(patch) => {
              const nextValues = addressTab.mergeFieldValues(patch);
              persistAddress(nextValues);
              return nextValues;
            }}
            onFieldChange={(field, value) => {
              const nextValues = addressTab.setFieldValue(field, value);
              persistAddress(nextValues);
            }}
            onSave={handleContinueToNextTab}
            saving={saving}
          />
        }
        {
          activeTab === "employment" &&
          <EmploymentTab
            values={employmentTab.values}
            errors={employmentTab.errors}
            spouseSectionEnabled={spouseFieldsEnabled}
            mergeFieldValues={(patch) => {
              const nextValues = employmentTab.mergeFieldValues(patch);
              persistEmployment(nextValues);
              return nextValues;
            }}
            onFieldChange={(field, value) => {
              const nextValues = employmentTab.setFieldValue(field, value);
              persistEmployment(nextValues);
            }}
            onSave={handleContinueToNextTab}
            saving={saving}
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
            relationshipOptions={familyRelationships}
            relationshipsLoading={familyRelationshipsLoading}
            onAddReference={() => {
              const nextValues = referencesTab.addReference();
              persistReferences(nextValues);
            }}
            onRemoveReference={(referenceId) => {
              const nextValues = referencesTab.removeReference(referenceId);
              persistReferences(nextValues);
            }}
            onSave={handleContinueToNextTab}
            saving={saving}
          />
        }
        {
          activeTab === "documentation" &&
          <DocumentationTab
            values={documentationTab.values}
            showIncomeProof
            showEmploymentProofLetter
            requireIncomeProof={requiresIncomeProof}
            requireEmploymentProofLetter={requiresEmploymentProofLetter}
            onIncomeProofChange={(files) => {
              const nextValues = documentationTab.setFieldValue("incomeProofFiles", files);
              persistDocumentation(nextValues);
            }}
            onEmploymentProofLetterChange={(files) => {
              const nextValues = documentationTab.setFieldValue("employmentProofLetterFiles", files);
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
            onSave={handleContinueToNextTab}
            saving={saving}
          />
        }
        {
          activeTab === "guarantor" &&
          <GuarantorTab
            values={guarantorTab.values}
            errors={guarantorTab.errors}
            maritalStatusOptions={maritalStatuses}
            maritalStatusesLoading={maritalStatusesLoading}
            mergeFieldValues={(patch) => {
              const nextValues = guarantorTab.mergeFieldValues(patch);
              persistGuarantor(nextValues);
              return nextValues;
            }}
            onFieldChange={(field, value) => {
              const nextValues = guarantorTab.setFieldValue(field, value);
              persistGuarantor(nextValues);
            }}
            onSave={handleGuarantorSave}
            saving={saving}
          />
        }

      </Stack>
    </MainLayout>
  );
}
