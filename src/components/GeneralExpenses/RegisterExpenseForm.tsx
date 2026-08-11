import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { Button, CircularProgress, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Breadcrumbs, TabFilters } from "@/components";
import type { SelectOption } from "@/components/Form";
import { sanitizeDecimal } from "@/forms/validation/schemas";
import { buildBranchShares } from "@/data/general-expenses.mockData";
import {
  createGeneralExpense,
  getExpenseCategories,
  getExpenseResponsibles,
  searchExpenseSuppliers,
  searchSupplierInvoices,
  updateGeneralExpense,
} from "@/services/general-expenses.service";
import type {
  ApportionmentType,
  CreateGeneralExpensePayload,
  GeneralExpenseBranchShare,
  GeneralExpenseInvoice,
  GeneralExpenseListItem,
  GeneralExpensePayment,
} from "@/types/general-expenses.types";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { ExpenseApportionmentTab } from "./ExpenseApportionmentTab";
import { ExpenseDetailsTab } from "./ExpenseDetailsTab";
import type { ExpenseDetailsFormState } from "./ExpenseDetailsTab";
import { ExpenseInvoicesTab } from "./ExpenseInvoicesTab";
import { ExpensePaymentsTab } from "./ExpensePaymentsTab";
import { ExpenseSummaryPanel } from "./ExpenseSummaryPanel";
import { RegisterExpensePaymentModal } from "./RegisterExpensePaymentModal";
import {
  ContentLayout,
  FormCard,
  HeaderActions,
  MainPanel,
  PageContainer,
  PageHeaderRow,
  SaveButton,
  TabsSection,
} from "@/styles/facturas/registerExpense.styles";

type ExpenseFormTab = "details" | "invoices" | "payments" | "apportionment";

export interface RegisterExpenseFormProps {
  expense?: GeneralExpenseListItem | null;
  initialSupplierName?: string;
  initialAmount?: number;
  initialInvoices?: GeneralExpenseInvoice[];
  onSuccess?: (expense: GeneralExpenseListItem) => void;
}

const TAB_ITEMS = [
  { value: "details", label: "Detalles" },
  { value: "invoices", label: "Facturas" },
  { value: "payments", label: "Pagos" },
  { value: "apportionment", label: "Prorrateo" },
];

const EMPTY_DETAILS: ExpenseDetailsFormState = {
  assignToSupplier: true,
  supplierId: "",
  supplierName: "",
  paymentDetails: "",
  dueDate: "",
  category: "",
  isLocalPurchase: false,
  responsibleId: "",
  responsibleName: "",
  description: "",
  amount: "",
};

