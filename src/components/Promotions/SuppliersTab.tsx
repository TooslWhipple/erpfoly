import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  InputAdornment,
  Stack,
  Table,
  TableBody,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  CircularProgress,
} from "@mui/material";
import { FormTextField } from "@/components";
import { AddSupplierModal } from "@/components/Products/AddSupplierModal";
import { usePromotionSuppliersCatalog } from "@/hooks/usePromotionSuppliersCatalog";
import { getApiErrorMessage } from "@/lib/axios";
import {
  FormCard,
  SupplierTableContainer,
  SupplierTableHeader,
  SupplierTableRow,
  SupplierTableCell,
  SupplierRemoveIconButton,
} from "@/styles/catalogos/productos.styles";
import type { PromotionFormState, PromotionSupplier } from "@/types/promociones.types";
import { EMPTY_SUPPLIER_SELECTION } from "@/types/promociones.types";
import type { SupplierCatalogItem } from "@/services/suppliers.service";
import { Minus, PlusIcon, Search } from "lucide-react";

const SUPPLIERS_PAGE_SIZE = 50;

function supplierDisplayName(
  row: PromotionSupplier,
  catalog: SupplierCatalogItem[]
): string {
  const item = catalog.find((c) => c.id === row.supplierId);
  if (!item) {
    return row.supplierName;
  }
  const name = item.name?.trim() ?? "";
  const business = item.businessName?.trim() ?? "";
  if (name && business && name !== business) {
    return `${name} - ${business}`;
  }
  return business || name || row.supplierName;
}

interface SuppliersTabProps {
  formState: PromotionFormState;
  onFieldChange: (field: keyof PromotionFormState, value: unknown) => void;
  /** When false, catalog fetching is paused (tab hidden). */
  isActive?: boolean;
}

