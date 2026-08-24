import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  MenuItem,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  Archive,
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  FileCode,
  FileText,
  Store,
  Truck,
  X,
  XCircle,
} from "lucide-react";
import { StatusChip } from "@/components";
import { InlineMobileMenuButton } from "@/components/Layout";
import type { StatusChipVariant } from "@/components/StatusChip/styles";
import {
  DetailGrid,
  DetailHeader,
  DetailPageShell,
  InvoiceActionsGrid,
} from "@/styles/ventas/detalle.styles";
import dayjs from "@/lib/dayjs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSaleDetail,
  setDeliveryDate,
  removeDeliveryDate,
  registerLayawayPayment,
  completeLayaway,
  cancelLayaway,
  downloadSaleInvoiceFile,
  downloadInvoiceFileById,
  printSaleInvoicePdfOnly,
  getInvoicingConfig,
  retryInvoiceBilling,
} from "@/services/ventas.service";
import { getPaymentTerminalsCatalog } from "@/services/payment-terminals.service";
import { getSessionSummary } from "@/services/cash-register.service";
import { googleMapsBrowserApiKey } from "@/config/maps";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { useInvoicingConfigStore } from "@/store/useInvoicingConfigStore";
import { DeliveryAddressModal } from "@/components/DeliveryAddressModal";
import { StaticLocationMap } from "@/components/StaticLocationMap";
import { DeliveryDatePicker } from "@/components/DeliveryDatePicker";
import { SaleBuilder } from "@/components/SaleBuilder";

function layawayStatusMeta(status: string): {
  label: string;
  variant: StatusChipVariant;
} {
  switch (status) {
    case "ACTIVE":
      return { label: "Activo", variant: "info" };
    case "COMPLETED":
      return { label: "Completado", variant: "success" };
    case "EXPIRED":
      return { label: "Vencido", variant: "error" };
    case "CANCELLED":
      return { label: "Cancelado", variant: "disabled" };
    default:
      return { label: status, variant: "default" };
  }
}

