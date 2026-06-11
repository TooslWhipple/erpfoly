import Typography from "@mui/material/Typography";
import QuantityStepper from "@/components/SelectedItemsPanel/QuantityStepper";
import { OnlinePriceBar } from "./OnlinePriceBar";
import {
    Card,
    ImageWrapper,
    ProductImage,
    ImagePlaceholder,
    StepperWrapper,
} from "./styles";
import { Stack } from "@mui/material";

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
    onQuantityChange?: (productId: number, quantity: number) => void;
    readOnly?: boolean;
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        minimumFractionDigits: 2,
    }).format(value);
}

export function ConfirmOrderItemCard({ item, onQuantityChange, readOnly = false }: ConfirmOrderItemCardProps) {
    return (
        <Card>
            <Stack width="100%" direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                <Stack direction="row" spacing={1} alignItems="center">
                    <ImageWrapper>
                        {
                            (item.previewImage) ?
                                <ProductImage src={item.previewImage} alt={item.productName} />
                                :
                                <ImagePlaceholder />

                        }
                    </ImageWrapper>
                    <Stack direction="column" spacing={0.5}>
                        <Typography variant="body2" color="text.secondary">{item.productCode}</Typography>
                        <Typography variant="subtitle1">{item.productName}</Typography>
                    </Stack>
                </Stack>

                <Stack direction="row" spacing={3} alignItems="center" justifyContent="space-between">
                    <Stack direction="column" spacing={0.5}>
                        <Typography variant="body2" color="text.secondary">Precio unitario</Typography>
                        <Typography variant="body1">{formatCurrency(item.unitPrice)}</Typography>
                    </Stack>

                    <Stack direction="column" spacing={0.5}>
                        <Typography variant="body2" color="text.secondary" textAlign="center">Cantidad</Typography>
                        {
                            (readOnly) ?
                                <Typography variant="body1" fontWeight={600} textAlign="center">{item.quantity}</Typography>
                                :
                                <StepperWrapper>
                                    <QuantityStepper
                                        value={item.quantity}
                                        onChange={(qty) => onQuantityChange?.(item.productId, qty)}
                                    />
                                </StepperWrapper>
                        }
                    </Stack>

                    <Stack direction="column" spacing={0.5}>
                        <Typography variant="body2" color="text.secondary">Total</Typography>
                        <Typography variant="body1" fontWeight={600}>{formatCurrency(item.totalPrice)}</Typography>
                    </Stack>
                </Stack>
            </Stack>

            {
                item.onlinePrices && !readOnly &&
                <OnlinePriceBar onlinePrices={item.onlinePrices} />
            }

        </Card>
    );
}
