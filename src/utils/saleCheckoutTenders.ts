import { roundToCents } from "@/utils/number";

export type CheckoutCardTender = {
  amount: number;
  payment_terminal_id?: number;
};

export type AllocatedCheckoutTender = {
  payment_method: "CASH" | "CARD";
  amount: number;
  received_amount?: number;
  payment_terminal_id?: number;
};

/** Cash `amount` is applied to the ticket; `received_amount` is what the drawer took. */
export function allocateCheckoutTenders(input: {
  due: number;
  cashReceived: number;
  cards: CheckoutCardTender[];
}): AllocatedCheckoutTender[] {
  const due = roundToCents(input.due);
  const cards = input.cards
    .filter((card) => card.amount > 0)
    .map((card) => ({
      ...card,
      amount: roundToCents(card.amount),
    }));
  const cardSum = roundToCents(cards.reduce((sum, card) => sum + card.amount, 0));
  if (cardSum - due > 0.009) {
    throw new Error("La suma de tarjetas excede el monto a cobrar");
  }

  const cashApplied = roundToCents(Math.max(0, due - cardSum));
  const cashReceived = roundToCents(input.cashReceived);
  const tenders: AllocatedCheckoutTender[] = [];

  if (cashApplied > 0) {
    if (cashReceived + 0.009 < cashApplied) {
      throw new Error(
        "El efectivo no cubre el restante después de las tarjetas",
      );
    }
    tenders.push({
      payment_method: "CASH",
      amount: cashApplied,
      received_amount: Math.max(cashReceived, cashApplied),
    });
  }

  for (const card of cards) {
    tenders.push({
      payment_method: "CARD",
      amount: card.amount,
      payment_terminal_id: card.payment_terminal_id,
    });
  }

  return tenders;
}

export function cashChangeDue(
  due: number,
  cashReceived: number,
  cardSum: number,
): number {
  const cashApplied = roundToCents(
    Math.max(0, roundToCents(due) - roundToCents(cardSum)),
  );
  return roundToCents(Math.max(0, roundToCents(cashReceived) - cashApplied));
}

if (typeof process !== "undefined" && process.env.NODE_ENV === "test") {
  const mixed = allocateCheckoutTenders({
    due: 25039.1,
    cashReceived: 9000,
    cards: [{ amount: 16099 }],
  });
  if (
    mixed.length !== 2 ||
    mixed[0].amount !== 8940.1 ||
    mixed[0].received_amount !== 9000 ||
    mixed[1].amount !== 16099
  ) {
    throw new Error("saleCheckoutTenders: mixed cash applies remainder");
  }
  if (cashChangeDue(25039.1, 9000, 16099) !== 59.9) {
    throw new Error("saleCheckoutTenders: mixed change is cash overage");
  }
}
