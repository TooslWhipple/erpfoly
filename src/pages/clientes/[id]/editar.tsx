import { useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { Divider, Skeleton, Stack, Typography } from "@mui/material";
import {
  AddressTab,
  BasicInformationTab,
  DocumentationTab,
  EmploymentTab,
  FamilyTab,
  ReferencesTab,
} from "@/components/CreditApplicationForm";
import { Breadcrumbs } from "@/components";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import { useFamilyRelationships } from "@/hooks/useFamilyRelationships";
import { useHousingTypes } from "@/hooks/useHousingTypes";
import { useMaritalStatuses } from "@/hooks/useMaritalStatuses";
import { useClientInformationForm } from "@/hooks/useClientInformationForm";
import { useCashClientBasicEditForm } from "@/hooks/useCashClientBasicEditForm";
import { useQuery } from "@tanstack/react-query";
import { getClientDetail } from "@/services/clients.service";
import { unwrapOrThrow } from "@/lib/axios";
import { isCreditClient } from "@/utils/client";
import type { CreditApplicationTabId } from "@/types/credit-application-form.types";

interface ClientEditTabConfig {
  queryTabId: string;
  label: string;
  formTabId: CreditApplicationTabId;
}

const CLIENT_EDIT_TAB_CONFIG: ClientEditTabConfig[] = [
  {
    queryTabId: "basic",
    label: "Información básica",
    formTabId: "basic-information",
  },
  {
    queryTabId: "family",
    label: "Familia",
    formTabId: "family",
  },
  {
    queryTabId: "address",
    label: "Dirección",
    formTabId: "address",
  },
  {
    queryTabId: "employment",
    label: "Empleo",
    formTabId: "employment",
  },
  {
    queryTabId: "references",
    label: "Referencias",
    formTabId: "references",
  },
  {
    queryTabId: "documentation",
    label: "Documentación",
    formTabId: "documentation",
  },
];

function normalizeTabQueryValue(
  rawTab: string | string[] | undefined
): string | undefined {
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

function resolveClientEditTab(
  rawTab: string | string[] | undefined
): ClientEditTabConfig {
  const normalizedRawTab = normalizeTabQueryValue(rawTab);
  const rawTabValue =
    normalizedRawTab === "basic-information" ? "basic" : normalizedRawTab;
  if (!rawTabValue) return CLIENT_EDIT_TAB_CONFIG[0];
  const byQueryId = CLIENT_EDIT_TAB_CONFIG.find(
    (item) => item.queryTabId === rawTabValue
  );
  if (byQueryId) return byQueryId;
  const byFormId = CLIENT_EDIT_TAB_CONFIG.find(
    (item) => item.formTabId === rawTabValue
  );
  return byFormId ?? CLIENT_EDIT_TAB_CONFIG[0];
}

function getCanonicalTabQueryValue(tabId: CreditApplicationTabId): string {
  if (tabId === "basic-information") return "basic-information";
  return tabId;
}

function CashClientBasicEdit({
  clientId,
  clientName,
}: {
  clientId: number;
  clientName: string;
}) {
  const router = useRouter();
  const form = useCashClientBasicEditForm(clientId);
  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Clientes", href: "/clientes" },
    { label: clientName || "Detalle", href: `/clientes/${clientId}` },
    { label: "Información básica" },
  ];

  if (form.loading) {
    return (
      <Stack spacing={2}>
        <Skeleton variant="text" width={240} height={32} />
        <Skeleton variant="rounded" height={200} />
      </Stack>
    );
  }

  if (form.error) {
    return <Typography color="error">{form.error}</Typography>;
  }

  return (
    <Stack spacing={3}>
      <Breadcrumbs
        items={breadcrumbs}
        showBackButton
        onBack={() => router.push(`/clientes/${clientId}`)}
      />
      <Divider />
      <BasicInformationTab
        variant="cash"
        values={form.values}
        errors={form.errors}
        validatingSecurityCode={form.validatingSecurityCode}
        isSecurityCodeValid={form.isSecurityCodeValid}
        otpActionLabel={form.otpActionLabel}
        isOtpActionDisabled={form.isOtpActionDisabled}
        isSecurityCodeFieldDisabled={form.isSecurityCodeFieldDisabled}
        maritalStatusOptions={[]}
        maritalStatusesLoading={false}
        onFieldChange={(field, value) => form.setFieldValue(field, value)}
        onValidateSecurityCode={form.validateSecurityCode}
        onContinue={form.handleSave}
        saving={form.saving}
      />
    </Stack>
  );
}

function CreditClientEdit({
  clientId,
  clientName,
  tab,
}: {
  clientId: number;
  clientName: string;
  tab: string | string[] | undefined;
}) {
  const router = useRouter();
  const selectedTab = useMemo(() => resolveClientEditTab(tab), [tab]);
  const normalizedQueryTab = normalizeTabQueryValue(tab);
  const {
    loading,
    saving,
    error,
    activeTab,
    setActiveTab,
    isKycVerified,
    requiresIncomeProof,
    requiresEmploymentProofLetter,
    basicInformationTab,
    familyTab,
    addressTab,
    employmentTab,
    referencesTab,
    documentationTab,
    handleSaveActiveTab,
  } = useClientInformationForm(clientId, selectedTab.formTabId);

  const { data: maritalStatuses = [], isPending: maritalStatusesLoading } =
    useMaritalStatuses();
  const {
    data: familyRelationships = [],
    isPending: familyRelationshipsLoading,
  } = useFamilyRelationships();
  const { data: housingTypes = [], isPending: housingTypesLoading } =
    useHousingTypes();

  const spouseFieldsEnabled = useMemo(() => {
    const selectedStatus = maritalStatuses.find(
      (status) =>
        String(status.id) === basicInformationTab.values.maritalStatus
    );
    return (
      selectedStatus?.code === "CASADO" ||
      selectedStatus?.code === "UNION_LIBRE"
    );
  }, [maritalStatuses, basicInformationTab.values.maritalStatus]);

  useEffect(() => {
    if (activeTab === selectedTab.formTabId) return;
    setActiveTab(selectedTab.formTabId);
  }, [activeTab, selectedTab.formTabId, setActiveTab]);

  useEffect(() => {
    if (!router.isReady) return;
    if (activeTab !== selectedTab.formTabId) return;
    const canonicalTab = getCanonicalTabQueryValue(activeTab);
    if (normalizedQueryTab === canonicalTab) return;
    router.replace(
      {
        pathname: router.pathname,
        query: { id: clientId, tab: canonicalTab },
      },
      undefined,
      { shallow: true }
    );
  }, [
    activeTab,
    clientId,
    normalizedQueryTab,
    router,
    selectedTab.formTabId,
  ]);

  const breadcrumbs: BreadcrumbItem[] = useMemo(
    () => [
      { label: "Clientes", href: "/clientes" },
      {
        label: clientName || "Detalle",
        href: `/clientes/${clientId}`,
      },
      { label: selectedTab.label },
    ],
    [clientId, clientName, selectedTab.label]
  );

  if (loading) {
    return (
      <Stack spacing={2}>
        <Skeleton variant="text" width={240} height={32} />
        <Skeleton variant="rounded" height={320} />
      </Stack>
    );
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  const renderSelectedTab = () => {
    if (activeTab === "basic-information") {
      return (
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
          onFieldChange={(field, value) => {
            if (
              isKycVerified &&
              (field === "curp" || field === "rfc")
            ) {
              return;
            }
            basicInformationTab.setFieldValue(field, value);
          }}
          onValidateSecurityCode={
            basicInformationTab.validateCurrentSecurityCode
          }
          saving={saving}
          onContinue={handleSaveActiveTab}
        />
      );
    }
    if (activeTab === "family") {
      return (
        <FamilyTab
          values={familyTab.values}
          errors={familyTab.errors}
          spouseFieldsEnabled={spouseFieldsEnabled}
          onFieldChange={(field, value) => {
            familyTab.setFieldValue(field, value);
          }}
          saving={saving}
          onContinue={handleSaveActiveTab}
        />
      );
    }
    if (activeTab === "address") {
      return (
        <AddressTab
          values={addressTab.values}
          errors={addressTab.errors}
          housingTypeOptions={housingTypes}
          housingTypesLoading={housingTypesLoading}
          mergeFieldValues={(patch) => addressTab.mergeFieldValues(patch)}
          onFieldChange={(field, value) => {
            addressTab.setFieldValue(field, value);
          }}
          onSave={handleSaveActiveTab}
          saving={saving}
        />
      );
    }
    if (activeTab === "employment") {
      return (
        <EmploymentTab
          values={employmentTab.values}
          errors={employmentTab.errors}
          spouseSectionEnabled={spouseFieldsEnabled}
          mergeFieldValues={(patch) => employmentTab.mergeFieldValues(patch)}
          onFieldChange={(field, value) => {
            employmentTab.setFieldValue(field, value);
          }}
          onSave={handleSaveActiveTab}
          saving={saving}
        />
      );
    }
    if (activeTab === "references") {
      return (
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
          onSave={handleSaveActiveTab}
          saving={saving}
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
          onSave={handleSaveActiveTab}
          saving={saving}
        />
      );
    }
    return (
      <Typography color="error">El tab solicitado no es válido.</Typography>
    );
  };

  return (
    <Stack spacing={3}>
      <Breadcrumbs
        items={breadcrumbs}
        showBackButton
        onBack={() => router.push(`/clientes/${clientId}`)}
      />
      <Divider />
      {renderSelectedTab()}
    </Stack>
  );
}

export default function ClientEditPage() {
  const router = useRouter();
  const { id, tab } = router.query;
  const numericClientId =
    typeof id === "string" && Number.isFinite(Number(id)) ? Number(id) : null;

  const headerQuery = useQuery({
    queryKey: ["clients", "detail", numericClientId],
    enabled: numericClientId !== null,
    queryFn: async () => {
      const result = await getClientDetail(numericClientId as number);
      return unwrapOrThrow(result);
    },
  });

  useEffect(() => {
    if (!router.isReady || !headerQuery.data || numericClientId === null) {
      return;
    }
    if (isCreditClient(headerQuery.data)) return;
    const normalized = normalizeTabQueryValue(tab);
    if (
      normalized &&
      normalized !== "basic" &&
      normalized !== "basic-information"
    ) {
      void router.replace(
        {
          pathname: router.pathname,
          query: { id: numericClientId, tab: "basic-information" },
        },
        undefined,
        { shallow: true }
      );
    }
  }, [headerQuery.data, numericClientId, router, tab]);

  if (numericClientId === null) {
    return null;
  }

  if (headerQuery.isLoading) {
    return (
      <Stack spacing={2}>
        <Skeleton variant="text" width={240} height={32} />
        <Skeleton variant="rounded" height={200} />
      </Stack>
    );
  }

  if (headerQuery.error || !headerQuery.data) {
    return (
      <Typography color="error">
        No se pudo cargar el detalle del cliente.
      </Typography>
    );
  }

  const credit = isCreditClient(headerQuery.data);

  if (!credit) {
    return (
      <CashClientBasicEdit
        clientId={numericClientId}
        clientName={headerQuery.data.fullName}
      />
    );
  }

  return (
    <CreditClientEdit
      clientId={numericClientId}
      clientName={headerQuery.data.fullName}
      tab={tab}
    />
  );
}
