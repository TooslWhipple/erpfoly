import { get, post, type ApiResult } from "@/lib/axios";

export interface User {
	id: string;
	name: string;
	email: string;
	avatar?: string;
	role: string;
	permissions: string[];
}

export interface LoginCredentials {
	employeeNumber: string;
	password: string;
}

export interface LoginResponse {
	token: string;
	user: User;
}

export interface ForgotPasswordRequest {
	email: string;
}

/** Usuario tal como lo devuelve el backend (login: firstName, lastName; me: puede incluir más campos) */
interface BackendUser {
	id: string;
	firstName?: string;
	lastName?: string;
	name?: string;
	email: string;
	role?: string;
	permissions?: string[];
	avatar?: string;
}

function mapBackendUserToFrontend(u: BackendUser): User {
	const fullName = [u.firstName, u.lastName].filter(Boolean).join(" ").trim();
	const name = u.name != null && u.name !== "" ? u.name : fullName || u.email;
	return {
		id: u.id,
		name,
		email: u.email,
		avatar: u.avatar,
		role: u.role != null ? u.role : "user",
		permissions: Array.isArray(u.permissions) ? u.permissions : [],
	};
}

/** Respuesta de login del backend (accessToken, refreshToken, user) */
interface BackendLoginResponse {
	accessToken: string;
	refreshToken: string;
	user: BackendUser;
}

export const authService = {
	async login(credentials: LoginCredentials): Promise<ApiResult<LoginResponse>> {
		const result = await post<BackendLoginResponse>("/auth/login", credentials);
		if (result.error) return { data: null, error: result.error };
		const res = result.data!;
		return {
			data: {
				token: res.accessToken,
				user: mapBackendUserToFrontend(res.user),
			},
			error: null,
		};
	},

	async logout(): Promise<ApiResult<void>> {
		return post<void>("/auth/logout");
	},

	async me(): Promise<ApiResult<User>> {
		const result = await get<BackendUser>("/auth/me");
		if (result.error) return { data: null, error: result.error };
		return { data: mapBackendUserToFrontend(result.data!), error: null };
	},

	async forgotPassword(data: ForgotPasswordRequest): Promise<ApiResult<void | { success: true; message?: string }>> {
		return post<void | { success: true; message?: string }>("/auth/password/recovery", data);
	},
};

