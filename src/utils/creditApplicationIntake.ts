import type { CreditApplicationBiometricsData } from "@/types/credit-application-form.types";

/**
 * Minimal valid PNG (1×1 px) as data URI. Used until hardware fingerprint capture is integrated.
 */
export const SIMULATED_FINGERPRINT_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

export interface CreateCreditApplicationIntakeRequestBody {
  ineFrontBase64: string;
  ineBackBase64: string;
  faceCaptureBase64: string;
  fingerprintBase64: string;
  bureauAuthorizationSignatureBase64: string;
}

export function buildCreateCreditApplicationIntakeBody(
  data: CreditApplicationBiometricsData
): CreateCreditApplicationIntakeRequestBody {
  const ineFront = data.ineFrontImage?.trim();
  const ineBack = data.ineBackImage?.trim();
  const face = data.selfieImage?.trim();
  const signature = data.signatureDataUrl?.trim();

  if (!ineFront || !ineBack || !face || !signature) {
    throw new Error("Faltan capturas obligatorias para crear la solicitud.");
  }

  return {
    ineFrontBase64: ineFront,
    ineBackBase64: ineBack,
    faceCaptureBase64: face,
    fingerprintBase64: SIMULATED_FINGERPRINT_DATA_URL,
    bureauAuthorizationSignatureBase64: signature,
  };
}
