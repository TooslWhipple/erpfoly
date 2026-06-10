"use client";

import { useEffect, useMemo, useState } from "react";
import {
    InputAdornment,
    Button,
    CircularProgress,
    Typography,
    useTheme,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import type { Supplier } from "@/types/pedidos.types";
import { unwrapOrThrow } from "@/lib/axios";
import { SideModal } from "@/components/SideModal";
import {
    SUPPLIER_SEARCH_DEFAULT_LIMIT,
    searchSuppliers,
    type SupplierSearchItem,
} from "@/services/suppliers.service";
import {
    SearchInput,
    Card
} from "./styles";
import { Search } from "lucide-react";

function mapSearchItemToSupplier(item: SupplierSearchItem): Supplier {
    const displayName =
        item.businessName != null && item.businessName.trim().length > 0
            ? `${item.name} - ${item.businessName.trim()}`
            : item.name;
    return {
        id: String(item.id),
        name: displayName,
    };
}

export interface SupplierSelectionModalProps {
    open: boolean;
    onClose: () => void;
    onSelect: (supplier: Supplier) => void;
}

export function SupplierSelectionModal({
    open,
    onClose,
    onSelect,
}: SupplierSelectionModalProps) {
    const theme = useTheme();
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (!open) {
            setSearchQuery("");
        }
    }, [open]);

    const {
        data: searchRows,
        isFetching,
        isPending,
        isError,
    } = useQuery({
        queryKey: ["suppliers-search", "modal-open", SUPPLIER_SEARCH_DEFAULT_LIMIT],
        queryFn: async () =>
            unwrapOrThrow(
                await searchSuppliers({
                    q: "",
                    limit: SUPPLIER_SEARCH_DEFAULT_LIMIT,
                }),
            ),
        enabled: open,
        staleTime: 30_000,
    });

    const allSuppliers = useMemo(
        () => (searchRows ?? []).map(mapSearchItemToSupplier),
        [searchRows],
    );

    const filteredSuppliers = useMemo(() => {
        const trimmed = searchQuery.trim();
        if (!trimmed) {
            return allSuppliers;
        }
        const q = trimmed.toLowerCase();
        return allSuppliers.filter(
            (supplier) =>
                supplier.name.toLowerCase().includes(q) || supplier.id.toLowerCase().includes(q),
        );
    }, [allSuppliers, searchQuery]);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    const handleSelect = (supplier: Supplier) => {
        onSelect(supplier);
        onClose();
    };

    const handleClose = () => {
        if (!isFetching) {
            onClose();
        }
    };

    const showInitialLoading = open && (isPending || (isFetching && searchRows === undefined));

    return (
        <SideModal
            open={open}
            onClose={handleClose}
            title="Proveedores"
            description="Selecciona un proveedor para continuar con el pedido"
            maxWidth="md"
            disableClose={isFetching && searchRows === undefined}
            contentSx={{ flex: 1, minHeight: 0 }}
        >
            <SearchInput
                placeholder="Buscar"
                value={searchQuery}
                onChange={handleSearchChange}
                size="small"
                fullWidth
                disabled={showInitialLoading || isError}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Search size={18} color={theme.palette.text.secondary} />
                        </InputAdornment>
                    ),
                }}
            />
            <Card>
                {showInitialLoading ? (
                    <CircularProgress size={24} />
                ) : filteredSuppliers.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                        No se encontraron proveedores
                    </Typography>
                ) : (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell style={{ padding: "12px 8px", color: theme.palette.text.secondary }}>ID</TableCell>
                                <TableCell style={{ padding: "12px 8px", color: theme.palette.text.secondary }}>Proveedor</TableCell>
                                <TableCell style={{ padding: "12px 8px" }}></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                filteredSuppliers.map((supplier) => (
                                    <TableRow key={supplier.id}>
                                        <TableCell style={{ padding: "12px 8px", color: theme.palette.text.secondary }}>{supplier.id}</TableCell>
                                        <TableCell style={{ padding: "12px 8px" }}>{supplier.name}</TableCell>
                                        <TableCell style={{ padding: "12px 8px" }}>
                                            <Button color="primary" onClick={() => handleSelect(supplier)}>
                                                Seleccionar
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            }
                        </TableBody>
                    </Table>
                )}
            </Card>
        </SideModal>
    );
}
