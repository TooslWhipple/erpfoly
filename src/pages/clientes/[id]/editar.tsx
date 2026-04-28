import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Divider, Stack, Typography } from "@mui/material";
import {
  AddressTab,
  BasicInformationTab,
  DocumentationTab,
  EmploymentTab,
  FamilyTab,
  ReferencesTab,
} from "@/components/CreditApplicationForm";
import { Breadcrumbs, MainLayout } from "@/components";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import { getClientDetail } from "@/data/clientes.mockData";
import { useFamilyRelationships } from "@/hooks/useFamilyRelationships";
import { useHousingTypes } from "@/hooks/useHousingTypes";
import { useMaritalStatuses } from "@/hooks/useMaritalStatuses";
import { useCreditApplicationForm } from "@/hooks/credit-applications";
import type { ClientDetail } from "@/types/clientes.types";
import type { CreditApplicationTabId } from "@/types/credit-application-form.types";

interface ClientEditTabConfig {
  queryTabId: string;
  label: string;
  formTabId: CreditApplicationTabId;
}

const CLIENT_EDIT_TAB_CONFIG: ClientEditTabConfig[] = [
  { queryTabId: "basic", label: "Información básica", formTabId: "basic-information" },
  { queryTabId: "family", label: "Familia", formTabId: "family" },
  { queryTabId: "address", label: "Dirección", formTabId: "address" },
  { queryTabId: "employment", label: "Empleo", formTabId: "employment" },
  { queryTabId: "references", label: "Referencias", formTabId: "references" },
  { queryTabId: "documentation", label: "Documentación", formTabId: "documentation" },
];

function normalizeTabQueryValue(rawTab: string | string[] | undefined): string | undefined {
  if (typeof rawTab === "string") {
    const normalized = rawTab.trim().toLowerCase();
    return normalized.length > 0 ? normalized : undefined;
  }

  if (Array.isArray(rawTab) && rawTab.length > 0) {
    const firstTab = rawTab[0]?.trim().toLowerCase();
    return firstTab && firstTab.length > 0 ? firstTab : undefined;
  }

  return undefined;
}

function resolveClientEditTab(rawTab: string | string[] | undefined): ClientEditTabConfig {
  const normalizedRawTab = normalizeTabQueryValue(rawTab);
  const rawTabValue = normalizedRawTab === "basic-information" ? "basic" : normalizedRawTab;

  if (!rawTabValue) return CLIENT_EDIT_TAB_CONFIG[0];

  const byQueryId = CLIENT_EDIT_TAB_CONFIG.find((item) => item.queryTabId === rawTabValue);
  if (byQueryId) return byQueryId;

  const byFormId = CLIENT_EDIT_TAB_CONFIG.find((item) => item.formTabId === rawTabValue);
  return byFormId ?? CLIENT_EDIT_TAB_CONFIG[0];
}

function getCanonicalTabQueryValue(tabId: CreditApplicationTabId): string {
  if (tabId === "basic-information") return "basic-information";
  return tabId;
}

