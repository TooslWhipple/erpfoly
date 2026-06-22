import { IconButton, Stack, Typography } from "@mui/material";
import {
  Check,
  Clock,
  GripVertical,
  MoreVertical,
  Package,
  RotateCcw,
  X,
} from "lucide-react";
import type {
  RouteOrder,
  RouteOrderItemStatus,
  RouteStopType,
} from "@/types/rutas.types";
import {
  EmptyState,
  OrderCard,
  OrderHeader,
  OrderItemRow
} from "./ArticlesTab.styles";

import { theme } from "@/styles/theme";
import { StatusChip } from "../StatusChip";

const ITEM_STATUS_LABELS: Record<RouteOrderItemStatus, string> = {
  pending: "Pendiente",
  delivered: "Entregado",
  not_delivered: "No entregado",
};

const STOP_TYPE_LABELS: Record<RouteStopType, string> = {
  delivery: "Entrega",
  recovery: "Recup.",
};

function ItemStatusIcon({ status }: { status: RouteOrderItemStatus }) {
  const size = 14;
  if (status === "delivered") {
    return <Check size={size} />;
  }
  if (status === "not_delivered") {
    return <X size={size} />;
  }
  return <Clock size={size} />;
}

function StopTypeIcon({ stopType }: { stopType: RouteStopType }) {
  const size = 14;
  if (stopType === "recovery") {
    return <RotateCcw size={size} />;
  }
  return <Package size={size} />;
}

export interface ArticlesTabProps {
  orders: RouteOrder[];
}

export function ArticlesTab({ orders }: ArticlesTabProps) {
  if (orders.length === 0) {
    return <EmptyState>No hay pedidos en esta ruta.</EmptyState>;
  }

  return (
    <Stack spacing={1}>
      {
        orders.map((order) => (
          <OrderCard key={order.id}>
            <OrderHeader>
              <Stack direction="row" alignItems="center" spacing={2}>
                <GripVertical size={16} color={theme.palette.text.secondary} />

                <Stack flex={1}>
                  <Typography variant="body1" fontWeight={600} noWrap>{order.address}</Typography>
                  <Typography variant="body2" color="text.secondary">{order.zone}</Typography>
                </Stack>
              </Stack>

              <Stack direction="row" alignItems="center" spacing={2}>
                <StatusChip
                  size="small"
                  label={STOP_TYPE_LABELS[order.stopType]}
                  startIcon={<StopTypeIcon stopType={order.stopType} />}
                />
                <Typography variant="body2" color="text.secondary">Factura <span style={{ color: theme.palette.primary.main }}>{order.orderNumber}</span></Typography>
                <IconButton size="small">
                  <MoreVertical size={18} />
                </IconButton>
              </Stack>
            </OrderHeader>

            <Stack>
              {
                order.items.map((item) => (
                  <OrderItemRow key={item.id}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <StatusChip
                        size="small"
                        label={ITEM_STATUS_LABELS[item.status]}
                        startIcon={<ItemStatusIcon status={item.status} />} />
                      <Typography variant="body2" color="text.primary">{item.articleName}</Typography>
                    </Stack>
                    <IconButton size="small">
                      <MoreVertical size={18} />
                    </IconButton>
                  </OrderItemRow>
                ))
              }
            </Stack>
          </OrderCard>
        ))
      }
    </Stack>
  );
}
