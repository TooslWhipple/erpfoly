import { get, patch, post } from "@/lib/axios";
import type { ApiResult, ApiSuccessPayload, PaginatedRowsResponse } from "@/lib/axios";
import { buildListUrl } from "@/lib/apiHelpers";
import type {
  ClientCollectionActivity,
  ClientCollectionActivityType,
  ClientDetailHeader,
  ClientDeactivationReason,
  CreateClientCollectionActivityPayload,
  DeactivateClientPayload,
} from "@/types/clientes.types";
import type {
  CancelClientPurchasePayload,
  SaleCancelReason,
} from "@/types/cancelPurchase.types";
import type { ClientPurchaseDetailApi } from "@/types/clientPurchase.types";
import type { CreditApplicationFormPayload } from "@/types/credit-application-form.types";

export type ClientStatus = "active" | "inactive" | "blocked";

export type ClientCreditStatus = "ACTIVE" | "MOROSO";

export type ClientInformationSection =
  | "basic"
  | "family"
  | "address"
  | "employment"
  | "references"
  | "documentation";

export interface ClientAddressItem {
  id: number;
  /** Addresses.id — use this for SaleDelivery.address_id */
  addressId: number;
  addressType: string;
  isPrimary: boolean;
  street: string;
  externalNumber: string | null;
  internalNumber: string | null;
  postalCode: string | null;
  neighborhoodName: string;
  latitude?: string | null;
  longitude?: string | null;
}

export interface Client {
  id: number;
  firstName: string;
  lastSurname: string;
  secondSurname: string | null;
  fullName: string;
  phoneNumber: string | null;
  email: string | null;
  status: string | null;
  creditStatus: ClientCreditStatus | null;
  creditAvailable?: number | null;
  addresses: ClientAddressItem[];
  primaryAddressFormatted: string | null;
  rfc?: string | null;
  businessName?: string | null;
  taxRegimeId?: number | null;
  cfdiUseId?: number | null;
  billingPostalCode?: string | null;
  billingStreet?: string | null;
  sendInvoiceByEmail?: boolean;
  invoiceEmail?: string | null;
  invoiceWhatsappNumber?: string | null;
}

export interface GetClientsParams {
  page: number;
  limit: number;
  search?: string;
  status?: ClientStatus;
  client_id?: number;
}

export type GetClientsResponse = PaginatedRowsResponse<Client>;

export type ClientInformationSectionResponse = {
  clientId: number;
  creditApplicationId: number | null;
  section: ClientInformationSection;
  data: Record<string, unknown>;
};

type ClientDocumentUploadResponse = {
  success: true;
  message: string;
  filePath: string;
  fileUrl: string;
  documentTypeCode: string;
};

const BASE = "/clients";

export async function getClients(
  params: GetClientsParams
): Promise<ApiResult<GetClientsResponse>> {
  return get<GetClientsResponse>(buildListUrl(BASE, params));
}

export async function getClientDetail(
  clientId: number
): Promise<ApiResult<ClientDetailHeader>> {
  return get<ClientDetailHeader>(`${BASE}/${clientId}/detail`);
}

export async function getClientInformationSection(
  clientId: number,
  section: ClientInformationSection
): Promise<ApiResult<ClientInformationSectionResponse>> {
  return get<ClientInformationSectionResponse>(
    `${BASE}/${clientId}/information?section=${encodeURIComponent(section)}`
  );
}

export async function updateClientInformationSection(
  clientId: number,
  section: ClientInformationSection,
  payload: Record<string, unknown>
): Promise<ApiResult<ApiSuccessPayload>> {
  return patch<ApiSuccessPayload>(
    `${BASE}/${clientId}/information?section=${encodeURIComponent(section)}`,
    payload,
    { skipGlobalErrorToast: true }
  );
}

