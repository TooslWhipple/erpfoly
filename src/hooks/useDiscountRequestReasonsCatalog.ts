import { useQuery } from "@tanstack/react-query";
import { getDiscountRequestReasonsCatalog } from "@/services/cotizaciones.service";

export function useDiscountRequestReasonsCatalog() {
  return useQuery({
    queryKey: ["catalog", "discount-request-reasons"],
    queryFn: async () => {
      const result = await getDiscountRequestReasonsCatalog();
      if (result.error) throw new Error(result.error.message);
      return result.data ?? [];
    },
    staleTime: 60 * 60 * 1000,
  });
}
