import type { DelinquencyPeriod } from "./delinquency.types";
import type { ClientStatus } from "./clientes.types";

export interface DelinquencySharedListSummary {
  id: number;
  name: string;
  contactEmail: string | null;
  clientCount: number;
  totalDebtAmount: number;
  shareToken: string;
  shareUrl: string;
  accessEmails: string[];
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
  delinquencyPeriod: DelinquencyPeriod;
  debtAmount: number;
  principalAmount: number;
  interestAmount: number;
  totalDebtAmount: number;
  negotiatedInterestAmount: number | null;
  negotiatedDebtAmount: number | null;
  isNegotiated: boolean;
}

export interface DelinquencySharedListDetail extends DelinquencySharedListSummary {
  clients: DelinquencySharedListClientSnapshot[];
}

export interface SharedDelinquencyClientDetail
  extends DelinquencySharedListClientSnapshot {
  curp: string | null;
  clientSince: string | null;
  createdAt: string | null;
  status: ClientStatus | null;
  creditLineAuthorized: number | null;
  creditUsed: number | null;
  creditAvailable: number | null;
  negotiatedAt: string | null;
}

export interface ApplyDelinquencyNegotiationPayload {
  negotiatedInterestAmount: number;
}

export interface CreateDelinquencySharedListPayload {
  clientName: string;
  contactEmail: string;
  clientIds: number[];
  emails: string[];
}

export interface GetDelinquencySharedListsParams {
  page: number;
  limit: number;
  search?: string;
  [key: string]: unknown;
}

export interface PublicDelinquencySharedListView {
  name: string;
  clientCount: number;
  totalDebtAmount: number;
  clients: DelinquencySharedListClientSnapshot[];
}

export interface PublicDelinquencyAccessResponse {
  accessToken: string;
  list: {
    name: string;
    clientCount: number;
    totalDebtAmount: number;
  };
}
