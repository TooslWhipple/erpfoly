import { useRouter } from "next/router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CircularProgress, Stack, Typography } from "@mui/material";
import { RegisterExpenseForm } from "@/components/GeneralExpenses";
import { getGeneralExpenseById } from "@/services/general-expenses.service";

export default function EditGeneralExpensePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const rawId = router.query.id;
  const id = typeof rawId === "string" ? rawId : undefined;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["general-expense", id],
    enabled: Boolean(router.isReady && id),
    queryFn: async () => {
      if (!id) return null;
      const result = await getGeneralExpenseById(id);
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data ?? null;
    },
  });

  if (!router.isReady || isLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" py={8} spacing={2}>
        <CircularProgress size={28} />
        <Typography variant="body2" color="text.secondary">
          Cargando gasto...
        </Typography>
      </Stack>
    );
  }

  if (isError || !data) {
    return (
      <Stack alignItems="center" justifyContent="center" py={8} spacing={1}>
        <Typography variant="h6">No se encontró el gasto</Typography>
        <Typography variant="body2" color="text.secondary">
          {error instanceof Error
            ? error.message
            : "Verifica que el registro exista."}
        </Typography>
      </Stack>
    );
  }

  return (
    <RegisterExpenseForm
      expense={data}
      onSuccess={async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["general-expenses"] }),
          queryClient.invalidateQueries({
            queryKey: ["general-expenses-summary"],
          }),
          queryClient.invalidateQueries({
            queryKey: ["general-expenses-unassigned"],
          }),
          queryClient.invalidateQueries({ queryKey: ["general-expense", id] }),
        ]);
      }}
    />
  );
}
