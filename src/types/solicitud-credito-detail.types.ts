export interface CreditApplicationBasicInfo {
  firstName: string;
  firstSurname: string;
  secondSurname: string;
  birthDate: string;
  maritalStatus: string;
  curp: string;
  rfc: string;
  email: string;
  whatsapp: string;
  whatsappValidated: boolean;
}

export interface CreditApplicationNeighborhood {
  code: string;
  fullCode?: string;
  name: string;
  state: string;
  municipality: string;
}
export interface CreditApplicationAddress {
  postalCode: string;
  neighborhood: CreditApplicationNeighborhood;
  street: string;
  externalNumber: string;
  internalNumber: string;
  betweenStreets: string;
  housingOwnership: "own" | "rented" | "paying" | "relatives" | null;
  timeAtAddress: string;
  previousAddress: string;
  previousTime: string;
}

export interface CreditApplicationFamily {
  hasSpouse: boolean;
  spouseName: string;
  spousePhone: string;
  numberOfDependents: number;
}

export interface EmploymentInfo {
  company: string;
  postalCode: string;
  state: string;
  city: string;
  street: string;
  externalNumber: string;
  internalNumber: string;
  tenureYears: number;
  position: string;
  department: string;
  monthlyIncome: string;
  companyPhone: string;
}

export interface CreditApplicationEmployment {
  totalMonthlyIncome: string;
  applicant: EmploymentInfo;
  hasOtherIncome: boolean;
  spouse?: EmploymentInfo;
}

export interface WorkReference {
  company: string;
  phone: string;
  clientPosition: string;
  tenureYears: number;
  contactNameAndPosition: string;
}

export interface FamilyReference {
  name: string;
  relationship: string;
  address: string;
  phone: string;
}

export interface CreditApplicationReferences {
  work: WorkReference;
  family: FamilyReference[];
}

export interface DocumentItem {
  id: string;
  name: string;
  verifiedBy: string;
  thumbnailUrl: string;
  fullImageUrl: string;
}

export interface CreditApplicationDocumentation {
  documents: DocumentItem[];
}

export interface CreditApplicationCreditBureau {
  clientAuthorized: boolean;
  scoreLabel: string;
  scoreLevel: "excellent" | "good" | "fair" | "poor";
  signatureUrl?: string;
}

export interface BiometricItem {
  id: string;
  name: string;
  verifiedBy: string;
  thumbnailUrl?: string;
  type: "photo" | "fingerprint";
}

export interface CreditApplicationBiometrics {
  items: BiometricItem[];
}

export interface PurchaseIntentionItem {
  code: string;
  name: string;
  brand: string;
  imageUrl: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  promotionDiscount: number;
  total: number;
}

export interface CreditApplicationPurchaseIntention {
  items: PurchaseIntentionItem[];
  subtotal: number;
  total: number;
}

export interface CreditApplicationDetail {
  id: number;
  status: string;
  approvedClientId: number | null;
  approvedBaseCreditLineAmount: number | null;
  riskScore: number;
  riskLevel: "low" | "medium" | "high";
  basicInfo: CreditApplicationBasicInfo;
  address: CreditApplicationAddress;
  family: CreditApplicationFamily;
  employment: CreditApplicationEmployment;
  references: CreditApplicationReferences;
  documentation: CreditApplicationDocumentation;
  creditBureau: CreditApplicationCreditBureau;
  biometrics: CreditApplicationBiometrics;
  purchaseIntention: CreditApplicationPurchaseIntention;
}

export type CreditApplicationDetailSection =
  | "basic"
  | "address"
  | "family"
  | "employment"
  | "references"
  | "documentation"
  | "credit-bureau"
  | "biometrics"
  | "purchase-intention";

export interface RejectCreditApplicationResponse {
  success: boolean;
  message: string;
  status: "REJECTED";
  creditApplicationId: number;
}
