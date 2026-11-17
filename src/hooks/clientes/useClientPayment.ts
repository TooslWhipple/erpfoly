import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import numeral from "numeral";
import {
  getActiveSaleCredits,
  registerCascadePayment,
  getSaleCreditDetail,
} from "@/services/sale-credit.service";
import type { CascadePaymentPayload, CascadePaymentResult } from "@/services/sale-credit.service";
import { getPaymentTerminalsCatalog } from "@/services/payment-terminals.service";
import type { PaymentTerminalCatalogItem } from "@/types/payment-terminals.types";
import { getSessionSummary } from "@/services/cash-register.service";
import { getClientDetail } from "@/services/clients.service";
import {
  getOpenClientLayaways,
  registerLayawayPayment,
  type OpenClientLayaway,
} from "@/services/ventas.service";
import {
  CASH_REGISTER_SESSION_SUMMARY_KEY,
  invalidateCashRegisterQueries,
} from "@/lib/cashRegisterQueries";
import { getApiErrorMessage, unwrapOrThrow } from "@/lib/axios";
import type {
  ClientCreditAccount,
  ClientPaymentContext,
  ClientPaymentMethod,
  PendingInstallment,
  BackendSaleCreditActiveItem,
} from "@/types/clientPayment.types";
import { formatDate } from "@/utils/date";
import {
  calculateCascadePreview,
  calculateAmountForInstallmentCount,
  getTotalCollectableAmount,
  getTotalPendingInstallmentsCount,
  type CascadeInstallmentPreview,
} from "@/utils/cascadePayment";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import {
  getClientPaymentAccessDenial,
  type ClientPaymentAccessDenialReason,
} from "@/utils/clientPaymentAccess";

export type PartialRemainderDecision = "apply-next" | "give-change";

interface UseClientPaymentResult {
  routerReady: boolean;
  clientId: string | null;
  fromCashRegister: boolean;
  cashRegisterName: string | null;
  context: ClientPaymentContext | null;
  accessDeniedReason: ClientPaymentAccessDenialReason | null;
  loading: boolean;
  error: string | null;
  paymentMethod: ClientPaymentMethod;
  isCashDeposit: boolean;
  paymentAmount: number;
  isSubmitting: boolean;
  totalOutstanding: number;
  totalCollectable: number;
  /** Apartados abiertos del cliente (sucursal activa de la caja). */
  layaways: OpenClientLayaway[];
  /** Monto a abonar por apartado (clave: layawayId), ya topado en lo adeudado. */
  layawayAmounts: Record<number, number>;
  layawayTotal: number;
  layawayOutstanding: number;
  /** Totales del panel de resumen: crédito + apartados. */
  summaryOutstanding: number;
  summaryCollectable: number;
  summaryAmount: number;
  hasCredits: boolean;
  change: number;
  hasPartialInstallmentRemainder: boolean;
  partialInstallmentRemainderAmount: number;
  partialRemainderDecision: PartialRemainderDecision | null;
  canRegister: boolean;
  orderedCreditAccounts: ClientCreditAccount[];
  excludedCreditIds: string[];
  cascadePreview: CascadeInstallmentPreview[];
  displayedCascadePreview: CascadeInstallmentPreview[];
  totalPendingInstallmentsCount: number;
  paymentTerminalId: number | null;
  paymentTerminals: PaymentTerminalCatalogItem[];
  paymentTerminalsLoading: boolean;
  setPaymentMethod: (method: ClientPaymentMethod) => void;
  setIsCashDeposit: (value: boolean) => void;
  setPaymentAmount: (value: number) => void;
  setLayawayAmount: (layawayId: number, value: number) => void;
  setPaymentAmountByInstallmentCount: (count: number) => void;
  setPaymentTerminalId: (value: number | null) => void;
  setPartialRemainderDecision: (choice: PartialRemainderDecision) => void;
  toggleCreditExcluded: (purchaseId: string) => void;
  moveCreditOrder: (purchaseId: string, direction: "up" | "down") => void;
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
    overdue_amount: number;
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
      dueDateRaw: inst.due_date,
      overdueAmount: inst.overdue_amount,
      totalAmount: inst.remaining,
    }));
}

