import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  buildClientSectionPayload,
  getClientInformationSection,
  updateClientInformationSection,
  uploadClientDocument,
  type ClientInformationSection,
} from "@/services/clients.service";
import { sendClientOtp, verifyClientOtp } from "@/services/clientOtp.service";
import { getApiErrorMessage, unwrapOrThrow } from "@/lib/axios";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { useBasicInformationTab } from "@/hooks/credit-applications/tabs/useBasicInformationTab";
import { useAddressTab } from "@/hooks/credit-applications/tabs/useAddressTab";
import { useDocumentationTab } from "@/hooks/credit-applications/tabs/useDocumentationTab";
import { useEmploymentTab } from "@/hooks/credit-applications/tabs/useEmploymentTab";
import { useFamilyTab } from "@/hooks/credit-applications/tabs/useFamilyTab";
import { useReferencesTab } from "@/hooks/credit-applications/tabs/useReferencesTab";
import {
  mapClientAddressToFormValues,
  mapClientBasicToFormValues,
  mapClientDocumentationToFormValues,
  mapClientEmploymentToFormValues,
  mapClientFamilyToFormValues,
  mapClientReferencesToFormValues,
} from "@/lib/clientInformationMapper";
import { creditApplicationTabIdToSection } from "@/utils/credit-application-form";
import type {
  AddressTabValues,
  BasicInformationFormValues,
  CreditApplicationFormPayload,
  CreditApplicationTabId,
  DocumentationTabValues,
  EmploymentTabValues,
  FamilyTabValues,
  ReferencesTabValues,
} from "@/types/credit-application-form.types";

