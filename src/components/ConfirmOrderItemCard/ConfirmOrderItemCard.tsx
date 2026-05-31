import Typography from "@mui/material/Typography";
import QuantityStepper from "@/components/SelectedItemsPanel/QuantityStepper";
import { OnlinePriceBar } from "./OnlinePriceBar";
import {
    Card,
    Content,
    ImageWrapper,
    ProductImage,
    ImagePlaceholder,
    ProductInfo,
    ProductCode,
    ProductName,
    PriceColumn,
    MetricColumn,
    StepperWrapper,
} from "./styles";

export interface OnlineRetailerPrice {
    retailer: string;
    price: number;
    url?: string;
}

export interface OnlinePriceComparison {
    averagePrice: number;
    retailers: OnlineRetailerPrice[];
}

export interface ConfirmOrderItem {
    productId: number;
    productCode: string;
    productName: string;
    previewImage: string | null;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    onlinePrices?: OnlinePriceComparison;
}

export interface ConfirmOrderItemCardProps {
    item: ConfirmOrderItem;
    onQuantityChange: (productId: number, quantity: number) => void;
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        minimumFractionDigits: 2,
    }).format(value);
}

export function ConfirmOrderItemCard({ item, onQuantityChange }: ConfirmOrderItemCardProps) {
    return (
        <Card>
            <Content>
                <ImageWrapper>
                    {item.previewImage ? (
                        <ProductImage src={item.previewImage} alt={item.productName} />
                    ) : (
                        <ImagePlaceholder />
                    )}
                </ImageWrapper>

                <ProductInfo>
                    <ProductCode variant="caption" color="text.secondary">
                        {item.productCode}
                    </ProductCode>
                    <ProductName variant="subtitle1">
                        {item.productName}
                    </ProductName>
                </ProductInfo>

                <PriceColumn>
                    <Typography variant="body2" color="text.secondary">Precio unitario</Typography>
                    <Typography variant="body1">{formatCurrency(item.unitPrice)}</Typography>
                </PriceColumn>

                <MetricColumn>
                    <Typography variant="body2" color="text.secondary">Cantidad</Typography>
                    <StepperWrapper>
                        <QuantityStepper
                            value={item.quantity}
                            onChange={(qty) => onQuantityChange(item.productId, qty)}
                        />
                    </StepperWrapper>
                </MetricColumn>

                <MetricColumn>
                    <Typography variant="body2" color="text.secondary">Total</Typography>
                    <Typography variant="h6">{formatCurrency(item.totalPrice)}</Typography>
                </MetricColumn>
            </Content>

            {
                item.onlinePrices &&
                <OnlinePriceBar onlinePrices={item.onlinePrices} />
            }
        </Card>
    );
}
