import { Typography, Button, Stack, Divider } from '@mui/material';
import type { SelectedOrderItem as SelectedOrderItemType } from '@/types/orders.types';
import {
  PanelContainer,
  ContinueButtonArea,
} from './styles';
import SelectedOrderItem from './SelectedOrderItem';

interface SelectedItemsPanelProps {
  items: SelectedOrderItemType[];
  onQuantityChange: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
  onContinue: () => void;
  continueLabel?: string;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(value);
}

export default function SelectedItemsPanel({
  items,
  onQuantityChange,
  onRemove,
  onContinue,
  continueLabel = "Continuar",
}: SelectedItemsPanelProps) {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <PanelContainer>
      <Stack direction="column" spacing={1} padding="16px">
        <Typography variant="body1" fontWeight={600}>Artículos</Typography>
        <Typography variant="body2" color="text.secondary">
          {
            items.length === 0
              ? 'Comienza a agregar artículos a tu pedido'
              : `${items.length} artículo${items.length !== 1 ? 's' : ''} · ${totalItems} unidad${totalItems !== 1 ? 'es' : ''}`
          }
        </Typography>
      </Stack>

      <Stack direction="column" spacing={1}>
        {
          items.map((item) => (
            <SelectedOrderItem
              key={item.productId}
              item={item}
              onQuantityChange={onQuantityChange}
              onRemove={onRemove}
            />
          ))
        }
      </Stack>

      <Divider />

      <ContinueButtonArea>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          disabled={items.length === 0}
          onClick={onContinue}
          sx={{ textTransform: 'none' }}>
          <Stack width="100%" direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant='body1' fontWeight={500}>{continueLabel}</Typography>
            <Typography variant='body1' fontWeight={500} style={{ opacity: 0.6 }}>{formatCurrency(totalPrice)}</Typography>
          </Stack>
        </Button>
      </ContinueButtonArea>
    </PanelContainer >
  );
}
