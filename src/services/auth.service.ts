import { post } from "@/lib/axios";

export interface User {
	id: string;
	name: string;
	email: string;
	avatar?: string;
	role: string;
	permissions: string[];
}

export interface LoginCredentials {
	email: string;
	password: string;
}

export interface LoginResponse {
	token: string;
	user: User;
}

export interface ForgotPasswordRequest {
	email: string;
}

export const authService = {
	login: (credentials: LoginCredentials) => post<LoginResponse>("/auth/login", credentials),

	logout: () => post<void>("/auth/logout"),

	me: () => post<User>("/auth/me"),

	forgotPassword: (data: ForgotPasswordRequest) => post<void>("/auth/forgot-password", data),
};

