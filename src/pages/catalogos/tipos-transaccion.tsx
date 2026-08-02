import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Autocomplete,
  Divider,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import { Title, TableCrud, TabFilters, ConfirmModal } from "@/components";
import type { Column, RowAction } from "@/components/TableCrud";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import {
  getTipoTransacciones,
  createTipoTransaccion,
  updateTipoTransaccion,
  deleteTipoTransaccion,
  getTiposCuenta,
  searchAccountingAccounts,
} from "@/services/tipo-transacciones.service";
import { getPolizasSistema } from "@/services/polizas-sistema.service";
import type {
  TipoTransaccion,
  AsientoContableConfig,
  PolizaSistema,
  TipoCuenta,
  AccountingAccountItem,
} from "@/types/contabilidad.types";
import {
  CATALOG_TRANSACTION_TYPES_CREATE,
  CATALOG_TRANSACTION_TYPES_DELETE,
  CATALOG_TRANSACTION_TYPES_READ,
  CATALOG_TRANSACTION_TYPES_UPDATE,
} from "@/lib/permissions";

export default function TiposTransaccionPage() {
  const showSuccess = useSnackbarStore((s) => s.showSuccess);
  const showError = useSnackbarStore((s) => s.showError);
  const showWarning = useSnackbarStore((s) => s.showWarning);

  const [items, setItems] = useState<TipoTransaccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // View Mode: 'list' or 'form'
  const [viewMode, setViewMode] = useState<"list" | "form">("list");
  const [editingItem, setEditingItem] = useState<TipoTransaccion | null>(null);
  const [clave, setClave] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [asientos, setAsientos] = useState<AsientoContableConfig[]>([]);
  const [saving, setSaving] = useState(false);

  // Catalogs for select inputs inside form
  const [polizas, setPolizas] = useState<PolizaSistema[]>([]);
  const [tiposCuenta, setTiposCuenta] = useState<TipoCuenta[]>([]);

  // Account search state per row index
  const [accountOptions, setAccountOptions] = useState<Record<number, AccountingAccountItem[]>>({});
  const [loadingAccounts, setLoadingAccounts] = useState<Record<number, boolean>>({});

  // Delete modal state
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTipoTransacciones();
      setItems(data || []);
    } catch (err: any) {
      showError(err?.message || "Error al cargar los tipos de transacción");
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        const [polizasData, cuentasData] = await Promise.all([
          getPolizasSistema().catch(() => []),
          getTiposCuenta().catch(() => []),
        ]);
        setPolizas(polizasData);
        setTiposCuenta(cuentasData);
      } catch {
        // Soft fallback for dropdown catalogs
      }
    };
    void loadCatalogs();
  }, []);

  // Filtered rows for TableCrud
  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;
    const term = search.toLowerCase();
    return items.filter(
      (item) =>
        item.clave.toLowerCase().includes(term) ||
        item.descripcion.toLowerCase().includes(term)
    );
  }, [items, search]);

  const paginatedItems = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredItems.slice(start, start + rowsPerPage);
  }, [filteredItems, page, rowsPerPage]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(0);
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setClave("");
    setDescripcion("");
    setAsientos([]);
    setAccountOptions({});
    setViewMode("form");
  };

  const handleOpenEdit = (item: TipoTransaccion) => {
    setEditingItem(item);
    setClave(item.clave);
    setDescripcion(item.descripcion);

    const mappedAsientos: AsientoContableConfig[] = (item.asientosContables || []).map((ac) => ({
      idpolizasistema: ac.idpolizasistema,
      afectacion: ac.afectacion,
      signo: ac.signo,
      idtipocuenta: ac.idtipocuenta || 1,
      cuenta: ac.cuenta || "",
      calculoconfiguracion: ac.calculoconfiguracion || "TOTAL",
      porcentaje: ac.porcentaje ?? 100,
      detallado: ac.detallado ?? false,
    }));

    setAsientos(mappedAsientos);
    setAccountOptions({});
    setViewMode("form");
  };

  const handleCloseForm = () => {
    setViewMode("list");
    setEditingItem(null);
    setClave("");
    setDescripcion("");
    setAsientos([]);
  };

  const handleAddAsientoRow = () => {
    setAsientos((prev) => [
      ...prev,
      {
        idpolizasistema: polizas.length > 0 ? polizas[0].id : 1,
        afectacion: "CARGO",
        signo: "+",
        idtipocuenta: 1,
        cuenta: "",
        calculoconfiguracion: "TOTAL",
        porcentaje: 100,
        detallado: false,
      },
    ]);
  };

  const handleRemoveAsientoRow = (index: number) => {
    setAsientos((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleAsientoChange = (index: number, field: keyof AsientoContableConfig, value: any) => {
    setAsientos((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSearchAccounts = async (index: number, query: string) => {
    if (!query || query.length < 2) return;
    setLoadingAccounts((prev) => ({ ...prev, [index]: true }));
    try {
      const result = await searchAccountingAccounts({ q: query, limit: 15 });
      setAccountOptions((prev) => ({ ...prev, [index]: result.data || [] }));
    } catch {
      setAccountOptions((prev) => ({ ...prev, [index]: [] }));
    } finally {
      setLoadingAccounts((prev) => ({ ...prev, [index]: false }));
    }
  };

  const handleSave = async () => {
    if (!clave.trim() || !descripcion.trim()) {
      showWarning("La clave y la descripción son requeridas.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        clave: clave.trim(),
        descripcion: descripcion.trim(),
        asientosContables: asientos.map((a) => ({
          idpolizasistema: Number(a.idpolizasistema),
          afectacion: a.afectacion,
          signo: a.signo,
          idtipocuenta: Number(a.idtipocuenta || 1),
          cuenta: a.cuenta || "",
          calculoconfiguracion: a.calculoconfiguracion,
          porcentaje: Number(a.porcentaje ?? 100),
          detallado: Boolean(a.detallado),
        })),
      };

      if (editingItem) {
        await updateTipoTransaccion(editingItem.id, payload);
        showSuccess("Tipo de transacción actualizado correctamente.");
      } else {
        await createTipoTransaccion(payload);
        showSuccess("Tipo de transacción creado correctamente.");
      }

      handleCloseForm();
      await loadData();
    } catch (err: any) {
      showError(err?.message || "Error al guardar el tipo de transacción");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteTipoTransaccion(deleteId);
      showSuccess("Tipo de transacción eliminado correctamente.");
      setDeleteId(null);
      await loadData();
    } catch (err: any) {
      showError(err?.message || "Error al eliminar el tipo de transacción");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<TipoTransaccion>[] = [
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
      size: "md",
    },
    {
      id: "asientosContables",
      label: "Asientos Configurados",
      type: "text",
      size: "sm",
      format: (_, row) => `${row.asientosContables?.length || 0} asiento(s)`,
    },
  ];

  const rowActions: RowAction<TipoTransaccion>[] = [
    {
      id: "edit",
      label: "Editar",
      icon: <EditIcon fontSize="small" />,
      color: "primary",
      onClick: (row) => handleOpenEdit(row),
      permission: CATALOG_TRANSACTION_TYPES_UPDATE,
    },
    {
      id: "delete",
      label: "Eliminar",
      icon: <DeleteIcon fontSize="small" />,
      color: "error",
      onClick: (row) => setDeleteId(row.id),
      permission: CATALOG_TRANSACTION_TYPES_DELETE,
    },
  ];

  // View mode switcher: List vs Form screen
  if (viewMode === "form") {
    return (
      <Stack spacing={3} sx={{ p: 3 }}>
        {/* Top Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <IconButton onClick={handleCloseForm} color="primary" sx={{ border: "1px solid", borderColor: "divider" }}>
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {editingItem ? `Editar Tipo de Transacción: ${editingItem.clave}` : "Nuevo Tipo de Transacción"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Configure la clave, descripción y matriz de asientos contables del sistema
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={handleCloseForm} disabled={saving}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </Stack>
        </Box>

        {/* Section 1: General Info Card */}
        <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Datos Generales
            </Typography>
            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
              <Box sx={{ flex: { xs: "1 1 100%", md: "0 0 30%" } }}>
                <TextField
                  fullWidth
                  label="Clave"
                  required
                  value={clave}
                  onChange={(e) => setClave(e.target.value)}
                  placeholder="Ej. ventasdecontado"
                  helperText="Identificador único de la transacción"
                />
              </Box>
              <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 65%" } }}>
                <TextField
                  fullWidth
                  label="Descripción"
                  required
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Ej. VENTAS DE CONTADO"
                  helperText="Nombre descriptivo de la operación contable"
                />
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Section 2: Accounting Matrix Card */}
        <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Matriz de Asientos Contables Configurados
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Defina cada asiento con su póliza, tipo de afectación, tipo de cuenta y porcentaje de cálculo
                </Typography>
              </Box>
              <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={handleAddAsientoRow}>
                Agregar Asiento
              </Button>
            </Box>

            <Divider sx={{ my: 2 }} />

            {asientos.length === 0 ? (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 5 }}>
                No hay asientos contables configurados. Haz clic en <strong>"Agregar Asiento"</strong> para añadir uno.
              </Typography>
            ) : (
              <Box sx={{ overflowX: "auto" }}>
                <Table size="medium">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "action.hover" }}>
                      <TableCell sx={{ minWidth: 260, fontWeight: 700 }}>Póliza Sistema</TableCell>
                      <TableCell sx={{ minWidth: 140, fontWeight: 700 }}>Afectación</TableCell>
                      <TableCell sx={{ minWidth: 100, fontWeight: 700 }}>Signo</TableCell>
                      <TableCell sx={{ minWidth: 260, fontWeight: 700 }}>Tipo Cuenta</TableCell>
                      <TableCell sx={{ minWidth: 280, fontWeight: 700 }}>Cuenta Contable</TableCell>
                      <TableCell sx={{ minWidth: 220, fontWeight: 700 }}>Cálculo</TableCell>
                      <TableCell sx={{ minWidth: 120, width: 120, textAlign: "center", fontWeight: 700 }}>%</TableCell>
                      <TableCell align="center" sx={{ minWidth: 70, fontWeight: 700 }}>Acción</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {asientos.map((asiento, idx) => (
                      <TableRow key={idx} hover>
                        <TableCell>
                          <TextField
                            select
                            size="small"
                            fullWidth
                            value={asiento.idpolizasistema || ""}
                            onChange={(e) =>
                              handleAsientoChange(
                                idx,
                                "idpolizasistema",
                                e.target.value ? Number(e.target.value) : undefined
                              )
                            }
                          >
                            <MenuItem value="">Ninguna</MenuItem>
                            {polizas.map((p) => (
                              <MenuItem key={p.id} value={p.id}>
                                {p.clave} - {p.descripcion}
                              </MenuItem>
                            ))}
                          </TextField>
                        </TableCell>
                        <TableCell>
                          <TextField
                            select
                            size="small"
                            fullWidth
                            value={asiento.afectacion}
                            onChange={(e) => handleAsientoChange(idx, "afectacion", e.target.value)}
                          >
                            <MenuItem value="CARGO">CARGO</MenuItem>
                            <MenuItem value="ABONO">ABONO</MenuItem>
                          </TextField>
                        </TableCell>
                        <TableCell>
                          <TextField
                            select
                            size="small"
                            fullWidth
                            value={asiento.signo}
                            onChange={(e) => handleAsientoChange(idx, "signo", e.target.value)}
                          >
                            <MenuItem value="+">+</MenuItem>
                            <MenuItem value="-">-</MenuItem>
                          </TextField>
                        </TableCell>
                        <TableCell>
                          <TextField
                            select
                            size="small"
                            fullWidth
                            value={asiento.idtipocuenta ?? 1}
                            onChange={(e) => handleAsientoChange(idx, "idtipocuenta", Number(e.target.value))}
                          >
                            {tiposCuenta.map((tc) => (
                              <MenuItem key={tc.id} value={tc.id}>
                                {tc.descripcion || tc.nombre || tc.clave || `Tipo ${tc.id}`}
                              </MenuItem>
                            ))}
                          </TextField>
                        </TableCell>
                        <TableCell>
                          <Autocomplete
                            freeSolo
                            size="small"
                            options={accountOptions[idx] || []}
                            loading={loadingAccounts[idx] || false}
                            getOptionLabel={(opt) =>
                              typeof opt === "string"
                                ? opt
                                : `${opt.code || opt.codigo || ""} - ${opt.name || opt.nombre || ""}`
                            }
                            inputValue={asiento.cuenta || ""}
                            onInputChange={(_, newValue) => {
                              handleAsientoChange(idx, "cuenta", newValue);
                              handleSearchAccounts(idx, newValue);
                            }}
                            onChange={(_, selectedOption) => {
                              if (typeof selectedOption === "string") {
                                handleAsientoChange(idx, "cuenta", selectedOption);
                              } else if (selectedOption) {
                                handleAsientoChange(
                                  idx,
                                  "cuenta",
                                  selectedOption.code || selectedOption.codigo || ""
                                );
                              }
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                placeholder="Buscar o ingresar cuenta..."
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            select
                            size="small"
                            fullWidth
                            value={asiento.calculoconfiguracion}
                            onChange={(e) => handleAsientoChange(idx, "calculoconfiguracion", e.target.value)}
                          >
                            <MenuItem value="TOTAL">TOTAL</MenuItem>
                            <MenuItem value="IMPUESTO_INVERSO">IMPUESTO INVERSO</MenuItem>
                            <MenuItem value="SUBTOTAL_INVERSO">SUBTOTAL INVERSO</MenuItem>
                          </TextField>
                        </TableCell>
                        <TableCell sx={{ minWidth: 120, width: 120 }}>
                          <TextField
                            size="small"
                            type="number"
                            fullWidth
                            value={asiento.porcentaje ?? 100}
                            onChange={(e) => handleAsientoChange(idx, "porcentaje", Number(e.target.value))}
                            inputProps={{ min: 0, max: 100, style: { textAlign: "center" } }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton size="small" color="error" onClick={() => handleRemoveAsientoRow(idx)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Bottom Actions Bar */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, pb: 4 }}>
          <Button variant="outlined" size="large" onClick={handleCloseForm} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Guardando..." : "Guardar Tipo de Transacción"}
          </Button>
        </Box>
      </Stack>
    );
  }

  return (
    <Stack spacing={3} sx={{ p: 3 }}>
      <Title
        title="Tipos de Transacción"
        description="Gestión y configuración de los tipos de transacción y matriz de asientos contables"
      />

      <TabFilters
        tabs={[]}
        activeTab=""
        onTabChange={() => {}}
        showSearch
        searchValue={search}
        onSearchChange={handleSearchChange}
        actions={[
          {
            label: "Nuevo Tipo de Transacción",
            onClick: handleOpenAdd,
            variant: "contained",
            color: "primary",
            permission: CATALOG_TRANSACTION_TYPES_CREATE,
          },
        ]}
      />

      <TableCrud<TipoTransaccion>
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
        emptyMessage="No hay tipos de transacción registrados"
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={!!deleteId}
        title="Eliminar Tipo de Transacción"
        description="¿Estás seguro de que deseas eliminar este tipo de transacción? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        type="error"
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteId(null)}
      />
    </Stack>
  );
}
