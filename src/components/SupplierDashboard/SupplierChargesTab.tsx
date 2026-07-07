import { useMemo } from "react";
import { Alert, Button, Stack } from "@mui/material";
import { Plus } from "lucide-react";
import { DataTable } from "@/components";
import type { DataTableColumn, StatusChipVariant } from "@/components/TableCrud";
import { useSupplierCharges } from "@/hooks/proveedores/useSupplierCharges";
import { CATALOG_SUPPLIERS_UPDATE } from "@/lib/permissions";
import { usePermissions } from "@/hooks/usePermissions";
import type {
  SupplierAccountStatementRow,
  SupplierChargeRow,
} from "@/types/supplierDashboard.types";
import { TabActionsRow } from "@/styles/catalogos/proveedores-charges.styles";
import { RegisterSupplierChargeModal } from "./RegisterSupplierChargeModal";
import type { RegisterSupplierChargeFormValues } from "./RegisterSupplierChargeModal";
import dayjs from "@/lib/dayjs";

const CHARGE_STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  paid: "Pagado",
};

const CHARGE_STATUS_VARIANTS: Record<string, StatusChipVariant> = {
  pending: "default",
  paid: "success",
};

const CHARGES_TABLE_SKELETON_ROWS = 3;

function truncateDescription(value: unknown): string {
  const text = String(value ?? "");
  if (text.length <= 42) return text;
  return `${text.slice(0, 42)}...`;
}

function formatPeriodLabel(month: unknown, year: unknown): string {
  if (month == null || year == null) return "—";
  return dayjs(`${year}-${String(month).padStart(2, "0")}-01`).format("MMMM YYYY");
}

const chargeColumns: DataTableColumn<SupplierChargeRow>[] = [
  {
    id: "description",
    label: "Descripción",
    format: (value) => truncateDescription(value),
  },
  { id: "category", label: "Categoría" },
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
    chipLabelMap: CHARGE_STATUS_LABELS,
    chipVariantMap: CHARGE_STATUS_VARIANTS,
  },
];

interface SupplierChargesTabProps {
  supplierId: number;
  supplierName: string;
  accountStatements: SupplierAccountStatementRow[];
  contentLoading?: boolean;
}

export function SupplierChargesTab({
  supplierId,
  supplierName,
  accountStatements,
  contentLoading = false,
}: SupplierChargesTabProps) {
  const { hasPermission } = usePermissions();
  const canCreateCharge = hasPermission(CATALOG_SUPPLIERS_UPDATE);

  const {
    charges,
    loading: chargesLoading,
    saving,
    modalOpen,
    fetchError,
    categories,
    accountStatementOptions,
    openRegisterModal,
    closeRegisterModal,
    handleRegisterCharge,
  } = useSupplierCharges(supplierId, accountStatements);

  const tableLoading = contentLoading || chargesLoading;

  const selectOptions = useMemo(
    () =>
      accountStatementOptions.map((option) => ({
        value: option.value,
        label: option.label,
      })),
    [accountStatementOptions]
  );

  const handleSubmit = async (values: RegisterSupplierChargeFormValues) => {
    const amount = Number.parseFloat(values.amount.replace(/[^0-9.]/g, ""));
    return handleRegisterCharge({
      accountStatementId: values.accountStatementId,
      categoryId: values.categoryId,
      description: values.description,
      amount,
      includesVat: values.includesVat,
    });
  };

  return (
    <>
      <Stack spacing={2}>
        {canCreateCharge && (
          <TabActionsRow>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Plus size={16} />}
              onClick={openRegisterModal}
              disabled={tableLoading}
            >
              Nuevo
            </Button>
          </TabActionsRow>
        )}

        {fetchError && <Alert severity="error">{fetchError}</Alert>}

        <DataTable
          columns={chargeColumns}
          rows={charges}
          rowKey="id"
          loading={tableLoading}
          loadingRowCount={CHARGES_TABLE_SKELETON_ROWS}
          emptyMessage="No hay cargos registrados para este proveedor"
        />
      </Stack>

      <RegisterSupplierChargeModal
        open={modalOpen}
        onClose={closeRegisterModal}
        supplierName={supplierName}
        accountStatementOptions={selectOptions}
        categories={categories}
        saving={saving}
        onSubmit={handleSubmit}
      />
    </>
  );
}
