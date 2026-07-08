const STORAGE_KEY = "foly_temp_password_change";

export interface TempPasswordChangeContext {
	username?: string;
	cellphone?: string;
	currentPassword: string;
}

export function saveTempPasswordChangeContext(
	context: TempPasswordChangeContext,
): void {
	if (typeof sessionStorage === "undefined") return;
	sessionStorage.setItem(STORAGE_KEY, JSON.stringify(context));
}

export function readTempPasswordChangeContext(): TempPasswordChangeContext | null {
	if (typeof sessionStorage === "undefined") return null;

	const raw = sessionStorage.getItem(STORAGE_KEY);
	if (!raw) return null;

	try {
		const parsed = JSON.parse(raw) as TempPasswordChangeContext;
		if (!parsed.currentPassword) return null;
		if (!parsed.username && !parsed.cellphone) return null;
		return parsed;
	} catch {
		return null;
	}
}

export function clearTempPasswordChangeContext(): void {
	if (typeof sessionStorage === "undefined") return;
	sessionStorage.removeItem(STORAGE_KEY);
}
