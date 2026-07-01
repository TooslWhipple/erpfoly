import { get, patch, post } from "@/lib/axios";
import type { ApiSuccessPayload } from "@/lib/axios";
import type { PaginatedRowsResponse } from "@/lib/axios";
import { buildListUrl } from "@/lib/apiHelpers";
import type { CreditApplicationBiometricsData } from "@/types/credit-application-form.types";
import { dataUrlToFile, SIMULATED_FINGERPRINT_DATA_URL } from "@/utils/creditApplicationIntake";
import { sanitizeFormValues } from "@/utils/sanitizeInput";
import type {
  CreditApplicationFormPayload,
  FamilyReference,
} from "@/types/credit-application-form.types";
import type {
  RejectCreditApplicationResponse,
} from "@/types/solicitud-credito-detail.types";

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

interface CreditApplicationBasicInformationResponse {
  name: string;
  lastName: string;
  secondLastName: string;
  birthDate: string;
  curp: string;
  rfc: string;
  phoneNumber: string;
  phoneVerifiedAt?: string | null;
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
  housingType: CreditApplicationCatalogItem;
  residenceTime: string;
  previousAddress: string;
  previousAddressDuration: string;
}

interface CreditApplicationEmploymentPersonResponse {
  companyName: string;
  postalCode: string;
  neighborhoodFullCode: string;
  state: string;
  city: string;
  street: string;
  externalNumber: string;
  internalNumber: string;
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

interface CreditApplicationEmploymentResponse {
  applicant: CreditApplicationEmploymentPersonResponse;
  spouse: CreditApplicationEmploymentPersonResponse;
}

interface CreditApplicationReferencesResponse {
  work: {
    companyName: string;
    companyPhone: string;
    applicantPosition: string;
    seniorityYears: number;
    answeredBy: string;
    answeredByPosition: string;
  };
  family: Array<{
    firstName: string;
    lastName: string;
    relationship: CreditApplicationCatalogItem;
    address: string;
    phone: string;
  }>;
}

interface CreditApplicationDocumentItemResponse {
  id: number;
  typeCode: string;
  typeName: string;
  filePath: string;
  fileUrl: string;
}

interface CreditApplicationDocumentationResponse {
  incomeProofFiles: CreditApplicationDocumentItemResponse[];
  employmentProofLetterFiles: CreditApplicationDocumentItemResponse[];
  ineFrontFiles: CreditApplicationDocumentItemResponse[];
  ineBackFiles: CreditApplicationDocumentItemResponse[];
  guarantorIneFrontFiles: CreditApplicationDocumentItemResponse[];
  guarantorIneBackFiles: CreditApplicationDocumentItemResponse[];
  bureauAuthorizationSignatureFiles?: CreditApplicationDocumentItemResponse[];
  faceCaptureFiles?: CreditApplicationDocumentItemResponse[];
  fingerprintFiles?: CreditApplicationDocumentItemResponse[];
}

interface CreditApplicationGuarantorResponse {
  fullName: string;
  birthDate: string;
  curp: string;
  rfc: string;
  phone: string;
  hasSpouse: boolean;
  maritalStatus: CreditApplicationCatalogItem;
  address: {
    postalCode: string;
    street: string;
    externalNumber: string;
    internalNumber: string;
    neighborhoodFullCode: string;
    state: string;
    city: string;
    betweenStreets: string;
    previousAddress: string;
    previousResidenceTime: string;
  };
}

export interface AdditionalInformationCatalogItem {
  code: string;
  name: string;
  description: string | null;
  requestKind: "file_upload" | "form";
}

export interface AdditionalInformationRequestedItem {
  code: string;
  name: string;
  description: string | null;
  requestFlag: boolean;
  requestedAt: string;
}

interface AdditionalInformationCatalogApiItem {
  code?: unknown;
  name?: unknown;
  description?: unknown;
  helperText?: unknown;
  requestKind?: unknown;
  kind?: unknown;
  type?: unknown;
}

export interface CreditApplicationDetailResponse {
  id: number;
  status: string;
  approvalSummary?: {
    clientId: number | null;
    baseCreditLineAmount: number | null;
  };
  basicInformation: CreditApplicationBasicInformationResponse;
  family: CreditApplicationFamilyResponse;
  address: CreditApplicationAddressResponse;
  employment: CreditApplicationEmploymentResponse;
  references: CreditApplicationReferencesResponse;
  documentation?: CreditApplicationDocumentationResponse;
  guarantor?: CreditApplicationGuarantorResponse;
  additionalInformationRequested?: AdditionalInformationRequestedItem[];
}

export interface IdentityConflictsResult {
  hasExistingClient: boolean;
  hasExistingApplication: boolean;
}

export interface CreditApplicationApprovalOptionsResponse {
  creditApplicationId: number;
  minApprovedAmount: number;
  suggestedApprovedAmount: number;
  maxApprovedAmount: number;
  interestRate: number;
}

export interface ApproveCreditApplicationRequest {
  approvedAmount: number;
  interestRate: number;
  comments?: string;
}

export interface ApproveCreditApplicationResponse {
  success: boolean;
  message: string;
  status: "APPROVED";
  creditApplicationId: number;
  clientId: number;
}

export interface CreditApplicationOtpStateResponse {
  verified: boolean;
  canSend: boolean;
  cooldownUntil: string | null;
  expiresAt: string | null;
  attemptsLeft: number;
  message: string;
}

const BASE = "/credit-applications";

const INTAKE_CREATE_TIMEOUT_MS = 120_000;

export interface CreateCreditApplicationFromIntakeResult {
  id: number;
  folio: string;
  message: string;
}

type SaveSectionRequest = {
  basicInformation?: Record<string, unknown>;
  family?: Record<string, unknown>;
  address?: Record<string, unknown>;
  employment?: Record<string, unknown>;
  references?: Record<string, unknown>;
  documentation?: Record<string, unknown>;
  guarantor?: Record<string, unknown>;
};

type SaveSectionResponse = {
  success: boolean;
  message: string;
};

type SubmitCreditApplicationResponse = {
  success: boolean;
  message: string;
  status: string;
  creditApplicationId: number;
};

type UploadDocumentResponse = {
  success: boolean;
  message: string;
  documentId: number;
  filePath: string;
  fileUrl: string;
  documentTypeCode: string;
};

type CreditApplicationDocumentTypeCode =
  | "INE_FRONT"
  | "INE_BACK"
  | "FACE_CAPTURE"
  | "BUREAU_AUTHORIZATION_SIGNATURE"
  | "FINGERPRINT"
  | "INCOME_PROOF"
  | "EMPLOYMENT_PROOF_LETTER"
  | "GUARANTOR_INE_FRONT"
  | "GUARANTOR_INE_BACK";

function splitReferenceName(value: string): { firstName: string; lastName: string } {
  const normalized = value.trim().replace(/\s+/g, " ");
  if (!normalized) {
    return { firstName: "", lastName: "" };
  }

  const parts = normalized.split(" ");
  if (parts.length === 1) {
    return { firstName: normalized, lastName: "" };
  }

  return {
    firstName: parts.slice(0, -1).join(" "),
    lastName: parts[parts.length - 1] ?? "",
  };
}

function mapFamilyReferences(references: FamilyReference[]) {
  return references
    .filter(
      (reference) =>
        reference.name.trim().length > 0 &&
        reference.relationshipId.trim().length > 0 &&
        reference.address.trim().length > 0 &&
        reference.phone.trim().length > 0
    )
    .map((reference) => {
      const { firstName, lastName } = splitReferenceName(reference.name);
      const relationshipId = Number.parseInt(reference.relationshipId, 10);
      return {
        firstName,
        lastName,
        relationshipId: Number.isFinite(relationshipId) ? relationshipId : null,
        address: reference.address.trim(),
        phone: reference.phone.trim(),
      };
    });
}

function buildSectionPayload(
  section: keyof Omit<CreditApplicationFormPayload, "id" | "biometrics">,
  payload: CreditApplicationFormPayload
): SaveSectionRequest {
  switch (section) {
    case "basicInformation": {
      const maritalStatusId = Number.parseInt(payload.basicInformation.maritalStatus, 10);
      return {
        basicInformation: {
          firstName: payload.basicInformation.firstName.trim(),
          lastName: payload.basicInformation.lastName.trim(),
          secondLastName: payload.basicInformation.secondLastName.trim(),
          birthDate: payload.basicInformation.birthDate.trim(),
          maritalStatusId: Number.isFinite(maritalStatusId) ? maritalStatusId : null,
          curp: payload.basicInformation.curp.trim(),
          rfc: payload.basicInformation.rfc.trim(),
          email: payload.basicInformation.email.trim(),
          whatsappNumber: payload.basicInformation.whatsappNumber.trim(),
        },
      };
    }
    case "family":
      return {
        family: {
          hasSpouse: payload.family.hasSpouse,
          spouseName: payload.family.spouseName.trim(),
          spousePhone: payload.family.spousePhone.trim(),
          dependentsCount: payload.family.dependentsCount,
        },
      };
    case "address": {
      const housingTypeId = Number.parseInt(payload.address.housingType, 10);
      return {
        address: {
          postalCode: payload.address.postalCode.trim(),
          neighborhoodFullCode: payload.address.neighborhoodFullCode.trim(),
          state: payload.address.state.trim(),
          city: payload.address.city.trim(),
          street: payload.address.street.trim(),
          externalNumber: payload.address.externalNumber.trim(),
          internalNumber: payload.address.internalNumber.trim(),
          betweenStreets: payload.address.betweenStreets.trim(),
          housingTypeId: Number.isFinite(housingTypeId) ? housingTypeId : null,
          residenceTime: payload.address.residenceTime.trim(),
          previousAddress: payload.address.previousAddress.trim(),
          previousResidenceTime: payload.address.previousResidenceTime.trim(),
        },
      };
    }
    case "employment": {
      const employmentSection: {
        spouseHasEmployment: boolean;
        applicant: Record<string, unknown>;
        spouse?: Record<string, unknown>;
      } = {
        spouseHasEmployment: payload.employment.spouseHasEmployment,
        applicant: {
          company: payload.employment.company.trim(),
          postalCode: payload.employment.postalCode.trim(),
          neighborhoodFullCode: payload.employment.neighborhoodFullCode.trim(),
          state: payload.employment.state.trim(),
          city: payload.employment.city.trim(),
          street: payload.employment.street.trim(),
          externalNumber: payload.employment.externalNumber.trim(),
          internalNumber: payload.employment.internalNumber.trim(),
          seniorityYears: payload.employment.seniorityYears.trim(),
          position: payload.employment.position.trim(),
          department: payload.employment.department.trim(),
          monthlyIncome: payload.employment.monthlyIncome.trim(),
          companyPhone: payload.employment.companyPhone.trim(),
          hasOtherIncome: payload.employment.hasOtherIncome,
          otherIncomeAmount: payload.employment.otherIncomeAmount.trim(),
          otherIncomeSource: payload.employment.otherIncomeSource.trim(),
        },
      };

      if (payload.employment.spouseHasEmployment) {
        employmentSection.spouse = {
          company: payload.employment.spouseCompany.trim(),
          postalCode: payload.employment.spousePostalCode.trim(),
          neighborhoodFullCode: payload.employment.spouseNeighborhoodFullCode.trim(),
          state: payload.employment.spouseState.trim(),
          city: payload.employment.spouseCity.trim(),
          street: payload.employment.spouseStreet.trim(),
          externalNumber: payload.employment.spouseExternalNumber.trim(),
          internalNumber: payload.employment.spouseInternalNumber.trim(),
          seniorityYears: payload.employment.spouseSeniorityYears.trim(),
          position: payload.employment.spousePosition.trim(),
          department: payload.employment.spouseDepartment.trim(),
          monthlyIncome: payload.employment.spouseMonthlyIncome.trim(),
          companyPhone: payload.employment.spouseCompanyPhone.trim(),
        };
      }

      return {
        employment: employmentSection,
      };
    }
    case "references":
      return {
        references: {
          workReference: {
            company: payload.references.company.trim(),
            phone: payload.references.phone.trim(),
            clientPosition: payload.references.clientPosition.trim(),
            seniorityYears: payload.references.seniorityYears.trim(),
            respondentNameAndPosition: payload.references.respondentNameAndPosition.trim(),
          },
          familyReferences: mapFamilyReferences(payload.references.familyReferences),
        },
      };
    case "documentation":
      return {
        documentation: {
          incomeProofFiles: payload.documentation.incomeProofFiles,
          employmentProofLetterFiles: payload.documentation.employmentProofLetterFiles,
          ineFrontFiles: payload.documentation.ineFrontFiles,
          ineBackFiles: payload.documentation.ineBackFiles,
        },
      };
    case "guarantor": {
      const maritalStatusId = Number.parseInt(payload.guarantor.maritalStatus, 10);
      return {
        guarantor: {
          fullName: payload.guarantor.fullName.trim(),
          postalCode: payload.guarantor.postalCode.trim(),
          neighborhoodFullCode: payload.guarantor.neighborhoodFullCode.trim(),
          state: payload.guarantor.state.trim(),
          city: payload.guarantor.city.trim(),
          street: payload.guarantor.street.trim(),
          externalNumber: payload.guarantor.externalNumber.trim(),
          internalNumber: payload.guarantor.internalNumber.trim(),
          betweenStreets: payload.guarantor.betweenStreets.trim(),
          birthDate: payload.guarantor.birthDate.trim(),
          maritalStatusId: Number.isFinite(maritalStatusId) ? maritalStatusId : null,
          curp: payload.guarantor.curp.trim(),
          rfc: payload.guarantor.rfc.trim(),
          phone: payload.guarantor.phone.trim(),
          hasSpouse: payload.guarantor.hasSpouse,
          identificationFrontFiles: payload.guarantor.identificationFrontFiles,
          identificationBackFiles: payload.guarantor.identificationBackFiles,
        },
      };
    }
  }
}

async function uploadCreditApplicationFile(
  applicationId: string,
  type: CreditApplicationDocumentTypeCode,
  file: File
): Promise<UploadDocumentResponse | null> {
  const formData = new FormData();
  formData.append("file", file);
  const result = await post<UploadDocumentResponse>(
    `${BASE}/${applicationId}/upload?type=${encodeURIComponent(type)}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      skipGlobalErrorToast: true,
    }
  );
  if (result.error) return null;
  return result.data;
}

async function ensureDocumentFilesUploaded(
  applicationId: string,
  files: Array<{ id: string; name: string; file?: File; filePath?: string; url?: string; uploadedAt?: string }>,
  type: CreditApplicationDocumentTypeCode
) {
  const resolved = [];
  for (const item of files) {
    if (item.file) {
      const uploaded = await uploadCreditApplicationFile(applicationId, type, item.file);
      if (!uploaded) continue;
      resolved.push({
        id: String(uploaded.documentId ?? item.id),
        name: item.name,
        filePath: uploaded.filePath,
        url: uploaded.fileUrl,
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

export async function createCreditApplicationFromIntake(
  payload: CreditApplicationBiometricsData
): Promise<CreateCreditApplicationFromIntakeResult | null> {
  const ineFront = payload.ineFrontImage?.trim();
  const ineBack = payload.ineBackImage?.trim();
  const faceCapture = payload.selfieImage?.trim();
  const signature = payload.signatureDataUrl?.trim();

  if (!ineFront || !ineBack || !faceCapture || !signature) {
    throw new Error("Faltan capturas obligatorias para crear la solicitud. Asegúrate de completar la captura biométrica antes de continuar.");
  }

  const formData = new FormData();
  const ineExecutionId = payload.ineExecutionId?.trim();
  if (ineExecutionId) {
    formData.append("ineExecutionId", ineExecutionId);
  }
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
      skipGlobalErrorToast: true,
    },
  );
  if (result.error) return null;
  return result.data;
}

export async function getCreditApplicationById(
  applicationId: string
): Promise<CreditApplicationDetailResponse | null> {
  const result = await get<CreditApplicationDetailResponse>(`${BASE}/${applicationId}`, {
    skipGlobalErrorToast: true,
  });
  if (result.error) return null;
  return result.data;
}

export async function checkIdentityConflicts(
  identityValue: string,
  currentApplicationId?: string
): Promise<IdentityConflictsResult> {
  const normalizedIdentityValue = identityValue.trim();
  if (!normalizedIdentityValue) {
    return {
      hasExistingClient: false,
      hasExistingApplication: false,
    };
  }

  const [clientsResponse, applicationsResponse] = await Promise.all([
    get<PaginatedRowsResponse<{ id: number }>>(
      buildListUrl("/clients", {
        page: 1,
        limit: 1,
        search: normalizedIdentityValue,
      }),
      { skipGlobalErrorToast: true }
    ),
    get<PaginatedRowsResponse<{ id: number }>>(
      buildListUrl(BASE, {
        page: 1,
        limit: 5,
        search: normalizedIdentityValue,
      }),
      { skipGlobalErrorToast: true }
    ),
  ]);

  const clients = clientsResponse.data;
  const applications = applicationsResponse.data;
  if (!clients || !applications) {
    return {
      hasExistingClient: false,
      hasExistingApplication: false,
    };
  }
  const parsedCurrentApplicationId = Number.parseInt(currentApplicationId ?? "", 10);
  const hasCurrentApplicationId = Number.isFinite(parsedCurrentApplicationId);

  const hasExistingApplication = applications.rows.some(
    (application) => !hasCurrentApplicationId || application.id !== parsedCurrentApplicationId
  );

  return {
    hasExistingClient: clients.rows.length > 0,
    hasExistingApplication,
  };
}

export async function getAdditionalInformationCatalog(): Promise<AdditionalInformationCatalogItem[]> {
  const result = await get<AdditionalInformationCatalogApiItem[]>(`${BASE}/additional-information/catalog`, {
    skipGlobalErrorToast: true,
  });
  const catalogItems = result.data ?? [];

  return catalogItems.reduce<AdditionalInformationCatalogItem[]>((acc, item) => {
    const code = typeof item.code === "string" ? item.code.trim() : "";
    const name = typeof item.name === "string" ? item.name.trim() : "";
    const descriptionValue =
      typeof item.description === "string" ? item.description : typeof item.helperText === "string" ? item.helperText : null;
    const requestKindValue = item.requestKind ?? item.kind ?? item.type;
    const requestKind = requestKindValue === "form" ? "form" : "file_upload";

    if (!code || !name) {
      return acc;
    }

    acc.push({
      code,
      name,
      description: descriptionValue?.trim() || null,
      requestKind,
    });

    return acc;
  }, []);
}

export async function requestCreditApplicationAdditionalInformation(
  applicationId: string,
  codes: string[]
): Promise<ApiSuccessPayload | null> {
  const result = await post<ApiSuccessPayload>(`${BASE}/${applicationId}/additional-information`, { codes }, {
    skipGlobalErrorToast: true,
  });
  if (result.error) return null;
  return result.data;
}

export async function sendCreditApplicationOtp(
  applicationId: string,
  whatsappNumber: string,
): Promise<CreditApplicationOtpStateResponse> {
  const result = await post<CreditApplicationOtpStateResponse>(`${BASE}/${applicationId}/otp/send`, { whatsappNumber }, { skipGlobalErrorToast: true });
  if (result.error) {
    const e = new Error(result.error.message) as Error & { apiError?: { message: string } };
    e.apiError = { message: result.error.message };
    throw e;
  }
  if (!result.data) {
    const e = new Error("No se pudo enviar el OTP por WhatsApp") as Error & { apiError?: { message: string } };
    e.apiError = { message: "No se pudo enviar el OTP por WhatsApp" };
    throw e;
  }
  return result.data;
}

export async function verifyCreditApplicationOtp(
  applicationId: string,
  whatsappNumber: string,
  otpCode: string,
): Promise<CreditApplicationOtpStateResponse | null> {
  const result = await post<CreditApplicationOtpStateResponse>(
    `${BASE}/${applicationId}/otp/verify`,
    {
      whatsappNumber,
      otpCode,
    },
    { skipGlobalErrorToast: true },
  );
  if (result.error) return null;
  return result.data;
}

export async function saveCreditApplication(
  payload: CreditApplicationFormPayload,
  options?: {
    includeGuarantorSection?: boolean;
    sections?: Array<keyof Omit<CreditApplicationFormPayload, "id" | "biometrics">>;
  }
): Promise<{ id: string } | null> {
  const applicationId = payload.id?.trim();
  if (!applicationId) {
    return null;
  }

  const includeGuarantorSection = options?.includeGuarantorSection ?? true;
  const defaultSections: Array<keyof Omit<CreditApplicationFormPayload, "id" | "biometrics">> = [
    "basicInformation",
    "family",
    "address",
    "employment",
    "references",
    "documentation",
    ...(includeGuarantorSection ? ["guarantor" as const] : []),
  ];
  const sections = options?.sections ?? defaultSections;

  for (const section of sections) {
    const saved = await saveCreditApplicationSection(applicationId, section, payload);
    if (!saved) return null;
  }

  return { id: applicationId };
}

export async function saveCreditApplicationSection(
  applicationId: string,
  section: keyof Omit<CreditApplicationFormPayload, "id" | "biometrics">,
  payload: CreditApplicationFormPayload
): Promise<SaveSectionResponse | null> {
  if (section === "documentation") {
    payload.documentation = {
      ...payload.documentation,
      incomeProofFiles: await ensureDocumentFilesUploaded(
        applicationId,
        payload.documentation.incomeProofFiles,
        "INCOME_PROOF"
      ),
      employmentProofLetterFiles: await ensureDocumentFilesUploaded(
        applicationId,
        payload.documentation.employmentProofLetterFiles,
        "EMPLOYMENT_PROOF_LETTER"
      ),
      ineFrontFiles: await ensureDocumentFilesUploaded(
        applicationId,
        payload.documentation.ineFrontFiles,
        "INE_FRONT"
      ),
      ineBackFiles: await ensureDocumentFilesUploaded(
        applicationId,
        payload.documentation.ineBackFiles,
        "INE_BACK"
      ),
    };
  }

  if (section === "guarantor") {
    payload.guarantor = {
      ...payload.guarantor,
      identificationFrontFiles: await ensureDocumentFilesUploaded(
        applicationId,
        payload.guarantor.identificationFrontFiles,
        "GUARANTOR_INE_FRONT"
      ),
      identificationBackFiles: await ensureDocumentFilesUploaded(
        applicationId,
        payload.guarantor.identificationBackFiles,
        "GUARANTOR_INE_BACK"
      ),
    };
  }

  const requestPayload = sanitizeFormValues(buildSectionPayload(section, payload));
  const result = await patch<SaveSectionResponse>(`${BASE}/${applicationId}`, requestPayload, {
    skipGlobalErrorToast: true,
  });
  if (result.error) return null;
  return result.data;
}

export async function submitCreditApplicationForReview(
  applicationId: string
): Promise<SubmitCreditApplicationResponse | null> {
  const result = await patch<SubmitCreditApplicationResponse>(
    `${BASE}/${applicationId}/submit`,
    {},
    { skipGlobalErrorToast: true }
  );
  if (result.error) return null;
  return result.data;
}

export async function rejectCreditApplication(
  applicationId: string,
): Promise<RejectCreditApplicationResponse | null> {
  const result = await patch<RejectCreditApplicationResponse>(`${BASE}/${applicationId}/reject`, undefined, {
    skipGlobalErrorToast: true,
  });
  if (result.error) return null;
  return result.data;
}

export async function getCreditApplicationApprovalOptions(
  applicationId: string,
): Promise<CreditApplicationApprovalOptionsResponse | null> {
  const result = await get<CreditApplicationApprovalOptionsResponse>(
    `${BASE}/${applicationId}/approval-options`,
    { skipGlobalErrorToast: true },
  );
  if (result.error) return null;
  return result.data;
}

export async function approveCreditApplication(
  applicationId: string,
  payload: ApproveCreditApplicationRequest,
): Promise<ApproveCreditApplicationResponse | null> {
  const result = await patch<ApproveCreditApplicationResponse>(
    `${BASE}/${applicationId}/approve`,
    payload,
    { skipGlobalErrorToast: true },
  );
  if (result.error) return null;
  return result.data;
}
