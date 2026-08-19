import { useState } from "react";
import { useRouter } from "next/router";
import { Button, Stack, Typography, Table, TableBody, TableHead, TableRow } from "@mui/material";
import { FormTextField } from "@/components";
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
    onSetPrimarySupplier?: (supplierRowId: string) => void;
    onSupplierProductCodeChange?: (supplierRowId: string, supplierProductCode: string) => void;
    onNewSupplier?: () => void;
    error?: string;
    readOnly?: boolean;
}

export function SuppliersTab({
    suppliers,
    availableSuppliers,
    onAddSupplier,
    onRemoveSupplier,
    onSetPrimarySupplier,
    onSupplierProductCodeChange,
    onNewSupplier,
    error,
    readOnly = false,
}: SuppliersTabProps) {
    const router = useRouter();
    const [modalOpen, setModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleNewSupplier = () => {
        if (onNewSupplier) {
            onNewSupplier();
            return;
        }
        router.push("/catalogos/proveedores/nuevo");
    };

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
                    {!readOnly && (
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
                    )}
                </Stack>

                {error && (
                    <Typography variant="body2" color="error">
                        {error}
                    </Typography>
                )}

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
                                    <SupplierAssignedHeaderCell sx={{ width: "10%" }}>
                                        ID
                                    </SupplierAssignedHeaderCell>
                                    <SupplierAssignedHeaderCell sx={{ width: "32%" }}>
                                        Proveedor
                                    </SupplierAssignedHeaderCell>
                                    <SupplierAssignedHeaderCell sx={{ width: "22%" }}>
                                        Código proveedor
                                    </SupplierAssignedHeaderCell>
                                    <SupplierAssignedHeaderCell sx={{ width: "22%" }}>
                                        Estatus
                                    </SupplierAssignedHeaderCell>
                                    {!readOnly && (
                                        <SupplierAssignedHeaderCell
                                            align="right"
                                            sx={{ width: "14%" }}
                                            aria-label="Acciones"
                                        />
                                    )}
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
                                            <FormTextField
                                                placeholder="SKU proveedor"
                                                value={row.supplierProductCode ?? ""}
                                                onChange={(e) =>
                                                    onSupplierProductCodeChange?.(row.id, e.target.value)
                                                }
                                                disabled={readOnly}
                                                inputProps={{ maxLength: 128 }}
                                            />
                                        </SupplierAssignedBodyCell>
                                        <SupplierAssignedBodyCell>
                                            {row.isDefault ? (
                                                <SupplierPrimaryBadge>Principal</SupplierPrimaryBadge>
                                            ) : readOnly ? (
                                                <Typography variant="body2" color="text.secondary">
                                                    —
                                                </Typography>
                                            ) : (
                                                <Button
                                                    type="button"
                                                    variant="text"
                                                    size="small"
                                                    onClick={() => onSetPrimarySupplier?.(row.id)}
                                                >
                                                    Marcar principal
                                                </Button>
                                            )}
                                        </SupplierAssignedBodyCell>
                                        {!readOnly && (
                                            <SupplierAssignedBodyCell align="right">
                                                <SupplierRemoveIconButton
                                                    size="small"
                                                    aria-label="Quitar proveedor"
                                                    onClick={() => onRemoveSupplier(row.id)}
                                                >
                                                    <Minus size={16} strokeWidth={2} />
                                                </SupplierRemoveIconButton>
                                            </SupplierAssignedBodyCell>
                                        )}
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
                onNewSupplier={handleNewSupplier}
                loading={saving}
                availableSuppliers={availableSuppliers}
                existingSupplierIds={existingSupplierIds}
            />
        </>
    );
}
