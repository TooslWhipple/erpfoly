import type { DelinquencyPeriod } from "./delinquency.types";

export interface DelinquencySharedListSummary {
  id: number;
  name: string;
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
  lastPaymentDate: string | null;
  dueDate: string;
  delinquencyPeriod: DelinquencyPeriod;
  debtAmount: number;
}

export interface DelinquencySharedListDetail extends DelinquencySharedListSummary {
  clients: DelinquencySharedListClientSnapshot[];
}

export interface CreateDelinquencySharedListPayload {
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
  clients: Array<{
    id: number;
    fullName: string;
    phone: string | null;
    lastPaymentDate: string | null;
    dueDate: string;
    delinquencyPeriod: DelinquencyPeriod;
    debtAmount: number;
  }>;
}

export interface PublicDelinquencyAccessResponse {
  accessToken: string;
  list: {
    name: string;
    clientCount: number;
    totalDebtAmount: number;
  };
}
