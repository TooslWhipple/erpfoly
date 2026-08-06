import { useEffect, useMemo, useState } from "react";
import { Stack } from "@mui/material";
import {
  Title,
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
  createZone,
  getZones,
  updateZone,
} from "@/services/zones-catalog.service";
import type { ZoneListItem } from "@/types/zones.types";
import {
  CATALOG_ZONES_CREATE,
  CATALOG_ZONES_UPDATE,
} from "@/lib/permissions";

const SEARCH_DEBOUNCE_MS = 300;

const ESTATUS_CHIP_LABELS: Record<string, string> = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
};

const ESTATUS_CHIP_VARIANTS: Record<string, StatusChipVariant> = {
  ACTIVE: "success",
  INACTIVE: "error",
};

type ZoneStatusTab = "all" | "active" | "inactive";

const STATUS_TABS: { value: ZoneStatusTab; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Activas" },
  { value: "inactive", label: "Inactivas" },
];

type ZoneFormShape = {
  name: string;
};

const zoneFormFieldsBase = defineFormFields<ZoneFormShape>()([
  {
    name: "name",
    schema: schemas
      .requiredString(2, "El nombre es requerido")
      .max(64, messages.string.max(64)),
    label: "Nombre",
    type: "text",
    placeholder: "Ej. Zona Centro",
  },
] as const);

type ZoneFormOutput = SchemaOutputFromFields<typeof zoneFormFieldsBase>;

function buildDefaultValues(
  editing: ZoneListItem | null,
): SchemaInputFromFields<typeof zoneFormFieldsBase> {
  if (editing) {
    return {
      name: editing.name,
    };
  }
  return {
    name: "",
  };
}

export default function ZonasCatalogPage() {
  const showSuccess = useSnackbarStore((s) => s.showSuccess);
  const showError = useSnackbarStore((s) => s.showError);

  const [activeTab, setActiveTab] = useState<ZoneStatusTab>("all");

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
  } = usePaginatedList<ZoneListItem>({
    queryKey: ["zones"],
    queryFn: getZones,
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
    { open: false } | { open: true; zone?: ZoneListItem }
  >({ open: false });
  const [saving, setSaving] = useState(false);

  const [confirmState, setConfirmState] = useState<
    | { open: false }
    | {
        open: true;
        zone: ZoneListItem;
        target: "ACTIVE" | "INACTIVE";
      }
  >({ open: false });
  const [confirmLoading, setConfirmLoading] = useState(false);

  const handleOpenCreateModal = () => {
    setModalState({ open: true });
  };

  const handleOpenEditModal = (zone: ZoneListItem) => {
    setModalState({ open: true, zone });
  };

  const handleCloseModal = () => {
    if (saving) return;
    setModalState({ open: false });
  };

  const handleSave = async (value: ZoneFormOutput) => {
    setSaving(true);
    const payload = {
      name: value.name.trim(),
    };

    const editing = modalState.open ? modalState.zone : undefined;
    const result = editing
      ? await updateZone(editing.id, payload)
      : await createZone(payload);

    setSaving(false);

    if (result.error) {
      showError(result.error.message);
      return;
    }

    setModalState({ open: false });
    showSuccess(
      editing ? "Zona actualizada correctamente" : "Zona creada correctamente",
    );
    refetch();
  };

  const openConfirm = (zone: ZoneListItem) => {
    const isActive = zone.status === "ACTIVE";
    setConfirmState({
      open: true,
      zone,
      target: isActive ? "INACTIVE" : "ACTIVE",
    });
  };

  const closeConfirm = () => {
    if (confirmLoading) return;
    setConfirmState({ open: false });
  };

  const handleConfirmAction = async () => {
    if (!confirmState.open) return;
    const { zone, target } = confirmState;
    setConfirmLoading(true);
    const result = await updateZone(zone.id, { status: target });
    setConfirmLoading(false);
    if (result.error) {
      showError(result.error.message);
      return;
    }
    setConfirmState({ open: false });
    showSuccess(
      target === "ACTIVE"
        ? "Zona activada correctamente"
        : "Zona desactivada correctamente",
    );
    refetch();
  };

  const columns: Column<ZoneListItem>[] = [
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
      size: "lg",
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

  const actions: RowAction<ZoneListItem>[] = [
    {
      id: "edit",
      label: "Editar",
      onClick: handleOpenEditModal,
      permission: CATALOG_ZONES_UPDATE,
    },
    {
      id: "toggle-status",
      label: (row) => (row.status === "ACTIVE" ? "Desactivar" : "Activar"),
      onClick: openConfirm,
      color: (row) => (row.status === "ACTIVE" ? "error" : "primary"),
      permission: CATALOG_ZONES_UPDATE,
    },
  ];

  const editingZone = modalState.open ? modalState.zone : undefined;

  return (
    <>
      <Stack direction="column" spacing={3}>
        <Title title="Zonas" />
        <TabFilters
          tabs={STATUS_TABS}
          activeTab={activeTab}
          onTabChange={(value) => setActiveTab(value as ZoneStatusTab)}
          showSearch
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          actions={[
            {
              label: "Nuevo",
              onClick: handleOpenCreateModal,
              variant: "contained",
              permission: CATALOG_ZONES_CREATE,
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
              ? "No hay zonas inactivas"
              : activeTab === "active"
                ? "No hay zonas activas"
                : "No hay zonas registradas"
          }
        />
      </Stack>

      <ModalFormZod
        key={
          modalState.open
            ? editingZone
              ? `edit-${editingZone.id}`
              : "new"
            : "closed"
        }
        open={modalState.open}
        onClose={handleCloseModal}
        title={editingZone ? "Editar zona" : "Nueva zona"}
        fields={zoneFormFieldsBase}
        defaultValues={buildDefaultValues(editingZone ?? null)}
        onSubmit={handleSave}
        loading={saving}
        confirmLabel={editingZone ? "Guardar" : "Crear"}
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
              placeholder="Ej. Zona Centro"
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
            ? "Activar zona"
            : "Desactivar zona"
        }
        description={
          confirmState.open ? (
            <>
              ¿Estás seguro de{" "}
              {confirmState.target === "ACTIVE" ? "activar" : "desactivar"} la zona{" "}
              <strong>{confirmState.zone.name}</strong>?
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
