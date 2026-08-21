export const DELINQUENCY_PERIODS = [
  "1_day",
  "1_week",
  "1_month",
  "2_months",
] as const;

export type DelinquencyPeriod = (typeof DELINQUENCY_PERIODS)[number];

export interface DelinquentCustomer {
  id: number;
  fullName: string;
  phone: string | null;
  lastPaymentDate: string | null;
  dueDate: string;
  delinquencyPeriod: DelinquencyPeriod;
  debtAmount: number;
}

export interface DelinquencyBucketStat {
  count: number;
  change: number;
  changeType: "increase" | "decrease";
}

export interface DelinquencySummary {
  oneDay: DelinquencyBucketStat;
  oneWeek: DelinquencyBucketStat;
  oneMonth: DelinquencyBucketStat;
  twoMonths: DelinquencyBucketStat;
  hasComparison: boolean;
}

export interface GetDelinquentCustomersParams {
  page: number;
  limit: number;
  period?: DelinquencyPeriod;
  sortField?: "dueDate" | "debtAmount" | "fullName" | "lastPaymentDate";
  sortOrder?: "asc" | "desc";
  search?: string;
  [key: string]: unknown;
}
