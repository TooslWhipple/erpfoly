import { post } from "@/lib/axios";

const BASE = "/clients";

export interface ClientOtpStateResponse {
  verified: boolean;
  canSend: boolean;
  cooldownUntil: string | null;
  expiresAt: string | null;
  attemptsLeft: number;
  message: string;
}

export async function sendClientOtp(
  whatsappNumber: string
): Promise<ClientOtpStateResponse> {
  const result = await post<ClientOtpStateResponse>(
    `${BASE}/otp/send`,
    { whatsappNumber },
    { skipGlobalErrorToast: true }
  );
  if (result.error) {
    const e = new Error(result.error.message) as Error & {
      apiError?: { message: string };
    };
    e.apiError = { message: result.error.message };
    throw e;
  }
  if (!result.data) {
    const e = new Error("No se pudo enviar el OTP por WhatsApp") as Error & {
      apiError?: { message: string };
    };
    e.apiError = { message: "No se pudo enviar el OTP por WhatsApp" };
    throw e;
  }
  return result.data;
}

export async function verifyClientOtp(
  whatsappNumber: string,
  otpCode: string
): Promise<ClientOtpStateResponse | null> {
  const result = await post<ClientOtpStateResponse>(
    `${BASE}/otp/verify`,
    {
      whatsappNumber,
      otpCode,
    },
    { skipGlobalErrorToast: true }
  );
  if (result.error) return null;
  return result.data;
}
