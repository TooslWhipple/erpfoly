import { useEffect, useMemo, useState } from "react";
import { Stack } from "@mui/material";
import {
  TableCrud,
  TabFilters,
  ConfirmModal,
  ModalFormZod,
} from "@/components";
import type { Column, RowAction, StatusChipVariant } from "@/components/TableCrud";
import { FormField } from "@/forms";
import {
  defineFormFields,
  messages,
  schemas,
  type SchemaInputFromFields,
  type SchemaOutputFromFields,
} from "@/forms";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { useDebouncedInput } from "@/hooks/useDebouncedValue";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import {
  createPaymentTerminal,
  deactivatePaymentTerminal,
  getPaymentTerminals,
  updatePaymentTerminal,
} from "@/services/payment-terminals.service";
import type { PaymentTerminalListItem } from "@/types/payment-terminals.types";

const SEARCH_DEBOUNCE_MS = 300;

const ESTATUS_CHIP_LABELS: Record<string, string> = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
};
const ESTATUS_CHIP_VARIANTS: Record<string, StatusChipVariant> = {
  ACTIVE: "success",
  INACTIVE: "error",
};

type PaymentTerminalStatusTab = "all" | "active" | "inactive";

const STATUS_TABS: { value: PaymentTerminalStatusTab; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "active", label: "Activas" },
  { value: "inactive", label: "Inactivas" },
];

type PaymentTerminalFormShape = {
  name: string;
  bank: string;
  serialNumber: string;
};

const paymentTerminalFormFields = defineFormFields<PaymentTerminalFormShape>()([
  {
    name: "name",
    schema: schemas
      .requiredString(2, "El nombre es requerido")
      .max(64, messages.string.max(64)),
    label: "Nombre",
    type: "text",
    placeholder: "Ej. BBVA 1234",
  },
  {
    name: "bank",
    schema: schemas
      .requiredString(2, "El banco es requerido")
      .max(64, messages.string.max(64)),
    label: "Banco",
    type: "text",
    placeholder: "Ej. BBVA",
  },
  {
    name: "serialNumber",
    schema: schemas
      .requiredString(1, "El número de serie es requerido")
      .max(64, messages.string.max(64)),
    label: "Número de serie",
    type: "text",
    placeholder: "Ej. SN-00012345",
  },
] as const);

type PaymentTerminalFormOutput = SchemaOutputFromFields<typeof paymentTerminalFormFields>;

function buildDefaultValues(
  editing: PaymentTerminalListItem | null,
): SchemaInputFromFields<typeof paymentTerminalFormFields> {
  if (editing) {
    return {
      name: editing.name,
      bank: editing.bank,
      serialNumber: editing.serialNumber,
    };
  }
  return {
    name: "",
    bank: "",
    serialNumber: "",
  };
}

interface PaymentTerminalsTabProps {
  branchId: number;
}

