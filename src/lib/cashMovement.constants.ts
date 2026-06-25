export const CashMovementType = {
  PAYMENT: "PAYMENT",
  WITHDRAWAL: "WITHDRAWAL",
  PARTIAL_CUT: "PARTIAL_CUT",
  FINAL_CUT: "FINAL_CUT",
} as const;

export type CashMovementType =
  (typeof CashMovementType)[keyof typeof CashMovementType];

export const MOVEMENT_TYPE_LABELS: Record<CashMovementType, string> = {
  PAYMENT: "Abono a cuenta",
  WITHDRAWAL: "Retiro de caja",
  PARTIAL_CUT: "Corte parcial",
  FINAL_CUT: "Corte final",
};

export const MOVEMENT_TYPE_COLORS: Record<CashMovementType, string> = {
  PAYMENT: "#16A34A",
  WITHDRAWAL: "#D97706",
  PARTIAL_CUT: "#D97706",
  FINAL_CUT: "#D97706",
};

export type MovementTypeIconVariant = "income" | "outcome";

export const MOVEMENT_TYPE_ICON_VARIANT: Record<
  CashMovementType,
  MovementTypeIconVariant
> = {
  PAYMENT: "income",
  WITHDRAWAL: "outcome",
  PARTIAL_CUT: "outcome",
  FINAL_CUT: "outcome",
};

export function isCashMovementType(value: string): value is CashMovementType {
  return Object.values(CashMovementType).includes(value as CashMovementType);
}

export const CashMovementPaymentForm = {
  CASH: "CASH",
  CASH_DEPOSIT: "CASH_DEPOSIT",
  CREDIT_CARD: "CREDIT_CARD",
} as const;

export type CashMovementPaymentForm =
  (typeof CashMovementPaymentForm)[keyof typeof CashMovementPaymentForm];

export const PAYMENT_FORM_LABELS: Record<CashMovementPaymentForm, string> = {
  CASH: "Efectivo",
  CASH_DEPOSIT: "Depósito en efectivo",
  CREDIT_CARD: "Tarjeta de crédito",
};

export function isCashMovementPaymentForm(
  value: string,
): value is CashMovementPaymentForm {
  return Object.values(CashMovementPaymentForm).includes(
    value as CashMovementPaymentForm,
  );
}

export function getPaymentFormLabel(
  paymentForm?: CashMovementPaymentForm | null,
): string {
  return PAYMENT_FORM_LABELS[paymentForm ?? CashMovementPaymentForm.CASH];
}
