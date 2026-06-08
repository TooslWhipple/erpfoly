import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  createClientPayment,
  getClientPaymentContext,
} from "@/data/clientPayments.mockData";
import type {
  ClientCreditAccount,
  ClientPaymentContext,
  ClientPaymentMethod,
  ClientPaymentResult,
  InstallmentSelection,
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
      const data = await getClientPaymentContext(clientId);
      if (!data) {
        setContext(null);
        setError("Cliente no encontrado");
        return;
      }

      setContext(data);
      setSelections(buildInitialSelections(data.creditAccounts));
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
      const result = await createClientPayment(
        {
          clientId,
          paymentMethod,
          isCashDeposit,
          paymentAmount,
          selections,
          cashRegisterId: fromCashRegister ? cashRegisterName : undefined,
        },
        context.creditAccounts,
      );
      setPaymentResult(result);
    } catch (err) {
      console.error("[useClientPayment] Error submitting payment:", err);
      setError("No se pudo registrar el cobro. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  }, [
    canRegister,
    cashRegisterName,
    clientId,
    context,
    fromCashRegister,
    isCashDeposit,
    paymentAmount,
    paymentMethod,
    selections,
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
