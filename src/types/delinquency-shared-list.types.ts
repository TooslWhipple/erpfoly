import type { DelinquencyPeriod } from "./delinquency.types";
import type { ClientStatus } from "./clientes.types";

export type DelinquencyManagementStatus =
  | "SIN_GESTION"
  | "CONTACTADO"
  | "PROMESA_DE_PAGO"
  | "CONVENIO_DE_PAGO"
  | "ILOCALIZABLE"
  | "SE_NIEGA_A_PAGAR";

export interface SharedListCollector {
  id: number;
  fullName: string;
}

export interface SharedListCollectorOption extends SharedListCollector {
  username: string;
}

export interface DelinquencyListClientConflict {
  clientId: number;
  fullName: string;
  listId: number;
  listName: string;
}

export interface DelinquencySharedListSummary {
  id: number;
  name: string;
  clientCount: number;
  totalDebtAmount: number;
  collector: SharedListCollector | null;
  collectorAssignedAt: string | null;
  closedAt: string | null;
  createdAt: string;
}

export interface DelinquencySharedListClientSnapshot {
  id: number;
  clientId: number;
  fullName: string;
  phone: string | null;
  email: string | null;
  lastPaymentDate: string | null;
  dueDate: string;
  delinquencyPeriod: DelinquencyPeriod | null;
  principalAmount: number;
  interestAmount: number;
  totalDebtAmount: number;
  negotiatedInterestAmount: number | null;
  negotiatedDebtAmount: number | null;
  isNegotiated: boolean;
  currentDebtAmount: number;
  negotiatedAt: string | null;
  managementStatus: DelinquencyManagementStatus;
  managementStatusUpdatedAt: string | null;
}

export interface DelinquencySharedListDetail extends DelinquencySharedListSummary {
  clients: DelinquencySharedListClientSnapshot[];
}

export interface DelinquencySharedListDashboard {
  clientCount: number;
  assignedAmount: number;
  recoveredAmount: number;
  activeNegotiations: number;
  period: { from: string; to: string };
  assignmentStartedAt: string;
}

export interface UpdateDelinquencyManagementStatusPayload {
  status: DelinquencyManagementStatus;
}

export interface SharedDelinquencyBasicInformation {
  firstName: string;
  firstSurname: string;
  secondSurname: string;
  birthDate: string | null;
  maritalStatus: string;
  curp: string;
  rfc: string;
  email: string;
  phone: string;
  phoneVerified: boolean;
}

export interface SharedDelinquencyAddress {
  postalCode: string;
  neighborhoodName: string;
  state: string;
  city: string;
  street: string;
  externalNumber: string;
  internalNumber: string;
  betweenStreets: string;
  housingTypeName: string;
  residenceTimeValue: number | null;
  residenceTimeUnit: "months" | "years" | null;
  previousAddress: string;
  previousResidenceTimeValue: number | null;
  previousResidenceTimeUnit: "months" | "years" | null;
}

export interface SharedDelinquencyGuarantorAddress {
  postalCode: string;
  neighborhoodName: string;
  state: string;
  city: string;
  street: string;
  externalNumber: string;
  internalNumber: string;
  betweenStreets: string;
}

export interface SharedDelinquencyGuarantor {
  fullName: string;
  birthDate: string | null;
  maritalStatus: string;
  curp: string;
  rfc: string;
  phone: string;
  hasSpouse: boolean;
  address: SharedDelinquencyGuarantorAddress;
}

export interface SharedDelinquencyClientDetail
  extends DelinquencySharedListClientSnapshot {
  collectorMaxNegotiationAmount: number | null;
  collectorMaxNegotiationPercent: number | null;
  curp: string | null;
  clientSince: string | null;
  createdAt: string | null;
  status: ClientStatus | null;
  creditLineAuthorized: number | null;
  creditUsed: number | null;
  creditAvailable: number | null;
  basicInformation: SharedDelinquencyBasicInformation | null;
  address: SharedDelinquencyAddress | null;
  guarantor: SharedDelinquencyGuarantor | null;
}

export interface ApplyDelinquencyNegotiationPayload {
  negotiatedInterestAmount: number;
}

export interface DelinquencyClientSelectionPayload {
  selectAll: true;
  period?: DelinquencyPeriod;
  search?: string;
  excludedClientIds: number[];
}

export interface CreateDelinquencySharedListPayload {
  collectorUserId: number;
  clientIds?: number[];
  selection?: DelinquencyClientSelectionPayload;
}

export interface CreateDelinquencySharedListResponse {
  list: DelinquencySharedListDetail;
  excludedClients: DelinquencyListClientConflict[];
}

export type DelinquencySharedListSortField =
  | "name"
  | "clientCount"
  | "totalDebtAmount";

export type DelinquencySharedListSortOrder = "asc" | "desc";

export interface GetDelinquencySharedListsParams {
  page: number;
  limit: number;
  search?: string;
  sortField?: DelinquencySharedListSortField;
  sortOrder?: DelinquencySharedListSortOrder;
  status?: "active" | "closed";
  [key: string]: unknown;
}
