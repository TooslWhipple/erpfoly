import type { PromotionFormState } from "@/types/promociones.types";

/**
 * Validates end date when the "has end date" switch is on.
 * Returns an error message for `FormErrors.endDate`, or undefined when valid.
 */
export function validatePromotionEndDate(
  formState: Pick<PromotionFormState, "hasEndDate" | "endDate" | "startDate">
): string | undefined {
  if (!formState.hasEndDate) {
    return undefined;
  }
  const raw = formState.endDate;
  if (raw == null || !String(raw).trim()) {
    return "La fecha de fin es requerida";
  }
  if (formState.startDate) {
    const end = new Date(raw);
    const start = new Date(formState.startDate);
    if (!Number.isNaN(end.getTime()) && !Number.isNaN(start.getTime()) && end < start) {
      return "La fecha de fin debe ser posterior a la fecha de inicio";
    }
  }
  return undefined;
}

export function validatePromotionAdvancePercentage(
  purchaseTypeCode: string | undefined,
  advancePercentage: string
): string | undefined {
  if (purchaseTypeCode !== "APARTADO") {
    return undefined;
  }
  const advanceNum =
    advancePercentage === "" ? NaN : Number(advancePercentage);
  if (isNaN(advanceNum) || advanceNum < 0 || advanceNum > 100) {
    return "El anticipo debe estar entre 0 y 100";
  }
  return undefined;
}

export function resolvePromotionAdvanceRate(
  purchaseTypeCode: string | undefined,
  advancePercentage: string
): number {
  if (purchaseTypeCode !== "APARTADO") {
    return 0;
  }
  const advanceNum = Number(advancePercentage);
  return Number.isFinite(advanceNum) ? advanceNum : 0;
}
