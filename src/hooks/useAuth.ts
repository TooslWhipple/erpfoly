import { useState } from "react";
import { useRouter } from "next/router";
import { useAuthStore } from "@/store/useAuthStore";
import { authService, LoginCredentials } from "@/services/auth.service";
import { saveTempPasswordChangeContext } from "@/utils/temp-password-change";
import { canAccessPath, getFirstAllowedRoute, normalizePathname } from "@/lib/routeAccess";

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

		const data = result.data!;

		if ("token" in data) {
			// Usuario con requires_otp = false: login directo, sin pasar por OTP.
			setAuth(data.token, data.user);
			const redirect = typeof router.query.redirect === "string" ? normalizePathname(router.query.redirect) : "";
			const nextPath = redirect && canAccessPath(redirect, data.user)
				? redirect
				: getFirstAllowedRoute(data.user);
			router.push(nextPath);
			setIsLoading(false);
			setLoading(false);
			return;
		}

		if (data.requiresPasswordChange) {
			saveTempPasswordChangeContext({
				username: credentials.username?.trim() || undefined,
				cellphone: credentials.cellphone?.trim() || undefined,
				currentPassword: credentials.password,
			});
			router.push("/login/change-password");
			setIsLoading(false);
			setLoading(false);
			return;
		}

		const query: Record<string, string> = {};
		if (credentials.username?.trim()) query.username = credentials.username.trim();
		if (credentials.cellphone?.trim()) query.cellphone = credentials.cellphone.trim();
		if (typeof router.query.redirect === "string") query.redirect = router.query.redirect;
		
		const search = new URLSearchParams(query).toString();

		router.push(search ? `/login/validate-otp?${search}` : "/login/validate-otp");

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

