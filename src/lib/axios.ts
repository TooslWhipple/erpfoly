import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/useAuthStore";

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
