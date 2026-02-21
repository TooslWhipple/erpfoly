import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ApiResult } from "@/lib/axios";

export interface PaginatedListParams {
    page: number;
    limit: number;
    search?: string;
}

export interface PaginatedListPayload<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface PaginatedListResult<T> {
    data: T[];
    total: number;
    totalPages: number;
    page: number;
    rowsPerPage: number;
    search: string;
    setPage: (page: number) => void;
    setRowsPerPage: (rowsPerPage: number) => void;
    setSearch: (search: string) => void;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => void;
}

export interface UsePaginatedListOptions<T> {
    queryKey: string[];
    /** API function that returns ApiResult; the hook unwraps and throws on error for React Query. */
    queryFn: (params: PaginatedListParams) => Promise<ApiResult<PaginatedListPayload<T>>>;
    initialPage?: number;
    initialRowsPerPage?: number;
    initialSearch?: string;
}

function unwrapApiResult<T>(result: ApiResult<T>): T {
    if (result.error) throw new Error(result.error.message);
    if (result.data === null) throw new Error("No data");
    return result.data;
}

/**
 * Paginated list hook. Manages page, rowsPerPage and search state, and runs a TanStack Query.
 * Accepts a service that returns ApiResult<PaginatedResponse> and unwraps internally.
 * API is expected to use 1-based page; the hook uses 0-based UI state.
 */
export function usePaginatedList<T>({
    queryKey,
    queryFn,
    initialPage = 0,
    initialRowsPerPage = 10,
    initialSearch = "",
}: UsePaginatedListOptions<T>): PaginatedListResult<T> {
    const [page, setPage] = useState(initialPage);
    const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
    const [search, setSearch] = useState(initialSearch);

    const apiPage = page + 1;

    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: [...queryKey, apiPage, rowsPerPage, search],
        queryFn: async () => {
            const result = await queryFn({
                page: apiPage,
                limit: rowsPerPage,
                search: search || undefined,
            });
            return unwrapApiResult(result);
        },
    });

    const setRowsPerPageAndResetPage = useCallback((newRowsPerPage: number) => {
        setRowsPerPage(newRowsPerPage);
        setPage(0);
    }, []);

    const setSearchAndResetPage = useCallback((newSearch: string) => {
        setSearch(newSearch);
        setPage(0);
    }, []);

    return {
        data: data?.data ?? [],
        total: data?.total ?? 0,
        totalPages: data?.totalPages ?? 0,
        page,
        rowsPerPage,
        search,
        setPage,
        setRowsPerPage: setRowsPerPageAndResetPage,
        setSearch: setSearchAndResetPage,
        isLoading,
        isError,
        error: error ?? null,
        refetch,
    };
}
