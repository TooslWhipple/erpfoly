import { Box, Typography } from '@mui/material';
import { X } from 'lucide-react';
import type { SelectedOrderItem as SelectedOrderItemType } from '@/types/orders.types';
import {
  ItemRow,
  ItemImage,
  ItemInfo,
  ItemCode,
  ItemName,
  ItemPrice,
  ItemTotal,
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
    <ItemRow>
      <ItemImage>
        {item.previewImage ? (
          <Box
            component="img"
            src={item.previewImage}
            alt={item.productName}
            sx={{
              width: '100%',
              height: '100%',
              borderRadius: '8px',
              objectFit: 'cover',
            }}
          />
        ) : (
          <Typography variant="caption" color="text.disabled">
            Sin imagen
          </Typography>
        )}
      </ItemImage>

      <ItemInfo>
        <ItemCode>{item.productCode}</ItemCode>
        <ItemName>{item.productName}</ItemName>
        <ItemPrice>{formatCurrency(item.unitPrice)} c/u</ItemPrice>

        <Box display="flex" alignItems="center" justifyContent="space-between">
          <ItemTotal>{formatCurrency(item.totalPrice)}</ItemTotal>
          <QuantityStepper
            value={item.quantity}
            onChange={(qty) => onQuantityChange(item.productId, qty)}
          />
        </Box>
      </ItemInfo>

      <RemoveButton
        size="small"
        onClick={() => onRemove(item.productId)}
        title="Eliminar artículo"
      >
        <X size={16} />
      </RemoveButton>
    </ItemRow>
  );
}
