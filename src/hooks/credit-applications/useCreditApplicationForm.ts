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
import { parseBasicInformationServerErrors, useBasicInformationTab } from "./tabs/useBasicInformationTab";
import { useAddressTab } from "./tabs/useAddressTab";
import { useDocumentationTab } from "./tabs/useDocumentationTab";
import { useEmploymentTab } from "./tabs/useEmploymentTab";
import { useFamilyTab } from "./tabs/useFamilyTab";
import { hasValidGuarantorInformation, useGuarantorTab } from "./tabs/useGuarantorTab";
import { useReferencesTab } from "./tabs/useReferencesTab";
import { useCreditApplicationDraftStore } from "@/store/useCreditApplicationDraftStore";
import {
  buildCreditApplicationSectionSnapshots,
  creditApplicationTabIdToSection,
  getDirtyCreditApplicationSections,
  serializeCreditApplicationSection,
  type CreditApplicationSectionKey,
} from "@/utils/credit-application-form";
import type {
  AddressTabValues,
  BasicInformationFormValues,
  CreditApplicationBiometricsData,
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
  receiverPhone: "",
  receiverName: "",
  useClientPhone: false,
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

const DRAFT_STALE_AFTER_MS = 5 * 60 * 1000;
const VERIFIED_SECURITY_CODE_VALUE = "Verificado";
const inFlightCreditApplicationRequests = new Map<
  string,
  Promise<CreditApplicationDetailResponse>
>();

function getCreditApplicationDetailOnce(applicationId: string): Promise<CreditApplicationDetailResponse> {
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
): Promise<DocumentationTabValues> {
  const refreshedApplication = await getCreditApplicationDetailOnce(applicationId);
  return mapCreditApplicationToFormValues(refreshedApplication).documentation;
}

function isDraftStale(updatedAt: string | undefined): boolean {
  if (!updatedAt) return true;
  const parsedTimestamp = Date.parse(updatedAt);
  if (!Number.isFinite(parsedTimestamp)) return true;
  return Date.now() - parsedTimestamp > DRAFT_STALE_AFTER_MS;
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
    receiverPhone: creditApplication.address.receiverPhone ?? "",
    receiverName: creditApplication.address.receiverName ?? "",
    useClientPhone: Boolean(creditApplication.address.useClientPhone),
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
  const [biometricsData, setBiometricsData] = useState<CreditApplicationBiometricsData | null>(null);
  const [savedSectionSnapshots, setSavedSectionSnapshots] = useState<
    Partial<Record<CreditApplicationSectionKey, string>>
  >({});
  const formActionRef = useRef(false);
  const [additionalInformationRequested, setAdditionalInformationRequested] = useState<
    AdditionalInformationRequestedItem[]
  >([]);

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

  const shouldShowGuarantorTab = true;

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
      basicInformationValues: BasicInformationFormValues,
    ): Promise<string | undefined> => {
      if (isCreateMode || !applicationId) {
        return undefined;
      }

      const currentPayload = {
        id: applicationId,
        basicInformation: basicInformationValues,
        family: familyTab.values,
        address: addressTab.values,
        employment: employmentTab.values,
        references: referencesTab.values,
        documentation: documentationTab.values,
        guarantor: guarantorTab.values,
        biometrics: biometricsData,
      };

      await saveCreditApplicationSection(
        applicationId,
        "basicInformation",
        currentPayload,
      );

      return applicationId;
    },
    [
      addressTab.values,
      applicationId,
      biometricsData,
      documentationTab.values,
      employmentTab.values,
      familyTab.values,
      guarantorTab.values,
      isCreateMode,
      referencesTab.values,
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
    if (!isCreateMode && !applicationId) {
      setError("No se encontró el identificador de la solicitud.");
      setLoading(false);
      setLoadingApplicationDetail(false);
      return;
    }

    const draft = getDraftById(draftKey);
    const draftIsStale = draft ? isDraftStale(draft.updatedAt) : true;
    if (draft) {
      setAdditionalInformationRequested([]);
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
    }

    if (isCreateMode) {
      setAdditionalInformationRequested([]);
      setLoading(false);
      setLoadingApplicationDetail(false);
      return;
    }

    let isCancelled = false;
    const loadExistingApplication = async () => {
      setLoading(!draft);
      setLoadingApplicationDetail(true);
      setError(null);
      setIsEmptyState(false);

      try {
        const loadedApplication = await getCreditApplicationDetailOnce(applicationId!);
        if (isCancelled) return;
        setAdditionalInformationRequested(loadedApplication.additionalInformationRequested ?? []);

        const mappedValues = mapCreditApplicationToFormValues(loadedApplication);
        const shouldApplyServerValues = !draft || draftIsStale;
        const shouldForceVerifiedPhoneState = mappedValues.phoneIsVerified;

        if (shouldApplyServerValues) {
          setBasicInformationValuesFromExternal(mappedValues.basicInformation, {
            isSecurityCodeVerified: mappedValues.phoneIsVerified,
          });
          setFamilyValuesFromExternal(mappedValues.family);
          setAddressValuesFromExternal(mappedValues.address);
          setEmploymentValuesFromExternal(mappedValues.employment);
          setReferencesValuesFromExternal(mappedValues.references);
          setDocumentationValuesFromExternal(mappedValues.documentation);
          setGuarantorValuesFromExternal(mappedValues.guarantor);
          setBiometricsData(null);

          upsertBasicInformation(draftKey, mappedValues.basicInformation);
          upsertFamily(draftKey, mappedValues.family);
          upsertAddress(draftKey, mappedValues.address);
          upsertEmployment(draftKey, mappedValues.employment);
          upsertReferences(draftKey, mappedValues.references);
          upsertDocumentation(draftKey, mappedValues.documentation);
          upsertGuarantor(draftKey, mappedValues.guarantor);
          setSavedSectionSnapshots(
            buildCreditApplicationSectionSnapshots({
              basicInformation: mappedValues.basicInformation,
              family: mappedValues.family,
              address: mappedValues.address,
              employment: mappedValues.employment,
              references: mappedValues.references,
              documentation: mappedValues.documentation,
              guarantor: mappedValues.guarantor,
            })
          );
        } else if (shouldForceVerifiedPhoneState) {
          // Even with a fresh draft, the backend verified phone state is authoritative.
          setBasicInformationValuesFromExternal(mappedValues.basicInformation, {
            isSecurityCodeVerified: true,
          });
          upsertBasicInformation(draftKey, mappedValues.basicInformation);
        }
      } catch (loadError) {
        console.error("[CreditApplicationForm] Unable to load credit application", loadError);
        if (!isCancelled) {
          setAdditionalInformationRequested([]);
          if (!draft) {
            setIsEmptyState(true);
            setError("No se pudo cargar la solicitud, intenta nuevamente.");
          }
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
    upsertGuarantor,
  ]);

  useEffect(() => {
    if (activeTab === "guarantor" && !shouldShowGuarantorTab) {
      setActiveTab("basic-information");
    }
  }, [activeTab, shouldShowGuarantorTab]);

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
    guarantorTab.validateValues(true);

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
      biometrics: biometricsData,
    }),
    [
      addressTab.values,
      applicationId,
      basicInformationTab.values,
      biometricsData,
      documentationTab.values,
      employmentTab.values,
      familyTab.values,
      guarantorTab.values,
      isCreateMode,
      referencesTab.values,
    ]
  );

  const updateSectionSnapshots = useCallback(
    (
      payload: Pick<CreditApplicationFormPayload, CreditApplicationSectionKey>,
      sections: CreditApplicationSectionKey[]
    ) => {
      setSavedSectionSnapshots((previousSnapshots) => {
        const nextSnapshots = { ...previousSnapshots };
        for (const section of sections) {
          nextSnapshots[section] = serializeCreditApplicationSection(section, payload);
        }
        return nextSnapshots;
      });
    },
    []
  );

  const persistFormPayload = useCallback(
    (payload: Pick<CreditApplicationFormPayload, CreditApplicationSectionKey>) => {
      persistBasicInformation(payload.basicInformation);
      persistFamily(payload.family);
      persistAddress(payload.address);
      persistEmployment(payload.employment);
      persistReferences(payload.references);
      persistDocumentation(payload.documentation);
      persistGuarantor(payload.guarantor);
    },
    [
      persistAddress,
      persistBasicInformation,
      persistDocumentation,
      persistEmployment,
      persistFamily,
      persistGuarantor,
      persistReferences,
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

      await saveCreditApplicationSection(applicationId, activeSection, currentPayload);

      if (activeSection === "documentation") {
        const refreshedDocumentation = await fetchDocumentationValuesFromServer(applicationId);
        currentPayload.documentation = refreshedDocumentation;
        setDocumentationValuesFromExternal(refreshedDocumentation);
      }
      if (activeSection === "guarantor") {
        setGuarantorValuesFromExternal(currentPayload.guarantor);
      }

      updateSectionSnapshots(currentPayload, [activeSection]);
      return true;
    },
    [
      activeTab,
      applicationId,
      isCreateMode,
      requiresGuarantorInformation,
      setDocumentationValuesFromExternal,
      setGuarantorValuesFromExternal,
      updateSectionSnapshots,
    ]
  );

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

    if (!guarantorTab.validateValues()) {
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
  ]);

  const handleSave = useCallback(
    async (options?: {
      skipValidation?: boolean;
      sections?: CreditApplicationSectionKey[];
    }): Promise<boolean> => {
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
        const sectionsToSave =
          options?.sections ??
          getDirtyCreditApplicationSections(formPayload, savedSectionSnapshots, {
            includeGuarantorSection: requiresGuarantorInformation,
          });

        if (!isCreateMode && applicationId && sectionsToSave.length > 0) {
          await saveCreditApplication(formPayload, {
            includeGuarantorSection: requiresGuarantorInformation,
            sections: sectionsToSave,
          });
          if (sectionsToSave.includes("documentation")) {
            formPayload.documentation = await fetchDocumentationValuesFromServer(applicationId);
          }
          updateSectionSnapshots(formPayload, sectionsToSave);
        } else if (isCreateMode) {
          const result = await saveCreditApplication(formPayload, {
            includeGuarantorSection: requiresGuarantorInformation,
          });
          if (result.id) {
            router.replace(`/solicitudes-credito/${result.id}`);
          }
        }

        setDocumentationValuesFromExternal(formPayload.documentation);
        setGuarantorValuesFromExternal(formPayload.guarantor);
        persistFormPayload(formPayload);
        setSaveSuccess(true);
        return true;
      } catch (saveError) {
        console.error("[CreditApplicationForm] Unable to save credit application", saveError);
        setError("No se pudo guardar la solicitud.");
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
      persistFormPayload,
      requiresGuarantorInformation,
      router,
      savedSectionSnapshots,
      setDocumentationValuesFromExternal,
      setFormActionPhase,
      setGuarantorValuesFromExternal,
      updateSectionSnapshots,
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

      persistFormPayload(currentPayload);
      setSaveSuccess(true);
      return true;
    } catch (saveError) {
      console.error("[CreditApplicationForm] Unable to save active section", saveError);

      const apiError = (saveError as Error & { apiError?: { message?: string; validationMessages?: string[] } }).apiError;
      if (apiError?.validationMessages && apiError.validationMessages.length > 0) {
        const activeSection = creditApplicationTabIdToSection(activeTab);
        if (activeSection === "basicInformation") {
          const fieldErrors = parseBasicInformationServerErrors(apiError.validationMessages);
          basicInformationTab.setServerErrors(fieldErrors);
        }
        setError("Corrige los campos marcados antes de continuar.");
      } else {
        setError("No se pudo guardar la sección.");
      }
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
    persistFormPayload,
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
      setError("No se pudo enviar la solicitud a revisión.");
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
      const dirtySections = getDirtyCreditApplicationSections(formPayload, savedSectionSnapshots, {
        includeGuarantorSection: requiresGuarantorInformation,
      });

      if (dirtySections.length > 0) {
        setFormActionPhase("saving");
        setError(null);
        await saveCreditApplication(formPayload, {
          includeGuarantorSection: requiresGuarantorInformation,
          sections: dirtySections,
        });
        if (dirtySections.includes("documentation") && applicationId) {
          formPayload.documentation = await fetchDocumentationValuesFromServer(applicationId);
        }
        updateSectionSnapshots(formPayload, dirtySections);
        setDocumentationValuesFromExternal(formPayload.documentation);
        setGuarantorValuesFromExternal(formPayload.guarantor);
        persistFormPayload(formPayload);
      }

      setFormActionPhase("submitting");
      const submitResult = await submitCreditApplicationForReview(applicationId);
      return {
        success: true,
        invalidTabs: [],
        message: submitResult.message,
      };
    } catch (submitError) {
      console.error("[CreditApplicationForm] Unable to submit credit application", submitError);
      setError("No se pudo enviar la solicitud a revisión.");
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
    persistFormPayload,
    requiresGuarantorInformation,
    savedSectionSnapshots,
    setDocumentationValuesFromExternal,
    setFormActionPhase,
    setGuarantorValuesFromExternal,
    updateSectionSnapshots,
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
    validateSubmissionTabs,
    handleSave,
    handleSaveActiveTab,
    handleSubmitForReview,
    handleSubmitApplication,
    handleBiometricsCompleted,
  };
}
