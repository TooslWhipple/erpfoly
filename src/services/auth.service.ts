import { get, post, type ApiResult, type ApiSuccessPayload } from "@/lib/axios";
import type { User } from "@/store/useAuthStore";
import { parseLoginIdentifier } from "@/utils/login-identifier";

export type { User };

/** Credentials needed so the browser sends and stores cookies (e.g. refresh token) */
const AUTH_CREDENTIALS = { withCredentials: true } as const;

/** Login step 1: request OTP. Send either username or cellphone, always password. */
export interface LoginCredentials {
	username?: string;
	cellphone?: string;
	password: string;
}

/** Response from POST /auth/login when OTP is sent or password change is required. */
export interface LoginOtpSentResponse {
	message: string;
	requiresPasswordChange?: boolean;
}

export interface LoginResponse {
	token: string;
	user: User;
}

export interface RequestPasswordRecoveryRequest {
	username?: string;
	cellphone?: string;
}

export interface ResetPasswordRequest {
	token: string;
	newPassword: string;
	confirmPassword: string;
}

export interface ValidateRecoveryTokenResponse {
	valid: true;
}

type BackendRole =
	| string
	| {
		id?: number;
		code?: string;
		name?: string;
	};

type BackendPermission =
	| string
	| {
		screenCode?: string;
		module?: string;
		screen?: string;
		action?: string;
		actionName?: string;
		name?: string;
		code?: string;
		type?: string;
	};

const BACKEND_ACTION_TO_CRUD_ACTION: Record<string, "create" | "read" | "update" | "delete"> = {
	create: "create",
	read: "read",
	update: "update",
	delete: "delete",
	view: "read",
	edit: "update",
	remove: "delete",
	approve: "update",
	reject: "update",
	request_info: "update",
	requestInformation: "update",
	open: "update",
	close: "update",
	cut: "update",
	withdraw: "update",
	withdrawal: "update",
	execute: "update",
	configure: "update",
	apply: "update",
	confirm: "update",
	cancel: "update",
	export: "read",
	generate: "read",
	register: "update",
	add: "update",
};

const BACKEND_MODULE_TO_FRONTEND_MODULE: Record<string, string> = {
	"solicitudes-credito": "solicitudes_credito",
	"solicitudes-descuento": "solicitudes_descuento",
	"solicitudes-sucursales": "solicitudes_sucursales",
	"pedidos-sucursales": "pedidos_sucursales",
	"clientes-morosidad": "clientes.morosidad",
	"clientes-cobranza": "clientes.cobranza",
	"inventario-mercancia-danada": "inventario.mercancia_danada",
	"inventario-liquidaciones": "inventario.liquidaciones",
	"recepcion-mercancias": "recepcion_mercancias",
	"atencion-cliente": "atencion_cliente",
	"atencion-cliente-facturas": "atencion_cliente.facturas",
	"atencion-cliente-reparaciones": "atencion_cliente.reparaciones",
	"rutas-articulos": "rutas.articulos",
	"rutas-carta-porte": "rutas.carta_porte",
	"rutas-conductores": "rutas.conductores",
	"catalogos-productos": "catalogos.productos",
	"catalogos-departamentos": "catalogos.departamentos",
	"catalogos-promociones": "catalogos.promociones",
	"catalogos-sucursales": "catalogos.sucursales",
	"catalogos-proveedores": "catalogos.proveedores",
	"catalogos-proveedores-reparaciones": "catalogos.proveedores_reparaciones",
	"catalogos-usuarios": "catalogos.usuarios",
	"catalogos-vendedores": "catalogos.vendedores",
	"catalogos-roles": "catalogos.roles",
	"catalogos-mensajes": "catalogos.mensajes",
	"catalogos-metas": "catalogos.metas",
	"catalogos-costos-envio": "catalogos.costos_envio",
	"catalogos-folypuntos": "catalogos.folypuntos",
};

const DERIVED_SCREEN_SUFFIXES = ["-nuevo", "-detalle"] as const;

interface BackendUser {
	id: string | number;
	firstName?: string;
	lastName?: string;
	name?: string;
	email?: string;
	username?: string;
	role?: BackendRole;
	roleId?: number;
	roleName?: string;
	permissions?: BackendPermission[];
	avatar?: string;
	temporaryPassword?: boolean;
	temporary_password?: boolean;
}