export function SuppliersTab({
  formState,
  onFieldChange,
  isActive = true,
}: SuppliersTabProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);

  const suppliersCatalogQuery = usePromotionSuppliersCatalog(isActive);
  const catalog = suppliersCatalogQuery.data ?? [];
  const suppliersCatalogLoading =
    suppliersCatalogQuery.isLoading ||
    (suppliersCatalogQuery.isFetching && catalog.length === 0);
  const suppliersCatalogError = suppliersCatalogQuery.isError
    ? getApiErrorMessage(suppliersCatalogQuery.error)
    : null;

  useEffect(() => {
    if (!modalOpen) {
      return;
    }
    void suppliersCatalogQuery.refetch();
  }, [modalOpen, suppliersCatalogQuery.refetch]);

  const selection = formState.supplierSelection ?? EMPTY_SUPPLIER_SELECTION;

  const selectedSuppliers = useMemo(() => {
    if (selection.selectAll) {
      const excluded = new Set(selection.excludedIds);
      return catalog
        .filter((supplier) => !excluded.has(supplier.id))
        .map((supplier) => ({
          id: supplier.id,
          supplierId: supplier.id,
          supplierName: supplier.businessName?.trim() || supplier.name,
        }));
    }
    return formState.suppliers || [];
  }, [catalog, formState.suppliers, selection.excludedIds, selection.selectAll]);

  const filteredSuppliers = useMemo(() => {
    if (!searchTerm.trim()) return selectedSuppliers;
    const term = searchTerm.toLowerCase().trim();
    return selectedSuppliers.filter((s) => {
      const displayName = supplierDisplayName(s, catalog);
      return (
        String(s.supplierId).toLowerCase().includes(term) ||
        displayName.toLowerCase().includes(term)
      );
    });
  }, [selectedSuppliers, searchTerm, catalog]);

  const pagedSuppliers = useMemo(() => {
    if (filteredSuppliers.length <= SUPPLIERS_PAGE_SIZE) return filteredSuppliers;
    const start = page * SUPPLIERS_PAGE_SIZE;
    return filteredSuppliers.slice(start, start + SUPPLIERS_PAGE_SIZE);
  }, [filteredSuppliers, page]);

  useEffect(() => {
    setPage(0);
  }, [searchTerm, selection.selectAll, selection.excludedIds, formState.suppliers]);

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleAddAll = () => {
    onFieldChange("supplierSelection", {
      selectAll: true,
      excludedIds: [],
    });
    onFieldChange("suppliers", []);
    setModalOpen(false);
  };

  const handleRemoveAll = () => {
    onFieldChange("supplierSelection", { ...EMPTY_SUPPLIER_SELECTION });
    onFieldChange("suppliers", []);
  };

  const handleAddSupplier = async (supplierId: number) => {
    if (selection.selectAll) {
      onFieldChange("supplierSelection", {
        selectAll: true,
        excludedIds: selection.excludedIds.filter((id) => id !== supplierId),
      });
      setModalOpen(false);
      return;
    }

    setSaving(true);
    try {
      const row = catalog.find((s) => s.id === supplierId);
      const name =
        row?.businessName?.trim() || row?.name?.trim() || `Proveedor ${supplierId}`;
      const newSupplier: PromotionSupplier = {
        id: Date.now(),
        supplierId,
        supplierName: name,
      };
      const current = formState.suppliers || [];
      onFieldChange("suppliers", [...current, newSupplier]);
    } finally {
      setSaving(false);
      setModalOpen(false);
    }
  };

  const handleRemoveSupplier = (supplier: PromotionSupplier) => {
    if (selection.selectAll) {
      if (selection.excludedIds.includes(supplier.supplierId)) return;
      onFieldChange("supplierSelection", {
        selectAll: true,
        excludedIds: [...selection.excludedIds, supplier.supplierId],
      });
      return;
    }
    const current = formState.suppliers || [];
    onFieldChange(
      "suppliers",
      current.filter((s) => s.id !== supplier.id)
    );
  };

  const handleNewSupplier = () => {
    window.location.href = "/catalogos/proveedores/nuevo";
  };

  const existingSupplierIds = selectedSuppliers.map((s) => s.supplierId);

  return (
    <>
      <FormCard>
        <Stack
          width="100%"
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", md: "center" }}
          spacing={2}
        >
          <Stack spacing={0.5}>
            <Typography variant="h6">Proveedores</Typography>
            <Typography variant="body2" color="text.secondary">
              Configura los proveedores que aplicará con este Promoción.
            </Typography>
          </Stack>
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            sx={{ width: { xs: "100%", md: "auto" }, flexWrap: "wrap" }}
          >
            <FormTextField
              placeholder="Buscar proveedores"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{ flex: "1 1 180px", minWidth: 0 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={16} />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="outlined"
              color="primary"
              startIcon={<PlusIcon size={12} />}
              sx={{ minWidth: 128, flexShrink: 0 }}
              onClick={handleOpenModal}
            >
              Agregar
            </Button>
          </Stack>
        </Stack>

        {suppliersCatalogError ? (
          <Alert severity="error">{suppliersCatalogError}</Alert>
        ) : null}

        {suppliersCatalogLoading ? (
          <div
            style={{ paddingTop: "32px", display: "flex", justifyContent: "center" }}
          >
            <CircularProgress size={28} />
          </div>
        ) : selectedSuppliers.length > 0 ? (
          <>
            <Typography variant="body2" color="text.secondary">
              {selectedSuppliers.length}
              {selectedSuppliers.length > 1
                ? " proveedores agregados"
                : " proveedor agregado"}
            </Typography>
            <SupplierTableContainer
              sx={{ "& .MuiTable-root": { minWidth: 0, tableLayout: "fixed" } }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <SupplierTableHeader
                      sx={{
                        width: { xs: 52, sm: 72 },
                        whiteSpace: "nowrap",
                        position: "sticky",
                        top: 0,
                        zIndex: 1,
                      }}
                    >
                      ID
                    </SupplierTableHeader>
                    <SupplierTableHeader sx={{ position: "sticky", top: 0, zIndex: 1 }}>
                      Proveedor
                    </SupplierTableHeader>
                    <SupplierTableHeader
                      align="right"
                      sx={{
                        width: { xs: 148, sm: 168 },
                        whiteSpace: "nowrap",
                        py: 0.5,
                        px: 1,
                        position: "sticky",
                        top: 0,
                        zIndex: 1,
                      }}
                    >
                      <Button
                        variant="text"
                        size="small"
                        color="error"
                        onClick={handleRemoveAll}
                        sx={{ px: { xs: 0.5, sm: 1 }, whiteSpace: "nowrap" }}
                      >
                        Quitar todos
                      </Button>
                    </SupplierTableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSuppliers.length === 0 ? (
                    <TableRow>
                      <SupplierTableCell
                        colSpan={3}
                        align="center"
                        sx={{ py: 3, color: "text.secondary" }}
                      >
                        No se encontraron proveedores
                      </SupplierTableCell>
                    </TableRow>
                  ) : (
                    pagedSuppliers.map((supplier) => (
                      <SupplierTableRow key={supplier.id}>
                        <SupplierTableCell sx={{ whiteSpace: "nowrap" }}>
                          {supplier.supplierId}
                        </SupplierTableCell>
                        <SupplierTableCell>
                          <Typography
                            noWrap
                            variant="body2"
                            title={supplierDisplayName(supplier, catalog)}
                          >
                            {supplierDisplayName(supplier, catalog)}
                          </Typography>
                        </SupplierTableCell>
                        <SupplierTableCell align="right" sx={{ px: 1 }}>
                          <SupplierRemoveIconButton
                            size="small"
                            aria-label="Quitar proveedor"
                            onClick={() => handleRemoveSupplier(supplier)}
                          >
                            <Minus size={16} strokeWidth={2} />
                          </SupplierRemoveIconButton>
                        </SupplierTableCell>
                      </SupplierTableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </SupplierTableContainer>
            {filteredSuppliers.length > SUPPLIERS_PAGE_SIZE ? (
              <TablePagination
                component="div"
                count={filteredSuppliers.length}
                page={page}
                onPageChange={(_event, nextPage) => setPage(nextPage)}
                rowsPerPage={SUPPLIERS_PAGE_SIZE}
                rowsPerPageOptions={[SUPPLIERS_PAGE_SIZE]}
                labelRowsPerPage=""
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}–${to} de ${count}`
                }
                sx={{
                  ".MuiTablePagination-selectLabel, .MuiTablePagination-input": {
                    display: "none",
                  },
                }}
              />
            ) : null}
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No hay proveedores agregados
          </Typography>
        )}
      </FormCard>

      <AddSupplierModal
        open={modalOpen}
        onClose={handleCloseModal}
        onAddSupplier={handleAddSupplier}
        onAddAll={handleAddAll}
        description="Selecciona un proveedor para agregar a esta promoción"
        onNewSupplier={handleNewSupplier}
        loading={saving}
        catalogLoading={suppliersCatalogLoading}
        availableSuppliers={catalog}
        existingSupplierIds={existingSupplierIds}
      />
    </>
  );
}
