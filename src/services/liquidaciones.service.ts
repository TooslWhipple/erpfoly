import { get, post, put, unwrapOrThrow } from "@/lib/axios";
import type {
  DepartmentDetail,
  LiquidationRule,
  LiquidationRuleActivityResponse,
  LowRotationStrategyResponse,
  PaginatedPriceSuggestions,
} from "@/types/liquidaciones.types";

const BASE = "/liquidations";

export async function getLowRotationStrategy(): Promise<LowRotationStrategyResponse> {
  return unwrapOrThrow(
    await get<LowRotationStrategyResponse>(`${BASE}/strategy`),
  );
}

export async function getPriceSuggestions(params: {
  page: number;
  limit?: number;
  departmentId?: string;
  search?: string;
}): Promise<PaginatedPriceSuggestions> {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit ?? 10),
  });
  if (params.departmentId) {
    query.set("departmentId", params.departmentId);
  }
  if (params.search) {
    query.set("search", params.search);
  }
  return unwrapOrThrow(
    await get<PaginatedPriceSuggestions>(
      `${BASE}/suggestions?${query.toString()}`,
    ),
  );
}

export async function getDepartmentDetail(
  departmentId: string,
): Promise<DepartmentDetail | null> {
  try {
    return unwrapOrThrow(
      await get<DepartmentDetail>(`${BASE}/departments/${departmentId}`),
    );
  } catch {
    return null;
  }
}

export async function saveDepartmentRules(
  departmentId: string,
  rules: Array<
    Omit<LiquidationRule, "id" | "order"> & { id?: string }
  >,
): Promise<DepartmentDetail> {
  return unwrapOrThrow(
    await put<DepartmentDetail>(`${BASE}/departments/${departmentId}/rules`, {
      rules: rules.map((rule) => ({
        ...(rule.id && !rule.id.startsWith("tmp-")
          ? { id: Number(rule.id) }
          : {}),
        operator: rule.operator,
        value: rule.value,
        periodDays: rule.periodDays,
        promotionPercent: rule.promotionPercent,
        redLabelEnabled: rule.redLabelEnabled,
      })),
    }),
  );
}

export async function applyPriceSuggestion(
  suggestionId: string,
  price: number,
): Promise<void> {
  unwrapOrThrow(
    await post(`${BASE}/suggestions/${suggestionId}/apply`, { price }),
  );
}

export async function getLiquidationRuleActivity(
  ruleId: string,
): Promise<LiquidationRuleActivityResponse> {
  return unwrapOrThrow(
    await get<LiquidationRuleActivityResponse>(
      `${BASE}/rules/${ruleId}/activity`,
    ),
  );
}

export async function evaluateDepartment(
  departmentId: string,
): Promise<void> {
  unwrapOrThrow(await post(`${BASE}/departments/${departmentId}/evaluate`));
}
