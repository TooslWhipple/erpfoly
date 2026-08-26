import axios, { AxiosError } from "axios";
import { apiBaseUrl } from "@/config/api";
import type {
  PublicDelinquencyAccessResponse,
  PublicDelinquencySharedListView,
  SharedDelinquencyClientDetail,
} from "@/types/delinquency-shared-list.types";

const publicApi = axios.create({
  baseURL: apiBaseUrl,
  timeout: 60000,
  headers: { "Content-Type": "application/json" },
});

publicApi.interceptors.response.use((response) => {
  const body = response.data as { success?: boolean; data?: unknown } | unknown;
  if (
    body != null &&
    typeof body === "object" &&
    "data" in body &&
    "success" in body
  ) {
    response.data = (body as { data: unknown }).data;
  }
  return response;
});

const PUBLIC_BASE = "/public/delinquency-shared-lists";

function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data;
    if (data && typeof data === "object" && "message" in data) {
      const message = (data as { message?: unknown }).message;
      if (typeof message === "string" && message.trim()) {
        return message;
      }
      if (Array.isArray(message)) {
        return message.map(String).join(". ");
      }
    }
  }
  return error instanceof Error ? error.message : "Error de red o servidor";
}

export async function requestPublicDelinquencyAccess(
  shareToken: string,
  email: string,
): Promise<{ message: string; expiresAt: string }> {
  try {
    const { data } = await publicApi.post<{ message: string; expiresAt: string }>(
      `${PUBLIC_BASE}/${shareToken}/request-access`,
      { email },
    );
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function verifyPublicDelinquencyOtp(
  shareToken: string,
  email: string,
  code: string,
): Promise<PublicDelinquencyAccessResponse> {
  try {
    const { data } = await publicApi.post<PublicDelinquencyAccessResponse>(
      `${PUBLIC_BASE}/${shareToken}/verify-otp`,
      { email, code },
    );
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getPublicDelinquencySharedList(
  shareToken: string,
  accessToken: string,
): Promise<PublicDelinquencySharedListView> {
  try {
    const { data } = await publicApi.get<PublicDelinquencySharedListView>(
      `${PUBLIC_BASE}/${shareToken}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getPublicSharedListClientDetail(
  shareToken: string,
  listClientId: number,
  accessToken: string,
): Promise<SharedDelinquencyClientDetail> {
  try {
    const { data } = await publicApi.get<SharedDelinquencyClientDetail>(
      `${PUBLIC_BASE}/${shareToken}/clients/${listClientId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
