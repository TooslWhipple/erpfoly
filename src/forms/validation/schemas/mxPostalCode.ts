const FIVE_DIGITS = /^\d{5}$/;

export function sanitizeMxPostalCodeInput(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 5);
}

export function isValidMxPostalCode(value: string): boolean {
  return FIVE_DIGITS.test(value.trim());
}
