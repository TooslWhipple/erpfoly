import { useRouter } from "next/router";
import { useQueryClient } from "@tanstack/react-query";
import { RegisterExpenseForm } from "@/components/GeneralExpenses";

export default function NewGeneralExpensePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const initialSupplierName =
    typeof router.query.supplierName === "string"
      ? router.query.supplierName
      : undefined;
  const initialAmount =
    typeof router.query.amount === "string"
      ? Number.parseFloat(router.query.amount)
      : undefined;

  if (!router.isReady) {
    return null;
  }

  return (
    <RegisterExpenseForm
      initialSupplierName={initialSupplierName}
      initialAmount={
        initialAmount != null && Number.isFinite(initialAmount)
          ? initialAmount
          : undefined
      }
      onSuccess={async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["general-expenses"] }),
          queryClient.invalidateQueries({ queryKey: ["general-expenses-summary"] }),
          queryClient.invalidateQueries({
            queryKey: ["general-expenses-unassigned"],
          }),
        ]);
      }}
    />
  );
}
