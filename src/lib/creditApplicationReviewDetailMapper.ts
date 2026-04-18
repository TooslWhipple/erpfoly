import type { CreditApplicationDetailResponse } from "@/services/creditApplications.service";
import type { CreditApplicationDetail } from "@/types/solicitud-credito-detail.types";

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

/**
 * Maps the credit application detail API payload (same as edit form) into the
 * read-only review layout model. Sections not returned by the API use empty or neutral placeholders.
 */
export function mapCreditApplicationDetailResponseToReviewDetail(
  applicationId: number,
  api: CreditApplicationDetailResponse
): CreditApplicationDetail {
  const { basicInformation, family, address, employment, references } = api;

  const baseIncome = employment.applicant.monthlyIncome ?? 0;
  const otherIncome = employment.applicant.hasOtherIncome ? (employment.applicant.otherIncomeAmount ?? 0) : 0;
  const totalIncome = baseIncome + otherIncome;

  return {
    id: applicationId,
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
      state: address.neighborhood.state ?? "",
      city: address.neighborhood.municipality ?? "",
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
      family: references.family.map((reference, index) => ({
        name: [reference.firstName, reference.lastName].filter((value) => value.trim().length > 0).join(" "),
        relationship: reference.relationship?.name ?? "",
        address: reference.address ?? "",
        phone: reference.phone ?? "",
      })),
    },
    documentation: { documents: [] },
    creditBureau: {
      clientAuthorized: false,
      scoreLabel: "—",
      scoreLevel: "fair",
    },
    biometrics: { items: [] },
    purchaseIntention: { items: [], subtotal: 0, total: 0 },
    ...DEFAULT_CREDIT_LINE_BOUNDS,
  };
}
