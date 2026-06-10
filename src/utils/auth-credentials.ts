export const USERNAME_MAX_LENGTH = 32;
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 64;
export const CELLPHONE_LENGTH = 10;

const USERNAME_PATTERN = /^[a-zA-Z0-9]+$/;
const CELLPHONE_PATTERN = /^\d{10}$/;

export function sanitizeIdentifierInput(value: string): string {
	if (/^\d*$/.test(value)) {
		return value.slice(0, CELLPHONE_LENGTH);
	}

	return value.replace(/[^a-zA-Z0-9]/g, "").slice(0, USERNAME_MAX_LENGTH);
}

export function sanitizePasswordInput(value: string): string {
	return value.slice(0, PASSWORD_MAX_LENGTH);
}

export function isCellphoneIdentifier(value: string): boolean {
	return CELLPHONE_PATTERN.test(value.trim());
}

export function getIdentifierValidationError(value: string): string | null {
	const trimmed = value.trim();
	if (!trimmed) return null;

	if (/^\d+$/.test(trimmed)) {
		if (trimmed.length !== CELLPHONE_LENGTH) {
			return `El celular debe tener ${CELLPHONE_LENGTH} dígitos`;
		}
		return null;
	}

	if (!USERNAME_PATTERN.test(trimmed)) {
		return "Solo se permiten letras y números";
	}

	if (trimmed.length > USERNAME_MAX_LENGTH) {
		return `Máximo ${USERNAME_MAX_LENGTH} caracteres`;
	}

	return null;
}

export function isValidIdentifier(value: string): boolean {
	return getIdentifierValidationError(value) === null && value.trim().length > 0;
}

export function getPasswordValidationError(value: string): string | null {
	if (!value) return null;

	if (value.length < PASSWORD_MIN_LENGTH) {
		return `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`;
	}

	if (!/[A-Z]/.test(value)) {
		return "Debe incluir al menos una letra mayúscula";
	}

	if (!/[a-z]/.test(value)) {
		return "Debe incluir al menos una letra minúscula";
	}

	if (!/\d/.test(value)) {
		return "Debe incluir al menos un número";
	}

	return null;
}

export function isValidPassword(value: string): boolean {
	return getPasswordValidationError(value) === null;
}
