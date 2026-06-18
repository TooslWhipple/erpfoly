import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import {
  getCreditApplicationById,
  saveCreditApplication,
  saveCreditApplicationSection,
  submitCreditApplicationForReview,
} from "@/services/creditApplications.service";
import type {
  AdditionalInformationRequestedItem,
  CreditApplicationDetailResponse,
} from "@/services/creditApplications.service";
import { getApiErrorMessage } from "@/lib/axios";
import { useBasicInformationTab } from "./tabs/useBasicInformationTab";
import { useAddressTab } from "./tabs/useAddressTab";
import { useDocumentationTab } from "./tabs/useDocumentationTab";
import { useEmploymentTab } from "./tabs/useEmploymentTab";
import { useFamilyTab } from "./tabs/useFamilyTab";
import { hasValidGuarantorInformation, useGuarantorTab } from "./tabs/useGuarantorTab";
import { useReferencesTab } from "./tabs/useReferencesTab";
import { creditApplicationTabIdToSection, type CreditApplicationSectionKey } from "@/utils/credit-application-form";
import type {
  AddressTabValues,
  BasicInformationFormValues,
  CreditApplicationFormPayload,
  CreditApplicationTabId,
  DocumentationTabValues,
  EmploymentTabValues,
  FamilyTabValues,
  GuarantorTabValues,
  ReferencesTabValues,
} from "@/types/credit-application-form.types";

const BASE_TAB_LIST: { label: string; value: CreditApplicationTabId }[] = [
  { label: "Información básica", value: "basic-information" },
  { label: "Familia", value: "family" },
  { label: "Dirección", value: "address" },
  { label: "Empleo", value: "employment" },
  { label: "Referencias", value: "references" },
  { label: "Documentación", value: "documentation" },
];

const GUARANTOR_TAB_ITEM: { label: string; value: CreditApplicationTabId } = {
  label: "Aval",
  value: "guarantor",
};

const ADDITIONAL_INFORMATION_CODES = {
  incomeProof: "INCOME_PROOF",
  employmentProofLetter: "EMPLOYMENT_PROOF_LETTER",
  guarantorInformation: "GUARANTOR_INFORMATION",
} as const;

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
  housingType: "",
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
    { id: "reference-1", name: "", relationshipId: "", address: "", phone: "" },
    { id: "reference-2", name: "", relationshipId: "", address: "", phone: "" },
  ],
};

