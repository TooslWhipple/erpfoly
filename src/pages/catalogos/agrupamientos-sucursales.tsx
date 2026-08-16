import { useEffect, useMemo, useState } from "react";
import {
  Stack,
  TextField,
  Grid,
  Paper,
  Box,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
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
  createBranchGrouping,
  getBranchGroupings,
  updateBranchGrouping,
  getAvailableBranches,
} from "@/services/branch-groupings.service";
import type {
  BranchGroupingListItem,
  BranchGroupingAvailableBranch,
  BranchGroupingStatus,
} from "@/types/branch-groupings.types";
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

type GroupingStatusTab = "all" | "active" | "inactive";

const STATUS_TABS: { value: GroupingStatusTab; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Activos" },
  { value: "inactive", label: "Inactivos" },
];

type GroupingFormShape = {
  name: string;
};

const groupingFormFieldsBase = defineFormFields<GroupingFormShape>()([
  {
    name: "name",
    schema: schemas
      .requiredString(2, "El nombre es requerido")
      .max(64, messages.string.max(64)),
    label: "Nombre",
    type: "text",
    placeholder: "Ej. Agrupamiento Sucursales Centro",
  },
] as const);

type GroupingFormOutput = SchemaOutputFromFields<typeof groupingFormFieldsBase>;

function buildDefaultValues(
  editing: BranchGroupingListItem | null,
): SchemaInputFromFields<typeof groupingFormFieldsBase> {
  if (editing) {
    return {
      name: editing.name,
    };
  }
  return {
    name: "",
  };
}

