import { Button, Stack, Typography } from "@mui/material";
import numeral from "numeral";
import { DataTable } from "@/components/TableCrud";
import type { DataTableColumn } from "@/components/TableCrud";
import type { GeneralExpensePayment } from "@/types/general-expenses.types";
import { PaymentsTotalRow } from "./styles";
import { SectionHeader } from "@/styles/facturas/registerExpense.styles";

export interface ExpensePaymentsTabProps {
  payments: GeneralExpensePayment[];
  onAddPayment?: () => void;
  disabled?: boolean;
}

export function ExpensePaymentsTab({
  payments,
  onAddPayment,
  disabled = false,
}: ExpensePaymentsTabProps) {
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
      <SectionHeader>
        <Typography variant="subtitle1" fontWeight={600}>
          Pagos
        </Typography>
        {onAddPayment && (
          <Button
            variant="outlined"
            size="small"
            onClick={onAddPayment}
            disabled={disabled}
          >
            Nuevo
          </Button>
        )}
      </SectionHeader>

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
          <Typography variant="subtitle2" textAlign="right" fontWeight={700}>
            {numeral(total).format("$0,0.00")}
          </Typography>
        </PaymentsTotalRow>
      )}
    </Stack>
  );
}
