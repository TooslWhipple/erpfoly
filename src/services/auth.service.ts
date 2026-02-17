import { get, post } from "@/lib/axios";

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
	async login(credentials: LoginCredentials): Promise<LoginResponse> {
		const res = await post<BackendLoginResponse>("/auth/login", credentials);
		return {
			token: res.accessToken,
			user: mapBackendUserToFrontend(res.user),
		};
	},

	logout: () => post<void>("/auth/logout").catch(() => {}),

	async me(): Promise<User> {
		const res = await get<BackendUser>("/auth/me");
		return mapBackendUserToFrontend(res);
	},

	forgotPassword: (data: ForgotPasswordRequest) =>
		post<void>("/auth/password/recovery", data),
};

