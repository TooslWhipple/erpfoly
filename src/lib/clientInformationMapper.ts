import type {
  AddressTabValues,
  BasicInformationFormValues,
  DocumentationTabValues,
  EmploymentTabValues,
  FamilyTabValues,
  ReferencesTabValues,
} from "@/types/credit-application-form.types";
import { toDateOnlyString } from "@/utils/date";

const VERIFIED_SECURITY_CODE_VALUE = "Verificado";

type CatalogItem = { id: number | null; name: string };

type DocumentFileApiItem = {
  id: number;
  typeCode: string;
  typeName: string;
  filePath: string;
  fileUrl: string;
};

function mapDocumentItems(
  list: DocumentFileApiItem[] | undefined
): DocumentationTabValues["ineFrontFiles"] {
  return (list ?? []).map((item) => {
    const fileNameFromPath = item.filePath
      .split("/")
      .pop()
      ?.split("?")[0]
      ?.trim();
    return {
      id: String(item.id),
      name: fileNameFromPath || item.typeName,
      filePath: item.filePath,
      url: item.fileUrl,
      uploadedAt: "Cargado",
    };
  });
}

export function mapClientBasicToFormValues(data: {
  name?: string;
  lastName?: string;
  secondLastName?: string;
  birthDate?: string | Date | null;
  curp?: string;
  rfc?: string;
  email?: string;
  phoneNumber?: string;
  phoneVerifiedAt?: string | Date | null;
  maritalStatus?: CatalogItem;
  isKycVerified?: boolean;
}): {
  basicInformation: BasicInformationFormValues;
  phoneIsVerified: boolean;
  isKycVerified: boolean;
} {
  // ponytail: existing on-file phone counts as verified for edit (same as cash /
  // credit-application when phoneVerifiedAt is set). Re-OTP only if number changes.
  const phoneNumber = (data.phoneNumber ?? "").trim();
  const phoneIsVerified = Boolean(data.phoneVerifiedAt) || phoneNumber.length > 0;

  return {
    basicInformation: {
      firstName: data.name ?? "",
      lastName: data.lastName ?? "",
      secondLastName: data.secondLastName ?? "",
      birthDate: toDateOnlyString(data.birthDate),
      maritalStatus:
        data.maritalStatus?.id != null ? String(data.maritalStatus.id) : "",
      curp: data.curp ?? "",
      rfc: data.rfc ?? "",
      email: data.email ?? "",
      whatsappNumber: phoneNumber,
      securityCode: phoneIsVerified ? VERIFIED_SECURITY_CODE_VALUE : "",
    },
    phoneIsVerified,
    isKycVerified: Boolean(data.isKycVerified),
  };
}

export function mapClientFamilyToFormValues(data: {
  hasSpouse?: boolean;
  spouseName?: string | null;
  spousePhone?: string | null;
  economicDependents?: number;
}): FamilyTabValues {
  return {
    hasSpouse: Boolean(data.hasSpouse),
    spouseName: data.spouseName ?? "",
    spousePhone: data.spousePhone ?? "",
    dependentsCount: data.economicDependents ?? 0,
  };
}

export function mapClientAddressToFormValues(data: {
  postalCode?: string;
  neighborhood?: {
    fullCode?: string;
    full_code?: string;
    state?: string;
    municipality?: string;
  };
  street?: string;
  externalNumber?: string;
  internalNumber?: string;
  betweenStreets?: string;
  housingType?: CatalogItem;
  residenceTimeValue?: number | null;
  residenceTimeUnit?: "months" | "years" | null;
  previousAddress?: string;
  previousResidenceTimeValue?: number | null;
  previousResidenceTimeUnit?: "months" | "years" | null;
}): AddressTabValues {
  const fullCode =
    data.neighborhood?.fullCode?.trim() ||
    data.neighborhood?.full_code?.trim() ||
    "";
  return {
    postalCode: data.postalCode ?? "",
    // Select uses "-1" as empty sentinel (PostalCodeSettlementFields).
    neighborhoodFullCode: fullCode || "-1",
    state: data.neighborhood?.state ?? "",
    city: data.neighborhood?.municipality ?? "",
    street: data.street ?? "",
    externalNumber: data.externalNumber ?? "",
    internalNumber: data.internalNumber ?? "",
    betweenStreets: data.betweenStreets ?? "",
    housingType:
      data.housingType?.id != null ? String(data.housingType.id) : "",
    residenceTimeValue:
      data.residenceTimeValue != null ? String(data.residenceTimeValue) : "",
    residenceTimeUnit: data.residenceTimeUnit ?? "",
    previousAddress: data.previousAddress ?? "",
    previousResidenceTimeValue:
      data.previousResidenceTimeValue != null
        ? String(data.previousResidenceTimeValue)
        : "",
    previousResidenceTimeUnit: data.previousResidenceTimeUnit ?? "",
  };
}

