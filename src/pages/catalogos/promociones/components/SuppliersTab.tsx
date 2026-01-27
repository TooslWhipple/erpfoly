import { useState } from "react";
import { styled } from "@mui/material/styles";
import { Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { AddSupplierModal } from "@/components/Products/AddSupplierModal";
import { Section, SectionTitle, SectionDescription, SupplierTableContainer, SupplierTableHeader, SupplierTableRow, SupplierTableCell, SupplierAddButton } from "@/styles/catalogos/productos.styles";
import type { PromotionFormState, PromotionSupplier } from "../types";
import { MOCK_SUPPLIERS_FOR_SELECTION } from "../mockData";

// ============================================================================
// TYPES
// ============================================================================

interface SuppliersTabProps {
    formState: PromotionFormState;
    onFieldChange: (field: keyof PromotionFormState, value: any) => void;
}

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const AddButton = styled(Button)(({ theme }) => ({
    textTransform: "none",
    fontSize: "0.875rem",
    fontWeight: 600,
}));

const RemoveButton = styled(Button)(({ theme }) => ({
    textTransform: "none",
    fontSize: "0.875rem",
    fontWeight: 500,
    color: theme.palette.error.main,
    padding: theme.spacing(0.5, 1),
    minWidth: "auto",
    "&:hover": {
        backgroundColor: "transparent",
        textDecoration: "underline",
    },
}));

const SummaryText = styled(Box)(({ theme }) => ({
    fontSize: "0.875rem",
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(2),
}));

// ============================================================================
// COMPONENT
// ============================================================================

export function SuppliersTab({
    formState,
    onFieldChange,
}: SuppliersTabProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleOpenModal = () => {
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    const handleAddSupplier = async (supplierId: number) => {
        setSaving(true);
        try {
            const supplier = MOCK_SUPPLIERS_FOR_SELECTION.find((s) => s.id === supplierId);
            if (supplier) {
                const newSupplier: PromotionSupplier = {
                    id: Date.now(),
                    supplierId: supplier.id,
                    supplierName: supplier.name,
                };
                const currentSuppliers = formState.suppliers || [];
                onFieldChange("suppliers", [...currentSuppliers, newSupplier]);
            }
        } finally {
            setSaving(false);
            setModalOpen(false);
        }
    };

    const handleRemoveSupplier = (supplierId: number) => {
        const currentSuppliers = formState.suppliers || [];
        onFieldChange(
            "suppliers",
            currentSuppliers.filter((s) => s.id !== supplierId)
        );
    };

    const handleNewSupplier = () => {
        // Navigate to new supplier page
        window.location.href = "/catalogos/proveedores/nuevo";
    };

    const existingSupplierIds = (formState.suppliers || []).map((s) => s.supplierId);

    return (
        <Box>
            <Section>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                    <Box>
                        <SectionTitle>Proveedores</SectionTitle>
                        <SectionDescription>
                            Configura los proveedores que aplicará con este Promoción.
                        </SectionDescription>
                    </Box>
                    <AddButton
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={handleOpenModal}
                    >
                        Agregar
                    </AddButton>
                </Box>

                {formState.suppliers && formState.suppliers.length > 0 && (
                    <SummaryText>
                        {formState.suppliers.length} proveedores agregados
                    </SummaryText>
                )}

                {formState.suppliers && formState.suppliers.length > 0 ? (
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
                                {formState.suppliers.map((supplier) => (
                                    <SupplierTableRow key={supplier.id}>
                                        <SupplierTableCell>{supplier.supplierId}</SupplierTableCell>
                                        <SupplierTableCell>{supplier.supplierName}</SupplierTableCell>
                                        <SupplierTableCell align="right">
                                            <RemoveButton
                                                onClick={() => handleRemoveSupplier(supplier.id)}
                                            >
                                                Remover
                                            </RemoveButton>
                                        </SupplierTableCell>
                                    </SupplierTableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </SupplierTableContainer>
                ) : (
                    <Box sx={{ py: 4, textAlign: "center", color: "text.secondary" }}>
                        No hay proveedores agregados
                    </Box>
                )}
            </Section>

            <AddSupplierModal
                open={modalOpen}
                onClose={handleCloseModal}
                onAddSupplier={handleAddSupplier}
                onNewSupplier={handleNewSupplier}
                loading={saving}
                availableSuppliers={MOCK_SUPPLIERS_FOR_SELECTION}
                existingSupplierIds={existingSupplierIds}
            />
        </Box>
    );
}
