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
    onAddAll?: () => void;
    description?: string;
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
    onAddAll,
    description = "Selecciona un proveedor para agregar a este artículo",
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

    const allSuppliersAdded =
        availableSuppliers.length > 0 &&
        availableSuppliers.every((supplier) =>
            existingSupplierIds.includes(supplier.id),
        );
    const showAddAll = Boolean(onAddAll) && availableSuppliers.length > 0 && !allSuppliersAdded;

    return (
        <SideModal
            open={open}
            onClose={handleClose}
            maxWidth="lg"
            disableClose={loading}
            title="Agregar proveedor"
            description={description}
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

            <SupplierTableContainer
                sx={{
                    flex: 1,
                    minHeight: 0,
                    overflow: "auto",
                    ...(showAddAll
                        ? { "& .MuiTable-root": { minWidth: 0, tableLayout: "fixed" } }
                        : null),
                }}
            >
                <Table>
                    <TableHead>
                        <TableRow>
                            <SupplierTableHeader
                                sx={showAddAll ? { width: { xs: 52, sm: 72 }, whiteSpace: "nowrap" } : undefined}
                            >
                                ID
                            </SupplierTableHeader>
                            <SupplierTableHeader>Proveedor</SupplierTableHeader>
                            <SupplierTableHeader
                                align="right"
                                sx={
                                    showAddAll
                                        ? {
                                            width: { xs: 148, sm: 168 },
                                            whiteSpace: "nowrap",
                                            py: 0.5,
                                            px: 1,
                                        }
                                        : undefined
                                }
                            >
                                {showAddAll ? (
                                    <Button
                                        variant="text"
                                        size="small"
                                        color="primary"
                                        onClick={onAddAll}
                                        disabled={loading || catalogLoading}
                                        sx={{ px: { xs: 0.5, sm: 1 }, whiteSpace: "nowrap" }}
                                    >
                                        Agregar todos
                                    </Button>
                                ) : null}
                            </SupplierTableHeader>
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
                                        {allSuppliersAdded
                                            ? "Todos los proveedores ya están agregados"
                                            : searchTerm
                                                ? "No se encontraron proveedores"
                                                : "No hay proveedores disponibles"}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredSuppliers.map((supplier) => (
                                <SupplierTableRow key={supplier.id}>
                                    <SupplierTableCell sx={{ whiteSpace: "nowrap" }}>{supplier.id}</SupplierTableCell>
                                    <SupplierTableCell>
                                        {showAddAll ? (
                                            <Typography noWrap variant="body2" title={supplierDisplayName(supplier)}>
                                                {supplierDisplayName(supplier)}
                                            </Typography>
                                        ) : (
                                            supplierDisplayName(supplier)
                                        )}
                                    </SupplierTableCell>
                                    <SupplierTableCell align="right" sx={showAddAll ? { px: 1 } : undefined}>
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
