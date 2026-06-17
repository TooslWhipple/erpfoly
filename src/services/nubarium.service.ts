import { get, post } from "@/lib/axios";

export interface NubariumSdkTokenResponse {
  bearer_token?: string;
  bearerToken?: string;
}

export interface NubariumOcrPreview {
  curp?: string;
  name?: string;
  lastName?: string;
  secondLastName?: string;
  rfc?: string;
  birthDate?: string;
  address?: string;
}

const SDK_BASE = "/sdk";
const INE_BASE = "/mex/ine";

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

function stripDataUrlPrefix(value: string): string {
  const commaIndex = value.indexOf(",");
  if (value.startsWith("data:") && commaIndex !== -1) {
    return value.slice(commaIndex + 1);
  }
  return value;
}

function readStringField(source: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return undefined;
}

function mapOcrPreview(raw: unknown): NubariumOcrPreview | null {
  if (!raw || typeof raw !== "object") return null;
  const source = raw as Record<string, unknown>;

  const preview: NubariumOcrPreview = {
    name: readStringField(source, ["name", "firstName", "first_name", "nombre"]),
    lastName: readStringField(source, ["lastName", "last_name", "paternalLastName", "paternal_last_name", "apellidoPaterno"]),
    secondLastName: readStringField(source, ["secondLastName", "second_last_name", "maternalLastName", "maternal_last_name", "apellidoMaterno"]),
    curp: readStringField(source, ["curp", "CURP"]),
    rfc: readStringField(source, ["rfc", "RFC"]),
    birthDate: readStringField(source, ["birthDate", "birth_date", "birthdate", "fechaNacimiento"]),
    address: readStringField(source, ["address", "domicilio", "domicile"]),
  };

  const hasData = Object.values(preview).some(Boolean);
  return hasData ? preview : null;
}

export async function ocrIneFront(imageDataUrl: string): Promise<NubariumOcrPreview | null> {
  const normalizedImage = imageDataUrl.trim();
  if (!normalizedImage) return null;

  const result = await post<unknown>(
    `${INE_BASE}/ocr`,
    { id: stripDataUrlPrefix(normalizedImage) },
    { skipGlobalErrorToast: true },
  );
  if (result.error) return null;

  const payload = result.data;
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const nested = record.data ?? record.ocr ?? record.result ?? payload;
    return mapOcrPreview(nested) ?? mapOcrPreview(record);
  }

  return null;
}
