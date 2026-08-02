import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { Title, TableCrud, TabFilters, ConfirmModal } from "@/components";
import type { Column, RowAction, StatusChipVariant } from "@/components/TableCrud";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import {
  getPolizasSistema,
  createPolizaSistema,
  updatePolizaSistema,
  deletePolizaSistema,
} from "@/services/polizas-sistema.service";
import type { PolizaSistema } from "@/types/contabilidad.types";
import {
  CATALOG_SYSTEM_POLICIES_CREATE,
  CATALOG_SYSTEM_POLICIES_DELETE,
  CATALOG_SYSTEM_POLICIES_READ,
  CATALOG_SYSTEM_POLICIES_UPDATE,
} from "@/lib/permissions";

type PolizaTipoTab = "all" | "diaria" | "egresos" | "ingresos";

const TIPO_TABS: { value: PolizaTipoTab; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "diaria", label: "Diarias" },
  { value: "egresos", label: "Egresos" },
  { value: "ingresos", label: "Ingresos" },
];

const TIPO_POLIZA_LABELS: Record<number, string> = {
  3: "Diaria",
  4: "Egresos",
  5: "Ingresos",
};

const TIPO_POLIZA_CHIP_VARIANTS: Record<number, StatusChipVariant> = {
  3: "info",
  4: "warning",
  5: "success",
};

