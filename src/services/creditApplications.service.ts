import { get, post, unwrapOrThrow } from "@/lib/axios";
import type { CreateCreditApplicationIntakeRequestBody } from "@/utils/creditApplicationIntake";
import type { CreditApplicationFormPayload } from "@/types/credit-application-form.types";

interface CreditApplicationCatalogItem {
  id: number | null;
  name: string;
}

interface CreditApplicationNeighborhood {
  code: string;
  name: string;
  state: string;
  municipality: string;
}

interface CreditApplicationPersonalInformationResponse {
  name: string;
  lastName: string;
  secondLastName: string;
  birthDate: string;
  curp: string;
  rfc: string;
  phoneNumber: string;
  email: string;
  maritalStatus: CreditApplicationCatalogItem;
}

interface CreditApplicationFamilyResponse {
  hasSpouse: boolean;
  spouseName: string | null;
  spousePhone: string | null;
  economicDependents: number;
}

interface CreditApplicationAddressResponse {
  id: number;
  postalCode: string;
  street: string;
  externalNumber: string;
  internalNumber: string;
  neighborhood: CreditApplicationNeighborhood;
  betweenStreets: string;
  latitude: string;
  longitude: string;
  receiverName: string;
  receiverPhone: string;
  useClientPhone: boolean;
  housingType: CreditApplicationCatalogItem;
  previousAddress: string;
  previousAddressDuration: string;
}

interface CreditApplicationEmploymentResponse {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  position: string;
  department: string;
  seniorityYears: number;
  monthlyIncome: number;
  hasOtherIncome: boolean;
  otherIncomeAmount: number;
  otherIncomeDescription: string;
}

interface CreditApplicationWorkReferencesResponse {
  companyName: string;
  companyPhone: string;
  applicantPosition: string;
  seniorityYears: number;
  answeredBy: string;
  answeredByPosition: string;
}

interface CreditApplicationFamilyReferenceResponse {
  firstName: string;
  lastName: string;
  relationship: CreditApplicationCatalogItem;
  address: string;
  phone: string;
}

export interface CreditApplicationDetailResponse {
  personalInformation: CreditApplicationPersonalInformationResponse;
  family: CreditApplicationFamilyResponse;
  address: CreditApplicationAddressResponse;
  employment: CreditApplicationEmploymentResponse;
  workReferences: CreditApplicationWorkReferencesResponse;
  familyReferences: CreditApplicationFamilyReferenceResponse[];
}

const BASE = "/credit-applications";

const INTAKE_CREATE_TIMEOUT_MS = 120_000;

export interface CreateCreditApplicationFromIntakeResult {
  id: number;
  folio: string;
  message: string;
}

export async function createCreditApplicationFromIntake(
  body: CreateCreditApplicationIntakeRequestBody
): Promise<CreateCreditApplicationFromIntakeResult> {
  const result = await post<CreateCreditApplicationFromIntakeResult>(
    BASE,
    body,
    { timeout: INTAKE_CREATE_TIMEOUT_MS }
  );
  return unwrapOrThrow(result);
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getCreditApplicationById(
  applicationId: string
): Promise<CreditApplicationDetailResponse> {
  const result = await get<CreditApplicationDetailResponse>(`${BASE}/${applicationId}`);
  return unwrapOrThrow(result);
}

export async function validateSecurityCode(code: string): Promise<boolean> {
  await wait(450);
  return code.trim().length >= 6;
}

export async function saveCreditApplication(payload: CreditApplicationFormPayload): Promise<{ id: string }> {
  await wait(800);
  if (payload.id) {
    return { id: payload.id };
  }
  return { id: `new-${Date.now()}` };
}
