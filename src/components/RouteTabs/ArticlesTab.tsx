import { useState } from "react";
import { IconButton, Menu, MenuItem, Stack, Typography } from "@mui/material";
import {
  Check,
  Clock,
  MoreVertical,
  Package,
  RotateCcw,
  Trash2,
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

type OrderMenuState = {
  el: HTMLElement;
  pointId: string;
  orderNumber: string;
  itemCount: number;
} | null;

type ItemMenuState = {
  el: HTMLElement;
  pointId: string;
  itemId: string;
  orderNumber: string;
  articleName: string;
} | null;

export interface ArticlesTabProps {
  orders: RouteOrder[];
  canEdit: boolean;
  onRequestRemoveOrder: (
    pointId: number,
    orderNumber: string,
    itemCount: number,
  ) => void;
  onRequestRemoveItem: (
    pointId: number,
    itemId: number,
    orderNumber: string,
    articleName: string,
  ) => void;
}

export function ArticlesTab({
  orders,
  canEdit,
  onRequestRemoveOrder,
  onRequestRemoveItem,
}: ArticlesTabProps) {
  const [orderMenu, setOrderMenu] = useState<OrderMenuState>(null);
  const [itemMenu, setItemMenu] = useState<ItemMenuState>(null);

  if (orders.length === 0) {
    return <EmptyState>No hay pedidos en esta ruta.</EmptyState>;
  }

  const closeOrderMenu = () => setOrderMenu(null);
  const closeItemMenu = () => setItemMenu(null);

  const handleOrderMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    order: RouteOrder,
  ) => {
    setOrderMenu({
      el: event.currentTarget,
      pointId: order.id,
      orderNumber: order.orderNumber,
      itemCount: order.items.length,
    });
  };

  const handleItemMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    order: RouteOrder,
    item: RouteOrder["items"][number],
  ) => {
    setItemMenu({
      el: event.currentTarget,
      pointId: order.id,
      itemId: item.id,
      orderNumber: order.orderNumber,
      articleName: item.articleName,
    });
  };

  const handleConfirmRemoveOrder = () => {
    if (orderMenu) {
      onRequestRemoveOrder(
        Number(orderMenu.pointId),
        orderMenu.orderNumber,
        orderMenu.itemCount,
      );
    }
    closeOrderMenu();
  };

  const handleConfirmRemoveItem = () => {
    if (itemMenu) {
      onRequestRemoveItem(
        Number(itemMenu.pointId),
        Number(itemMenu.itemId),
        itemMenu.orderNumber,
        itemMenu.articleName,
      );
    }
    closeItemMenu();
  };

  return (
    <Stack spacing={1}>
      {
        orders.map((order) => {
          const orderMenuOpen = orderMenu?.pointId === order.id;
          return (
            <OrderCard key={order.id}>
              <OrderHeader>
                <Stack direction="row" alignItems="center" spacing={2}>

                  <Stack flex={1}>
                    <Typography variant="body1" fontWeight={600} noWrap>{order.address}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {order.destinationBranch ?? order.zone}
                    </Typography>
                  </Stack>
                </Stack>

                <Stack direction="row" alignItems="center" spacing={2}>
                  <StatusChip
                    size="small"
                    label={STOP_TYPE_LABELS[order.stopType]}
                    startIcon={<StopTypeIcon stopType={order.stopType} />}
                  />
                  <Typography variant="body2" color="text.secondary">Factura <span style={{ color: theme.palette.primary.main }}>{order.orderNumber}</span></Typography>
                  {canEdit && (
                    <IconButton
                      size="small"
                      aria-label={`Opciones del pedido ${order.orderNumber}`}
                      onClick={(e) => handleOrderMenuClick(e, order)}
                    >
                      <MoreVertical size={18} />
                    </IconButton>
                  )}
                </Stack>
              </OrderHeader>

              <Menu
                open={Boolean(orderMenu?.el) && orderMenuOpen}
                anchorEl={orderMenu?.el ?? null}
                onClose={closeOrderMenu}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                <MenuItem
                  onClick={handleConfirmRemoveOrder}
                  sx={{ color: "error.main", gap: 1 }}
                >
                  <Trash2 size={16} />
                  Remover pedido
                </MenuItem>
              </Menu>

              <Stack>
                {
                  order.items.map((item) => {
                    const itemMenuOpen =
                      itemMenu?.pointId === order.id && itemMenu?.itemId === item.id;
                    return (
                      <OrderItemRow key={item.id}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <StatusChip
                            size="small"
                            label={ITEM_STATUS_LABELS[item.status]}
                            startIcon={<ItemStatusIcon status={item.status} />} />
                          <Typography variant="body2" color="text.primary">{item.articleName}</Typography>
                        </Stack>
                        {canEdit && (
                          <IconButton
                            size="small"
                            aria-label={`Opciones del artículo ${item.articleName}`}
                            onClick={(e) => handleItemMenuClick(e, order, item)}
                          >
                            <MoreVertical size={18} />
                          </IconButton>
                        )}
                        <Menu
                          open={Boolean(itemMenu?.el) && itemMenuOpen}
                          anchorEl={itemMenu?.el ?? null}
                          onClose={closeItemMenu}
                          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                          transformOrigin={{ vertical: "top", horizontal: "right" }}
                        >
                          <MenuItem
                            onClick={handleConfirmRemoveItem}
                            sx={{ color: "error.main", gap: 1 }}
                          >
                            <Trash2 size={16} />
                            Remover Artículo
                          </MenuItem>
                        </Menu>
                      </OrderItemRow>
                    );
                  })
                }
              </Stack>
            </OrderCard>
          );
        })
      }
    </Stack>
  );
}
