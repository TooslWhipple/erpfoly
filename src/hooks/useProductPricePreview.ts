import { useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getProductPricePreview } from "@/services/productos.service";

const DEBOUNCE_MS = 400;

/** Precio de lista (costo/(1-margen)*IVA, redondeado a la centena: techo .99 o piso .00) calculado en Apifoly, debounced. */
export function useProductPricePreview(
  costo: number,
  marginPercent: number,
  options?: { enabled?: boolean; iva?: number },
) {
  const debouncedCosto = useDebouncedValue(costo, DEBOUNCE_MS);
  const debouncedMarginPercent = useDebouncedValue(marginPercent, DEBOUNCE_MS);
  const iva = options?.iva;
  const debouncedIva = useDebouncedValue(iva ?? null, DEBOUNCE_MS);
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
      debouncedIva,
    ],
    queryFn: async () => {
      const result = await getProductPricePreview(
        debouncedCosto,
        debouncedMarginPercent,
        debouncedIva ?? undefined,
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
