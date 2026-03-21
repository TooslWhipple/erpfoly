import { useState } from "react";
import { Button, Stack, Typography } from "@mui/material";
import { EmptyStateContainer, FormCard } from "@/styles/catalogos/productos.styles";
import { AddSupplierModal } from "./AddSupplierModal";
import type { ProductSupplier } from "@/types/productos.types";
import type { SupplierForSelection } from "@/data/productos.mockData";
import { Plus } from "lucide-react";

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
            <FormCard>
                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent={{ xs: "flex-start", md: "space-between" }} alignItems="center">
                    <Stack spacing={0.5}>
                        <Typography variant="h6">Proveedores</Typography>
                        <Typography variant="body2" color="text.secondary">Agrega los proveedores para este artículo</Typography>
                    </Stack>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Plus size={12} />}
                        onClick={handleOpenModal}>
                        Agregar proveedor
                    </Button>
                </Stack>

                {
                    suppliers.length === 0 &&
                    <EmptyStateContainer>
                        <Typography variant="body1">No tienes proveedores asignados para este artículo.</Typography>
                    </EmptyStateContainer>
                }
            </FormCard>

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
