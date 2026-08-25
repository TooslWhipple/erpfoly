import { useState, useEffect } from "react";
import { Stack, Typography, Button, TextField, InputAdornment, Box } from "@mui/material";
import { ArrowUpward as ArrowUpIcon } from "@mui/icons-material";
import numeral from "numeral";
import type { Article, OrderItem } from "@/types/pedidos.types";
import { formatDate } from "@/utils/date";
import { SideModal } from "@/components/SideModal";
import { FormSelect, FormTextField } from "@/components/Form";
import {
    AddArticleModalContainer,
    ProductImage,
    ImagePlaceholder,
    HistorySection,
    TimelineLine,
    TimelineItem,
    TimelineDot,
    TimelineContent,
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

const ORDER_CURRENCIES = [
    { value: "MXN", label: "MXN" },
    { value: "USD", label: "USD" },
    { value: "EUR", label: "EUR" },
];

function formatCurrency(amount: number): string {
    return numeral(amount).format("$0,0.00");
}

export function AddArticleToOrderModal({
    open,
    onClose,
    article,
    onAddToOrder,
    costHistory = [],
}: AddArticleToOrderModalProps) {
    const [unitPrice, setUnitPrice] = useState<number>(0);
    const [currency, setCurrency] = useState<string>("MXN");
    const [exchangeRate, setExchangeRate] = useState<number | "">("");

    useEffect(() => {
        if (article && open) {
            if (costHistory.length > 0) {
                setUnitPrice(costHistory[0].price);
            } else {
                setUnitPrice(0);
            }
            setCurrency("MXN");
            setExchangeRate("");
        }
    }, [article, open, costHistory]);

    const handleClose = () => {
        setUnitPrice(0);
        setCurrency("MXN");
        setExchangeRate("");
        onClose();
    };

    const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value;
        if (inputValue === "" || /^\d*\.?\d*$/.test(inputValue)) {
            const parsed = parseFloat(inputValue);
            const numValue = Number.isFinite(parsed) ? parsed : 0;
            setUnitPrice(numValue);
        }
    };

    const handleExchangeRateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value;
        if (inputValue === "" || /^\d*\.?\d{0,6}$/.test(inputValue)) {
            setExchangeRate(inputValue === "" ? "" : parseFloat(inputValue));
        }
    };

    const requiresExchangeRate = currency !== "MXN";
    const isExchangeRateValid = !requiresExchangeRate || (typeof exchangeRate === "number" && exchangeRate > 0);

    const handleAddToOrder = () => {
        if (!article || unitPrice <= 0 || !isExchangeRateValid) {
            return;
        }

        const newItem: OrderItem = {
            articleId: article.id,
            articleName: article.name,
            folio: article.folio,
            quantity: 1,
            unitPrice,
            totalPrice: unitPrice,
            currency,
            exchangeRate: requiresExchangeRate ? (exchangeRate as number) : undefined,
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
                    {article.image ? (
                        <ProductImage src={article.image} alt={article.name} />
                    ) : (
                        <ImagePlaceholder />
                    )}
                    <Stack direction="column" spacing={0.5}>
                        <Typography variant="h5">{article.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{article.folio}</Typography>
                    </Stack>
                </Stack>
            }>
            <AddArticleModalContainer>
                <Typography variant="h6">Historial de costos de este artículo.</Typography>

                <HistorySection>
                    <UnitPriceSection>
                        <TimelineDot style={{ top: "12px" }} />

                        <TextField
                            variant="outlined"
                            size="small"
                            type="text"
                            value={unitPrice != null && unitPrice > 0 ? unitPrice.toString() : ""}
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
                        <Box sx={{ minWidth: 100, flexShrink: 0 }}>
                            <FormSelect
                                label="Moneda"
                                value={currency}
                                onChange={(e) => setCurrency(String(e.target.value))}
                                options={ORDER_CURRENCIES}
                            />
                        </Box>
                        {
                            requiresExchangeRate &&
                            <FormTextField
                                label="Tipo de cambio"
                                placeholder="17.20"
                                type="text"
                                value={exchangeRate}
                                onChange={handleExchangeRateChange}
                                error={requiresExchangeRate && !isExchangeRateValid}
                                helperText={requiresExchangeRate && !isExchangeRateValid ? "Requerido, mayor a 0" : undefined}
                                inputProps={{ inputMode: "decimal" }}
                            />
                        }
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleAddToOrder}
                            disabled={unitPrice <= 0 || !isExchangeRateValid}>
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
                                                <Typography variant="body2" color="text.secondary">{formatDate(entry.date, "dateLong")}</Typography>
                                                {
                                                    entry.orderId && <Typography variant="body2" color="text.secondary">Pedido {entry.orderId}</Typography>
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
