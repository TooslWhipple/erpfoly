import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  getActiveSaleCredits,
  registerSaleCreditMultiPayment,
  getSaleCreditDetail,
} from "@/services/sale-credit.service";
import { unwrapOrThrow, get } from "@/lib/axios";
import type {
  ClientCreditAccount,
  ClientPaymentContext,
  ClientPaymentMethod,
  ClientPaymentResult,
  InstallmentSelection,
  PendingInstallment,
  BackendSaleCreditActiveItem,
  BackendSaleCreditMultiPaymentResult,
} from "@/types/clientPayment.types";
import {
  applyOrderedAmountChange,
  applyOrderedToggle,
  canInteractWithInstallment,
  isLastSelectedInstallment,
} from "@/utils/client-payment-selection";
import { formatDate } from "@/utils/date";
import dayjs from "@/lib/dayjs";

interface UseClientPaymentResult {
  routerReady: boolean;
  clientId: string | null;
  fromCashRegister: boolean;
  cashRegisterName: string | null;
  context: ClientPaymentContext | null;
  loading: boolean;
  error: string | null;
  selections: InstallmentSelection[];
  paymentMethod: ClientPaymentMethod;
  isCashDeposit: boolean;
  paymentAmount: number;
  isSubmitting: boolean;
  paymentResult: ClientPaymentResult | null;
  subtotal: number;
  totalIva: number;
  totalDue: number;
  change: number;
  canRegister: boolean;
  setPaymentMethod: (method: ClientPaymentMethod) => void;
  setIsCashDeposit: (value: boolean) => void;
  setPaymentAmount: (value: number) => void;
  canSelectInstallment: (purchaseId: string, installmentId: string) => boolean;
  canEditAmount: (purchaseId: string, installmentId: string) => boolean;
  toggleInstallment: (purchaseId: string, installmentId: string) => void;
  updateAmountToPay: (purchaseId: string, installmentId: string, amount: number) => void;
  clearError: () => void;
  submitPayment: () => Promise<void>;
  refetch: () => void;
}

function formatDueDate(dateStr: string): string {
  return formatDate(dateStr, "D [de] MMM");
}

function formatPurchaseDate(dateStr: string): string {
  return formatDate(dateStr, "D [de] MMMM, YYYY");
}

function mapBackendInstallments(
  installments: {
    id: number;
    installment_number: number;
    due_date: string;
    amount: number;
    paid_amount: number;
    remaining: number;
    paid_date: string | null;
    status: string;
    base_amount: number;
    iva_amount: number;
  }[],
  totalInstallments: number,
): PendingInstallment[] {
  return installments
    .filter((inst) => inst.status !== "PAID" && inst.status !== "CANCELLED")
    .map((inst) => {
      const remaining = Math.max(parseFloat(Number(inst.remaining).toFixed(2)), 0);
      const originalAmount = Number(inst.amount);
      const ratio = originalAmount > 0 ? Math.min(remaining / originalAmount, 1) : 0;

      return {
        id: String(inst.id),
        installmentNumber: inst.installment_number,
        totalInstallments,
        dueDate: formatDueDate(inst.due_date),
        principalAmount: parseFloat((inst.base_amount * ratio).toFixed(2)),
        ivaAmount: parseFloat((inst.iva_amount * ratio).toFixed(2)),
        totalAmount: remaining,
      };
    })
    .filter((inst) => inst.totalAmount > 0)
    .sort((left, right) => left.installmentNumber - right.installmentNumber);
}

