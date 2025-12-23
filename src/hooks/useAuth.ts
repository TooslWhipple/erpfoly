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

		try {
			const response = await authService.login(credentials);
			setAuth(response.token, response.user);
			router.push("/");
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "Error al iniciar sesión";
			setError(message);
			throw err;
		} finally {
			setIsLoading(false);
			setLoading(false);
		}
	};

	const logout = async () => {
		try {
			await authService.logout();
		} catch {
			// Ignorar error de logout en API
		} finally {
			clearAuth();
			router.push("/login");
		}
	};

	return {
		user,
		token,
		isAuthenticated,
		isLoading,
		error,
		login,
		logout,
	};
}

