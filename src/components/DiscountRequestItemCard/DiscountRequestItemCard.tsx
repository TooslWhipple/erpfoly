import { Stack, Typography } from "@mui/material";
import numeral from "numeral";
import type { DiscountRequestLineItem } from "@/types/discount-requests.types";
import { ItemCard, ItemImage } from "@/styles/solicitudes-descuento/nuevo.styles";

function formatCurrency(value: number): string {
  return numeral(value).format("$0,0.00");
}

export interface DiscountRequestItemCardProps {
  item: DiscountRequestLineItem;
}

export function DiscountRequestItemCard({ item }: DiscountRequestItemCardProps) {
  return (
    <ItemCard>
      <Stack spacing={2} direction="row">
        <ItemImage />
        <Stack>
          <Typography variant="body2" color="text.secondary">{item.code}</Typography>
          <Typography variant="subtitle1">{item.name}</Typography>
          <Typography variant="caption" color="text.secondary">{item.brand}</Typography>
        </Stack>
      </Stack>
      <Stack direction="row" justifyContent="space-between" spacing={1} sx={{ paddingRight: 4 }}>
        <Stack spacing={1}>
          <Typography variant="body2" color="text.secondary">Cantidad</Typography>
          <Typography variant="body1" fontWeight={600}>{item.quantity}</Typography>
        </Stack>
        <Stack spacing={1}>
          <Typography variant="body2" color="text.secondary">Precio original</Typography>
          <Typography variant="body1" fontWeight={600}>{formatCurrency(item.originalPrice)}</Typography>
        </Stack>
        <Stack spacing={1}>
          <Typography variant="body2" color="text.secondary">Descuento</Typography>
          <Typography variant="body1" color="error" fontWeight={600}>{formatCurrency(item.discountAmount)}</Typography>
        </Stack>
        <Stack spacing={1}>
          <Typography variant="body2" color="text.secondary">Total</Typography>
          <Typography variant="body1" fontWeight={600}>{formatCurrency(item.total)}</Typography>
        </Stack>
      </Stack>
    </ItemCard>
  );
}
