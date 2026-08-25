import { useMemo, useRef, useState } from "react";
import { Alert, Button, Stack } from "@mui/material";
import { Plus } from "lucide-react";
import { TableCrud } from "@/components";
import type { Column, RowAction, StatusChipVariant } from "@/components/TableCrud";
import { useSupplierPayments } from "@/hooks/proveedores/useSupplierPayments";
import { usePermissions } from "@/hooks/usePermissions";
import { CATALOG_SUPPLIERS_UPDATE } from "@/lib/permissions";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import type {
  SupplierAccountStatementRow,
  SupplierPaymentRow,
} from "@/types/supplierDashboard.types";
import { TabActionsRow } from "@/styles/catalogos/proveedores-charges.styles";
import { SupplierPaymentModal } from "./SupplierPaymentModal";
import dayjs from "@/lib/dayjs";

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  paid: "Pagado",
};

const PAYMENT_STATUS_VARIANTS: Record<string, StatusChipVariant> = {
  pending: "pending",
  paid: "success",
};

function formatPeriodLabel(month: unknown, year: unknown): string {
  if (month == null || year == null) return "—";
  return dayjs(`${year}-${String(month).padStart(2, "0")}-01`).format("MMMM YYYY");
}

function formatAccountStatementLabel(month: number, year: number, isNext: boolean): string {
  const formatted = dayjs(`${year}-${String(month).padStart(2, "0")}-01`).format("MMMM YYYY");
  return isNext ? `${formatted} (Siguiente)` : formatted;
}

const paymentColumns: Column<SupplierPaymentRow>[] = [
  {
    id: "description",
    label: "Descripción",
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
  supplierName: string;
  accountStatements: SupplierAccountStatementRow[];
  contentLoading?: boolean;
  onBalanceChanged?: () => void;
}

export function SupplierPaymentsTab({
  supplierId,
  supplierName,
  accountStatements,
  contentLoading = false,
  onBalanceChanged,
}: SupplierPaymentsTabProps) {
  const { hasPermission } = usePermissions();
  const canManagePayments = hasPermission(CATALOG_SUPPLIERS_UPDATE);
  const showError = useSnackbarStore((s) => s.showError);

  const {
    payments,
    loading,
    saving,
    fetchError,
    modalMode,
    editingPayment,
    openScheduleModal,
    openRegisterModal,
    openEditModal,
    closeModal,
    handleSchedulePayment,
    handleRegisterPayment,
    handleEditPayment,
    handleExecutePayment,
    handleCancelPayment,
    handleUploadReceipt,
  } = useSupplierPayments(supplierId, onBalanceChanged);

  const tableLoading = contentLoading || loading;

  const accountStatementOptions = useMemo(
    () =>
      accountStatements.map((statement, index) => ({
        value: statement.id,
        label: formatAccountStatementLabel(statement.periodMonth, statement.periodYear, index === 0),
      })),
    [accountStatements]
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [receiptTargetId, setReceiptTargetId] = useState<number | null>(null);

  const handleUploadClick = (row: SupplierPaymentRow) => {
    setReceiptTargetId(row.id);
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || receiptTargetId == null) return;
    if (file.type !== "application/pdf" && !file.type.startsWith("image/")) {
      showError("El comprobante debe ser una imagen o un PDF.");
      return;
    }
    handleUploadReceipt(receiptTargetId, file);
  };

  const rowActions: RowAction<SupplierPaymentRow>[] = [
    {
      id: "execute",
      label: "Ejecutar",
      onClick: (row) => handleExecutePayment(row.id),
      hidden: (row) => row.status !== "pending",
      permission: CATALOG_SUPPLIERS_UPDATE,
      disabled: () => saving,
    },
    {
      id: "edit",
      label: "Editar",
      onClick: (row) => openEditModal(row),
      hidden: (row) => row.status !== "pending",
      permission: CATALOG_SUPPLIERS_UPDATE,
      disabled: () => saving,
    },
    {
      id: "cancel",
      label: "Cancelar",
      color: "error",
      onClick: (row) => handleCancelPayment(row.id),
      hidden: (row) => row.status !== "pending",
      permission: CATALOG_SUPPLIERS_UPDATE,
      disabled: () => saving,
    },
    {
      id: "upload-receipt",
      label: "Subir comprobante",
      onClick: handleUploadClick,
      permission: CATALOG_SUPPLIERS_UPDATE,
      disabled: () => saving,
    },
  ];

  return (
    <Stack spacing={2}>
      {canManagePayments && (
        <TabActionsRow>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Plus size={16} />}
            onClick={openScheduleModal}
            disabled={tableLoading}
          >
            Programar pago
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Plus size={16} />}
            onClick={openRegisterModal}
            disabled={tableLoading}
          >
            Registrar pago
          </Button>
        </TabActionsRow>
      )}

      {fetchError && <Alert severity="error">{fetchError}</Alert>}

      <TableCrud
        columns={paymentColumns}
        rows={payments}
        rowKey="id"
        actions={rowActions}
        loading={tableLoading}
        emptyMessage="No hay pagos registrados para este proveedor"
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {modalMode && (
        <SupplierPaymentModal
          open={Boolean(modalMode)}
          mode={modalMode}
          onClose={closeModal}
          supplierName={supplierName}
          accountStatementOptions={accountStatementOptions}
          saving={saving}
          editingPayment={editingPayment}
          onSubmitSchedule={handleSchedulePayment}
          onSubmitRegister={handleRegisterPayment}
          onSubmitEdit={handleEditPayment}
        />
      )}
    </Stack>
  );
}