function parseAmount(value: string): number {
  const cleaned = value.replace(/[^\d.]/g, "");
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatAmountInput(value: number): string {
  if (!value) return "";
  return value.toFixed(2);
}

function recalculateShares(
  shares: GeneralExpenseBranchShare[],
  amount: number,
): GeneralExpenseBranchShare[] {
  return shares.map((share) => ({
    ...share,
    amount: Number(((amount * share.percentage) / 100).toFixed(2)),
  }));
}

function validateDetails(
  values: ExpenseDetailsFormState,
): Partial<Record<keyof ExpenseDetailsFormState, string>> {
  const errors: Partial<Record<keyof ExpenseDetailsFormState, string>> = {};

  if (values.assignToSupplier && !values.supplierId) {
    errors.supplierId = "Selecciona un proveedor";
  }
  if (!values.assignToSupplier && !values.paymentDetails.trim()) {
    errors.paymentDetails = "Ingresa los detalles del pago";
  }
  if (!values.dueDate) {
    errors.dueDate = "Selecciona la fecha de pago";
  }
  if (!values.category) {
    errors.category = "Selecciona una categoría";
  }
  const amount = parseAmount(values.amount);
  if (!values.amount.trim() || amount <= 0) {
    errors.amount = "El monto debe ser mayor a 0";
  }

  return errors;
}

export function RegisterExpenseForm({
  expense = null,
  initialSupplierName,
  initialAmount,
  initialInvoices,
  onSuccess,
}: RegisterExpenseFormProps) {
  const router = useRouter();
  const showError = useSnackbarStore((state) => state.showError);
  const showSuccess = useSnackbarStore((state) => state.showSuccess);
  const initializedRef = useRef(false);

  const [activeTab, setActiveTab] = useState<ExpenseFormTab>("details");
  const [details, setDetails] = useState<ExpenseDetailsFormState>(EMPTY_DETAILS);
  const [errors, setErrors] = useState<
    Partial<Record<keyof ExpenseDetailsFormState, string>>
  >({});
  const [requiresInvoice, setRequiresInvoice] = useState(true);
  const [invoices, setInvoices] = useState<GeneralExpenseInvoice[]>([]);
  const [payments, setPayments] = useState<GeneralExpensePayment[]>([]);
  const [searchMessage, setSearchMessage] = useState<string | undefined>();
  const [apportionEnabled, setApportionEnabled] = useState(false);
  const [apportionmentType, setApportionmentType] =
    useState<ApportionmentType>("sales_participation");
  const [applyToForeignBranches, setApplyToForeignBranches] = useState(true);
  const [branchShares, setBranchShares] = useState<GeneralExpenseBranchShare[]>(
    () => buildBranchShares(0),
  );
  const [singleBranchId, setSingleBranchId] = useState("b1");
  const [singleBranchName, setSingleBranchName] = useState("Ejercito");
  const [saving, setSaving] = useState(false);
  const [searchingInvoices, setSearchingInvoices] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const isEdit = Boolean(expense);

  const { data: supplierOptions = [] } = useQuery({
    queryKey: ["general-expense-suppliers"],
    queryFn: async () => {
      const result = await searchExpenseSuppliers("");
      if (result.error) throw new Error(result.error.message);
      return (result.data ?? []).map((item) => ({
        value: item.id,
        label: item.label,
      })) satisfies SelectOption[];
    },
  });

  const { data: categoryOptions = [] } = useQuery({
    queryKey: ["general-expense-categories"],
    queryFn: async () => {
      const result = await getExpenseCategories();
      if (result.error) throw new Error(result.error.message);
      return (result.data ?? []).map((item) => ({
        value: item.label,
        label: item.label,
      })) satisfies SelectOption[];
    },
  });

  const { data: responsibleOptions = [] } = useQuery({
    queryKey: ["general-expense-responsibles"],
    queryFn: async () => {
      const result = await getExpenseResponsibles();
      if (result.error) throw new Error(result.error.message);
      return (result.data ?? []).map((item) => ({
        value: item.id,
        label: item.label,
      })) satisfies SelectOption[];
    },
  });

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    if (expense) {
      setDetails({
        assignToSupplier: expense.assignToSupplier,
        supplierId: expense.supplierId ?? "",
        supplierName: expense.supplierName,
        paymentDetails: expense.assignToSupplier ? "" : expense.description,
        dueDate: expense.dueDate,
        category: expense.category,
        isLocalPurchase: expense.isLocalPurchase,
        responsibleId: expense.responsibleId ?? "",
        responsibleName: expense.responsibleName ?? "",
        description: expense.assignToSupplier ? expense.description : "",
        amount: formatAmountInput(expense.amount),
      });
      setRequiresInvoice(expense.requiresInvoice);
      setInvoices(expense.invoices);
      setPayments(expense.payments);
      setApportionEnabled(expense.apportionEnabled);
      setApportionmentType(expense.apportionmentType);
      setApplyToForeignBranches(expense.applyToForeignBranches);
      setBranchShares(
        expense.branchShares.length
          ? expense.branchShares
          : buildBranchShares(expense.amount),
      );
      setSingleBranchId(expense.singleBranchId ?? "b1");
      setSingleBranchName(expense.singleBranchName ?? "Ejercito");
      return;
    }

    setDetails({
      ...EMPTY_DETAILS,
      supplierId: initialSupplierName ? "" : "sup-1",
      supplierName: initialSupplierName ?? "Papelería del Bajío",
      amount: initialAmount ? formatAmountInput(initialAmount) : "",
      dueDate: "2026-05-20",
      category: "Papelería y Art. de Oficina",
      isLocalPurchase: true,
      responsibleId: "user-1",
      responsibleName: "Julio Inzunza",
    });
    setRequiresInvoice(true);
    setInvoices(initialInvoices ?? []);
    setPayments([]);
    setApportionEnabled(false);
    setApportionmentType("sales_participation");
    setApplyToForeignBranches(true);
    setBranchShares(buildBranchShares(initialAmount ?? 0));
    setSingleBranchId("b1");
    setSingleBranchName("Ejercito");
  }, [expense, initialAmount, initialInvoices, initialSupplierName]);

  useEffect(() => {
    if (expense || !initialSupplierName || supplierOptions.length === 0) {
      return;
    }
    const matchedSupplier = supplierOptions.find(
      (option) => option.label === initialSupplierName,
    );
    if (!matchedSupplier) return;
    setDetails((prev) => ({
      ...prev,
      supplierId: String(matchedSupplier.value),
      supplierName: matchedSupplier.label,
    }));
  }, [expense, initialSupplierName, supplierOptions]);

  const amountNumber = parseAmount(details.amount);
  const paidAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const invoicesAmount = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);

  useEffect(() => {
    setBranchShares((prev) => recalculateShares(prev, amountNumber));
  }, [amountNumber]);

  const handleDetailsChange = useCallback(
    <K extends keyof ExpenseDetailsFormState>(
      field: K,
      value: ExpenseDetailsFormState[K],
    ) => {
      setDetails((prev) => {
        const next = { ...prev, [field]: value };
        if (field === "amount" && typeof value === "string") {
          next.amount = sanitizeDecimal(value);
        }
        return next;
      });
      setErrors((prev) => {
        if (!prev[field]) return prev;
        const next = { ...prev };
        delete next[field];
        return next;
      });
    },
    [],
  );

  const loadSupplierInvoices = useCallback(async (supplierId: string) => {
    if (!supplierId) {
      setInvoices([]);
      setSearchMessage(undefined);
      return;
    }

    setSearchingInvoices(true);
    setSearchMessage(undefined);
    try {
      const result = await searchSupplierInvoices(supplierId);
      if (result.error) {
        showError(result.error.message);
        return;
      }
      const found = result.data ?? [];
      setInvoices(found);
      setSearchMessage(
        found.length > 0
          ? `Se agregaron ${found.length} facturas encontradas de este proveedor`
          : "No se encontraron facturas de este proveedor",
      );
    } finally {
      setSearchingInvoices(false);
    }
  }, [showError]);

  useEffect(() => {
    if (!requiresInvoice || isEdit) return;
    if (!details.supplierId) return;
    void loadSupplierInvoices(details.supplierId);
  }, [details.supplierId, isEdit, loadSupplierInvoices, requiresInvoice]);

  const handleBranchPercentageChange = (branchId: string, percentage: number) => {
    setBranchShares((prev) =>
      prev.map((branch) =>
        branch.branchId === branchId
          ? {
              ...branch,
              percentage,
              amount: Number(((amountNumber * percentage) / 100).toFixed(2)),
            }
          : branch,
      ),
    );
  };

  const handleUploadFiles = (files: File[]) => {
    const uploaded = files.map((file, index) => ({
      id: `upload-${Date.now()}-${index}`,
      externalId: file.name.replace(/\.[^.]+$/, "").toUpperCase(),
      date: new Date().toLocaleDateString("es-MX"),
      paymentType: "PUE",
      amount: amountNumber || 0,
      fileName: file.name,
    }));
    setInvoices((prev) => [...prev, ...uploaded]);
    setSearchMessage(
      `Se cargaron ${uploaded.length} archivo${uploaded.length === 1 ? "" : "s"}`,
    );
  };

  const buildDescription = (): string => {
    if (details.assignToSupplier) {
      return details.description.trim();
    }
    const paymentDetails = details.paymentDetails.trim();
    const extraDescription = details.description.trim();
    if (paymentDetails && extraDescription) {
      return `${paymentDetails}. ${extraDescription}`;
    }
    return paymentDetails || extraDescription;
  };

  const buildPayload = (): CreateGeneralExpensePayload => ({
    assignToSupplier: details.assignToSupplier,
    supplierId: details.assignToSupplier ? details.supplierId || null : null,
    supplierName: details.assignToSupplier
      ? details.supplierName || "Sin proveedor"
      : "Gasto interno",
    dueDate: details.dueDate,
    category: details.category,
    isLocalPurchase: details.isLocalPurchase,
    responsibleId: details.responsibleId || null,
    responsibleName: details.responsibleName || null,
    description: buildDescription(),
    amount: amountNumber,
    requiresInvoice,
    invoices: requiresInvoice ? invoices : [],
    apportionEnabled,
    apportionmentType,
    applyToForeignBranches,
    branchShares: apportionEnabled
      ? applyToForeignBranches
        ? branchShares
        : branchShares.filter((branch) => !branch.isForeign)
      : [],
    singleBranchId: apportionEnabled ? null : singleBranchId,
    singleBranchName: apportionEnabled ? null : singleBranchName,
  });

  const handleSubmit = async () => {
    const nextErrors = validateDetails(details);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setActiveTab("details");
      showError("Completa los campos obligatorios del gasto");
      return;
    }

    setSaving(true);
    try {
      const payload = buildPayload();
      const result = expense
        ? await updateGeneralExpense({ ...payload, id: expense.id })
        : await createGeneralExpense(payload);

      if (result.error || !result.data) {
        showError(result.error?.message ?? "No se pudo registrar el gasto");
        return;
      }

      showSuccess(
        expense ? "Gasto actualizado correctamente" : "Gasto registrado correctamente",
      );
      onSuccess?.(result.data);
      void router.push("/facturas/gastos-generales");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    void router.push("/facturas/gastos-generales");
  };

  const handleRegisterPayment = (payment: Omit<GeneralExpensePayment, "id">) => {
    setPayments((prev) => [
      ...prev,
      {
        ...payment,
        id: `payment-${Date.now()}`,
      },
    ]);
    setPaymentModalOpen(false);
    showSuccess("Pago registrado correctamente");
  };

  const breadcrumbItems = useMemo(
    () => [
      {
        label: "Interno - Cuentas por pagar",
        href: "/facturas/gastos-generales",
      },
      { label: isEdit ? "Editar gasto" : "Registrar gasto" },
    ],
    [isEdit],
  );

  return (
    <PageContainer>
      <Breadcrumbs
        items={breadcrumbItems}
        showBackButton
        onBack={handleBack}
      />

      <PageHeaderRow>
        <Typography variant="h2">
          {isEdit ? "Editar gasto" : "Registrar gasto"}
        </Typography>
        <HeaderActions>
          <SaveButton
            variant="contained"
            color="primary"
            disabled={saving}
            onClick={() => void handleSubmit()}
            startIcon={
              saving ? <CircularProgress size={16} color="inherit" /> : undefined
            }
          >
            Guardar
          </SaveButton>
        </HeaderActions>
      </PageHeaderRow>

      <TabsSection>
        <TabFilters
          tabs={TAB_ITEMS}
          activeTab={activeTab}
          onTabChange={(value) => setActiveTab(value as ExpenseFormTab)}
          disabled={saving}
        />
      </TabsSection>

      <ContentLayout>
        <MainPanel>
          <FormCard>
            {activeTab === "details" && (
              <ExpenseDetailsTab
                values={details}
                supplierOptions={supplierOptions}
                categoryOptions={categoryOptions}
                responsibleOptions={responsibleOptions}
                errors={errors}
                onChange={handleDetailsChange}
                disabled={saving}
              />
            )}

            {activeTab === "invoices" && (
              <ExpenseInvoicesTab
                requiresInvoice={requiresInvoice}
                onRequiresInvoiceChange={setRequiresInvoice}
                invoices={invoices}
                searching={searchingInvoices}
                searchMessage={searchMessage}
                onRemoveInvoice={(invoiceId) =>
                  setInvoices((prev) => prev.filter((item) => item.id !== invoiceId))
                }
                onUploadFiles={handleUploadFiles}
                disabled={saving}
              />
            )}

            {activeTab === "payments" && (
              <ExpensePaymentsTab
                payments={payments}
                onAddPayment={() => setPaymentModalOpen(true)}
                disabled={saving}
              />
            )}

            {activeTab === "apportionment" && (
              <ExpenseApportionmentTab
                apportionEnabled={apportionEnabled}
                onApportionEnabledChange={setApportionEnabled}
                apportionmentType={apportionmentType}
                onApportionmentTypeChange={setApportionmentType}
                applyToForeignBranches={applyToForeignBranches}
                onApplyToForeignBranchesChange={setApplyToForeignBranches}
                branchShares={branchShares}
                onBranchPercentageChange={handleBranchPercentageChange}
                singleBranchId={singleBranchId}
                singleBranchName={singleBranchName}
                onSingleBranchChange={(branchId, branchName) => {
                  setSingleBranchId(branchId);
                  setSingleBranchName(branchName);
                }}
                disabled={saving}
              />
            )}
          </FormCard>
        </MainPanel>

        <ExpenseSummaryPanel
          paidAmount={paidAmount}
          invoicesAmount={invoicesAmount}
          totalAmount={amountNumber}
        />
      </ContentLayout>

      <RegisterExpensePaymentModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onSubmit={handleRegisterPayment}
      />
    </PageContainer>
  );
}