function paymentMethodLabel(method: string) {
  switch (method) {
    case "CASH":
      return "Efectivo";
    case "CARD":
      return "Tarjeta";
    case "TRANSFER":
      return "Transferencia";
    case "LOYALTY_POINTS":
      return "Foly Puntos";
    case "MIXED":
      return "Mixto";
    default:
      return method;
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(value);
}

export default function VentaDetalle() {
  const theme = useTheme();
  const router = useRouter();
  const { id, nuevo } = router.query;
  const saleId = id ? Number(id) : null;
  const isNew = nuevo === "1";

  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [downloadingType, setDownloadingType] = useState<"xml" | "pdf" | "zip" | null>(null);

  const queryClient = useQueryClient();
  const snackbar = useSnackbarStore();

  const { data: invoicingConfig } = useQuery({
    queryKey: ["invoicingConfig"],
    queryFn: getInvoicingConfig,
  });

  const isFacturacionConfirmacionEncendida = invoicingConfig?.facturacionConfirmacionVentaEnabled ?? true;

  const handleDownloadInvoice = async (type: "xml" | "pdf" | "zip") => {
    if (!saleId) return;
    setDownloadingType(type);
    try {
      await downloadSaleInvoiceFile(saleId, type);
      snackbar.showSuccess(`Archivo ${type.toUpperCase()} descargado con éxito`);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        `No se pudo descargar el archivo ${type.toUpperCase()} de la factura`;
      snackbar.showError(msg);
    } finally {
      setDownloadingType(null);
    }
  };

  const [downloadingSpecificId, setDownloadingSpecificId] = useState<string | null>(null);

  const handleDownloadSpecificInvoice = async (invoiceId: number, type: "xml" | "pdf" | "zip", uuid?: string | null) => {
    const key = `${invoiceId}-${type}`;
    setDownloadingSpecificId(key);
    try {
      await downloadInvoiceFileById(invoiceId, type, uuid);
      snackbar.showSuccess(`Archivo ${type.toUpperCase()} descargado con éxito`);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        `No se pudo descargar el archivo ${type.toUpperCase()} de la factura`;
      snackbar.showError(msg);
    } finally {
      setDownloadingSpecificId(null);
    }
  };

  const { data: sale, isLoading, isError } = useQuery({
    queryKey: ["venta-detail", saleId],
    enabled: saleId !== null && !isNaN(saleId!),
    queryFn: async () => {
      const res = await getSaleDetail(saleId!);
      if (res.error) throw new Error(res.error.message);
      return res.data!;
    },
  });

  const [autoPrinted, setAutoPrinted] = useState(false);

  useEffect(() => {
    if (isNew && saleId && sale && !autoPrinted) {
      setAutoPrinted(true);
      if (isFacturacionConfirmacionEncendida) {
        printSaleInvoicePdfOnly(saleId).catch((err) => {
          console.warn("No se pudo desplegar la impresión de la factura en automático:", err);
        });
      }
    }
  }, [isNew, saleId, sale, autoPrinted, isFacturacionConfirmacionEncendida]);

  const retryMutation = useMutation({
    mutationFn: (invoiceId: number) => retryInvoiceBilling(invoiceId),
    onSuccess: (res) => {
      if (res.error) {
        snackbar.showError(res.error.message || "No se pudo reintentar el timbrado");
      } else {
        snackbar.showSuccess("Reintento de timbrado iniciado con éxito");
        queryClient.invalidateQueries({ queryKey: ["venta-detail", saleId] });
      }
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Ocurrió un error al reintentar el timbrado";
      snackbar.showError(msg);
    },
  });

  const setDateMutation = useMutation({
    mutationFn: (payload: {
      delivery_date: string;
      delivery_type?: 'ADDRESS' | 'BRANCH';
      address_id?: number;
      branch_id?: number;
    }) => setDeliveryDate(saleId!, payload),
    onSuccess: (_data: unknown, payload) => {
      const confirmed = dayjs(payload.delivery_date);
      const confirmedMonth = confirmed.month() + 1;
      const confirmedYear = confirmed.year();

      const oldDate = sale?.deliveryDate ? dayjs(sale.deliveryDate) : null;
      if (
        oldDate &&
        (oldDate.month() + 1 !== confirmedMonth || oldDate.year() !== confirmedYear)
      ) {
        queryClient.invalidateQueries({
          queryKey: [
            "delivery-availability",
            oldDate.month() + 1,
            oldDate.year(),
            sale?.branchId,
          ],
        });
      }

      queryClient.invalidateQueries({ queryKey: ["venta-detail", saleId] });
      queryClient.invalidateQueries({
        queryKey: [
          "delivery-availability",
          confirmedMonth,
          confirmedYear,
          sale?.branchId,
        ],
      });
      snackbar.showSuccess("Fecha de entrega guardada");
      setDeliveryModalOpen(false);
    },
    onError: (_err: Error, payload) => {
      // Interceptor in lib/axios already showed the error snackbar.
      // Only invalidate cache so the calendar reflects real availability.
      const confirmed = dayjs(payload.delivery_date);
      queryClient.invalidateQueries({
        queryKey: [
          "delivery-availability",
          confirmed.month() + 1,
          confirmed.year(),
          sale?.branchId,
        ],
      });
    },
  });

  const removeDateMutation = useMutation({
    mutationFn: () => removeDeliveryDate(saleId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["venta-detail", saleId] });
      if (sale?.deliveryDate) {
        const [y, m] = sale.deliveryDate.split("-").map(Number);
        queryClient.invalidateQueries({
          queryKey: ["delivery-availability", m, y, sale?.branchId],
        });
      }
      snackbar.showSuccess("Fecha de entrega eliminada");
    },
    onError: () => {
      // Interceptor in lib/axios already showed the error snackbar.
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: (address: { id: number }) =>
      setDeliveryDate(saleId!, {
        delivery_type: "ADDRESS",
        address_id: address.id,
        // Solo se está cambiando la dirección; se conserva la fecha ya
        // comprometida, o se propone mañana si aún no había ninguna.
        delivery_date: sale?.deliveryDate ?? dayjs().add(1, "day").format("YYYY-MM-DD"),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["venta-detail", saleId] });
      snackbar.showSuccess("Dirección de entrega actualizada");
      setAddressModalOpen(false);
    },
    onError: () => {
      // Interceptor in lib/axios already showed the error snackbar.
    },
  });

  const [layawayAmount, setLayawayAmount] = useState("");
  const [layawayMethod, setLayawayMethod] = useState<"CASH" | "CARD" | "TRANSFER">("CASH");
  const [layawayTerminalId, setLayawayTerminalId] = useState<number | null>(null);
  const [cancelLayawayModalOpen, setCancelLayawayModalOpen] = useState(false);

  const isLayawayCardPayment = layawayMethod === "CARD";

  // La sucursal desde la que se está cobrando el abono (caja activa del
  // cajero), no la sucursal original del apartado — pueden diferir.
  const activeSessionQuery = useQuery({
    queryKey: ["cash-register-session-summary"],
    queryFn: () => getSessionSummary(),
    enabled: isLayawayCardPayment,
    staleTime: 60_000,
  });
  const activeBranchId = activeSessionQuery.data?.branch_id ?? null;

  const layawayTerminalsQuery = useQuery({
    queryKey: ["payment-terminals-catalog", activeBranchId],
    queryFn: () => getPaymentTerminalsCatalog(activeBranchId!),
    enabled: isLayawayCardPayment && activeBranchId != null,
    staleTime: 60_000,
  });

  const registerLayawayPaymentMutation = useMutation({
    mutationFn: async (payload: {
      amount: number;
      payment_method: "CASH" | "CARD" | "TRANSFER";
      payment_terminal_id?: number;
    }) => {
      if (!sale?.layaway) throw new Error("Este apartado no existe");
      const res = await registerLayawayPayment(sale.layaway.id, payload);
      if (res.error) throw new Error(res.error.message);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["venta-detail", saleId] });
      snackbar.showSuccess("Abono registrado");
      setLayawayAmount("");
    },
    onError: (err: Error) => snackbar.showError(err.message),
  });

  const completeLayawayMutation = useMutation({
    mutationFn: async () => {
      if (!sale?.layaway) throw new Error("Este apartado no existe");
      const res = await completeLayaway(sale.layaway.id);
      if (res.error) throw new Error(res.error.message);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["venta-detail", saleId] });
      snackbar.showSuccess("Apartado completado");
    },
    onError: (err: Error) => snackbar.showError(err.message),
  });

  const cancelLayawayMutation = useMutation({
    mutationFn: async () => {
      if (!sale?.layaway) throw new Error("Este apartado no existe");
      const res = await cancelLayaway(sale.layaway.id);
      if (res.error) throw new Error(res.error.message);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["venta-detail", saleId] });
      snackbar.showSuccess("Apartado cancelado");
      setCancelLayawayModalOpen(false);
    },
    onError: (err: Error) => snackbar.showError(err.message),
  });

  const primaryCoords = useMemo(() => {
    if (!sale?.client?.primaryAddress) return null;
    const { latitude, longitude } = sale.client.primaryAddress;
    if (!latitude || !longitude) return null;
    const lat = Number(latitude);
    const lng = Number(longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
  }, [sale]);

  if (isLoading) {
    return (
      <DetailPageShell sx={{ p: 3 }}>
        <Stack direction="row" spacing={2} mb={3}>
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="text" width={220} height={36} />
        </Stack>
        <DetailGrid>
          <Skeleton variant="rounded" height={200} />
          <Skeleton variant="rounded" height={300} />
        </DetailGrid>
      </DetailPageShell>
    );
  }

  if (isError || !sale) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">No se pudo cargar la venta.</Alert>
      </Box>
    );
  }

  // Venta ya registrada por el vendedor (contado/crédito) o apartado activo
  // aún en cobro: el cajero la completa en SaleBuilder modo cajero (carrito
  // bloqueado, solo la sección de cobro es interactiva) en vez de la vista
  // de solo-detalle de abajo.
  const isPendingCashierWork =
    sale.status === "PENDING_CASHIER" ||
    (sale.status === "PENDING_PAYMENT" && sale.layaway != null);

  if (isPendingCashierWork) {
    return (
      <SaleBuilder
        resumeSaleId={saleId}
        onExit={() => void router.push("/ventas")}
        mode="cajero"
      />
    );
  }

  const layawayRemaining = sale.layaway
    ? Math.max(0, sale.layaway.totalAmount - sale.layaway.paidAmount)
    : 0;
  const layawayAmountNum =
    parseFloat(layawayAmount.replace(/[^0-9.]/g, "")) || 0;
  const layawayChange =
    layawayMethod === "CASH"
      ? Math.max(0, layawayAmountNum - layawayRemaining)
      : 0;
  const isPendingLayaway = sale.layaway?.status === "ACTIVE";
  const isSaleCancelled = sale.status === "CANCELLED";
  const isDraftSale = sale.status === "DRAFT";

  return (
    <DetailPageShell sx={{ p: { xs: 2, md: 3 } }}>
      <DetailHeader>
        <InlineMobileMenuButton />
        <IconButton
          size="medium"
          onClick={() => router.push("/ventas")}
          aria-label="Volver a ventas"
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1.5,
            bgcolor: "background.paper",
          }}
        >
          <X size={18} />
        </IconButton>
        <Typography variant="h5" fontWeight={700}>
          Detalle de la venta
        </Typography>
        {isSaleCancelled && (
          <StatusChip label="Cancelada" size="small" variant="error" />
        )}
      </DetailHeader>

      <Divider sx={{ mb: 3, borderColor: "divider" }} />

      <DetailGrid>
        <Box>
          {isNew && (
            <Alert
              icon={<CheckCircle size={18} color={theme.palette.success.main} />}
              severity="success"
              sx={{
                mb: 3,
                fontWeight: 500,
                bgcolor: "success.light",
                borderRadius: 2,
                py: 1,
                px: 1.5,
                color: "text.primary",
                "& .MuiAlert-icon": { color: "success.main", mr: 1 },
              }}
            >
              Venta registrada con éxito
            </Alert>
          )}
          <Card
            elevation={0}
            sx={{
              borderRadius: 2,
              bgcolor: "background.paper",
              border: "1px solid", borderColor: "divider",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              {isSaleCancelled ? (
                <Stack direction="row" spacing={1.5} alignItems="flex-start" mb={3}>
                  <Box
                    sx={{
                      bgcolor: theme.palette.app.chip.variants.error.background,
                      borderRadius: 2,
                      p: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <XCircle size={20} color={theme.palette.error.main} />
                  </Box>
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      Venta cancelada
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Esta venta fue cancelada y ya no puede modificarse.
                    </Typography>
                  </Box>
                </Stack>
              ) : isPendingLayaway ? (
                <Stack direction="row" spacing={1.5} alignItems="flex-start" mb={3}>
                  <Box
                    sx={{
                      bgcolor: theme.palette.app.chip.variants.infoAlt.background,
                      borderRadius: 2,
                      p: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Clock size={20} color={theme.palette.warning.main} />
                  </Box>
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      Venta de tipo apartado
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Podrás definir una fecha de entrega una vez liquidada la compra.
                    </Typography>
                  </Box>
                </Stack>
              ) : !sale.deliveryDate ? (
                <Stack direction="row" spacing={1.5} alignItems="flex-start" mb={3}>
                  <Box
                    sx={{
                      bgcolor: theme.palette.app.background.lowerBlue,
                      borderRadius: 2,
                      p: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Truck size={20} color={theme.palette.primary.main} />
                  </Box>
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      Ingresa la fecha deseada de entrega para los artículos
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Confirma con el cliente cuál será la fecha en la que desea
                      recibir los artículos
                    </Typography>
                  </Box>
                </Stack>
              ) : (
                <Stack direction="row" spacing={1.5} alignItems="center" mb={3}>
                  <Box
                    sx={{
                      bgcolor: theme.palette.app.background.lowerBlue,
                      borderRadius: 2,
                      p: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {sale.deliveryType === 'BRANCH' ? (
                      <Store size={20} color={theme.palette.primary.main} />
                    ) : (
                      <Truck size={20} color={theme.palette.primary.main} />
                    )}
                  </Box>
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      {sale.deliveryType === 'BRANCH' ? 'Entrega en sucursal' : 'Entrega a domicilio'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {sale.deliveryType === 'BRANCH'
                        ? sale.deliveryBranchName ?? 'Sucursal no especificada'
                        : sale.deliveryAddressFormatted ??
                        sale.client?.primaryAddress?.formatted ??
                        'Dirección del cliente'}
                    </Typography>
                    {sale.estimatedDeliveryDate && sale.deliveryStatus !== 'DELIVERED' && (
                      <Typography variant="body2" color="text.secondary">
                        Fecha estimada: {dayjs(sale.estimatedDeliveryDate).format('DD/MM/YYYY')}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              )}

              <Stack spacing={1.5}>
                {sale.items.map((item) => {
                  const selectedDate = sale?.deliveryDate ? dayjs(sale.deliveryDate) : null;
                  const formattedDate = selectedDate
                    ? selectedDate
                      .format("dddd D [de] MMMM[,] YYYY")
                      .replace(/^\w/, (c: string) => c.toUpperCase())
                    : null;

                  return (
                    <Stack
                      key={item.id}
                      direction="row"
                      alignItems="center"
                      spacing={2}
                      sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                        p: 1.5,
                      }}
                    >
                      <Box
                        component="img"
                        src={item.product.imageUrl ?? "/placeholder-product.png"}
                        alt={item.product.name}
                        sx={{
                          width: 64,
                          height: 64,
                          objectFit: "contain",
                          borderRadius: 1,
                          border: "1px solid",
                          borderColor: "divider",
                          bgcolor: "white",
                          flexShrink: 0,
                        }}
                      />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          Código: {item.product.code}
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          noWrap
                          title={item.product.name}
                        >
                          {item.product.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          Cantidad: {item.quantity}
                        </Typography>
                        {item.backorderedQuantity > 0 && (
                          <Chip
                            icon={<AlertTriangle size={12} />}
                            label={`${item.backorderedQuantity} de ${item.quantity} en backorder`}
                            size="small"
                            color="warning"
                            variant="outlined"
                            sx={{ mt: 0.5, height: 22, fontSize: "0.6875rem" }}
                          />
                        )}
                      </Box>
                      {!isPendingLayaway && !isSaleCancelled && (
                        <Box
                          sx={{ flexShrink: 0 }}
                          onClick={() => setDeliveryModalOpen(true)}
                        >
                          <Box
                            sx={{
                              border: "1px solid",
                              borderColor: "primary.main",
                              borderRadius: 1.5,
                              px: 1.5,
                              py: 0.75,
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              cursor: "pointer",
                              color: "primary.main",
                              fontWeight: 500,
                              fontSize: "0.85rem",
                              minWidth: formattedDate ? 200 : 130,
                            }}
                          >
                            {formattedDate ?? "Seleccionar fecha"}
                            <Calendar size={16} />
                          </Box>
                        </Box>
                      )}
                    </Stack>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>
        </Box>

        <Box>
          <Typography variant="h6" fontWeight={700} mb={2}>
            Resumen de la venta
          </Typography>

          {/* Card para descarga de Factura (XML, PDF y ZIP) */}
          {!isDraftSale && isFacturacionConfirmacionEncendida && (
            <Card
              elevation={0}
              sx={{
                borderRadius: 2,
                bgcolor: "background.paper",
                border: "1px solid", borderColor: "divider",
                mb: 2,
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Typography variant="subtitle2" fontWeight={700} mb={1}>
                  Facturación (CFDI)
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                  Descarga de archivos fiscales almacenados en el sistema
                </Typography>

                {sale?.invoices && sale.invoices.length > 0 ? (
                  sale.invoices.map((invoice: any) => (
                    <Box
                      key={invoice.id}
                      sx={{
                        p: 1.5,
                        mb: 1.5,
                        borderRadius: 1.5,
                        border: "1px solid",
                        borderColor: "divider",
                        bgcolor: "background.lowerGray",
                      }}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                        <Typography variant="body2" fontWeight={700}>
                          {invoice.invoiceType === "VENTA" ? "Factura de Venta" : "Complemento de Pago (Abono)"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight={500}>
                          {invoice.documento ? `${invoice.documento}` : `ID: ${invoice.id}`}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                        <Typography variant="caption" color="text.secondary">
                          Monto: ${Number(invoice.amount ?? 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                        </Typography>
                        <Typography
                          variant="caption"
                          color={invoice.status === "FAILED" ? "error" : "text.secondary"}
                          fontWeight={invoice.status === "FAILED" ? 700 : 400}
                        >
                          Estado: {
                            invoice.status === "GENERATED" ? "GENERADA" :
                            invoice.status === "FAILED" ? "ERROR EN TIMBRADO" :
                            invoice.status === "PENDING" ? "PENDIENTE" : invoice.status
                          }
                        </Typography>
                      </Box>
                      {invoice.status === "FAILED" && (
                        <Alert
                          severity="error"
                          sx={{ mt: 0.5, mb: 1.5, p: 0.75, fontSize: "0.725rem", borderRadius: 1, display: "flex", alignItems: "center" }}
                          action={
                            <Button
                              color="error"
                              size="small"
                              variant="contained"
                              onClick={() => retryMutation.mutate(invoice.id)}
                              disabled={retryMutation.isPending}
                              sx={{ fontSize: "0.65rem", py: 0.25, px: 1, minHeight: 24, minWidth: 60, color: "#fff", textTransform: "none" }}
                            >
                              {retryMutation.isPending ? "Reintentando..." : "Reintentar"}
                            </Button>
                          }
                        >
                          <strong>Error:</strong> {invoice.errorMessage || "Error desconocido al timbrar."}
                        </Alert>
                      )}
                      <InvoiceActionsGrid>
                        <Button
                          fullWidth
                          variant="outlined"
                          color="inherit"
                          size="small"
                          startIcon={<FileCode size={15} />}
                          disabled={
                            invoice.status === "PENDING" ||
                            invoice.status === "FAILED" ||
                            downloadingSpecificId === `${invoice.id}-xml`
                          }
                          onClick={() => handleDownloadSpecificInvoice(invoice.id, "xml", invoice.uuid)}
                          sx={{ minHeight: 36, fontSize: "0.75rem" }}
                        >
                          XML
                        </Button>
                        <Button
                          fullWidth
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<FileText size={15} />}
                          disabled={downloadingSpecificId === `${invoice.id}-pdf`}
                          onClick={() => handleDownloadSpecificInvoice(invoice.id, "pdf", invoice.uuid)}
                          sx={{ minHeight: 36, fontSize: "0.75rem" }}
                        >
                          PDF
                        </Button>
                        <Button
                          fullWidth
                          variant="contained"
                          color="primary"
                          size="small"
                          startIcon={<Archive size={15} />}
                          disabled={
                            invoice.status === "PENDING" ||
                            invoice.status === "FAILED" ||
                            downloadingSpecificId === `${invoice.id}-zip`
                          }
                          onClick={() => handleDownloadSpecificInvoice(invoice.id, "zip", invoice.uuid)}
                          sx={{ minHeight: 36, fontSize: "0.75rem", color: "#fff" }}
                        >
                          ZIP
                        </Button>
                      </InvoiceActionsGrid>
                    </Box>
                  ))
                ) : (
                  <Typography variant="caption" color="text.secondary" display="block" align="center" py={2}>
                    No hay facturas registradas para esta venta.
                  </Typography>
                )}
              </CardContent>
            </Card>
          )}

          <Stack spacing={2}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 2,
                bgcolor: "background.lowerGray",
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
                  Artículos [{sale.items.length}]
                </Typography>
                <Stack spacing={1.5}>
                  {sale.items.map((item) => (
                    <Stack
                      key={item.id}
                      direction="row"
                      spacing={1.5}
                      alignItems="center"
                    >
                      <Box
                        component="img"
                        src={
                          item.product.imageUrl ?? "/placeholder-product.png"
                        }
                        alt={item.product.name}
                        sx={{
                          width: 48,
                          height: 48,
                          objectFit: "contain",
                          borderRadius: 1,
                          bgcolor: "grey.50",
                          flexShrink: 0,
                        }}
                      />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          Código: {item.product.code}
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          noWrap
                          title={item.product.name}
                        >
                          {item.product.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          Cantidad: {item.quantity}
                        </Typography>
                        {item.backorderedQuantity > 0 && (
                          <Chip
                            icon={<AlertTriangle size={12} />}
                            label={`${item.backorderedQuantity} de ${item.quantity} en backorder`}
                            size="small"
                            color="warning"
                            variant="outlined"
                            sx={{ mt: 0.5, height: 22, fontSize: "0.6875rem" }}
                          />
                        )}
                      </Box>
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
            </Card>

            <Card
              elevation={0}
              sx={{
                borderRadius: 2,
                bgcolor: "background.lowerGray",
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Typography variant="subtitle2" fontWeight={700} mb={2}>
                  Pago
                </Typography>
                <Stack spacing={1.5}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Subtotal
                    </Typography>
                    <Typography variant="body2">
                      {formatCurrency(sale.subtotal)}
                    </Typography>
                  </Stack>
                  {sale.discountAmount > 0 && (
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Descuentos
                      </Typography>
                      <Typography variant="body2" color="error.main">
                        -{formatCurrency(sale.discountAmount)}
                      </Typography>
                    </Stack>
                  )}
                  {sale.loyaltyPointsValue > 0 && (
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Descuento Foly Puntos
                      </Typography>
                      <Typography variant="body2" color="error.main">
                        -{formatCurrency(sale.loyaltyPointsValue)}
                      </Typography>
                    </Stack>
                  )}
                  <Stack direction="row" justifyContent="space-between">
                    <Typography
                      variant={sale.credit ? "body2" : "body1"}
                      color={sale.credit ? "text.secondary" : undefined}
                      fontWeight={sale.credit ? undefined : 700}
                    >
                      {sale.credit ? "Total" : "Total:"}
                    </Typography>
                    <Typography
                      variant={sale.credit ? "body2" : "body1"}
                      fontWeight={sale.credit ? undefined : 700}
                    >
                      {formatCurrency(sale.totalAmount)}
                    </Typography>
                  </Stack>

                  {sale.credit && (
                    <>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" fontWeight={700}>
                          Enganche:
                        </Typography>
                        <Typography variant="h6" fontWeight={700}>
                          {formatCurrency(sale.credit.downPayment)}
                        </Typography>
                      </Stack>
                      <Box sx={{ bgcolor: "grey.100", borderRadius: 1, px: 2, py: 1 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" color="text.secondary">
                            {sale.credit.termMonths} Meses de
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {formatCurrency(sale.credit.installmentAmount)}
                          </Typography>
                        </Stack>
                      </Box>
                    </>
                  )}
                </Stack>
              </CardContent>
            </Card>

            {sale.layaway && (
              <Card
                elevation={0}
                sx={{
                  borderRadius: 2,
                  bgcolor: "background.lowerGray",
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      Apartado
                    </Typography>
                    {(() => {
                      const meta = layawayStatusMeta(sale.layaway.status);
                      return (
                        <StatusChip
                          label={meta.label}
                          size="small"
                          variant={meta.variant}
                        />
                      );
                    })()}
                  </Stack>

                  <Stack spacing={1} mb={2}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Plazo
                      </Typography>
                      <Typography variant="body2">
                        {sale.layaway.termName} ({sale.layaway.termDays} días)
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Fecha límite
                      </Typography>
                      <Typography variant="body2">
                        {dayjs(sale.layaway.expiresAt).format("D [de] MMMM, YYYY")}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Total
                      </Typography>
                      <Typography variant="body2">
                        {formatCurrency(sale.layaway.totalAmount)}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Pagado
                      </Typography>
                      <Typography variant="body2" color="success.main">
                        {formatCurrency(sale.layaway.paidAmount)}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="h6" fontWeight={700}>
                        Restante
                      </Typography>
                      <Typography variant="h6" fontWeight={700}>
                        {formatCurrency(layawayRemaining)}
                      </Typography>
                    </Stack>
                  </Stack>

                  {sale.layaway.payments.length > 0 && (
                    <Box mb={2}>
                      <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                        Historial de abonos
                      </Typography>
                      <Stack spacing={0.75}>
                        {sale.layaway.payments.map((p) => (
                          <Stack key={p.id} direction="row" justifyContent="space-between">
                            <Typography variant="caption" color="text.secondary">
                              {dayjs(p.createdAt).format("DD/MM/YYYY HH:mm")} · {paymentMethodLabel(p.paymentMethod)}
                            </Typography>
                            <Typography variant="caption" fontWeight={600}>
                              {formatCurrency(p.amount)}
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {sale.layaway.status === "ACTIVE" && (
                    <>
                      <Divider sx={{ mb: 2 }} />
                      <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                        Registrar abono
                      </Typography>
                      <Stack direction="row" spacing={1} mb={1.5}>
                        <TextField
                          size="small"
                          placeholder="0.00"
                          value={layawayAmount}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9.]/g, "");
                            const parts = val.split(".");
                            setLayawayAmount(
                              parts.length > 2
                                ? parts[0] + "." + parts.slice(1).join("")
                                : val
                            );
                          }}
                          sx={{ flex: 1 }}
                        />
                        <TextField
                          select
                          size="small"
                          value={layawayMethod}
                          onChange={(e) => {
                            setLayawayMethod(e.target.value as "CASH" | "CARD" | "TRANSFER");
                            setLayawayTerminalId(null);
                          }}
                          sx={{ width: 150 }}
                        >
                          <MenuItem value="CASH">Efectivo</MenuItem>
                          <MenuItem value="CARD">Tarjeta</MenuItem>
                          <MenuItem value="TRANSFER">Transferencia</MenuItem>
                        </TextField>
                      </Stack>
                      {isLayawayCardPayment && (
                        <TextField
                          select
                          size="small"
                          fullWidth
                          value={layawayTerminalId ?? ""}
                          onChange={(e) => setLayawayTerminalId(Number(e.target.value) || null)}
                          disabled={layawayTerminalsQuery.isLoading}
                          sx={{ mb: 1.5 }}
                        >
                          <MenuItem value="" disabled>
                            {layawayTerminalsQuery.isLoading
                              ? "Cargando terminales..."
                              : "Selecciona una terminal"}
                          </MenuItem>
                          {(layawayTerminalsQuery.data ?? []).map((terminal) => (
                            <MenuItem key={terminal.id} value={terminal.id}>
                              {terminal.name} ({terminal.bank})
                            </MenuItem>
                          ))}
                          {layawayTerminalsQuery.data?.length === 0 && (
                            <MenuItem value="" disabled>
                              Esta sucursal no tiene terminales activas
                            </MenuItem>
                          )}
                        </TextField>
                      )}
                      {layawayMethod === "CASH" && (
                        <Stack direction="row" justifyContent="space-between" mb={1.5}>
                          <Typography variant="body2" color="text.secondary">
                            Cambio
                          </Typography>
                          <Typography variant="subtitle1">
                            {formatCurrency(layawayChange)}
                          </Typography>
                        </Stack>
                      )}
                      <Button
                        fullWidth
                        variant="outlined"
                        disabled={
                          layawayAmountNum <= 0 ||
                          (layawayAmountNum > layawayRemaining && layawayMethod !== "CASH") ||
                          (isLayawayCardPayment && !layawayTerminalId) ||
                          registerLayawayPaymentMutation.isPending
                        }
                        onClick={() =>
                          registerLayawayPaymentMutation.mutate({
                            amount:
                              layawayMethod === "CASH"
                                ? Math.min(layawayAmountNum, layawayRemaining)
                                : layawayAmountNum,
                            payment_method: layawayMethod,
                            payment_terminal_id: layawayTerminalId ?? undefined,
                          })
                        }
                        sx={{ textTransform: "none", mb: 1 }}
                      >
                        {registerLayawayPaymentMutation.isPending ? "Registrando..." : "Registrar abono"}
                      </Button>
                      <Button
                        fullWidth
                        variant="contained"
                        disabled={layawayRemaining > 0 || completeLayawayMutation.isPending}
                        onClick={() => completeLayawayMutation.mutate()}
                        sx={{ textTransform: "none", mb: 1 }}
                      >
                        {completeLayawayMutation.isPending ? "Completando..." : "Completar apartado"}
                      </Button>
                      <Button
                        fullWidth
                        variant="text"
                        color="error"
                        onClick={() => setCancelLayawayModalOpen(true)}
                        sx={{ textTransform: "none" }}
                      >
                        Cancelar apartado
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {sale.client && (
              <Card
                elevation={0}
                sx={{
                  borderRadius: 2,
                  bgcolor: "background.lowerGray",
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
                    Cliente
                  </Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {sale.client.fullName}
                  </Typography>
                  {sale.client.phoneNumber && (
                    <Typography variant="body2" color="text.secondary" mt={0.25}>
                      {sale.client.phoneNumber}
                    </Typography>
                  )}
                  {sale.client.email && (
                    <Typography variant="body2" color="text.secondary">
                      {sale.client.email}
                    </Typography>
                  )}

                  {sale.client.primaryAddress && (
                    <Box mt={2}>
                      {primaryCoords && googleMapsBrowserApiKey ? (
                        <Box sx={{ mb: 1.5 }}>
                          <StaticLocationMap
                            coords={primaryCoords}
                            apiKey={googleMapsBrowserApiKey}
                            height={160}
                            borderRadius={2}
                          />
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            width: "100%",
                            height: 160,
                            bgcolor: "grey.100",
                            borderRadius: 2,
                            mb: 1.5,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Typography variant="caption" color="text.disabled">
                            Sin coordenadas registradas
                          </Typography>
                        </Box>
                      )}
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          Dirección de entrega
                        </Typography>
                        <Button
                          size="small"
                          sx={{ textTransform: "none", minWidth: 0, p: 0, fontWeight: 500 }}
                          onClick={() => setAddressModalOpen(true)}
                        >
                          Cambiar
                        </Button>
                      </Stack>
                      <Typography variant="body2" mt={0.5}>
                        {sale.deliveryAddressFormatted ?? sale.client.primaryAddress.formatted}
                      </Typography>
                      {sale.client.email && (
                        <Typography variant="caption" color="text.secondary" display="block" mt={0.25}>
                          {sale.client.email}
                        </Typography>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            )}
          </Stack>
        </Box>
      </DetailGrid>

      <DeliveryDatePicker
        open={deliveryModalOpen}
        onClose={() => setDeliveryModalOpen(false)}
        branchId={sale?.branchId ?? undefined}
        value={sale?.deliveryDate ?? null}
        onConfirm={(date) => {
          setDateMutation.mutate({
            delivery_date: date,
            // Sin tipo/sucursal/dirección propios ya guardados en la
            // venta (sale.deliveryType === null), este flujo asume
            // domicilio a la dirección principal del cliente, igual
            // que el comportamiento previo de esta pantalla.
            address_id: sale?.client?.primaryAddress?.id,
          });
        }}
        onRemove={sale?.deliveryDate ? () => removeDateMutation.mutate() : undefined}
        confirmLoading={setDateMutation.isPending}
        removeLoading={removeDateMutation.isPending}
      />

      <DeliveryAddressModal
        open={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        onSaved={(address) => updateAddressMutation.mutate(address)}
      />

      <ConfirmModal
        open={cancelLayawayModalOpen}
        onClose={() => setCancelLayawayModalOpen(false)}
        onConfirm={async () => {
          await cancelLayawayMutation.mutateAsync();
        }}
        loading={cancelLayawayMutation.isPending}
        title="Cancelar apartado"
        description="Esta acción cancelará el apartado y liberará el inventario reservado. ¿Deseas continuar?"
        confirmLabel="Cancelar apartado"
        cancelLabel="Volver"
        confirmColor="error"
      />
    </DetailPageShell>
  );
}
