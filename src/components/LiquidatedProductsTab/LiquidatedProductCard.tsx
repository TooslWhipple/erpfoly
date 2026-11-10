import numeral from "numeral";
import { Chip, Stack, Typography } from "@mui/material";
import type { LiquidatedProductItem } from "@/types/liquidaciones.types";
import {
  LiquidatedCard,
  LiquidatedImagePlaceholder,
  LiquidatedPriceRow,
  LiquidatedProductImage,
} from "./styles";

export interface LiquidatedProductCardProps {
  item: LiquidatedProductItem;
}

function formatPrice(value: number): string {
  return numeral(value).format("$0,0.00");
}

export function LiquidatedProductCard({ item }: LiquidatedProductCardProps) {
  const hasDiscount = item.discountPercent > 0;

  return (
    <LiquidatedCard>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
        {item.imageUrl ? (
          <LiquidatedProductImage src={item.imageUrl} alt={item.productName} />
        ) : (
          <LiquidatedImagePlaceholder />
        )}
        <Stack spacing={0.5} sx={{ minWidth: 0 }}>
          <Typography variant="body1" fontWeight={700} sx={{ overflowWrap: "anywhere" }}>
            {item.productName}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: "anywhere" }}>
            {item.sku}
          </Typography>
        </Stack>
      </Stack>

      <Stack spacing={0.5}>
        <Typography variant="body2" color="text.secondary">
          Precio de liquidación
        </Typography>
        <LiquidatedPriceRow>
          <Typography variant="h6" fontWeight={700}>
            {formatPrice(item.liquidationPrice)}
          </Typography>
          {hasDiscount && (
            <>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textDecoration: "line-through" }}
              >
                {formatPrice(item.originalPrice)}
              </Typography>
              <Chip size="small" color="error" label={`-${item.discountPercent}%`} />
            </>
          )}
        </LiquidatedPriceRow>
        {!hasDiscount && (
          <Typography variant="caption" color="text.secondary">
            Sin descuento de liquidación activo
          </Typography>
        )}
      </Stack>

      <Typography variant="body2" color="text.secondary">
        Existencias: <strong>{item.stock}</strong>
      </Typography>
    </LiquidatedCard>
  );
}
