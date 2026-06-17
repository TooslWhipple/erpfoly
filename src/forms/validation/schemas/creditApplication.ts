const CURP_RE = /^[A-Z0-9]{18}$/i;
const RFC_RE = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\d{10}$/;
const POSTAL_CODE_RE = /^\d{5}$/;
const LETTERS_SPACES_RE = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
const DECIMAL_RE = /^\d+(\.\d{1,2})?$/;
const NUMBER_RE = /^\d+$/;

export function sanitizeCurp(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 18);
}

export function isValidCurp(value: string): boolean {
  return CURP_RE.test(value.trim());
}

export function sanitizeRfc(value: string): string {
  return value.toUpperCase().replace(/[^A-ZÑ&0-9]/g, '').slice(0, 13);
}

export function isValidRfc(value: string): boolean {
  return RFC_RE.test(value.trim());
}

export function sanitizePhone(value: string): string {
  return value.replace(/\D/g, '').slice(0, 10);
}

export function isValidPhone(value: string): boolean {
  return PHONE_RE.test(value.trim());
}

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

export function isValidPostalCode(value: string): boolean {
  return POSTAL_CODE_RE.test(value.trim());
}

export function sanitizeLettersOnly(value: string): string {
  return value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
}

export function isValidLettersOnly(value: string): boolean {
  return LETTERS_SPACES_RE.test(value.trim()) || value.trim() === '';
}

export function sanitizeDecimal(value: string): string {
  const cleaned = value.replace(/[^0-9.]/g, '');
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    return parts[0] + '.' + parts.slice(1).join('');
  }
  if (parts[1] && parts[1].length > 2) {
    return parts[0] + '.' + parts[1].slice(0, 2);
  }
  return cleaned;
}

export function isValidDecimal(value: string): boolean {
  return DECIMAL_RE.test(value.trim()) || value.trim() === '';
}

export function isValidNumber(value: string): boolean {
  return NUMBER_RE.test(value.trim()) || value.trim() === '';
}
