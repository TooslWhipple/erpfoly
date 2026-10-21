import { useQuery } from "@tanstack/react-query";
import { unwrapOrThrow } from "@/lib/axios";
import { getHandoverSaleDetail } from "@/services/sale-handover.service";

export const handoverSaleDetailKey = (saleId: number, branchId: number) =>
  ["sale-handover", "detail", saleId, branchId] as const;

export function useHandoverSaleDetail(
  saleId: number | null,
  branchId: number | null,
) {
  const enabled = saleId !== null && branchId !== null;
  return useQuery({
    queryKey: handoverSaleDetailKey(saleId ?? 0, branchId ?? 0),
    queryFn: async () =>
      unwrapOrThrow(
        await getHandoverSaleDetail(saleId as number, branchId as number, {
          skipGlobalErrorToast: true,
        }),
      ),
    enabled,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}
