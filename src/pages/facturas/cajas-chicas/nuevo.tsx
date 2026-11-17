import { useRouter } from "next/router";
import { useQueryClient } from "@tanstack/react-query";
import { ExpenseRequestForm } from "@/components/ExpenseRequests";

export default function NuevaCajaChicaReembolsoPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const branchId =
    typeof router.query.branchId === "string"
      ? router.query.branchId
      : undefined;

  return (
    <ExpenseRequestForm
      mode="petty-cash"
      initialClassification="CAJA_CHICA"
      initialBranchId={branchId}
      onSuccess={async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["petty-cash-overview"] }),
          queryClient.invalidateQueries({ queryKey: ["petty-cash-requests"] }),
        ]);
      }}
    />
  );
}
