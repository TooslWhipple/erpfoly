import { useQuery } from "@tanstack/react-query";
import {
  getAutomatedCollectionMessageHistory,
  type AutomatedCollectionMessageHistoryResponse,
} from "@/services/automated-collection.service";

export function useAutomatedCollectionMessageHistory(
  ruleId: number | null,
  enabled: boolean
) {
  return useQuery<AutomatedCollectionMessageHistoryResponse, Error>({
    queryKey: ["automated-collection-message-history", ruleId],
    queryFn: async () => {
      const result = await getAutomatedCollectionMessageHistory(ruleId!, {
        page: 1,
        limit: 50,
      });
      if (result.error) {
        throw new Error(result.error.message);
      }
      if (!result.data) {
        throw new Error("No se pudo cargar el historial de mensajes.");
      }
      return result.data;
    },
    enabled: enabled && ruleId != null,
  });
}
