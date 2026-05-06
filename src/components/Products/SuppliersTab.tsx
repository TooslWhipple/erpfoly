import { useState } from "react";
import { Button, Stack, Typography, Table, TableBody, TableHead, TableRow } from "@mui/material";
import {
    EmptyStateContainer,
    FormCard,
    SupplierAssignedTableWrap,
    SupplierAssignedHeaderCell,
    SupplierAssignedBodyCell,
    SupplierPrimaryBadge,
    SupplierRemoveIconButton,
} from "@/styles/catalogos/productos.styles";
import { AddSupplierModal } from "./AddSupplierModal";
import type { ProductSupplier } from "@/types/productos.types";
import type { SupplierCatalogItem } from "@/services/suppliers.service";
import { theme } from "@/styles/theme";
import { Minus, Plus } from "lucide-react";

function formatSupplierTableId(supplierId: number): string {
    return String(supplierId).padStart(5, "0");
}

function assignedSupplierDisplayName(
    row: ProductSupplier,
    catalog: SupplierCatalogItem[]
): string {
    const item = catalog.find((c) => c.id === row.supplierId);
    if (!item) {
        return row.supplierName;
    }
    const name = item.name?.trim() ?? "";
    const business = item.businessName?.trim() ?? "";
    if (name && business && name !== business) {
        return `${name} - ${business}`;
    }
    return business || name || row.supplierName;
}

interface SuppliersTabProps {
    suppliers: ProductSupplier[];
    availableSuppliers: SupplierCatalogItem[];
    onAddSupplier: (supplierId: number) => Promise<void>;
    onRemoveSupplier: (supplierRowId: string) => void;
    onNewSupplier?: () => void;
}

export function SuppliersTab({
    suppliers,
    availableSuppliers,
    onAddSupplier,
    onRemoveSupplier,
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
                <Stack spacing={2} direction={{ xs: "column", sm: "row" }} justifyContent={{ xs: "flex-start", sm: "space-between" }} alignItems="center">
                    <Stack spacing={0.5}>
                        <Typography variant="h6">Proveedores</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Agrega los proveedores para este artículo
                        </Typography>
                    </Stack>
                    <Button
                        sx={{
                            minWidth: { xs: "100%", sm: "176px" },
                        }}
                        variant="outlined"
                        startIcon={<Plus size={14} strokeWidth={2} />}
                        onClick={handleOpenModal}
                    >
                        Agregar proveedor
                    </Button>
                </Stack>

                {suppliers.length === 0 ? (
                    <EmptyStateContainer>
                        <Typography variant="body1">
                            No tienes proveedores asignados para este artículo.
                        </Typography>
                    </EmptyStateContainer>
                ) : (
                    <SupplierAssignedTableWrap>
                        <Table size="medium" sx={{ tableLayout: "fixed" }}>
                            <TableHead>
                                <TableRow>
                                    <SupplierAssignedHeaderCell sx={{ width: "12%" }}>
                                        ID
                                    </SupplierAssignedHeaderCell>
                                    <SupplierAssignedHeaderCell sx={{ width: "58%" }}>
                                        Proveedor
                                    </SupplierAssignedHeaderCell>
                                    <SupplierAssignedHeaderCell sx={{ width: "20%" }}>
                                        Estatus
                                    </SupplierAssignedHeaderCell>
                                    <SupplierAssignedHeaderCell
                                        align="right"
                                        sx={{ width: "10%" }}
                                        aria-label="Acciones"
                                    />
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {suppliers.map((row) => (
                                    <TableRow key={row.id}>
                                        <SupplierAssignedBodyCell>
                                            {formatSupplierTableId(row.supplierId)}
                                        </SupplierAssignedBodyCell>
                                        <SupplierAssignedBodyCell>
                                            {assignedSupplierDisplayName(row, availableSuppliers)}
                                        </SupplierAssignedBodyCell>
                                        <SupplierAssignedBodyCell>
                                            {row.isDefault ? (
                                                <SupplierPrimaryBadge>Principal</SupplierPrimaryBadge>
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    —
                                                </Typography>
                                            )}
                                        </SupplierAssignedBodyCell>
                                        <SupplierAssignedBodyCell align="right">
                                            <SupplierRemoveIconButton
                                                size="small"
                                                aria-label="Quitar proveedor"
                                                onClick={() => onRemoveSupplier(row.id)}
                                            >
                                                <Minus size={16} strokeWidth={2} />
                                            </SupplierRemoveIconButton>
                                        </SupplierAssignedBodyCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </SupplierAssignedTableWrap>
                )}
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
