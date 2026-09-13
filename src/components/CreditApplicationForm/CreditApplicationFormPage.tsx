import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  Button,
  CircularProgress,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { CircleAlert } from "lucide-react";
import { X } from "@/components/Icons";
import { TabFilters } from "@/components";
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
export function CreditApplicationFormPage({
  isCreateMode,
  applicationId,
}: CreditApplicationFormPageProps) {
  const router = useRouter();
  const [
    tabsWithSubmissionValidationErrors,
    setTabsWithSubmissionValidationErrors,
  ] = useState<CreditApplicationTabId[]>([]);
  const showSuccess = useSnackbarStore((state) => state.showSuccess);
  const showError = useSnackbarStore((state) => state.showError);
  const {
    loading,
    saving,
    isFormLocked,
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
    handleSaveActiveTab,
    handleSubmitApplication,
    canEditBiometrics,
    faceMatch,
    refreshBiometricsDocumentation,
  } = useCreditApplicationForm({
    applicationId,
    isCreateMode,
  });
  const { data: maritalStatuses = [], isPending: maritalStatusesLoading } =
    useMaritalStatuses();
  const {
    data: familyRelationships = [],
    isPending: familyRelationshipsLoading,
  } = useFamilyRelationships();
  const { data: housingTypes = [], isPending: housingTypesLoading } =
    useHousingTypes();
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
    [tabsWithMissingRequestedInformation, tabsWithSubmissionValidationErrors],
  );
  const tabsWithErrorState = useMemo(
    () =>
      tabs.map((tab) => ({
        ...tab,
        label: tabsWithErrorStateSet.has(
          tab.value as CreditApplicationTabId,
        ) ? (
          <Stack direction="row" spacing={0.75} alignItems="center">
            <CircleAlert size={14} />
            <span>{tab.label}</span>
          </Stack>
        ) : (
          tab.label
        ),
        textColor: tabsWithErrorStateSet.has(
          tab.value as CreditApplicationTabId,
        )
          ? theme.palette.app.chip.variants.error.color
          : undefined,
      })),
    [tabs, tabsWithErrorStateSet],
  );
  const handleGoBack = () => {
    router.push("/solicitudes-credito");
  };
  const handleSaveActiveTabOnly = async () => {
    const wasSaved = await handleSaveActiveTab();
    if (!wasSaved) {
      if (error) {
        showError(
          "Hay errores en los campos. Revisa y corrige antes de continuar.",
        );
      } else {
        showError("Completa los campos requeridos para guardar.");
      }
      return false;
    }
    setTabsWithSubmissionValidationErrors((previousTabs) =>
      previousTabs.filter((tabId) => tabId !== activeTab),
    );
    showSuccess("Información guardada correctamente.");
    return true;
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
            ? `Falta información en: ${uniqueInvalidTabLabels.join(", ")}.`
            : "Hay errores en los campos. Revisa y corrige antes de continuar.",
        );
      } else {
        showError(
          error ||
            "No fue posible enviar la solicitud a revisión. Verifica la información e intenta nuevamente.",
        );
      }
      return false;
    }
    setTabsWithSubmissionValidationErrors([]);
    showSuccess(
      submitResult.message ||
        "Solicitud enviada a revisión y marcada como pendiente.",
    );
    router.push("/solicitudes-credito");
    return true;
  };
  const handleContinueToNextTab = handleSaveActiveTabOnly;
  const isSubmitButtonLoading =
    formAction === "saving" || formAction === "submitting";
  const spouseFieldsEnabled = useMemo(() => {
    const selectedStatus = maritalStatuses.find(
      (status) =>
        String(status.id) === basicInformationTab.values.maritalStatus,
    );
    return (
      selectedStatus?.code === "CASADO" ||
      selectedStatus?.code === "UNION_LIBRE"
    );
  }, [maritalStatuses, basicInformationTab.values.maritalStatus]);
  const handleBasicFieldChange = (
    field: Parameters<typeof basicInformationTab.setFieldValue>[0],
    value: string,
  ) => {
    basicInformationTab.setFieldValue(field, value);
    if (field === "maritalStatus") {
      const selectedStatus = maritalStatuses.find(
        (status) => String(status.id) === value,
      );
      const hasSpouse =
        selectedStatus?.code === "CASADO" ||
        selectedStatus?.code === "UNION_LIBRE";
      if (hasSpouse) {
        familyTab.setFieldValue("hasSpouse", true);
      } else {
        familyTab.setFieldValue("hasSpouse", false);
        familyTab.setFieldValue("spouseName", "");
        familyTab.setFieldValue("spousePhone", "");
        employmentTab.setFieldValue("spouseHasEmployment", false);
        employmentTab.setFieldValue("spouseCompany", "");
        employmentTab.setFieldValue("spousePostalCode", "");
        employmentTab.setFieldValue("spouseNeighborhoodFullCode", "");
        employmentTab.setFieldValue("spouseState", "");
        employmentTab.setFieldValue("spouseCity", "");
        employmentTab.setFieldValue("spouseStreet", "");
        employmentTab.setFieldValue("spouseExternalNumber", "");
        employmentTab.setFieldValue("spouseInternalNumber", "");
        employmentTab.setFieldValue("spouseSeniorityYears", "");
        employmentTab.setFieldValue("spousePosition", "");
        employmentTab.setFieldValue("spouseDepartment", "");
        employmentTab.setFieldValue("spouseMonthlyIncome", "");
        employmentTab.setFieldValue("spouseCompanyPhone", "");
      }
    }
  };
  return (
    <Stack spacing={3}>
      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        spacing={2}
        alignItems={{
          xs: "flex-start",
          sm: "center",
        }}
        justifyContent="space-between"
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconButton
            size="small"
            onClick={handleGoBack}
            disabled={isFormLocked}
          >
            <X size={18} />
          </IconButton>
          <Typography variant="h6" fontWeight={700}>
            Nueva solicitud de crédito
          </Typography>
        </Stack>
        <Button
          variant="contained"
          style={{
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap",
          }}
          disabled={isFormLocked || loading}
          onClick={handleSubmitApplicationClick}
          sx={{
            minWidth: 160,
          }}
        >
          {isSubmitButtonLoading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            "Enviar solicitud"
          )}
        </Button>
      </Stack>

      {error && (
        <StatusAlertCard
          variant="error"
          title="Error al guardar"
          message={error}
          icon={<CircleAlert size={18} />}
        />
      )}

      {missingAdditionalInformationLabels.length > 0 && (
        <StatusAlertCard
          variant="error"
          title="Documentación adicional requerida"
          message={additionalInformationAlertMessage}
          icon={<CircleAlert size={18} />}
        />
      )}

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

      {activeTab === "basic-information" && (
        <BasicInformationTab
          values={basicInformationTab.values}
          errors={basicInformationTab.errors}
          validatingSecurityCode={basicInformationTab.validatingSecurityCode}
          isSecurityCodeValid={basicInformationTab.isSecurityCodeValid}
          otpActionLabel={basicInformationTab.otpActionLabel}
          isOtpActionDisabled={basicInformationTab.isOtpActionDisabled}
          isSecurityCodeFieldDisabled={
            basicInformationTab.isSecurityCodeFieldDisabled
          }
          maritalStatusOptions={maritalStatuses}
          maritalStatusesLoading={maritalStatusesLoading}
          onFieldChange={handleBasicFieldChange}
          onValidateSecurityCode={
            basicInformationTab.validateCurrentSecurityCode
          }
          onContinue={handleContinueToNextTab}
          saving={saving}
        />
      )}
      {activeTab === "family" && (
        <FamilyTab
          values={familyTab.values}
          errors={familyTab.errors}
          spouseFieldsEnabled={spouseFieldsEnabled}
          onFieldChange={(field, value) => {
            familyTab.setFieldValue(field, value);
          }}
          onContinue={handleContinueToNextTab}
          saving={saving}
        />
      )}
      {activeTab === "address" && (
        <AddressTab
          values={addressTab.values}
          errors={addressTab.errors}
          housingTypeOptions={housingTypes}
          housingTypesLoading={housingTypesLoading}
          mergeFieldValues={(patch) => addressTab.mergeFieldValues(patch)}
          onFieldChange={(field, value) => {
            addressTab.setFieldValue(field, value);
          }}
          onSave={handleContinueToNextTab}
          saving={saving}
        />
      )}
      {activeTab === "employment" && (
        <EmploymentTab
          values={employmentTab.values}
          errors={employmentTab.errors}
          spouseSectionEnabled={spouseFieldsEnabled}
          mergeFieldValues={(patch) => employmentTab.mergeFieldValues(patch)}
          onFieldChange={(field, value) => {
            employmentTab.setFieldValue(field, value);
          }}
          onSave={handleContinueToNextTab}
          saving={saving}
        />
      )}
      {activeTab === "references" && (
        <ReferencesTab
          values={referencesTab.values}
          errors={referencesTab.errors}
          onFieldChange={(field, value) => {
            referencesTab.setFieldValue(field, value);
          }}
          onReferenceFieldChange={(referenceId, field, value) => {
            referencesTab.setReferenceFieldValue(referenceId, field, value);
          }}
          relationshipOptions={familyRelationships}
          relationshipsLoading={familyRelationshipsLoading}
          onAddReference={() => {
            referencesTab.addReference();
          }}
          onRemoveReference={(referenceId) => {
            referencesTab.removeReference(referenceId);
          }}
          onSave={handleContinueToNextTab}
          saving={saving}
        />
      )}
      {activeTab === "documentation" && (
        <DocumentationTab
          values={documentationTab.values}
          showIncomeProof
          showEmploymentProofLetter
          requireIncomeProof={requiresIncomeProof}
          requireEmploymentProofLetter={requiresEmploymentProofLetter}
          onIncomeProofChange={(files) => {
            documentationTab.setFieldValue("incomeProofFiles", files);
          }}
          onEmploymentProofLetterChange={(files) => {
            documentationTab.setFieldValue("employmentProofLetterFiles", files);
          }}
          onIneFrontChange={(files) => {
            documentationTab.setFieldValue("ineFrontFiles", files);
          }}
          onIneBackChange={(files) => {
            documentationTab.setFieldValue("ineBackFiles", files);
          }}
          onSave={handleContinueToNextTab}
          saving={saving}
          applicationId={applicationId}
          canEditBiometrics={canEditBiometrics}
          faceMatchStatus={faceMatch?.status ?? null}
          faceMatchScore={faceMatch?.score ?? null}
          onBiometricsUpdated={refreshBiometricsDocumentation}
        />
      )}
      {activeTab === "guarantor" && (
        <GuarantorTab
          values={guarantorTab.values}
          errors={guarantorTab.errors}
          maritalStatusOptions={maritalStatuses}
          maritalStatusesLoading={maritalStatusesLoading}
          mergeFieldValues={(patch) => guarantorTab.mergeFieldValues(patch)}
          onFieldChange={(field, value) => {
            guarantorTab.setFieldValue(field, value);
          }}
          onSave={handleSaveActiveTabOnly}
          saving={saving}
        />
      )}
    </Stack>
  );
}
