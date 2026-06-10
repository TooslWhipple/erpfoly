export const AUTH_GENERIC_ERROR = "Ha ocurrido un error. Intenta de nuevo.";

const TECHNICAL_ERROR_PATTERNS = [
	"timeout",
	"network error",
	"econnaborted",
	"network or server error",
	"unknown error",
];

/** Enmascara errores técnicos de red; el copy de negocio viene del API. */
export function mapApiErrorToUserMessage(message: string | null | undefined): string {
	if (!message?.trim()) return AUTH_GENERIC_ERROR;

	const lower = message.toLowerCase();
	if (TECHNICAL_ERROR_PATTERNS.some((pattern) => lower.includes(pattern))) {
		return AUTH_GENERIC_ERROR;
	}

	return message.trim();
}
