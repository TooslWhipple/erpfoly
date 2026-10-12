import { Box, Chip, Stack, Typography } from "@mui/material";
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
  const special = item.allocatedAmount ?? 0;
  const net = Math.max(0, item.total - special);
  const authorized =
    item.approvedDiscountPct != null
      ? `${item.approvedDiscountPct}%`
      : item.approvedDiscountAmount != null
        ? formatCurrency(item.approvedDiscountAmount)
        : null;

  return (
    <ItemCard>
      <Stack spacing={2} direction="row" alignItems="flex-start">
        <ItemImage />
        <Stack minWidth={0} spacing={0.5} flex={1}>
          <Typography variant="body2" color="text.secondary">{item.code}</Typography>
          <Typography variant="subtitle1" noWrap title={item.name}>{item.name}</Typography>
          {item.brand && (
            <Typography variant="caption" color="text.secondary">{item.brand}</Typography>
          )}
          {(item.units && item.units.length > 0
            ? item.units
            : item.reasonLabel
              ? [
                  {
                    index: 1,
                    reasonLabel: item.reasonLabel,
                    notes: item.notes,
                  },
                ]
              : []
          ).map((unit) => (
            <Stack key={unit.index} spacing={0.25}>
              {unit.reasonLabel && (
                <Chip
                  size="small"
                  label={
                    (item.units?.length ?? 0) > 1
                      ? `Pieza ${unit.index}: ${unit.reasonLabel}`
                      : unit.reasonLabel
                  }
                  sx={{ alignSelf: "flex-start", mt: 0.5 }}
                />
              )}
              {unit.notes?.trim() && (
                <Typography variant="body2" color="text.secondary">
                  {unit.notes.trim()}
                </Typography>
              )}
            </Stack>
          ))}
          {authorized && (
            <Typography variant="body2" color="text.secondary">
              Autorizado: {authorized}
            </Typography>
          )}
        </Stack>
      </Stack>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, minmax(0, 1fr))" },
          gap: 1.5,
          minWidth: 0,
        }}
      >
        <Stack spacing={0.5}>
          <Typography variant="body2" color="text.secondary">Cantidad</Typography>
          <Typography variant="body1" fontWeight={600}>
            {item.lineQuantity != null && item.lineQuantity > item.quantity
              ? `${item.quantity} de ${item.lineQuantity}`
              : item.quantity}
          </Typography>
        </Stack>
        <Stack spacing={0.5}>
          <Typography variant="body2" color="text.secondary">Precio original</Typography>
          <Typography variant="body1" fontWeight={600}>{formatCurrency(item.originalPrice)}</Typography>
        </Stack>
        <Stack spacing={0.5}>
          <Typography variant="body2" color="text.secondary">
            {special > 0 && item.discountAmount <= 0
              ? "Descuento especial"
              : special > 0
                ? "Promoción"
                : "Descuento"}
          </Typography>
          <Typography variant="body1" color="error" fontWeight={600}>
            {formatCurrency(special > 0 && item.discountAmount <= 0 ? special : item.discountAmount)}
          </Typography>
        </Stack>
        <Stack spacing={0.5}>
          <Typography variant="body2" color="text.secondary">Total</Typography>
          <Typography variant="body1" fontWeight={600}>{formatCurrency(net)}</Typography>
        </Stack>
        {special > 0 && item.discountAmount > 0 && (
          <Stack spacing={0.5}>
            <Typography variant="body2" color="text.secondary">Descuento especial</Typography>
            <Typography variant="body1" color="error" fontWeight={600}>
              {formatCurrency(special)}
            </Typography>
          </Stack>
        )}
      </Box>
    </ItemCard>
  );
}
