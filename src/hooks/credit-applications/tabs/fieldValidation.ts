import dayjs from "@/lib/dayjs";
import { toDateOnlyString } from "@/utils/date";

const CURP_REGEX =
  /^[A-Z][AEIOUX][A-Z]{2}\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[HM](AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[A-Z\d]\d$/;

const RFC_REGEX = /^([A-Z&Ñ]{3,4})\d{6}([A-Z\d]{3})$/;
const TEN_DIGIT_PHONE_REGEX = /^\d{10}$/;

export function cleanAlphaNumeric(value: string): string {
  return value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
}

export function normalizeMxPhone(value: string): string {
  return value.replace(/\D/g, "").slice(0, 10);
}

export function isValidMxPhone(value: string): boolean {
  return TEN_DIGIT_PHONE_REGEX.test(value.trim());
}

export function isValidCurp(value: string): boolean {
  return CURP_REGEX.test(value.trim());
}

export function isValidRfc(value: string): boolean {
  return RFC_REGEX.test(value.trim());
}

export function isAdultBirthDate(value: string): boolean {
  const ymd = toDateOnlyString(value);
  if (!ymd) return false;

  const parsedDate = dayjs(ymd, "YYYY-MM-DD", true);
  if (!parsedDate.isValid()) return false;

  const today = dayjs().startOf("day");
  if (parsedDate.isAfter(today)) return false;

  return today.diff(parsedDate, "year") >= 18;
}
