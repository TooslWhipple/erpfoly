import {
  Alert,
  Backdrop,
  Button,
  CircularProgress,
  Skeleton,
  Stack,
} from "@mui/material";
import { InvoiceSelectorModal, TabFilters } from "@/components";
import type { ActionButtonConfig } from "@/components/TabFilters";
import { CosteoDetailHeader } from "@/components/CosteoDetail";
import {
  AddCosteoExpenseModal,
  CosteoArticlesTab,
  CosteoCostingTab,
  CosteoExpensesTab,
  CosteoInvoicesTab,
} from "@/components/CosteoDetailTabs";
import { payableToSelectableForCosteo } from "@/components/CosteoDetailTabs/costeoInvoiceAdapter";
import { useCosteoDetail } from "@/hooks/costeos/useCosteoDetail";
import type { SelectableInvoice } from "@/types/invoice-selector.types";
import { useMemo } from "react";

export default function CosteoDetailPage() {
  const {
    routerReady,
    detail,
    costingArticles,
    effectiveExchangeRate,
    loading,
    saving,
    savingCosteo,
    error,
    activeTab,
    tabs,
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
    refetch,
  } = useCosteoDetail();

  const tabActions: ActionButtonConfig[] | undefined =
    activeTab === "expenses"
      ? [
        {
          label: "Agregar gasto",
          onClick: () => setExpenseModalOpen(true),
          variant: "option",
          color: "inherit",
          showIcon: true,
          disabled: savingCosteo,
        },
      ]
      : activeTab === "invoices"
        ? [
          {
            label: "Agregar factura",
            onClick: openInvoiceModal,
            variant: "option",
            color: "inherit",
            showIcon: true,
            disabled: savingCosteo,
          },
        ]
        : undefined;

  const linkedInvoiceIds = useMemo(
    () => (detail?.invoices ?? []).map((invoice) => `payable-${invoice.id}`),
    [detail?.invoices],
  );

  const selectableAvailableInvoices = useMemo(
    () => availableInvoices.map(payableToSelectableForCosteo),
    [availableInvoices],
  );

  const handleConfirmInvoices = async (selected: SelectableInvoice[]) => {
    const payableIds = selected
      .map((invoice) => Number(invoice.id.replace(/^payable-/, "")))
      .filter((id) => Number.isFinite(id) && id > 0);
    if (payableIds.length === 0) return;
    await handleAddInvoices(payableIds);
  };

  const handleConfirmRemoveInvoice = async (invoiceId: string) => {
    const payableId = Number(invoiceId.replace(/^payable-/, ""));
    if (!Number.isFinite(payableId) || payableId <= 0) return;
    await handleRemoveInvoice(payableId);
  };

  if (!routerReady || loading) {
    return (
      <Stack spacing={3}>
        <Skeleton variant="rounded" height={40} width="40%" />
        <Skeleton variant="rounded" height={120} />
        <Skeleton variant="rounded" height={48} />
        <Skeleton variant="rounded" height={320} />
      </Stack>
    );
  }

  if (error && !detail) {
    return (
      <Stack spacing={2}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={refetch}>
              Reintentar
            </Button>
          }
        >
          {error}
        </Alert>
        <Button variant="outlined" onClick={handleBack}>
          Volver a costeos
        </Button>
      </Stack>
    );
  }

  if (!detail) {
    return (
      <Alert severity="info">No se encontró el costeo solicitado.</Alert>
    );
  }

  return (
    <>
      <Stack
        spacing={3}
        sx={savingCosteo ? { pointerEvents: "none", opacity: 0.7 } : undefined}
      >
        <CosteoDetailHeader
          breadcrumbItems={breadcrumbItems}
          supplier={detail.supplier}
          supplierDate={detail.supplierDate}
          branchName={detail.branch.name}
          deliveryDate={detail.deliveryDate}
          receptionDate={detail.receptionDate}
          status={detail.status}
          exchangeRate={detail.exchangeRate}
          isEditingExchangeRate={isEditingExchangeRate}
          exchangeRateDraft={exchangeRateDraft}
          saving={savingCosteo}
          onBack={handleBack}
          onSave={() => void handleSave()}
          onStartEditExchangeRate={handleStartEditExchangeRate}
          onExchangeRateDraftChange={setExchangeRateDraft}
          onConfirmExchangeRate={handleConfirmExchangeRate}
          onCancelExchangeRate={handleCancelExchangeRate}
        />

        {
          error && <Alert severity="warning">{error}</Alert>
        }

        <TabFilters
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          actions={tabActions}
          disabled={savingCosteo}
        />

        {
          activeTab === "articles" &&
          <CosteoArticlesTab
            articles={detail.articles}
            onReceivedChange={handleReceivedChange}
          />
        }

        {
          activeTab === "expenses" &&
          <CosteoExpensesTab
            expenses={detail.expenses}
            summary={detail.expenseSummary}
            affectArticlePrices={detail.affectArticlePrices}
            onAffectPricesChange={handleAffectPricesChange}
            onRemoveExpense={handleRemoveExpense}
          />
        }

        {
          activeTab === "costing" &&
          <CosteoCostingTab
            articles={costingArticles}
            exchangeRate={effectiveExchangeRate}
          />
        }

        {
          activeTab === "invoices" &&
          <CosteoInvoicesTab
            invoices={detail.invoices}
            summary={detail.billingSummary}
          />
        }

        <AddCosteoExpenseModal
          open={expenseModalOpen && !savingCosteo}
          onClose={() => setExpenseModalOpen(false)}
          defaultExchangeRate={detail.exchangeRate}
          saving={saving}
          onSubmit={handleAddExpense}
        />

        <InvoiceSelectorModal
          open={invoiceModalOpen && !savingCosteo}
          onClose={() => setInvoiceModalOpen(false)}
          availableInvoices={selectableAvailableInvoices}
          linkedInvoiceIds={linkedInvoiceIds}
          loading={loadingAvailableInvoices}
          onConfirm={handleConfirmInvoices}
        />
      </Stack>

      <Backdrop
        open={savingCosteo}
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.modal + 1 }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
}
