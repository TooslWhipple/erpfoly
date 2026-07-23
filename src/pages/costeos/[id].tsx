import { Alert, Button, Skeleton, Stack } from "@mui/material";
import { TabFilters } from "@/components";
import type { ActionButtonConfig } from "@/components/TabFilters";
import { CosteoDetailHeader } from "@/components/CosteoDetail";
import {
  AddCosteoExpenseModal,
  AddCosteoInvoiceModal,
  CosteoArticlesTab,
  CosteoCostingTab,
  CosteoExpensesTab,
  CosteoInvoicesTab,
  CosteoTermsFreightTab,
} from "@/components/CosteoDetailTabs";
import { useCosteoDetail } from "@/hooks/costeos/useCosteoDetail";

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
            onClick: () => setInvoiceModalOpen(true),
            variant: "option",
            color: "inherit",
            showIcon: true,
          },
        ]
        : undefined;

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
        destination={detail.destination}
        deliveryDate={detail.deliveryDate}
        status={detail.status}
        progress={detail.progress}
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
        activeTab === "terms_freight" &&
        <CosteoTermsFreightTab terms={detail.termsFreight} />
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

      <AddCosteoInvoiceModal
        open={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        availableInvoices={detail.availableInvoices}
        saving={saving}
        onSubmit={handleAddInvoices}
      />
    </Stack>
  );
}
