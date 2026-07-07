import { Alert, Link, Stack } from "@mui/material";
import { DataTable } from "@/components";
import type { DataTableColumn, StatusChipVariant } from "@/components/TableCrud";
import { useSupplierPayments } from "@/hooks/proveedores/useSupplierPayments";
import type { SupplierPaymentRow } from "@/types/supplierDashboard.types";
import dayjs from "@/lib/dayjs";

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  paid: "Pagado",
};

const PAYMENT_STATUS_VARIANTS: Record<string, StatusChipVariant> = {
  pending: "pending",
  paid: "success",
};

const PAYMENTS_TABLE_SKELETON_ROWS = 3;

function formatPeriodLabel(month: unknown, year: unknown): string {
  if (month == null || year == null) return "—";
  return dayjs(`${year}-${String(month).padStart(2, "0")}-01`).format("MMMM YYYY");
}

const paymentColumns: DataTableColumn<SupplierPaymentRow>[] = [
  {
    id: "description",
    label: "Descripción",
    format: (value) => (
      <Link
        component="button"
        variant="body2"
        underline="hover"
        sx={{ cursor: "pointer", fontWeight: 500 }}
        onClick={() => {}}
      >
        {String(value ?? "")}
      </Link>
    ),
  },
  {
    id: "periodMonth",
    label: "Cargado en",
    format: (_value, row) => formatPeriodLabel(row.periodMonth, row.periodYear),
  },
  { id: "amount", label: "Monto", type: "currency", align: "right" },
  {
    id: "status",
    label: "Estatus",
    type: "chip",
    align: "right",
    chipLabelMap: PAYMENT_STATUS_LABELS,
    chipVariantMap: PAYMENT_STATUS_VARIANTS,
  },
];

interface SupplierPaymentsTabProps {
  supplierId: number;
  contentLoading?: boolean;
}

export function SupplierPaymentsTab({
  supplierId,
  contentLoading = false,
}: SupplierPaymentsTabProps) {
  const { payments, loading, fetchError } = useSupplierPayments(supplierId);
  const tableLoading = contentLoading || loading;

  return (
    <Stack spacing={2}>
      {fetchError && <Alert severity="error">{fetchError}</Alert>}
      <DataTable
        columns={paymentColumns}
        rows={payments}
        rowKey="id"
        loading={tableLoading}
        loadingRowCount={PAYMENTS_TABLE_SKELETON_ROWS}
        emptyMessage="No hay pagos registrados para este proveedor"
      />
    </Stack>
  );
}
