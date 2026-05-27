import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { shouldBypassAccessControl } from "@/lib/accessControl";

export const api = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
	timeout: 10000,
	headers: {
		"Content-Type": "application/json",
	},
});

api.interceptors.request.use(
	(config) => {
		const token = useAuthStore.getState().token;
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => Promise.reject(error)
);

type BackendBody<T> =
	| { success?: boolean; message?: string; errorCode?: unknown; data: T; error?: never }
	| { error: { message: string;[k: string]: unknown }; data?: never };

function isRefreshRequest(config: AxiosRequestConfig | undefined): boolean {
	const url = config?.url ?? "";
	return typeof url === "string" && url.includes("/auth/refresh");
}

function isPublicAuthRequest(config: AxiosRequestConfig | undefined): boolean {
	const url = config?.url ?? "";
	if (typeof url !== "string") return false;

	return [
		"/auth/login",
		"/auth/validate-otp",
		"/auth/login/otp/resend",
		"/auth/password/recovery",
		"/auth/logout",
	].some((path) => url.includes(path));
}

let isRefreshing = false;
const failedQueue: Array<{ resolve: (token: string) => void; reject: (err: AxiosError) => void }> = [];

function processQueue(err: AxiosError | null, token: string | null) {
	failedQueue.forEach((prom) => {
		if (err) prom.reject(err);
		else if (token) prom.resolve(token);
	});
	failedQueue.length = 0;
}

const DEFAULT_ERROR_MESSAGE = "Ha ocurrido un error. Intenta de nuevo.";

function getErrorMessage(error: AxiosError): string {
	const data = error.response?.data;
	if (data && typeof data === "object" && "message" in data) {
		const msg = (data as { message?: unknown }).message;
		if (typeof msg === "string" && msg.trim()) return msg;
		if (Array.isArray(msg)) return msg.map(String).join(". ") || DEFAULT_ERROR_MESSAGE;
	}
	if (data && typeof data === "object" && "errors" in data) {
		const errors = (data as { errors?: Record<string, string[]> }).errors;
		if (errors && typeof errors === "object") {
			const lines = Object.entries(errors).flatMap(([, arr]) => arr ?? []);
			if (lines.length) return lines.join(". ");
		}
	}
	return DEFAULT_ERROR_MESSAGE;
}

api.interceptors.response.use(
	(response) => {
		const body = response.data as BackendBody<unknown> & { success?: boolean; data?: unknown };
		if (body?.error != null && typeof body.error === "object" && "message" in body.error) {
			return response;
		}

		const shouldUnwrapEnvelope =
			typeof body === "object" &&
			body !== null &&
			"data" in body &&
			"success" in body;

		if (shouldUnwrapEnvelope) {
			response.data = body.data;
		}

		return response;
	},
	async (error: AxiosError) => {
		const originalRequest = error.config;

		if (error.response?.status !== 401) {
			useSnackbarStore.getState().showError(getErrorMessage(error));
			return Promise.reject(error);
		}

		if (!originalRequest) {
			useAuthStore.getState().logout();
			return Promise.reject(error);
		}

		if (
			isPublicAuthRequest(originalRequest) ||
			isRefreshRequest(originalRequest) ||
			(originalRequest as AxiosRequestConfig & { _retry?: boolean })._retry
		) {
			if (isPublicAuthRequest(originalRequest)) {
				return Promise.reject(error);
			}
			if (shouldBypassAccessControl) {
				return Promise.reject(error);
			}
			useAuthStore.getState().logout();
			if (typeof window !== "undefined") {
				window.location.href = "/login";
			}
			return Promise.reject(error);
		}

		if (isRefreshing) {
			return new Promise<string>((resolve, reject) => {
				failedQueue.push({
					resolve: (token: string) => {
						if (originalRequest.headers) {
							originalRequest.headers.Authorization = `Bearer ${token}`;
						}
						resolve(token);
					},
					reject,
				});
			})
				.then((token) => api.request({ ...originalRequest, headers: { ...originalRequest.headers, Authorization: `Bearer ${token}` } }))
				.catch((e) => Promise.reject(e));
		}

		(originalRequest as AxiosRequestConfig & { _retry?: boolean })._retry = true;
		isRefreshing = true;

		try {
			const { authService } = await import("@/services/auth.service");
			const result = await authService.refresh();
			if (result.error || !result.data?.accessToken) {
				processQueue(error, null);
				if (shouldBypassAccessControl) {
					return Promise.reject(error);
				}
				useAuthStore.getState().logout();
				if (typeof window !== "undefined") {
					window.location.href = "/login";
				}
				return Promise.reject(error);
			}

			const newToken = result.data.accessToken;
			useAuthStore.getState().setToken(newToken);
			processQueue(null, newToken);

			if (originalRequest.headers) {
				originalRequest.headers.Authorization = `Bearer ${newToken}`;
			}
			return api.request(originalRequest);
		} finally {
			isRefreshing = false;
		}
	}
);

export interface ApiResponse<T> {
	data: T;
	message?: string;
}

export interface ApiError {
	message: string;
	errors?: Record<string, string[]>;
}

export interface ApiSuccessPayload {
	success?: true;
	message?: string;
}

export interface PaginatedResponse<T> {
	data: T[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface PaginatedRowsResponse<T> {
	rows: T[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface ApiResult<T> {
	data: T | null;
	error: ApiError | null;
}

function isBackendErrorBody(
	value: unknown
): value is { error: { message: string } } {
	return (
		value != null &&
		typeof value === "object" &&
		"error" in value &&
		value.error != null &&
		typeof (value as { error: unknown }).error === "object" &&
		"message" in (value as { error: Record<string, unknown> }).error
	);
}

function messageFromPayload(data: unknown): string | null {
	if (data == null || typeof data !== "object") return null;
	if ("error" in data && data.error != null && typeof data.error === "object" && "message" in data.error) {
		const msg = (data.error as { message?: unknown }).message;
		if (typeof msg === "string" && msg.trim()) return msg;
		if (Array.isArray(msg)) return msg.map(String).join(". ") || null;
	}
	if ("message" in data) {
		const msg = (data as { message: unknown }).message;
		if (typeof msg === "string" && msg.trim()) return msg;
		if (Array.isArray(msg)) return msg.map(String).join(". ") || null;
	}
	return null;
}

function apiErrorFromAxios(error: AxiosError): ApiError {
	const data = error.response?.data;
	const message = messageFromPayload(data);
	if (message) return { message };
	return {
		message: error.message || "Network or server error",
	};
}

export async function request<T>(
	method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
	url: string,
	payload?: unknown,
	config?: AxiosRequestConfig
): Promise<ApiResult<T>> {
	try {
		const response = await api.request<BackendBody<T> | T>({
			method,
			url,
			data: payload,
			...config,
		});
		const body = response.data;

		if (isBackendErrorBody(body)) {
			return {
				data: null,
				error: { message: body.error.message },
			};
		}

		return { data: body as T, error: null };
	} catch (err) {
		if (err instanceof AxiosError) {
			return { data: null, error: apiErrorFromAxios(err) };
		}
		return {
			data: null,
			error: { message: err instanceof Error ? err.message : "Unknown error" },
		};
	}
}

export const get = <T>(url: string, config?: AxiosRequestConfig) =>
	request<T>("GET", url, undefined, config);

export const post = <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
	request<T>("POST", url, data, config);

export const put = <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
	request<T>("PUT", url, data, config);

export const patch = <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
	request<T>("PATCH", url, data, config);

export const del = <T>(url: string, config?: AxiosRequestConfig) =>
	request<T>("DELETE", url, undefined, config);

export function unwrapOrThrow<T>(result: ApiResult<T>): T {
	console.log("result: ", result);
	if (result.error) {
		const e = new Error(result.error.message) as Error & { apiError?: ApiError };
		e.apiError = result.error;
		throw e;
	}

	if (result.data === null) {
		throw new Error("Unexpected null data");
	}

	return result.data;
}

export function getApiErrorMessage(err: unknown): string {
	if (axios.isAxiosError(err)) {
		const msg = messageFromPayload(err.response?.data);
		if (msg) return msg;
		return err.message || "Error de red o servidor.";
	}
	const withApi = err as Error & { apiError?: ApiError };
	if (err instanceof Error && withApi.apiError?.message) return withApi.apiError.message;
	if (err instanceof Error && err.message) return err.message;
	return "Ha ocurrido un error.";
}
