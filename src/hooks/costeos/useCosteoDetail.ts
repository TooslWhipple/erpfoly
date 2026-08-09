import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { getApiErrorMessage, unwrapOrThrow } from "@/lib/axios";
import { allocateArticlesForDisplay } from "@/lib/costeo/allocateExpenses";
import {
  getCosteoById,
  saveCosteoDetail,
} from "@/services/costeos.service";
import {
  assignReceptionInvoices,
  getAvailablePayableInvoices,
  unassignReceptionInvoice,
  type AvailablePayableInvoice,
} from "@/services/recepcion-mercancias.service";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import type {
  AddCosteoExpensePayload,
  CosteoDetail,
  CosteoDetailTab,
  CosteoExpense,
  CosteoExpenseSummary,
} from "@/types/costeos.types";

const DETAIL_TABS: Array<{ value: CosteoDetailTab; label: string }> = [
  { value: "articles", label: "Artículos" },
  { value: "expenses", label: "Gastos" },
  { value: "costing", label: "Costeos" },
  { value: "invoices", label: "Facturas" },
];

const VAT_RATE = 0.16;

let localExpenseSeq = -1;

function nextLocalExpenseId(): number {
  localExpenseSeq -= 1;
  return localExpenseSeq;
}

function buildExpenseSummary(expenses: CosteoExpense[]): CosteoExpenseSummary {
  const subtotal = expenses.reduce((sum, expense) => sum + expense.subtotal, 0);
  const vat = expenses.reduce((sum, expense) => sum + expense.vat, 0);
  return { subtotal, vat, total: subtotal + vat };
}

function buildLocalExpense(payload: AddCosteoExpensePayload): CosteoExpense {
  const rate = payload.currency === "USD" ? payload.exchange_rate : 1;
  const subtotal = payload.amount * rate;
  const vat = subtotal * VAT_RATE;
  return {
    id: nextLocalExpenseId(),
    name: payload.name,
    currency: payload.currency,
    exchangeRate: payload.exchange_rate,
    amount: payload.amount,
    subtotal,
    vat,
    total: subtotal + vat,
    includedInInvoice: payload.included_in_invoice,
  };
}

