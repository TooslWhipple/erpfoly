import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  getCreditApplicationById,
  saveCreditApplication,
} from "@/services/creditApplications.service";
import type { CreditApplicationDetailResponse } from "@/services/creditApplications.service";
import { useBasicInformationTab } from "./tabs/useBasicInformationTab";
import { useAddressTab } from "./tabs/useAddressTab";
import { useDocumentationTab } from "./tabs/useDocumentationTab";
import { useEmploymentTab } from "./tabs/useEmploymentTab";
import { useFamilyTab } from "./tabs/useFamilyTab";
import { useGuarantorTab } from "./tabs/useGuarantorTab";
import { useReferencesTab } from "./tabs/useReferencesTab";
import { useCreditApplicationDraftStore } from "@/store/useCreditApplicationDraftStore";
import type {
  AddressTabValues,
  BasicInformationFormValues,
  CreditApplicationBiometricsData,
  CreditApplicationTabId,
  DocumentationTabValues,
  EmploymentTabValues,
  FamilyTabValues,
  GuarantorTabValues,
  ReferencesTabValues,
} from "@/types/credit-application-form.types";

const TAB_LIST: { label: string; value: CreditApplicationTabId }[] = [
  { label: "Información básica", value: "basic-information" },
  { label: "Familia", value: "family" },
  { label: "Dirección", value: "address" },
  { label: "Empleo", value: "employment" },
  { label: "Referencias", value: "references" },
  { label: "Documentación", value: "documentation" },
  { label: "Aval", value: "guarantor" },
];

const EMPTY_BASIC_INFORMATION_VALUES: BasicInformationFormValues = {
  firstName: "",
  lastName: "",
  secondLastName: "",
  birthDate: "",
  maritalStatus: "",
  curp: "",
  rfc: "",
  email: "",
  whatsappNumber: "",
  securityCode: "",
};

const EMPTY_FAMILY_VALUES: FamilyTabValues = {
  hasSpouse: true,
  spouseName: "",
  spousePhone: "",
  dependentsCount: 0,
};

const EMPTY_ADDRESS_VALUES: AddressTabValues = {
  postalCode: "",
  neighborhoodFullCode: "",
  state: "",
  city: "",
  streetAndNumber: "",
  betweenStreets: "",
  receiverPhone: "",
  receiverName: "",
  useClientPhone: false,
  housingType: "owned",
  residenceTime: "",
  previousAddress: "",
  previousResidenceTime: "",
};

const EMPTY_EMPLOYMENT_VALUES: EmploymentTabValues = {
  company: "",
  postalCode: "",
  neighborhoodFullCode: "",
  state: "",
  city: "",
  streetAndNumber: "",
  seniorityYears: "",
  position: "",
  department: "",
  monthlyIncome: "",
  companyPhone: "",
  hasOtherIncome: false,
  otherIncomeAmount: "",
  otherIncomeSource: "",
  spouseCompany: "",
  spousePostalCode: "",
  spouseNeighborhoodFullCode: "",
  spouseState: "",
  spouseCity: "",
  spouseStreetAndNumber: "",
  spouseSeniorityYears: "",
  spousePosition: "",
  spouseDepartment: "",
  spouseMonthlyIncome: "",
  spouseCompanyPhone: "",
};

const EMPTY_REFERENCES_VALUES: ReferencesTabValues = {
  company: "",
  phone: "",
  clientPosition: "",
  seniorityYears: "",
  respondentNameAndPosition: "",
  familyReferences: [
    { id: "reference-1", name: "", relationship: "", address: "", phone: "" },
    { id: "reference-2", name: "", relationship: "", address: "", phone: "" },
  ],
};

const EMPTY_DOCUMENTATION_VALUES: DocumentationTabValues = {
  requiredAlertVisible: true,
  requiredAlertMessage: "Agrega información del Aval y Comprobante de ingresos para continuar con la solicitud.",
  incomeProofFiles: [],
  ineFrontFiles: [],
  ineBackFiles: [],
};

const EMPTY_GUARANTOR_VALUES: GuarantorTabValues = {
  fullName: "",
  postalCode: "",
  neighborhoodFullCode: "",
  state: "",
  city: "",
  streetAndNumber: "",
  betweenStreets: "",
  birthDate: "",
  maritalStatus: "",
  curp: "",
  rfc: "",
  phone: "",
  identificationFrontFiles: [],
  identificationBackFiles: [],
  hasSpouse: false,
};

