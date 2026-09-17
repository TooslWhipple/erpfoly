import { get, post } from "@/lib/axios";

export interface NubariumSdkTokenResponse {
  bearer_token?: string;
  bearerToken?: string;
}

export type FaceMatchFailureReason = "NO_MATCH" | "PROVIDER_ERROR";

export interface CompareIneFaceResult {
  isMatch: boolean;
  score: number;
  message?: string;
  failureReason?: FaceMatchFailureReason;
  threshold?: number;
}

const SDK_BASE = "/sdk";
const INE_BASE = "/mex/ine";

const FACE_MATCH_FAILURE_MESSAGE =
  "Identidad no verificada: el rostro capturado no coincide con la identificación. Asegúrate de que la INE y la selfie correspondan a la misma persona e intenta de nuevo.";

function extractBearerToken(data: NubariumSdkTokenResponse | null | undefined): string | null {
  if (!data) return null;
  const token = data.bearer_token ?? data.bearerToken;
  return typeof token === "string" && token.trim() ? token.trim() : null;
}

/** Strip `data:image/...;base64,` prefix when present so Nubarium receives raw base64. */
export function toRawBase64(image: string): string {
  const trimmed = image.trim();
  const commaIndex = trimmed.indexOf(",");
  if (trimmed.startsWith("data:") && commaIndex !== -1) {
    return trimmed.slice(commaIndex + 1);
  }
  return trimmed;
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

export async function compareIneFace(
  ineFrontImage: string,
  selfieImage: string,
): Promise<CompareIneFaceResult> {
  const result = await post<CompareIneFaceResult>(
    `${INE_BASE}/compare-face`,
    {
      id: toRawBase64(ineFrontImage),
      face: toRawBase64(selfieImage),
      media: "image",
    },
    { skipGlobalErrorToast: true, timeout: 60_000 },
  );

  if (result.error || !result.data) {
    return {
      isMatch: false,
      score: 0,
      failureReason: "PROVIDER_ERROR",
      message: result.error?.message ?? FACE_MATCH_FAILURE_MESSAGE,
    };
  }

  return {
    isMatch: Boolean(result.data.isMatch),
    score: Number(result.data.score) || 0,
    message: result.data.message,
    failureReason: result.data.failureReason,
    threshold:
      typeof result.data.threshold === "number" ? result.data.threshold : undefined,
  };
}