export function useCosteoDetail() {
  const router = useRouter();
  const costeoId = Number(router.query.id);
  const showSuccess = useSnackbarStore((s) => s.showSuccess);

  const [detail, setDetail] = useState<CosteoDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingCosteo, setSavingCosteo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<CosteoDetailTab>("articles");
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [isEditingExchangeRate, setIsEditingExchangeRate] = useState(false);
  const [exchangeRateDraft, setExchangeRateDraft] = useState("");
  const [availableInvoices, setAvailableInvoices] = useState<AvailablePayableInvoice[]>([]);
  const [loadingAvailableInvoices, setLoadingAvailableInvoices] = useState(false);

  const fetchDetail = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getCosteoById(id);
      const data = unwrapOrThrow(result);
      setDetail(data);
      setExchangeRateDraft(String(data.exchangeRate));
    } catch (err) {
      setError(getApiErrorMessage(err));
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!router.isReady || Number.isNaN(costeoId)) return;
    void fetchDetail(costeoId);
  }, [router.isReady, costeoId, fetchDetail]);

  const breadcrumbItems = useMemo(() => {
    if (!detail) {
      return [{ label: "Costeos", href: "/costeos" }, { label: "Detalle" }];
    }
    return [
      { label: "Costeos", href: "/costeos" },
      { label: detail.supplier },
      { label: `Pedido ${detail.orderNumber}` },
    ];
  }, [detail]);

  const effectiveExchangeRate = useMemo(() => {
    if (!detail) return 1;
    if (isEditingExchangeRate) {
      const draftRate = Number.parseFloat(exchangeRateDraft.replace(",", "."));
      if (Number.isFinite(draftRate) && draftRate > 0) {
        return draftRate;
      }
    }
    return detail.exchangeRate;
  }, [detail, isEditingExchangeRate, exchangeRateDraft]);

  const costingArticles = useMemo(() => {
    if (!detail) return [];
    return allocateArticlesForDisplay(
      detail.articles,
      detail.expenses,
      detail.affectArticlePrices,
      effectiveExchangeRate,
    );
  }, [detail, effectiveExchangeRate]);

  const handleTabChange = (value: string) => {
    setActiveTab(value as CosteoDetailTab);
  };

  const handleBack = () => {
    void router.push("/costeos");
  };

  const handleReceivedChange = (articleId: number, received: number) => {
    setDetail((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        articles: prev.articles.map((article) =>
          article.id === articleId ? { ...article, received } : article,
        ),
      };
    });
  };

  const handleAffectPricesChange = (checked: boolean) => {
    setDetail((prev) =>
      prev ? { ...prev, affectArticlePrices: checked } : prev,
    );
  };

  const handleSave = async () => {
    if (!detail || savingCosteo) return;
    setSavingCosteo(true);
    setError(null);
    try {
      const result = await saveCosteoDetail(detail.id, {
        exchange_rate: detail.exchangeRate,
        affect_article_prices: detail.affectArticlePrices,
        items: detail.articles.map((article) => ({
          id: article.id,
          received: article.received,
        })),
        expenses: detail.expenses.map((expense) => ({
          ...(expense.id > 0 ? { id: expense.id } : {}),
          name: expense.name,
          currency: expense.currency,
          exchange_rate: expense.exchangeRate,
          amount: expense.amount,
          included_in_invoice: expense.includedInInvoice,
        })),
      });
      unwrapOrThrow(result);
      showSuccess("El costeo se guardó correctamente.");
      void router.push("/costeos");
    } catch (err) {
      setError(getApiErrorMessage(err));
      setSavingCosteo(false);
    }
  };

  const handleStartEditExchangeRate = () => {
    if (!detail) return;
    setExchangeRateDraft(String(detail.exchangeRate));
    setIsEditingExchangeRate(true);
  };

  const handleConfirmExchangeRate = () => {
    const parsed = Number.parseFloat(exchangeRateDraft.replace(",", "."));
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    setDetail((prev) => (prev ? { ...prev, exchangeRate: parsed } : prev));
    setIsEditingExchangeRate(false);
  };

  const handleCancelExchangeRate = () => {
    if (detail) {
      setExchangeRateDraft(String(detail.exchangeRate));
    }
    setIsEditingExchangeRate(false);
  };

  const handleAddExpense = async (payload: AddCosteoExpensePayload) => {
    if (!detail) return false;
    const expense = buildLocalExpense(payload);
    setDetail((prev) => {
      if (!prev) return prev;
      const expenses = [...prev.expenses, expense];
      return {
        ...prev,
        expenses,
        expenseSummary: buildExpenseSummary(expenses),
      };
    });
    setExpenseModalOpen(false);
    return true;
  };

  const handleRemoveExpense = (expenseId: number) => {
    setDetail((prev) => {
      if (!prev) return prev;
      const expenses = prev.expenses.filter((expense) => expense.id !== expenseId);
      return {
        ...prev,
        expenses,
        expenseSummary: buildExpenseSummary(expenses),
      };
    });
  };

  const loadAvailableInvoices = useCallback(async () => {
    if (!detail?.receptionId) {
      setAvailableInvoices([]);
      return;
    }
    setLoadingAvailableInvoices(true);
    try {
      const result = await getAvailablePayableInvoices(
        detail.supplierId,
        detail.receptionId,
      );
      if (result.error || !result.data) {
        setError(result.error?.message ?? "No se pudieron cargar las facturas");
        setAvailableInvoices([]);
        return;
      }
      setAvailableInvoices(result.data);
    } finally {
      setLoadingAvailableInvoices(false);
    }
  }, [detail]);

  const openInvoiceModal = () => {
    setInvoiceModalOpen(true);
    void loadAvailableInvoices();
  };

  const handleAddInvoices = async (payableInvoiceIds: number[]) => {
    if (!detail?.receptionId) return false;
    setSaving(true);
    try {
      await assignReceptionInvoices(detail.receptionId, payableInvoiceIds);
      const refreshed = await getCosteoById(detail.id);
      const updated = unwrapOrThrow(refreshed);
      setDetail((prev) =>
        prev
          ? {
              ...updated,
              // Keep local draft expenses / switch / TC across invoice refresh.
              expenses: prev.expenses,
              expenseSummary: prev.expenseSummary,
              affectArticlePrices: prev.affectArticlePrices,
              exchangeRate: prev.exchangeRate,
            }
          : updated,
      );
      setInvoiceModalOpen(false);
      void loadAvailableInvoices();
      return true;
    } catch (err) {
      setError(getApiErrorMessage(err));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveInvoice = async (payableInvoiceId: number) => {
    if (!detail?.receptionId) return;
    setSaving(true);
    try {
      await unassignReceptionInvoice(detail.receptionId, payableInvoiceId);
      const refreshed = await getCosteoById(detail.id);
      const updated = unwrapOrThrow(refreshed);
      setDetail((prev) =>
        prev
          ? {
              ...updated,
              expenses: prev.expenses,
              expenseSummary: prev.expenseSummary,
              affectArticlePrices: prev.affectArticlePrices,
              exchangeRate: prev.exchangeRate,
            }
          : updated,
      );
      void loadAvailableInvoices();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return {
    routerReady: router.isReady,
    costeoId,
    detail,
    costingArticles,
    effectiveExchangeRate,
    loading,
    saving,
    savingCosteo,
    error,
    activeTab,
    tabs: DETAIL_TABS,
    breadcrumbItems,
    expenseModalOpen,
    invoiceModalOpen,
    availableInvoices,
    loadingAvailableInvoices,
    isEditingExchangeRate,
    exchangeRateDraft,
    setExpenseModalOpen,
    setInvoiceModalOpen,
    openInvoiceModal,
    handleTabChange,
    handleBack,
    handleReceivedChange,
    handleAffectPricesChange,
    handleSave,
    handleStartEditExchangeRate,
    handleConfirmExchangeRate,
    handleCancelExchangeRate,
    setExchangeRateDraft,
    handleAddExpense,
    handleRemoveExpense,
    handleAddInvoices,
    handleRemoveInvoice,
    refetch: () => {
      if (!Number.isNaN(costeoId)) void fetchDetail(costeoId);
    },
  };
}
