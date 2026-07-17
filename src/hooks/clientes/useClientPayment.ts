import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import {
  getActiveSaleCredits,
  registerClientPayment,
  previewClientPayment,
  getSaleCreditDetail,
} from "@/services/sale-credit.service";
import { unwrapOrThrow, get } from "@/lib/axios";
import type {
  CardPaymentEntry,
  ClientCreditAccount,
  ClientPaymentContext,
  ClientPaymentResult,
  InstallmentSelection,
  PendingInstallment,
  BackendSaleCreditActiveItem,
  PaymentPreviewAllocation,
  PaymentPreviewResponse,
} from "@/types/clientPayment.types";
import { formatDate } from "@/utils/date";
import dayjs from "@/lib/dayjs";
import { useSnackbarStore } from "@/store/useSnackbarStore";

interface UseClientPaymentResult {
  routerReady: boolean;
  clientId: string | null;
  fromCashRegister: boolean;
  cashRegisterName: string | null;
  context: ClientPaymentContext | null;
  loading: boolean;
  error: string | null;
  selections: InstallmentSelection[];
  cashAmount: number;
  cardPayments: CardPaymentEntry[];
  totalCaptured: number;
  isSubmitting: boolean;
  paymentResult: ClientPaymentResult | null;
  subtotal: number;
  totalInterest: number;
  totalDue: number;
  change: number;
  canRegister: boolean;
  previewLoading: boolean;
  previewError: string | null;
  setCashAmount: (value: number) => void;
  addCardPayment: () => void;
  updateCardPayment: (id: string, amount: number) => void;
  removeCardPayment: (id: string) => void;
  toggleInstallment: (purchaseId: string, installmentId: string) => void;
  canToggleInstallment: (purchaseId: string, installmentId: string) => boolean;
  isInPreview: (purchaseId: string, installmentId: string) => boolean;
  submitPayment: () => Promise<void>;
  refetch: () => void;
}

function formatDueDate(dateStr: string): string {
  return formatDate(dateStr, "D [de] MMM");
}

function formatPurchaseDate(dateStr: string): string {
  return formatDate(dateStr, "D [de] MMMM, YYYY");
}

