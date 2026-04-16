import { get, post, unwrapOrThrow } from "@/lib/axios";
import type { CreditApplicationBiometricsData } from "@/types/credit-application-form.types";
import { dataUrlToFile, SIMULATED_FINGERPRINT_DATA_URL } from "@/utils/creditApplicationIntake";
import type { CreditApplicationFormPayload } from "@/types/credit-application-form.types";

interface CreditApplicationCatalogItem {
  id: number | null;
  name: string;
}

interface CreditApplicationNeighborhood {
  code: string;
  fullCode?: string;
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
  payload: CreditApplicationBiometricsData
): Promise<CreateCreditApplicationFromIntakeResult> {
  const ineFront = payload.ineFrontImage?.trim();
  const ineBack = payload.ineBackImage?.trim();
  const faceCapture = payload.selfieImage?.trim();
  const signature = payload.signatureDataUrl?.trim();

  if (!ineFront || !ineBack || !faceCapture || !signature) {
    throw new Error("Faltan capturas obligatorias para crear la solicitud.");
  }

  const formData = new FormData();
  formData.append("ineFront", dataUrlToFile(ineFront, "ine-front"));
  formData.append("ineBack", dataUrlToFile(ineBack, "ine-back"));
  formData.append("faceCapture", dataUrlToFile(faceCapture, "face-capture"));
  formData.append(
    "fingerprint",
    dataUrlToFile(
      SIMULATED_FINGERPRINT_DATA_URL,
      "fingerprint",
    ),
  );
  formData.append(
    "bureauAuthorizationSignature",
    dataUrlToFile(signature, "bureau-authorization-signature"),
  );

  const result = await post<CreateCreditApplicationFromIntakeResult>(
    BASE,
    formData,
    {
      timeout: INTAKE_CREATE_TIMEOUT_MS,
      headers: { "Content-Type": "multipart/form-data" },
    },
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
