import { get, post, type ApiResult, type ApiSuccessPayload } from "@/lib/axios";

/** Credentials needed so the browser sends and stores cookies (e.g. refresh token) */
const AUTH_CREDENTIALS = { withCredentials: true } as const;

export interface User {
	id: string;
	name: string;
	email: string;
	avatar?: string;
	role: string;
	permissions: string[];
}

/** Login step 1: request OTP. Send either username or cellphone, always password. */
export interface LoginCredentials {
	username?: string;
	cellphone?: string;
	password: string;
}

/** Response from POST /auth/login when OTP is sent (no tokens yet). */
export interface LoginOtpSentResponse {
	message: string;
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

export interface ValidateOtpRequest {
	otp: string;
}

/** Same shape as login success: accessToken, refreshToken, user */
export interface ValidateOtpResponse {
	accessToken: string;
	refreshToken: string;
	user: User;
}

/** Body for resend OTP; same identifier as login (username or cellphone). */
export interface ResendOtpRequest {
	username?: string;
	cellphone?: string;
}

export interface RefreshTokenResponse {
	accessToken: string;
	refreshToken?: string;
}

export const authService = {
	/**
	 * Step 1: request OTP. Body is { username, password } or { cellphone, password }.
	 * Response 200: { message: "OTP enviado a tu celular" }. Uses credentials for cookies.
	 */
	async login(credentials: LoginCredentials): Promise<ApiResult<LoginOtpSentResponse>> {
		const body =
			credentials.cellphone != null && credentials.cellphone !== ""
				? { cellphone: credentials.cellphone.trim(), password: credentials.password }
				: { username: (credentials.username ?? "").trim(), password: credentials.password };
		const result = await post<LoginOtpSentResponse>("/auth/login", body, AUTH_CREDENTIALS);
		if (result.error) return { data: null, error: result.error };
		return { data: result.data!, error: null };
	},

	/**
	 * Validates the OTP sent after login (e.g. via SMS).
	 * Uses credentials so cookies (e.g. refresh token) are sent and stored.
	 */
	async validateOtp(otp: string): Promise<ApiResult<LoginResponse>> {
		const result = await post<BackendLoginResponse>(
			"/auth/validate-otp",
			{ otp: otp.trim() },
			AUTH_CREDENTIALS
		);
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

	/**
	 * Resends OTP to the same identifier used at login (username or cellphone).
	 * Uses credentials so session/cookies are sent.
	 */
	async resendOtp(identifier?: ResendOtpRequest): Promise<ApiResult<ApiSuccessPayload>> {
		return post<ApiSuccessPayload>(
			"/auth/login/otp/resend",
			identifier ?? {},
			AUTH_CREDENTIALS
		);
	},

	/**
	 * Refreshes access token using the refresh token cookie.
	 * Body empty; credentials required so the cookie is sent.
	 * Returns new accessToken; refresh token is rotated via Set-Cookie.
	 */
	async refresh(): Promise<ApiResult<RefreshTokenResponse>> {
		return post<RefreshTokenResponse>("/auth/refresh", {}, AUTH_CREDENTIALS);
	},

	async logout(): Promise<ApiResult<void>> {
		return post<void>("/auth/logout", undefined, AUTH_CREDENTIALS);
	},

	async me(): Promise<ApiResult<User>> {
		const result = await get<BackendUser>("/auth/me");
		if (result.error) return { data: null, error: result.error };
		return { data: mapBackendUserToFrontend(result.data!), error: null };
	},

	async forgotPassword(data: ForgotPasswordRequest): Promise<ApiResult<ApiSuccessPayload>> {
		return post<ApiSuccessPayload>("/auth/password/recovery", data);
	},
};