export default function AgrupamientosSucursalesPage() {
  const showSuccess = useSnackbarStore((s) => s.showSuccess);
  const showError = useSnackbarStore((s) => s.showError);

  const [activeTab, setActiveTab] = useState<GroupingStatusTab>("all");
  const [availableBranches, setAvailableBranches] = useState<BranchGroupingAvailableBranch[]>([]);
  const [selectedBranches, setSelectedBranches] = useState<BranchGroupingAvailableBranch[]>([]);

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
  } = usePaginatedList<BranchGroupingListItem>({
    queryKey: ["branch-groupings"],
    queryFn: getBranchGroupings,
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
    { open: false } | { open: true; group?: BranchGroupingListItem }
  >({ open: false });
  const [saving, setSaving] = useState(false);

  const [confirmState, setConfirmState] = useState<
    | { open: false }
    | {
        open: true;
        group: BranchGroupingListItem;
        target: "ACTIVE" | "INACTIVE";
      }
  >({ open: false });
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Cargar sucursales vinculables cuando se abre el modal
  useEffect(() => {
    if (modalState.open) {
      const editing = (modalState as any).group;
      if (editing) {
        setSelectedBranches(editing.branches || []);
        getAvailableBranches(editing.id)
          .then(setAvailableBranches)
          .catch((e) => showError(e.message || "Error al cargar sucursales disponibles."));
      } else {
        setSelectedBranches([]);
        getAvailableBranches()
          .then(setAvailableBranches)
          .catch((e) => showError(e.message || "Error al cargar sucursales disponibles."));
      }
    }
  }, [modalState.open, modalState, showError]);

  const handleOpenCreateModal = () => {
    setModalState({ open: true });
  };

  const handleOpenEditModal = (group: BranchGroupingListItem) => {
    setModalState({ open: true, group });
  };

  const handleCloseModal = () => {
    if (saving) return;
    setModalState({ open: false });
  };

  const handleSave = async (value: GroupingFormOutput) => {
    setSaving(true);
    const payload = {
      name: value.name.trim(),
      branchIds: selectedBranches.map((b) => b.id),
    };

    const editing = modalState.open ? (modalState as any).group : undefined;
    const result = editing
      ? await updateBranchGrouping(editing.id, payload)
      : await createBranchGrouping(payload);

    setSaving(false);

    if (result.error) {
      showError(result.error.message);
      return;
    }

    setModalState({ open: false });
    showSuccess(
      editing
        ? "Agrupamiento actualizado correctamente"
        : "Agrupamiento creado correctamente",
    );
    refetch();
  };

  const openConfirm = (group: BranchGroupingListItem) => {
    const isActive = group.status === "ACTIVE";
    setConfirmState({
      open: true,
      group,
      target: isActive ? "INACTIVE" : "ACTIVE",
    });
  };

  const closeConfirm = () => {
    if (confirmLoading) return;
    setConfirmState({ open: false });
  };

  const handleConfirmAction = async () => {
    if (!confirmState.open) return;
    const { group, target } = confirmState;
    setConfirmLoading(true);
    const result = await updateBranchGrouping(group.id, { status: target });
    setConfirmLoading(false);
    if (result.error) {
      showError(result.error.message);
      return;
    }
    setConfirmState({ open: false });
    showSuccess(
      target === "ACTIVE"
        ? "Agrupamiento activado correctamente"
        : "Agrupamiento desactivado correctamente",
    );
    refetch();
  };

  const handleAddBranch = (branch: BranchGroupingAvailableBranch) => {
    setSelectedBranches((prev) => [...prev, branch]);
  };

  const handleRemoveBranch = (branch: BranchGroupingAvailableBranch) => {
    setSelectedBranches((prev) => prev.filter((b) => b.id !== branch.id));
  };

  const unselectedBranches = useMemo(() => {
    const selectedIds = new Set(selectedBranches.map((b) => b.id));
    return availableBranches.filter((b) => !selectedIds.has(b.id));
  }, [availableBranches, selectedBranches]);

  const columns: Column<BranchGroupingListItem>[] = [
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
      id: "branches",
      label: "Sucursales vinculadas",
      size: "lg",
      format: (_, row) => row.branches?.map((b) => b.name).join(", ") || "Ninguna",
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

  const actions: RowAction<BranchGroupingListItem>[] = [
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

  const editingGroup = modalState.open ? (modalState as any).group : undefined;

  return (
    <>
      <Stack direction="column" spacing={3} sx={{ p: 3 }}>
        <Title title="Agrupamiento sucursales" />

        <TabFilters
          tabs={STATUS_TABS}
          activeTab={activeTab}
          onTabChange={(value) => setActiveTab(value as GroupingStatusTab)}
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

        <TableCrud<BranchGroupingListItem>
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
              ? "No hay agrupamientos inactivos"
              : activeTab === "active"
                ? "No hay agrupamientos activos"
                : "No hay agrupamientos registrados"
          }
        />
      </Stack>

      <ModalFormZod
        key={
          modalState.open
            ? editingGroup
              ? `edit-${editingGroup.id}`
              : "new"
            : "closed"
        }
        open={modalState.open}
        onClose={handleCloseModal}
        title={editingGroup ? "Editar agrupamiento" : "Nuevo agrupamiento"}
        fields={groupingFormFieldsBase}
        defaultValues={buildDefaultValues(editingGroup ?? null)}
        onSubmit={handleSave}
        loading={saving}
        confirmLabel={editingGroup ? "Guardar" : "Crear"}
        maxWidth="md"
        fullWidth
        validateOn="submit"
        allowInvalidSubmit
        customFieldLayout
      >
        {({ form }) => (
          <Stack spacing={3} sx={{ pt: 1 }}>
            <FormField
              form={form}
              name="name"
              label="Nombre"
              type="text"
              placeholder="Ej. Agrupamiento Sucursales Centro"
            />
            
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Vinculación de sucursales
              </Typography>

              <Grid container spacing={2}>
                {/* Columna Izquierda: Disponibles */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      height: 600,
                      display: "flex",
                      flexDirection: "column",
                      bgcolor: "action.hover",
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: "text.secondary" }}>
                      Disponibles ({unselectedBranches.length})
                    </Typography>
                    <Divider sx={{ mb: 1 }} />
                    <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
                      <List>
                        {unselectedBranches.map((branch) => (
                          <ListItem
                            key={branch.id}
                            secondaryAction={
                              <IconButton edge="end" color="primary" onClick={() => handleAddBranch(branch)}>
                                <AddIcon fontSize="small" />
                              </IconButton>
                            }
                            disablePadding
                          >
                            <ListItemButton onClick={() => handleAddBranch(branch)} sx={{ pr: 6, py: 1.25 }}>
                              <ListItemText
                                primary={branch.name}
                                primaryTypographyProps={{
                                  variant: "body2",
                                  sx: { wordBreak: "break-word", lineHeight: 1.3 }
                                }}
                              />
                            </ListItemButton>
                          </ListItem>
                        ))}
                        {unselectedBranches.length === 0 && (
                          <Box sx={{ p: 2, textAlign: "center" }}>
                            <Typography variant="caption" color="text.secondary">
                              No hay sucursales disponibles
                            </Typography>
                          </Box>
                        )}
                      </List>
                    </Box>
                  </Paper>
                </Grid>

                {/* Columna Derecha: Vinculadas */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      height: 600,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: "primary.main" }}>
                      Vinculadas ({selectedBranches.length})
                    </Typography>
                    <Divider sx={{ mb: 1 }} />
                    <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
                      <List>
                        {selectedBranches.map((branch) => (
                          <ListItem
                            key={branch.id}
                            secondaryAction={
                              <IconButton edge="end" color="error" onClick={() => handleRemoveBranch(branch)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            }
                            disablePadding
                          >
                            <ListItemButton onClick={() => handleRemoveBranch(branch)} sx={{ pr: 6, py: 1.25 }}>
                              <ListItemText
                                primary={branch.name}
                                primaryTypographyProps={{
                                  variant: "body2",
                                  sx: { wordBreak: "break-word", lineHeight: 1.3 }
                                }}
                              />
                            </ListItemButton>
                          </ListItem>
                        ))}
                        {selectedBranches.length === 0 && (
                          <Box sx={{ p: 2, textAlign: "center" }}>
                            <Typography variant="caption" color="text.secondary">
                              Ninguna sucursal vinculada
                            </Typography>
                          </Box>
                        )}
                      </List>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          </Stack>
        )}
      </ModalFormZod>

      <ConfirmModal
        open={confirmState.open}
        onClose={closeConfirm}
        onConfirm={handleConfirmAction}
        title={
          confirmState.open && confirmState.target === "ACTIVE"
            ? "Activar agrupamiento"
            : "Desactivar agrupamiento"
        }
        description={
          confirmState.open ? (
            <>
              ¿Estás seguro de{" "}
              {confirmState.target === "ACTIVE" ? "activar" : "desactivar"} el agrupamiento{" "}
              <strong>{confirmState.group.name}</strong>?
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
