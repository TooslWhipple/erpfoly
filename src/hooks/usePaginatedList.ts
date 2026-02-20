import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";

export interface PaginatedListParams {
    page: number;
    limit: number;
    search?: string;
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
    queryFn: (params: PaginatedListParams) => Promise<{
        data: T[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    initialPage?: number;
    initialRowsPerPage?: number;
    initialSearch?: string;
}

/**
 * Generic hook for paginated list data. Manages page, rowsPerPage and search state,
 * and runs a TanStack Query with params derived from that state.
 * API is expected to use 1-based page; this hook converts from 0-based UI state.
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
        queryFn: () =>
            queryFn({
                page: apiPage,
                limit: rowsPerPage,
                search: search || undefined,
            }),
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
