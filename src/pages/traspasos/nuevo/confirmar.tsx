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
import {
  SummaryCard,
  ItemCard,
  ImageWrapper,
  ProductImage,
  ImagePlaceholder,
} from "@/styles/traspasos/confirmar.styles";
import { createOrderWithItems } from "@/services/orders.service";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import dayjs from "@/lib/dayjs";

interface ConfirmTraspasoItem {
  productId: number;
  productCode: string;
  productName: string;
  previewImage?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface ConfirmTraspasoData {
  branchId?: string;
  branchName?: string;
  originBranchId?: string;
  originBranchName?: string;
  items: ConfirmTraspasoItem[];
  total: number;
}

export default function ConfirmarTraspasoPage() {
  const router = useRouter();
  const [traspasoData, setTraspasoData] = useState<ConfirmTraspasoData | null>(
    null,
  );
  const [items, setItems] = useState<ConfirmTraspasoItem[]>([]);
  const [status, setStatus] = useState<
    "loading" | "idle" | "submitting" | "empty" | "error"
  >("loading");
  const { showError, showSuccess } = useSnackbarStore();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = sessionStorage.getItem("newTraspasoData");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as ConfirmTraspasoData;
        if (parsed.items?.length) {
          setTraspasoData(parsed);
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

  const totalQuantity = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const handleBack = () => {
    router.push({
      pathname: "/traspasos/nuevo",
      query: {
        orderType: "internal",
        originBranchId: traspasoData?.originBranchId,
        originBranchName: traspasoData?.originBranchName,
        branchId: traspasoData?.branchId,
        branchName: traspasoData?.branchName,
      },
    });
  };

  const handleSolicitarTraspaso = async () => {
    if (!items.length || !traspasoData) return;
    setStatus("submitting");
    try {
      if (!traspasoData.branchId) {
        showError(
          "Falta la sucursal de destino. Vuelve al formulario e intenta de nuevo.",
        );
        setStatus("error");
        return;
      }
      if (!traspasoData.originBranchId) {
        showError(
          "Falta la sucursal de origen. Vuelve al formulario e intenta de nuevo.",
        );
        setStatus("error");
        return;
      }
      if (
        Number(traspasoData.originBranchId) === Number(traspasoData.branchId)
      ) {
        showError("La sucursal de origen y destino deben ser distintas.");
        setStatus("error");
        return;
      }

      const payload = {
        order_type: "internal" as const,
        branch_id: Number(traspasoData.branchId),
        origin_branch_id: Number(traspasoData.originBranchId),
        folio: `PED-${Date.now()}`,
        order_date: dayjs().format("YYYY-MM-DD"),
        items: items.map((item) => ({
          product_id: item.productId,
          requested_quantity: item.quantity,
          unit_price: item.unitPrice,
        })),
      };

      const result = await createOrderWithItems(payload);
      if (result.error || !result.data) {
        const msg =
          result.error?.message ||
          "Error al solicitar el traspaso. Intenta de nuevo.";
        showError(msg);
        setStatus("error");
        return;
      }

      sessionStorage.removeItem("newTraspasoData");
      showSuccess(
        result.data?.message ?? "El traspaso fue confirmado correctamente.",
      );
      router.push("/traspasos");
    } catch {
      showError("Error al solicitar el traspaso. Intenta de nuevo.");
      setStatus("error");
    } finally {
      setStatus((prev) => (prev === "submitting" ? "idle" : prev));
    }
  };

  const breadcrumbs: BreadcrumbItem[] = traspasoData
    ? [
        {
          label: "Traspasos",
          href: "/traspasos",
        },
        {
          label: traspasoData.branchName
            ? `Sucursal ${traspasoData.branchName}`
            : "Sucursales",
          href: traspasoData.branchId
            ? `/traspasos?branch=${traspasoData.branchId}`
            : "/traspasos",
        },
        {
          label: "Nuevo traspaso",
        },
      ]
    : [
        {
          label: "Traspasos",
          href: "/traspasos",
        },
        {
          label: "Nuevo traspaso",
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
            traspaso.
          </Typography>
          <Button
            variant="contained"
            onClick={handleBack}
            sx={{
              marginTop: 2,
            }}
          >
            Volver a nuevo traspaso
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

                  <Stack direction="column" spacing={0.5}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      textAlign="center"
                    >
                      Cantidad
                    </Typography>
                    <Typography
                      variant="body1"
                      fontWeight={600}
                      textAlign="center"
                    >
                      {item.quantity}
                    </Typography>
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
                  Total:
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {totalQuantity}{" "}
                  {totalQuantity > 1 ? "Artículos" : "Artículo"}
                </Typography>
              </Stack>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={status === "submitting" || items.length === 0}
                onClick={handleSolicitarTraspaso}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                {status === "submitting" ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Solicitar traspaso"
                )}
              </Button>
            </Stack>
          </SummaryCard>
        </Grid>
      </Grid>
    </Stack>
  );
}
