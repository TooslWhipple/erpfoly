import { useEffect, useMemo, useState } from "react";
import { Stack, Typography } from "@mui/material";
import { z } from "zod";
import {
  Title,
  TabFilters,
  TableCrud,
  ConfirmModal,
  ModalFormZod,
  RadioButton,
  RadioButtonGroup,
} from "@/components";
import type { TabOption } from "@/components/TabFilters";
import type { Column, RowAction, StatusChipVariant } from "@/components/TableCrud";
import { FormField, defineFormFields, messages } from "@/forms";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { useDebouncedInput } from "@/hooks/useDebouncedValue";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import {
  createInternalPayableCategory,
  getInternalPayableCategories,
  updateInternalPayableCategory,
} from "@/services/internal-payable-categories.service";
import type {
  InternalPayableCategoryConfiguration,
  InternalPayableCategoryListItem,
} from "@/types/internal-payable-categories.types";
import {
  INTERNAL_PAYABLE_CATEGORY_CONFIG_LABELS,
  INTERNAL_PAYABLE_CATEGORY_CONFIG_OPTIONS,
} from "@/types/internal-payable-categories.types";
import {
  INTERNAL_PAYABLE_CATEGORIES_CREATE,
  INTERNAL_PAYABLE_CATEGORIES_UPDATE,
} from "@/lib/permissions";

const SEARCH_DEBOUNCE_MS = 300;

type CategoryStatusTab = "all" | "ACTIVE" | "INACTIVE";

const STATUS_TABS: TabOption[] = [
  { label: "Todas", value: "all" },
  { label: "Activas", value: "ACTIVE" },
  { label: "Inactivas", value: "INACTIVE" },
];

const ESTATUS_CHIP_LABELS: Record<string, string> = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
};

const ESTATUS_CHIP_VARIANTS: Record<string, StatusChipVariant> = {
  ACTIVE: "success",
  INACTIVE: "error",
};

type CategoryFormValues = {
  name: string;
  description: string;
  configuration: InternalPayableCategoryConfiguration;
};

const categoryFormFields = defineFormFields<CategoryFormValues>()([
  {
    name: "name",
    schema: z
      .string()
      .min(2, "El nombre es requerido")
      .max(128, messages.string.max(128)),
    label: "Nombre",
    type: "text",
    placeholder: "Ej. Viáticos y transporte",
  },
  {
    name: "description",
    schema: z.string().max(256, messages.string.max(256)).optional().default(""),
    label: "Descripción",
    type: "text",
    placeholder: "Descripción opcional",
  },
  {
    name: "configuration",
    schema: z.enum([
      "PROVEEDORES",
      "VIATICOS",
      "CARGOS_DEUDORES_DIVERSOS",
      "SOLICITUD_GASTOS",
      "CAJA_CHICA_REVOLVENTE",
    ]),
    label: "Configuración",
    when: () => false,
  },
] as const);

