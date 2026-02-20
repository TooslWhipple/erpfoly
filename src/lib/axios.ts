import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import { useSnackbarStore } from "@/store/useSnackbarStore";

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
		const body = response.data as { success?: boolean; data?: unknown };
		if (body?.success === true && body.data !== undefined) {
			response.data = body.data;
		}
		return response;
	},
	(error: AxiosError) => {
		if (error.response?.status === 401) {
			useAuthStore.getState().logout();
		} else {
			useSnackbarStore.getState().showError(getErrorMessage(error));
		}
		return Promise.reject(error);
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

export interface PaginatedResponse<T> {
	data: T[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export async function request<T>(
	method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
	url: string,
	data?: unknown,
	config?: AxiosRequestConfig
): Promise<T> {
	const response = await api.request<T>({
		method,
		url,
		data,
		...config,
	});
	return response.data;
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