const EMPTY_DOCUMENTATION_VALUES: DocumentationTabValues = {
  requiredAlertVisible: true,
  requiredAlertMessage: "Agrega la documentación solicitada para continuar con la solicitud.",
  incomeProofFiles: [],
  employmentProofLetterFiles: [],
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

const VERIFIED_SECURITY_CODE_VALUE = "Verificado";
const inFlightCreditApplicationRequests = new Map<
  string,
  Promise<CreditApplicationDetailResponse | null>
>();

function getCreditApplicationDetailOnce(applicationId: string): Promise<CreditApplicationDetailResponse | null> {
  const existingRequest = inFlightCreditApplicationRequests.get(applicationId);
  if (existingRequest) {
    return existingRequest;
  }

  const nextRequest = getCreditApplicationById(applicationId).finally(() => {
    inFlightCreditApplicationRequests.delete(applicationId);
  });


  inFlightCreditApplicationRequests.set(applicationId, nextRequest);
  return nextRequest;
}

async function fetchDocumentationValuesFromServer(
  applicationId: string,
): Promise<DocumentationTabValues | null> {
  const refreshedApplication = await getCreditApplicationDetailOnce(applicationId);
  if (!refreshedApplication) return null;
  return mapCreditApplicationToFormValues(refreshedApplication).documentation;
}

function mapCreditApplicationToFormValues(
  creditApplication: CreditApplicationDetailResponse
): {
  basicInformation: BasicInformationFormValues;
  phoneIsVerified: boolean;
  family: FamilyTabValues;
  address: AddressTabValues;
  employment: EmploymentTabValues;
  references: ReferencesTabValues;
  documentation: DocumentationTabValues;
  guarantor: GuarantorTabValues;
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
    firstName: creditApplication.basicInformation.name ?? "",
    lastName: creditApplication.basicInformation.lastName ?? "",
    secondLastName: creditApplication.basicInformation.secondLastName ?? "",
    birthDate: creditApplication.basicInformation.birthDate ?? "",
    maritalStatus:
      creditApplication.basicInformation.maritalStatus.id != null
        ? String(creditApplication.basicInformation.maritalStatus.id)
        : "",
    curp: creditApplication.basicInformation.curp ?? "",
    rfc: creditApplication.basicInformation.rfc ?? "",
    email: creditApplication.basicInformation.email ?? "",
    whatsappNumber: creditApplication.basicInformation.phoneNumber ?? "",
    securityCode: creditApplication.basicInformation.phoneVerifiedAt
      ? VERIFIED_SECURITY_CODE_VALUE
      : "",
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
    housingType:
      creditApplication.address.housingType.id != null
        ? String(creditApplication.address.housingType.id)
        : "",
    residenceTime: creditApplication.address.residenceTime ?? "",
    previousAddress: creditApplication.address.previousAddress ?? "",
    previousResidenceTime: creditApplication.address.previousAddressDuration ?? "",
  };

  const buildEmploymentStreet = (employmentPerson: CreditApplicationDetailResponse["employment"]["applicant"]) =>
    [
      employmentPerson.street,
      employmentPerson.externalNumber,
      employmentPerson.internalNumber
        ? `Int. ${employmentPerson.internalNumber}`
        : "",
    ]
      .filter((value) => value.trim().length > 0)
      .join(" ")
      .trim();

  const employment: EmploymentTabValues = {
    company: creditApplication.employment.applicant.companyName ?? "",
    postalCode: creditApplication.employment.applicant.postalCode ?? "",
    neighborhoodFullCode: creditApplication.employment.applicant.neighborhoodFullCode ?? "",
    state: creditApplication.employment.applicant.state ?? "",
    city: creditApplication.employment.applicant.city ?? "",
    streetAndNumber: buildEmploymentStreet(creditApplication.employment.applicant),
    seniorityYears: String(creditApplication.employment.applicant.seniorityYears ?? ""),
    position: creditApplication.employment.applicant.position ?? "",
    department: creditApplication.employment.applicant.department ?? "",
    monthlyIncome: String(creditApplication.employment.applicant.monthlyIncome ?? ""),
    companyPhone: creditApplication.employment.applicant.companyPhone ?? "",
    hasOtherIncome: Boolean(creditApplication.employment.applicant.hasOtherIncome),
    otherIncomeAmount: String(creditApplication.employment.applicant.otherIncomeAmount ?? ""),
    otherIncomeSource: creditApplication.employment.applicant.otherIncomeDescription ?? "",
    spouseCompany: creditApplication.employment.spouse.companyName ?? "",
    spousePostalCode: creditApplication.employment.spouse.postalCode ?? "",
    spouseNeighborhoodFullCode: creditApplication.employment.spouse.neighborhoodFullCode ?? "",
    spouseState: creditApplication.employment.spouse.state ?? "",
    spouseCity: creditApplication.employment.spouse.city ?? "",
    spouseStreetAndNumber: buildEmploymentStreet(creditApplication.employment.spouse),
    spouseSeniorityYears: String(creditApplication.employment.spouse.seniorityYears ?? ""),
    spousePosition: creditApplication.employment.spouse.position ?? "",
    spouseDepartment: creditApplication.employment.spouse.department ?? "",
    spouseMonthlyIncome: String(creditApplication.employment.spouse.monthlyIncome ?? ""),
    spouseCompanyPhone: creditApplication.employment.spouse.companyPhone ?? "",
  };

  const references: ReferencesTabValues = {
    company: creditApplication.references.work.companyName ?? "",
    phone: creditApplication.references.work.companyPhone ?? "",
    clientPosition: creditApplication.references.work.applicantPosition ?? "",
    seniorityYears: String(creditApplication.references.work.seniorityYears ?? ""),
    respondentNameAndPosition: [
      creditApplication.references.work.answeredBy,
      creditApplication.references.work.answeredByPosition,
    ]
      .filter((value) => value.trim().length > 0)
      .join(" - "),
    familyReferences:
      creditApplication.references.family.length > 0
        ? creditApplication.references.family.map((reference, index) => ({
          id: `reference-${index + 1}`,
          name: [reference.firstName, reference.lastName]
            .filter((value) => value.trim().length > 0)
            .join(" "),
          relationshipId:
            reference.relationship.id != null
              ? String(reference.relationship.id)
              : "",
          address: reference.address ?? "",
          phone: reference.phone ?? "",
        }))
        : [{ id: "reference-1", name: "", relationshipId: "", address: "", phone: "" }],
  };

  const mapDocumentItems = (
    list:
      | Array<{
        id: number;
        typeCode: string;
        typeName: string;
        filePath: string;
        fileUrl: string;
      }>
      | undefined
  ) =>
    (list ?? []).map((item) => {
      const fileNameFromPath = item.filePath.split("/").pop()?.split("?")[0]?.trim();
      return {
        id: String(item.id),
        name: fileNameFromPath || item.typeName,
        filePath: item.filePath,
        url: item.fileUrl,
        uploadedAt: "Cargado",
      };
    });

  const documentation: DocumentationTabValues = {
    requiredAlertVisible: true,
    requiredAlertMessage: "Agrega la documentación solicitada para continuar con la solicitud.",
    incomeProofFiles: mapDocumentItems(creditApplication.documentation?.incomeProofFiles),
    employmentProofLetterFiles: mapDocumentItems(
      creditApplication.documentation?.employmentProofLetterFiles
    ),
    ineFrontFiles: mapDocumentItems(creditApplication.documentation?.ineFrontFiles),
    ineBackFiles: mapDocumentItems(creditApplication.documentation?.ineBackFiles),
  };

  const guarantorStreet = [
    creditApplication.guarantor?.address.street ?? "",
    creditApplication.guarantor?.address.externalNumber ?? "",
    creditApplication.guarantor?.address.internalNumber
      ? `Int. ${creditApplication.guarantor.address.internalNumber}`
      : "",
  ]
    .filter((value) => value.trim().length > 0)
    .join(" ")
    .trim();

  const guarantor: GuarantorTabValues = {
    fullName: creditApplication.guarantor?.fullName ?? "",
    postalCode: creditApplication.guarantor?.address.postalCode ?? "",
    neighborhoodFullCode: creditApplication.guarantor?.address.neighborhoodFullCode ?? "",
    state: creditApplication.guarantor?.address.state ?? "",
    city: creditApplication.guarantor?.address.city ?? "",
    streetAndNumber: guarantorStreet,
    betweenStreets: creditApplication.guarantor?.address.betweenStreets ?? "",
    birthDate: creditApplication.guarantor?.birthDate ?? "",
    maritalStatus:
      creditApplication.guarantor?.maritalStatus.id != null
        ? String(creditApplication.guarantor.maritalStatus.id)
        : "",
    curp: creditApplication.guarantor?.curp ?? "",
    rfc: creditApplication.guarantor?.rfc ?? "",
    phone: creditApplication.guarantor?.phone ?? "",
    identificationFrontFiles: mapDocumentItems(
      creditApplication.documentation?.guarantorIneFrontFiles
    ),
    identificationBackFiles: mapDocumentItems(
      creditApplication.documentation?.guarantorIneBackFiles
    ),
    hasSpouse: Boolean(creditApplication.guarantor?.hasSpouse),
  };

  return {
    basicInformation,
    phoneIsVerified: Boolean(creditApplication.basicInformation.phoneVerifiedAt),
    family,
    address,
    employment,
    references,
    documentation,
    guarantor,
  };
}

