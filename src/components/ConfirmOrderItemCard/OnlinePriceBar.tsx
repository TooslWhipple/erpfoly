import { Fragment } from "react";
import Typography from "@mui/material/Typography";
import { Globe, ExternalLink } from "lucide-react";
import type { OnlinePriceComparison } from "./ConfirmOrderItemCard";
import {
    OnlinePriceBarContainer,
    GlobeWrapper,
    PriceSegment,
    VerticalSeparator,
    RetailerLink,
    RetailerEntry,
} from "./styles";

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
            <GlobeWrapper>
                <Globe size={14} />
            </GlobeWrapper>

            <PriceSegment>
                <Typography variant="caption" color="text.secondary">
                    Precio en internet prom:
                </Typography>
                <Typography variant="caption">
                    {formatCurrency(onlinePrices.averagePrice)}
                </Typography>
            </PriceSegment>

            <VerticalSeparator />

            {onlinePrices.retailers.map((retailer, index) => (
                <Fragment key={retailer.retailer}>
                    {retailer.url ? (
                        <RetailerLink
                            href={retailer.url}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Typography variant="caption" color="text.secondary">
                                {retailer.retailer}:
                            </Typography>
                            <Typography variant="caption">
                                {formatCurrency(retailer.price)}
                            </Typography>
                            <ExternalLink size={12} />
                        </RetailerLink>
                    ) : (
                        <RetailerEntry>
                            <Typography variant="caption" color="text.secondary">
                                {retailer.retailer}:
                            </Typography>
                            <Typography variant="caption">
                                {formatCurrency(retailer.price)}
                            </Typography>
                        </RetailerEntry>
                    )}
                    {index < onlinePrices.retailers.length - 1 && <VerticalSeparator />}
                </Fragment>
            ))}
        </OnlinePriceBarContainer>
    );
}
