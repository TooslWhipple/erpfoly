import type { OnlinePriceComparison } from "@/components/ConfirmOrderItemCard";

export function buildPlaceholderOnlinePrices(unitPrice: number): OnlinePriceComparison {
    const averagePrice = Math.round(unitPrice * 1.78 * 100) / 100;

    return {
        averagePrice,
        retailers: [
            { retailer: "Liverpool", price: averagePrice, url: "https://www.liverpool.com.mx" },
            { retailer: "Walmart", price: averagePrice, url: "https://www.walmart.com.mx" },
            { retailer: "Coppel", price: averagePrice, url: "https://www.coppel.com" },
        ],
    };
}