function createCardPaymentEntry(amount = 0): CardPaymentEntry {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `card-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    amount,
  };
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

function getMaxAllocationIds(preview: PaymentPreviewResponse | null): string[] {
  if (!preview) return [];
  return preview.allocations.map((item) => String(item.installment_id));
}

function getSelectedAllocations(
  preview: PaymentPreviewResponse | null,
  selectedInstallmentIds: string[],
): PaymentPreviewAllocation[] {
  if (!preview || selectedInstallmentIds.length === 0) return [];

  const byId = new Map(
    preview.allocations.map((item) => [String(item.installment_id), item]),
  );

  return selectedInstallmentIds
    .map((id) => byId.get(id))
    .filter((item): item is PaymentPreviewAllocation => Boolean(item));
}

export function useClientPayment(): UseClientPaymentResult {
  const router = useRouter();
  const { id, from, caja } = router.query;
  const showWarning = useSnackbarStore((state) => state.showWarning);

  const [context, setContext] = useState<ClientPaymentContext | null>(null);
  const [cashAmount, setCashAmount] = useState(0);
  const [cardPayments, setCardPayments] = useState<CardPaymentEntry[]>([
    createCardPaymentEntry(),
  ]);
  const [preview, setPreview] = useState<PaymentPreviewResponse | null>(null);
  const [selectedInstallmentIds, setSelectedInstallmentIds] = useState<string[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentResult, setPaymentResult] = useState<ClientPaymentResult | null>(null);

  const previewRequestId = useRef(0);
  const redirectedNoLetters = useRef(false);

  const routerReady = router.isReady;
  const clientId = typeof id === "string" ? id : null;
  const fromCashRegister = from === "cajas";
  const cashRegisterName = typeof caja === "string" ? decodeURIComponent(caja) : "Caja 1";

  const totalCardAmount = useMemo(
    () =>
      parseFloat(
        cardPayments.reduce((sum, entry) => sum + entry.amount, 0).toFixed(2),
      ),
    [cardPayments],
  );

  const totalCaptured = useMemo(
    () => parseFloat((cashAmount + totalCardAmount).toFixed(2)),
    [cashAmount, totalCardAmount],
  );

  const maxAllocationIds = useMemo(() => getMaxAllocationIds(preview), [preview]);

  const selectedAllocations = useMemo(
    () => getSelectedAllocations(preview, selectedInstallmentIds),
    [preview, selectedInstallmentIds],
  );

  const selections = useMemo<InstallmentSelection[]>(
    () =>
      selectedAllocations.map((allocation) => ({
        purchaseId: String(allocation.credit_id),
        installmentId: String(allocation.installment_id),
        selected: true,
        amountToPay: allocation.amount_to_pay,
      })),
    [selectedAllocations],
  );

  const subtotal = useMemo(
    () =>
      parseFloat(
        selectedAllocations
          .reduce((sum, item) => sum + item.principal_amount, 0)
          .toFixed(2),
      ),
    [selectedAllocations],
  );

  const totalInterest = useMemo(
    () =>
      parseFloat(
        selectedAllocations
          .reduce((sum, item) => sum + item.interest_amount, 0)
          .toFixed(2),
      ),
    [selectedAllocations],
  );

  const totalDue = useMemo(
    () =>
      parseFloat(
        selectedAllocations
          .reduce((sum, item) => sum + item.amount_to_pay, 0)
          .toFixed(2),
      ),
    [selectedAllocations],
  );

  const change = useMemo(() => {
    const cardApplied = Math.min(totalCardAmount, totalDue);
    const cashApplied = Math.max(totalDue - cardApplied, 0);
    return Math.max(parseFloat((cashAmount - cashApplied).toFixed(2)), 0);
  }, [cashAmount, totalCardAmount, totalDue]);

  const canRegister =
    totalDue > 0 &&
    totalCaptured >= totalDue &&
    selectedInstallmentIds.length > 0 &&
    !isSubmitting &&
    !previewLoading &&
    !previewError;

  const redirectIfNoLetters = useCallback(
    (accounts: ClientCreditAccount[], targetClientId: string) => {
      const hasPending = accounts.some(
        (account) => account.pendingInstallments.length > 0,
      );
      if (hasPending) return false;
      if (redirectedNoLetters.current) return true;

      redirectedNoLetters.current = true;
      showWarning("Este cliente no tiene letras pendientes por cobrar.");
      void router.replace(`/clientes/${targetClientId}`);
      return true;
    },
    [router, showWarning],
  );

  const fetchContext = useCallback(async () => {
    if (!clientId) return;

    setLoading(true);
    setError(null);

    try {
      const numericClientId = parseInt(clientId, 10);
      const result = await getActiveSaleCredits(numericClientId, 1, 50);
      const data = unwrapOrThrow(result);

      if (!data.rows || data.rows.length === 0) {
        if (redirectIfNoLetters([], clientId)) {
          return;
        }

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

      if (redirectIfNoLetters(accounts, clientId)) {
        return;
      }

      const clientName = data.rows[0]?.client_name ?? "Cliente";
      const clientPhone = data.rows[0]?.client_phone ?? "";

      setContext({
        clientId,
        clientName,
        clientPhone,
        creditAccounts: accounts,
      });
    } catch (err) {
      console.error("[useClientPayment] Error loading payment context:", err);
      setContext(null);
      setError("Error al cargar la información del cliente");
    } finally {
      setLoading(false);
    }
  }, [clientId, redirectIfNoLetters]);

  useEffect(() => {
    if (!routerReady) return;
    if (!clientId) {
      setLoading(false);
      return;
    }
    redirectedNoLetters.current = false;
    void fetchContext();
  }, [routerReady, clientId, fetchContext]);

  useEffect(() => {
    if (!clientId) return;

    if (totalCaptured <= 0) {
      setPreview(null);
      setSelectedInstallmentIds([]);
      setPreviewError(null);
      setPreviewLoading(false);
      return;
    }

    const numericClientId = parseInt(clientId, 10);
    const requestId = ++previewRequestId.current;
    const timeoutId = window.setTimeout(() => {
      void (async () => {
        setPreviewLoading(true);
        setPreviewError(null);

        try {
          const cardPayload = cardPayments
            .filter((entry) => entry.amount > 0)
            .map((entry) => ({
              amount: entry.amount,
              reference: entry.reference,
            }));

          const result = await previewClientPayment(numericClientId, {
            cash_amount: cashAmount,
            card_payments: cardPayload,
          });

          if (requestId !== previewRequestId.current) return;

          const data = unwrapOrThrow(result);
          setPreview(data);
          setSelectedInstallmentIds(getMaxAllocationIds(data));
        } catch (err) {
          if (requestId !== previewRequestId.current) return;
          console.error("[useClientPayment] Preview error:", err);
          const message =
            err instanceof Error
              ? err.message
              : "No se pudo calcular la asignación del abono";
          setPreview(null);
          setSelectedInstallmentIds([]);
          setPreviewError(message);
        } finally {
          if (requestId === previewRequestId.current) {
            setPreviewLoading(false);
          }
        }
      })();
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [clientId, cashAmount, cardPayments, totalCaptured]);

  const isInPreview = useCallback(
    (_purchaseId: string, installmentId: string) =>
      maxAllocationIds.includes(installmentId),
    [maxAllocationIds],
  );

  const canToggleInstallment = useCallback(
    (_purchaseId: string, installmentId: string) => {
      if (!maxAllocationIds.includes(installmentId)) return false;

      const selectedIndex = selectedInstallmentIds.indexOf(installmentId);
      if (selectedIndex >= 0) {
        return selectedIndex === selectedInstallmentIds.length - 1;
      }

      return installmentId === maxAllocationIds[selectedInstallmentIds.length];
    },
    [maxAllocationIds, selectedInstallmentIds],
  );

  const toggleInstallment = useCallback(
    (_purchaseId: string, installmentId: string) => {
      if (!canToggleInstallment(_purchaseId, installmentId)) return;

      setSelectedInstallmentIds((prev) => {
        const selectedIndex = prev.indexOf(installmentId);
        if (selectedIndex >= 0) {
          return prev.slice(0, selectedIndex);
        }
        if (installmentId === maxAllocationIds[prev.length]) {
          return [...prev, installmentId];
        }
        return prev;
      });
    },
    [canToggleInstallment, maxAllocationIds],
  );

  const addCardPayment = useCallback(() => {
    setCardPayments((prev) => [...prev, createCardPaymentEntry()]);
  }, []);

  const updateCardPayment = useCallback((id: string, amount: number) => {
    const sanitized = Math.max(amount, 0);
    setCardPayments((prev) =>
      prev.map((entry) =>
        entry.id === id ? { ...entry, amount: sanitized } : entry,
      ),
    );
  }, []);

  const removeCardPayment = useCallback((id: string) => {
    setCardPayments((prev) => {
      if (prev.length <= 1) {
        return [createCardPaymentEntry()];
      }
      return prev.filter((entry) => entry.id !== id);
    });
  }, []);

  const submitPayment = useCallback(async () => {
    if (!clientId || !context || !canRegister || !preview) return;
    if (selectedInstallmentIds.length === 0) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const numericClientId = parseInt(clientId, 10);
      const cardPayload = cardPayments
        .filter((entry) => entry.amount > 0)
        .map((entry) => ({
          amount: entry.amount,
          reference: entry.reference,
        }));

      const result = await registerClientPayment(numericClientId, {
        cash_amount: cashAmount,
        card_payments: cardPayload,
        selected_installment_ids: selectedInstallmentIds.map((item) =>
          parseInt(item, 10),
        ),
      });
      const backendResult = unwrapOrThrow(result);

      const now = new Date();
      const dateLabel = dayjs(now).format("D [de] MMMM, YYYY");

      const allocations =
        backendResult.allocations?.length > 0
          ? backendResult.allocations.map((item) => ({
              label: item.label,
              amount: item.amount,
            }))
          : selectedAllocations.map((item) => ({
              label: item.is_full_payment
                ? `Pago de parcialidad ${item.installment_number} de ${item.total_installments}`
                : `Abono de parcialidad ${item.installment_number} de ${item.total_installments}`,
              amount: item.amount_to_pay,
            }));

      const primaryAccount = context.creditAccounts[0];

      setPaymentResult({
        id: String(backendResult.payment.id),
        totalAmount: backendResult.total_applied ?? backendResult.payment.amount,
        dateLabel,
        allocations,
        clientPhone: context.clientPhone,
        paidInstallments:
          backendResult.credit.status === "PAID"
            ? (primaryAccount?.totalInstallments ?? 0)
            : (primaryAccount?.paidInstallments ?? 0) + 1,
        totalInstallments: primaryAccount?.totalInstallments ?? 0,
        receiptUrl: "",
      });

      setCashAmount(0);
      setCardPayments([createCardPaymentEntry()]);
      setPreview(null);
      setSelectedInstallmentIds([]);
      await fetchContext();
    } catch (err) {
      console.error("[useClientPayment] Error submitting payment:", err);
      const message =
        err instanceof Error
          ? err.message
          : "No se pudo registrar el cobro. Intenta de nuevo.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    canRegister,
    cashAmount,
    cardPayments,
    clientId,
    context,
    fetchContext,
    preview,
    selectedAllocations,
    selectedInstallmentIds,
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
    cashAmount,
    cardPayments,
    totalCaptured,
    isSubmitting,
    paymentResult,
    subtotal,
    totalInterest,
    totalDue,
    change,
    canRegister,
    previewLoading,
    previewError,
    setCashAmount,
    addCardPayment,
    updateCardPayment,
    removeCardPayment,
    toggleInstallment,
    canToggleInstallment,
    isInPreview,
    submitPayment,
    refetch: fetchContext,
  };
}