function mapBackendCreditToAccount(
  item: BackendSaleCreditActiveItem,
): ClientCreditAccount {
  const nextPaymentBreakdown = item.next_payment_iva > 0
    ? `($${item.next_payment_base.toFixed(2)} + $${item.next_payment_iva.toFixed(2)} IVA)`
    : undefined;

  const isOverdue = Boolean(
    item.next_due_date && dayjs(item.next_due_date).isBefore(dayjs(), "day"),
  );

  return {
    id: String(item.id),
    productName: item.product_name,
    purchaseDateLabel: formatPurchaseDate(item.purchase_date),
    initialCost: item.initial_cost,
    totalPaid: item.total_paid,
    remaining: item.outstanding_balance,
    paymentDueDate: item.next_due_date ? formatDueDate(item.next_due_date) : "N/A",
    highlightPaymentDueDate: isOverdue,
    nextPaymentAmount: item.next_payment_amount,
    nextPaymentBreakdown,
    paidInstallments: item.paid_installments,
    totalInstallments: item.total_installments,
    pendingInstallments: [],
  };
}

function buildInitialSelections(accounts: ClientCreditAccount[]): InstallmentSelection[] {
  return accounts.flatMap((account) =>
    account.pendingInstallments.map((installment) => ({
      purchaseId: account.id,
      installmentId: installment.id,
      selected: false,
      amountToPay: 0,
    })),
  );
}

function findInstallment(
  accounts: ClientCreditAccount[],
  purchaseId: string,
  installmentId: string,
): PendingInstallment | undefined {
  const account = accounts.find((item) => item.id === purchaseId);
  return account?.pendingInstallments.find((item) => item.id === installmentId);
}

function getSelectionAmounts(
  selections: InstallmentSelection[],
  accounts: ClientCreditAccount[],
): { subtotal: number; totalIva: number; totalDue: number } {
  let subtotal = 0;
  let totalIva = 0;
  let totalDue = 0;

  for (const selection of selections) {
    if (!selection.selected || selection.amountToPay <= 0) continue;

    const installment = findInstallment(accounts, selection.purchaseId, selection.installmentId);
    if (!installment || installment.totalAmount <= 0) continue;

    const cappedAmount = Math.min(selection.amountToPay, installment.totalAmount);
    const ratio = cappedAmount / installment.totalAmount;
    subtotal += installment.principalAmount * ratio;
    totalIva += installment.ivaAmount * ratio;
    totalDue += cappedAmount;
  }

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    totalIva: parseFloat(totalIva.toFixed(2)),
    totalDue: parseFloat(totalDue.toFixed(2)),
  };
}

function mapFrontendToBackendMethod(method: ClientPaymentMethod): "CASH" | "CARD" {
  return method === "cash" ? "CASH" : "CARD";
}

