import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { getApiErrorMessage, unwrapOrThrow } from "@/lib/axios";
import {
  addCosteoExpense,
  addCosteoInvoices,
  getAvailableInvoices,
  getCosteoById,
  removeCosteoExpense,
  saveCosteoDetail,
} from "@/services/costeos.service";
import type {
  AddCosteoExpensePayload,
  AddCosteoInvoicePayload,
  CosteoAvailableInvoice,
  CosteoDetail,
  CosteoDetailTab,
} from "@/types/costeos.types";

const DETAIL_TABS: Array<{ value: CosteoDetailTab; label: string }> = [
  { value: "articles", label: "Artículos" },
  { value: "expenses", label: "Gastos" },
  { value: "costing", label: "Costeos" },
  { value: "invoices", label: "Facturas" },
];

export function useCosteoDetail() {
  const router = useRouter();
  const costeoId = Number(router.query.id);

  const [detail, setDetail] = useState<CosteoDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<CosteoDetailTab>("articles");
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [isEditingExchangeRate, setIsEditingExchangeRate] = useState(false);
  const [exchangeRateDraft, setExchangeRateDraft] = useState("");
  const [availableInvoices, setAvailableInvoices] = useState<CosteoAvailableInvoice[]>([]);
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
    setDetail((prev) => (prev ? { ...prev, affectArticlePrices: checked } : prev));
  };

  const handleSave = async () => {
    if (!detail) return;
    setSaving(true);
    setError(null);
    try {
      const result = await saveCosteoDetail(detail.id, {
        exchange_rate: detail.exchangeRate,
        affect_article_prices: detail.affectArticlePrices,
        items: detail.articles.map((article) => ({
          id: article.id,
          received: article.received,
        })),
      });
      const saved = unwrapOrThrow(result);
      setDetail(saved);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
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
    setSaving(true);
    try {
      const result = await addCosteoExpense(detail.id, payload);
      const updated = unwrapOrThrow(result);
      setDetail(updated);
      setExpenseModalOpen(false);
      return true;
    } catch (err) {
      setError(getApiErrorMessage(err));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveExpense = async (expenseId: number) => {
    if (!detail) return;
    setSaving(true);
    try {
      const result = await removeCosteoExpense(detail.id, expenseId);
      const updated = unwrapOrThrow(result);
      setDetail(updated);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const loadAvailableInvoices = useCallback(async (costeoIdValue: number) => {
    setLoadingAvailableInvoices(true);
    try {
      const result = await getAvailableInvoices(costeoIdValue);
      const data = unwrapOrThrow(result);
      setAvailableInvoices(data);
    } catch (err) {
      setError(getApiErrorMessage(err));
      setAvailableInvoices([]);
    } finally {
      setLoadingAvailableInvoices(false);
    }
  }, []);

  const openInvoiceModal = () => {
    setInvoiceModalOpen(true);
    if (costeoId && !Number.isNaN(costeoId)) {
      void loadAvailableInvoices(costeoId);
    }
  };

  const handleAddInvoices = async (payload: AddCosteoInvoicePayload) => {
    if (!detail) return false;
    setSaving(true);
    try {
      const result = await addCosteoInvoices(detail.id, payload);
      const updated = unwrapOrThrow(result);
      setDetail(updated);
      setAvailableInvoices(updated.availableInvoices);
      setInvoiceModalOpen(false);
      return true;
    } catch (err) {
      setError(getApiErrorMessage(err));
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    routerReady: router.isReady,
    costeoId,
    detail,
    loading,
    saving,
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
    refetch: () => {
      if (!Number.isNaN(costeoId)) void fetchDetail(costeoId);
    },
  };
}
