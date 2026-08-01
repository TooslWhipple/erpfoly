import type { CostBasisForCalculation } from "@/types/productos.types";

export type ProductCostFields = {
  listCost: number;
  lastCost: number;
  averageCost: number;
  costBasis: CostBasisForCalculation | string | null | undefined;
};

/**
 * Cost used for price previews from the selected basis.
 * Falls back to list cost when the chosen value is missing or zero.
 */
export function resolveEffectiveCost(fields: ProductCostFields): number {
  const listCost = Number.isFinite(fields.listCost) ? fields.listCost : 0;
  const lastCost = Number.isFinite(fields.lastCost) ? fields.lastCost : 0;
  const averageCost = Number.isFinite(fields.averageCost)
    ? fields.averageCost
    : 0;

  let selected: number;
  switch (fields.costBasis) {
    case "average_cost":
      selected = averageCost;
      break;
    case "list_cost":
      selected = listCost;
      break;
    case "last_cost":
    default:
      selected = lastCost;
      break;
  }

  if (selected > 0) {
    return selected;
  }
  return listCost > 0 ? listCost : 0;
}

export function costBasisLabel(basis: CostBasisForCalculation | string): string {
  switch (basis) {
    case "average_cost":
      return "costo promedio";
    case "list_cost":
      return "costo de lista";
    case "last_cost":
    default:
      return "último costo";
  }
}
