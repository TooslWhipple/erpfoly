import { Box, Chip, IconButton, Stack, Typography } from "@mui/material";
import { AlertTriangle, Trash2 } from "lucide-react";
import NumberSpinner from "@/components/NumberSpinner";
import type { CartItem } from "@/types/ventas.types";
import {
  CartItemCard,
  CartItemThumb,
  PriceField,
  PriceSummaryRow,
} from "./styles";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(value);
}

export interface SaleCartItemProps {
  item: CartItem;
  isLayaway: boolean;
  isCajeroMode: boolean;
  currentBranchId: number;
  onRemove: (productId: number) => void;
  onQtyChange: (productId: number, delta: number) => void;
  qtyMax?: number;
}

export function SaleCartItemRow({
  item,
  isLayaway,
  isCajeroMode,
  currentBranchId,
  onRemove,
  onQtyChange,
  qtyMax,
}: SaleCartItemProps) {
  const branchSrc = item.sources.find(
    (s) => s.sourceType === "branch" && s.quantity > 0,
  );
  const showBranchChip =
    branchSrc != null && branchSrc.branchId !== currentBranchId;

  return (
    <CartItemCard>
      <Stack direction="row" alignItems="flex-start" spacing={1.5}>
        <CartItemThumb
          component="img"
          src={item.imageUrl ?? "/placeholder-product.png"}
          alt={item.productName}
        />
        <Box flex={1} minWidth={0}>
          <Typography variant="caption" color="text.secondary" display="block">
            Código: {item.sku}
          </Typography>
          <Typography
            variant="body2"
            fontWeight={600}
            noWrap
            title={item.productName}
          >
            {item.productName}
          </Typography>
          {item.brandName && (
            <Typography variant="caption" color="text.secondary">
              {item.brandName}
            </Typography>
          )}
          {showBranchChip && branchSrc && (
            <Chip
              label={branchSrc.label}
              size="small"
              variant="outlined"
              sx={{ mt: 0.5, height: 20, fontSize: "0.6875rem" }}
            />
          )}
        </Box>
        <IconButton
          size="medium"
          disabled={isCajeroMode}
          onClick={() => onRemove(item.productId)}
          sx={{ color: "text.secondary", flexShrink: 0 }}
          aria-label="Eliminar artículo"
        >
          <Trash2 size={18} />
        </IconButton>
      </Stack>

      {isLayaway ? (
        <Stack
          direction="row"
          alignItems="flex-end"
          justifyContent="space-between"
          mt={1.5}
        >
          <PriceField>
            <Typography variant="caption" color="text.secondary" display="block">
              Cantidad
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {item.quantity}
            </Typography>
          </PriceField>
          <PriceField>
            <Typography variant="caption" color="text.secondary" display="block">
              Total
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {formatCurrency(item.unitPrice * item.quantity)}
            </Typography>
          </PriceField>
        </Stack>
      ) : (
        <>
          <Stack direction="row" alignItems="center" spacing={2} mt={1.5}>
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                mb={0.5}
              >
                Cantidad
              </Typography>
              <NumberSpinner
                value={item.quantity}
                onChange={(val: number) =>
                  onQtyChange(item.productId, val - item.quantity)
                }
                min={1}
                max={qtyMax}
                size="small"
                iconSize={13}
                disabled={isCajeroMode}
              />
            </Box>
          </Stack>
          <PriceSummaryRow>
            <PriceField>
              <Typography variant="caption" color="text.secondary" display="block">
                Precio original
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {formatCurrency(item.originalPrice)}
              </Typography>
            </PriceField>
            <PriceField>
              <Typography variant="caption" color="text.secondary" display="block">
                Descuento
              </Typography>
              <Typography variant="body2" fontWeight={500} color="error.main">
                -{formatCurrency(item.discountAmount)}
              </Typography>
            </PriceField>
            <PriceField>
              <Typography variant="caption" color="text.secondary" display="block">
                Total
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {formatCurrency(item.unitPrice * item.quantity)}
              </Typography>
            </PriceField>
          </PriceSummaryRow>
        </>
      )}

      {item.backorderedQuantity > 0 && (
        <Chip
          icon={<AlertTriangle size={12} />}
          label={`${item.backorderedQuantity} de ${item.quantity} en backorder`}
          size="small"
          color="warning"
          variant="outlined"
          sx={{ mt: 1, height: 22, fontSize: "0.6875rem" }}
        />
      )}
    </CartItemCard>
  );
}
