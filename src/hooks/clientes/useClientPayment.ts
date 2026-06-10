import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  getActiveSaleCredits,
  registerSaleCreditPayment,
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
  BackendSaleCreditPaymentPayload,
  BackendSaleCreditPaymentResult,
} from "@/types/clientPayment.types";

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
  totalInterest: number;
  totalDue: number;
  change: number;
  canRegister: boolean;
  setPaymentMethod: (method: ClientPaymentMethod) => void;
  setIsCashDeposit: (value: boolean) => void;
  setPaymentAmount: (value: number) => void;
  toggleInstallment: (purchaseId: string, installmentId: string, totalAmount: number) => void;
  updateAmountToPay: (purchaseId: string, installmentId: string, amount: number) => void;
  submitPayment: () => Promise<void>;
  refetch: () => void;
}

function formatDueDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const months = [
      "Ene", "Feb", "Mar", "Abr", "May", "Jun",
      "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
    ];
    return `${date.getDate()} de ${months[date.getMonth()]}`;
  } catch {
    return dateStr;
  }
}

function formatPurchaseDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const months = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
    ];
    return `${date.getDate()} de ${months[date.getMonth()]}, ${date.getFullYear()}`;
  } catch {
    return dateStr;
  }
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
    .map((inst) => ({
      id: String(inst.id),
      installmentNumber: inst.installment_number,
      totalInstallments,
      dueDate: formatDueDate(inst.due_date),
      principalAmount: inst.base_amount,
      interestAmount: inst.iva_amount,
      totalAmount: inst.amount,
    }));
}

function mapBackendCreditToAccount(
  item: BackendSaleCreditActiveItem,
): ClientCreditAccount {
  const nextPaymentBreakdown = item.next_payment_iva > 0
    ? `($${item.next_payment_base.toFixed(2)} + $${item.next_payment_iva.toFixed(2)} Int)`
    : undefined;

  return {
    id: String(item.id),
    productName: item.product_name,
    purchaseDateLabel: formatPurchaseDate(item.purchase_date),
    initialCost: item.initial_cost,
    totalPaid: item.total_paid,
    remaining: item.outstanding_balance,
    paymentDueDate: item.next_due_date ? formatDueDate(item.next_due_date) : "N/A",
    highlightPaymentDueDate: item.status === "ACTIVE" && item.outstanding_balance > 0,
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

function getSelectionAmounts(
  selections: InstallmentSelection[],
  accounts: ClientCreditAccount[],
): { subtotal: number; totalInterest: number; totalDue: number } {
  let subtotal = 0;
  let totalInterest = 0;

  for (const selection of selections) {
    if (selection.amountToPay <= 0) continue;

    const account = accounts.find((item) => item.id === selection.purchaseId);
    const installment = account?.pendingInstallments.find((item) => item.id === selection.installmentId);
    if (!installment || installment.totalAmount <= 0) continue;

    const ratio = Math.min(selection.amountToPay / installment.totalAmount, 1);
    subtotal += installment.principalAmount * ratio;
    totalInterest += installment.interestAmount * ratio;
  }

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    totalInterest: parseFloat(totalInterest.toFixed(2)),
    totalDue: parseFloat((subtotal + totalInterest).toFixed(2)),
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
        const clientData = unwrapOrThrow(clientResult) as { firstName?: string; lastSurname?: string; phoneNumber?: string } | null;

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

      const firstAccount = accounts[0];
      const clientName = firstAccount ? "Cliente" : "Cliente";
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

  const { subtotal, totalInterest, totalDue } = useMemo(
    () => getSelectionAmounts(selections, context?.creditAccounts ?? []),
    [selections, context?.creditAccounts],
  );

  const change = useMemo(() => {
    if (paymentMethod !== "cash") return 0;
    return Math.max(parseFloat((paymentAmount - totalDue).toFixed(2)), 0);
  }, [paymentAmount, paymentMethod, totalDue]);

  const canRegister = totalDue > 0 && paymentAmount >= totalDue && !isSubmitting;

  const toggleInstallment = useCallback(
    (purchaseId: string, installmentId: string, totalAmount: number) => {
      setSelections((prev) =>
        prev.map((selection) => {
          if (selection.purchaseId !== purchaseId || selection.installmentId !== installmentId) {
            return selection;
          }

          const selected = !selection.selected;
          return {
            ...selection,
            selected,
            amountToPay: selected ? totalAmount : 0,
          };
        }),
      );
    },
    [],
  );

  const updateAmountToPay = useCallback(
    (purchaseId: string, installmentId: string, amount: number) => {
      const sanitized = Math.max(amount, 0);
      setSelections((prev) =>
        prev.map((selection) => {
          if (selection.purchaseId !== purchaseId || selection.installmentId !== installmentId) {
            return selection;
          }

          return {
            ...selection,
            selected: sanitized > 0,
            amountToPay: sanitized,
          };
        }),
      );
    },
    [],
  );

  const submitPayment = useCallback(async () => {
    if (!clientId || !context || !canRegister) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const selectedInstallments = selections.filter((s) => s.amountToPay > 0);

      if (selectedInstallments.length === 0) {
        setError("Selecciona al menos una parcialidad para registrar el abono");
        return;
      }

      const firstSelection = selectedInstallments[0];
      const creditId = parseInt(firstSelection.purchaseId, 10);
      const installmentId = parseInt(firstSelection.installmentId, 10);

      const backendPayload: BackendSaleCreditPaymentPayload = {
        amount: paymentAmount,
        payment_method: mapFrontendToBackendMethod(paymentMethod),
        reference: isCashDeposit ? "Depósito en efectivo" : undefined,
        notes: isCashDeposit ? "Abono realizado como depósito en efectivo" : undefined,
        installment_id: installmentId,
      };

      const result = await registerSaleCreditPayment(creditId, backendPayload);
      const backendResult = unwrapOrThrow(result) as BackendSaleCreditPaymentResult;

      const allocations: { label: string; amount: number }[] = [];
      for (const sel of selectedInstallments) {
        const account = context.creditAccounts.find((a) => a.id === sel.purchaseId);
        const installment = account?.pendingInstallments.find((i) => i.id === sel.installmentId);
        if (installment) {
          const isFullPayment = sel.amountToPay >= installment.totalAmount - 0.001;
          const label = isFullPayment
            ? `Pago de parcialidad ${installment.installmentNumber} de ${installment.totalInstallments}`
            : `Abono de parcialidad ${installment.installmentNumber} de ${installment.totalInstallments}`;
          allocations.push({ label, amount: sel.amountToPay });
        }
      }

      const now = new Date();
      const months = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
      ];
      const dateLabel = `${now.getDate()} de ${months[now.getMonth()]}, ${now.getFullYear()}`;

      setPaymentResult({
        id: String(backendResult.payment.id),
        totalAmount: backendResult.payment.amount,
        dateLabel,
        allocations: allocations.length > 0
          ? allocations
          : [{ label: "Abono a cuenta", amount: paymentAmount }],
        clientPhone: context.clientPhone,
        paidInstallments: backendResult.credit.status === "PAID"
          ? (context.creditAccounts[0]?.totalInstallments ?? 0)
          : (context.creditAccounts[0]?.paidInstallments ?? 0) + 1,
        totalInstallments: context.creditAccounts[0]?.totalInstallments ?? 0,
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
    paymentAmount,
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
    totalInterest,
    totalDue,
    change,
    canRegister,
    setPaymentMethod,
    setIsCashDeposit,
    setPaymentAmount,
    toggleInstallment,
    updateAmountToPay,
    submitPayment,
    refetch: fetchContext,
  };
}
