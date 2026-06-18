import { get, post } from "@/lib/axios";

export interface NubariumSdkTokenResponse {
  bearer_token?: string;
  bearerToken?: string;
}

const SDK_BASE = "/sdk";

function extractBearerToken(data: NubariumSdkTokenResponse | null | undefined): string | null {
  if (!data) return null;
  const token = data.bearer_token ?? data.bearerToken;
  return typeof token === "string" && token.trim() ? token.trim() : null;
}

export async function generateSdkToken(expireAfter = 1800): Promise<string | null> {
  const result = await post<NubariumSdkTokenResponse>(
    `${SDK_BASE}/jwt/generate`,
    { expireAfter },
    { skipGlobalErrorToast: true },
  );
  if (result.error) return null;
  return extractBearerToken(result.data);
}

export async function getSdkExecution(executionId: string): Promise<unknown | null> {
  const normalizedId = executionId.trim();
  if (!normalizedId) return null;

  const result = await get<unknown>(`${SDK_BASE}/video/executions/${encodeURIComponent(normalizedId)}`, {
    skipGlobalErrorToast: true,
  });
  if (result.error) return null;
  return result.data;
}