function mapHousingTypeToFormValue(
  housingTypeName: string | null | undefined
): AddressTabValues["housingType"] {
  const normalizedValue = housingTypeName?.trim().toLowerCase() ?? "";
  if (normalizedValue.includes("prop")) return "owned";
  if (normalizedValue.includes("rent") || normalizedValue.includes("alq")) return "rented";
  if (normalizedValue.includes("pag")) return "paying";
  if (normalizedValue.includes("fam")) return "relatives";
  return "owned";
}

function mapCreditApplicationToFormValues(
  creditApplication: CreditApplicationDetailResponse
): {
  basicInformation: BasicInformationFormValues;
  family: FamilyTabValues;
  address: AddressTabValues;
  employment: EmploymentTabValues;
  references: ReferencesTabValues;
} {
  const fullStreet = [
    creditApplication.address.street,
    creditApplication.address.externalNumber,
    creditApplication.address.internalNumber
      ? `Int. ${creditApplication.address.internalNumber}`
      : "",
  ]
    .filter((value) => value.trim().length > 0)
    .join(" ")
    .trim();

  const basicInformation: BasicInformationFormValues = {
    firstName: creditApplication.personalInformation.name ?? "",
    lastName: creditApplication.personalInformation.lastName ?? "",
    secondLastName: creditApplication.personalInformation.secondLastName ?? "",
    birthDate: creditApplication.personalInformation.birthDate ?? "",
    maritalStatus:
      creditApplication.personalInformation.maritalStatus.id != null
        ? String(creditApplication.personalInformation.maritalStatus.id)
        : "",
    curp: creditApplication.personalInformation.curp ?? "",
    rfc: creditApplication.personalInformation.rfc ?? "",
    email: creditApplication.personalInformation.email ?? "",
    whatsappNumber: creditApplication.personalInformation.phoneNumber ?? "",
    securityCode: "",
  };

  const family: FamilyTabValues = {
    hasSpouse: Boolean(creditApplication.family.hasSpouse),
    spouseName: creditApplication.family.spouseName ?? "",
    spousePhone: creditApplication.family.spousePhone ?? "",
    dependentsCount: creditApplication.family.economicDependents ?? 0,
  };

  const address: AddressTabValues = {
    postalCode: creditApplication.address.postalCode ?? "",
    neighborhoodFullCode: creditApplication.address.neighborhood.fullCode ?? "",
    state: creditApplication.address.neighborhood.state ?? "",
    city: creditApplication.address.neighborhood.municipality ?? "",
    streetAndNumber: fullStreet,
    betweenStreets: creditApplication.address.betweenStreets ?? "",
    receiverPhone: creditApplication.address.receiverPhone ?? "",
    receiverName: creditApplication.address.receiverName ?? "",
    useClientPhone: Boolean(creditApplication.address.useClientPhone),
    housingType: mapHousingTypeToFormValue(creditApplication.address.housingType.name),
    residenceTime: "",
    previousAddress: creditApplication.address.previousAddress ?? "",
    previousResidenceTime: creditApplication.address.previousAddressDuration ?? "",
  };

  const employment: EmploymentTabValues = {
    company: creditApplication.employment.companyName ?? "",
    postalCode: "",
    neighborhoodFullCode: "",
    state: "",
    city: "",
    streetAndNumber: creditApplication.employment.companyAddress ?? "",
    seniorityYears: String(creditApplication.employment.seniorityYears ?? ""),
    position: creditApplication.employment.position ?? "",
    department: creditApplication.employment.department ?? "",
    monthlyIncome: String(creditApplication.employment.monthlyIncome ?? ""),
    companyPhone: creditApplication.employment.companyPhone ?? "",
    hasOtherIncome: Boolean(creditApplication.employment.hasOtherIncome),
    otherIncomeAmount: String(creditApplication.employment.otherIncomeAmount ?? ""),
    otherIncomeSource: creditApplication.employment.otherIncomeDescription ?? "",
    spouseCompany: "",
    spousePostalCode: "",
    spouseNeighborhoodFullCode: "",
    spouseState: "",
    spouseCity: "",
    spouseStreetAndNumber: "",
    spouseSeniorityYears: "",
    spousePosition: "",
    spouseDepartment: "",
    spouseMonthlyIncome: "",
    spouseCompanyPhone: "",
  };

  const references: ReferencesTabValues = {
    company: creditApplication.workReferences.companyName ?? "",
    phone: creditApplication.workReferences.companyPhone ?? "",
    clientPosition: creditApplication.workReferences.applicantPosition ?? "",
    seniorityYears: String(creditApplication.workReferences.seniorityYears ?? ""),
    respondentNameAndPosition: [
      creditApplication.workReferences.answeredBy,
      creditApplication.workReferences.answeredByPosition,
    ]
      .filter((value) => value.trim().length > 0)
      .join(" - "),
    familyReferences:
      creditApplication.familyReferences.length > 0
        ? creditApplication.familyReferences.map((reference, index) => ({
            id: `reference-${index + 1}`,
            name: [reference.firstName, reference.lastName]
              .filter((value) => value.trim().length > 0)
              .join(" "),
            relationship: reference.relationship.name ?? "",
            address: reference.address ?? "",
            phone: reference.phone ?? "",
          }))
        : [{ id: "reference-1", name: "", relationship: "", address: "", phone: "" }],
  };

  return {
    basicInformation,
    family,
    address,
    employment,
    references,
  };
}

