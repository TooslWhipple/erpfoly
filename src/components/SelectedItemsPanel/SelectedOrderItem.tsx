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
}: SelectedOrderItemProps) {
  return (
    <ItemContainer>
      <Stack direction="row" alignItems="center" spacing={1}>
        <ItemImage src={item.previewImage ?? ""} alt={item.productName} />
        <Stack spacing={0.5}>
          <Typography variant="body2" color="text.secondary">{item.productCode}</Typography>
          <Typography variant="body1">{item.productName}</Typography>
          <QuantityStepper
            value={item.quantity}
            onChange={(qty) => onQuantityChange(item.productId, qty)}
          />
        </Stack>
      </Stack>
      <Typography variant='subtitle2' fontWeight={600}>{formatCurrency(item.totalPrice)}</Typography>

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
