export type CreditApplicationTabId = "basic-information";

export interface BasicInformationFormValues {
  firstName: string;
  lastName: string;
  secondLastName: string;
  birthDate: string;
  maritalStatus: string;
  curp: string;
  rfc: string;
  email: string;
  whatsappNumber: string;
  securityCode: string;
}

export interface BasicInformationFormErrors {
  firstName?: string;
  lastName?: string;
  secondLastName?: string;
  birthDate?: string;
  maritalStatus?: string;
  curp?: string;
  rfc?: string;
  email?: string;
  whatsappNumber?: string;
  securityCode?: string;
}

export interface CreditApplicationBiometricsData {
  ineFrontImage: string | null;
  selfieImage: string | null;
  fingerprintConfirmed: boolean;
  signatureDataUrl: string | null;
  completedAt: string | null;
}

export interface CreditApplicationDraft {
  id: string;
  basicInformation: BasicInformationFormValues;
  biometrics: CreditApplicationBiometricsData | null;
  updatedAt: string;
}

export interface CreditApplicationFormPayload {
  id?: string;
  basicInformation: BasicInformationFormValues;
  biometrics: CreditApplicationBiometricsData | null;
}
