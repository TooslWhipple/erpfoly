import { useState } from "react";
import { Box } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import {
    Section,
    SectionTitle,
    SectionDescription,
    EmptyStateContainer,
    EmptyStateText,
    SaveButton,
} from "@/styles/catalogos/productos.styles";
import { AddSupplierModal } from "./AddSupplierModal";
import type { ProductSupplier } from "@/types/productos.types";
import type { SupplierForSelection } from "@/data/productos.mockData";

// ============================================================================
// TYPES
// ============================================================================

interface SuppliersTabProps {
    suppliers: ProductSupplier[];
    availableSuppliers: SupplierForSelection[];
    onAddSupplier: (supplierId: number) => Promise<void>;
    onNewSupplier?: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

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
            <Section>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                    <Box>
                        <SectionTitle>Proveedores</SectionTitle>
                        <SectionDescription>
                            Agrega los proveedores para este artículo
                        </SectionDescription>
                    </Box>
                    <SaveButton
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={handleOpenModal}
                    >
                        Agregar proveedor
                    </SaveButton>
                </Box>
                {suppliers.length === 0 ? (
                    <EmptyStateContainer>
                        <EmptyStateText>
                            No tienes proveedores asignados para este artículo.
                        </EmptyStateText>
                    </EmptyStateContainer>
                ) : (
                    <Box>
                        {/* Lista de proveedores - implementar cuando se necesite mostrar */}
                    </Box>
                )}
            </Section>

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
