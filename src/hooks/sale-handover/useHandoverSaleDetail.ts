import { useQuery } from "@tanstack/react-query";
import { unwrapOrThrow } from "@/lib/axios";
import { getHandoverSaleDetail } from "@/services/sale-handover.service";

export const handoverSaleDetailKey = (saleId: number, branchId: number | "none") =>
  ["sale-handover", "detail", saleId, branchId] as const;

export function useHandoverSaleDetail(
  saleId: number | null,
  branchId: number | null,
) {
  const enabled = saleId !== null;
  return useQuery({
    queryKey: handoverSaleDetailKey(saleId ?? 0, branchId ?? "none"),
    queryFn: async () =>
      unwrapOrThrow(
        await getHandoverSaleDetail(saleId as number, branchId, {
          skipGlobalErrorToast: true,
        }),
      ),
    enabled,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}