interface UseCreditApplicationFormParams {
  applicationId?: string;
  isCreateMode: boolean;
}

type FormActionPhase = "idle" | "validating" | "saving" | "submitting";

export interface SubmitCreditApplicationResult {
  success: boolean;
  invalidTabs: CreditApplicationTabId[];
  message?: string;
}

export function useCreditApplicationForm({ applicationId, isCreateMode }: UseCreditApplicationFormParams) {
  const router = useRouter();

  const [loading, setLoading] = useState(!isCreateMode);
  const [loadingApplicationDetail, setLoadingApplicationDetail] = useState(false);
  const [formAction, setFormAction] = useState<FormActionPhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isEmptyState, setIsEmptyState] = useState(false);
  const [activeTab, setActiveTab] = useState<CreditApplicationTabId>("basic-information");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const formActionRef = useRef(false);
  const [additionalInformationRequested, setAdditionalInformationRequested] = useState<
    AdditionalInformationRequestedItem[]
  >([]);

  const requestedAdditionalInformationCodes = useMemo(
    () =>
      new Set(
        additionalInformationRequested
          .filter((item) => item.requestFlag)
          .map((item) => item.code.trim().toUpperCase())
      ),
    [additionalInformationRequested]
  );

  const requiresIncomeProof = requestedAdditionalInformationCodes.has(
    ADDITIONAL_INFORMATION_CODES.incomeProof
  );
  const requiresEmploymentProofLetter = requestedAdditionalInformationCodes.has(
    ADDITIONAL_INFORMATION_CODES.employmentProofLetter
  );
  const requiresGuarantorInformation = requestedAdditionalInformationCodes.has(
    ADDITIONAL_INFORMATION_CODES.guarantorInformation
  );

  const shouldShowGuarantorTab = requiresGuarantorInformation;

  const tabs = useMemo(() => {
    if (!shouldShowGuarantorTab) {
      return BASE_TAB_LIST;
    }
    return [...BASE_TAB_LIST, GUARANTOR_TAB_ITEM];
  }, [shouldShowGuarantorTab]);

  const familyTab = useFamilyTab(EMPTY_FAMILY_VALUES);
  const addressTab = useAddressTab(EMPTY_ADDRESS_VALUES);
  const employmentTab = useEmploymentTab(EMPTY_EMPLOYMENT_VALUES);
  const referencesTab = useReferencesTab(EMPTY_REFERENCES_VALUES);
  const documentationTab = useDocumentationTab(EMPTY_DOCUMENTATION_VALUES);
  const guarantorTab = useGuarantorTab(EMPTY_GUARANTOR_VALUES);
  const prepareBasicInformationForOtpSend = useCallback(
    async (
      _basicInformationValues: BasicInformationFormValues,
    ): Promise<string | undefined> => {
      if (isCreateMode || !applicationId) {
        return undefined;
      }

      return applicationId;
    },
    [
      applicationId,
      isCreateMode,
    ],
  );
  const basicInformationTab = useBasicInformationTab(
    EMPTY_BASIC_INFORMATION_VALUES,
    {
      applicationId: isCreateMode ? undefined : applicationId,
      prepareForOtpSend: prepareBasicInformationForOtpSend,
    },
  );

  const setBasicInformationValuesFromExternal = basicInformationTab.setValuesFromExternalSource;
  const setFamilyValuesFromExternal = familyTab.setValuesFromExternalSource;
  const setAddressValuesFromExternal = addressTab.setValuesFromExternalSource;
  const setEmploymentValuesFromExternal = employmentTab.setValuesFromExternalSource;
  const setReferencesValuesFromExternal = referencesTab.setValuesFromExternalSource;
  const setDocumentationValuesFromExternal = documentationTab.setValuesFromExternalSource;
  const setGuarantorValuesFromExternal = guarantorTab.setValuesFromExternalSource;

  useEffect(() => {
    if (isCreateMode) {
      setAdditionalInformationRequested([]);
      setLoading(false);
      setLoadingApplicationDetail(false);
      return;
    }

    if (!applicationId) {
      setError("No se encontró el identificador de la solicitud.");
      setLoading(false);
      setLoadingApplicationDetail(false);
      return;
    }

    let isCancelled = false;
    const loadExistingApplication = async () => {
      setLoading(true);
      setLoadingApplicationDetail(true);
      setError(null);
      setIsEmptyState(false);

      try {
        const loadedApplication = await getCreditApplicationDetailOnce(applicationId);
        if (isCancelled) return;
        if (!loadedApplication) {
          setIsEmptyState(true);
          setError("No se pudo cargar la solicitud, intenta nuevamente.");
          return;
        }
        setAdditionalInformationRequested(loadedApplication.additionalInformationRequested ?? []);

        const mappedValues = mapCreditApplicationToFormValues(loadedApplication);

        setBasicInformationValuesFromExternal(mappedValues.basicInformation, {
          isSecurityCodeVerified: mappedValues.phoneIsVerified,
        });
        setFamilyValuesFromExternal(mappedValues.family);
        setAddressValuesFromExternal(mappedValues.address);
        setEmploymentValuesFromExternal(mappedValues.employment);
        setReferencesValuesFromExternal(mappedValues.references);
        setDocumentationValuesFromExternal(mappedValues.documentation);
        setGuarantorValuesFromExternal(mappedValues.guarantor);
      } catch (loadError) {
        console.error("[CreditApplicationForm] Unable to load credit application", loadError);
        if (!isCancelled) {
          setIsEmptyState(true);
          setError("No se pudo cargar la solicitud, intenta nuevamente.");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
          setLoadingApplicationDetail(false);
        }
      }
    };

    loadExistingApplication();

    return () => {
      isCancelled = true;
    };
  }, [
    applicationId,
    isCreateMode,
    setBasicInformationValuesFromExternal,
    setFamilyValuesFromExternal,
    setAddressValuesFromExternal,
    setEmploymentValuesFromExternal,
    setReferencesValuesFromExternal,
    setDocumentationValuesFromExternal,
    setGuarantorValuesFromExternal,
  ]);

  useEffect(() => {
    if (activeTab === "guarantor" && !shouldShowGuarantorTab) {
      setActiveTab("basic-information");
    }
  }, [activeTab, shouldShowGuarantorTab]);

  const isFormLocked = formAction !== "idle" || loadingApplicationDetail;
  const saving = isFormLocked;

  const isFormComplete =
    basicInformationTab.validateValues(true) &&
    familyTab.validateValues(true) &&
    addressTab.validateValues(true) &&
    employmentTab.validateValues(true) &&
    referencesTab.validateValues(true) &&
    documentationTab.validateValues({
      requireIncomeProof: requiresIncomeProof,
      requireEmploymentProofLetter: requiresEmploymentProofLetter,
      silent: true,
    }) &&
    (!shouldShowGuarantorTab || guarantorTab.validateValues(true));

  const beginFormAction = useCallback((phase: Exclude<FormActionPhase, "idle">): boolean => {
    if (formActionRef.current) {
      return false;
    }
    formActionRef.current = true;
    setFormAction(phase);
    return true;
  }, []);

  const setFormActionPhase = useCallback((phase: Exclude<FormActionPhase, "idle">) => {
    setFormAction(phase);
  }, []);

  const endFormAction = useCallback(() => {
    formActionRef.current = false;
    setFormAction("idle");
  }, []);

  const getCurrentFormPayload = useCallback(
    (): CreditApplicationFormPayload => ({
      id: isCreateMode ? undefined : applicationId,
      basicInformation: basicInformationTab.values,
      family: familyTab.values,
      address: addressTab.values,
      employment: employmentTab.values,
      references: referencesTab.values,
      documentation: documentationTab.values,
      guarantor: guarantorTab.values,
    }),
    [
      addressTab.values,
      applicationId,
      basicInformationTab.values,
      documentationTab.values,
      employmentTab.values,
      familyTab.values,
      guarantorTab.values,
      isCreateMode,
      referencesTab.values,
    ]
  );

  const validateActiveTab = useCallback(async (): Promise<boolean> => {
    if (activeTab === "basic-information") {
      const basicFormIsValid = basicInformationTab.validateValues();
      if (!basicFormIsValid) {
        return false;
      }
      return basicInformationTab.validateIdentityUniqueness(isCreateMode ? undefined : applicationId);
    }
    if (activeTab === "family") return familyTab.validateValues();
    if (activeTab === "address") return addressTab.validateValues();
    if (activeTab === "employment") return employmentTab.validateValues();
    if (activeTab === "references") return referencesTab.validateValues();
    if (activeTab === "documentation") {
      return documentationTab.validateValues({
        requireIncomeProof: requiresIncomeProof,
        requireEmploymentProofLetter: requiresEmploymentProofLetter,
      });
    }
    if (activeTab === "guarantor") {
      return guarantorTab.validateValues();
    }
    return true;
  }, [
    activeTab,
    addressTab,
    applicationId,
    basicInformationTab,
    documentationTab,
    employmentTab,
    familyTab,
    guarantorTab,
    isCreateMode,
    referencesTab,
    requiresEmploymentProofLetter,
    requiresIncomeProof,
  ]);

  const saveActiveTabSection = useCallback(
    async (currentPayload: CreditApplicationFormPayload): Promise<boolean> => {
      if (isCreateMode || !applicationId) {
        return true;
      }

      const activeSection = creditApplicationTabIdToSection(activeTab);
      if (!activeSection) {
        return true;
      }
      if (activeSection === "guarantor" && !requiresGuarantorInformation) {
        return true;
      }

      const saved = await saveCreditApplicationSection(applicationId, activeSection, currentPayload);
      if (!saved) return false;

      if (activeSection === "documentation") {
        const refreshedDocumentation = await fetchDocumentationValuesFromServer(applicationId);
        if (refreshedDocumentation) {
          currentPayload.documentation = refreshedDocumentation;
          setDocumentationValuesFromExternal(refreshedDocumentation);
        }
      }
      if (activeSection === "guarantor") {
        setGuarantorValuesFromExternal(currentPayload.guarantor);
      }

      return true;
    },
    [
      activeTab,
      applicationId,
      isCreateMode,
      requiresGuarantorInformation,
      setDocumentationValuesFromExternal,
      setGuarantorValuesFromExternal,
    ]
  );

  const missingAdditionalInformationLabels = useMemo(() => {
    const nextMissing: string[] = [];

    if (requiresIncomeProof && documentationTab.values.incomeProofFiles.length === 0) {
      nextMissing.push("Comprobante de ingresos");
    }
    if (requiresEmploymentProofLetter && documentationTab.values.employmentProofLetterFiles.length === 0) {
      nextMissing.push("Carta de comprobante laboral");
    }
    if (requiresGuarantorInformation && !hasValidGuarantorInformation(guarantorTab.values)) {
      nextMissing.push("Información del aval");
    }

    return nextMissing;
  }, [
    documentationTab.values.employmentProofLetterFiles,
    documentationTab.values.incomeProofFiles,
    guarantorTab.values,
    requiresEmploymentProofLetter,
    requiresGuarantorInformation,
    requiresIncomeProof,
  ]);

  const tabsWithMissingRequestedInformation = useMemo(() => {
    const nextMissingTabs = new Set<CreditApplicationTabId>();
    if (requiresIncomeProof && documentationTab.values.incomeProofFiles.length === 0) {
      nextMissingTabs.add("documentation");
    }
    if (requiresEmploymentProofLetter && documentationTab.values.employmentProofLetterFiles.length === 0) {
      nextMissingTabs.add("documentation");
    }
    if (requiresGuarantorInformation && !hasValidGuarantorInformation(guarantorTab.values)) {
      nextMissingTabs.add("guarantor");
    }
    return Array.from(nextMissingTabs);
  }, [
    documentationTab.values.employmentProofLetterFiles,
    documentationTab.values.incomeProofFiles,
    guarantorTab.values,
    requiresEmploymentProofLetter,
    requiresGuarantorInformation,
    requiresIncomeProof,
  ]);

  const validateSubmissionTabs = useCallback(async (): Promise<CreditApplicationTabId[]> => {
    const invalidTabs: CreditApplicationTabId[] = [];

    const basicFormIsValid = basicInformationTab.validateValues();
    if (!basicFormIsValid) {
      invalidTabs.push("basic-information");
    } else {
      const basicIdentityIsValid = await basicInformationTab.validateIdentityUniqueness(
        isCreateMode ? undefined : applicationId
      );
      if (!basicIdentityIsValid) {
        invalidTabs.push("basic-information");
      }
    }

    if (!familyTab.validateValues()) invalidTabs.push("family");
    if (!addressTab.validateValues()) invalidTabs.push("address");
    if (!employmentTab.validateValues()) invalidTabs.push("employment");
    if (!referencesTab.validateValues()) invalidTabs.push("references");

    const documentationFormIsValid = documentationTab.validateValues({
      requireIncomeProof: requiresIncomeProof,
      requireEmploymentProofLetter: requiresEmploymentProofLetter,
    });
    if (!documentationFormIsValid) invalidTabs.push("documentation");

    if (shouldShowGuarantorTab && !guarantorTab.validateValues()) {
      invalidTabs.push("guarantor");
    }

    return invalidTabs;
  }, [
    addressTab,
    applicationId,
    basicInformationTab,
    documentationTab,
    employmentTab,
    familyTab,
    guarantorTab,
    isCreateMode,
    referencesTab,
    requiresEmploymentProofLetter,
    requiresIncomeProof,
    shouldShowGuarantorTab,
  ]);

  const handleSave = useCallback(
    async (options?: { skipValidation?: boolean }): Promise<boolean> => {
      if (!beginFormAction("validating")) {
        return false;
      }

      try {
        if (!options?.skipValidation) {
          const invalidTabs = await validateSubmissionTabs();
          if (invalidTabs.length > 0) {
            return false;
          }
        }

        setFormActionPhase("saving");
        setSaveSuccess(false);
        setError(null);

        const formPayload = getCurrentFormPayload();

        if (isCreateMode) {
          const result = await saveCreditApplication(formPayload, {
            includeGuarantorSection: requiresGuarantorInformation,
          });
          if (result?.id) {
            router.replace(`/solicitudes-credito/${result.id}`);
          }
        } else if (applicationId) {
          const saveResult = await saveCreditApplication(formPayload, {
            includeGuarantorSection: requiresGuarantorInformation,
          });
          if (!saveResult) return false;
          if (applicationId) {
            const refreshedDoc = await fetchDocumentationValuesFromServer(applicationId);
            if (refreshedDoc) formPayload.documentation = refreshedDoc;
            setDocumentationValuesFromExternal(refreshedDoc ?? formPayload.documentation);
          }
        }

        setSaveSuccess(true);
        return true;
      } catch (saveError) {
        console.error("[CreditApplicationForm] Unable to save credit application", saveError);
        setError(getApiErrorMessage(saveError));
        return false;
      } finally {
        endFormAction();
      }
    },
    [
      applicationId,
      beginFormAction,
      endFormAction,
      getCurrentFormPayload,
      isCreateMode,
      requiresGuarantorInformation,
      router,
      setDocumentationValuesFromExternal,
      setFormActionPhase,
      validateSubmissionTabs,
    ]
  );

  const handleSaveActiveTab = useCallback(async (): Promise<boolean> => {
    if (!beginFormAction("validating")) {
      return false;
    }

    try {
      const isValid = await validateActiveTab();
      if (!isValid) {
        return false;
      }

      setFormActionPhase("saving");
      setSaveSuccess(false);
      setError(null);

      const currentPayload = getCurrentFormPayload();
      const wasSaved = await saveActiveTabSection(currentPayload);
      if (!wasSaved) {
        return false;
      }

      setSaveSuccess(true);
      return true;
    } catch (saveError) {
      console.error("[CreditApplicationForm] Unable to save active section", saveError);
      setError(getApiErrorMessage(saveError));
      return false;
    } finally {
      endFormAction();
    }
  }, [
    activeTab,
    basicInformationTab,
    beginFormAction,
    endFormAction,
    getCurrentFormPayload,
    saveActiveTabSection,
    setFormActionPhase,
    validateActiveTab,
  ]);

  const handleSubmitForReview = useCallback(async () => {
    if (isCreateMode || !applicationId) {
      setError("No se encontró el identificador de la solicitud.");
      return null;
    }

    if (!beginFormAction("submitting")) {
      return null;
    }

    try {
      setError(null);
      return await submitCreditApplicationForReview(applicationId);
    } catch (submitError) {
      console.error("[CreditApplicationForm] Unable to submit credit application", submitError);
      setError(getApiErrorMessage(submitError));
      return null;
    } finally {
      endFormAction();
    }
  }, [applicationId, beginFormAction, endFormAction, isCreateMode]);

  const handleSubmitApplication = useCallback(async (): Promise<SubmitCreditApplicationResult> => {
    if (isCreateMode || !applicationId) {
      setError("No se encontró el identificador de la solicitud.");
      return { success: false, invalidTabs: [] };
    }

    if (!beginFormAction("validating")) {
      return { success: false, invalidTabs: [] };
    }

    try {
      const invalidTabs = await validateSubmissionTabs();
      if (invalidTabs.length > 0) {
        return { success: false, invalidTabs };
      }

      const formPayload = getCurrentFormPayload();

      setFormActionPhase("saving");
      setError(null);
      const saveResult = await saveCreditApplication(formPayload, {
        includeGuarantorSection: requiresGuarantorInformation,
      });
      if (!saveResult) return { success: false, invalidTabs: [] };
      if (applicationId) {
        const refreshedDoc = await fetchDocumentationValuesFromServer(applicationId);
        if (refreshedDoc) {
          formPayload.documentation = refreshedDoc;
          setDocumentationValuesFromExternal(refreshedDoc);
        }
      }

      setFormActionPhase("submitting");
      const submitResult = await submitCreditApplicationForReview(applicationId);
      if (!submitResult) return { success: false, invalidTabs: [] };
      return {
        success: true,
        invalidTabs: [],
        message: submitResult.message,
      };
    } catch (submitError) {
      console.error("[CreditApplicationForm] Unable to submit credit application", submitError);
      setError(getApiErrorMessage(submitError));
      return { success: false, invalidTabs: [] };
    } finally {
      endFormAction();
    }
  }, [
    applicationId,
    beginFormAction,
    endFormAction,
    getCurrentFormPayload,
    isCreateMode,
    requiresGuarantorInformation,
    setDocumentationValuesFromExternal,
    setFormActionPhase,
    validateSubmissionTabs,
  ]);

  return {
    loading,
    loadingApplicationDetail,
    saving,
    isFormLocked,
    isFormComplete,
    formAction,
    error,
    saveSuccess,
    isEmptyState,
    additionalInformationRequested,
    activeTab,
    tabs,
    requiresIncomeProof,
    requiresEmploymentProofLetter,
    requiresGuarantorInformation,
    missingAdditionalInformationLabels,
    tabsWithMissingRequestedInformation,
    setActiveTab,
    basicInformationTab,
    familyTab,
    addressTab,
    employmentTab,
    referencesTab,
    documentationTab,
    guarantorTab,
    validateSubmissionTabs,
    handleSave,
    handleSaveActiveTab,
    handleSubmitForReview,
    handleSubmitApplication,
  };
}
