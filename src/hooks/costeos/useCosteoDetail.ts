import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  addCosteoExpense,
  addCosteoInvoices,
  getCosteoById,
  removeCosteoExpense,
  saveCosteoDetail,
} from "@/services/costeos.service";
import type {
  AddCosteoExpensePayload,
  CosteoDetail,
  CosteoDetailTab,
} from "@/types/costeos.types";

const DETAIL_TABS: Array<{ value: CosteoDetailTab; label: string }> = [
  { value: "articles", label: "Artículos" },
  { value: "expenses", label: "Gastos" },
  { value: "costing", label: "Costeos" },
  { value: "terms_freight", label: "Plazos y Fletes" },
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

  const fetchDetail = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getCosteoById(id);
      if (!result) {
        setDetail(null);
        setError("Costeo no encontrado");
        return;
      }
      setDetail(result);
      setExchangeRateDraft(String(result.exchangeRate));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al cargar el costeo";
      setError(message);
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

  const handleReceivedChange = (articleId: string, received: number) => {
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
      const saved = await saveCosteoDetail(detail.id, {
        exchangeRate: detail.exchangeRate,
        affectArticlePrices: detail.affectArticlePrices,
        articles: detail.articles,
      });
      setDetail(saved);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo guardar el costeo";
      setError(message);
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
      const updated = await addCosteoExpense(detail.id, payload);
      setDetail(updated);
      setExpenseModalOpen(false);
      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo agregar el gasto";
      setError(message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveExpense = async (expenseId: string) => {
    if (!detail) return;
    setSaving(true);
    try {
      const updated = await removeCosteoExpense(detail.id, expenseId);
      setDetail(updated);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo eliminar el gasto";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddInvoices = async (invoiceIds: string[]) => {
    if (!detail) return false;
    setSaving(true);
    try {
      const updated = await addCosteoInvoices(detail.id, invoiceIds);
      setDetail(updated);
      setInvoiceModalOpen(false);
      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudieron agregar facturas";
      setError(message);
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
    isEditingExchangeRate,
    exchangeRateDraft,
    setExpenseModalOpen,
    setInvoiceModalOpen,
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
