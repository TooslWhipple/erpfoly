import { get, patch, post, unwrapOrThrow } from "@/lib/axios";
import type { CreditApplicationBiometricsData } from "@/types/credit-application-form.types";
import { dataUrlToFile, SIMULATED_FINGERPRINT_DATA_URL } from "@/utils/creditApplicationIntake";
import type {
  CreditApplicationFormPayload,
  FamilyReference,
} from "@/types/credit-application-form.types";

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

interface CreditApplicationDocumentItemResponse {
  id: number;
  typeCode: string;
  typeName: string;
  filePath: string;
  fileUrl: string;
}

interface CreditApplicationDocumentationResponse {
  incomeProofFiles: CreditApplicationDocumentItemResponse[];
  ineFrontFiles: CreditApplicationDocumentItemResponse[];
  ineBackFiles: CreditApplicationDocumentItemResponse[];
  guarantorIneFrontFiles: CreditApplicationDocumentItemResponse[];
  guarantorIneBackFiles: CreditApplicationDocumentItemResponse[];
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

export interface CreditApplicationDetailResponse {
  personalInformation: CreditApplicationPersonalInformationResponse;
  family: CreditApplicationFamilyResponse;
  address: CreditApplicationAddressResponse;
  employment: CreditApplicationEmploymentResponse;
  workReferences: CreditApplicationWorkReferencesResponse;
  familyReferences: CreditApplicationFamilyReferenceResponse[];
  documentation?: CreditApplicationDocumentationResponse;
  guarantor?: CreditApplicationGuarantorResponse;
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
  | "GUARANTOR_INE_FRONT"
  | "GUARANTOR_INE_BACK";

function parseStreetAddress(value: string): {
  street: string;
  externalNumber: string;
  internalNumber: string;
} {
  const normalized = value.trim().replace(/\s+/g, " ");
  if (!normalized) {
    return { street: "", externalNumber: "", internalNumber: "" };
  }

  const tokens = normalized.split(" ");
  const lastToken = tokens[tokens.length - 1] ?? "";
  const hasNumericLastToken = /\d/.test(lastToken);
  if (!hasNumericLastToken) {
    return { street: normalized, externalNumber: "", internalNumber: "" };
  }

  const street = tokens.slice(0, -1).join(" ").trim();
  const internalMatch = lastToken.match(/^(.+?)[-/](.+)$/);
  if (!internalMatch) {
    return { street, externalNumber: lastToken, internalNumber: "" };
  }

  return {
    street,
    externalNumber: internalMatch[1] ?? "",
    internalNumber: internalMatch[2] ?? "",
  };
}

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
  return references.map((reference) => {
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
      const parsed = parseStreetAddress(payload.address.streetAndNumber);
      const housingTypeId = Number.parseInt(payload.address.housingType, 10);
      return {
        address: {
          postalCode: payload.address.postalCode.trim(),
          neighborhoodFullCode: payload.address.neighborhoodFullCode.trim(),
          state: payload.address.state.trim(),
          city: payload.address.city.trim(),
          street: parsed.street,
          externalNumber: parsed.externalNumber,
          internalNumber: parsed.internalNumber,
          betweenStreets: payload.address.betweenStreets.trim(),
          receiverPhone: payload.address.receiverPhone.trim(),
          receiverName: payload.address.receiverName.trim(),
          useClientPhone: payload.address.useClientPhone,
          housingTypeId: Number.isFinite(housingTypeId) ? housingTypeId : null,
          residenceTime: payload.address.residenceTime.trim(),
          previousAddress: payload.address.previousAddress.trim(),
          previousResidenceTime: payload.address.previousResidenceTime.trim(),
        },
      };
    }
    case "employment": {
      const applicantAddress = parseStreetAddress(payload.employment.streetAndNumber);
      const spouseAddress = parseStreetAddress(payload.employment.spouseStreetAndNumber);
      return {
        employment: {
          applicant: {
            company: payload.employment.company.trim(),
            postalCode: payload.employment.postalCode.trim(),
            neighborhoodFullCode: payload.employment.neighborhoodFullCode.trim(),
            state: payload.employment.state.trim(),
            city: payload.employment.city.trim(),
            street: applicantAddress.street,
            externalNumber: applicantAddress.externalNumber,
            internalNumber: applicantAddress.internalNumber,
            seniorityYears: payload.employment.seniorityYears.trim(),
            position: payload.employment.position.trim(),
            department: payload.employment.department.trim(),
            monthlyIncome: payload.employment.monthlyIncome.trim(),
            companyPhone: payload.employment.companyPhone.trim(),
            hasOtherIncome: payload.employment.hasOtherIncome,
            otherIncomeAmount: payload.employment.otherIncomeAmount.trim(),
            otherIncomeSource: payload.employment.otherIncomeSource.trim(),
          },
          spouse: {
            company: payload.employment.spouseCompany.trim(),
            postalCode: payload.employment.spousePostalCode.trim(),
            neighborhoodFullCode: payload.employment.spouseNeighborhoodFullCode.trim(),
            state: payload.employment.spouseState.trim(),
            city: payload.employment.spouseCity.trim(),
            street: spouseAddress.street,
            externalNumber: spouseAddress.externalNumber,
            internalNumber: spouseAddress.internalNumber,
            seniorityYears: payload.employment.spouseSeniorityYears.trim(),
            position: payload.employment.spousePosition.trim(),
            department: payload.employment.spouseDepartment.trim(),
            monthlyIncome: payload.employment.spouseMonthlyIncome.trim(),
            companyPhone: payload.employment.spouseCompanyPhone.trim(),
          },
        },
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
          ineFrontFiles: payload.documentation.ineFrontFiles,
          ineBackFiles: payload.documentation.ineBackFiles,
        },
      };
    case "guarantor": {
      const parsed = parseStreetAddress(payload.guarantor.streetAndNumber);
      const maritalStatusId = Number.parseInt(payload.guarantor.maritalStatus, 10);
      return {
        guarantor: {
          fullName: payload.guarantor.fullName.trim(),
          postalCode: payload.guarantor.postalCode.trim(),
          neighborhoodFullCode: payload.guarantor.neighborhoodFullCode.trim(),
          state: payload.guarantor.state.trim(),
          city: payload.guarantor.city.trim(),
          street: parsed.street,
          externalNumber: parsed.externalNumber,
          internalNumber: parsed.internalNumber,
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
): Promise<UploadDocumentResponse> {
  const formData = new FormData();
  formData.append("file", file);
  const result = await post<UploadDocumentResponse>(
    `${BASE}/${applicationId}/upload?type=${encodeURIComponent(type)}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return unwrapOrThrow(result);
}

async function ensureDocumentFilesUploaded(
  applicationId: string,
  files: Array<{ id: string; name: string; file?: File; filePath?: string; url?: string }>,
  type: CreditApplicationDocumentTypeCode
) {
  const resolved = [];
  for (const item of files) {
    if (item.file) {
      const uploaded = await uploadCreditApplicationFile(applicationId, type, item.file);
      resolved.push({
        id: item.id,
        name: item.name,
        filePath: uploaded.filePath,
      });
      continue;
    }
    const existingPath = item.filePath?.trim();
    if (existingPath) {
      resolved.push({
        id: item.id,
        name: item.name,
        filePath: existingPath,
      });
    }
  }
  return resolved;
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
  const applicationId = payload.id?.trim();
  if (!applicationId) {
    await wait(800);
    return { id: `new-${Date.now()}` };
  }

  const sections: Array<keyof Omit<CreditApplicationFormPayload, "id" | "biometrics">> = [
    "basicInformation",
    "family",
    "address",
    "employment",
    "references",
    "documentation",
    "guarantor",
  ];

  for (const section of sections) {
    await saveCreditApplicationSection(applicationId, section, payload);
  }

  return { id: applicationId };
}

export async function saveCreditApplicationSection(
  applicationId: string,
  section: keyof Omit<CreditApplicationFormPayload, "id" | "biometrics">,
  payload: CreditApplicationFormPayload
): Promise<SaveSectionResponse> {
  if (section === "documentation") {
    payload.documentation = {
      ...payload.documentation,
      incomeProofFiles: await ensureDocumentFilesUploaded(
        applicationId,
        payload.documentation.incomeProofFiles,
        "INCOME_PROOF"
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

  const requestPayload = buildSectionPayload(section, payload);
  const result = await patch<SaveSectionResponse>(`${BASE}/${applicationId}`, requestPayload);
  return unwrapOrThrow(result);
}
