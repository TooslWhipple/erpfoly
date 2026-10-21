import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Stack,
  Grid,
} from "@mui/material";
import { Breadcrumbs } from "@/components";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import QuantityStepper from "@/components/SelectedItemsPanel/QuantityStepper";
import {
  SummaryCard,
  ItemCard,
  ImageWrapper,
  ProductImage,
  ImagePlaceholder,
  StepperWrapper,
} from "@/styles/pedidos/nuevo-confirmar.styles";
import { createOrderWithItems } from "@/services/orders.service";
import { getMainWarehouse } from "@/services/branches.service";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import dayjs from "@/lib/dayjs";

interface ConfirmPedidoItem {
  productId: number;
  productCode: string;
  productName: string;
  previewImage?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency?: string;
  exchangeRate?: number;
}

interface ConfirmPedidoData {
  supplierId?: string;
  supplierName?: string;
  items: ConfirmPedidoItem[];
  total: number;
}

const IVA_RATE = 0.16;

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(value);
}

export default function ConfirmarPedidoPage() {
  const router = useRouter();
  const [orderData, setOrderData] = useState<ConfirmPedidoData | null>(null);
  const [items, setItems] = useState<ConfirmPedidoItem[]>([]);
  const [status, setStatus] = useState<
    "loading" | "idle" | "submitting" | "empty" | "error"
  >("loading");
  const { showError, showSuccess } = useSnackbarStore();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = sessionStorage.getItem("newPedidoData");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as ConfirmPedidoData;
        if (parsed.items?.length) {
          setOrderData(parsed);
          setItems(parsed.items);
          setStatus("idle");
        } else {
          setStatus("empty");
        }
      } catch {
        setStatus("empty");
      }
    } else {
      setStatus("empty");
    }
  }, []);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.totalPrice, 0),
    [items],
  );
  const iva = useMemo(() => subtotal * IVA_RATE, [subtotal]);
  const total = useMemo(() => subtotal + iva, [subtotal, iva]);

  const handleBack = () => {
    router.push({
      pathname: "/pedidos/nuevo",
      query:
        orderData?.supplierId && orderData?.supplierName
          ? {
              supplierId: orderData.supplierId,
              supplierName: orderData.supplierName,
            }
          : undefined,
    });
  };

  const handleQuantityChange = (productId: number, quantity: number) => {
    if (quantity <= 0) return;
    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity,
              totalPrice: item.unitPrice * quantity,
            }
          : item,
      ),
    );
  };

  const handleGuardarPedido = async () => {
    if (!items.length || !orderData) return;
    setStatus("submitting");
    try {
      const mainWarehouse = await getMainWarehouse();
      if (!mainWarehouse) {
        showError("No se encontró la sucursal matriz. Contacta a soporte.");
        setStatus("error");
        return;
      }

      const payload = {
        order_type: "external" as const,
        branch_id: mainWarehouse.id,
        order_date: dayjs().format("YYYY-MM-DD"),
        supplier_id: orderData.supplierId
          ? Number(orderData.supplierId)
          : undefined,
        items: items.map((item) => ({
          product_id: item.productId,
          requested_quantity: item.quantity,
          unit_price: item.unitPrice,
          currency: item.currency,
          exchange_rate: item.exchangeRate,
        })),
      };

      const result = await createOrderWithItems(payload);
      if (result.error || !result.data) {
        const msg =
          result.error?.message ||
          "Error al solicitar el pedido. Intenta de nuevo.";
        showError(msg);
        setStatus("error");
        return;
      }

      sessionStorage.removeItem("newPedidoData");
      showSuccess(
        result.data?.message ?? "El pedido fue confirmado correctamente.",
      );
      router.push(`/pedidos/nuevo/resumen/${result.data.id}`);
    } catch {
      showError("Error al solicitar el pedido. Intenta de nuevo.");
      setStatus("error");
    } finally {
      setStatus((prev) => (prev === "submitting" ? "idle" : prev));
    }
  };

  const breadcrumbs: BreadcrumbItem[] = orderData
    ? [
        {
          label: "Pedidos",
          href: "/pedidos",
        },
        {
          label: orderData.supplierName
            ? `Proveedor ${orderData.supplierName}`
            : "Proveedores",
          href: orderData.supplierId
            ? `/pedidos?supplier=${orderData.supplierId}`
            : "/pedidos",
        },
        {
          label: "Nuevo pedido",
        },
      ]
    : [
        {
          label: "Pedidos",
          href: "/pedidos",
        },
        {
          label: "Nuevo pedido",
        },
      ];

  if (status === "loading") {
    return (
      <Stack
        direction="row"
        justifyContent="center"
        alignItems="center"
        sx={{
          minHeight: 400,
        }}
      >
        <CircularProgress />
      </Stack>
    );
  }

  if (status === "empty") {
    return (
      <>
        <Breadcrumbs items={breadcrumbs} showBackButton onBack={handleBack} />
        <Box
          sx={{
            marginTop: 3,
            textAlign: "center",
          }}
        >
          <Typography variant="body1" color="text.secondary">
            No hay artículos para confirmar. Agrega artículos en el nuevo
            pedido.
          </Typography>
          <Button
            variant="contained"
            onClick={handleBack}
            sx={{
              marginTop: 2,
            }}
          >
            Volver a nuevo pedido
          </Button>
        </Box>
      </>
    );
  }

  return (
    <Stack direction="column" spacing={3}>
      <Breadcrumbs items={breadcrumbs} showBackButton onBack={handleBack} />
      <Typography variant="h1">Confirmar artículos</Typography>

      <Grid container spacing={4}>
        <Grid
          size={{
            xs: 12,
            md: 7,
            lg: 8,
            xl: 9,
          }}
        >
          <Stack spacing={2}>
            {items.map((item) => (
              <ItemCard key={item.productId}>
                <Stack
                  width="100%"
                  direction={{ xs: "column", lg: "row" }}
                  spacing={2}
                  alignItems={{ xs: "flex-start", lg: "center" }}
                  justifyContent="space-between"
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <ImageWrapper>
                      {item.previewImage ? (
                        <ProductImage
                          src={item.previewImage}
                          alt={item.productName}
                        />
                      ) : (
                        <ImagePlaceholder />
                      )}
                    </ImageWrapper>
                    <Stack direction="column" spacing={0.5}>
                      <Typography variant="body2" color="text.secondary">
                        {item.productCode}
                      </Typography>
                      <Typography variant="subtitle1">
                        {item.productName}
                      </Typography>
                    </Stack>
                  </Stack>

                  <Stack
                    direction="row"
                    spacing={3}
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Stack direction="column" spacing={0.5}>
                      <Typography variant="body2" color="text.secondary">
                        Precio unitario
                      </Typography>
                      <Typography variant="body1">
                        {formatCurrency(item.unitPrice)}
                      </Typography>
                      {item.currency && item.currency !== "MXN" && (
                        <Typography variant="body2" color="text.secondary">
                          {item.currency} · TC {item.exchangeRate}
                        </Typography>
                      )}
                    </Stack>

                    <Stack direction="column" spacing={0.5}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        textAlign="center"
                      >
                        Cantidad
                      </Typography>
                      <StepperWrapper>
                        <QuantityStepper
                          value={item.quantity}
                          onChange={(qty) =>
                            handleQuantityChange(item.productId, qty)
                          }
                        />
                      </StepperWrapper>
                    </Stack>

                    <Stack direction="column" spacing={0.5}>
                      <Typography variant="body2" color="text.secondary">
                        Total
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {formatCurrency(item.totalPrice)}
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>
              </ItemCard>
            ))}
          </Stack>
        </Grid>

        <Grid
          size={{
            xs: 12,
            md: 5,
            lg: 4,
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
              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={status === "submitting" || items.length === 0}
                onClick={handleGuardarPedido}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                {status === "submitting" ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Guardar pedido"
                )}
              </Button>
            </Stack>
          </SummaryCard>
        </Grid>
      </Grid>
    </Stack>
  );
}
