import type {
  ClientCreditAccount,
  InstallmentSelection,
  PendingInstallment,
} from "@/types/clientPayment.types";

const AMOUNT_EPSILON = 0.001;

export function getOrderedPendingInstallments(
  account: ClientCreditAccount,
): PendingInstallment[] {
  return [...account.pendingInstallments].sort(
    (left, right) => left.installmentNumber - right.installmentNumber,
  );
}

export function getSelectedOrderedInstallments(
  account: ClientCreditAccount,
  selections: InstallmentSelection[],
): PendingInstallment[] {
  const selectedIds = new Set(
    selections
      .filter(
        (selection) =>
          selection.purchaseId === account.id &&
          selection.selected &&
          selection.amountToPay > 0,
      )
      .map((selection) => selection.installmentId),
  );

  return getOrderedPendingInstallments(account).filter((installment) =>
    selectedIds.has(installment.id),
  );
}

/**
 * Any pending installment is interactive: clicking installment k selects the
 * contiguous prefix 1..k, or truncates the selection from k onward.
 */
export function canInteractWithInstallment(
  account: ClientCreditAccount,
  installmentId: string,
  _selections: InstallmentSelection[],
): boolean {
  return getOrderedPendingInstallments(account).some((item) => item.id === installmentId);
}

export function isLastSelectedInstallment(
  account: ClientCreditAccount,
  installmentId: string,
  selections: InstallmentSelection[],
): boolean {
  const selectedOrdered = getSelectedOrderedInstallments(account, selections);
  if (selectedOrdered.length === 0) return false;
  return selectedOrdered[selectedOrdered.length - 1]?.id === installmentId;
}

/**
 * Toggle with prefix semantics:
 * - Selecting installment at index k selects 1..k (full remaining).
 * - Deselecting installment at index k clears k..end.
 */
export function applyOrderedToggle(
  accounts: ClientCreditAccount[],
  selections: InstallmentSelection[],
  purchaseId: string,
  installmentId: string,
): InstallmentSelection[] {
  const account = accounts.find((item) => item.id === purchaseId);
  if (!account) return selections;

  const ordered = getOrderedPendingInstallments(account);
  const targetIndex = ordered.findIndex((item) => item.id === installmentId);
  if (targetIndex < 0) return selections;

  const selectedOrdered = getSelectedOrderedInstallments(account, selections);
  const alreadySelected = selectedOrdered.some((item) => item.id === installmentId);

  const nextSelectedIds = new Set<string>();
  if (alreadySelected) {
    for (let index = 0; index < targetIndex; index += 1) {
      nextSelectedIds.add(ordered[index].id);
    }
  } else {
    for (let index = 0; index <= targetIndex; index += 1) {
      nextSelectedIds.add(ordered[index].id);
    }
  }

  return selections.map((selection) => {
    if (selection.purchaseId !== purchaseId) {
      return selection;
    }

    const installment = ordered.find((item) => item.id === selection.installmentId);
    if (!installment) {
      return { ...selection, selected: false, amountToPay: 0 };
    }

    const selected = nextSelectedIds.has(selection.installmentId);
    return {
      ...selection,
      selected,
      amountToPay: selected ? installment.totalAmount : 0,
    };
  });
}

export function applyOrderedAmountChange(
  accounts: ClientCreditAccount[],
  selections: InstallmentSelection[],
  purchaseId: string,
  installmentId: string,
  amount: number,
): InstallmentSelection[] {
  const account = accounts.find((item) => item.id === purchaseId);
  if (!account) return selections;

  if (!isLastSelectedInstallment(account, installmentId, selections)) {
    return selections;
  }

  const installment = account.pendingInstallments.find((item) => item.id === installmentId);
  if (!installment) return selections;

  const sanitized = Math.min(Math.max(amount, 0), installment.totalAmount);

  if (sanitized <= AMOUNT_EPSILON) {
    return applyOrderedToggle(accounts, selections, purchaseId, installmentId);
  }

  return selections.map((selection) => {
    if (selection.purchaseId !== purchaseId || selection.installmentId !== installmentId) {
      return selection;
    }

    return {
      ...selection,
      selected: true,
      amountToPay: sanitized,
    };
  });
}
