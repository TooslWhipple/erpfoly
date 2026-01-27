import { Box, Typography, Button, IconButton } from "@mui/material";
import { Add as AddIcon, Remove as RemoveIcon, Close as CloseIcon } from "@mui/icons-material";
import numeral from "numeral";
import type { OrderItem } from "@/types/pedidos.types";
import {
    SummaryContainer,
    SummaryHeader,
    SummaryContent,
    ItemsList,
    ItemCard,
    ItemCardHeader,
    ItemCardContent,
    ItemFooter,
    QuantityControls,
    QuantityButton,
    RemoveButton,
    SummaryFooter,
    ContinueButtonContent,
} from "./styles";

export interface OrderSummarySidebarProps {
    items: OrderItem[];
    onContinue?: () => void;
    onQuantityChange?: (articleId: string, quantity: number) => void;
    onRemoveItem?: (articleId: string) => void;
}

function formatCurrency(amount: number): string {
    return numeral(amount).format("$0,0.00");
}

function calculateTotal(items: OrderItem[]): number {
    return items.reduce((sum, item) => sum + item.totalPrice, 0);
}

export function OrderSummarySidebar({
    items,
    onContinue,
    onQuantityChange,
    onRemoveItem,
}: OrderSummarySidebarProps) {
    const total = calculateTotal(items);
    const hasItems = items.length > 0;
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    const handleIncrement = (articleId: string, currentQuantity: number) => {
        if (onQuantityChange) {
            onQuantityChange(articleId, currentQuantity + 1);
        }
    };

    const handleDecrement = (articleId: string, currentQuantity: number) => {
        if (onQuantityChange && currentQuantity > 1) {
            onQuantityChange(articleId, currentQuantity - 1);
        }
    };

    const handleRemove = (articleId: string) => {
        if (onRemoveItem) {
            onRemoveItem(articleId);
        }
    };

    const getProductInfo = (articleName: string) => {
        const modelMatch = articleName.match(/\(([^)]+)\)/);
        if (modelMatch) {
            return {
                name: articleName.replace(/\s*\([^)]+\)\s*$/, "").trim(),
                model: modelMatch[1],
            };
        }
        return {
            name: articleName,
            model: null,
        };
    };

    return (
        <SummaryContainer>
            <SummaryHeader>
                <Typography variant="h3" sx={{ textAlign: "center", fontWeight: 700 }}>
                    Artículos
                </Typography>
                {hasItems && (
                    <Typography variant="body2" sx={{ textAlign: "center", color: "text.secondary" }}>
                        {itemCount} {itemCount === 1 ? "artículo" : "artículos"} en tu pedido
                    </Typography>
                )}
            </SummaryHeader>

            <SummaryContent>
                {!hasItems ? (
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            textAlign: "center", 
                            color: "text.secondary",
                            padding: (theme) => theme.spacing(4, 2)
                        }}
                    >
                        Comienza a agregar artículos a tu pedido
                    </Typography>
                ) : (
                    <ItemsList>
                        {items.map((item, index) => {
                            const productInfo = getProductInfo(item.articleName);
                            return (
                                <ItemCard key={`${item.articleId}-${index}`}>
                                    <ItemCardHeader>
                                        <RemoveButton
                                            size="small"
                                            onClick={() => handleRemove(item.articleId)}
                                        >
                                            <CloseIcon fontSize="small" />
                                        </RemoveButton>
                                    </ItemCardHeader>
                                    <ItemCardContent>
                                        <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.4 }}>
                                            {productInfo.name}
                                        </Typography>
                                        {productInfo.model && (
                                            <Typography variant="caption">
                                                ({productInfo.model})
                                            </Typography>
                                        )}
                                        <Typography variant="caption" sx={{ marginBottom: (theme) => theme.spacing(1.5) }}>
                                            {item.folio}
                                        </Typography>
                                        <ItemFooter>
                                            <QuantityControls>
                                                <QuantityButton
                                                    size="small"
                                                    onClick={() => handleDecrement(item.articleId, item.quantity)}
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <RemoveIcon fontSize="small" />
                                                </QuantityButton>
                                                <Typography 
                                                    variant="body2" 
                                                    sx={{ 
                                                        fontWeight: 500,
                                                        minWidth: 24,
                                                        textAlign: "center",
                                                        padding: (theme) => `0 ${theme.spacing(1)}`
                                                    }}
                                                >
                                                    {item.quantity}
                                                </Typography>
                                                <QuantityButton
                                                    size="small"
                                                    onClick={() => handleIncrement(item.articleId, item.quantity)}
                                                >
                                                    <AddIcon fontSize="small" />
                                                </QuantityButton>
                                            </QuantityControls>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                {formatCurrency(item.totalPrice)}
                                            </Typography>
                                        </ItemFooter>
                                    </ItemCardContent>
                                </ItemCard>
                            );
                        })}
                    </ItemsList>
                )}
            </SummaryContent>

            <SummaryFooter>
                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={!hasItems}
                    onClick={onContinue}
                    sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        borderRadius: 2,
                        padding: (theme) => theme.spacing(1.5, 2),
                    }}
                >
                    <ContinueButtonContent>
                        <Typography component="span">Continuar</Typography>
                        <Typography component="span">{formatCurrency(total)}</Typography>
                    </ContinueButtonContent>
                </Button>
            </SummaryFooter>
        </SummaryContainer>
    );
}
