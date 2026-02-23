import { useQuery } from "@tanstack/react-query";
import { getClientes } from "@/services/clientes.service";
import { unwrapOrThrow } from "@/lib/axios";
import type { GetClientesResponse } from "@/types/clientes.types";

export function useClientes() {
  return useQuery({
    queryKey: ["clientes"],
    queryFn: async (): Promise<GetClientesResponse> => {
      const result = await getClientes();
      return unwrapOrThrow(result);
    },
  });
}
