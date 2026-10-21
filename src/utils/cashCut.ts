import numeral from "numeral";
import {
  CashMovementPaymentForm,
  CashMovementType,
} from "../lib/cashMovement.constants";

export interface CashCutMovement {
  amount?: unknown;
  movement_type: string;
  payment_form?: string | null;
}

export interface CashCutSummaryInput {
  movements: CashCutMovement[];
  initialFund: unknown;
  currentCash: unknown;
}

export interface CashCutSummary {
  cash: number;
  creditCard: number;
  cashDeposits: number;
  withdrawals: number;
  withdrawalAmount: number;
  totalIncome: number;
  shortage: number;
}

/** Empty, null, and non-numeric values count as zero in the cut equation. */
export function toAmount(value: unknown): number {
  if (value == null || value === "") return 0;
  const parsed = parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatCashAmount(value: unknown): string {
  return numeral(toAmount(value)).format("$0,0.00");
}

function sumAmounts(movements: CashCutMovement[]): number {
  return movements.reduce((sum, movement) => sum + toAmount(movement.amount), 0);
}

/**
 * Final-cut breakdown. Expected drawer cash is opening fund + cash sales +
 * cash deposits − withdrawals and partial cuts. Card sales are reported but
 * do not sit in the drawer. Shortage is expected cash minus cash on hand.
 */
export function buildCashCutSummary(input: CashCutSummaryInput): CashCutSummary {
  const payments = input.movements.filter(
    (movement) =>
      movement.movement_type === CashMovementType.PAYMENT ||
      movement.movement_type === CashMovementType.SALE,
  );
  const sumByPaymentForm = (form: string) =>
    sumAmounts(
      payments.filter(
        (movement) =>
          (movement.payment_form ?? CashMovementPaymentForm.CASH) === form,
      ),
    );

  const cash = toAmount(sumByPaymentForm(CashMovementPaymentForm.CASH));
  const creditCard = toAmount(
    sumByPaymentForm(CashMovementPaymentForm.CREDIT_CARD),
  );
  const cashDeposits = toAmount(
    sumByPaymentForm(CashMovementPaymentForm.CASH_DEPOSIT),
  );
  const withdrawalMovements = input.movements.filter(
    (movement) => movement.movement_type === CashMovementType.WITHDRAWAL,
  );
  const partialCuts = input.movements.filter(
    (movement) => movement.movement_type === CashMovementType.PARTIAL_CUT,
  );
  const withdrawalAmount = toAmount(
    sumAmounts(withdrawalMovements) + sumAmounts(partialCuts),
  );
  const initialFund = toAmount(input.initialFund);
  const currentCash = toAmount(input.currentCash);
  const totalIncome = cash + creditCard + cashDeposits;
  const expectedCash = initialFund + cash + cashDeposits - withdrawalAmount;

  return {
    cash,
    creditCard,
    cashDeposits,
    withdrawals: withdrawalMovements.length,
    withdrawalAmount,
    totalIncome,
    shortage: expectedCash - currentCash,
  };
}
