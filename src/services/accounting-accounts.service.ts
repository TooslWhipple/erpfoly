import { get, unwrapOrThrow, type ApiResult } from "@/lib/axios";

export interface AccountingAccountItem {
  id: number;
  code: string;
  name: string;
  label: string;
}

export interface SearchAccountingAccountsParams {
  q?: string;
  limit?: number;
}

export async function searchAccountingAccounts(
  params: SearchAccountingAccountsParams = {},
): Promise<ApiResult<AccountingAccountItem[]>> {
  const queryParams: Record<string, string> = {};
  if (params.q?.trim()) queryParams.q = params.q.trim();
  if (params.limit) queryParams.limit = String(params.limit);

  return get<AccountingAccountItem[]>("/accounting-accounts/search", {
    params: queryParams,
  });
}