function asNonEmptyString(value: unknown): string | null {
	return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function normalizeAction(action: string): string {
	return BACKEND_ACTION_TO_CRUD_ACTION[action] ?? BACKEND_ACTION_TO_CRUD_ACTION[action.toLowerCase()] ?? action;
}

function normalizePermissionModule(module: string): string {
	const normalizedModule = module.trim();
	const mappedModule = BACKEND_MODULE_TO_FRONTEND_MODULE[normalizedModule];
	if (mappedModule) return mappedModule;

	const baseModule = DERIVED_SCREEN_SUFFIXES.reduce((currentModule, suffix) => {
		return currentModule.endsWith(suffix) ? currentModule.slice(0, -suffix.length) : currentModule;
	}, normalizedModule);

	return BACKEND_MODULE_TO_FRONTEND_MODULE[baseModule] ?? normalizedModule;
}

function normalizePermissionCode(permission: string): string {
	const normalizedPermission = permission.trim();
	if (!normalizedPermission.includes(".")) return normalizedPermission;

	const segments = normalizedPermission.split(".");
	const action = segments.pop();
	if (!action) return normalizedPermission;

	return `${normalizePermissionModule(segments.join("."))}.${normalizeAction(action)}`;
}

function normalizeBackendPermission(permission: BackendPermission): string | null {
	if (typeof permission === "string") return normalizePermissionCode(permission);

	const directCode = asNonEmptyString(permission.code) ?? asNonEmptyString(permission.name);
	if (directCode?.includes(".")) return normalizePermissionCode(directCode);

	const screenCode =
		asNonEmptyString(permission.screenCode) ??
		asNonEmptyString(permission.module) ??
		asNonEmptyString(permission.screen);
	const action =
		asNonEmptyString(permission.action) ??
		asNonEmptyString(permission.actionName) ??
		asNonEmptyString(permission.name) ??
		asNonEmptyString(permission.code) ??
		asNonEmptyString(permission.type);

	if (!screenCode || !action) return null;
	return `${normalizePermissionModule(screenCode)}.${normalizeAction(action)}`;
}

function normalizeBackendPermissions(permissions: BackendPermission[] | undefined): string[] {
	if (!Array.isArray(permissions)) return [];

	const normalized = permissions
		.map(normalizeBackendPermission)
		.filter((permission): permission is string => Boolean(permission));

	return Array.from(new Set(normalized));
}

function resolveBackendRole(u: BackendUser): Pick<User, "role" | "roleId" | "roleName"> {
	if (typeof u.role === "string") {
		return {
			role: u.role || "user",
			roleId: u.roleId,
			roleName: u.roleName ?? u.role,
		};
	}

	return {
		role: u.role?.code ?? u.roleName ?? u.role?.name ?? "user",
		roleId: u.roleId ?? u.role?.id,
		roleName: u.roleName ?? u.role?.name ?? u.role?.code,
	};
}

function mapBackendUserToFrontend(u: BackendUser): User {
	const fullName = [u.firstName, u.lastName].filter(Boolean).join(" ").trim();
	const email = u.email ?? u.username ?? "";
	const name = u.name != null && u.name !== "" ? u.name : fullName || email;
	const role = resolveBackendRole(u);
	return {
		id: String(u.id),
		name,
		email,
		avatar: u.avatar,
		...role,
		permissions: normalizeBackendPermissions(u.permissions),
		temporaryPassword: u.temporaryPassword ?? u.temporary_password ?? false,
	};
}

interface BackendLoginResponse {
	accessToken: string;
	refreshToken?: string;
	permissions?: BackendPermission[];
	user: BackendUser;
}

function mapAuthResponseToLoginData(res: BackendLoginResponse): LoginResponse {
	return {
		token: res.accessToken,
		user: mapBackendUserToFrontend({
			...res.user,
			permissions: res.permissions ?? res.user.permissions,
		}),
	};
}

export interface ValidateOtpRequest {
	otp: string;
}

/** Same shape as login success: accessToken, refreshToken, user */
export interface ValidateOtpResponse {
	accessToken: string;
	refreshToken?: string;
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

export interface ChangeRequiredPasswordRequest {
	newPassword: string;
	confirmPassword: string;
}

export interface ReplaceTemporaryPasswordRequest {
	username?: string;
	cellphone?: string;
	currentPassword: string;
	newPassword: string;
	confirmPassword: string;
}

export interface ReplaceTemporaryPasswordResponse {
	message: string;
}

export interface ChangeRequiredPasswordResponse {
	message: string;
	user: User;
}

export const authService = {
	/**
	 * Step 1: request OTP. Body is { username, password } or { cellphone, password }.
	 * Response 200: { message: "OTP enviado a tu celular" }. Uses credentials for cookies.
	 */
	async login(credentials: LoginCredentials): Promise<ApiResult<LoginOtpSentResponse>> {
		const identifier =
			credentials.cellphone != null && credentials.cellphone !== ""
				? { cellphone: credentials.cellphone.trim() }
				: parseLoginIdentifier(credentials.username ?? "");
		const body = { ...identifier, password: credentials.password };
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
		return { data: mapAuthResponseToLoginData(result.data!), error: null };
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

	async requestPasswordRecovery(
		data: RequestPasswordRecoveryRequest
	): Promise<ApiResult<ApiSuccessPayload>> {
		return post<ApiSuccessPayload>("/auth/password/recovery", data);
	},

	async replaceTemporaryPassword(
		data: ReplaceTemporaryPasswordRequest,
	): Promise<ApiResult<ReplaceTemporaryPasswordResponse>> {
		return post<ReplaceTemporaryPasswordResponse>(
			"/auth/password/replace-temporary",
			data,
		);
	},

	async changeRequiredPassword(
		data: ChangeRequiredPasswordRequest
	): Promise<ApiResult<ChangeRequiredPasswordResponse>> {
		const result = await post<{
			message: string;
			user: BackendUser;
		}>("/auth/password/change-required", data);

		if (result.error || !result.data) {
			return { data: null, error: result.error };
		}

		return {
			data: {
				message: result.data.message,
				user: mapBackendUserToFrontend(result.data.user),
			},
			error: null,
		};
	},
};

