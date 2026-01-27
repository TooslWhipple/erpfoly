import { Box, Typography, Button, IconButton } from "@mui/material";
import { Add as AddIcon, Remove as RemoveIcon, Close as CloseIcon } from "@mui/icons-material";
import numeral from "numeral";
import type { OrderItem } from "@/types/pedidos.types";
import {
    SummaryContainer,
    SummaryHeader,
    SummaryTitle,
    SummarySubtitle,
    SummaryContent,
    EmptyStateMessage,
    ItemsList,
    ItemCard,
    ItemCardHeader,
    ItemCardContent,
    ItemName,
    ItemModel,
    ItemSku,
    ItemFooter,
    QuantityControls,
    QuantityButton,
    QuantityValue,
    ItemPrice,
    RemoveButton,
    SummaryFooter,
    ContinueButton,
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
                <SummaryTitle>Artículos</SummaryTitle>
                {hasItems && (
                    <SummarySubtitle>
                        {itemCount} {itemCount === 1 ? "artículo" : "artículos"} en tu pedido
                    </SummarySubtitle>
                )}
            </SummaryHeader>

            <SummaryContent>
                {!hasItems ? (
                    <EmptyStateMessage>
                        Comienza a agregar artículos a tu pedido
                    </EmptyStateMessage>
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
                                        <ItemName>{productInfo.name}</ItemName>
                                        {productInfo.model && (
                                            <ItemModel>({productInfo.model})</ItemModel>
                                        )}
                                        <ItemSku>{item.folio}</ItemSku>
                                        <ItemFooter>
                                            <QuantityControls>
                                                <QuantityButton
                                                    size="small"
                                                    onClick={() => handleDecrement(item.articleId, item.quantity)}
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <RemoveIcon fontSize="small" />
                                                </QuantityButton>
                                                <QuantityValue>{item.quantity}</QuantityValue>
                                                <QuantityButton
                                                    size="small"
                                                    onClick={() => handleIncrement(item.articleId, item.quantity)}
                                                >
                                                    <AddIcon fontSize="small" />
                                                </QuantityButton>
                                            </QuantityControls>
                                            <ItemPrice>{formatCurrency(item.totalPrice)}</ItemPrice>
                                        </ItemFooter>
                                    </ItemCardContent>
                                </ItemCard>
                            );
                        })}
                    </ItemsList>
                )}
            </SummaryContent>

            <SummaryFooter>
                <ContinueButton
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={!hasItems}
                    onClick={onContinue}
                >
                    <ContinueButtonContent>
                        <Typography component="span">Continuar</Typography>
                        <Typography component="span">{formatCurrency(total)}</Typography>
                    </ContinueButtonContent>
                </ContinueButton>
            </SummaryFooter>
        </SummaryContainer>
    );
}
