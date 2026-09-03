import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
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
  invoiceDownloadButtonSx,
  SaleSuccessAlert,
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
  printSaleInvoicePdfOnly,
  getInvoicingConfig,
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
import { SaleBuilder, BackorderChip } from "@/components/SaleBuilder";
import { formatCreditInstallmentPlan } from "@/utils/creditInstallmentPlan";
import { isCashRegisterReturnQuery } from "@/lib/cashRegisterRoutes";
import { usePermissions } from "@/hooks/usePermissions";
import { CASH_REGISTERS_READ } from "@/lib/permissions";
import {
  CASH_REGISTER_SESSION_SUMMARY_KEY,
  invalidateCashRegisterQueries,
} from "@/lib/cashRegisterQueries";

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
  const { hasPermission } = usePermissions();
  const canAccessCashRegisters = hasPermission(CASH_REGISTERS_READ);

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

  const fromCajas = isCashRegisterReturnQuery(router.query);

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
  const needsCashierSession =
    fromCajas || Boolean(sale?.layaway && sale.layaway.status === "ACTIVE");

  const activeSessionQuery = useQuery({
    queryKey: CASH_REGISTER_SESSION_SUMMARY_KEY,
    queryFn: () => getSessionSummary(),
    enabled: needsCashierSession,
    retry: false,
    staleTime: 60_000,
  });
  const hasOpenCashierSession = activeSessionQuery.data?.status === "OPEN";
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
      if (isCashRegisterReturnQuery(router.query)) {
        invalidateCashRegisterQueries(queryClient);
      }
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

  const deliveryAddressCoords = useMemo(() => {
    if (sale?.deliveryType !== "ADDRESS") return null;
    const hasPersistedDeliveryCoords =
      sale.deliveryAddressLatitude != null &&
      sale.deliveryAddressLongitude != null;
    const latitude = hasPersistedDeliveryCoords
      ? sale.deliveryAddressLatitude
      : sale.client?.primaryAddress?.latitude;
    const longitude = hasPersistedDeliveryCoords
      ? sale.deliveryAddressLongitude
      : sale.client?.primaryAddress?.longitude;
    if (latitude == null || longitude == null) return null;
    const lat = Number(latitude);
    const lng = Number(longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
  }, [sale]);

  if (isLoading) {
    return (
      <DetailPageShell>
        <DetailHeader>
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="text" width={220} height={36} />
        </DetailHeader>
        <DetailGrid>
          <Skeleton variant="rounded" height={200} />
          <Skeleton variant="rounded" height={300} />
        </DetailGrid>
      </DetailPageShell>
    );
  }

  if (isError || !sale) {
    return (
      <DetailPageShell>
        <DetailHeader>
          <InlineMobileMenuButton />
          <Typography variant="h6" fontWeight={700}>
            Detalle de la venta
          </Typography>
        </DetailHeader>
        <DetailGrid>
          <Alert severity="error">No se pudo cargar la venta.</Alert>
        </DetailGrid>
      </DetailPageShell>
    );
  }

  const isPendingCashierWork = sale.status === "PENDING_CASHIER";
  const canCollectFromCaja =
    fromCajas && hasOpenCashierSession && isPendingCashierWork;

  if (fromCajas && isPendingCashierWork && activeSessionQuery.isLoading) {
    return (
      <DetailPageShell>
        <DetailHeader>
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="text" width={220} height={36} />
        </DetailHeader>
        <DetailGrid>
          <Skeleton variant="rounded" height={200} />
        </DetailGrid>
      </DetailPageShell>
    );
  }

  if (canCollectFromCaja) {
    return (
      <SaleBuilder
        resumeSaleId={saleId}
        onExit={() => void router.push("/cajas")}
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
  const creditInstallmentPlan = sale.credit
    ? formatCreditInstallmentPlan(
        sale.credit.installments ?? [],
        formatCurrency,
      )
    : null;

  return (
    <DetailPageShell>
      <DetailHeader>
        <InlineMobileMenuButton />
        <IconButton
          size="small"
          onClick={() => router.push(fromCajas ? "/cajas" : "/ventas")}
          aria-label={fromCajas ? "Volver a cajas" : "Volver a ventas"}
        >
          <X size={18} />
        </IconButton>
        <Typography variant="h6" fontWeight={700} noWrap sx={{ minWidth: 0 }}>
          Detalle de la venta
        </Typography>
        {isSaleCancelled && (
          <StatusChip label="Cancelada" size="small" variant="error" />
        )}
      </DetailHeader>

      <DetailGrid>
        <Box>
          {isPendingCashierWork && !fromCajas && (
            <Alert
              severity="info"
              sx={{ mb: 2 }}
              action={
                canAccessCashRegisters ? (
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => void router.push("/cajas")}
                  >
                    Ir a caja
                  </Button>
                ) : undefined
              }
            >
              Esta venta está pendiente de cobro en caja.
            </Alert>
          )}
          {fromCajas && isPendingCashierWork && !hasOpenCashierSession && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Abre tu caja para procesar el cobro de esta venta.
            </Alert>
          )}
          {isNew && (
            <SaleSuccessAlert
              severity="success"
              variant="outlined"
              icon={<CheckCircle size={18} aria-hidden />}
            >
              Venta registrada con éxito
            </SaleSuccessAlert>
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
                      {sale.deliveryType === 'BRANCH'
                        ? 'Entrega en sucursal'
                        : sale.deliveryType === 'ADDRESS'
                          ? 'Entrega a domicilio'
                          : 'Entrega'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {sale.deliveryType === 'BRANCH'
                        ? sale.deliveryBranchName ?? 'Sucursal no especificada'
                        : sale.deliveryType === 'ADDRESS'
                          ? sale.deliveryAddressFormatted ??
                            sale.client?.primaryAddress?.formatted ??
                            'Dirección no especificada'
                          : 'Tipo de entrega no definido'}
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
                          <BackorderChip
                            backorderedQuantity={item.backorderedQuantity}
                            quantity={item.quantity}
                            sx={{ mt: 0.5 }}
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
                              px: 2,
                              py: 1,
                              display: "flex",
                              alignItems: "center",
                              gap: 1.25,
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

                <InvoiceActionsGrid>
                  <Button
                    fullWidth
                    variant="option"
                    color="inherit"
                    size="small"
                    startIcon={<FileCode size={15} />}
                    disabled={downloadingType === "xml"}
                    onClick={() => handleDownloadInvoice("xml")}
                    sx={invoiceDownloadButtonSx}
                  >
                    XML
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<FileText size={15} />}
                    disabled={downloadingType === "pdf"}
                    onClick={() => handleDownloadInvoice("pdf")}
                    sx={invoiceDownloadButtonSx}
                  >
                    PDF
                  </Button>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={<Archive size={15} />}
                    disabled={downloadingType === "zip"}
                    onClick={() => handleDownloadInvoice("zip")}
                    sx={invoiceDownloadButtonSx}
                  >
                    ZIP
                  </Button>
                </InvoiceActionsGrid>
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
                  {`Artículos [${sale.items.reduce((sum, item) => sum + item.quantity, 0)}]`}
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
                          <BackorderChip
                            backorderedQuantity={item.backorderedQuantity}
                            quantity={item.quantity}
                            sx={{ mt: 0.5 }}
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
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                          Monto a financiar
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {formatCurrency(sale.credit.financedAmount)}
                        </Typography>
                      </Stack>
                      {creditInstallmentPlan && (
                        <Box sx={{ bgcolor: "grey.100", borderRadius: 1, px: 2, py: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {creditInstallmentPlan}
                          </Typography>
                        </Box>
                      )}
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

                  {sale.layaway.status === "ACTIVE" && hasOpenCashierSession && (
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

                  {sale.deliveryType === "ADDRESS" &&
                    (sale.deliveryAddressFormatted ||
                      sale.client.primaryAddress) && (
                    <Box mt={2}>
                      {deliveryAddressCoords && googleMapsBrowserApiKey ? (
                        <Box sx={{ mb: 1.5 }}>
                          <StaticLocationMap
                            coords={deliveryAddressCoords}
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
                          sx={{
                            textTransform: "none",
                            minWidth: "auto",
                            px: 1,
                            py: 0.25,
                            fontWeight: 500,
                          }}
                          onClick={() => setAddressModalOpen(true)}
                        >
                          Cambiar
                        </Button>
                      </Stack>
                      <Typography variant="body2" mt={0.5}>
                        {sale.deliveryAddressFormatted ??
                          sale.client.primaryAddress?.formatted}
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
          if (sale?.deliveryType === "BRANCH") {
            setDateMutation.mutate({
              delivery_date: date,
              delivery_type: "BRANCH",
              branch_id: sale.deliveryBranchId ?? undefined,
            });
            return;
          }
          setDateMutation.mutate({
            delivery_date: date,
            delivery_type: "ADDRESS",
            address_id:
              sale?.deliveryAddressId ?? sale?.client?.primaryAddress?.id,
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
