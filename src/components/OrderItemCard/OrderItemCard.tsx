import { LocalLaundryService as ApplianceIcon } from "@mui/icons-material";
import type { OrderItem } from "@/types/pedidos.types";
import {
    CardRoot,
    ProductIconPlaceholder,
    QuantityValue,
} from "./styles";
import { Stack, Typography } from "@mui/material";

export interface OrderItemCardProps {
    item: OrderItem;
}

export function OrderItemCard({ item }: OrderItemCardProps) {
    return (
        <CardRoot>
            <Stack direction="row" spacing={0.5} alignItems="center">
                <ProductIconPlaceholder>
                    <ApplianceIcon sx={{ fontSize: 28, color: "text.secondary" }} />
                </ProductIconPlaceholder>
                <Stack>
                    <Typography variant="body2" color="text.secondary">{item.folio}</Typography>
                    <Typography variant="subtitle1">{item.articleName}</Typography>
                </Stack>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body2" color="text.secondary">Cantidad</Typography>
                <QuantityValue>{item.quantity}</QuantityValue>
            </Stack>
        </CardRoot>
    );
}
