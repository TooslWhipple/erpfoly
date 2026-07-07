import { Package } from "lucide-react";
import { Divider, Stack, Typography } from "@mui/material";
import type { BranchOrderLineItem } from "@/types/solicitudes.types";
import {
    Card,
    ProductIconPlaceholder,
    DeliveryDateField
} from "./styles";
import { theme } from "@/styles/theme";
import { FormDatePicker } from "../Form";

export interface BranchOrderItemRowProps {
    item: BranchOrderLineItem;
    dateError?: string;
    disabled?: boolean;
    minDeliveryDate?: string;
    onDeliveryDateChange?: (articleId: string, date: string) => void;
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
    minDeliveryDate,
    onDeliveryDateChange
}: BranchOrderItemRowProps) {
    const handleDateChange = (value: string) => {
        if (onDeliveryDateChange) {
            onDeliveryDateChange(item.articleId, value);
        }
    };

    return (
        <Card>
            <Stack direction="row" spacing={1} alignItems="center" flex="6 0 400px">
                <ProductIconPlaceholder>
                    <Package
                        size={16}
                        color={theme.palette.text.secondary} />
                </ProductIconPlaceholder>
                <Typography variant="subtitle1" noWrap title={item.articleName}>{item.articleName}</Typography>
            </Stack>
            <Stack flex="2 0 240px">
                <FormDatePicker
                    value={formatDateForInput(item.deliveryDate)}
                    onChange={handleDateChange}
                    error={Boolean(dateError)}
                    helperText={dateError}
                    disabled={disabled}
                    minDate={minDeliveryDate}
                />
            </Stack>
            <Typography variant="subtitle1" flex="2 0 96px" align="center">{item.quantity}</Typography>
        </Card>
    );
}