export default function PolizasSistemaPage() {
  const showSuccess = useSnackbarStore((s) => s.showSuccess);
  const showError = useSnackbarStore((s) => s.showError);
  const showWarning = useSnackbarStore((s) => s.showWarning);

  const [items, setItems] = useState<PolizaSistema[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<PolizaTipoTab>("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Form Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PolizaSistema | null>(null);
  const [clave, setClave] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [idtipopoliza, setIdtipopoliza] = useState(3);
  const [periodicidad, setPeriodicidad] = useState("DIARIA");
  const [siguientediahabil, setSiguientediahabil] = useState(false);
  const [saving, setSaving] = useState(false);

  // Delete Modal State
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPolizasSistema();
      setItems(data || []);
    } catch (err: any) {
      showError(err?.message || "Error al cargar las pólizas del sistema");
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts = { all: items.length, diaria: 0, egresos: 0, ingresos: 0 };
    items.forEach((item) => {
      if (item.idtipopoliza === 3) counts.diaria++;
      else if (item.idtipopoliza === 4) counts.egresos++;
      else if (item.idtipopoliza === 5) counts.ingresos++;
    });
    return counts;
  }, [items]);

  // Filtered rows for TableCrud
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        !search.trim() ||
        item.clave.toLowerCase().includes(search.toLowerCase()) ||
        item.descripcion.toLowerCase().includes(search.toLowerCase());

      const matchesTab =
        activeTab === "all" ||
        (activeTab === "diaria" && item.idtipopoliza === 3) ||
        (activeTab === "egresos" && item.idtipopoliza === 4) ||
        (activeTab === "ingresos" && item.idtipopoliza === 5);

      return matchesSearch && matchesTab;
    });
  }, [items, search, activeTab]);

  const paginatedItems = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredItems.slice(start, start + rowsPerPage);
  }, [filteredItems, page, rowsPerPage]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as PolizaTipoTab);
    setPage(0);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(0);
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setClave("");
    setDescripcion("");
    setIdtipopoliza(3);
    setPeriodicidad("DIARIA");
    setSiguientediahabil(false);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: PolizaSistema) => {
    setEditingItem(item);
    setClave(item.clave);
    setDescripcion(item.descripcion);
    setIdtipopoliza(item.idtipopoliza);
    setPeriodicidad(item.periodicidad || "DIARIA");
    setSiguientediahabil(item.siguientediahabil || false);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clave.trim() || !descripcion.trim()) {
      showWarning("Clave y descripción son requeridos");
      return;
    }

    setSaving(true);
    try {
      if (editingItem) {
        await updatePolizaSistema(editingItem.id, {
          clave: clave.trim(),
          descripcion: descripcion.trim(),
          idtipopoliza,
          periodicidad,
          siguientediahabil,
        });
        showSuccess("Póliza del sistema actualizada exitosamente");
      } else {
        await createPolizaSistema({
          clave: clave.trim(),
          descripcion: descripcion.trim(),
          idtipopoliza,
          periodicidad,
          siguientediahabil,
        });
        showSuccess("Póliza del sistema creada exitosamente");
      }
      setModalOpen(false);
      void loadData();
    } catch (err: any) {
      showError(err?.message || "Error al guardar la póliza del sistema");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deletePolizaSistema(deleteId);
      showSuccess("Póliza eliminada exitosamente");
      setDeleteId(null);
      void loadData();
    } catch (err: any) {
      showError(err?.message || "Error al eliminar la póliza del sistema");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<PolizaSistema>[] = [
    {
      id: "clave",
      label: "Clave",
      type: "text",
      size: "sm",
    },
    {
      id: "descripcion",
      label: "Descripción",
      type: "text",
      size: "xl",
    },
    {
      id: "idtipopoliza",
      label: "Tipo Póliza",
      type: "chip",
      size: "md",
      chipVariantMap: TIPO_POLIZA_CHIP_VARIANTS as any,
      chipLabelMap: TIPO_POLIZA_LABELS as any,
    },
    {
      id: "periodicidad",
      label: "Periodicidad",
      type: "text",
      size: "sm",
      format: (val) => String(val || "DIARIA"),
    },
    {
      id: "siguientediahabil",
      label: "Día Hábil",
      type: "chip",
      size: "sm",
      chipVariantMap: {
        true: "success",
        false: "default",
      } as any,
      chipLabelMap: {
        true: "Sí",
        false: "No",
      } as any,
    },
  ];

  const rowActions: RowAction<PolizaSistema>[] = [
    {
      id: "edit",
      label: "Editar",
      icon: <EditIcon fontSize="small" />,
      onClick: handleOpenEdit,
      permission: CATALOG_SYSTEM_POLICIES_UPDATE,
    },
    {
      id: "delete",
      label: "Eliminar",
      icon: <DeleteIcon fontSize="small" />,
      color: "error",
      onClick: (row) => setDeleteId(row.id),
      permission: CATALOG_SYSTEM_POLICIES_DELETE,
    },
  ];

  const tabsOptions = useMemo(
    () => [
      { value: "all", label: "Todas", count: tabCounts.all },
      { value: "diaria", label: "Diarias", count: tabCounts.diaria },
      { value: "egresos", label: "Egresos", count: tabCounts.egresos },
      { value: "ingresos", label: "Ingresos", count: tabCounts.ingresos },
    ],
    [tabCounts]
  );

  return (
    <Stack spacing={3} sx={{ p: 3 }}>
      <Title
        title="Pólizas del Sistema"
        description="Administración y configuración de pólizas contables del sistema"
      />

      <TabFilters
        tabs={tabsOptions}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        showSearch
        searchValue={search}
        onSearchChange={handleSearchChange}
        actions={[
          {
            label: "Nueva Póliza Sistema",
            onClick: handleOpenAdd,
            variant: "contained",
            color: "primary",
            permission: CATALOG_SYSTEM_POLICIES_CREATE,
          },
        ]}
      />

      <TableCrud<PolizaSistema>
        columns={columns}
        rows={paginatedItems}
        actions={rowActions}
        loading={loading}
        rowKey="id"
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={filteredItems.length}
        onPageChange={(newPage) => setPage(newPage)}
        onRowsPerPageChange={(newRows) => {
          setRowsPerPage(newRows);
          setPage(0);
        }}
        emptyMessage="No hay pólizas del sistema registradas"
      />

      {/* Form Modal for Create & Edit */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ m: 0, p: 2, display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 600 }}>
          {editingItem ? `Editar Póliza: ${editingItem.clave}` : "Nueva Póliza del Sistema"}
          <IconButton onClick={() => setModalOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Clave"
                  value={clave}
                  onChange={(e) => setClave(e.target.value)}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 8 }}>
                <TextField
                  fullWidth
                  label="Descripción"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  fullWidth
                  label="Tipo de Póliza"
                  value={idtipopoliza}
                  onChange={(e) => setIdtipopoliza(Number(e.target.value))}
                >
                  <MenuItem value={3}>Diaria</MenuItem>
                  <MenuItem value={4}>Egresos</MenuItem>
                  <MenuItem value={5}>Ingresos</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  fullWidth
                  label="Periodicidad"
                  value={periodicidad}
                  onChange={(e) => setPeriodicidad(e.target.value)}
                >
                  <MenuItem value="DIARIA">Diaria</MenuItem>
                  <MenuItem value="SEMANAL">Semanal</MenuItem>
                  <MenuItem value="MENSUAL">Mensual</MenuItem>
                  <MenuItem value="ANUAL">Anual</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={siguientediahabil}
                      onChange={(e) => setSiguientediahabil(e.target.checked)}
                    />
                  }
                  label="Generar póliza en siguiente día hábil"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setModalOpen(false)} variant="outlined">
              Cancelar
            </Button>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? <CircularProgress size={24} /> : "Guardar"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={deleteId !== null}
        title="Eliminar Póliza del Sistema"
        description="¿Estás seguro de que deseas eliminar esta póliza? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        loading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteId(null)}
      />
    </Stack>
  );
}
