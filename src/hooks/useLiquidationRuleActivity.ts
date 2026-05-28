import { useQuery } from "@tanstack/react-query";
import { getLiquidationRuleActivity } from "@/data/liquidaciones.mockData";
import type { LiquidationRuleActivityResponse } from "@/types/liquidaciones.types";

export function useLiquidationRuleActivity(ruleId: string | null, enabled: boolean) {
  return useQuery<LiquidationRuleActivityResponse, Error>({
    queryKey: ["liquidation-rule-activity", ruleId],
    queryFn: () => getLiquidationRuleActivity(ruleId!),
    enabled: enabled && Boolean(ruleId),
  });
}
