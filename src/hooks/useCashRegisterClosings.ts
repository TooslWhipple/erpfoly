import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CASH_REGISTER_CLOSINGS_KEY } from "@/lib/cashRegisterQueries";
import { fetchAssignedCashRegisterClosings } from "@/services/cash-register.service";
import { useAuthStore } from "@/store/useAuthStore";

const DEFAULT_LIMIT = 10;

export function useCashRegisterClosings(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;
  const user = useAuthStore((state) => state.user);
  const [page, setPage] = useState(0); // 0-indexed for TableCrud
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_LIMIT);

  const canFetch = Boolean(user?.id) && enabled;

  const query = useQuery({
    queryKey: [
      ...CASH_REGISTER_CLOSINGS_KEY,
      "assigned",
      page,
      rowsPerPage,
    ],
    queryFn: () =>
      fetchAssignedCashRegisterClosings({
        page: page + 1,
        limit: rowsPerPage,
      }),
    enabled: canFetch,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const handleRowsPerPageChange = (next: number) => {
    setRowsPerPage(next);
    setPage(0);
  };

  return {
    rows: query.data?.rows ?? [],
    total: query.data?.total ?? 0,
    cashRegisterId: query.data?.cash_register_id ?? null,
    cashRegisterName: query.data?.cash_register_name ?? null,
    page,
    rowsPerPage,
    setPage,
    setRowsPerPage: handleRowsPerPageChange,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
