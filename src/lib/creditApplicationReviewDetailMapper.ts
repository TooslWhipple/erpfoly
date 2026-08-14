import type { CreditApplicationDetailResponse } from "@/services/creditApplications.service";
import type {
  BiometricItem,
  CreditApplicationDetail,
  DocumentItem,
} from "@/types/solicitud-credito-detail.types";
import { formatDateOnly } from "@/utils/date";

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

function mapEmploymentInfo(
  employmentPerson: CreditApplicationDetailResponse["employment"]["applicant"],
  monthlyIncome: string,
): CreditApplicationDetail["employment"]["applicant"] {
  return {
    company: employmentPerson.companyName ?? "",
    postalCode: employmentPerson.postalCode ?? "",
    state: employmentPerson.state ?? "",
    city: employmentPerson.city ?? "",
    street: employmentPerson.street ?? "",
    externalNumber: employmentPerson.externalNumber ?? "",
    internalNumber: employmentPerson.internalNumber ?? "",
    tenureYears: employmentPerson.seniorityYears ?? 0,
    position: employmentPerson.position ?? "",
    department: employmentPerson.department ?? "",
    monthlyIncome,
    companyPhone: employmentPerson.companyPhone ?? "",
  };
}

function mapHousingTypeToOwnership(
  housingTypeName: string | null | undefined
): CreditApplicationDetail["address"]["housingOwnership"] {
  const normalized = housingTypeName?.trim().toLowerCase() ?? "";
  if (normalized.includes("prop")) return "own";
  if (normalized.includes("rent") || normalized.includes("alq")) return "rented";
  if (normalized.includes("pag")) return "paying";
  if (normalized.includes("fam")) return "relatives";
  return null;
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

  return {
    id: applicationId,
    status,
    approvedClientId: api.approvalSummary?.clientId ?? null,
    approvedBaseCreditLineAmount: api.approvalSummary?.baseCreditLineAmount ?? null,
    riskScore: 0,
    riskLevel: "medium",
    basicInfo: {
      firstName: basicInformation.name ?? "",
      firstSurname: basicInformation.lastName ?? "",
      secondSurname: basicInformation.secondLastName ?? "",
      birthDate: formatDateOnly(basicInformation.birthDate, "dateNumeric", {
        fallback: "",
      }),
      maritalStatus: basicInformation.maritalStatus?.name ?? "",
      curp: basicInformation.curp ?? "",
      rfc: basicInformation.rfc ?? "",
      email: basicInformation.email ?? "",
      whatsapp: basicInformation.phoneNumber ?? "",
      whatsappValidated: Boolean(basicInformation.phoneVerifiedAt),
    },
    address: {
      postalCode: address.postalCode ?? "",
      neighborhood,
      street: address.street ?? "",
      externalNumber: address.externalNumber ?? "",
      internalNumber: address.internalNumber ?? "",
      betweenStreets: address.betweenStreets ?? "",
      housingOwnership: mapHousingTypeToOwnership(address.housingType?.name),
      timeAtAddressValue: address.residenceTimeValue ?? null,
      timeAtAddressUnit: address.residenceTimeUnit ?? null,
      previousAddress: address.previousAddress ?? "",
      previousTimeValue: address.previousResidenceTimeValue ?? null,
      previousTimeUnit: address.previousResidenceTimeUnit ?? null,
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
      applicant: mapEmploymentInfo(employment.applicant, formatMxCurrency(baseIncome)),
    },
    references: {
      work: {
        company: references.work.companyName ?? "",
        phone: references.work.companyPhone ?? "",
        clientPosition: references.work.applicantPosition ?? "",
        tenureYears: references.work.seniorityYears ?? 0,
        contactNameAndPosition: references.work.answeredBy ?? "",
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
  };
}
