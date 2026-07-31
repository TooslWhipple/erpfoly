import { Stack, Typography } from "@mui/material";
import numeral from "numeral";
import { DataTable } from "@/components/TableCrud";
import type { DataTableColumn } from "@/components/TableCrud";
import type { GeneralExpensePayment } from "@/types/general-expenses.types";
import { PaymentsTotalRow } from "./styles";

export interface ExpensePaymentsTabProps {
  payments: GeneralExpensePayment[];
}

export function ExpensePaymentsTab({ payments }: ExpensePaymentsTabProps) {
  const total = payments.reduce((sum, payment) => sum + payment.amount, 0);

  const columns: DataTableColumn<GeneralExpensePayment>[] = [
    {
      id: "date",
      label: "Fecha",
    },
    {
      id: "registeredBy",
      label: "Registró",
    },
    {
      id: "amount",
      label: "Monto del pago",
      type: "currency",
      align: "right",
    },
  ];

  return (
    <Stack spacing={2}>
      <DataTable
        columns={columns}
        rows={payments}
        rowKey="id"
        emptyMessage="Aún no hay pagos registrados"
      />

      {payments.length > 0 && (
        <PaymentsTotalRow>
          <Typography variant="subtitle2" />
          <Typography variant="subtitle2" textAlign="center">
            Total
          </Typography>
          <Typography variant="subtitle2" textAlign="right">
            {numeral(total).format("$0,0.00")}
          </Typography>
        </PaymentsTotalRow>
      )}
    </Stack>
  );
}