function mapDocumentationFromBiometrics(
  biometrics: CreditApplicationBiometricsData,
  currentDocumentation: DocumentationTabValues
): DocumentationTabValues {
  return {
    ...currentDocumentation,
    ineFrontFiles: biometrics.ineFrontImage
      ? [
          {
            id: `ine-front-${Date.now()}`,
            name: "ine-frontal-capturada.png",
            url: biometrics.ineFrontImage,
            uploadedAt: "Capturada",
          },
        ]
      : currentDocumentation.ineFrontFiles,
    ineBackFiles: biometrics.ineBackImage
      ? [
          {
            id: `ine-back-${Date.now()}`,
            name: "ine-posterior-capturada.png",
            url: biometrics.ineBackImage,
            uploadedAt: "Capturada",
          },
        ]
      : currentDocumentation.ineBackFiles,
  };
}

interface UseCreditApplicationFormParams {
  applicationId?: string;
  isCreateMode: boolean;
}

export function useCreditApplicationForm({ applicationId, isCreateMode }: UseCreditApplicationFormParams) {
  const router = useRouter();
  
  const [loading, setLoading] = useState(!isCreateMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEmptyState, setIsEmptyState] = useState(false);
  const [activeTab, setActiveTab] = useState<CreditApplicationTabId>("basic-information");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [biometricsData, setBiometricsData] = useState<CreditApplicationBiometricsData | null>(null);

  const upsertBasicInformation = useCreditApplicationDraftStore((state) => state.upsertBasicInformation);
  const upsertFamily = useCreditApplicationDraftStore((state) => state.upsertFamily);
  const upsertAddress = useCreditApplicationDraftStore((state) => state.upsertAddress);
  const upsertEmployment = useCreditApplicationDraftStore((state) => state.upsertEmployment);
  const upsertReferences = useCreditApplicationDraftStore((state) => state.upsertReferences);
  const upsertDocumentation = useCreditApplicationDraftStore((state) => state.upsertDocumentation);
  const upsertGuarantor = useCreditApplicationDraftStore((state) => state.upsertGuarantor);
  const upsertBiometrics = useCreditApplicationDraftStore((state) => state.upsertBiometrics);
  const getDraftById = useCreditApplicationDraftStore((state) => state.getDraftById);

  const draftKey = useMemo(() => {
    if (isCreateMode) return "new-credit-application";
    return applicationId ?? "unknown-credit-application";
  }, [applicationId, isCreateMode]);

  const basicInformationTab = useBasicInformationTab(EMPTY_BASIC_INFORMATION_VALUES);
  const familyTab = useFamilyTab(EMPTY_FAMILY_VALUES);
  const addressTab = useAddressTab(EMPTY_ADDRESS_VALUES);
  const employmentTab = useEmploymentTab(EMPTY_EMPLOYMENT_VALUES);
  const referencesTab = useReferencesTab(EMPTY_REFERENCES_VALUES);
  const documentationTab = useDocumentationTab(EMPTY_DOCUMENTATION_VALUES);
  const guarantorTab = useGuarantorTab(EMPTY_GUARANTOR_VALUES);

  const setBasicInformationValuesFromExternal = basicInformationTab.setValuesFromExternalSource;
  const setFamilyValuesFromExternal = familyTab.setValuesFromExternalSource;
  const setAddressValuesFromExternal = addressTab.setValuesFromExternalSource;
  const setEmploymentValuesFromExternal = employmentTab.setValuesFromExternalSource;
  const setReferencesValuesFromExternal = referencesTab.setValuesFromExternalSource;
  const setDocumentationValuesFromExternal = documentationTab.setValuesFromExternalSource;
  const setGuarantorValuesFromExternal = guarantorTab.setValuesFromExternalSource;

  useEffect(() => {
    if (!isCreateMode && !applicationId) {
      setError("No se encontró el identificador de la solicitud.");
      setLoading(false);
      return;
    }

    const draft = getDraftById(draftKey);
    if (draft) {
      setBasicInformationValuesFromExternal(draft.basicInformation);
      setFamilyValuesFromExternal(draft.family);
      setAddressValuesFromExternal(draft.address);
      setEmploymentValuesFromExternal(draft.employment);
      setReferencesValuesFromExternal(draft.references);
      const hydratedDocumentation = draft.biometrics
        ? mapDocumentationFromBiometrics(draft.biometrics, draft.documentation)
        : draft.documentation;
      setDocumentationValuesFromExternal(hydratedDocumentation);
      setGuarantorValuesFromExternal(draft.guarantor);
      setBiometricsData(draft.biometrics);
      if (draft.biometrics) {
        upsertDocumentation(draftKey, hydratedDocumentation);
      }
      setLoading(false);
      return;
    }

    if (isCreateMode) {
      setLoading(false);
      return;
    }

    let isCancelled = false;
    const loadExistingApplication = async () => {
      setLoading(true);
      setError(null);
      setIsEmptyState(false);

      try {
        const loadedApplication = await getCreditApplicationById(applicationId!);
        if (isCancelled) return;

        const mappedValues = mapCreditApplicationToFormValues(loadedApplication);

        setBasicInformationValuesFromExternal(mappedValues.basicInformation);
        setFamilyValuesFromExternal(mappedValues.family);
        setAddressValuesFromExternal(mappedValues.address);
        setEmploymentValuesFromExternal(mappedValues.employment);
        setReferencesValuesFromExternal(mappedValues.references);

        upsertBasicInformation(draftKey, mappedValues.basicInformation);
        upsertFamily(draftKey, mappedValues.family);
        upsertAddress(draftKey, mappedValues.address);
        upsertEmployment(draftKey, mappedValues.employment);
        upsertReferences(draftKey, mappedValues.references);
      } catch (loadError) {
        console.error("[CreditApplicationForm] Unable to load credit application", loadError);
        if (!isCancelled) {
          setIsEmptyState(true);
          setError("No se pudo cargar la solicitud, intenta nuevamente.");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadExistingApplication();

    return () => {
      isCancelled = true;
    };
  }, [
    applicationId,
    draftKey,
    getDraftById,
    isCreateMode,
    setBasicInformationValuesFromExternal,
    setFamilyValuesFromExternal,
    setAddressValuesFromExternal,
    setEmploymentValuesFromExternal,
    setReferencesValuesFromExternal,
    setDocumentationValuesFromExternal,
    setGuarantorValuesFromExternal,
    upsertBasicInformation,
    upsertFamily,
    upsertAddress,
    upsertEmployment,
    upsertReferences,
    upsertDocumentation,
  ]);

  const persistBasicInformation = useCallback(
    (values: BasicInformationFormValues) => {
      upsertBasicInformation(draftKey, values);
      setSaveSuccess(false);
    },
    [draftKey, upsertBasicInformation]
  );

  const persistFamily = useCallback((values: FamilyTabValues) => {
    upsertFamily(draftKey, values);
    setSaveSuccess(false);
  }, [draftKey, upsertFamily]);

  const persistAddress = useCallback((values: AddressTabValues) => {
    upsertAddress(draftKey, values);
    setSaveSuccess(false);
  }, [draftKey, upsertAddress]);

  const persistEmployment = useCallback((values: EmploymentTabValues) => {
    upsertEmployment(draftKey, values);
    setSaveSuccess(false);
  }, [draftKey, upsertEmployment]);

  const persistReferences = useCallback((values: ReferencesTabValues) => {
    upsertReferences(draftKey, values);
    setSaveSuccess(false);
  }, [draftKey, upsertReferences]);

  const persistDocumentation = useCallback((values: DocumentationTabValues) => {
    upsertDocumentation(draftKey, values);
    setSaveSuccess(false);
  }, [draftKey, upsertDocumentation]);

  const persistGuarantor = useCallback((values: GuarantorTabValues) => {
    upsertGuarantor(draftKey, values);
    setSaveSuccess(false);
  }, [draftKey, upsertGuarantor]);

  const handleBiometricsCompleted = useCallback(
    (biometrics: CreditApplicationBiometricsData) => {
      setBiometricsData(biometrics);
      upsertBiometrics(draftKey, biometrics);

      const nextDocumentationValues: DocumentationTabValues =
        mapDocumentationFromBiometrics(biometrics, documentationTab.values);

      persistDocumentation(nextDocumentationValues);
    },
    [documentationTab.values, draftKey, persistDocumentation, upsertBiometrics]
  );

  const handleSave = useCallback(async () => {
    const basicFormIsValid = basicInformationTab.validateValues();
    const familyFormIsValid = familyTab.validateValues();
    const addressFormIsValid = addressTab.validateValues();
    const employmentFormIsValid = employmentTab.validateValues();
    const referencesFormIsValid = referencesTab.validateValues();
    const documentationFormIsValid = documentationTab.validateValues();
    const guarantorFormIsValid = guarantorTab.validateValues();

    const formIsValid =
      basicFormIsValid &&
      familyFormIsValid &&
      addressFormIsValid &&
      employmentFormIsValid &&
      referencesFormIsValid &&
      documentationFormIsValid &&
      guarantorFormIsValid;
    if (!formIsValid) return false;

    setSaving(true);
    setSaveSuccess(false);
    setError(null);
    try {
      const result = await saveCreditApplication({
        id: isCreateMode ? undefined : applicationId,
        basicInformation: basicInformationTab.values,
        family: familyTab.values,
        address: addressTab.values,
        employment: employmentTab.values,
        references: referencesTab.values,
        documentation: documentationTab.values,
        guarantor: guarantorTab.values,
        biometrics: biometricsData,
      });

      persistBasicInformation(basicInformationTab.values);
      persistFamily(familyTab.values);
      persistAddress(addressTab.values);
      persistEmployment(employmentTab.values);
      persistReferences(referencesTab.values);
      persistDocumentation(documentationTab.values);
      persistGuarantor(guarantorTab.values);
      setSaveSuccess(true);

      if (isCreateMode && result.id) {
        router.replace(`/solicitudes-credito/${result.id}`);
      }

      return true;
    } catch (saveError) {
      console.error("[CreditApplicationForm] Unable to save credit application", saveError);
      setError("No se pudo guardar la solicitud.");
      return false;
    } finally {
      setSaving(false);
    }
  }, [
    applicationId,
    basicInformationTab,
    familyTab,
    addressTab,
    employmentTab,
    referencesTab,
    documentationTab,
    guarantorTab,
    biometricsData,
    isCreateMode,
    persistBasicInformation,
    persistFamily,
    persistAddress,
    persistEmployment,
    persistReferences,
    persistDocumentation,
    persistGuarantor,
    router,
  ]);

  const handleSaveActiveTab = useCallback(async () => {
    let isValid = true;

    if (activeTab === "basic-information") isValid = basicInformationTab.validateValues();
    if (activeTab === "family") isValid = familyTab.validateValues();
    if (activeTab === "address") isValid = addressTab.validateValues();
    if (activeTab === "employment") isValid = employmentTab.validateValues();
    if (activeTab === "references") isValid = referencesTab.validateValues();
    if (activeTab === "documentation") isValid = documentationTab.validateValues();
    if (activeTab === "guarantor") isValid = guarantorTab.validateValues();
    if (!isValid) return false;

    persistBasicInformation(basicInformationTab.values);
    persistFamily(familyTab.values);
    persistAddress(addressTab.values);
    persistEmployment(employmentTab.values);
    persistReferences(referencesTab.values);
    persistDocumentation(documentationTab.values);
    persistGuarantor(guarantorTab.values);
    setSaveSuccess(true);
    return true;
  }, [
    activeTab,
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
  ]);

  return {
    loading,
    saving,
    error,
    saveSuccess,
    isEmptyState,
    activeTab,
    tabs: TAB_LIST,
    biometricsData,
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
    handleBiometricsCompleted,
  };
}
