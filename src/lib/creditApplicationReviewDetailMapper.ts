import type { CreditApplicationDetailResponse } from "@/services/creditApplications.service";
import type {
  BiometricItem,
  CreditApplicationDetail,
  DocumentItem,
} from "@/types/solicitud-credito-detail.types";

type DocumentFileApiItem = {
  id: number;
  typeCode: string;
  typeName: string;
  filePath: string;
  fileUrl: string;
};

/** Names used when rendering requested documents in the review screen. */
const REQUESTED_DOCUMENT_LABELS: Record<string, string> = {
  INCOME_PROOF: "Comprobante de ingresos",
  EMPLOYMENT_PROOF_LETTER: "Carta de comprobante laboral",
  GUARANTOR_INE_FRONT: "INE del aval (frente)",
  GUARANTOR_INE_BACK: "INE del aval (reverso)",
};

function toDocumentItems(
  files: DocumentFileApiItem[] | undefined,
  fallbackName: string,
  verifiedBy: string,
): DocumentItem[] {
  if (!files?.length) {
    return [];
  }
  return files.map((file, index) => ({
    id: `${file.typeCode}-${file.id}`,
    name: files.length > 1 ? `${fallbackName} (${index + 1})` : fallbackName,
    verifiedBy,
    thumbnailUrl: file.fileUrl,
    fullImageUrl: file.fileUrl,
  }));
}

/** Detail API does not return credit line bounds; used only for approval modal UI until backend exposes them. */
const DEFAULT_CREDIT_LINE_BOUNDS = {
  minCreditLine: 7000,
  suggestedCreditLine: 9000,
  maxCreditLine: 20000,
} as const;

function buildStreetAndNumber(address: CreditApplicationDetailResponse["address"]): string {
  return [
    address.street,
    address.externalNumber,
    address.internalNumber ? `Int. ${address.internalNumber}` : "",
  ]
    .filter((value) => value.trim().length > 0)
    .join(" ")
    .trim();
}

function mapHousingTypeToOwnership(
  housingTypeName: string | null | undefined
): CreditApplicationDetail["address"]["housingOwnership"] {
  const normalized = housingTypeName?.trim().toLowerCase() ?? "";
  if (normalized.includes("prop")) return "own";
  if (normalized.includes("rent") || normalized.includes("alq")) return "rented";
  if (normalized.includes("pag")) return "paying";
  if (normalized.includes("fam")) return "relatives";
  return "own";
}