const EMPTY_BASIC: BasicInformationFormValues = {
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

const EMPTY_FAMILY: FamilyTabValues = {
  hasSpouse: true,
  spouseName: "",
  spousePhone: "",
  dependentsCount: 0,
};

const EMPTY_ADDRESS: AddressTabValues = {
  postalCode: "",
  neighborhoodFullCode: "-1",
  state: "",
  city: "",
  street: "",
  externalNumber: "",
  internalNumber: "",
  betweenStreets: "",
  housingType: "",
  residenceTimeValue: "",
  residenceTimeUnit: "",
  previousAddress: "",
  previousResidenceTimeValue: "",
  previousResidenceTimeUnit: "",
};

const EMPTY_EMPLOYMENT: EmploymentTabValues = {
  company: "",
  postalCode: "",
  neighborhoodFullCode: "-1",
  state: "",
  city: "",
  street: "",
  externalNumber: "",
  internalNumber: "",
  seniorityYears: "",
  position: "",
  department: "",
  monthlyIncome: "",
  companyPhone: "",
  hasOtherIncome: false,
  otherIncomeAmount: "",
  otherIncomeSource: "",
  spouseHasEmployment: false,
  spouseCompany: "",
  spousePostalCode: "",
  spouseNeighborhoodFullCode: "-1",
  spouseState: "",
  spouseCity: "",
  spouseStreet: "",
  spouseExternalNumber: "",
  spouseInternalNumber: "",
  spouseSeniorityYears: "",
  spousePosition: "",
  spouseDepartment: "",
  spouseMonthlyIncome: "",
  spouseCompanyPhone: "",
};

const EMPTY_REFERENCES: ReferencesTabValues = {
  company: "",
  phone: "",
  clientPosition: "",
  seniorityYears: "",
  respondentNameAndPosition: "",
  familyReferences: [
    { id: "reference-1", name: "", relationshipId: "", address: "", phone: "" },
  ],
};

const EMPTY_DOCUMENTATION: DocumentationTabValues = {
  requiredAlertVisible: true,
  requiredAlertMessage: "Agrega la documentación solicitada.",
  incomeProofFiles: [],
  employmentProofLetterFiles: [],
  ineFrontFiles: [],
  ineBackFiles: [],
};

const TAB_TO_API_SECTION: Record<
  Exclude<CreditApplicationTabId, "guarantor">,
  ClientInformationSection
> = {
  "basic-information": "basic",
  family: "family",
  address: "address",
  employment: "employment",
  references: "references",
  documentation: "documentation",
};

type DocFile = {
  id: string;
  name: string;
  file?: File;
  filePath?: string;
  url?: string;
  uploadedAt?: string;
};

async function ensureClientDocumentFilesUploaded(
  clientId: number,
  files: DocFile[],
  type: string
): Promise<DocFile[]> {
  const resolved: DocFile[] = [];
  for (const item of files) {
    if (item.file) {
      const result = await uploadClientDocument(clientId, type, item.file);
      if (result.error || !result.data) continue;
      resolved.push({
        id: item.id,
        name: item.name,
        filePath: result.data.filePath,
        url: result.data.fileUrl,
        uploadedAt: item.uploadedAt ?? "Cargado",
      });
      continue;
    }
    const existingPath = item.filePath?.trim();
    if (existingPath) {
      resolved.push({
        id: item.id,
        name: item.name,
        filePath: existingPath,
        url: item.url,
        uploadedAt: item.uploadedAt,
      });
    }
  }
  return resolved;
}

export function useClientInformationForm(
  clientId: number,
  initialTab: CreditApplicationTabId = "basic-information",
) {
  const showSuccess = useSnackbarStore((s) => s.showSuccess);
  const showError = useSnackbarStore((s) => s.showError);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] =
    useState<CreditApplicationTabId>(initialTab);
  const [isKycVerified, setIsKycVerified] = useState(false);
  const [requiresIncomeProof, setRequiresIncomeProof] = useState(false);
  const [requiresEmploymentProofLetter, setRequiresEmploymentProofLetter] =
    useState(false);
  const savingRef = useRef(false);
  const loadedSectionsRef = useRef<Set<ClientInformationSection>>(new Set());

  const basicInformationTab = useBasicInformationTab(EMPTY_BASIC, {
    sendOtp: async (whatsappNumber) => sendClientOtp(whatsappNumber),
    verifyOtp: async (whatsappNumber, otpCode) =>
      verifyClientOtp(whatsappNumber, otpCode),
  });
  const familyTab = useFamilyTab(EMPTY_FAMILY);
  const addressTab = useAddressTab(EMPTY_ADDRESS);
  const employmentTab = useEmploymentTab(EMPTY_EMPLOYMENT);
  const referencesTab = useReferencesTab(EMPTY_REFERENCES);
  const documentationTab = useDocumentationTab(EMPTY_DOCUMENTATION);

  const setBasic = basicInformationTab.setValuesFromExternalSource;
  const setFamily = familyTab.setValuesFromExternalSource;
  const setAddress = addressTab.setValuesFromExternalSource;
  const setEmployment = employmentTab.setValuesFromExternalSource;
  const setReferences = referencesTab.setValuesFromExternalSource;
  const setDocumentation = documentationTab.setValuesFromExternalSource;

  useEffect(() => {
    loadedSectionsRef.current = new Set();
    setError(null);
  }, [clientId]);

  useEffect(() => {
    if (activeTab === "guarantor") return;
    const section = TAB_TO_API_SECTION[activeTab];
    if (loadedSectionsRef.current.has(section)) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getClientInformationSection(clientId, section);
        if (cancelled) return;
        if (result.error || !result.data) {
          throw new Error(
            result.error?.message ?? "No se pudo cargar la información."
          );
        }

        const data = result.data.data;
        switch (section) {
          case "basic": {
            const mapped = mapClientBasicToFormValues(
              data as Parameters<typeof mapClientBasicToFormValues>[0]
            );
            setBasic(mapped.basicInformation, {
              isSecurityCodeVerified: mapped.phoneIsVerified,
            });
            setIsKycVerified(mapped.isKycVerified);
            break;
          }
          case "family":
            setFamily(
              mapClientFamilyToFormValues(
                data as Parameters<typeof mapClientFamilyToFormValues>[0]
              )
            );
            break;
          case "address":
            setAddress(
              mapClientAddressToFormValues(
                data as Parameters<typeof mapClientAddressToFormValues>[0]
              )
            );
            break;
          case "employment":
            setEmployment(
              mapClientEmploymentToFormValues(
                data as Parameters<typeof mapClientEmploymentToFormValues>[0]
              )
            );
            break;
          case "references":
            setReferences(
              mapClientReferencesToFormValues(
                data as Parameters<typeof mapClientReferencesToFormValues>[0]
              )
            );
            break;
          case "documentation": {
            const mapped = mapClientDocumentationToFormValues(
              data as Parameters<typeof mapClientDocumentationToFormValues>[0]
            );
            setDocumentation(mapped.documentation);
            const codes = new Set(
              mapped.additionalInformationRequested
                .filter((item) => item.requestFlag)
                .map((item) => item.code.trim().toUpperCase())
            );
            setRequiresIncomeProof(codes.has("INCOME_PROOF"));
            setRequiresEmploymentProofLetter(
              codes.has("EMPLOYMENT_PROOF_LETTER")
            );
            break;
          }
        }
        loadedSectionsRef.current.add(section);
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "No se pudo cargar la información del cliente."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [
    activeTab,
    clientId,
    setAddress,
    setBasic,
    setDocumentation,
    setEmployment,
    setFamily,
    setReferences,
  ]);

  const getCurrentFormPayload = useCallback((): CreditApplicationFormPayload => {
    return {
      id: String(clientId),
      basicInformation: basicInformationTab.values,
      family: familyTab.values,
      address: addressTab.values,
      employment: employmentTab.values,
      references: referencesTab.values,
      documentation: documentationTab.values,
      guarantor: {
        fullName: "",
        postalCode: "",
        neighborhoodFullCode: "",
        state: "",
        city: "",
        street: "",
        externalNumber: "",
        internalNumber: "",
        betweenStreets: "",
        birthDate: "",
        maritalStatus: "",
        curp: "",
        rfc: "",
        phone: "",
        identificationFrontFiles: [],
        identificationBackFiles: [],
        hasSpouse: false,
      },
      biometrics: null,
    };
  }, [
    addressTab.values,
    basicInformationTab.values,
    clientId,
    documentationTab.values,
    employmentTab.values,
    familyTab.values,
    referencesTab.values,
  ]);

  const handleSaveActiveTab = useCallback(async () => {
    if (savingRef.current) return false;
    const tabId = activeTab;
    if (tabId === "guarantor") return false;

    let isValid = true;
    if (tabId === "basic-information") {
      isValid = basicInformationTab.validateValues();
    } else if (tabId === "family") {
      isValid = familyTab.validateValues();
    } else if (tabId === "address") {
      isValid = addressTab.validateValues();
    } else if (tabId === "employment") {
      isValid = employmentTab.validateValues();
    } else if (tabId === "references") {
      isValid = referencesTab.validateValues();
    } else if (tabId === "documentation") {
      isValid = documentationTab.validateValues({
        requireIncomeProof: requiresIncomeProof,
        requireEmploymentProofLetter: requiresEmploymentProofLetter,
      });
    }
    if (!isValid) return false;

    savingRef.current = true;
    setSaving(true);
    try {
      const payload = getCurrentFormPayload();
      const sectionKey = creditApplicationTabIdToSection(tabId);
      if (!sectionKey || sectionKey === "guarantor") return false;

      if (sectionKey === "documentation") {
        payload.documentation = {
          ...payload.documentation,
          incomeProofFiles: await ensureClientDocumentFilesUploaded(
            clientId,
            payload.documentation.incomeProofFiles,
            "INCOME_PROOF"
          ),
          employmentProofLetterFiles: await ensureClientDocumentFilesUploaded(
            clientId,
            payload.documentation.employmentProofLetterFiles,
            "EMPLOYMENT_PROOF_LETTER"
          ),
          ineFrontFiles: await ensureClientDocumentFilesUploaded(
            clientId,
            payload.documentation.ineFrontFiles,
            "INE_FRONT"
          ),
          ineBackFiles: await ensureClientDocumentFilesUploaded(
            clientId,
            payload.documentation.ineBackFiles,
            "INE_BACK"
          ),
        };
        setDocumentation(payload.documentation);
      }

      const body = buildClientSectionPayload(
        sectionKey as Exclude<typeof sectionKey, "guarantor">,
        payload
      );
      const apiSection = TAB_TO_API_SECTION[tabId as keyof typeof TAB_TO_API_SECTION];
      const result = await updateClientInformationSection(
        clientId,
        apiSection,
        body
      );
      unwrapOrThrow(result);
      showSuccess(result.data?.message ?? "Información actualizada.");
      return true;
    } catch (saveError) {
      showError(getApiErrorMessage(saveError));
      return false;
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }, [
    activeTab,
    addressTab,
    basicInformationTab,
    clientId,
    documentationTab,
    employmentTab,
    familyTab,
    getCurrentFormPayload,
    referencesTab,
    requiresEmploymentProofLetter,
    requiresIncomeProof,
    setDocumentation,
    showError,
    showSuccess,
  ]);

  return {
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
  };
}
