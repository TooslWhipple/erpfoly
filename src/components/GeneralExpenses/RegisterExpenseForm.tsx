import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { CircularProgress, Stack, Typography } from "@mui/material";
import { Breadcrumbs, TabFilters } from "@/components";
import { sanitizeDecimal } from "@/forms/validation/schemas";
import { useBranchesSelect } from "@/hooks/branches/useBranchesSelect";
import { useInternalPayableCategoriesSelect } from "@/hooks/internal-payables/useInternalPayableCategoriesSelect";
import { useSuppliersSelect } from "@/hooks/suppliers/useSuppliersSelect";
import { useUsersSelect } from "@/hooks/users/useUsersSelect";
import {
  createExpensePayment,
  createGeneralExpense,
  getApportionmentPreview,
  getUnassignedInvoices,
  updateGeneralExpense,
  uploadExpensePaymentReceipt,
} from "@/services/general-expenses.service";
import type {
  ApportionmentType,
  CreateGeneralExpensePayload,
  GeneralExpenseBranchShare,
  GeneralExpenseInvoice,
  GeneralExpenseListItem,
  GeneralExpensePayment,
  UnassignedInvoice,
} from "@/types/general-expenses.types";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { ExpenseApportionmentTab } from "./ExpenseApportionmentTab";
import { ExpenseDetailsTab } from "./ExpenseDetailsTab";
import type { ExpenseDetailsFormState } from "./ExpenseDetailsTab";
import { ExpenseInvoicesTab } from "./ExpenseInvoicesTab";
import { ExpensePaymentsTab } from "./ExpensePaymentsTab";
import { ExpenseSummaryPanel } from "./ExpenseSummaryPanel";
import {
  RegisterExpensePaymentModal,
  type RegisterExpensePaymentInput,
} from "./RegisterExpensePaymentModal";
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
  const [branchError, setBranchError] = useState<string | undefined>();
  const [requiresInvoice, setRequiresInvoice] = useState(false);
  const [invoices, setInvoices] = useState<GeneralExpenseInvoice[]>([]);
  const [availableInvoices, setAvailableInvoices] = useState<UnassignedInvoice[]>(
    [],
  );
  const [payments, setPayments] = useState<GeneralExpensePayment[]>([]);
  const [searchMessage, setSearchMessage] = useState<string | undefined>();
  const [apportionEnabled, setApportionEnabled] = useState(false);
  const [apportionmentType, setApportionmentType] =
    useState<ApportionmentType>("sales_participation");
  const [branchShares, setBranchShares] = useState<GeneralExpenseBranchShare[]>(
    [],
  );
  const [singleBranchId, setSingleBranchId] = useState("");
  const [saving, setSaving] = useState(false);
  const [searchingInvoices, setSearchingInvoices] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const skipPreviewRef = useRef(Boolean(expense?.branchShares.length));

  const isEdit = Boolean(expense);

  const { selectOptions: supplierOptions } = useSuppliersSelect();
  const { selectOptions: categoryOptions } =
    useInternalPayableCategoriesSelect();
  const { selectOptions: responsibleOptions } = useUsersSelect();
  const { selectOptions: branchOptions } = useBranchesSelect();

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    if (expense) {
      setDetails({
        assignToSupplier: expense.assignToSupplier,
        supplierId: expense.supplierId ?? "",
        supplierName: expense.supplierName,
        paymentDetails: expense.assignToSupplier ? "" : (expense.detail ?? ""),
        dueDate: expense.dueDate,
        category: expense.categoryId,
        isLocalPurchase: expense.isLocalPurchase,
        responsibleId: expense.responsibleId ?? "",
        responsibleName: expense.responsibleName ?? "",
        description: expense.description,
        amount: formatAmountInput(expense.amount),
      });
      setRequiresInvoice(expense.requiresInvoice);
      setInvoices(expense.invoices);
      setPayments(expense.payments);
      setApportionEnabled(expense.apportionEnabled);
      setApportionmentType(expense.apportionmentType);
      setBranchShares(expense.branchShares);
      setSingleBranchId(expense.singleBranchId ?? "");
      return;
    }

    setDetails({
      ...EMPTY_DETAILS,
      amount: initialAmount ? formatAmountInput(initialAmount) : "",
    });
    setRequiresInvoice(Boolean(initialInvoices?.length));
    setInvoices(initialInvoices ?? []);
    setPayments([]);
    setApportionEnabled(false);
    setApportionmentType("sales_participation");
    setBranchShares([]);
  }, [expense, initialAmount, initialInvoices]);

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
  const invoicesAmount = invoices.reduce(
    (sum, invoice) => sum + invoice.amount,
    0,
  );
  const balance = Number((amountNumber - paidAmount).toFixed(2));

  useEffect(() => {
    setBranchShares((prev) => recalculateShares(prev, amountNumber));
  }, [amountNumber]);

  const loadApportionmentPreview = useCallback(
    async (type: ApportionmentType, amount: number) => {
      if (type === "free") {
        const result = await getApportionmentPreview(type, amount);
        if (result.error) {
          showError(result.error.message);
          return;
        }
        const preview = result.data?.branchShares ?? [];
        setBranchShares((prev) => {
          if (prev.length > 0) return recalculateShares(prev, amount);
          return preview;
        });
        return;
      }

      setLoadingPreview(true);
      try {
        const result = await getApportionmentPreview(type, amount);
        if (result.error) {
          showError(result.error.message);
          return;
        }
        setBranchShares(result.data?.branchShares ?? []);
      } finally {
        setLoadingPreview(false);
      }
    },
    [showError],
  );

  useEffect(() => {
    if (!apportionEnabled) return;
    if (skipPreviewRef.current) {
      skipPreviewRef.current = false;
      return;
    }
    void loadApportionmentPreview(apportionmentType, amountNumber);
  }, [
    amountNumber,
    apportionEnabled,
    apportionmentType,
    loadApportionmentPreview,
  ]);

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

  const loadAvailableInvoices = useCallback(
    async (supplierId: string | null) => {
      setSearchingInvoices(true);
      setSearchMessage(undefined);
      try {
        const result = await getUnassignedInvoices(
          details.assignToSupplier ? supplierId : null,
        );
        if (result.error) {
          showError(result.error.message);
          return;
        }
        const found = result.data ?? [];
        setAvailableInvoices(found);
        setSearchMessage(
          found.length > 0
            ? `Hay ${found.length} factura${found.length === 1 ? "" : "s"} disponible${found.length === 1 ? "" : "s"} para vincular`
            : "No se encontraron facturas disponibles",
        );
      } finally {
        setSearchingInvoices(false);
      }
    },
    [details.assignToSupplier, showError],
  );

  useEffect(() => {
    if (!requiresInvoice) {
      setAvailableInvoices([]);
      setSearchMessage(undefined);
      return;
    }
    if (details.assignToSupplier && !details.supplierId) {
      setAvailableInvoices([]);
      return;
    }
    void loadAvailableInvoices(details.supplierId || null);
  }, [
    details.assignToSupplier,
    details.supplierId,
    loadAvailableInvoices,
    requiresInvoice,
  ]);

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

  const buildPayload = (): CreateGeneralExpensePayload => ({
    assignToSupplier: details.assignToSupplier,
    supplierId: details.assignToSupplier ? details.supplierId || null : null,
    detail: details.assignToSupplier ? undefined : details.paymentDetails.trim(),
    dueDate: details.dueDate,
    categoryId: details.category,
    isLocalPurchase: details.isLocalPurchase,
    responsibleId: details.responsibleId || null,
    description: details.description.trim(),
    amount: amountNumber,
    requiresInvoice,
    payableInvoiceIds: requiresInvoice ? invoices.map((invoice) => invoice.id) : [],
    apportionEnabled,
    apportionmentType,
    branchShares: apportionEnabled
      ? branchShares.map((share) => ({
          branchId: share.branchId,
          percentage: share.percentage,
        }))
      : [],
    singleBranchId: apportionEnabled ? null : singleBranchId || null,
  });

  const handleSubmit = async () => {
    const nextErrors = validateDetails(details);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setActiveTab("details");
      showError("Completa los campos obligatorios del gasto");
      return;
    }

    if (apportionEnabled && apportionmentType === "free") {
      const percentageSum = branchShares.reduce(
        (sum, share) => sum + share.percentage,
        0,
      );
      if (Math.abs(percentageSum - 100) > 0.05) {
        setActiveTab("apportionment");
        showError("La suma de porcentajes debe ser 100%");
        return;
      }
    }

    if (!apportionEnabled && !singleBranchId) {
      setBranchError("Selecciona una sucursal");
      setActiveTab("apportionment");
      showError("Selecciona una sucursal");
      return;
    }
    setBranchError(undefined);

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

  const handleRegisterPayment = async (payment: RegisterExpensePaymentInput) => {
    if (!expense) {
      showError("Guarda el gasto antes de registrar un pago");
      return;
    }

    const result = await createExpensePayment(expense.id, {
      amount: payment.amount,
      paymentDate: payment.date,
      notes: payment.notes,
    });
    if (result.error || !result.data) {
      showError(result.error?.message ?? "No se pudo registrar el pago");
      return;
    }

    let nextExpense = result.data;
    const createdPayment = nextExpense.payments.find(
      (item) =>
        !payments.some((current) => current.id === item.id) &&
        item.amount === payment.amount,
    );

    if (payment.receipt && createdPayment) {
      const uploadResult = await uploadExpensePaymentReceipt(
        expense.id,
        createdPayment.id,
        payment.receipt,
      );
      if (uploadResult.error || !uploadResult.data) {
        showError(
          uploadResult.error?.message ??
            "El pago se registró pero no se pudo subir el comprobante",
        );
      } else {
        nextExpense = uploadResult.data;
      }
    }

    setPayments(nextExpense.payments);
    setPaymentModalOpen(false);
    showSuccess("Pago registrado correctamente");
    onSuccess?.(nextExpense);
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
                onRequiresInvoiceChange={(value) => {
                  setRequiresInvoice(value);
                  if (!value) setInvoices([]);
                }}
                invoices={invoices}
                availableInvoices={availableInvoices}
                searching={searchingInvoices}
                searchMessage={searchMessage}
                onRemoveInvoice={(invoiceId) =>
                  setInvoices((prev) =>
                    prev.filter((item) => item.id !== invoiceId),
                  )
                }
                onAddInvoice={(invoice) => {
                  setInvoices((prev) => [
                    ...prev,
                    {
                      id: invoice.id,
                      externalId: invoice.invoiceNumber ?? invoice.id,
                      date: invoice.date,
                      paymentType: invoice.paymentType,
                      amount: invoice.amount,
                    },
                  ]);
                }}
                disabled={saving}
              />
            )}

            {activeTab === "payments" && (
              <Stack spacing={2}>
                {!isEdit && (
                  <Typography variant="body2" color="text.secondary">
                    Guarda el gasto para registrar abonos y comprobantes.
                  </Typography>
                )}
                <ExpensePaymentsTab
                  payments={payments}
                  onAddPayment={
                    isEdit ? () => setPaymentModalOpen(true) : undefined
                  }
                  disabled={saving || !isEdit}
                />
              </Stack>
            )}

            {activeTab === "apportionment" && (
              <ExpenseApportionmentTab
                apportionEnabled={apportionEnabled}
                onApportionEnabledChange={setApportionEnabled}
                apportionmentType={apportionmentType}
                onApportionmentTypeChange={setApportionmentType}
                branchShares={branchShares}
                onBranchPercentageChange={handleBranchPercentageChange}
                singleBranchId={singleBranchId}
                onSingleBranchChange={(branchId) => {
                  setSingleBranchId(branchId);
                  if (branchId) setBranchError(undefined);
                }}
                branchOptions={branchOptions}
                branchError={branchError}
                loadingPreview={loadingPreview}
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
        maxAmount={Math.max(balance, 0)}
      />
    </PageContainer>
  );
}
