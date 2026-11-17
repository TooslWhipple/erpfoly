import { useEffect } from "react";
import { useRouter } from "next/router";
import { CircularProgress, Stack } from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ExpenseRequestForm } from "@/components/ExpenseRequests";
import { getExpenseRequestById } from "@/services/expense-requests.service";
import { useSnackbarStore } from "@/store/useSnackbarStore";

export default function EditExpenseRequestPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const showError = useSnackbarStore((state) => state.showError);
  const requestId = typeof router.query.id === "string" ? router.query.id : "";

  const {
    data: request,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["expense-request", requestId],
    queryFn: async () => {
      const result = await getExpenseRequestById(requestId);
      if (result.error) throw new Error(result.error.message);
      return result.data ?? null;
    },
    enabled: router.isReady && Boolean(requestId),
  });

  useEffect(() => {
    if (isError) {
      showError(error?.message ?? "No se pudo cargar la solicitud de gastos");
      void router.push("/facturas/solicitudes-gastos");
    }
  }, [isError, error, showError, router]);

  if (!router.isReady || isLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" py={8}>
        <CircularProgress size={32} />
      </Stack>
    );
  }

  if (!request) {
    return null;
  }

  return (
    <ExpenseRequestForm
      request={request}
      onSuccess={async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["expense-requests"] }),
          queryClient.invalidateQueries({
            queryKey: ["expense-requests-summary"],
          }),
          queryClient.invalidateQueries({
            queryKey: ["expense-request", requestId],
          }),
        ]);
      }}
    />
  );
}

