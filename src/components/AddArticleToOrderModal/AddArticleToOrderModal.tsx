import { useState, useEffect } from "react";
import { Stack, Typography, Button, TextField, InputAdornment, Box } from "@mui/material";
import { ArrowUpward as ArrowUpIcon } from "@mui/icons-material";
import numeral from "numeral";
import type { Article, OrderItem } from "@/types/pedidos.types";
import { SideModal } from "@/components/SideModal";
import {
    AddArticleModalContainer,
    ProductImage,
    HistorySection,
    TimelineLine,
    TimelineItem,
    TimelineDot,
    TimelineContent,
    TimelineOrderLink,
    UnitPriceSection,
} from "./styles";

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

export function AddArticleToOrderModal({
    open,
    onClose,
    article,
    onAddToOrder,
    costHistory = [],
}: AddArticleToOrderModalProps) {
    const [unitPrice, setUnitPrice] = useState<number>(0);

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
        <SideModal
            fullWidth
            maxWidth="md"
            open={open}
            onClose={handleClose}
            headerContent={
                <Stack direction="row" alignItems="center" spacing={1}>
                    <ProductImage alt={article.name} />
                    <Stack direction="column" spacing={0.5}>
                        <Typography variant="h5">{article.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{article.folio}</Typography>
                    </Stack>
                </Stack>
            }
        >
            <AddArticleModalContainer>
                <Typography variant="h6">Historial de costos de este artículo.</Typography>

                <HistorySection>
                    <UnitPriceSection>
                        <TimelineDot style={{ top: "12px" }} />

                        <TextField
                            variant="outlined"
                            size="small"
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
                    </UnitPriceSection>

                    <TimelineLine />
                    {
                        costHistory.map((entry) => (
                            <TimelineItem key={entry.id}>
                                <TimelineDot />
                                <TimelineContent>
                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ width: "100%" }}>
                                        <Stack direction="column" spacing={0.5} sx={{ flex: 1 }}>
                                            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                                                <Typography variant="body2" color="text.secondary">
                                                    {formatDate(entry.date)}
                                                </Typography>
                                                {
                                                    entry.orderId && (
                                                        <TimelineOrderLink href={`/pedidos/${entry.orderId}`}>
                                                            Pedido {entry.orderId}
                                                        </TimelineOrderLink>
                                                    )
                                                }
                                            </Stack>
                                            <Stack direction="row" alignItems="center" spacing={1} sx={{ flexWrap: "wrap" }}>
                                                <Typography variant="subtitle1">{formatCurrency(entry.price)}</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    <ArrowUpIcon sx={{ fontSize: 14 }} />
                                                    {numeral(entry.changePercentage).format("0.00")}%
                                                </Typography>
                                            </Stack>
                                        </Stack>
                                    </Stack>
                                </TimelineContent>
                            </TimelineItem>
                        ))
                    }
                </HistorySection>
            </AddArticleModalContainer>
        </SideModal>
    );
}
