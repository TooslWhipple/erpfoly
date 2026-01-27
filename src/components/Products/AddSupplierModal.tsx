import { useState, useMemo } from "react";
import { Dialog, Box, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, InputAdornment } from "@mui/material";
import { Close as CloseIcon, Search as SearchIcon } from "@mui/icons-material";
import { FormTextField } from "@/components";
import {
    StyledDialogContent,
    ModalHeader,
    ModalTitle,
    ModalDescription,
    CloseButton,
} from "@/components/ModalForm/styles";
import {
    FormActions,
    CancelButton,
} from "@/components/Form/styles";
import {
    SupplierTableContainer,
    SupplierTableHeader,
    SupplierTableRow,
    SupplierTableCell,
    SupplierAddButton,
    SupplierNewButton,
} from "@/styles/catalogos/productos.styles";
import type { SupplierForSelection } from "@/data/productos.mockData";

// ============================================================================
// TYPES
// ============================================================================

interface AddSupplierModalProps {
    open: boolean;
    onClose: () => void;
    onAddSupplier: (supplierId: number) => Promise<void>;
    onNewSupplier?: () => void;
    loading?: boolean;
    availableSuppliers: SupplierForSelection[];
    existingSupplierIds?: number[];
}

// ============================================================================
// COMPONENT
// ============================================================================

export function AddSupplierModal({
    open,
    onClose,
    onAddSupplier,
    onNewSupplier,
    loading = false,
    availableSuppliers,
    existingSupplierIds = [],
}: AddSupplierModalProps) {
    const [searchTerm, setSearchTerm] = useState<string>("");

    // Filter suppliers based on search term and exclude already added suppliers
    const filteredSuppliers = useMemo(() => {
        return availableSuppliers.filter((supplier) => {
            const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                supplier.id.toString().includes(searchTerm);
            const notAlreadyAdded = !existingSupplierIds.includes(supplier.id);
            return matchesSearch && notAlreadyAdded;
        });
    }, [availableSuppliers, searchTerm, existingSupplierIds]);

    // Reset form when modal opens/closes
    const handleClose = () => {
        if (!loading) {
            setSearchTerm("");
            onClose();
        }
    };

    // Handle add supplier
    const handleAddSupplier = async (supplierId: number) => {
        await onAddSupplier(supplierId);
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    maxHeight: "95vh",
                    height: "90vh",
                },
            }}
        >
            <StyledDialogContent sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                {/* Header */}
                <ModalHeader>
                    <ModalTitle>Agregar proveedor</ModalTitle>
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                        <SupplierNewButton
                            variant="contained"
                            color="primary"
                            onClick={onNewSupplier}
                            disabled={loading}
                        >
                            Nuevo
                        </SupplierNewButton>
                        <CloseButton onClick={handleClose} disabled={loading} size="small">
                            <CloseIcon />
                        </CloseButton>
                    </Box>
                </ModalHeader>

                {/* Description */}
                <ModalDescription sx={{ mb: 3 }}>
                    Selecciona un proveedor para agregar a este artículo
                </ModalDescription>

                {/* Search Field */}
                <Box sx={{ mb: 3 }}>
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
                </Box>

                {/* Suppliers Table */}
                <SupplierTableContainer sx={{ flex: 1, minHeight: 0 }}>
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
                                    <TableCell colSpan={3} align="center" sx={{ py: 4, color: "text.secondary" }}>
                                        {searchTerm ? "No se encontraron proveedores" : "No hay proveedores disponibles"}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredSuppliers.map((supplier) => (
                                    <SupplierTableRow key={`${supplier.id}-${supplier.name}`}>
                                        <SupplierTableCell>{supplier.id}</SupplierTableCell>
                                        <SupplierTableCell>{supplier.name}</SupplierTableCell>
                                        <SupplierTableCell align="right">
                                            <SupplierAddButton
                                                onClick={() => handleAddSupplier(supplier.id)}
                                                disabled={loading}
                                            >
                                                Agregar
                                            </SupplierAddButton>
                                        </SupplierTableCell>
                                    </SupplierTableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </SupplierTableContainer>
            </StyledDialogContent>
        </Dialog>
    );
}
