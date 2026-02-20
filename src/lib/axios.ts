import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/useAuthStore";

export const api = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL,
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

/** Backend can send { data } on success or { error: { message } } on failure (even with 200) */
type BackendBody<T> =
	| { data: T; error?: never }
	| { error: { message: string; [k: string]: unknown }; data?: never };

/** True when the failed request was the refresh call (avoid retry loop). */
function isRefreshRequest(config: AxiosRequestConfig | undefined): boolean {
	const url = config?.url ?? "";
	return typeof url === "string" && url.includes("/auth/refresh");
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

api.interceptors.response.use(
	(response) => {
		const body = response.data as BackendBody<unknown> & { success?: boolean; data?: unknown };
		// Backend error shape: do not unwrap
		if (body?.error != null && typeof body.error === "object" && "message" in body.error) {
			return response;
		}
		// Success with optional unwrap: { success: true, data: X } -> response.data = X
		if (body?.success === true && body.data !== undefined) {
			response.data = body.data;
		}
		return response;
	},
	async (error: AxiosError) => {
		const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

		if (error.response?.status !== 401) {
			return Promise.reject(error);
		}

		// Refresh failed or this was the refresh request → session expired
		if (isRefreshRequest(originalRequest) || originalRequest._retry) {
			useAuthStore.getState().logout();
			if (typeof window !== "undefined") {
				window.location.href = "/login";
			}
			return Promise.reject(error);
		}

		if (isRefreshing) {
			// Wait for the in-flight refresh to finish, then retry or reject
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

		originalRequest._retry = true;
		isRefreshing = true;

		const { authService } = await import("@/services/auth.service");
		const result = await authService.refresh();
		if (result.error || !result.data?.accessToken) {
			processQueue(error, null);
			useAuthStore.getState().logout();
			if (typeof window !== "undefined") {
				window.location.href = "/login";
			}
			isRefreshing = false;
			return Promise.reject(error);
		}

		const newToken = result.data.accessToken;
		useAuthStore.getState().setToken(newToken);
		processQueue(null, newToken);
		isRefreshing = false;

		if (originalRequest.headers) {
			originalRequest.headers.Authorization = `Bearer ${newToken}`;
		}
		return api.request(originalRequest);
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

/** Successful POST etc. can return data with success and message */
export interface ApiSuccessPayload {
	success: true;
	message?: string;
}

export interface PaginatedResponse<T> {
	data: T[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

/** Result of a safe API call: either data or error, never throws */
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

function apiErrorFromAxios(error: AxiosError): ApiError {
	const data = error.response?.data;
	if (data != null && typeof data === "object" && "error" in data) {
		const err = (data as { error: { message?: string } }).error;
		if (err?.message) return { message: err.message };
	}
	if (data != null && typeof data === "object" && "message" in data) {
		const msg = (data as { message: string }).message;
		if (typeof msg === "string") return { message: msg };
	}
	return {
		message: error.message || "Network or server error",
	};
}

/**
 * Safe request: never throws. Returns { data, error }.
 * - Success: data is set, error is null (for POST, data may include success and message).
 * - Failure: error is set (with message), data is null.
 */
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
		// Unwrapped or raw success payload
		const data = (body as BackendBody<T>).data ?? (body as T);
		return { data, error: null };
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

/**
 * Throws if result has error; use when you want to propagate to TanStack Query or callers.
 * Use after request/get/post/etc. when you need the old "throw on error" behavior.
 */
export function unwrapOrThrow<T>(result: ApiResult<T>): T {
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
