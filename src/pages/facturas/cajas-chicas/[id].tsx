import { useEffect } from "react";
import { useRouter } from "next/router";
import { CircularProgress, Stack } from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ExpenseRequestForm } from "@/components/ExpenseRequests";
import { getPettyCashRequestById } from "@/services/petty-cash.service";
import { useSnackbarStore } from "@/store/useSnackbarStore";

export default function DetalleCajaChicaReembolsoPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const showError = useSnackbarStore((s) => s.showError);
  const requestId = typeof router.query.id === "string" ? router.query.id : "";

  const {
    data: request,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["petty-cash-request", requestId],
    queryFn: async () => {
      const result = await getPettyCashRequestById(requestId);
      if (result.error) throw new Error(result.error.message);
      return result.data ?? null;
    },
    enabled: router.isReady && Boolean(requestId),
  });

  useEffect(() => {
    if (isError) {
      showError(
        error?.message ?? "No se pudo cargar la solicitud de reembolso",
      );
      void router.push("/facturas/cajas-chicas");
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
      mode="petty-cash"
      request={request}
      onSuccess={async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["petty-cash-overview"] }),
          queryClient.invalidateQueries({ queryKey: ["petty-cash-requests"] }),
          queryClient.invalidateQueries({
            queryKey: ["petty-cash-movements"],
          }),
          queryClient.invalidateQueries({
            queryKey: ["petty-cash-request", requestId],
          }),
        ]);
      }}
    />
  );
}
