import { useState } from "react";
import { useRouter } from "next/router";
import { authService } from "@/services/auth.service";
import { getCellphoneValidationError } from "@/utils/auth-credentials";

export function usePasswordRecovery() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const clearError = () => setError(null);

	const requestRecovery = async (cellphone: string) => {
		const trimmed = cellphone.trim();
		const cellphoneError = getCellphoneValidationError(trimmed);
		if (!trimmed || cellphoneError) {
			setError(cellphoneError ?? "Ingresa tu número de celular");
			return;
		}

		setIsLoading(true);
		setError(null);

		const result = await authService.requestPasswordRecovery({ cellphone: trimmed });

		if (result.error) {
			setError(result.error.message);
			setIsLoading(false);
			return;
		}

		await router.push({
			pathname: "/login/recover/verify",
			query: { cellphone: trimmed },
		});
		setIsLoading(false);
	};

	const verifyRecovery = async (cellphone: string, otp: string) => {
		setIsLoading(true);
		setError(null);

		const result = await authService.verifyPasswordRecovery({ cellphone, otp });

		if (result.error) {
			setError(result.error.message);
			setIsLoading(false);
			return;
		}

		await router.push("/login/recover/sent");
		setIsLoading(false);
	};

	/** Reenvía el código; devuelve si la petición se aceptó. */
	const resendRecoveryCode = async (cellphone: string): Promise<boolean> => {
		setError(null);
		const result = await authService.requestPasswordRecovery({ cellphone });
		if (result.error) {
			setError(result.error.message);
			return false;
		}
		return true;
	};

	return {
		isLoading,
		error,
		clearError,
		requestRecovery,
		verifyRecovery,
		resendRecoveryCode,
	};
}
