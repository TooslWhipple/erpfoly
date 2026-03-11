import { useState, useEffect, useMemo } from "react";
import {
    Dialog,
    Box,
    CircularProgress,
    Table,
    TableBody,
    TableHead,
    TableRow,
    Checkbox,
    Typography,
    Skeleton,
    TextField,
    InputAdornment,
} from "@mui/material";
import { Close as CloseIcon, Search as SearchIcon } from "@mui/icons-material";
import numeral from "numeral";
import type { OrderToReceive } from "@/types/recepcion-mercancias.types";
import {
    DialogContent,
    ModalHeader,
    ModalTitle,
    CloseButton,
    ModalActions,
    ConfirmButton,
    TableContainer,
    StyledTableRow,
    StyledTableCell,
    EmptyStateContainer,
    SearchInput,
} from "./styles";

interface ReceptionOrdersModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (orderIds: string[]) => void | Promise<void>;
    loading?: boolean;
}

const DUMMY_ORDERS_TO_RECEIVE: OrderToReceive[] = [
    {
        id: "19988",
        sku: "19988",
        supplier: "Mabe S.A. de C.V.",
        deliveryDate: "2024-07-22",
        total: 398390.60,
    },
    {
        id: "19722",
        sku: "19722",
        supplier: "Mabe S.A. de C.V.",
        deliveryDate: "2024-07-22",
        total: 398390.60,
    },
    {
        id: "12345",
        sku: "12345",
        supplier: "Mabe S.A. de C.V.",
        deliveryDate: "2024-07-22",
        total: 398390.60,
    },
    {
        id: "12346",
        sku: "12346",
        supplier: "Mirage - Norage S.A. De C.V.",
        deliveryDate: "2024-07-25",
        total: 245890.75,
    },
    {
        id: "12347",
        sku: "12347",
        supplier: "Electrodomésticos Premium",
        deliveryDate: "2024-07-28",
        total: 567890.00,
    },
    {
        id: "12348",
        sku: "12348",
        supplier: "Distribuidora Hogar Feliz",
        deliveryDate: "2024-08-01",
        total: 189450.25,
    },
];

async function getOrdersToReceive(): Promise<OrderToReceive[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return DUMMY_ORDERS_TO_RECEIVE;
}

function formatDeliveryDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-MX", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

export function ReceptionOrdersModal({
    open,
    onClose,
    onConfirm,
    loading = false,
}: ReceptionOrdersModalProps) {
    const [orders, setOrders] = useState<OrderToReceive[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (open) {
            setLoadingOrders(true);
            setSelectedOrderIds(new Set());
            setSearchQuery("");
            getOrdersToReceive()
                .then((data) => {
                    setOrders(data);
                })
                .catch((err) => {
                    console.error("[ReceptionOrdersModal] Error fetching orders:", err);
                })
                .finally(() => {
                    setLoadingOrders(false);
                });
        } else {
            setSelectedOrderIds(new Set());
            setSearchQuery("");
        }
    }, [open]);

    const filteredOrders = useMemo(() => {
        if (!searchQuery.trim()) {
            return orders;
        }
        const query = searchQuery.toLowerCase();
        return orders.filter(
            (order) =>
                order.sku.toLowerCase().includes(query) ||
                order.supplier.toLowerCase().includes(query)
        );
    }, [orders, searchQuery]);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const allFilteredIds = new Set(filteredOrders.map((order) => order.id));
            setSelectedOrderIds(allFilteredIds);
        } else {
            const newSelection = new Set(selectedOrderIds);
            filteredOrders.forEach((order) => {
                newSelection.delete(order.id);
            });
            setSelectedOrderIds(newSelection);
        }
    };

    const handleSelectOrder = (orderId: string) => {
        const newSelection = new Set(selectedOrderIds);
        if (newSelection.has(orderId)) {
            newSelection.delete(orderId);
        } else {
            newSelection.add(orderId);
        }
        setSelectedOrderIds(newSelection);
    };

    const isAllSelected =
        filteredOrders.length > 0 &&
        filteredOrders.every((order) => selectedOrderIds.has(order.id));
    const isIndeterminate =
        filteredOrders.some((order) => selectedOrderIds.has(order.id)) &&
        !isAllSelected;

    const handleConfirm = async () => {
        if (selectedOrderIds.size > 0) {
            await onConfirm(Array.from(selectedOrderIds));
        }
    };

    const handleClose = () => {
        if (!loading && !loadingOrders) {
            onClose();
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    maxHeight: "90vh",
                },
            }}
        >
            <DialogContent>
                <ModalHeader>
                    <ModalTitle>Pedidos por recibir</ModalTitle>
                    <CloseButton onClick={handleClose} disabled={loading || loadingOrders} size="small">
                        <CloseIcon />
                    </CloseButton>
                </ModalHeader>

                <SearchInput
                    placeholder="Buscar pedido"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    size="small"
                    fullWidth
                    disabled={loadingOrders}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: "#71717A", fontSize: 20 }} />
                            </InputAdornment>
                        ),
                    }}
                />

                <TableContainer>
                    {loadingOrders ? (
                        <Box sx={{ p: 2 }}>
                            {Array.from({ length: 5 }).map((_, index) => (
                                <Box key={index} sx={{ mb: 2 }}>
                                    <Skeleton variant="rectangular" height={40} />
                                </Box>
                            ))}
                        </Box>
                    ) : filteredOrders.length === 0 ? (
                        <EmptyStateContainer>
                            <Typography variant="body2" color="text.secondary">
                                {searchQuery
                                    ? "No se encontraron pedidos"
                                    : "No hay pedidos por recibir"}
                            </Typography>
                        </EmptyStateContainer>
                    ) : (
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <StyledTableCell padding="checkbox" sx={{ width: 48 }}>
                                        <Checkbox
                                            checked={isAllSelected}
                                            indeterminate={isIndeterminate}
                                            onChange={handleSelectAll}
                                            disabled={loading}
                                        />
                                    </StyledTableCell>
                                    <StyledTableCell>SKU</StyledTableCell>
                                    <StyledTableCell>Proveedor</StyledTableCell>
                                    <StyledTableCell>Fecha de entrega</StyledTableCell>
                                    <StyledTableCell>Total</StyledTableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredOrders.map((order) => {
                                    const isSelected = selectedOrderIds.has(order.id);
                                    return (
                                        <StyledTableRow key={order.id} selected={isSelected}>
                                            <StyledTableCell padding="checkbox">
                                                <Checkbox
                                                    checked={isSelected}
                                                    onChange={() => handleSelectOrder(order.id)}
                                                    disabled={loading}
                                                />
                                            </StyledTableCell>
                                            <StyledTableCell>{order.sku}</StyledTableCell>
                                            <StyledTableCell>{order.supplier}</StyledTableCell>
                                            <StyledTableCell>
                                                {formatDeliveryDate(order.deliveryDate)}
                                            </StyledTableCell>
                                            <StyledTableCell>
                                                {numeral(order.total).format("$0,0.00")}
                                            </StyledTableCell>
                                        </StyledTableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </TableContainer>

                <ModalActions>
                    <ConfirmButton
                        type="button"
                        variant="contained"
                        onClick={handleConfirm}
                        disabled={loading || loadingOrders || selectedOrderIds.size === 0}
                    >
                        {loading ? (
                            <CircularProgress size={20} color="inherit" />
                        ) : (
                            "Continuar"
                        )}
                    </ConfirmButton>
                </ModalActions>
            </DialogContent>
        </Dialog>
    );
}
