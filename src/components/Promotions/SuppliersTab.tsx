import { useState, useMemo } from "react";
import {
  Alert,
  Box,
  Button,
  InputAdornment,
  Stack,
  Table,
  TableBody,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
} from "@mui/material";
import { FormTextField } from "@/components";
import { AddSupplierModal } from "@/components/Products/AddSupplierModal";
import {
  FormCard,
  SupplierTableContainer,
  SupplierTableHeader,
  SupplierTableRow,
  SupplierTableCell,
} from "@/styles/catalogos/productos.styles";
import type { PromotionFormState, PromotionSupplier } from "@/types/promociones.types";
import type { SupplierCatalogItem } from "@/services/suppliers.service";
import { PlusIcon, Search } from "lucide-react";

interface SuppliersTabProps {
  formState: PromotionFormState;
  onFieldChange: (field: keyof PromotionFormState, value: unknown) => void;
  supplierCatalog: SupplierCatalogItem[];
  suppliersCatalogLoading: boolean;
  suppliersCatalogError: string | null;
}

export function SuppliersTab({
  formState,
  onFieldChange,
  supplierCatalog,
  suppliersCatalogLoading,
  suppliersCatalogError,
}: SuppliersTabProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const catalog: SupplierCatalogItem[] = Array.isArray(supplierCatalog)
    ? supplierCatalog
    : [];

  const filteredSuppliers = useMemo(() => {
    const suppliers = formState.suppliers || [];
    if (!searchTerm.trim()) return suppliers;
    const term = searchTerm.toLowerCase().trim();
    return suppliers.filter(
      (s) =>
        String(s.supplierId).toLowerCase().includes(term) ||
        s.supplierName.toLowerCase().includes(term)
    );
  }, [formState.suppliers, searchTerm]);

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleAddSupplier = async (supplierId: number) => {
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

  const handleRemoveSupplier = (rowId: number) => {
    const current = formState.suppliers || [];
    onFieldChange(
      "suppliers",
      current.filter((s) => s.id !== rowId)
    );
  };

  const handleNewSupplier = () => {
    window.location.href = "/catalogos/proveedores/nuevo";
  };

  const existingSupplierIds = (formState.suppliers || []).map((s) => s.supplierId);

  return (
    <>
      <FormCard>
        <Stack width="100%" direction="row" justifyContent="space-between" alignItems="center">
          <Stack spacing={0.5}>
            <Typography variant="h6">Proveedores</Typography>
            <Typography variant="body2" color="text.secondary">
              Configura los proveedores que aplicará con este Promoción.
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={2}>
            <FormTextField
              placeholder="Buscar proveedores"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
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
              sx={{ minWidth: 128 }}
              onClick={handleOpenModal}
              disabled={suppliersCatalogLoading || Boolean(suppliersCatalogError)}
            >
              Agregar
            </Button>
          </Stack>
        </Stack>

        {suppliersCatalogLoading ?
          <div
            style={{ paddingTop: "32px", display: "flex", justifyContent: "center" }}>
            <CircularProgress size={28} />
          </div>
          : formState.suppliers && formState.suppliers.length > 0 ?
            <>
              <Typography variant="body2" color="text.secondary">
                {formState.suppliers.length}
                {formState.suppliers.length > 1
                  ? " proveedores agregados"
                  : " proveedor agregado"}
              </Typography>
              <SupplierTableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <SupplierTableHeader>ID</SupplierTableHeader>
                      <SupplierTableHeader>Proveedor</SupplierTableHeader>
                      <SupplierTableHeader align="right"></SupplierTableHeader>
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
                      filteredSuppliers.map((supplier) => (
                        <SupplierTableRow key={supplier.id}>
                          <SupplierTableCell>{supplier.supplierId}</SupplierTableCell>
                          <SupplierTableCell>{supplier.supplierName}</SupplierTableCell>
                          <SupplierTableCell align="right">
                            <Button
                              variant="text"
                              onClick={() => handleRemoveSupplier(supplier.id)}
                            >
                              Remover
                            </Button>
                          </SupplierTableCell>
                        </SupplierTableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </SupplierTableContainer>
            </>
            :
            <Typography variant="body2" color="text.secondary">
              No hay proveedores agregados
            </Typography>
        }
      </FormCard>

      <AddSupplierModal
        open={modalOpen}
        onClose={handleCloseModal}
        onAddSupplier={handleAddSupplier}
        onNewSupplier={handleNewSupplier}
        loading={saving}
        availableSuppliers={catalog}
        existingSupplierIds={existingSupplierIds}
      />
    </>
  );
}
