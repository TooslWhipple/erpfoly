import { useState, useMemo } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    InputAdornment,
    Typography,
    Button,
    CircularProgress,
    Box,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { FormTextField } from "@/components";
import { SideModal } from "@/components/SideModal";
import {
    SupplierTableContainer,
    SupplierTableHeader,
    SupplierTableRow,
    SupplierTableCell
} from "@/styles/catalogos/productos.styles";
import type { SupplierCatalogItem } from "@/services/suppliers.service";

function supplierDisplayName(s: SupplierCatalogItem): string {
    const business = s.businessName?.trim();
    return business || s.name;
}

interface AddSupplierModalProps {
    open: boolean;
    onClose: () => void;
    onAddSupplier: (supplierId: number) => Promise<void>;
    onNewSupplier?: () => void;
    loading?: boolean;
    /** True while the supplier catalog is still loading (distinct from add-in-progress). */
    catalogLoading?: boolean;
    availableSuppliers: SupplierCatalogItem[];
    existingSupplierIds?: number[];
}

export function AddSupplierModal({
    open,
    onClose,
    onAddSupplier,
    onNewSupplier,
    loading = false,
    catalogLoading = false,
    availableSuppliers,
    existingSupplierIds = [],
}: AddSupplierModalProps) {
    const [searchTerm, setSearchTerm] = useState<string>("");

    const filteredSuppliers = useMemo(() => {
        return availableSuppliers.filter((supplier) => {
            const q = searchTerm.toLowerCase();
            const display = supplierDisplayName(supplier).toLowerCase();
            const matchesSearch =
                display.includes(q) ||
                supplier.name.toLowerCase().includes(q) ||
                supplier.id.toString().includes(searchTerm);
            const notAlreadyAdded = !existingSupplierIds.includes(supplier.id);
            return matchesSearch && notAlreadyAdded;
        });
    }, [availableSuppliers, searchTerm, existingSupplierIds]);

    const handleClose = () => {
        if (!loading) {
            setSearchTerm("");
            onClose();
        }
    };

    const handleAddSupplier = async (supplierId: number) => {
        await onAddSupplier(supplierId);
    };

    return (
        <SideModal
            open={open}
            onClose={handleClose}
            maxWidth="lg"
            disableClose={loading}
            title="Agregar proveedor"
            description="Selecciona un proveedor para agregar a este artículo"
            headerActions={
                <Button
                    variant="contained"
                    color="primary"
                    onClick={onNewSupplier}
                    disabled={loading}>
                    Nuevo
                </Button>
            }
            contentSx={{
                flex: 1,
                minHeight: 0,
                overflow: "hidden",
            }}>
            <FormTextField
                placeholder="Buscar"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                        </InputAdornment>
                    ),
                }}
            />

            <SupplierTableContainer sx={{ flex: 1, minHeight: 0, overflow: "auto" }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <SupplierTableHeader>ID</SupplierTableHeader>
                            <SupplierTableHeader>Proveedor</SupplierTableHeader>
                            <SupplierTableHeader align="right"></SupplierTableHeader>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {catalogLoading && availableSuppliers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            gap: 1.5,
                                        }}
                                    >
                                        <CircularProgress size={24} />
                                        <Typography variant="body2" color="text.secondary">
                                            Cargando proveedores…
                                        </Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : filteredSuppliers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        {
                                            (searchTerm) ? "No se encontraron proveedores" : "No hay proveedores disponibles"
                                        }
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredSuppliers.map((supplier) => (
                                <SupplierTableRow key={supplier.id}>
                                    <SupplierTableCell>{supplier.id}</SupplierTableCell>
                                    <SupplierTableCell>{supplierDisplayName(supplier)}</SupplierTableCell>
                                    <SupplierTableCell align="right">
                                        <Button
                                            variant="text"
                                            onClick={() => handleAddSupplier(supplier.id)}
                                            disabled={loading}>
                                            Agregar
                                        </Button>
                                    </SupplierTableCell>
                                </SupplierTableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </SupplierTableContainer>
        </SideModal>
    );
}
