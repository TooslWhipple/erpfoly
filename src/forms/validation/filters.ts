/**
 * Input filters limit what the user can type (e.g. only digits).
 * Applied on change; validation (schemas) runs on blur/submit.
 */
export type InputFilter = (value: string) => string;

export const filters = {
    /** Only digits. Optionally limit length (e.g. 10 for phone). */
    onlyNumbers(maxLength?: number): InputFilter {
        return (value: string) => {
            const digits = value.replace(/\D/g, "");
            return maxLength != null ? digits.slice(0, maxLength) : digits;
        };
    },

    /** Only letters (a-z, A-Z, accents, ñ). Optionally allow spaces. */
    onlyLetters(allowSpaces = true): InputFilter {
        const pattern = allowSpaces
            ? /[^a-zA-ZáéíóúñÁÉÍÓÚÑüÜ\s]/g
            : /[^a-zA-ZáéíóúñÁÉÍÓÚÑüÜ]/g;
        return (value: string) => value.replace(pattern, "");
    },

    /** Digits and one decimal point; max fraction digits (e.g. 720.00). */
    decimal(maxFractionDigits = 2): InputFilter {
        return (value: string) => {
            const allowed = value.replace(/[^\d.]/g, "");
            const [first, ...rest] = allowed.split(".");
            const frac = rest.join("").slice(0, maxFractionDigits);
            return rest.length > 0 ? `${first ?? ""}.${frac}` : first ?? "";
        };
    },

    personName(): InputFilter {
        return (value: string) =>
            filters.onlyLetters(true)(value).replace(/\s{2,}/g, " ");
    },
} as const;

export const NAME_MAX_LENGTH = 64;
export const USERNAME_MAX_LENGTH = 8;

const PERSON_NAME_PATTERN =
    /^[a-zA-ZáéíóúñÁÉÍÓÚÑüÜ]+( [a-zA-ZáéíóúñÁÉÍÓÚÑüÜ]+)*$/;

export function isValidPersonName(value: string): boolean {
    const trimmed = value.trim();
    if (!trimmed) return false;
    return PERSON_NAME_PATTERN.test(trimmed);
}
