import { useEffect } from "react";
import { useRouter } from "next/router";
import { CircularProgress, Stack } from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RegisterExpenseForm } from "@/components/GeneralExpenses";
import { getGeneralExpenseById } from "@/services/general-expenses.service";
import { useSnackbarStore } from "@/store/useSnackbarStore";

export default function EditGeneralExpensePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const showError = useSnackbarStore((state) => state.showError);
  const expenseId = typeof router.query.id === "string" ? router.query.id : "";

  const { data: expense, isLoading, isError, error } = useQuery({
    queryKey: ["general-expense", expenseId],
    queryFn: async () => {
      const result = await getGeneralExpenseById(expenseId);
      if (result.error) throw new Error(result.error.message);
      return result.data ?? null;
    },
    enabled: router.isReady && Boolean(expenseId),
  });

  useEffect(() => {
    if (isError) {
      showError(error?.message ?? "No se pudo cargar el gasto");
      void router.push("/facturas/gastos-generales");
    }
  }, [isError, error, showError, router]);

  if (!router.isReady || isLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" py={8}>
        <CircularProgress size={32} />
      </Stack>
    );
  }

  if (!expense) {
    return null;
  }

  return (
    <RegisterExpenseForm
      expense={expense}
      onSuccess={async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["general-expenses"] }),
          queryClient.invalidateQueries({ queryKey: ["general-expenses-summary"] }),
          queryClient.invalidateQueries({ queryKey: ["general-expense", expenseId] }),
        ]);
      }}
    />
  );
}
