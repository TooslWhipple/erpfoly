import { Package, Minus, Plus } from "lucide-react";
import { Stack, Typography } from "@mui/material";
import type { BranchOrderLineItem } from "@/types/solicitudes.types";
import {
    Card,
    ProductIconPlaceholder,
    DeliveryDateField,
    QuantityControls,
    QuantityButton,
    QuantityValue,
} from "./styles";
import { theme } from "@/styles/theme";

export interface BranchOrderItemRowProps {
    item: BranchOrderLineItem;
    onDeliveryDateChange?: (articleId: string, date: string) => void;
    onQuantityChange?: (articleId: string, quantity: number) => void;
}

function formatDateForInput(isoDate: string): string {
    if (!isoDate) return "";
    const d = new Date(isoDate);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

export function BranchOrderItemRow({
    item,
    onDeliveryDateChange,
    onQuantityChange,
}: BranchOrderItemRowProps) {
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value && onDeliveryDateChange) {
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
            />
            <Stack direction="row" spacing={1} alignItems="center" flex={2}>
                <QuantityButton
                    size="small"
                    onClick={handleDecrement}
                    disabled={item.quantity <= 1}
                >
                    <Minus size={16} style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)" }} />
                </QuantityButton>
                <QuantityValue>{item.quantity}</QuantityValue>
                <QuantityButton
                    size="small"
                    onClick={handleIncrement}
                >
                    <Plus size={16} style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)" }} />
                </QuantityButton>
            </Stack>
        </Card>
    );
}
