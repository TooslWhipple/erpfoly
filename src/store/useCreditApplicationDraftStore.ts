import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  AddressTabValues,
  BasicInformationFormValues,
  CreditApplicationBiometricsData,
  CreditApplicationDraft,
  DocumentationTabValues,
  EmploymentTabValues,
  FamilyTabValues,
  GuarantorTabValues,
  ReferencesTabValues,
} from "@/types/credit-application-form.types";

const EMPTY_BASIC_INFORMATION: BasicInformationFormValues = {
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
  hasSpouse: false,
  spouseName: "",
  spousePhone: "",
  dependentsCount: 0,
};

const EMPTY_ADDRESS: AddressTabValues = {
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

const EMPTY_EMPLOYMENT: EmploymentTabValues = {
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

const EMPTY_REFERENCES: ReferencesTabValues = {
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

const EMPTY_DOCUMENTATION: DocumentationTabValues = {
  requiredAlertVisible: true,
  requiredAlertMessage: "Agrega la documentación solicitada para continuar con la solicitud.",
  incomeProofFiles: [],
  employmentProofLetterFiles: [],
  ineFrontFiles: [],
  ineBackFiles: [],
};

const EMPTY_GUARANTOR: GuarantorTabValues = {
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

interface CreditApplicationDraftState {
  drafts: Record<string, CreditApplicationDraft>;
  getDraftById: (draftId: string) => CreditApplicationDraft | null;
  upsertBasicInformation: (draftId: string, basicInformation: BasicInformationFormValues) => void;
  upsertFamily: (draftId: string, family: FamilyTabValues) => void;
  upsertAddress: (draftId: string, address: AddressTabValues) => void;
  upsertEmployment: (draftId: string, employment: EmploymentTabValues) => void;
  upsertReferences: (draftId: string, references: ReferencesTabValues) => void;
  upsertDocumentation: (draftId: string, documentation: DocumentationTabValues) => void;
  upsertGuarantor: (draftId: string, guarantor: GuarantorTabValues) => void;
  upsertBiometrics: (draftId: string, biometrics: CreditApplicationBiometricsData) => void;
  clearDraftById: (draftId: string) => void;
}

function getDefaultDraft(draftId: string): CreditApplicationDraft {
  return {
    id: draftId,
    basicInformation: { ...EMPTY_BASIC_INFORMATION },
    family: { ...EMPTY_FAMILY },
    address: { ...EMPTY_ADDRESS },
    employment: { ...EMPTY_EMPLOYMENT },
    references: {
      ...EMPTY_REFERENCES,
      familyReferences: EMPTY_REFERENCES.familyReferences.map((reference) => ({ ...reference })),
    },
    documentation: { ...EMPTY_DOCUMENTATION },
    guarantor: { ...EMPTY_GUARANTOR },
    biometrics: null,
    updatedAt: new Date().toISOString(),
  };
}

export const useCreditApplicationDraftStore = create<CreditApplicationDraftState>()(
  persist(
    (set, get) => ({
      drafts: {},
      getDraftById: (draftId: string) => {
        return get().drafts[draftId] ?? null;
      },
      upsertBasicInformation: (draftId, basicInformation) => {
        set((state) => {
          const currentDraft = state.drafts[draftId] ?? getDefaultDraft(draftId);
          return {
            drafts: {
              ...state.drafts,
              [draftId]: {
                ...currentDraft,
                basicInformation,
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },
      upsertFamily: (draftId, family) => {
        set((state) => {
          const currentDraft = state.drafts[draftId] ?? getDefaultDraft(draftId);
          return {
            drafts: {
              ...state.drafts,
              [draftId]: {
                ...currentDraft,
                family,
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },
      upsertAddress: (draftId, address) => {
        set((state) => {
          const currentDraft = state.drafts[draftId] ?? getDefaultDraft(draftId);
          return {
            drafts: {
              ...state.drafts,
              [draftId]: {
                ...currentDraft,
                address,
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },
      upsertEmployment: (draftId, employment) => {
        set((state) => {
          const currentDraft = state.drafts[draftId] ?? getDefaultDraft(draftId);
          return {
            drafts: {
              ...state.drafts,
              [draftId]: {
                ...currentDraft,
                employment,
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },
      upsertReferences: (draftId, references) => {
        set((state) => {
          const currentDraft = state.drafts[draftId] ?? getDefaultDraft(draftId);
          return {
            drafts: {
              ...state.drafts,
              [draftId]: {
                ...currentDraft,
                references,
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },
      upsertDocumentation: (draftId, documentation) => {
        set((state) => {
          const currentDraft = state.drafts[draftId] ?? getDefaultDraft(draftId);
          return {
            drafts: {
              ...state.drafts,
              [draftId]: {
                ...currentDraft,
                documentation,
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },
      upsertGuarantor: (draftId, guarantor) => {
        set((state) => {
          const currentDraft = state.drafts[draftId] ?? getDefaultDraft(draftId);
          return {
            drafts: {
              ...state.drafts,
              [draftId]: {
                ...currentDraft,
                guarantor,
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },
      upsertBiometrics: (draftId, biometrics) => {
        set((state) => {
          const currentDraft = state.drafts[draftId] ?? getDefaultDraft(draftId);
          return {
            drafts: {
              ...state.drafts,
              [draftId]: {
                ...currentDraft,
                biometrics,
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },
      clearDraftById: (draftId) => {
        set((state) => {
          const nextDrafts = { ...state.drafts };
          delete nextDrafts[draftId];
          return { drafts: nextDrafts };
        });
      },
    }),
    {
      name: "credit-application-drafts",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
