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
import { AddPackageModal } from "./AddPackageModal";
import type { PackageFormData, SelectableItem } from "@/types/productos.types";
import type { ArticleForPackage } from "@/data/productos.mockData";

// ============================================================================
// TYPES
// ============================================================================

interface PackagesTabProps {
    packages: unknown[];
    availableArticles: ArticleForPackage[];
    availableBranches: SelectableItem[];
    onAddPackage: (data: PackageFormData) => Promise<void>;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function PackagesTab({
    packages,
    availableArticles,
    availableBranches,
    onAddPackage,
}: PackagesTabProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleOpenModal = () => {
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    const handleSave = async (data: PackageFormData) => {
        setSaving(true);
        try {
            await onAddPackage(data);
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <Section>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                    <Box>
                        <SectionTitle>Paquetes</SectionTitle>
                        <SectionDescription>
                            Configura los artículos que se podrán vender como paquete junto con este producto
                        </SectionDescription>
                    </Box>
                    <SaveButton
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={handleOpenModal}
                    >
                        Agregar paquete
                    </SaveButton>
                </Box>
                {packages.length === 0 ? (
                    <EmptyStateContainer>
                        <EmptyStateText>
                            No hay paquetes agregados
                        </EmptyStateText>
                    </EmptyStateContainer>
                ) : (
                    <Box>
                        {/* Lista de paquetes - implementar cuando se necesite mostrar */}
                    </Box>
                )}
            </Section>

            <AddPackageModal
                open={modalOpen}
                onClose={handleCloseModal}
                onSave={handleSave}
                loading={saving}
                availableArticles={availableArticles}
                availableBranches={availableBranches}
            />
        </>
    );
}
