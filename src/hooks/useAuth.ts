import { useState } from "react";
import { useRouter } from "next/router";
import { useAuthStore } from "@/store/useAuthStore";
import { authService, LoginCredentials } from "@/services/auth.service";

export function useAuth() {
	const router = useRouter();
	const { token, user, isAuthenticated, setAuth, logout: clearAuth, setLoading } = useAuthStore();
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const login = async (credentials: LoginCredentials) => {
		setIsLoading(true);
		setError(null);
		setLoading(true);

		const result = await authService.login(credentials);
		if (result.error) {
			setError(result.error.message);
			setIsLoading(false);
			setLoading(false);
			return;
		}
		setAuth(result.data!.token, result.data!.user);
		router.push("/solicitudes-credito");
		setIsLoading(false);
		setLoading(false);
	};

	const logout = async () => {
		await authService.logout();
		clearAuth();
		router.push("/login");
	};

	return {
		user,
		token,
		isAuthenticated,
		isLoading,
		error,
		clearError: () => setError(null),
		login,
		logout,
	};
}

