import { useState } from "react";
import { useRouter } from "next/router";
import {
	authService,
	type RequestPasswordRecoveryRequest,
} from "@/services/auth.service";
import { parseLoginIdentifier } from "@/utils/login-identifier";
import { getIdentifierValidationError } from "@/utils/auth-credentials";

export function usePasswordRecovery() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const clearError = () => setError(null);

	const requestRecovery = async (identifier: string) => {
		const trimmed = identifier.trim();
		const identifierError = getIdentifierValidationError(trimmed);
		if (!trimmed || identifierError) {
			setError(identifierError ?? "Ingresa tu número de celular");
			return;
		}

		setIsLoading(true);
		setError(null);

		const parsed = parseLoginIdentifier(trimmed);
		const payload: RequestPasswordRecoveryRequest = parsed.cellphone
			? { cellphone: parsed.cellphone }
			: { username: parsed.username ?? trimmed };

		const result = await authService.requestPasswordRecovery(payload);

		if (result.error) {
			setError(result.error.message);
			setIsLoading(false);
			return;
		}

		await router.push("/login/recover/sent");
		setIsLoading(false);
	};

	return {
		isLoading,
		error,
		clearError,
		requestRecovery,
	};
}
