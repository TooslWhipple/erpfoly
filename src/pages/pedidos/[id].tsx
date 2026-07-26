import { useState, useEffect } from "react";
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
import {
  Breadcrumbs,
  StatusChipVariant,
  StatusChip,
  SendToWarehouseModal,
} from "@/components";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import { ConfirmOrderItemCard } from "@/components/ConfirmOrderItemCard";
import type { ConfirmOrderItem } from "@/components/ConfirmOrderItemCard";
import { getOrderFull } from "@/services/orders.service";
import type { OrderFullDetail } from "@/types/orders.types";
import { SummaryCard } from "@/styles/pedidos/confirmar.styles";
import { buildPlaceholderOnlinePrices } from "@/lib/onlinePrices";
const IVA_RATE = 0.16;
type DisplayStatus = "pending" | "in_progress" | "received" | "cancelled";
function mapBackendStatus(status: string): DisplayStatus {
  switch (status) {
    case "pending":
      return "pending";
    case "partially_delivered":
      return "in_progress";
    case "delivered":
      return "received";
    case "cancelled":
      return "cancelled";
    default:
      return "pending";
  }
}
function getStatusLabel(status: DisplayStatus): string {
  const labels: Record<DisplayStatus, string> = {
    pending: "Solicitado",
    in_progress: "En curso",
    received: "Recibido",
    cancelled: "Cancelado",
  };
  return labels[status];
}
function getStatusVariant(status: DisplayStatus): StatusChipVariant {
  const variants: Record<DisplayStatus, string> = {
    pending: "pending",
    in_progress: "info",
    received: "success",
    cancelled: "error",
  };
  return variants[status] as StatusChipVariant;
}
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
    onlinePrices: buildPlaceholderOnlinePrices(unitPrice),
  };
}
export default function PedidoDetalle() {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState<OrderFullDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendModalOpen, setSendModalOpen] = useState(false);
  useEffect(() => {
    if (id && typeof id === "string") {
      loadOrder(id);
    }
  }, [id]);
  const loadOrder = async (orderId: string) => {
    setLoading(true);
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
  };
  const displayStatus = order ? mapBackendStatus(order.status) : "pending";
  const showSendButton =
    order?.order_type === "external" && displayStatus === "pending";
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
            {showSendButton && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => setSendModalOpen(true)}
              >
                Enviar a Almacén
              </Button>
            )}
            <StatusChip
              size="small"
              label={getStatusLabel(displayStatus)}
              variant={getStatusVariant(displayStatus)}
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

      <SendToWarehouseModal
        open={sendModalOpen}
        onClose={() => setSendModalOpen(false)}
        orderId={Number(id)}
        onSuccess={() => loadOrder(String(id))}
      />
    </>
  );
}