export function PaymentTerminalsTab({ branchId }: PaymentTerminalsTabProps) {
  const showSuccess = useSnackbarStore((s) => s.showSuccess);
  const showError = useSnackbarStore((s) => s.showError);

  const [activeTab, setActiveTab] = useState<PaymentTerminalStatusTab>("all");

  const listExtraParams = useMemo(() => {
    const base = { branch_id: branchId };
    if (activeTab === "active") return { ...base, status: "ACTIVE" as const };
    if (activeTab === "inactive") return { ...base, status: "INACTIVE" as const };
    return base;
  }, [activeTab, branchId]);

  const {
    data: rows,
    total: totalRows,
    page,
    rowsPerPage,
    search: searchValue,
    setPage: handlePageChange,
    setRowsPerPage: handleRowsPerPageChange,
    setSearch,
    isLoading: loading,
    refetch,
  } = usePaginatedList<PaymentTerminalListItem>({
    queryKey: ["payment-terminals", String(branchId)],
    queryFn: getPaymentTerminals,
    initialPage: 0,
    initialRowsPerPage: 10,
    initialSearch: "",
    extraParams: listExtraParams,
  });

  const [searchInput, setSearchInput, debouncedSearch] = useDebouncedInput(
    searchValue,
    SEARCH_DEBOUNCE_MS,
  );

  useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);

  useEffect(() => {
    handlePageChange(0);
  }, [activeTab, handlePageChange]);

  const [modalState, setModalState] = useState<
    { open: false } | { open: true; terminal?: PaymentTerminalListItem }
  >({ open: false });
  const [saving, setSaving] = useState(false);

  const [confirmState, setConfirmState] = useState<
    | { open: false }
    | {
        open: true;
        terminal: PaymentTerminalListItem;
        target: "ACTIVE" | "INACTIVE";
      }
  >({ open: false });
  const [confirmLoading, setConfirmLoading] = useState(false);

  const handleOpenCreateModal = () => {
    setModalState({ open: true });
  };

  const handleOpenEditModal = (terminal: PaymentTerminalListItem) => {
    setModalState({ open: true, terminal });
  };

  const handleCloseModal = () => {
    if (saving) return;
    setModalState({ open: false });
  };

  const handleSave = async (value: PaymentTerminalFormOutput) => {
    setSaving(true);

    const editing = modalState.open ? modalState.terminal : undefined;
    const result = editing
      ? await updatePaymentTerminal(editing.id, {
          name: value.name.trim(),
          bank: value.bank.trim(),
          serial_number: value.serialNumber.trim(),
        })
      : await createPaymentTerminal({
          branch_id: branchId,
          name: value.name.trim(),
          bank: value.bank.trim(),
          serial_number: value.serialNumber.trim(),
        });

    setSaving(false);

    if (result.error) {
      showError(result.error.message);
      return;
    }

    setModalState({ open: false });
    showSuccess(
      editing
        ? "Terminal actualizada correctamente"
        : "Terminal creada correctamente",
    );
    refetch();
  };

  const openConfirm = (terminal: PaymentTerminalListItem) => {
    const isActive = terminal.status === "ACTIVE";
    setConfirmState({
      open: true,
      terminal,
      target: isActive ? "INACTIVE" : "ACTIVE",
    });
  };

  const closeConfirm = () => {
    if (confirmLoading) return;
    setConfirmState({ open: false });
  };

  const handleConfirmAction = async () => {
    if (!confirmState.open) return;
    const { terminal, target } = confirmState;
    setConfirmLoading(true);
    const result =
      target === "INACTIVE"
        ? await deactivatePaymentTerminal(terminal.id)
        : await updatePaymentTerminal(terminal.id, { status: target });
    setConfirmLoading(false);
    if (result.error) {
      showError(result.error.message);
      return;
    }
    setConfirmState({ open: false });
    showSuccess(
      target === "ACTIVE"
        ? "Terminal activada correctamente"
        : "Terminal desactivada correctamente",
    );
    refetch();
  };

  const columns: Column<PaymentTerminalListItem>[] = [
    {
      id: "id",
      label: "ID",
      type: "id",
      size: "xs",
      idPadding: 2,
    },
    {
      id: "name",
      label: "Nombre",
      size: "md",
    },
    {
      id: "bank",
      label: "Banco",
      size: "md",
    },
    {
      id: "serialNumber",
      label: "Número de serie",
      size: "md",
    },
    {
      id: "status",
      label: "Estatus",
      size: "sm",
      type: "chip",
      chipLabelMap: ESTATUS_CHIP_LABELS,
      chipVariantMap: ESTATUS_CHIP_VARIANTS,
    },
  ];

  const actions: RowAction<PaymentTerminalListItem>[] = [
    {
      id: "edit",
      label: "Editar",
      onClick: handleOpenEditModal,
    },
    {
      id: "toggle-status",
      label: (row) => (row.status === "ACTIVE" ? "Desactivar" : "Activar"),
      onClick: openConfirm,
      color: (row) => (row.status === "ACTIVE" ? "error" : "primary"),
    },
  ];

  const editingTerminal = modalState.open ? modalState.terminal : undefined;

  return (
    <>
      <Stack direction="column" spacing={3}>
        <TabFilters
          tabs={STATUS_TABS}
          activeTab={activeTab}
          onTabChange={(value) => setActiveTab(value as PaymentTerminalStatusTab)}
          showSearch
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          actions={[
            {
              label: "Nueva",
              onClick: handleOpenCreateModal,
              variant: "contained",
            },
          ]}
        />

        <TableCrud
          columns={columns}
          rows={rows}
          actions={actions}
          loading={loading}
          rowKey="id"
          page={page}
          rowsPerPage={rowsPerPage}
          totalRows={totalRows}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          emptyMessage={
            activeTab === "inactive"
              ? "No hay terminales inactivas"
              : activeTab === "active"
                ? "No hay terminales activas"
                : "No hay terminales registradas"
          }
        />
      </Stack>

      <ModalFormZod
        key={
          modalState.open
            ? editingTerminal
              ? `edit-${editingTerminal.id}`
              : "new"
            : "closed"
        }
        open={modalState.open}
        onClose={handleCloseModal}
        title={editingTerminal ? "Editar terminal" : "Nueva terminal"}
        fields={paymentTerminalFormFields}
        defaultValues={buildDefaultValues(editingTerminal ?? null)}
        onSubmit={handleSave}
        loading={saving}
        confirmLabel={editingTerminal ? "Guardar" : "Crear"}
        maxWidth="sm"
        fullWidth
        validateOn="submit"
        allowInvalidSubmit
        customFieldLayout
      >
        {({ form }) => (
          <Stack spacing={2} sx={{ pt: 1 }}>
            <FormField
              form={form}
              name="name"
              label="Nombre"
              type="text"
              placeholder="Ej. BBVA 1234"
            />
            <FormField
              form={form}
              name="bank"
              label="Banco"
              type="text"
              placeholder="Ej. BBVA"
            />
            <FormField
              form={form}
              name="serialNumber"
              label="Número de serie"
              type="text"
              placeholder="Ej. SN-00012345"
            />
          </Stack>
        )}
      </ModalFormZod>

      <ConfirmModal
        open={confirmState.open}
        onClose={closeConfirm}
        onConfirm={handleConfirmAction}
        title={
          confirmState.open && confirmState.target === "ACTIVE"
            ? "Activar terminal"
            : "Desactivar terminal"
        }
        description={
          confirmState.open ? (
            <>
              ¿Estás seguro de{" "}
              {confirmState.target === "ACTIVE" ? "activar" : "desactivar"} la
              terminal <strong>{confirmState.terminal.name}</strong>?
            </>
          ) : null
        }
        confirmLabel={
          confirmState.open && confirmState.target === "ACTIVE"
            ? "Activar"
            : "Desactivar"
        }
        confirmColor={
          confirmState.open && confirmState.target === "ACTIVE" ? "success" : "error"
        }
        loading={confirmLoading}
      />
    </>
  );
}