export async function uploadClientDocument(
  clientId: number,
  type: string,
  file: File
): Promise<ApiResult<ClientDocumentUploadResponse>> {
  const formData = new FormData();
  formData.append("file", file);
  return post<ClientDocumentUploadResponse>(
    `${BASE}/${clientId}/documents/upload?type=${encodeURIComponent(type)}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      skipGlobalErrorToast: true,
    }
  );
}

export function buildClientSectionPayload(
  section: Exclude<
    keyof Omit<CreditApplicationFormPayload, "id" | "biometrics" | "guarantor">,
    never
  >,
  payload: CreditApplicationFormPayload
): Record<string, unknown> {
  switch (section) {
    case "basicInformation": {
      const maritalStatusId = Number.parseInt(
        payload.basicInformation.maritalStatus,
        10
      );
      return {
        basicInformation: {
          firstName: payload.basicInformation.firstName.trim(),
          lastName: payload.basicInformation.lastName.trim(),
          secondLastName: payload.basicInformation.secondLastName.trim(),
          birthDate: payload.basicInformation.birthDate.trim(),
          maritalStatusId: Number.isFinite(maritalStatusId)
            ? maritalStatusId
            : null,
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
      const residenceTimeValue = Number.parseInt(payload.address.residenceTimeValue, 10);
      const previousResidenceTimeValue = Number.parseInt(
        payload.address.previousResidenceTimeValue,
        10
      );
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
          residenceTimeValue: Number.isFinite(residenceTimeValue) ? residenceTimeValue : null,
          residenceTimeUnit: payload.address.residenceTimeUnit || null,
          previousAddress: payload.address.previousAddress.trim(),
          previousResidenceTimeValue: Number.isFinite(previousResidenceTimeValue)
            ? previousResidenceTimeValue
            : null,
          previousResidenceTimeUnit: payload.address.previousResidenceTimeUnit || null,
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
          neighborhoodFullCode:
            payload.employment.spouseNeighborhoodFullCode.trim(),
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
      return { employment: employmentSection };
    }
    case "references":
      return {
        references: {
          workReference: {
            company: payload.references.company.trim(),
            phone: payload.references.phone.trim(),
            clientPosition: payload.references.clientPosition.trim(),
            seniorityYears: payload.references.seniorityYears.trim(),
            respondentNameAndPosition:
              payload.references.respondentNameAndPosition.trim(),
          },
          familyReferences: payload.references.familyReferences.map(
            (reference) => {
              const nameParts = reference.name.trim().split(/\s+/);
              const firstName = nameParts[0] ?? "";
              const lastName = nameParts.slice(1).join(" ");
              const relationshipId = Number.parseInt(
                reference.relationshipId,
                10
              );
              return {
                firstName,
                lastName,
                relationshipId: Number.isFinite(relationshipId)
                  ? relationshipId
                  : null,
                address: reference.address.trim(),
                phone: reference.phone.trim(),
              };
            }
          ),
        },
      };
    case "documentation":
      return {
        documentation: {
          incomeProofFiles: payload.documentation.incomeProofFiles,
          employmentProofLetterFiles:
            payload.documentation.employmentProofLetterFiles,
          ineFrontFiles: payload.documentation.ineFrontFiles,
          ineBackFiles: payload.documentation.ineBackFiles,
        },
      };
  }
}

export async function getClientCollectionActivities(
  clientId: number
): Promise<ApiResult<ClientCollectionActivity[]>> {
  return get<ClientCollectionActivity[]>(
    `${BASE}/${clientId}/collection-activities`
  );
}

export async function getClientCollectionActivityTypes(): Promise<
  ApiResult<ClientCollectionActivityType[]>
> {
  return get<ClientCollectionActivityType[]>(`${BASE}/collection-activity-types`);
}

export async function createClientCollectionActivity(
  clientId: number,
  payload: CreateClientCollectionActivityPayload
): Promise<ApiResult<ClientCollectionActivity>> {
  return post<ClientCollectionActivity>(
    `${BASE}/${clientId}/collection-activities`,
    payload
  );
}

export async function getClientDeactivationReasons(): Promise<
  ApiResult<ClientDeactivationReason[]>
> {
  return get<ClientDeactivationReason[]>(`${BASE}/deactivation-reasons`);
}

export async function deactivateClient(
  clientId: number,
  payload: DeactivateClientPayload
): Promise<ApiResult<ApiSuccessPayload>> {
  return post<ApiSuccessPayload>(`${BASE}/${clientId}/deactivate`, payload);
}

export async function getSaleCancelReasons(): Promise<
  ApiResult<SaleCancelReason[]>
> {
  return get<SaleCancelReason[]>(`${BASE}/sale-cancel-reasons`);
}

export async function getClientPurchaseDetail(
  clientId: number,
  saleId: number
): Promise<ApiResult<ClientPurchaseDetailApi>> {
  return get<ClientPurchaseDetailApi>(`${BASE}/${clientId}/purchases/${saleId}`);
}

export async function cancelClientPurchase(
  clientId: number,
  saleId: number,
  payload: CancelClientPurchasePayload
): Promise<ApiResult<ApiSuccessPayload>> {
  return post<ApiSuccessPayload>(
    `${BASE}/${clientId}/purchases/${saleId}/cancel`,
    payload
  );
}
