"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
    Box,
    InputAdornment,
    Button,
    CircularProgress,
    Typography,
    useTheme,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
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
    SupplierModalContainer,
    SearchInput,
    SuppliersList,
    SupplierRow,
    SupplierId,
    SupplierName,
} from "./styles";

function mapSearchItemToSupplier(item: SupplierSearchItem): Supplier {
    const displayName =
        item.businessName != null && item.businessName.trim().length > 0
            ? `${item.name} — ${item.businessName.trim()}`
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
        error,
        refetch,
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

    const errorMessage =
        isError && error instanceof Error ? error.message : "No se pudo cargar el listado.";

    const showInitialLoading = open && (isPending || (isFetching && searchRows === undefined));

    let listBody: ReactNode;

    if (showInitialLoading) {
        listBody = (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 4,
                }}
            >
                <CircularProgress size={24} />
            </Box>
        );
    } else if (isError) {
        listBody = (
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                    padding: 4,
                }}
            >
                <Typography variant="body2" color="error">
                    {errorMessage}
                </Typography>
                <Button variant="outlined" size="small" onClick={() => void refetch()}>
                    Reintentar
                </Button>
            </Box>
        );
    } else if (filteredSuppliers.length === 0) {
        listBody = (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 4,
                }}
            >
                <Typography variant="body2" color="text.secondary">
                    No se encontraron proveedores
                </Typography>
            </Box>
        );
    } else {
        listBody = (
            <SuppliersList>
                {
                    filteredSuppliers.map((supplier, index) => (
                        <SupplierRow index={index} key={supplier.id}>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                                <SupplierId>{supplier.id}</SupplierId>
                                <SupplierName>{supplier.name}</SupplierName>
                            </Box>
                            <Button color="primary" onClick={() => handleSelect(supplier)}>
                                Seleccionar
                            </Button>
                        </SupplierRow>
                    ))
                }
            </SuppliersList>
        );
    }

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
            <SupplierModalContainer sx={{ flex: 1, minHeight: 0 }}>
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
                                <SearchIcon
                                    sx={{ color: theme.palette.text.secondary, fontSize: 20 }}
                                />
                            </InputAdornment>
                        ),
                    }}
                />
                {
                    listBody
                }
            </SupplierModalContainer>
        </SideModal>
    );
}