function mapBackendCreditToAccount(
  item: BackendSaleCreditActiveItem,
): ClientCreditAccount {
  const nextPaymentBreakdown = item.next_payment_overdue > 0
    ? `(+ $${item.next_payment_overdue.toFixed(2)} mora)`
    : undefined;

  return {
    id: String(item.id),
    productName: item.product_name,
    purchaseDate: item.purchase_date,
    purchaseDateLabel: formatPurchaseDate(item.purchase_date),
    initialCost: item.initial_cost,
    totalPaid: item.total_paid,
    remaining: item.outstanding_balance,
    paymentDueDate: item.next_due_date ? formatDueDate(item.next_due_date) : "N/A",
    highlightPaymentDueDate: item.status === "ACTIVE" && item.outstanding_balance > 0,
    nextPaymentAmount: item.next_payment_amount,
    nextPaymentBreakdown,
    nextPaymentOverdue: item.next_payment_overdue,
    paidInstallments: item.paid_installments,
    totalInstallments: item.total_installments,
    pendingInstallments: [],
  };
}

function mapFrontendToBackendMethod(method: ClientPaymentMethod): "CASH" | "CARD" {
  return method === "cash" ? "CASH" : "CARD";
}

export function useClientPayment(): UseClientPaymentResult {
  const router = useRouter();
  const { id, from, caja } = router.query;
  const queryClient = useQueryClient();

  const [context, setContext] = useState<ClientPaymentContext | null>(null);
  const [accessDeniedReason, setAccessDeniedReason] =
    useState<ClientPaymentAccessDenialReason | null>(null);
  const [creditOrder, setCreditOrder] = useState<string[]>([]);
  const [excludedCreditIds, setExcludedCreditIds] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethodState] = useState<ClientPaymentMethod>("cash");
  const [isCashDeposit, setIsCashDeposit] = useState(false);
  const [manualPaymentAmount, setManualPaymentAmount] = useState(0);
  const [paymentTerminalId, setPaymentTerminalId] = useState<number | null>(null);
  // Cuenta de parcialidades activa en el stepper, o `null` si el monto
  // actual viene de edición manual. Se guarda la cuenta (no el monto en sí)
  // para poder recalcular en render cuando el cajero excluye/reordena
  // créditos después de haber usado el stepper, en vez de dejar el monto
  // desincronizado sobre créditos que ya no aplican.
  const [stepperInstallmentCount, setStepperInstallmentCount] = useState<number | null>(null);
  const [layaways, setLayaways] = useState<OpenClientLayaway[]>([]);
  const [rawLayawayAmounts, setRawLayawayAmounts] = useState<Record<number, number>>({});

  // Guards del default de monto al entrar: `hasAppliedDefaultRef` asegura que
  // el default (parcialidad 1) se evalúe una sola vez por vida del hook, y
  // `hasUserInteractedRef` evita que ese default pise un monto que el cajero
  // ya haya tecleado a mano mientras el fetch de créditos seguía en curso.
  const hasAppliedDefaultRef = useRef(false);
  const hasUserInteractedRef = useRef(false);

  const setPaymentAmount = useCallback((value: number) => {
    hasUserInteractedRef.current = true;
    setStepperInstallmentCount(null);
    setManualPaymentAmount(value);
  }, []);

  const setPaymentMethod = useCallback((method: ClientPaymentMethod) => {
    setPaymentMethodState(method);
    setPaymentTerminalId(null);
  }, []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const routerReady = router.isReady;
  const clientId = typeof id === "string" ? id : null;
  const fromCashRegister = from === "cajas";
  const cashRegisterName = typeof caja === "string" ? decodeURIComponent(caja) : "Caja 1";

  const fetchContext = useCallback(async () => {
    if (!clientId) return;

    setLoading(true);
    setError(null);
    setAccessDeniedReason(null);

    try {
      const numericClientId = parseInt(clientId, 10);
      const [clientDetailResult, creditsResult, layawaysResult] = await Promise.all([
        getClientDetail(numericClientId),
        getActiveSaleCredits(numericClientId, 1, 50),
        getOpenClientLayaways(numericClientId),
      ]);
      const clientDetail = unwrapOrThrow(clientDetailResult);
      const data = unwrapOrThrow(creditsResult);
      const activeCredits = data.rows ?? [];
      // Los apartados dependen de la caja activa del usuario: si no se pueden
      // consultar (p. ej. sin sesión de caja) el cobro de crédito sigue igual.
      const openLayaways = layawaysResult.error ? [] : (layawaysResult.data?.rows ?? []);
      setLayaways(openLayaways);
      setRawLayawayAmounts({});

      const denial = getClientPaymentAccessDenial({
        creditApplicationId: clientDetail.creditApplicationId,
        status: clientDetail.status,
        activeCredits,
        openLayaways,
      });

      if (denial) {
        setAccessDeniedReason(denial);
        setContext(null);
        setCreditOrder([]);
        setExcludedCreditIds([]);
        return;
      }

      if (activeCredits.length === 0) {
        setContext({
          clientId,
          clientName: clientDetail.fullName || "Cliente",
          clientPhone: "",
          creditAccounts: [],
        });
        setCreditOrder([]);
        setExcludedCreditIds([]);
        return;
      }

      const creditDetails = await Promise.all(
        activeCredits.map(async (item: BackendSaleCreditActiveItem) => {
          try {
            const detailResult = await getSaleCreditDetail(item.id);
            const detail = unwrapOrThrow(detailResult);
            return { item, detail };
          } catch {
            return { item, detail: null };
          }
        }),
      );

      const accounts: ClientCreditAccount[] = creditDetails
        .map(({ item, detail }) => {
          const account = mapBackendCreditToAccount(item);

          if (detail?.installments) {
            account.pendingInstallments = mapBackendInstallments(
              detail.installments,
              item.total_installments,
            );
          }

          return account;
        })
        .sort((a, b) => new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime());

      const clientPhone = activeCredits[0]?.client_phone ?? "";

      setContext({
        clientId,
        clientName: clientDetail.fullName || "Cliente",
        clientPhone,
        creditAccounts: accounts,
      });
      setCreditOrder(accounts.map((account) => account.id));
      setExcludedCreditIds([]);
    } catch (err) {
      console.error("[useClientPayment] Error loading payment context:", err);
      setContext(null);
      setLayaways([]);
      setAccessDeniedReason(null);
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

  const orderedCreditAccounts = useMemo(() => {
    const accounts = context?.creditAccounts ?? [];
    const accountsById = new Map(accounts.map((account) => [account.id, account]));
    return creditOrder
      .map((id) => accountsById.get(id))
      .filter((account): account is ClientCreditAccount => account !== undefined);
  }, [context?.creditAccounts, creditOrder]);

  const totalPendingInstallmentsCount = useMemo(
    () => getTotalPendingInstallmentsCount(orderedCreditAccounts, excludedCreditIds),
    [orderedCreditAccounts, excludedCreditIds],
  );

  // Si el monto viene del stepper, se deriva en cada render a partir de la
  // cuenta seleccionada — así, si el cajero excluye/reordena créditos
  // después de haber usado el stepper, el monto se recalcula solo en vez
  // de quedar calculado sobre créditos que ya no aplican (ver "Riesgos y
  // side effects a vigilar" del plan). Si el cajero editó el monto a mano,
  // `stepperInstallmentCount` es `null` y se usa el valor manual tal cual.
  const paymentAmount = useMemo(() => {
    if (stepperInstallmentCount === null) return manualPaymentAmount;
    const clampedCount = Math.min(stepperInstallmentCount, totalPendingInstallmentsCount);
    if (clampedCount <= 0) return manualPaymentAmount;
    return calculateAmountForInstallmentCount(orderedCreditAccounts, excludedCreditIds, clampedCount);
  }, [stepperInstallmentCount, manualPaymentAmount, totalPendingInstallmentsCount, orderedCreditAccounts, excludedCreditIds]);

  const cascadePreview = useMemo(
    () => calculateCascadePreview(orderedCreditAccounts, excludedCreditIds, paymentAmount),
    [orderedCreditAccounts, excludedCreditIds, paymentAmount],
  );

  const setPaymentAmountByInstallmentCount = useCallback((count: number) => {
    setStepperInstallmentCount(count);
  }, []);

  // Default de monto al entrar: la primera vez que hay parcialidades
  // pendientes disponibles, precarga el monto de la parcialidad 1 (salvo que
  // el cajero ya haya editado el monto a mano mientras el fetch estaba en
  // curso — ver refs arriba). Se evalúa una sola vez por vida del hook, así
  // que un refetch posterior (p. ej. tras excluir un crédito) no lo repite.
  useEffect(() => {
    if (hasAppliedDefaultRef.current) return;
    if (totalPendingInstallmentsCount <= 0) return;

    hasAppliedDefaultRef.current = true;
    if (!hasUserInteractedRef.current) {
      setPaymentAmountByInstallmentCount(1);
    }
  }, [totalPendingInstallmentsCount, setPaymentAmountByInstallmentCount]);

  const totalOutstanding = useMemo(
    () =>
      orderedCreditAccounts
        .filter((account) => !excludedCreditIds.includes(account.id))
        .reduce((sum, account) => sum + account.remaining, 0),
    [orderedCreditAccounts, excludedCreditIds],
  );

  const totalCollectable = useMemo(
    () => getTotalCollectableAmount(orderedCreditAccounts, excludedCreditIds),
    [orderedCreditAccounts, excludedCreditIds],
  );

  const layawayAmounts = useMemo(() => {
    const capped: Record<number, number> = {};
    for (const layaway of layaways) {
      const raw = rawLayawayAmounts[layaway.layawayId] ?? 0;
      capped[layaway.layawayId] = Math.min(Math.max(raw, 0), layaway.totalDue);
    }
    return capped;
  }, [layaways, rawLayawayAmounts]);

  const layawayTotal = useMemo(
    () =>
      parseFloat(
        Object.values(layawayAmounts)
          .reduce((sum, amount) => sum + amount, 0)
          .toFixed(2),
      ),
    [layawayAmounts],
  );

  const layawayOutstanding = useMemo(
    () =>
      parseFloat(layaways.reduce((sum, layaway) => sum + layaway.totalDue, 0).toFixed(2)),
    [layaways],
  );

  const setLayawayAmount = useCallback((layawayId: number, value: number) => {
    setRawLayawayAmounts((prev) => ({ ...prev, [layawayId]: value }));
  }, []);

  const canExceedOutstandingForChange = paymentMethod === "cash" && !isCashDeposit;

  const partialCascadeEntry = useMemo(
    () => cascadePreview.find((entry) => !entry.fullyCovered && entry.amountApplied > 0) ?? null,
    [cascadePreview],
  );

  const partialInstallmentRemainderAmount = partialCascadeEntry?.amountApplied ?? 0;

  const hasPartialInstallmentRemainder =
    canExceedOutstandingForChange && partialInstallmentRemainderAmount > 0;

  // La decisión se ata a la parcialidad concreta que quedó parcial: si el
  // cajero edita el monto y el remanente recae en otra parcialidad, la
  // decisión anterior deja de aplicar y hay que volver a preguntar (no se
  // recuerda como preferencia general).
  const [partialRemainderChoiceState, setPartialRemainderChoiceState] = useState<{
    installmentId: string;
    choice: PartialRemainderDecision;
  } | null>(null);

  const partialRemainderDecision: PartialRemainderDecision | null =
    hasPartialInstallmentRemainder &&
    partialRemainderChoiceState !== null &&
    partialRemainderChoiceState.installmentId === partialCascadeEntry?.installmentId
      ? partialRemainderChoiceState.choice
      : null;

  const setPartialRemainderDecision = useCallback(
    (choice: PartialRemainderDecision) => {
      if (!partialCascadeEntry) return;
      setPartialRemainderChoiceState({ installmentId: partialCascadeEntry.installmentId, choice });
    },
    [partialCascadeEntry],
  );

  // Suma de las parcialidades que la cascada cubre por completo con el
  // monto tecleado — es el tope a enviar cuando el cajero elige "dar
  // cambio" para el remanente parcial (excluye el pago parcial de la
  // siguiente parcialidad, que en ese caso no se aplica).
  const fullyCoveredCascadeAmount = useMemo(
    () =>
      cascadePreview
        .filter((entry) => entry.fullyCovered)
        .reduce((sum, entry) => sum + entry.amountApplied, 0),
    [cascadePreview],
  );

  // Vista que se muestra en las tarjetas de crédito: si el cajero eligió
  // "dar cambio", la parcialidad que había quedado parcial en el preview no
  // se va a abonar de verdad (paso B3 la excluye del monto enviado), así
  // que se le quita del preview visual para no mostrarle al cajero un
  // abono parcial que no va a ocurrir.
  const displayedCascadePreview = useMemo(() => {
    if (partialRemainderDecision !== "give-change" || !partialCascadeEntry) return cascadePreview;
    return cascadePreview.filter(
      (entry) => entry.installmentId !== partialCascadeEntry.installmentId,
    );
  }, [cascadePreview, partialRemainderDecision, partialCascadeEntry]);

  const change = useMemo(() => {
    if (!canExceedOutstandingForChange) return 0;
    if (partialRemainderDecision === "give-change") {
      return Math.max(parseFloat((paymentAmount - fullyCoveredCascadeAmount).toFixed(2)), 0);
    }
    return Math.max(parseFloat((paymentAmount - totalCollectable).toFixed(2)), 0);
  }, [paymentAmount, canExceedOutstandingForChange, totalCollectable, partialRemainderDecision, fullyCoveredCascadeAmount]);

  const isCardPayment = paymentMethod === "card";

  // La sucursal desde la que se está cobrando el abono en este momento
  // (caja activa del cajero), no la sucursal original de la venta a crédito.
  const activeSessionQuery = useQuery({
    queryKey: CASH_REGISTER_SESSION_SUMMARY_KEY,
    queryFn: () => getSessionSummary(),
    enabled: isCardPayment,
    staleTime: 60_000,
  });
  const activeBranchId = activeSessionQuery.data?.branch_id ?? null;

  const paymentTerminalsQuery = useQuery({
    queryKey: ["payment-terminals-catalog", activeBranchId],
    queryFn: () => getPaymentTerminalsCatalog(activeBranchId!),
    enabled: isCardPayment && activeBranchId != null,
    staleTime: 60_000,
  });
  const paymentTerminals = paymentTerminalsQuery.data ?? [];

  const hasCredits = orderedCreditAccounts.length > 0;
  // Se cobra crédito solo si el cajero dejó un monto en la cascada; si únicamente
  // captura apartados, la parte de crédito no interviene en la validación.
  const isCollectingCredit = hasCredits && paymentAmount > 0;
  const isCreditPaymentValid =
    totalOutstanding > 0 &&
    paymentAmount > 0 &&
    (paymentAmount <= totalCollectable || canExceedOutstandingForChange) &&
    !(hasPartialInstallmentRemainder && !partialRemainderDecision);

  const canRegister =
    (isCollectingCredit ? isCreditPaymentValid : layawayTotal > 0) &&
    !(isCardPayment && !paymentTerminalId) &&
    !isSubmitting;

  const summaryOutstanding = totalOutstanding + layawayOutstanding;
  const summaryCollectable = totalCollectable + layawayOutstanding;
  const summaryAmount = Math.min(Math.max(paymentAmount, 0), totalCollectable) + layawayTotal;

  const toggleCreditExcluded = useCallback((purchaseId: string) => {
    setExcludedCreditIds((prev) =>
      prev.includes(purchaseId)
        ? prev.filter((id) => id !== purchaseId)
        : [...prev, purchaseId],
    );
  }, []);

  const moveCreditOrder = useCallback((purchaseId: string, direction: "up" | "down") => {
    setCreditOrder((prev) => {
      const index = prev.indexOf(purchaseId);
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (index === -1 || targetIndex < 0 || targetIndex >= prev.length) {
        return prev;
      }
      const next = [...prev];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  }, []);

  const submitPayment = useCallback(async () => {
    if (!clientId || !context || !canRegister) return;

    setIsSubmitting(true);
    setError(null);

    const snackbar = useSnackbarStore.getState();
    // Qué se cobró y qué no, para decirlo claro si algo falla a medias: cada
    // cobro es una llamada independiente y nunca se reintenta solo.
    const collected: string[] = [];
    let creditReceiptId: number | null = null;

    try {
      const numericClientId = parseInt(clientId, 10);

      if (isCollectingCredit) {
        const includedCreditOrder = orderedCreditAccounts
          .filter((account) => !excludedCreditIds.includes(account.id))
          .map((account) => parseInt(account.id, 10));

        const backendPayload: CascadePaymentPayload = {
          amount:
            partialRemainderDecision === "give-change"
              ? fullyCoveredCascadeAmount
              : canExceedOutstandingForChange
                ? Math.min(paymentAmount, totalCollectable)
                : paymentAmount,
          payment_method: mapFrontendToBackendMethod(paymentMethod),
          reference: isCashDeposit ? "Depósito en efectivo" : undefined,
          notes: isCashDeposit ? "Abono realizado como depósito en efectivo" : undefined,
          credit_order: includedCreditOrder,
          payment_terminal_id: isCardPayment ? (paymentTerminalId ?? undefined) : undefined,
        };

        const result = await registerCascadePayment(numericClientId, backendPayload);
        const backendResult = unwrapOrThrow(result) as CascadePaymentResult;
        collected.push(`Crédito ${numeral(backendPayload.amount).format("$0,0.00")}`);
        // El crédito ya quedó cobrado: se limpia el monto para que un refetch
        // posterior no lo vuelva a ofrecer (ni lo cobre dos veces).
        setStepperInstallmentCount(null);
        setManualPaymentAmount(0);
        hasUserInteractedRef.current = true;

        if (!backendResult.receipt?.id) {
          snackbar.showError(
            backendResult.message ||
              "El abono se registró, pero no se pudo generar el comprobante. No lo cobres de nuevo.",
          );
          if (layawayTotal === 0) {
            await fetchContext();
            return;
          }
        } else {
          creditReceiptId = backendResult.receipt.id;
        }
      }

      const layawaysToCharge = layaways.filter(
        (layaway) => (layawayAmounts[layaway.layawayId] ?? 0) > 0,
      );
      for (const layaway of layawaysToCharge) {
        const amount = layawayAmounts[layaway.layawayId];
        const label = `${layaway.productName ?? `Apartado ${layaway.folio}`} ${numeral(amount).format("$0,0.00")}`;
        try {
          const layawayResult = await registerLayawayPayment(layaway.layawayId, {
            payment_method: mapFrontendToBackendMethod(paymentMethod),
            amount,
            payment_terminal_id: isCardPayment ? (paymentTerminalId ?? undefined) : undefined,
          });
          unwrapOrThrow(layawayResult);
          collected.push(`Apartado ${label}`);
        } catch (err) {
          const pending = layawaysToCharge
            .slice(layawaysToCharge.indexOf(layaway))
            .map((item) => item.productName ?? item.folio)
            .join(", ");
          const done = collected.length > 0 ? collected.join("; ") : "nada";
          snackbar.showError(
            `No se pudo cobrar ${label}: ${getApiErrorMessage(err)}. Ya cobrado: ${done}. Sin cobrar: ${pending}. Revisa los saldos antes de volver a cobrar.`,
          );
          if (collected.length > 0 || fromCashRegister) {
            invalidateCashRegisterQueries(queryClient);
          }
          await fetchContext();
          return;
        }
      }

      if (fromCashRegister) {
        invalidateCashRegisterQueries(queryClient);
      }

      if (creditReceiptId != null) {
        if (layawaysToCharge.length > 0) {
          snackbar.showSuccess(`Cobro registrado: ${collected.join("; ")}`);
        }
        const params = new URLSearchParams();
        if (fromCashRegister) {
          params.set("from", "cajas");
          if (typeof caja === "string") params.set("caja", caja);
        }
        const query = params.toString();
        await router.replace(
          `/clientes/${clientId}/abonos/comprobantes/${creditReceiptId}${query ? `?${query}` : ""}`,
        );
        return;
      }

      // Solo apartados: no hay comprobante de crédito al que navegar, así que
      // se confirma aquí y se recargan los saldos.
      snackbar.showSuccess(`Cobro registrado: ${collected.join("; ")}`);
      await fetchContext();
    } catch (err) {
      console.error("[useClientPayment] Error submitting payment:", err);
      const message = err instanceof Error ? err.message : "No se pudo registrar el cobro. Intenta de nuevo.";
      setError(message);
      if (collected.length > 0) {
        snackbar.showError(`${message}. Ya cobrado: ${collected.join("; ")}.`);
        await fetchContext();
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [
    canExceedOutstandingForChange,
    canRegister,
    clientId,
    context,
    excludedCreditIds,
    fetchContext,
    fromCashRegister,
    fullyCoveredCascadeAmount,
    isCardPayment,
    isCashDeposit,
    isCollectingCredit,
    layawayAmounts,
    layawayTotal,
    layaways,
    orderedCreditAccounts,
    partialRemainderDecision,
    paymentAmount,
    paymentMethod,
    caja,
    paymentTerminalId,
    queryClient,
    router,
    totalCollectable,
  ]);

  return {
    routerReady,
    clientId,
    fromCashRegister,
    cashRegisterName,
    context,
    accessDeniedReason,
    loading,
    error,
    paymentMethod,
    isCashDeposit,
    paymentAmount,
    isSubmitting,
    totalOutstanding,
    totalCollectable,
    layaways,
    layawayAmounts,
    layawayTotal,
    layawayOutstanding,
    summaryOutstanding,
    summaryCollectable,
    summaryAmount,
    hasCredits,
    change,
    hasPartialInstallmentRemainder,
    partialInstallmentRemainderAmount,
    partialRemainderDecision,
    canRegister,
    orderedCreditAccounts,
    excludedCreditIds,
    cascadePreview,
    displayedCascadePreview,
    totalPendingInstallmentsCount,
    paymentTerminalId,
    paymentTerminals,
    paymentTerminalsLoading: paymentTerminalsQuery.isLoading,
    setPaymentMethod,
    setIsCashDeposit,
    setPaymentAmount,
    setLayawayAmount,
    setPaymentAmountByInstallmentCount,
    setPaymentTerminalId,
    setPartialRemainderDecision,
    toggleCreditExcluded,
    moveCreditOrder,
    submitPayment,
    refetch: fetchContext,
  };
}
