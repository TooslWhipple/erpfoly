import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import {
  Typography,
  Skeleton,
  Stack,
  Button,
  Divider,
  Grid,
  Box,
} from "@mui/material";
import { Breadcrumbs, StatusChip } from "@/components";
import { OrderAdjustmentActions } from "@/components/OrderAdjustment";
import { getOrderStatusLabel, getOrderStatusVariant } from "@/utils/orderStatus";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import { ConfirmOrderItemCard } from "@/components/ConfirmOrderItemCard";
import type { ConfirmOrderItem } from "@/components/ConfirmOrderItemCard";
import { getOrderFull } from "@/services/orders.service";
import type { OrderFullDetail } from "@/types/orders.types";
import { SummaryCard } from "@/styles/pedidos/confirmar.styles";
// import { buildPlaceholderOnlinePrices } from "@/lib/onlinePrices";
import { formatDateOnly } from "@/utils/date";
const IVA_RATE = 0.16;
function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(value);
}
function mapOrderItemToConfirmItem(
  item: OrderFullDetail["order_items"][number],
): ConfirmOrderItem {
  const unitPrice = Number(item.unit_price ?? 0);
  const quantity = item.requested_quantity;
  return {
    productId: item.product?.id ?? item.id,
    productCode: item.product?.code ?? "—",
    productName: item.product?.short_name ?? "Producto sin nombre",
    previewImage: item.product?.product_images?.[0]?.image_url ?? null,
    quantity,
    unitPrice,
    totalPrice: unitPrice * quantity,
    // onlinePrices: buildPlaceholderOnlinePrices(unitPrice),
  };
}
export default function PedidoDetalle() {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState<OrderFullDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const loadOrder = useCallback(async (orderId: string, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const result = await getOrderFull(Number(orderId));
      if (result.data) {
        setOrder(result.data);
      }
    } catch (err) {
      console.error("[PedidoDetalle] Error loading order:", err);
    } finally {
      setLoading(false);
    }
  }, []);
  const reloadOrder = useCallback(() => {
    if (id && typeof id === "string") void loadOrder(id, true);
  }, [id, loadOrder]);
  useEffect(() => {
    if (id && typeof id === "string") {
      void loadOrder(id);
    }
  }, [id, loadOrder]);
  const subtotal = order
    ? order.order_items.reduce(
        (sum, item) =>
          sum + Number(item.unit_price ?? 0) * item.requested_quantity,
        0,
      )
    : 0;
  const iva = subtotal * IVA_RATE;
  const total = subtotal + iva;
  const breadcrumbs: BreadcrumbItem[] = [
    {
      label: "Pedidos",
      href: "/pedidos",
    },
    {
      label: order?.supplier?.name || order?.branch?.name || "...",
      href: "/pedidos",
    },
    {
      label: `Pedido ${order?.folio || "..."}`,
    },
  ];
  if (loading) {
    return (
      <Stack spacing={3}>
        <Breadcrumbs
          items={breadcrumbs}
          showBackButton
          onBack={() => router.push("/pedidos")}
        />
        <Grid container spacing={4}>
          <Grid
            size={{
              xs: 12,
              md: 8,
              xl: 9,
            }}
          >
            <Stack spacing={2}>
              {[1, 2].map((i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  height={120}
                  sx={{
                    borderRadius: 2,
                  }}
                />
              ))}
            </Stack>
          </Grid>
          <Grid
            size={{
              xs: 12,
              md: 4,
              xl: 3,
            }}
          >
            <Skeleton
              variant="rectangular"
              height={150}
              sx={{
                borderRadius: 2,
              }}
            />
          </Grid>
        </Grid>
      </Stack>
    );
  }
  if (!order) {
    return (
      <>
        <Breadcrumbs
          items={breadcrumbs}
          showBackButton
          onBack={() => router.push("/pedidos")}
        />
        <Box
          sx={{
            marginTop: 4,
            textAlign: "center",
          }}
        >
          <Typography variant="h5" color="text.secondary">
            Pedido no encontrado
          </Typography>
          <Button
            variant="contained"
            sx={{
              marginTop: 2,
            }}
            onClick={() => router.push("/pedidos")}
          >
            Volver a pedidos
          </Button>
        </Box>
      </>
    );
  }
  return (
    <>
      <Stack spacing={3}>
        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{
            xs: "flex-start",
            sm: "center",
          }}
        >
          <Breadcrumbs
            showBackButton
            items={breadcrumbs}
            onBack={() => router.push("/pedidos")}
          />
          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={2}
            alignItems={{
              xs: "flex-start",
              sm: "center",
            }}
          >
            <OrderAdjustmentActions
              orderId={order.id}
              status={order.status}
              onChanged={reloadOrder}
            />
            <StatusChip
              size="small"
              label={getOrderStatusLabel(order.status)}
              variant={getOrderStatusVariant(order.status)}
            />
          </Stack>
        </Stack>

        <Divider />

        <Grid container spacing={4}>
          <Grid
            size={{
              xs: 12,
              md: 8,
              xl: 9,
            }}
          >
            <Stack spacing={2}>
              {order.order_items.map((item) => (
                <ConfirmOrderItemCard
                  key={item.id}
                  item={mapOrderItemToConfirmItem(item)}
                  readOnly
                />
              ))}
            </Stack>
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 4,
              xl: 3,
            }}
          >
            <SummaryCard>
              <Stack spacing={2}>
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    Entrega prometida
                  </Typography>
                  {order.order_items.map((item) => (
                    <Stack
                      key={item.id}
                      direction="row"
                      justifyContent="space-between"
                      spacing={2}
                    >
                      <Typography variant="body2" noWrap>
                        {item.product?.short_name ?? "Producto sin nombre"}
                      </Typography>
                      <Typography variant="body2" textAlign="right">
                        {item.scheduled_delivery_date
                          ? formatDateOnly(item.scheduled_delivery_date, "dateLong")
                          : "Pendiente de confirmar"}
                        {item.delivery_method && (
                          <>
                            <br />
                            <Typography
                              component="span"
                              variant="caption"
                              color="text.secondary"
                            >
                              {item.delivery_method.name}
                            </Typography>
                          </>
                        )}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Subtotal
                  </Typography>
                  <Typography variant="body1">
                    {formatCurrency(subtotal)}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    IVA
                  </Typography>
                  <Typography variant="body1">{formatCurrency(iva)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="h6" fontWeight={700}>
                    Total:
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {formatCurrency(total)}
                  </Typography>
                </Stack>
              </Stack>
            </SummaryCard>
          </Grid>
        </Grid>
      </Stack>
    </>
  );
}
