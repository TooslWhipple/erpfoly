import type {
  SharedDelinquencyAddress,
  SharedDelinquencyBasicInformation,
} from "@/types/delinquency-shared-list.types";
import type { CreditApplicationDetail } from "@/types/solicitud-credito-detail.types";
import { formatDateOnly } from "@/utils/date";

function mapHousingTypeToOwnership(
  housingTypeName: string | null | undefined,
): CreditApplicationDetail["address"]["housingOwnership"] {
  const normalized = housingTypeName?.trim().toLowerCase() ?? "";
  if (normalized.includes("prop")) return "own";
  if (normalized.includes("rent") || normalized.includes("alq")) return "rented";
  if (normalized.includes("pag")) return "paying";
  if (normalized.includes("fam")) return "relatives";
  return null;
}

const EMPTY_DETAIL = {
  id: 0,
  status: "",
  approvedClientId: null,
  approvedBaseCreditLineAmount: null,
  riskScore: 0,
  riskLevel: "low" as const,
  family: {
    hasSpouse: false,
    spouseName: "",
    spousePhone: "",
    numberOfDependents: 0,
  },
  employment: {
    totalMonthlyIncome: "",
    applicant: {
      company: "",
      postalCode: "",
      state: "",
      city: "",
      street: "",
      externalNumber: "",
      internalNumber: "",
      tenureYears: 0,
      position: "",
      department: "",
      monthlyIncome: "",
      companyPhone: "",
    },
    hasOtherIncome: false,
  },
  references: {
    work: {
      company: "",
      phone: "",
      clientPosition: "",
      tenureYears: 0,
      contactNameAndPosition: "",
    },
    family: [],
  },
  documentation: {
    documents: [],
  },
  creditBureau: {
    clientAuthorized: false,
    queryStatus: "NOT_QUERIED" as const,
    score: null,
    scoreLabel: "",
    scoreLevel: "fair" as const,
    queriedAt: null,
    canQueryNow: false,
    missingFields: [],
  },
  biometrics: { items: [] },
  purchaseIntention: { items: [], subtotal: 0, total: 0 },
};

export function mapBasicInformationToReviewDetail(
  basicInformation: SharedDelinquencyBasicInformation,
): Pick<CreditApplicationDetail, "basicInfo"> {
  return {
    basicInfo: {
      firstName: basicInformation.firstName,
      firstSurname: basicInformation.firstSurname,
      secondSurname: basicInformation.secondSurname,
      birthDate: basicInformation.birthDate
        ? formatDateOnly(basicInformation.birthDate, "dateNumeric", {
            fallback: "",
          })
        : "",
      maritalStatus: basicInformation.maritalStatus,
      curp: basicInformation.curp,
      rfc: basicInformation.rfc,
      email: basicInformation.email,
      whatsapp: basicInformation.phone,
      whatsappValidated: basicInformation.phoneVerified,
    },
  };
}

export function mapAddressToReviewDetail(
  address: SharedDelinquencyAddress,
): Pick<CreditApplicationDetail, "address"> {
  return {
    address: {
      postalCode: address.postalCode,
      neighborhood: {
        code: "",
        fullCode: "",
        name: address.neighborhoodName,
        state: address.state,
        municipality: address.city,
      },
      street: address.street,
      externalNumber: address.externalNumber,
      internalNumber: address.internalNumber,
      betweenStreets: address.betweenStreets,
      housingOwnership: mapHousingTypeToOwnership(address.housingTypeName),
      timeAtAddressValue: address.residenceTimeValue,
      timeAtAddressUnit: address.residenceTimeUnit,
      previousAddress: address.previousAddress,
      previousTimeValue: address.previousResidenceTimeValue,
      previousTimeUnit: address.previousResidenceTimeUnit,
    },
  };
}

export function toCreditApplicationDetailForBasic(
  basicInformation: SharedDelinquencyBasicInformation,
): CreditApplicationDetail {
  return {
    ...EMPTY_DETAIL,
    ...mapBasicInformationToReviewDetail(basicInformation),
    address: mapAddressToReviewDetail({
      postalCode: "",
      neighborhoodName: "",
      state: "",
      city: "",
      street: "",
      externalNumber: "",
      internalNumber: "",
      betweenStreets: "",
      housingTypeName: "",
      residenceTimeValue: null,
      residenceTimeUnit: null,
      previousAddress: "",
      previousResidenceTimeValue: null,
      previousResidenceTimeUnit: null,
    }).address,
  } as CreditApplicationDetail;
}

export function toCreditApplicationDetailForAddress(
  address: SharedDelinquencyAddress,
): CreditApplicationDetail {
  return {
    ...EMPTY_DETAIL,
    ...mapAddressToReviewDetail(address),
    basicInfo: mapBasicInformationToReviewDetail({
      firstName: "",
      firstSurname: "",
      secondSurname: "",
      birthDate: null,
      maritalStatus: "",
      curp: "",
      rfc: "",
      email: "",
      phone: "",
      phoneVerified: false,
    }).basicInfo,
  } as CreditApplicationDetail;
}
