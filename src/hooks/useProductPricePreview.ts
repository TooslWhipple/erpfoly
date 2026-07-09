import { useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getProductPricePreview } from "@/services/productos.service";

const DEBOUNCE_MS = 400;

/** Precio de lista (costo/(1-margen)*IVA, redondeado a .99) calculado en Apifoly, debounced. */
export function useProductPricePreview(
  costo: number,
  marginPercent: number,
  options?: { enabled?: boolean },
) {
  const debouncedCosto = useDebouncedValue(costo, DEBOUNCE_MS);
  const debouncedMarginPercent = useDebouncedValue(marginPercent, DEBOUNCE_MS);
  const enabled =
    (options?.enabled ?? true) &&
    debouncedCosto > 0 &&
    Number.isFinite(debouncedMarginPercent);

  const query = useQuery({
    queryKey: [
      "products",
      "price-preview",
      debouncedCosto,
      debouncedMarginPercent,
    ],
    queryFn: async () => {
      const result = await getProductPricePreview(
        debouncedCosto,
        debouncedMarginPercent,
      );
      if (result.error) {
        throw new Error(result.error.message);
      }
      return {
        subtotal: result.data?.subtotal ?? 0,
        price: result.data?.price ?? 0,
      };
    },
    enabled,
  });

  return {
    subtotal: query.data?.subtotal ?? 0,
    price: query.data?.price ?? 0,
    isLoading: enabled && query.isFetching,
    isError: query.isError,
  };
}
