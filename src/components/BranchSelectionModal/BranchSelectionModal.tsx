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
import { SideModal } from "@/components/SideModal";
import { getBranchesCatalog, type BranchCatalogItem } from "@/services/branches.service";
import { SearchInput, Card } from "./styles";
import { Search } from "lucide-react";

export interface BranchSelectionModalProps {
    open: boolean;
    onClose: () => void;
    onSelect: (branch: BranchCatalogItem) => void;
}

export function BranchSelectionModal({
    open,
    onClose,
    onSelect,
}: BranchSelectionModalProps) {
    const theme = useTheme();
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (!open) {
            setSearchQuery("");
        }
    }, [open]);

    const {
        data: branches,
        isFetching,
        isPending,
        isError,
    } = useQuery({
        queryKey: ["branches-catalog"],
        queryFn: async () => await getBranchesCatalog(),
        enabled: open,
        staleTime: 60_000,
    });

    const filteredBranches = useMemo(() => {
        const trimmed = searchQuery.trim();
        const available = (branches ?? []).filter((b) => !b.is_main_warehouse);
        if (!trimmed) {
            return available;
        }
        const q = trimmed.toLowerCase();
        return available.filter(
            (branch) =>
                branch.name.toLowerCase().includes(q) || String(branch.id).includes(q),
        );
    }, [branches, searchQuery]);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    const handleSelect = (branch: BranchCatalogItem) => {
        onSelect(branch);
        onClose();
    };

    const handleClose = () => {
        if (!isFetching) {
            onClose();
        }
    };

    const showInitialLoading = open && (isPending || (isFetching && branches === undefined));

    return (
        <SideModal
            open={open}
            onClose={handleClose}
            title="Sucursales"
            description="Selecciona una sucursal para continuar con el pedido"
            maxWidth="md"
            disableClose={isFetching && branches === undefined}
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
                ) : filteredBranches.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                        No se encontraron sucursales
                    </Typography>
                ) : (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell style={{ padding: "12px 8px", color: theme.palette.text.secondary }}>ID</TableCell>
                                <TableCell style={{ padding: "12px 8px", color: theme.palette.text.secondary }}>Sucursal</TableCell>
                                <TableCell style={{ padding: "12px 8px" }}></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredBranches.map((branch) => (
                                <TableRow key={branch.id}>
                                    <TableCell style={{ padding: "12px 8px", color: theme.palette.text.secondary }}>{branch.id}</TableCell>
                                    <TableCell style={{ padding: "12px 8px" }}>{branch.name}</TableCell>
                                    <TableCell style={{ padding: "12px 8px" }}>
                                        <Button color="primary" onClick={() => handleSelect(branch)}>
                                            Seleccionar
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </Card>
        </SideModal>
    );
}
