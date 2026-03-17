import { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { EmptyStateContainer } from "@/styles/catalogos/productos.styles";
import { AddPackageModal } from "./AddPackageModal";
import type { PackageFormData, SelectableItem } from "@/types/productos.types";
import type { ArticleForPackage } from "@/data/productos.mockData";

interface PackagesTabProps {
    packages: unknown[];
    availableArticles: ArticleForPackage[];
    availableBranches: SelectableItem[];
    onAddPackage: (data: PackageFormData) => Promise<void>;
}

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
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                <Box>
                    <Typography variant="h6">Paquetes</Typography>
                    <Typography variant="body1">
                        Configura los artículos que se podrán vender como paquete junto con este producto
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleOpenModal}>
                    Agregar paquete
                </Button>
            </Box>
            {packages.length === 0 ? (
                <EmptyStateContainer>
                    <Typography variant="body1">
                        No hay paquetes agregados
                    </Typography>
                </EmptyStateContainer>
            ) : (
                <Box>
                    {/* Lista de paquetes - implementar cuando se necesite mostrar */}
                </Box>
            )}

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
