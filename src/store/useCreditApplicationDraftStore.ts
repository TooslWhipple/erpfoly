import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  BasicInformationFormValues,
  CreditApplicationBiometricsData,
  CreditApplicationDraft,
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

interface CreditApplicationDraftState {
  drafts: Record<string, CreditApplicationDraft>;
  getDraftById: (draftId: string) => CreditApplicationDraft | null;
  upsertBasicInformation: (draftId: string, basicInformation: BasicInformationFormValues) => void;
  upsertBiometrics: (draftId: string, biometrics: CreditApplicationBiometricsData) => void;
  clearDraftById: (draftId: string) => void;
}

function getDefaultDraft(draftId: string): CreditApplicationDraft {
  return {
    id: draftId,
    basicInformation: { ...EMPTY_BASIC_INFORMATION },
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
      storage:
        typeof window !== "undefined"
          ? {
              getItem: (name: string) => localStorage.getItem(name),
              setItem: (name: string, value: string) => localStorage.setItem(name, value),
              removeItem: (name: string) => localStorage.removeItem(name),
            }
          : undefined,
    }
  )
);
