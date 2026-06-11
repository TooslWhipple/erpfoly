import { Globe, ExternalLink } from "lucide-react";
import type { OnlinePriceComparison } from "./ConfirmOrderItemCard";
import {
    OnlinePriceBarContainer,
    OnlinePriceDivider,
    OnlinePriceSegment,
    OnlinePriceText,
} from "./styles";
import { theme } from "@/styles/theme";

interface OnlinePriceBarProps {
    onlinePrices: OnlinePriceComparison;
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        minimumFractionDigits: 2,
    }).format(value);
}

export function OnlinePriceBar({ onlinePrices }: OnlinePriceBarProps) {
    return (
        <OnlinePriceBarContainer>
            <OnlinePriceSegment>
                <Globe size={12} color={theme.palette.text.secondary} />
                <OnlinePriceText variant="caption" color="text.secondary">
                    Precio en internet prom: <strong>{formatCurrency(onlinePrices.averagePrice)}</strong>
                </OnlinePriceText>
            </OnlinePriceSegment>

            <OnlinePriceDivider />

            {onlinePrices.retailers.map((retailer, index) => (
                <OnlinePriceSegment key={retailer.retailer}>
                    <OnlinePriceText variant="caption" color="text.secondary">
                        {retailer.retailer}: <strong>{formatCurrency(retailer.price)}</strong>
                    </OnlinePriceText>
                    {retailer.url && (
                        <ExternalLink size={12} color={theme.palette.text.secondary} />
                    )}
                    {index < onlinePrices.retailers.length - 1 && <OnlinePriceDivider />}
                </OnlinePriceSegment>
            ))}
        </OnlinePriceBarContainer>
    );
}
