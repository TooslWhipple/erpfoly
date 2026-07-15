import { useEffect, useMemo, useState } from "react";
import { InputAdornment, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import {
  Title,
  TableCrud,
  TabFilters,
  ConfirmModal,
  ModalFormZod,
  FormAutocomplete,
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
import { filters } from "@/forms/validation/filters";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { useDebouncedInput } from "@/hooks/useDebouncedValue";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { getBranchesCatalog } from "@/services/branches.service";
import {
  createCashRegister,
  getCashRegisters,
  updateCashRegister,
} from "@/services/cash-registers-catalog.service";
import type { CashRegisterListItem } from "@/types/cash-registers.types";
import {
  CATALOG_CASH_REGISTERS_CREATE,
  CATALOG_CASH_REGISTERS_UPDATE,
} from "@/lib/permissions";

const SEARCH_DEBOUNCE_MS = 300;
const BRANCHES_STALE_TIME_MS = 5 * 60 * 1000;

const ESTATUS_CHIP_LABELS: Record<string, string> = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
};
const ESTATUS_CHIP_VARIANTS: Record<string, StatusChipVariant> = {
  ACTIVE: "success",
  INACTIVE: "error",
};

type CashRegisterStatusTab = "all" | "active" | "inactive";

const STATUS_TABS: { value: CashRegisterStatusTab; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Activas" },
  { value: "inactive", label: "Inactivas" },
];

type CashRegisterFormShape = {
  name: string;
  branchId: string;
  limit: string;
};

/** Prudent cap for cash-register limits (fits Decimal(14,2) with headroom). */
const LIMIT_MAX_INTEGER_DIGITS = 10;
const LIMIT_MAX_VALUE = 9_999_999_999.99;
const limitInputFilter = filters.decimal(2, LIMIT_MAX_INTEGER_DIGITS);

const cashRegisterFormFieldsBase = defineFormFields<CashRegisterFormShape>()([
  {
    name: "name",
    schema: schemas
      .requiredString(2, "El nombre es requerido")
      .max(64, messages.string.max(64)),
    label: "Nombre",
    type: "text",
    placeholder: "Ej. Caja principal",
  },
  {
    name: "branchId",
    schema: z.string().min(1, "La sucursal es requerida"),
    label: "Sucursal",
    type: "text",
    placeholder: "Buscar sucursal",
  },

  {
    name: "limit",
    schema: z
      .string()
      .min(1, "El límite es requerido")
      .refine(
        (s) => /^\d+(\.\d{1,2})?$/.test(s.trim()),
        "Debe ser un número válido",
      )
      .refine((s) => {
        const integerPart = s.trim().split(".")[0] ?? "";
        return integerPart.length <= LIMIT_MAX_INTEGER_DIGITS;
      }, `El límite no puede tener más de ${LIMIT_MAX_INTEGER_DIGITS} dígitos enteros`)
      .transform((s) => Number(s))
      .pipe(
        z
          .number()
          .gt(0, "El límite debe ser mayor a 0")
          .max(LIMIT_MAX_VALUE, `El límite no puede ser mayor a ${LIMIT_MAX_VALUE.toLocaleString("es-MX")}`),
      ),
    label: "Límite",
    type: "text",
    placeholder: "20000",
    filter: limitInputFilter,
    helperText: `Monto máximo de efectivo (hasta ${LIMIT_MAX_INTEGER_DIGITS} dígitos enteros)`,
    slotProps: {
      input: {
        startAdornment: <InputAdornment position="start">$</InputAdornment>,
      },
    },
  },
] as const);

type CashRegisterFormOutput = SchemaOutputFromFields<typeof cashRegisterFormFieldsBase>;

function buildDefaultValues(
  editing: CashRegisterListItem | null,
): SchemaInputFromFields<typeof cashRegisterFormFieldsBase> {
  if (editing) {
    return {
      name: editing.name,
      branchId: String(editing.branchId),
      limit: String(editing.limit),
    };
  }
  return {
    name: "",
    branchId: "",
    limit: "",
  };
}

function formatLimit(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(value);
}

export default function CajasCatalogPage() {
  const showSuccess = useSnackbarStore((s) => s.showSuccess);
  const showError = useSnackbarStore((s) => s.showError);

  const [activeTab, setActiveTab] = useState<CashRegisterStatusTab>("all");

  const listExtraParams = useMemo(() => {
    if (activeTab === "active") return { status: "ACTIVE" as const };
    if (activeTab === "inactive") return { status: "INACTIVE" as const };
    return {};
  }, [activeTab]);

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
  } = usePaginatedList<CashRegisterListItem>({
    queryKey: ["cash-registers"],
    queryFn: getCashRegisters,
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

  const branchesQuery = useQuery({
    queryKey: ["catalog", "branches", "cash-registers-form"],
    queryFn: () => getBranchesCatalog(),
    staleTime: BRANCHES_STALE_TIME_MS,
  });

  const branchOptions = useMemo(
    () =>
      (branchesQuery.data ?? []).map((branch) => ({
        value: String(branch.id),
        label: branch.name,
      })),
    [branchesQuery.data],
  );

  const [modalState, setModalState] = useState<
    { open: false } | { open: true; cashRegister?: CashRegisterListItem }
  >({ open: false });
  const [saving, setSaving] = useState(false);

  const [confirmState, setConfirmState] = useState<
    | { open: false }
    | {
        open: true;
        cashRegister: CashRegisterListItem;
        target: "ACTIVE" | "INACTIVE";
      }
  >({ open: false });
  const [confirmLoading, setConfirmLoading] = useState(false);

  const handleOpenCreateModal = () => {
    setModalState({ open: true });
  };

  const handleOpenEditModal = (cashRegister: CashRegisterListItem) => {
    setModalState({ open: true, cashRegister });
  };

  const handleCloseModal = () => {
    if (saving) return;
    setModalState({ open: false });
  };

  const handleSave = async (value: CashRegisterFormOutput) => {
    setSaving(true);
    const payload = {
      name: value.name.trim(),
      branch_id: Number(value.branchId),
      limit: value.limit,
    };

    const editing = modalState.open ? modalState.cashRegister : undefined;
    const result = editing
      ? await updateCashRegister(editing.id, payload)
      : await createCashRegister(payload);

    setSaving(false);

    if (result.error) {
      showError(result.error.message);
      return;
    }

    setModalState({ open: false });
    showSuccess(
      editing ? "Caja actualizada correctamente" : "Caja creada correctamente",
    );
    refetch();
  };

  const openConfirm = (cashRegister: CashRegisterListItem) => {
    const isActive = cashRegister.status === "ACTIVE";
    setConfirmState({
      open: true,
      cashRegister,
      target: isActive ? "INACTIVE" : "ACTIVE",
    });
  };

  const closeConfirm = () => {
    if (confirmLoading) return;
    setConfirmState({ open: false });
  };

  const handleConfirmAction = async () => {
    if (!confirmState.open) return;
    const { cashRegister, target } = confirmState;
    setConfirmLoading(true);
    const result = await updateCashRegister(cashRegister.id, { status: target });
    setConfirmLoading(false);
    if (result.error) {
      showError(result.error.message);
      return;
    }
    setConfirmState({ open: false });
    showSuccess(
      target === "ACTIVE"
        ? "Caja activada correctamente"
        : "Caja desactivada correctamente",
    );
    refetch();
  };

  const columns: Column<CashRegisterListItem>[] = [
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
      id: "branchName",
      label: "Sucursal",
      size: "md",
    },
    {
      id: "limit",
      label: "Límite",
      size: "sm",
      format: (value) => (
        <Typography variant="body2">{formatLimit(Number(value))}</Typography>
      ),
    },
    {
      id: "assignedUserName",
      label: "Cajero",
      size: "md",
      format: (value) => (
        <Typography variant="body2" color={value ? "text.primary" : "text.secondary"}>
          {(value as string | null) ?? "Sin asignar"}
        </Typography>
      ),
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

  const actions: RowAction<CashRegisterListItem>[] = [
    {
      id: "edit",
      label: "Editar",
      onClick: handleOpenEditModal,
      permission: CATALOG_CASH_REGISTERS_UPDATE,
    },
    {
      id: "toggle-status",
      label: (row) => (row.status === "ACTIVE" ? "Desactivar" : "Activar"),
      onClick: openConfirm,
      color: (row) => (row.status === "ACTIVE" ? "error" : "primary"),
      permission: CATALOG_CASH_REGISTERS_UPDATE,
    },
  ];

  const editingCashRegister = modalState.open ? modalState.cashRegister : undefined;

  return (
    <>
      <Stack direction="column" spacing={3}>
        <Title title="Cajas" />
        <TabFilters
          tabs={STATUS_TABS}
          activeTab={activeTab}
          onTabChange={(value) => setActiveTab(value as CashRegisterStatusTab)}
          showSearch
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          actions={[
            {
              label: "Nuevo",
              onClick: handleOpenCreateModal,
              variant: "contained",
              permission: CATALOG_CASH_REGISTERS_CREATE,
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
              ? "No hay cajas inactivas"
              : activeTab === "active"
                ? "No hay cajas activas"
                : "No hay cajas registradas"
          }
        />
      </Stack>

      <ModalFormZod
        key={
          modalState.open
            ? editingCashRegister
              ? `edit-${editingCashRegister.id}`
              : "new"
            : "closed"
        }
        open={modalState.open}
        onClose={handleCloseModal}
        title={editingCashRegister ? "Editar caja" : "Nueva caja"}
        fields={cashRegisterFormFieldsBase}
        defaultValues={buildDefaultValues(editingCashRegister ?? null)}
        onSubmit={handleSave}
        loading={saving || branchesQuery.isPending}
        confirmLabel={editingCashRegister ? "Guardar" : "Crear"}
        maxWidth="sm"
        fullWidth
        validateOn="submit"
        allowInvalidSubmit
        customFieldLayout
      >
        {({ form }) => (
          <Stack spacing={2} sx={{ pt: 1 }}>
            <FormField form={form} name="name" label="Nombre" type="text" placeholder="Ej. Caja principal" />
            <form.Field name="branchId">
              {(field) => {
                const branchValue =
                  typeof field.state.value === "string" || typeof field.state.value === "number"
                    ? field.state.value
                    : "";
                const hasError = !field.state.meta.isValid;
                const errorMessage = Array.isArray(field.state.meta.errors)
                  ? (field.state.meta.errors as string[]).join(", ")
                  : field.state.meta.errors != null
                    ? String(field.state.meta.errors)
                    : undefined;
                return (
                  <FormAutocomplete
                    label="Sucursal"
                    placeholder="Buscar sucursal"
                    options={branchOptions}
                    value={branchValue}
                    onChange={(next) => field.handleChange(next)}
                    onBlur={field.handleBlur}
                    error={hasError}
                    helperText={hasError ? errorMessage : undefined}
                    disabled={saving || branchesQuery.isPending}
                    noOptionsText="Sin sucursales"
                  />
                );
              }}
            </form.Field>
            <FormField
              form={form}
              name="limit"
              label="Límite"
              type="text"
              placeholder="20000"
              filter={limitInputFilter}
              helperText={`Monto máximo de efectivo (hasta ${LIMIT_MAX_INTEGER_DIGITS} dígitos enteros)`}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                },
              }}
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
            ? "Activar caja"
            : "Desactivar caja"
        }
        description={
          confirmState.open ? (
            <>
              ¿Estás seguro de{" "}
              {confirmState.target === "ACTIVE" ? "activar" : "desactivar"} la caja{" "}
              <strong>{confirmState.cashRegister.name}</strong>?
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