export default function CategoriasGastosPage() {
  const showSuccess = useSnackbarStore((s) => s.showSuccess);
  const showError = useSnackbarStore((s) => s.showError);

  const [activeTab, setActiveTab] = useState<CategoryStatusTab>("all");

  const listExtraParams = useMemo(() => {
    if (activeTab === "ACTIVE") return { status: "ACTIVE" as const };
    if (activeTab === "INACTIVE") return { status: "INACTIVE" as const };
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
  } = usePaginatedList<InternalPayableCategoryListItem>({
    queryKey: ["internal-payable-categories", activeTab],
    queryFn: getInternalPayableCategories,
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
    { open: false } | { open: true; category?: InternalPayableCategoryListItem }
  >({ open: false });
  const [saving, setSaving] = useState(false);

  const [confirmState, setConfirmState] = useState<
    | { open: false }
    | {
      open: true;
      category: InternalPayableCategoryListItem;
      target: "ACTIVE" | "INACTIVE";
    }
  >({ open: false });
  const [confirmLoading, setConfirmLoading] = useState(false);

  const handleOpenCreateModal = () => {
    setModalState({ open: true });
  };

  const handleOpenEditModal = (category: InternalPayableCategoryListItem) => {
    setModalState({ open: true, category });
  };

  const handleCloseModal = () => {
    if (saving) return;
    setModalState({ open: false });
  };

  const defaultValues = useMemo<CategoryFormValues>(() => {
    if (modalState.open && modalState.category) {
      return {
        name: modalState.category.name,
        description: modalState.category.description ?? "",
        configuration: modalState.category.configuration ?? "PROVEEDORES",
      };
    }
    return {
      name: "",
      description: "",
      configuration: "PROVEEDORES",
    };
  }, [modalState]);

  const handleSave = async (value: CategoryFormValues) => {
    setSaving(true);
    const editing = modalState.open ? modalState.category : undefined;
    const payload = {
      name: value.name.trim(),
      description: value.description.trim() || undefined,
      configuration: value.configuration,
    };

    const result = editing
      ? await updateInternalPayableCategory(editing.id, payload)
      : await createInternalPayableCategory(payload);

    setSaving(false);

    if (result.error) {
      showError(result.error.message);
      return;
    }

    setModalState({ open: false });
    showSuccess(
      editing
        ? "Categoría actualizada correctamente"
        : "Categoría creada correctamente",
    );
    refetch();
  };

  const openConfirm = (category: InternalPayableCategoryListItem) => {
    const isActive = category.status === "ACTIVE";
    setConfirmState({
      open: true,
      category,
      target: isActive ? "INACTIVE" : "ACTIVE",
    });
  };

  const closeConfirm = () => {
    if (confirmLoading) return;
    setConfirmState({ open: false });
  };

  const handleConfirmAction = async () => {
    if (!confirmState.open) return;
    const { category, target } = confirmState;
    setConfirmLoading(true);
    const result = await updateInternalPayableCategory(category.id, {
      status: target,
    });
    setConfirmLoading(false);

    if (result.error) {
      showError(result.error.message);
      return;
    }

    setConfirmState({ open: false });
    showSuccess(
      target === "INACTIVE"
        ? "Categoría desactivada correctamente"
        : "Categoría activada correctamente",
    );
    refetch();
  };

  const columns: Column<InternalPayableCategoryListItem>[] = [
    {
      id: "code",
      label: "Código",
      width: 140,
    },
    {
      id: "name",
      label: "Nombre",
      width: 260,
    },
    {
      id: "configuration",
      label: "Configuración",
      width: 240,
      format: (val) =>
        INTERNAL_PAYABLE_CATEGORY_CONFIG_LABELS[
        val as InternalPayableCategoryConfiguration
        ] ?? val,
    },
    {
      id: "description",
      label: "Descripción",
      format: (val) => (val ? String(val) : "—"),
    },
    {
      id: "status",
      label: "Estatus",
      width: 120,
      size: "sm",
      type: "chip",
      chipLabelMap: ESTATUS_CHIP_LABELS,
      chipVariantMap: ESTATUS_CHIP_VARIANTS,
    },
  ];

  const actions: RowAction<InternalPayableCategoryListItem>[] = [
    {
      id: "edit",
      label: "Editar",
      onClick: handleOpenEditModal,
      permission: INTERNAL_PAYABLE_CATEGORIES_UPDATE,
    },
    {
      id: "toggle-status",
      label: (row) => (row.status === "ACTIVE" ? "Desactivar" : "Activar"),
      onClick: openConfirm,
      color: (row) => (row.status === "ACTIVE" ? "error" : "primary"),
      permission: INTERNAL_PAYABLE_CATEGORIES_UPDATE,
    },
  ];

  const editingCategory = modalState.open ? modalState.category : undefined;

  return (
    <>
      <Stack direction="column" spacing={3}>
        <Title title="Categorías de gastos" />
        <TabFilters
          tabs={STATUS_TABS}
          activeTab={activeTab}
          onTabChange={(value) => setActiveTab(value as CategoryStatusTab)}
          showSearch
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          actions={[
            {
              label: "Nueva categoría",
              onClick: handleOpenCreateModal,
              variant: "contained",
              permission: INTERNAL_PAYABLE_CATEGORIES_CREATE,
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
            activeTab === "INACTIVE"
              ? "No hay categorías inactivas"
              : "No hay categorías registradas"
          }
        />
      </Stack>

      <ModalFormZod
        key={modalState.open ? "modal-open" : "modal-closed"}
        open={modalState.open}
        onClose={handleCloseModal}
        title={
          editingCategory
            ? "Editar categoría de gasto"
            : "Nueva categoría de gasto"
        }
        description="Configura el nombre y el tipo de aplicación para esta categoría de gastos."
        fields={categoryFormFields}
        defaultValues={defaultValues}
        onSubmit={handleSave}
        loading={saving}
        confirmLabel={editingCategory ? "Guardar cambios" : "Agregar"}
        maxWidth="sm"
        fullWidth
        validateOn="change"
        customFieldLayout
      >
        {({ form }) => (
          <Stack spacing={2.5} sx={{ pt: 1, width: "100%", minWidth: 0 }}>
            <FormField
              form={form}
              name="name"
              label="Nombre"
              type="text"
              placeholder="Ej. Viáticos y transporte"
              required
            />
            <FormField
              form={form}
              name="description"
              label="Descripción (opcional)"
              type="text"
              placeholder="Breve descripción"
            />
            <form.Field name="configuration">
              {(field) => (
                <Stack spacing={1}>
                  <Typography variant="body2" fontWeight={600}>
                    Configuración *
                  </Typography>
                  <RadioButtonGroup
                    sx={{ width: "100%", flexWrap: "wrap", gap: 1 }}
                  >
                    {INTERNAL_PAYABLE_CATEGORY_CONFIG_OPTIONS.map((opt) => (
                      <RadioButton
                        key={opt.value}
                        value={opt.value}
                        label={opt.label}
                        checked={field.state.value === opt.value}
                        onChange={() => field.handleChange(opt.value)}
                      />
                    ))}
                  </RadioButtonGroup>
                </Stack>
              )}
            </form.Field>
          </Stack>
        )}
      </ModalFormZod>

      <ConfirmModal
        open={confirmState.open}
        title={
          confirmState.open && confirmState.target === "INACTIVE"
            ? "¿Desactivar categoría?"
            : "¿Activar categoría?"
        }
        description={
          confirmState.open
            ? `¿Estás seguro de que deseas ${confirmState.target === "INACTIVE" ? "desactivar" : "activar"
            } la categoría "${confirmState.category.name}"?`
            : ""
        }
        confirmLabel={
          confirmState.open && confirmState.target === "INACTIVE"
            ? "Desactivar"
            : "Activar"
        }
        cancelLabel="Cancelar"
        onConfirm={handleConfirmAction}
        onClose={closeConfirm}
        loading={confirmLoading}
      />
    </>
  );
}