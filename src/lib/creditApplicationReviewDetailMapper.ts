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
  const { personalInformation, family, address, employment, workReferences, familyReferences } = api;

  const baseIncome = employment.monthlyIncome ?? 0;
  const otherIncome = employment.hasOtherIncome ? (employment.otherIncomeAmount ?? 0) : 0;
  const totalIncome = baseIncome + otherIncome;

  return {
    id: applicationId,
    riskScore: 0,
    riskLevel: "medium",
    basicInfo: {
      firstName: personalInformation.name ?? "",
      firstSurname: personalInformation.lastName ?? "",
      secondSurname: personalInformation.secondLastName ?? "",
      birthDate: personalInformation.birthDate ?? "",
      maritalStatus: personalInformation.maritalStatus?.name ?? "",
      curp: personalInformation.curp ?? "",
      rfc: personalInformation.rfc ?? "",
      email: personalInformation.email ?? "",
      whatsapp: personalInformation.phoneNumber ?? "",
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
      timeAtAddress: "",
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
      hasOtherIncome: Boolean(employment.hasOtherIncome),
      applicant: {
        company: employment.companyName ?? "",
        postalCode: "",
        state: "",
        city: "",
        streetAndNumber: employment.companyAddress ?? "",
        tenureYears: employment.seniorityYears ?? 0,
        position: employment.position ?? "",
        department: employment.department ?? "",
        monthlyIncome: formatMxCurrency(baseIncome),
        companyPhone: employment.companyPhone ?? "",
      },
    },
    references: {
      work: {
        company: workReferences.companyName ?? "",
        phone: workReferences.companyPhone ?? "",
        clientPosition: workReferences.applicantPosition ?? "",
        tenureYears: workReferences.seniorityYears ?? 0,
        contactNameAndPosition: [workReferences.answeredBy, workReferences.answeredByPosition]
          .filter((value) => value.trim().length > 0)
          .join(" - "),
      },
      family: familyReferences.map((reference, index) => ({
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
