import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listHandoverBranches } from "@/services/sale-handover.service";
import { useAuthStore } from "@/store/useAuthStore";

export function useHandoverBranches() {
  const principalBranchId = useAuthStore((state) => state.user?.principalBranchId);
  const [picked, setPicked] = useState<number | "">("");
  const query = useQuery({
    queryKey: ["handover-branches"],
    queryFn: listHandoverBranches,
  });
  const branches = query.data ?? [];
  const branchId = branches.some((branch) => branch.id === picked)
    ? picked
    : (branches.find((branch) => branch.id === principalBranchId)?.id ??
      branches[0]?.id ??
      "");

  return {
    branches,
    branchId,
    setBranchId: setPicked,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