function formatMxCurrency(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function normalizeNeighborhood(
  neighborhood: CreditApplicationDetailResponse["address"]["neighborhood"] | undefined
): CreditApplicationDetail["address"]["neighborhood"] {
  return {
    code: neighborhood?.code ?? "",
    fullCode: neighborhood?.fullCode ?? "",
    name: neighborhood?.name ?? "",
    state: neighborhood?.state ?? "",
    municipality: neighborhood?.municipality ?? "",
  };
}

export function mapCreditApplicationDetailResponseToReviewDetail(
  applicationId: number,
  api: CreditApplicationDetailResponse
): CreditApplicationDetail {
  const { id, status, basicInformation, family, address, employment, references } = api;
  const neighborhood = normalizeNeighborhood(address.neighborhood);

  const baseIncome = employment.applicant.monthlyIncome ?? 0;
  const otherIncome = employment.applicant.hasOtherIncome ? (employment.applicant.otherIncomeAmount ?? 0) : 0;
  const totalIncome = baseIncome + otherIncome;

  const requestedCodes = new Set((api.additionalInformationRequested ?? [])
    .filter((item) => item.requestFlag)
    .map((item) => item.code.toUpperCase()),
  );
  const documentation = api.documentation;
  const verifiedByLabel = "Verificado por el sistema";

  const requestedDocuments: DocumentItem[] = [];
  if (requestedCodes.has("INCOME_PROOF")) {
    requestedDocuments.push(
      ...toDocumentItems(
        documentation?.incomeProofFiles,
        REQUESTED_DOCUMENT_LABELS.INCOME_PROOF,
        verifiedByLabel,
      ),
    );
  }
  if (requestedCodes.has("EMPLOYMENT_PROOF_LETTER")) {
    requestedDocuments.push(
      ...toDocumentItems(
        documentation?.employmentProofLetterFiles,
        REQUESTED_DOCUMENT_LABELS.EMPLOYMENT_PROOF_LETTER,
        verifiedByLabel,
      ),
    );
  }
  if (requestedCodes.has("GUARANTOR_INFORMATION")) {
    requestedDocuments.push(
      ...toDocumentItems(
        documentation?.guarantorIneFrontFiles,
        REQUESTED_DOCUMENT_LABELS.GUARANTOR_INE_FRONT,
        verifiedByLabel,
      ),
    );
    requestedDocuments.push(
      ...toDocumentItems(
        documentation?.guarantorIneBackFiles,
        REQUESTED_DOCUMENT_LABELS.GUARANTOR_INE_BACK,
        verifiedByLabel,
      ),
    );
  }

  const signatureFile = documentation?.bureauAuthorizationSignatureFiles?.[0];
  const faceCaptureFile = documentation?.faceCaptureFiles?.[0];
  const fingerprintFile = documentation?.fingerprintFiles?.[0];

  const biometricItems: BiometricItem[] = [];
 
  if (faceCaptureFile) {
    biometricItems.push({
      id: `FACE_CAPTURE-${faceCaptureFile.id}`,
      name: "Foto facial",
      verifiedBy: verifiedByLabel,
      thumbnailUrl: faceCaptureFile.fileUrl,
      type: "photo",
    });
  }
  
  if (fingerprintFile) {
    biometricItems.push({
      id: `FINGERPRINT-${fingerprintFile.id}`,
      name: "Huella dactilar",
      verifiedBy: verifiedByLabel,
      thumbnailUrl: fingerprintFile.fileUrl,
      type: "fingerprint",
    });
  }

  return {
    id: applicationId,
    status,
    riskScore: 0,
    riskLevel: "medium",
    basicInfo: {
      firstName: basicInformation.name ?? "",
      firstSurname: basicInformation.lastName ?? "",
      secondSurname: basicInformation.secondLastName ?? "",
      birthDate: basicInformation.birthDate ?? "",
      maritalStatus: basicInformation.maritalStatus?.name ?? "",
      curp: basicInformation.curp ?? "",
      rfc: basicInformation.rfc ?? "",
      email: basicInformation.email ?? "",
      whatsapp: basicInformation.phoneNumber ?? "",
      whatsappValidated: false,
    },
    address: {
      postalCode: address.postalCode ?? "",
      neighborhood,
      streetAndNumber: buildStreetAndNumber(address),
      betweenStreets: address.betweenStreets ?? "",
      deliveryPhone: address.receiverPhone ?? "",
      receiverName: address.receiverName ?? "",
      useClientPhone: Boolean(address.useClientPhone),
      housingOwnership: mapHousingTypeToOwnership(address.housingType?.name),
      timeAtAddress: address.residenceTime ?? "",
      previousAddress: address.previousAddress ?? "",
      previousTime: address.previousAddressDuration ?? "",
    },
    family: {
      hasSpouse: Boolean(family.hasSpouse),
      spouseName: family.spouseName ?? "",
      spousePhone: family.spousePhone ?? "",
      numberOfDependents: family.economicDependents ?? 0,
    },
    employment: {
      totalMonthlyIncome: `$${formatMxCurrency(totalIncome)}/mes`,
      hasOtherIncome: Boolean(employment.applicant.hasOtherIncome),
      applicant: {
        company: employment.applicant.companyName ?? "",
        postalCode: employment.applicant.postalCode ?? "",
        state: employment.applicant.state ?? "",
        city: employment.applicant.city ?? "",
        streetAndNumber: [
          employment.applicant.street,
          employment.applicant.externalNumber,
          employment.applicant.internalNumber ? `Int. ${employment.applicant.internalNumber}` : "",
        ]
          .filter((value) => value.trim().length > 0)
          .join(" ")
          .trim(),
        tenureYears: employment.applicant.seniorityYears ?? 0,
        position: employment.applicant.position ?? "",
        department: employment.applicant.department ?? "",
        monthlyIncome: formatMxCurrency(baseIncome),
        companyPhone: employment.applicant.companyPhone ?? "",
      },
    },
    references: {
      work: {
        company: references.work.companyName ?? "",
        phone: references.work.companyPhone ?? "",
        clientPosition: references.work.applicantPosition ?? "",
        tenureYears: references.work.seniorityYears ?? 0,
        contactNameAndPosition: [references.work.answeredBy, references.work.answeredByPosition]
          .filter((value) => value.trim().length > 0)
          .join(" - "),
      },
      family: references.family.map((reference) => ({
        name: [reference.firstName, reference.lastName].filter((value) => value.trim().length > 0).join(" "),
        relationship: reference.relationship?.name ?? "",
        address: reference.address ?? "",
        phone: reference.phone ?? "",
      })),
    },
    documentation: { documents: requestedDocuments },
    creditBureau: {
      clientAuthorized: false,
      scoreLabel: "—",
      scoreLevel: "fair",
      signatureUrl: signatureFile?.fileUrl,
    },
    biometrics: { items: biometricItems },
    purchaseIntention: { items: [], subtotal: 0, total: 0 },
    ...DEFAULT_CREDIT_LINE_BOUNDS,
  };
}
