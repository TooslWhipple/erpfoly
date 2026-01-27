import { useState, useEffect } from "react";
import { Dialog, Box, Typography, Button, TextField, InputAdornment } from "@mui/material";
import { Close as CloseIcon, ArrowUpward as ArrowUpIcon } from "@mui/icons-material";
import numeral from "numeral";
import type { Article, OrderItem } from "@/types/pedidos.types";
import {
    StyledDialogContent,
    ModalHeader,
    ModalTitle,
    CloseButton,
} from "@/components/ModalForm/styles";
import {
    AddArticleModalContainer,
    ProductInfo,
    ProductImage,
    CostInputSection,
    HistorySection,
    HistoryTimeline,
    TimelineLine,
    TimelineItem,
    TimelineDot,
    TimelineContent,
    TimelineChange,
    TimelineOrderLink,
} from "./styles";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CostHistoryEntry {
    id: string;
    date: string;
    price: number;
    changePercentage: number;
    orderId?: string;
}

export interface AddArticleToOrderModalProps {
    open: boolean;
    onClose: () => void;
    article: Article | null;
    onAddToOrder: (item: OrderItem) => void;
    costHistory?: CostHistoryEntry[];
}

// ============================================================================
// HELPERS
// ============================================================================

function formatCurrency(amount: number): string {
    return numeral(amount).format("$0,0.00");
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-MX", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

// ============================================================================
// COMPONENT
// ============================================================================

export function AddArticleToOrderModal({
    open,
    onClose,
    article,
    onAddToOrder,
    costHistory = [],
}: AddArticleToOrderModalProps) {
    const [unitPrice, setUnitPrice] = useState<number>(0);

    // Set default price from last history entry or article
    useEffect(() => {
        if (article && open) {
            if (costHistory.length > 0) {
                setUnitPrice(costHistory[0].price);
            } else {
                setUnitPrice(0);
            }
        }
    }, [article, open, costHistory]);

    const handleClose = () => {
        setUnitPrice(0);
        onClose();
    };

    const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value;
        // Allow empty string, numbers, and decimal
        if (inputValue === "" || /^\d*\.?\d*$/.test(inputValue)) {
            const numValue = parseFloat(inputValue) || 0;
            setUnitPrice(numValue);
        }
    };

    const handleAddToOrder = () => {
        if (!article || unitPrice <= 0) {
            return;
        }

        const newItem: OrderItem = {
            articleId: article.id,
            articleName: article.name,
            folio: article.folio,
            quantity: 1,
            unitPrice,
            totalPrice: unitPrice,
        };

        onAddToOrder(newItem);
        handleClose();
    };

    if (!article) {
        return null;
    }

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
                        <ModalTitle>Agregar artículo al pedido</ModalTitle>
                    </Box>
                    <CloseButton onClick={handleClose} size="small">
                        <CloseIcon />
                    </CloseButton>
                </ModalHeader>

                <AddArticleModalContainer>
                    <ProductInfo>
                        <ProductImage />
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                            <Typography variant="h5" sx={{ lineHeight: 1.4 }}>
                                {article.name}
                            </Typography>
                            <Typography variant="caption">
                                {article.folio}
                            </Typography>
                        </Box>
                    </ProductInfo>

                    <CostInputSection>
                        <TextField
                            fullWidth
                            variant="outlined"
                            size="medium"
                            type="text"
                            value={unitPrice === 0 ? "" : unitPrice.toString()}
                            onChange={handlePriceChange}
                            placeholder="0.00"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Box component="span" sx={{ color: "text.secondary" }}>
                                            $
                                        </Box>
                                    </InputAdornment>
                                ),
                            }}
                            inputProps={{
                                inputMode: "decimal",
                            }}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleAddToOrder}
                            disabled={unitPrice <= 0}
                            sx={{
                                textTransform: "none",
                                fontWeight: 600,
                                borderRadius: 1.5,
                                padding: (theme) => theme.spacing(1.25, 2.5),
                                whiteSpace: "nowrap",
                            }}
                        >
                            Agregar
                        </Button>
                    </CostInputSection>

                    <HistorySection>
                        <Typography variant="h6">
                            Historial de costos de este artículo
                        </Typography>
                        <HistoryTimeline>
                            <TimelineLine />
                            {costHistory.map((entry) => (
                                <TimelineItem key={entry.id}>
                                    <TimelineDot />
                                    <TimelineContent>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%" }}>
                                            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, flex: 1 }}>
                                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
                                                    <Typography variant="body2" sx={{ color: "#71717A" }}>
                                                        {formatDate(entry.date)}
                                                    </Typography>
                                                    {entry.orderId && (
                                                        <TimelineOrderLink href={`/pedidos/${entry.orderId}`}>
                                                            Pedido {entry.orderId}
                                                        </TimelineOrderLink>
                                                    )}
                                                </Box>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                                                    <Typography variant="h5" sx={{ lineHeight: 1.2 }}>
                                                        {formatCurrency(entry.price)}
                                                    </Typography>
                                                    <TimelineChange>
                                                        <ArrowUpIcon sx={{ fontSize: 14 }} />
                                                        {numeral(entry.changePercentage).format("0.00")}%
                                                    </TimelineChange>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </TimelineContent>
                                </TimelineItem>
                            ))}
                        </HistoryTimeline>
                    </HistorySection>
                </AddArticleModalContainer>
            </StyledDialogContent>
        </Dialog>
    );
}