export default function ClientEditPage() {
  const router = useRouter();
  const { id, tab } = router.query;
  const normalizedQueryTab = normalizeTabQueryValue(tab);

  const [client, setClient] = useState<ClientDetail | null>(null);

  const {
    activeTab,
    setActiveTab,
    requiresIncomeProof,
    requiresEmploymentProofLetter,
    basicInformationTab,
    familyTab,
    addressTab,
    employmentTab,
    referencesTab,
    documentationTab,
    persistBasicInformation,
    persistFamily,
    persistAddress,
    persistEmployment,
    persistReferences,
    persistDocumentation,
    handleSaveActiveTab,
  } = useCreditApplicationForm({
    isCreateMode: true,
  });

  const { data: maritalStatuses = [], isPending: maritalStatusesLoading } = useMaritalStatuses();
  const { data: familyRelationships = [], isPending: familyRelationshipsLoading } =
    useFamilyRelationships();
  const { data: housingTypes = [], isPending: housingTypesLoading } = useHousingTypes();

  const selectedTab = useMemo(() => resolveClientEditTab(tab), [tab]);

  useEffect(() => {
    if (activeTab === selectedTab.formTabId) return;
    setActiveTab(selectedTab.formTabId);
  }, [activeTab, selectedTab.formTabId, setActiveTab]);

  useEffect(() => {
    if (typeof id !== "string") return;
    if (!router.isReady) return;

    if (activeTab !== selectedTab.formTabId) return;

    const canonicalTab = getCanonicalTabQueryValue(activeTab);
    if (normalizedQueryTab === canonicalTab) return;

    router.replace(
      {
        pathname: router.pathname,
        query: { id, tab: canonicalTab },
      },
      undefined,
      { shallow: true }
    );
  }, [
    activeTab,
    id,
    normalizedQueryTab,
    router,
    selectedTab.formTabId,
  ]);

  useEffect(() => {
    if (typeof id !== "string") return;

    let cancelled = false;
    const loadClient = async () => {
      const clientDetail = await getClientDetail(id);
      if (!cancelled) {
        setClient(clientDetail ?? null);
      }
    };

    loadClient();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const breadcrumbs: BreadcrumbItem[] = useMemo(
    () => [
      { label: "Clientes", href: "/clientes" },
      { label: client?.fullName ?? "Detalle", href: typeof id === "string" ? `/clientes/${id}` : undefined },
      { label: selectedTab.label },
    ],
    [client?.fullName, id, selectedTab.label]
  );

  const renderSelectedTab = () => {
    if (activeTab === "basic-information") {
      return (
        <BasicInformationTab
          values={basicInformationTab.values}
          errors={basicInformationTab.errors}
          validatingSecurityCode={basicInformationTab.validatingSecurityCode}
          isSecurityCodeValid={basicInformationTab.isSecurityCodeValid}
          maritalStatusOptions={maritalStatuses}
          maritalStatusesLoading={maritalStatusesLoading}
          onFieldChange={(field, value) => {
            const nextValues = basicInformationTab.setFieldValue(field, value);
            persistBasicInformation(nextValues);
          }}
          onValidateSecurityCode={basicInformationTab.validateCurrentSecurityCode}
          onContinue={handleSaveActiveTab}
        />
      );
    }

    if (activeTab === "family") {
      return (
        <FamilyTab
          values={familyTab.values}
          errors={familyTab.errors}
          onFieldChange={(field, value) => {
            const nextValues = familyTab.setFieldValue(field, value);
            persistFamily(nextValues);
          }}
          onContinue={handleSaveActiveTab}
        />
      );
    }

    if (activeTab === "address") {
      return (
        <AddressTab
          values={addressTab.values}
          errors={addressTab.errors}
          clientWhatsappNumber={basicInformationTab.values.whatsappNumber}
          canUseClientPhone={basicInformationTab.values.whatsappNumber.trim().length > 0}
          housingTypeOptions={housingTypes}
          housingTypesLoading={housingTypesLoading}
          mergeFieldValues={(patch) => {
            const nextValues = addressTab.mergeFieldValues(patch);
            persistAddress(nextValues);
            return nextValues;
          }}
          onFieldChange={(field, value) => {
            const normalizedValue =
              field === "receiverPhone" && addressTab.values.useClientPhone
                ? basicInformationTab.values.whatsappNumber
                : value;
            const nextValues = addressTab.setFieldValue(field, normalizedValue);
            persistAddress(nextValues);
          }}
          onSave={handleSaveActiveTab}
        />
      );
    }

    if (activeTab === "employment") {
      return (
        <EmploymentTab
          values={employmentTab.values}
          errors={employmentTab.errors}
          spouseSectionEnabled={familyTab.values.hasSpouse}
          mergeFieldValues={(patch) => {
            const nextValues = employmentTab.mergeFieldValues(patch);
            persistEmployment(nextValues);
            return nextValues;
          }}
          onFieldChange={(field, value) => {
            const nextValues = employmentTab.setFieldValue(field, value);
            persistEmployment(nextValues);
          }}
          onSave={handleSaveActiveTab}
        />
      );
    }

    if (activeTab === "references") {
      return (
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
          onSave={handleSaveActiveTab}
        />
      );
    }

    if (activeTab === "documentation") {
      return (
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
          onSave={handleSaveActiveTab}
        />
      );
    }

    return <Typography color="error">El tab solicitado no es válido.</Typography>;
  };

  if (typeof id !== "string") {
    return null;
  }

  return (
    <MainLayout>
      <Stack spacing={3}>
        <Breadcrumbs
          items={breadcrumbs}
          showBackButton
          onBack={() => router.push(`/clientes/${id}`)}
        />
        <Divider />
        {renderSelectedTab()}
      </Stack>
    </MainLayout>
  );
}
