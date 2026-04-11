export type CreditApplicationTabId =
  | "basic-information"
  | "family"
  | "address"
  | "employment"
  | "references"
  | "documentation"
  | "guarantor";

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
  ineBackImage: string | null;
  selfieImage: string | null;
  fingerprintConfirmed: boolean;
  signatureDataUrl: string | null;
  completedAt: string | null;
}

export interface FamilyTabValues {
  hasSpouse: boolean;
  spouseName: string;
  spousePhone: string;
  dependentsCount: number;
}

export interface FamilyTabErrors {
  spouseName?: string;
  spousePhone?: string;
}

export interface AddressTabValues {
  postalCode: string;
  neighborhoodFullCode: string;
  state: string;
  city: string;
  streetAndNumber: string;
  betweenStreets: string;
  receiverPhone: string;
  receiverName: string;
  useClientPhone: boolean;
  housingType: "owned" | "rented" | "paying" | "relatives";
  residenceTime: string;
  previousAddress: string;
  previousResidenceTime: string;
}

export interface AddressTabErrors {
  postalCode?: string;
  neighborhoodFullCode?: string;
  state?: string;
  city?: string;
  streetAndNumber?: string;
  receiverPhone?: string;
  receiverName?: string;
  residenceTime?: string;
  previousAddress?: string;
  previousResidenceTime?: string;
  betweenStreets?: string;
}

export interface EmploymentTabValues {
  company: string;
  postalCode: string;
  neighborhoodFullCode: string;
  state: string;
  city: string;
  streetAndNumber: string;
  seniorityYears: string;
  position: string;
  department: string;
  monthlyIncome: string;
  companyPhone: string;
  hasOtherIncome: boolean;
  otherIncomeAmount: string;
  otherIncomeSource: string;
  spouseCompany: string;
  spousePostalCode: string;
  spouseNeighborhoodFullCode: string;
  spouseState: string;
  spouseCity: string;
  spouseStreetAndNumber: string;
  spouseSeniorityYears: string;
  spousePosition: string;
  spouseDepartment: string;
  spouseMonthlyIncome: string;
  spouseCompanyPhone: string;
}

export interface EmploymentTabErrors {
  company?: string;
  postalCode?: string;
  neighborhoodFullCode?: string;
  state?: string;
  city?: string;
  streetAndNumber?: string;
  monthlyIncome?: string;
  spousePostalCode?: string;
  spouseNeighborhoodFullCode?: string;
  spouseState?: string;
  spouseCity?: string;
}

export interface FamilyReference {
  id: string;
  name: string;
  relationship: string;
  address: string;
  phone: string;
}

export interface ReferencesTabValues {
  company: string;
  phone: string;
  clientPosition: string;
  seniorityYears: string;
  respondentNameAndPosition: string;
  familyReferences: FamilyReference[];
}

export interface ReferencesTabErrors {
  company?: string;
  phone?: string;
  clientPosition?: string;
  seniorityYears?: string;
  respondentNameAndPosition?: string;
}

export interface DocumentationTabValues {
  requiredAlertVisible: boolean;
  requiredAlertMessage: string;
  incomeProofFiles: CreditApplicationDocumentFile[];
  ineFrontFiles: CreditApplicationDocumentFile[];
  ineBackFiles: CreditApplicationDocumentFile[];
}

export interface CreditApplicationDocumentFile {
  id: string;
  name: string;
  url?: string;
  uploadedAt?: string;
}

export interface GuarantorTabValues {
  fullName: string;
  postalCode: string;
  neighborhoodFullCode: string;
  state: string;
  city: string;
  streetAndNumber: string;
  betweenStreets: string;
  birthDate: string;
  maritalStatus: string;
  curp: string;
  rfc: string;
  phone: string;
  identificationFrontFiles: CreditApplicationDocumentFile[];
  identificationBackFiles: CreditApplicationDocumentFile[];
  hasSpouse: boolean;
}

export interface GuarantorTabErrors {
  fullName?: string;
  postalCode?: string;
  neighborhoodFullCode?: string;
  state?: string;
  city?: string;
  streetAndNumber?: string;
  birthDate?: string;
  maritalStatus?: string;
  curp?: string;
  rfc?: string;
  phone?: string;
  identificationFrontFiles?: string;
  identificationBackFiles?: string;
}

export interface CreditApplicationDraft {
  id: string;
  basicInformation: BasicInformationFormValues;
  family: FamilyTabValues;
  address: AddressTabValues;
  employment: EmploymentTabValues;
  references: ReferencesTabValues;
  documentation: DocumentationTabValues;
  guarantor: GuarantorTabValues;
  biometrics: CreditApplicationBiometricsData | null;
  updatedAt: string;
}

export interface CreditApplicationFormPayload {
  id?: string;
  basicInformation: BasicInformationFormValues;
  family: FamilyTabValues;
  address: AddressTabValues;
  employment: EmploymentTabValues;
  references: ReferencesTabValues;
  documentation: DocumentationTabValues;
  guarantor: GuarantorTabValues;
  biometrics: CreditApplicationBiometricsData | null;
}