export function mapClientEmploymentToFormValues(data: {
  applicant?: Record<string, unknown>;
  spouse?: Record<string, unknown>;
}): EmploymentTabValues {
  const applicant = data.applicant ?? {};
  const spouse = data.spouse ?? {};
  const spouseHasEmployment = Boolean(
    String(spouse.companyName ?? "").trim() ||
      String(spouse.postalCode ?? "").trim() ||
      String(spouse.neighborhoodFullCode ?? "").trim() ||
      String(spouse.companyPhone ?? "").trim() ||
      String(spouse.street ?? "").trim() ||
      (Number(spouse.monthlyIncome) || 0) > 0
  );

  const applicantNeighborhood =
    String(applicant.neighborhoodFullCode ?? "").trim() || "-1";
  const spouseNeighborhood =
    String(spouse.neighborhoodFullCode ?? "").trim() || "-1";

  return {
    company: String(applicant.companyName ?? ""),
    postalCode: String(applicant.postalCode ?? ""),
    neighborhoodFullCode: applicantNeighborhood,
    state: String(applicant.state ?? ""),
    city: String(applicant.city ?? ""),
    street: String(applicant.street ?? ""),
    externalNumber: String(applicant.externalNumber ?? ""),
    internalNumber: String(applicant.internalNumber ?? ""),
    seniorityYears: String(applicant.seniorityYears ?? ""),
    position: String(applicant.position ?? ""),
    department: String(applicant.department ?? ""),
    monthlyIncome: String(applicant.monthlyIncome ?? ""),
    companyPhone: String(applicant.companyPhone ?? ""),
    hasOtherIncome: Boolean(applicant.hasOtherIncome),
    otherIncomeAmount: String(applicant.otherIncomeAmount ?? ""),
    otherIncomeSource: String(applicant.otherIncomeDescription ?? ""),
    spouseHasEmployment,
    spouseCompany: String(spouse.companyName ?? ""),
    spousePostalCode: String(spouse.postalCode ?? ""),
    spouseNeighborhoodFullCode: spouseNeighborhood,
    spouseState: String(spouse.state ?? ""),
    spouseCity: String(spouse.city ?? ""),
    spouseStreet: String(spouse.street ?? ""),
    spouseExternalNumber: String(spouse.externalNumber ?? ""),
    spouseInternalNumber: String(spouse.internalNumber ?? ""),
    spouseSeniorityYears: String(spouse.seniorityYears ?? ""),
    spousePosition: String(spouse.position ?? ""),
    spouseDepartment: String(spouse.department ?? ""),
    spouseMonthlyIncome: String(spouse.monthlyIncome ?? ""),
    spouseCompanyPhone: String(spouse.companyPhone ?? ""),
  };
}

export function mapClientReferencesToFormValues(data: {
  work?: {
    companyName?: string;
    companyPhone?: string;
    applicantPosition?: string;
    seniorityYears?: number;
    answeredBy?: string;
    answeredByPosition?: string;
  };
  family?: Array<{
    firstName?: string;
    lastName?: string;
    relationship?: CatalogItem;
    address?: string;
    phone?: string;
  }>;
}): ReferencesTabValues {
  const work = data.work ?? {};
  const answeredBy = [work.answeredBy, work.answeredByPosition]
    .filter((value) => (value ?? "").trim().length > 0)
    .join(" - ");

  return {
    company: work.companyName ?? "",
    phone: work.companyPhone ?? "",
    clientPosition: work.applicantPosition ?? "",
    seniorityYears: String(work.seniorityYears ?? ""),
    respondentNameAndPosition: answeredBy,
    familyReferences:
      (data.family ?? []).length > 0
        ? (data.family ?? []).map((reference, index) => ({
            id: `reference-${index + 1}`,
            name: [reference.firstName, reference.lastName]
              .filter((value) => (value ?? "").trim().length > 0)
              .join(" "),
            relationshipId:
              reference.relationship?.id != null
                ? String(reference.relationship.id)
                : "",
            address: reference.address ?? "",
            phone: reference.phone ?? "",
          }))
        : [
            {
              id: "reference-1",
              name: "",
              relationshipId: "",
              address: "",
              phone: "",
            },
          ],
  };
}

export function mapClientDocumentationToFormValues(data: {
  incomeProofFiles?: DocumentFileApiItem[];
  employmentProofLetterFiles?: DocumentFileApiItem[];
  ineFrontFiles?: DocumentFileApiItem[];
  ineBackFiles?: DocumentFileApiItem[];
  additionalInformationRequested?: Array<{
    code: string;
    requestFlag: boolean;
  }>;
}): {
  documentation: DocumentationTabValues;
  additionalInformationRequested: Array<{
    code: string;
    requestFlag: boolean;
  }>;
} {
  return {
    documentation: {
      requiredAlertVisible: true,
      requiredAlertMessage:
        "Agrega la documentación solicitada para continuar.",
      incomeProofFiles: mapDocumentItems(data.incomeProofFiles),
      employmentProofLetterFiles: mapDocumentItems(
        data.employmentProofLetterFiles
      ),
      ineFrontFiles: mapDocumentItems(data.ineFrontFiles),
      ineBackFiles: mapDocumentItems(data.ineBackFiles),
    },
    additionalInformationRequested: data.additionalInformationRequested ?? [],
  };
}
