import { Typography, Button } from '@mui/material';
import { ShoppingCart } from 'lucide-react';
import type { SelectedOrderItem as SelectedOrderItemType } from '@/types/orders.types';
import {
  PanelContainer,
  PanelHeader,
  ItemsList,
  EmptyState,
  ContinueButtonArea,
  ContinueButtonContent,
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
      <PanelHeader>
        <Typography variant="body1" fontWeight={600}>Artículos</Typography>
        <Typography variant="body2" color="text.secondary">
          {
            items.length === 0
              ? 'Comienza a agregar artículos a tu pedido'
              : `${items.length} artículo${items.length !== 1 ? 's' : ''} · ${totalItems} unidad${totalItems !== 1 ? 'es' : ''}`
          }
        </Typography>
      </PanelHeader>

      {
        items.length === 0 ?
          < EmptyState >
            <ShoppingCart size={32} strokeWidth={1.5} />
            <Typography variant="body2" align="center">
              No hay artículos seleccionados
            </Typography>
          </EmptyState>
          :
          <ItemsList>
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
          </ItemsList>
      }

      {
        items.length > 0 && (
          <ContinueButtonArea>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              onClick={onContinue}
              sx={{ textTransform: 'none' }}
            >
              <ContinueButtonContent>
                <Typography component="span">{continueLabel}</Typography>
                <Typography component="span">{formatCurrency(totalPrice)}</Typography>
              </ContinueButtonContent>
            </Button>
          </ContinueButtonArea>
        )
      }
    </PanelContainer >
  );
}