export function useClientPayment(): UseClientPaymentResult {
  const router = useRouter();
  const { id, from, caja } = router.query;

  const [context, setContext] = useState<ClientPaymentContext | null>(null);
  const [selections, setSelections] = useState<InstallmentSelection[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<ClientPaymentMethod>("cash");
  const [isCashDeposit, setIsCashDeposit] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentResult, setPaymentResult] = useState<ClientPaymentResult | null>(null);

  const routerReady = router.isReady;
  const clientId = typeof id === "string" ? id : null;
  const fromCashRegister = from === "cajas";
  const cashRegisterName = typeof caja === "string" ? decodeURIComponent(caja) : "Caja 1";

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchContext = useCallback(async () => {
    if (!clientId) return;

    setLoading(true);
    setError(null);

    try {
      const numericClientId = parseInt(clientId, 10);
      const result = await getActiveSaleCredits(numericClientId, 1, 50);
      const data = unwrapOrThrow(result);

      if (!data.rows || data.rows.length === 0) {
        const clientResult = await get(`/clients/${numericClientId}/detail`);
        const clientData = unwrapOrThrow(clientResult) as {
          firstName?: string;
          lastSurname?: string;
          phoneNumber?: string;
        } | null;

        setContext({
          clientId,
          clientName: clientData
            ? `${clientData.firstName ?? ""} ${clientData.lastSurname ?? ""}`.trim() || "Cliente"
            : "Cliente",
          clientPhone: clientData?.phoneNumber ?? "",
          creditAccounts: [],
        });
        setSelections([]);
        return;
      }

      const creditDetails = await Promise.all(
        data.rows.map(async (item: BackendSaleCreditActiveItem) => {
          try {
            const detailResult = await getSaleCreditDetail(item.id);
            const detail = unwrapOrThrow(detailResult);
            return { item, detail };
          } catch {
            return { item, detail: null };
          }
        }),
      );

      const accounts: ClientCreditAccount[] = creditDetails.map(({ item, detail }) => {
        const account = mapBackendCreditToAccount(item);

        if (detail?.installments) {
          account.pendingInstallments = mapBackendInstallments(
            detail.installments,
            item.total_installments,
          );
        }

        return account;
      });

      const clientName = data.rows[0]?.client_name?.trim() || "Cliente";
      const clientPhone = data.rows[0]?.client_phone ?? "";

      setContext({
        clientId,
        clientName,
        clientPhone,
        creditAccounts: accounts,
      });
      setSelections(buildInitialSelections(accounts));
    } catch (err) {
      console.error("[useClientPayment] Error loading payment context:", err);
      setContext(null);
      setError("Error al cargar la información del cliente");
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    if (!routerReady) return;
    if (!clientId) {
      setLoading(false);
      return;
    }
    void fetchContext();
  }, [routerReady, clientId, fetchContext]);

  const { subtotal, totalIva, totalDue } = useMemo(
    () => getSelectionAmounts(selections, context?.creditAccounts ?? []),
    [selections, context?.creditAccounts],
  );

  useEffect(() => {
    if (paymentMethod !== "card") return;
    setPaymentAmount(totalDue);
  }, [paymentMethod, totalDue]);

  const selectedCount = useMemo(
    () => selections.filter((selection) => selection.selected && selection.amountToPay > 0).length,
    [selections],
  );

  const change = useMemo(() => {
    if (paymentMethod !== "cash") return 0;
    return Math.max(parseFloat((paymentAmount - totalDue).toFixed(2)), 0);
  }, [paymentAmount, paymentMethod, totalDue]);

  const canRegister =
    selectedCount > 0 &&
    totalDue > 0 &&
    paymentAmount >= totalDue &&
    !isSubmitting;

  const handleSetPaymentMethod = useCallback((method: ClientPaymentMethod) => {
    setPaymentMethod(method);
    if (method === "card") {
      setIsCashDeposit(false);
    }
  }, []);

  const handleSetPaymentAmount = useCallback(
    (value: number) => {
      if (paymentMethod === "card") return;
      setPaymentAmount(value);
    },
    [paymentMethod],
  );

  const canSelectInstallment = useCallback(
    (purchaseId: string, installmentId: string) => {
      const account = context?.creditAccounts.find((item) => item.id === purchaseId);
      if (!account) return false;
      return canInteractWithInstallment(account, installmentId, selections);
    },
    [context?.creditAccounts, selections],
  );

  const canEditAmount = useCallback(
    (purchaseId: string, installmentId: string) => {
      const account = context?.creditAccounts.find((item) => item.id === purchaseId);
      if (!account) return false;
      return isLastSelectedInstallment(account, installmentId, selections);
    },
    [context?.creditAccounts, selections],
  );

  const toggleInstallment = useCallback(
    (purchaseId: string, installmentId: string) => {
      if (!context) return;
      if (!canSelectInstallment(purchaseId, installmentId)) return;

      setError(null);
      setSelections((prev) =>
        applyOrderedToggle(context.creditAccounts, prev, purchaseId, installmentId),
      );
    },
    [canSelectInstallment, context],
  );

  const updateAmountToPay = useCallback(
    (purchaseId: string, installmentId: string, amount: number) => {
      if (!context) return;
      if (!canEditAmount(purchaseId, installmentId)) return;

      setError(null);
      setSelections((prev) =>
        applyOrderedAmountChange(
          context.creditAccounts,
          prev,
          purchaseId,
          installmentId,
          amount,
        ),
      );
    },
    [canEditAmount, context],
  );

  const submitPayment = useCallback(async () => {
    if (!clientId || !context || !canRegister) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const selectedInstallments = selections.filter(
        (selection) => selection.selected && selection.amountToPay > 0,
      );

      if (selectedInstallments.length === 0) {
        setError("Selecciona al menos una parcialidad para registrar el abono");
        return;
      }

      const allocations = selectedInstallments.map((selection) => {
        const installment = findInstallment(
          context.creditAccounts,
          selection.purchaseId,
          selection.installmentId,
        );
        const amount = Math.min(
          selection.amountToPay,
          installment?.totalAmount ?? selection.amountToPay,
        );

        return {
          sale_credit_id: parseInt(selection.purchaseId, 10),
          installment_id: parseInt(selection.installmentId, 10),
          amount,
        };
      });

      const result = await registerSaleCreditMultiPayment({
        client_id: parseInt(clientId, 10),
        payment_method: mapFrontendToBackendMethod(paymentMethod),
        reference: isCashDeposit ? "Depósito en efectivo" : undefined,
        notes: isCashDeposit ? "Abono realizado como depósito en efectivo" : undefined,
        allocations,
      });

      const backendResult = unwrapOrThrow(result) as BackendSaleCreditMultiPaymentResult;

      const receiptAllocations = selectedInstallments.map((selection) => {
        const installment = findInstallment(
          context.creditAccounts,
          selection.purchaseId,
          selection.installmentId,
        );
        const amount = Math.min(
          selection.amountToPay,
          installment?.totalAmount ?? selection.amountToPay,
        );
        const isFullPayment = Boolean(
          installment && amount >= installment.totalAmount - 0.001,
        );
        const label = installment
          ? isFullPayment
            ? `Pago de parcialidad ${installment.installmentNumber} de ${installment.totalInstallments}`
            : `Abono de parcialidad ${installment.installmentNumber} de ${installment.totalInstallments}`
          : "Abono a cuenta";

        return { label, amount };
      });

      const primaryAccount = context.creditAccounts.find(
        (account) => account.id === selectedInstallments[0]?.purchaseId,
      );
      const fullyPaidCount = selectedInstallments.filter((selection) => {
        const installment = findInstallment(
          context.creditAccounts,
          selection.purchaseId,
          selection.installmentId,
        );
        return (
          installment &&
          selection.amountToPay >= installment.totalAmount - 0.001
        );
      }).length;

      setPaymentResult({
        id: String(backendResult.payments[0]?.id ?? Date.now()),
        totalAmount: backendResult.total_amount,
        dateLabel: dayjs().format("D [de] MMMM, YYYY"),
        allocations: receiptAllocations,
        clientPhone: context.clientPhone,
        paidInstallments: (primaryAccount?.paidInstallments ?? 0) + fullyPaidCount,
        totalInstallments: primaryAccount?.totalInstallments ?? 0,
        receiptUrl: "",
      });

      await fetchContext();
    } catch (err) {
      console.error("[useClientPayment] Error submitting payment:", err);
      const message = err instanceof Error ? err.message : "No se pudo registrar el cobro. Intenta de nuevo.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    canRegister,
    clientId,
    context,
    isCashDeposit,
    paymentMethod,
    selections,
    fetchContext,
  ]);

  return {
    routerReady,
    clientId,
    fromCashRegister,
    cashRegisterName,
    context,
    loading,
    error,
    selections,
    paymentMethod,
    isCashDeposit,
    paymentAmount,
    isSubmitting,
    paymentResult,
    subtotal,
    totalIva,
    totalDue,
    change,
    canRegister,
    setPaymentMethod: handleSetPaymentMethod,
    setIsCashDeposit,
    setPaymentAmount: handleSetPaymentAmount,
    canSelectInstallment,
    canEditAmount,
    toggleInstallment,
    updateAmountToPay,
    clearError,
    submitPayment,
    refetch: fetchContext,
  };
}
