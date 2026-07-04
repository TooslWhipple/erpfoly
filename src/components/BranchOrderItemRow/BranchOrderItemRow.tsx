import { Package, Minus, Plus } from "lucide-react";
import { Stack, Typography } from "@mui/material";
import type { BranchOrderLineItem } from "@/types/solicitudes.types";
import {
    Card,
    ProductIconPlaceholder,
    DeliveryDateField,
    QuantityButton,
    QuantityValue,
} from "./styles";
import { theme } from "@/styles/theme";

export interface BranchOrderItemRowProps {
    item: BranchOrderLineItem;
    dateError?: string;
    disabled?: boolean;
    onDeliveryDateChange?: (articleId: string, date: string) => void;
    onQuantityChange?: (articleId: string, quantity: number) => void;
}

function formatDateForInput(isoDate: string): string {
    if (!isoDate) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return isoDate;
    const d = new Date(isoDate);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
}

export function BranchOrderItemRow({
    item,
    dateError,
    disabled = false,
    onDeliveryDateChange,
    onQuantityChange,
}: BranchOrderItemRowProps) {
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (onDeliveryDateChange) {
            onDeliveryDateChange(item.articleId, value);
        }
    };

    const handleDecrement = () => {
        if (item.quantity > 1 && onQuantityChange) {
            onQuantityChange(item.articleId, item.quantity - 1);
        }
    };

    const handleIncrement = () => {
        if (onQuantityChange) {
            onQuantityChange(item.articleId, item.quantity + 1);
        }
    };

    return (
        <Card>
            <Stack direction="row" spacing={1} alignItems="center" flex={6}>
                <ProductIconPlaceholder>
                    <Package
                        size={16}
                        color={theme.palette.text.secondary} />
                </ProductIconPlaceholder>
                <Typography variant="subtitle1" noWrap title={item.articleName}>{item.articleName}</Typography>
            </Stack>
            <DeliveryDateField
                type="date"
                size="small"
                value={formatDateForInput(item.deliveryDate)}
                onChange={handleDateChange}
                error={Boolean(dateError)}
                helperText={dateError}
                disabled={disabled}
            />
            <Stack direction="row" spacing={1} alignItems="center" flex={2}>
                <QuantityButton
                    size="small"
                    onClick={handleDecrement}
                    disabled={disabled || item.quantity <= 1}
                >
                    <Minus size={16} style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)" }} />
                </QuantityButton>
                <QuantityValue>{item.quantity}</QuantityValue>
                <QuantityButton
                    size="small"
                    onClick={handleIncrement}
                    disabled={disabled}
                >
                    <Plus size={16} style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)" }} />
                </QuantityButton>
            </Stack>
        </Card>
    );
}
