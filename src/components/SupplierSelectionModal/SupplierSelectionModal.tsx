import { useState, useEffect, useMemo } from "react";
import { Dialog, Box, InputAdornment, Button, CircularProgress, Typography } from "@mui/material";
import { Search as SearchIcon, Close as CloseIcon } from "@mui/icons-material";
import type { Supplier } from "@/types/pedidos.types";
import { getSuppliers } from "@/data/pedidos.mockData";
import {
    StyledDialogContent,
    ModalHeader,
    ModalTitle,
    ModalDescription,
    CloseButton,
} from "@/components/ModalForm/styles";
import {
    SupplierModalContainer,
    SearchInput,
    SuppliersList,
    SupplierRow,
    SupplierId,
    SupplierName,
    SelectButton,
} from "./styles";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface SupplierSelectionModalProps {
    open: boolean;
    onClose: () => void;
    onSelect: (supplier: Supplier) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function SupplierSelectionModal({
    open,
    onClose,
    onSelect,
}: SupplierSelectionModalProps) {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch suppliers when modal opens
    useEffect(() => {
        if (open) {
            fetchSuppliers();
        } else {
            // Reset search when modal closes
            setSearchQuery("");
        }
    }, [open]);

    // Filter suppliers based on search query
    const filteredSuppliers = useMemo(() => {
        if (!searchQuery.trim()) {
            return suppliers;
        }
        const query = searchQuery.toLowerCase();
        return suppliers.filter(
            (supplier) =>
                supplier.name.toLowerCase().includes(query) ||
                supplier.id.includes(query)
        );
    }, [suppliers, searchQuery]);

    const fetchSuppliers = async () => {
        setLoading(true);
        try {
            const data = await getSuppliers();
            setSuppliers(data);
        } catch (error) {
            console.error("[SupplierSelectionModal] Error fetching suppliers:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    const handleSelect = (supplier: Supplier) => {
        onSelect(supplier);
        onClose();
    };

    const handleClose = () => {
        if (!loading) {
            onClose();
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    maxHeight: "90vh",
                },
            }}
        >
            <StyledDialogContent>
                <ModalHeader>
                    <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
                        <ModalTitle>Proveedores</ModalTitle>
                        <ModalDescription>
                            Selecciona un proveedor para continuar con el pedido
                        </ModalDescription>
                    </Box>
                    <CloseButton onClick={handleClose} disabled={loading} size="small">
                        <CloseIcon />
                    </CloseButton>
                </ModalHeader>

                <SupplierModalContainer>
                    <SearchInput
                        placeholder="Buscar"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        size="small"
                        fullWidth
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: "#71717A", fontSize: 20 }} />
                                </InputAdornment>
                            ),
                        }}
                    />

                    {loading ? (
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
                    ) : filteredSuppliers.length === 0 ? (
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
                    ) : (
                        <SuppliersList>
                            {filteredSuppliers.map((supplier, index) => (
                                <SupplierRow index={index} key={supplier.id}>
                                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                                        <SupplierId>{supplier.id}</SupplierId>
                                        <SupplierName>{supplier.name}</SupplierName>
                                    </Box>
                                    <Button
                                        color="primary"
                                        onClick={() => handleSelect(supplier)}
                                    >
                                        Seleccionar
                                    </Button>
                                </SupplierRow>
                            ))}
                        </SuppliersList>
                    )}
                </SupplierModalContainer>
            </StyledDialogContent>
        </Dialog>
    );
}
