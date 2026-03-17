import { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { EmptyStateContainer } from "@/styles/catalogos/productos.styles";
import { AddSupplierModal } from "./AddSupplierModal";
import type { ProductSupplier } from "@/types/productos.types";
import type { SupplierForSelection } from "@/data/productos.mockData";

interface SuppliersTabProps {
    suppliers: ProductSupplier[];
    availableSuppliers: SupplierForSelection[];
    onAddSupplier: (supplierId: number) => Promise<void>;
    onNewSupplier?: () => void;
}

export function SuppliersTab({
    suppliers,
    availableSuppliers,
    onAddSupplier,
    onNewSupplier,
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
            await onAddSupplier(supplierId);
            handleCloseModal();
        } finally {
            setSaving(false);
        }
    };

    const existingSupplierIds = suppliers.map((s) => s.supplierId);

    return (
        <>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                <Box>
                    <Typography variant="h6">Proveedores</Typography>
                    <Typography variant="body1">
                        Agrega los proveedores para este artículo
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleOpenModal}
                >
                    Agregar proveedor
                </Button>
            </Box>
            {suppliers.length === 0 ? (
                <EmptyStateContainer>
                    <Typography variant="body1">
                        No tienes proveedores asignados para este artículo.
                    </Typography>
                </EmptyStateContainer>
            ) : (
                <Box>
                </Box>
            )}

            <AddSupplierModal
                open={modalOpen}
                onClose={handleCloseModal}
                onAddSupplier={handleAddSupplier}
                onNewSupplier={onNewSupplier}
                loading={saving}
                availableSuppliers={availableSuppliers}
                existingSupplierIds={existingSupplierIds}
            />
        </>
    );
}
