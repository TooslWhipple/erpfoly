"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
    Stack,
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
    TextField,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { SideModal } from "@/components/SideModal";
import { getBranchesCatalog, type BranchCatalogItem } from "@/services/branches.service";
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
        error,
        refetch,
    } = useQuery({
        queryKey: ["branches-catalog"],
        queryFn: async () => await getBranchesCatalog(),
        enabled: open,
        staleTime: 60_000,
    });

    const filteredBranches = useMemo(() => {
        const trimmed = searchQuery.trim();
        const available = (branches ?? []).filter((b: BranchCatalogItem) => !b.is_main_warehouse);
        if (!trimmed) return available;
        const q = trimmed.toLowerCase();
        return available.filter(
            (branch: BranchCatalogItem) =>
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

    const errorMessage =
        isError && error instanceof Error ? error.message : "No se pudo cargar el listado.";

    const showInitialLoading = open && (isPending || (isFetching && branches === undefined));

    let listBody: ReactNode;

    if (showInitialLoading) {
        listBody = (
            <Stack direction="row" justifyContent="center" alignItems="center" sx={{ padding: 4 }}>
                <CircularProgress size={24} />
            </Stack>
        );
    } else if (isError) {
        listBody = (
            <Stack direction="column" alignItems="center" spacing={2} sx={{ padding: 4 }}>
                <Typography variant="body2" color="error">{errorMessage}</Typography>
                <Button variant="outlined" size="small" onClick={() => void refetch()}>Reintentar</Button>
            </Stack>
        );
    } else if (filteredBranches.length === 0) {
        listBody = (
            <Stack direction="row" justifyContent="center" alignItems="center" sx={{ padding: 4 }}>
                <Typography variant="body2" color="text.secondary">No se encontraron sucursales</Typography>
            </Stack>
        );
    } else {
        listBody = (
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
                                <Button color="primary" onClick={() => handleSelect(branch)}>Seleccionar</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        );
    }

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
            <Stack spacing={2}>
                <TextField
                    placeholder="Buscar"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    fullWidth
                    size="small"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search size={18} color={theme.palette.text.secondary} />
                            </InputAdornment>
                        ),
                    }}
                />
                <Stack sx={{ border: `1px solid ${theme.palette.app.border}`, borderRadius: 2, padding: 2 }}>
                    {listBody}
                </Stack>
            </Stack>
        </SideModal>
    );
}
