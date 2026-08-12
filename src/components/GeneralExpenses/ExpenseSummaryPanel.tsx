import { ExpenseProgressBars } from "./ExpenseProgressBars";
import {
  SummaryCard,
  SummaryPanel,
  SummaryTitle,
} from "@/styles/facturas/registerExpense.styles";

export interface ExpenseSummaryPanelProps {
  paidAmount: number;
  invoicesAmount: number;
  totalAmount: number;
}

export function ExpenseSummaryPanel({
  paidAmount,
  invoicesAmount,
  totalAmount,
}: ExpenseSummaryPanelProps) {
  return (
    <SummaryPanel>
      <SummaryCard>
        <SummaryTitle>Resumen</SummaryTitle>
        <ExpenseProgressBars
          paidAmount={paidAmount}
          invoicesAmount={invoicesAmount}
          totalAmount={totalAmount}
          stacked
        />
      </SummaryCard>
    </SummaryPanel>
  );
}
