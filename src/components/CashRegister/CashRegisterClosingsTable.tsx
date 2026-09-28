import { Typography } from "@mui/material";
import { Printer } from "lucide-react";
import numeral from "numeral";
import { TableCrud } from "@/components";
import type { Column, RowAction } from "@/components/TableCrud";
import type { AssignedCashRegisterClosingItem } from "@/services/cash-register.service";
import { formatDate } from "@/utils/date";

export interface CashRegisterClosingsTableProps {
  rows: AssignedCashRegisterClosingItem[];
  loading?: boolean;
  page: number;
  rowsPerPage: number;
  totalRows: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  printingClosingId?: number | null;
  onPrint?: (closingId: number) => void;
}

function formatCurrency(value: unknown): string {
  const amount = typeof value === "number" ? value : Number(value ?? 0);
  return numeral(amount).format("$0,0.00");
}

export function CashRegisterClosingsTable({
  rows,
  loading = false,
  page,
  rowsPerPage,
  totalRows,
  onPageChange,
  onRowsPerPageChange,
  printingClosingId = null,
  onPrint,
}: CashRegisterClosingsTableProps) {
  const columns: Column<AssignedCashRegisterClosingItem>[] = [
    {
      id: "created_at",
      label: "Fecha",
      size: "md",
      format: (value) => formatDate(value, "datetimeShort12h"),
    },
    {
      id: "created_by_name",
      label: "Cajero",
      size: "md",
      format: (value) => (value ? String(value) : "—"),
    },
    {
      id: "initial_fund",
      label: "Fondo inicial",
      size: "sm",
      type: "currency",
      align: "right",
    },
    {
      id: "cash",
      label: "Efectivo",
      size: "sm",
      type: "currency",
      align: "right",
    },
    {
      id: "credit_card",
      label: "Tarjeta",
      size: "sm",
      type: "currency",
      align: "right",
    },
    {
      id: "cash_deposits",
      label: "Depósitos en efectivo",
      size: "md",
      type: "currency",
      align: "right",
    },
    {
      id: "withdrawals_total",
      label: "Total de retiros",
      size: "sm",
      align: "right",
      format: (value) => {
        const amount = typeof value === "number" ? value : Number(value ?? 0);
        if (amount === 0) return formatCurrency(0);
        return `-${formatCurrency(amount)}`;
      },
    },
    {
      id: "shortage_or_surplus",
      label: "Faltante / Sobrante",
      size: "md",
      align: "right",
      format: (value) => {
        const amount = typeof value === "number" ? value : Number(value ?? 0);
        const formatted = formatCurrency(Math.abs(amount));
        if (amount > 0) {
          return (
            <Typography component="span" variant="body2" color="success.main">
              +{formatted}
            </Typography>
          );
        }
        if (amount < 0) {
          return (
            <Typography component="span" variant="body2" color="error.main">
              -{formatted}
            </Typography>
          );
        }
        return formatted;
      },
    },
  ];

  const actions: RowAction<AssignedCashRegisterClosingItem>[] = onPrint
    ? [
        {
          id: "print",
          label: (row) =>
            printingClosingId === row.id ? "Imprimiendo..." : "Imprimir ticket",
          icon: <Printer size={16} />,
          onClick: (row) => onPrint(row.id),
          hidden: (row) => !row.can_print_ticket,
          disabled: () => printingClosingId != null,
        },
      ]
    : [];

  return (
    <TableCrud<AssignedCashRegisterClosingItem>
      columns={columns}
      rows={rows}
      actions={actions}
      loading={loading}
      rowKey="id"
      page={page}
      rowsPerPage={rowsPerPage}
      totalRows={totalRows}
      onPageChange={onPageChange}
      onRowsPerPageChange={onRowsPerPageChange}
      emptyMessage="No hay cortes finales registrados"
      minTableWidth={1100}
    />
  );
}
