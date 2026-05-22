import { useMemo } from "react";
import { Alert, Button, Checkbox, Stack, Typography } from "@mui/material";
import { AlertTriangle } from "lucide-react";
import { theme } from "@/styles/theme";
import { DataTable } from "@/components";
import type { DataTableColumn, StatusChipVariant } from "@/components/TableCrud";
import { useSupplierDamagedGoods } from "@/hooks/proveedores/useSupplierDamagedGoods";
import { CATALOG_SUPPLIERS_UPDATE } from "@/lib/permissions";
import { usePermissions } from "@/hooks/usePermissions";
import type {
  SupplierAccountStatementRow,
  SupplierDamagedGoodsRow,
} from "@/types/supplierDashboard.types";
import { TabActionsRow, TabSelectionToolbar } from "@/styles/catalogos/proveedores-charges.styles";
import { RegisterSupplierChargeModal } from "./RegisterSupplierChargeModal";
import type { RegisterSupplierChargeFormValues } from "./RegisterSupplierChargeModal";

const DAMAGED_STATUS_LABELS: Record<string, string> = {
  scheduled: "Programado",
  pending: "Pendiente",
};

const DAMAGED_STATUS_VARIANTS: Record<string, StatusChipVariant> = {
  scheduled: "success",
  pending: "pending",
};

const DAMAGED_GOODS_SKELETON_ROWS = 4;

function truncateText(value: unknown, maxLength = 36): string {
  const text = String(value ?? "");
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

function renderElapsedLabel(_value: unknown, row: SupplierDamagedGoodsRow) {
  const showWarning = row.urgency === "high" || row.urgency === "medium";
  const iconColor =
    row.urgency === "high"
      ? theme.palette.error.main
      : theme.palette.warning.main;

  return (
    <Stack direction="row" spacing={0.75} alignItems="center" justifyContent="flex-end">
      {showWarning && <AlertTriangle size={14} color={iconColor} />}
      <Typography variant="body2">{row.elapsedLabel}</Typography>
    </Stack>
  );
}

interface SupplierDamagedGoodsTabProps {
  supplierId: number;
  supplierName: string;
  accountStatements: SupplierAccountStatementRow[];
  contentLoading?: boolean;
}

export function SupplierDamagedGoodsTab({
  supplierId,
  supplierName,
  accountStatements,
  contentLoading = false,
}: SupplierDamagedGoodsTabProps) {
  const { hasPermission } = usePermissions();
  const canRegisterExit = hasPermission(CATALOG_SUPPLIERS_UPDATE);

  const {
    items,
    loading,
    saving,
    fetchError,
    selectedIds,
    exitModalOpen,
    categories,
    accountStatementOptions,
    toggleSelection,
    toggleSelectAll,
    openExitModal,
    closeExitModal,
    handleRegisterExit,
  } = useSupplierDamagedGoods(supplierId, accountStatements);

  const tableLoading = contentLoading || loading;
  const allSelected = items.length > 0 && selectedIds.length === items.length;
  const someSelected = selectedIds.length > 0 && !allSelected;

  const selectOptions = useMemo(
    () =>
      accountStatementOptions.map((option) => ({
        value: option.value,
        label: option.label,
      })),
    [accountStatementOptions]
  );

  const columns: DataTableColumn<SupplierDamagedGoodsRow>[] = useMemo(
    () => [
      {
        id: "id",
        label: "",
        headerContent: (
          <Checkbox
            size="small"
            checked={allSelected}
            indeterminate={someSelected}
            onChange={toggleSelectAll}
            disabled={tableLoading || items.length === 0}
          />
        ),
        format: (_value, row) => (
          <Checkbox
            size="small"
            checked={selectedIds.includes(row.id)}
            onChange={() => toggleSelection(row.id)}
          />
        ),
      },
      { id: "sku", label: "SKU" },
      { id: "warehouse", label: "Almacén" },
      { id: "entryDate", label: "Ingreso" },
      {
        id: "articleName",
        label: "Artículo",
        format: (value) => truncateText(value),
      },
      {
        id: "damageDescription",
        label: "Daño",
        format: (value) => truncateText(value),
      },
      {
        id: "status",
        label: "Estatus",
        type: "chip",
        chipLabelMap: DAMAGED_STATUS_LABELS,
        chipVariantMap: DAMAGED_STATUS_VARIANTS,
      },
      {
        id: "elapsedLabel",
        label: "Tiempo",
        align: "right",
        format: renderElapsedLabel,
      },
    ],
    [
      allSelected,
      someSelected,
      items.length,
      selectedIds,
      tableLoading,
      toggleSelectAll,
      toggleSelection,
    ]
  );

  const handleSubmitExit = async (values: RegisterSupplierChargeFormValues) => {
    const amount = Number.parseFloat(values.amount.replace(/[^0-9.]/g, ""));
    return handleRegisterExit({
      accountStatementId: values.accountStatementId,
      description: values.description,
      amount,
      includesVat: values.includesVat,
    });
  };

  const selectionLabel =
    selectedIds.length === 1
      ? "1 artículo seleccionado"
      : `${selectedIds.length} artículos seleccionados`;

  return (
    <>
      <Stack spacing={2}>
        {selectedIds.length > 0 ? (
          <TabSelectionToolbar>
            <Typography variant="body2" color="text.secondary">
              {selectionLabel}
            </Typography>
            {canRegisterExit && (
              <Button variant="contained" size="small" onClick={openExitModal} disabled={tableLoading}>
                Registrar salida
              </Button>
            )}
          </TabSelectionToolbar>
        ) : (
          canRegisterExit && (
            <TabActionsRow>
              <Button
                variant="contained"
                size="small"
                onClick={openExitModal}
                disabled={tableLoading || items.length === 0}
              >
                Registrar salida
              </Button>
            </TabActionsRow>
          )
        )}

        {fetchError && <Alert severity="error">{fetchError}</Alert>}

        <DataTable
          columns={columns}
          rows={items}
          rowKey="id"
          loading={tableLoading}
          loadingRowCount={DAMAGED_GOODS_SKELETON_ROWS}
          emptyMessage="No hay mercancía dañada registrada para este proveedor"
        />
      </Stack>

      <RegisterSupplierChargeModal
        open={exitModalOpen}
        onClose={closeExitModal}
        supplierName={supplierName}
        accountStatementOptions={selectOptions}
        categories={categories}
        saving={saving}
        onSubmit={handleSubmitExit}
        title="Registrar salida de artículos"
        description="Completa la información para registrar el nuevo cargo."
        confirmLabel="Registrar"
        fixedCategoryId="damaged_goods"
        lockCategory
      />
    </>
  );
}
