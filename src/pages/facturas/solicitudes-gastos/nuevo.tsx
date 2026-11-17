import { useRouter } from "next/router";
import { useQueryClient } from "@tanstack/react-query";
import { ExpenseRequestForm } from "@/components/ExpenseRequests";
import type { ExpenseRequestClassification } from "@/types/expense-requests.types";

export default function NewExpenseRequestPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const classification =
    typeof router.query.classification === "string" &&
    ["VIATICOS", "SOLICITUD_GASTOS"].includes(
      router.query.classification,
    )
      ? (router.query.classification as ExpenseRequestClassification)
      : "VIATICOS";

  if (!router.isReady) {
    return null;
  }

  return (
    <ExpenseRequestForm
      initialClassification={classification}
      onSuccess={async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["expense-requests"] }),
          queryClient.invalidateQueries({
            queryKey: ["expense-requests-summary"],
          }),
        ]);
      }}
    />
  );
}

