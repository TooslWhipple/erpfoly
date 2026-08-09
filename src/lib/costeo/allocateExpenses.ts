import type { CosteoArticle, CosteoExpense } from "@/types/costeos.types";
import { roundToCents } from "@/utils/number";

/** Converts MXN to USD using the costeo exchange rate. Returns 0 when rate is invalid. */
export function mxnToUsd(mxn: number, exchangeRate: number): number {
  if (!Number.isFinite(mxn) || !Number.isFinite(exchangeRate) || exchangeRate <= 0) {
    return 0;
  }
  return roundToCents(mxn / exchangeRate);
}

type CalcItem = {
  id: number;
  unitCost: number;
  totalCost: number;
  quantity: number;
};

type CalcResult = {
  id: number;
  expensesMxn: number;
  finalUnitCost: number;
};

/**
 * Same proration as apifoly costeo-calculations: proportional to totalCost,
 * remainder cents on the last item.
 */
export function allocateExpensesToItems(params: {
  items: CalcItem[];
  totalExpensesMxn: number;
  affectArticlePrices: boolean;
}): CalcResult[] {
  const { items, totalExpensesMxn, affectArticlePrices } = params;

  if (items.length === 0) {
    return [];
  }

  if (!affectArticlePrices || totalExpensesMxn <= 0) {
    return items.map((item) => ({
      id: item.id,
      expensesMxn: 0,
      finalUnitCost: roundToCents(item.unitCost),
    }));
  }

  const sumTotalCost = items.reduce(
    (sum, item) => sum + (Number.isFinite(item.totalCost) ? item.totalCost : 0),
    0,
  );

  if (sumTotalCost <= 0) {
    const equalShare = roundToCents(totalExpensesMxn / items.length);
    let assigned = 0;
    return items.map((item, index) => {
      const isLast = index === items.length - 1;
      const expensesMxn = isLast
        ? roundToCents(totalExpensesMxn - assigned)
        : equalShare;
      assigned = roundToCents(assigned + expensesMxn);
      const perUnit =
        item.quantity > 0 ? expensesMxn / item.quantity : expensesMxn;
      return {
        id: item.id,
        expensesMxn,
        finalUnitCost: roundToCents(item.unitCost + perUnit),
      };
    });
  }

  let assigned = 0;
  return items.map((item, index) => {
    const isLast = index === items.length - 1;
    const share = item.totalCost / sumTotalCost;
    const expensesMxn = isLast
      ? roundToCents(totalExpensesMxn - assigned)
      : roundToCents(totalExpensesMxn * share);
    assigned = roundToCents(assigned + expensesMxn);
    const perUnit =
      item.quantity > 0 ? expensesMxn / item.quantity : expensesMxn;
    return {
      id: item.id,
      expensesMxn,
      finalUnitCost: roundToCents(item.unitCost + perUnit),
    };
  });
}

/** Preview for Costeos tab: local proration without waiting for Save. */
export function allocateArticlesForDisplay(
  articles: CosteoArticle[],
  expenses: CosteoExpense[],
  affectArticlePrices: boolean,
  exchangeRate: number,
): CosteoArticle[] {
  const totalExpensesMxn = expenses.reduce(
    (sum, expense) => sum + (Number.isFinite(expense.subtotal) ? expense.subtotal : 0),
    0,
  );

  const allocations = allocateExpensesToItems({
    items: articles.map((article) => ({
      id: article.id,
      unitCost: article.unitCost,
      totalCost: article.totalCost,
      quantity: article.quantity,
    })),
    totalExpensesMxn,
    affectArticlePrices,
  });

  const byId = new Map(allocations.map((row) => [row.id, row]));

  return articles.map((article) => {
    const allocation = byId.get(article.id);
    if (!allocation) return article;
    const expensesMxn = allocation.expensesMxn;
    const costMxn =
      Number.isFinite(article.costMxn) && article.costMxn > 0
        ? article.costMxn
        : article.unitCost;
    const amountMxn =
      Number.isFinite(article.amountMxn) && article.amountMxn > 0
        ? article.amountMxn
        : article.totalCost;
    return {
      ...article,
      costUsd: mxnToUsd(costMxn, exchangeRate),
      amountUsd: mxnToUsd(amountMxn, exchangeRate),
      expensesMxn,
      expensesUsd: mxnToUsd(expensesMxn, exchangeRate),
      finalUnitCost: allocation.finalUnitCost,
    };
  });
}
