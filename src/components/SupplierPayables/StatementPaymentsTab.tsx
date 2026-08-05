import { Stack, Typography } from "@mui/material";
import numeral from "numeral";
import { DataTable } from "@/components/TableCrud";
import type { DataTableColumn } from "@/components/TableCrud";
import type { SupplierPayablePayment } from "@/types/supplier-payables.types";
import { formatDate } from "@/utils/date";
import { BlockedPaymentsBox, GrandTotalRow, TotalsFooter } from "./styles";

export interface StatementPaymentsTabProps {
  payments: SupplierPayablePayment[];
  blocked?: boolean;
}

const STATUS_LABELS: Record<SupplierPayablePayment["status"], string> = {
  paid: "Pagado",
  scheduled: "Programado",
};

export function StatementPaymentsTab({
  payments,
  blocked = false,
}: StatementPaymentsTabProps) {
  const total = payments.reduce((sum, payment) => sum + payment.amount, 0);

  const columns: DataTableColumn<SupplierPayablePayment>[] = [
    {
      id: "date",
      label: "Fecha",
      format: (_value, row) => formatDate(row.date, "DD/MMMM/YYYY"),
    },
    {
      id: "registeredBy",
      label: "Registró",
    },
    {
      id: "status",
      label: "Estatus",
      type: "chip",
      chipVariantMap: {
        paid: "success",
        scheduled: "info",
      },
      chipLabelMap: STATUS_LABELS,
    },
    {
      id: "amount",
      label: "Monto del pago",
      type: "currency",
      align: "right",
    },
  ];

  if (blocked) {
    return (
      <BlockedPaymentsBox>
        <Typography variant="body2" color="text.secondary">
          No es posible registrar pagos en este estado de cuenta ya que
          existen movimientos que requieren atención
        </Typography>
      </BlockedPaymentsBox>
    );
  }

  return (
    <Stack spacing={2}>
      <DataTable
        columns={columns}
        rows={payments}
        rowKey="id"
        emptyMessage="Aún no hay pagos registrados"
      />

      {payments.length > 0 && (
        <TotalsFooter>
          <GrandTotalRow>
            <Typography variant="subtitle2" />
            <Typography variant="subtitle2" textAlign="center">
              Total
            </Typography>
            <Typography variant="subtitle2" textAlign="right">
              {numeral(total).format("$0,0.00")}
            </Typography>
          </GrandTotalRow>
        </TotalsFooter>
      )}
    </Stack>
  );
}
