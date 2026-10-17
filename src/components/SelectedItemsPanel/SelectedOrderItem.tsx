import { Stack, Typography } from '@mui/material';
import { X } from 'lucide-react';
import type { SelectedOrderItem as SelectedOrderItemType } from '@/types/orders.types';
import {
  ItemContainer,
  ItemImage,
  RemoveButton,
} from './styles';
import QuantityStepper from './QuantityStepper';

interface SelectedOrderItemProps {
  item: SelectedOrderItemType;
  onQuantityChange: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
  hidePrices?: boolean;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(value);
}

export default function SelectedOrderItem({
  item,
  onQuantityChange,
  onRemove,
  hidePrices = false,
}: SelectedOrderItemProps) {
  return (
    <ItemContainer>
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{ minWidth: 0, flex: 1, pr: 4 }}
      >
        <ItemImage src={item.previewImage ?? ""} alt={item.productName} />
        <Stack spacing={0.5} sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="body2" color="text.secondary" noWrap>
            {item.productCode}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              overflowWrap: "anywhere",
              wordBreak: "break-word",
            }}
          >
            {item.productName}
          </Typography>
          <QuantityStepper
            value={item.quantity}
            onChange={(qty) => onQuantityChange(item.productId, qty)}
          />
        </Stack>
      </Stack>
      {!hidePrices && (
        <Typography variant="subtitle2" fontWeight={600} sx={{ flexShrink: 0 }}>
          {formatCurrency(item.totalPrice)}
        </Typography>
      )}

      <RemoveButton
        size="small"
        onClick={() => onRemove(item.productId)}
        title="Eliminar artículo"
      >
        <X size={16} />
      </RemoveButton>
    </ItemContainer>
  );
}
