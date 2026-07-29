import { Alert, Button, Skeleton, Stack } from "@mui/material";
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
import { costeoInvoiceToSelectable } from "@/components/CosteoDetailTabs/costeoInvoiceAdapter";
import { useCosteoDetail } from "@/hooks/costeos/useCosteoDetail";
import type { SelectableInvoice } from "@/types/invoice-selector.types";

export default function CosteoDetailPage() {
  const {
    routerReady,
    detail,
    loading,
    saving,
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
          },
        ]
        : undefined;

  const handleConfirmInvoices = async (selected: SelectableInvoice[]) => {
    await handleAddInvoices({
      supplier_invoice_ids: selected.map((invoice) => Number(invoice.id)),
    });
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
    <Stack spacing={3}>
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
        saving={saving}
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
          onRemoveExpense={(expenseId) => void handleRemoveExpense(expenseId)}
        />
      }

      {
        activeTab === "costing" &&
        <CosteoCostingTab articles={detail.articles} />
      }

      {
        activeTab === "invoices" &&
        <CosteoInvoicesTab
          invoices={detail.invoices}
          summary={detail.billingSummary}
        />
      }

      <AddCosteoExpenseModal
        open={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
        defaultExchangeRate={detail.exchangeRate}
        saving={saving}
        onSubmit={handleAddExpense}
      />

      <InvoiceSelectorModal
        open={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        availableInvoices={availableInvoices.map(costeoInvoiceToSelectable)}
        linkedInvoiceIds={detail.invoices.map((invoice) => String(invoice.id))}
        loading={loadingAvailableInvoices}
        onConfirm={handleConfirmInvoices}
      />
    </Stack>
  );
}
