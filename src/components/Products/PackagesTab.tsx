import { useState } from "react";
import { Button, Divider, Stack, Typography } from "@mui/material";
import numeral from "numeral";
import { Plus, Trash2, Wrench } from "lucide-react";
import {
    EmptyStateContainer,
    FormCard,
    PackageDeleteButton,
    PackageRowCard,
    PackageRowIconBox,
    PackageRowMain,
    PackageStatusBadge,
} from "@/styles/catalogos/productos.styles";
import { AddPackageModal } from "./AddPackageModal";
import type { PackageFormData, ProductPackage, SelectableItem } from "@/types/productos.types";

interface PackagesTabProps {
    packages: ProductPackage[];
    availableBranches: SelectableItem[];
    excludeProductId?: number;
    onAddPackage: (data: PackageFormData) => Promise<void>;
    onRemovePackage: (packageId: string) => void;
}

function getPackageDisplayTitle(pkg: ProductPackage): string {
    if (pkg.type === "service" && pkg.serviceName?.trim()) {
        return pkg.serviceName.trim();
    }
    if (pkg.type === "article" && pkg.articleName?.trim()) {
        return pkg.articleName.trim();
    }
    return pkg.type === "service" ? "Servicio" : "Artículo";
}

function formatPackageSecondaryLine(pkg: ProductPackage): string {
    const qtyLabel = `Cantidad: ${pkg.quantity}`;
    const isFree = pkg.packagePrice <= 0;
    const priceLabel = isFree ? "Gratis" : numeral(pkg.packagePrice).format("$0,0.00");
    return `${qtyLabel} | ${priceLabel}`;
}

function shouldShowComplimentaryBadge(pkg: ProductPackage): boolean {
    return pkg.packagePrice <= 0;
}

export function PackagesTab({
    packages,
    availableBranches,
    excludeProductId,
    onAddPackage,
    onRemovePackage,
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
            <FormCard>
                <Stack
                    direction={{ xs: "column", md: "row" }}
                    justifyContent={{ xs: "flex-start", md: "space-between" }}
                    alignItems={{ xs: "stretch", md: "center" }}
                    spacing={2}
                >
                    <Stack spacing={0.5}>
                        <Typography variant="h6" fontWeight={600}>
                            Paquetes
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Configura los artículos que se podrán vender como paquete junto con este artículo
                        </Typography>
                    </Stack>
                    <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<Plus size={16} strokeWidth={2} />}
                        sx={{ minWidth: { md: 176 }, alignSelf: { xs: "stretch", md: "center" } }}
                        onClick={handleOpenModal}
                    >
                        Agregar paquete
                    </Button>
                </Stack>
                <Divider />
                {packages.length === 0 ? (
                    <EmptyStateContainer>
                        <Typography variant="body2" color="text.secondary">
                            No hay paquetes agregados
                        </Typography>
                    </EmptyStateContainer>
                ) : (
                    <Stack spacing={1.5}>
                        {
                            packages.map((item) => (
                                <PackageRowCard key={item.id}>
                                    <PackageRowIconBox>
                                        <Wrench size={22} strokeWidth={2} />
                                    </PackageRowIconBox>
                                    <Stack flex="1" minWidth="200px">
                                        <Typography variant="subtitle1" fontWeight={600}>{getPackageDisplayTitle(item)}</Typography>
                                        <Typography variant="body2" color="text.secondary">{formatPackageSecondaryLine(item)}</Typography>
                                    </Stack>
                                    {
                                        shouldShowComplimentaryBadge(item) &&
                                        <PackageStatusBadge>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary">
                                                Se entrega gratis con el artículo
                                            </Typography>
                                        </PackageStatusBadge>
                                    }
                                    <PackageDeleteButton
                                        type="button"
                                        onClick={() => onRemovePackage(item.id)}>
                                        <Trash2 size={16} strokeWidth={2} />
                                    </PackageDeleteButton>
                                </PackageRowCard>
                            ))
                        }
                    </Stack>
                )}
            </FormCard>

            <AddPackageModal
                open={modalOpen}
                onClose={handleCloseModal}
                onSave={handleSave}
                loading={saving}
                availableBranches={availableBranches}
                excludeProductId={excludeProductId}
            />
        </>
    );
}
