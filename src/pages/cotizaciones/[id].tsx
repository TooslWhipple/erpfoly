import { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  LinearProgress,
  OutlinedInput,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { Trash2, ScanLine, AlertCircle, MapPin } from "lucide-react";
import { X, Search, ArrowLeft, Minus, Plus } from "@/components/Icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProductDetail, searchProducts } from "@/services/ventas.service";
import {
  getQuotationDetail,
  requestQuotationDiscount,
} from "@/services/cotizaciones.service";
import type { QuotationDetail } from "@/types/cotizaciones.types";
import type { CartItem, NewSaleView, ProductSearchResult } from "@/types/ventas.types";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useDiscountRequestReasonsCatalog } from "@/hooks/useDiscountRequestReasonsCatalog";
import { useSnackbarStore } from "@/store/useSnackbarStore";

const SEARCH_DEBOUNCE_MS = 350;
const ENGANCHE_PCT = 0.1;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(value);
}

const PAYMENT_OPTIONS: { value: "CREDIT" | "CASH" | "LAYAWAY"; label: string }[] = [
  { value: "CREDIT", label: "Crédito" },
  { value: "CASH", label: "Contado" },
  { value: "LAYAWAY", label: "Apartado" },
];

export default function CotizacionDetalle() {
  const router = useRouter();
  const { id } = router.query;
  const quotationId = typeof id === "string" ? parseInt(id, 10) : null;
  const queryClient = useQueryClient();
  const showSuccess = useSnackbarStore((s) => s.showSuccess);
  const showError = useSnackbarStore((s) => s.showError);

  const [view, setView] = useState<NewSaleView>("form");
  const [localCart, setLocalCart] = useState<CartItem[] | null>(null);
  const [localPaymentType, setLocalPaymentType] = useState<"CREDIT" | "CASH" | "LAYAWAY" | null>(null);
  const [localFolypuntos, setLocalFolypuntos] = useState<boolean | null>(null);
  const [clientSearch, setClientSearch] = useState("");

  const [productSearch, setProductSearch] = useState("");
  const debouncedProductSearch = useDebouncedValue(productSearch, SEARCH_DEBOUNCE_MS);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [quantityMap, setQuantityMap] = useState<Record<string, number>>({});

  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  const [discountReasonId, setDiscountReasonId] = useState<number | null>(null);
  const [discountNotes, setDiscountNotes] = useState("");

  const { data: reasonCatalog = [], isLoading: reasonsLoading } =
    useDiscountRequestReasonsCatalog();

  useEffect(() => {
    if (reasonCatalog.length > 0 && discountReasonId === null) {
      setDiscountReasonId(reasonCatalog[0].id);
    }
  }, [reasonCatalog, discountReasonId]);

  const selectedReason = useMemo(
    () => reasonCatalog.find((r) => r.id === discountReasonId) ?? null,
    [reasonCatalog, discountReasonId]
  );

  const canSubmitDiscount = useMemo(() => {
    if (!discountReasonId) return false;
    if (selectedReason?.code === "OTHER") {
      return discountNotes.trim().length >= 3;
    }
    return true;
  }, [discountReasonId, selectedReason, discountNotes]);

  const { data: quotation, isLoading: quotationLoading } = useQuery<QuotationDetail | null>({
    queryKey: ["quotation", quotationId],
    enabled: quotationId !== null,
    queryFn: async () => {
      if (!quotationId) return null;
      const result = await getQuotationDetail(quotationId);
      if (result.error) throw new Error(result.error.message);
      return result.data ?? null;
    },
  });

  const cart = localCart ?? quotation?.items ?? [];
  const paymentType = localPaymentType ?? quotation?.paymentType ?? "CREDIT";
  const folypuntosEnabled = localFolypuntos ?? quotation?.folypuntosEnabled ?? false;

  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ["product-search", debouncedProductSearch],
    enabled: view === "search" && debouncedProductSearch.trim().length > 1,
    queryFn: async () => {
      const result = await searchProducts({ search: debouncedProductSearch, limit: 50 });
      if (result.error) throw new Error(result.error.message);
      return result.data?.rows ?? [];
    },
  });

  const { data: productDetail, isLoading: detailLoading } = useQuery({
    queryKey: ["product-detail", selectedProductId],
    enabled: view === "product-detail" && selectedProductId !== null,
    queryFn: async () => {
      if (!selectedProductId) return null;
      const result = await getProductDetail(selectedProductId);
      if (result.error) throw new Error(result.error.message);
      return result.data ?? null;
    },
  });

  const productSources = useMemo(
    () =>
      (productDetail?.inventorySources ?? []).map((s) => ({
        ...s,
        quantity: quantityMap[s.sourceType] ?? 0,
      })),
    [productDetail, quantityMap]
  );

  const discountMutation = useMutation({
    mutationFn: async () => {
      if (!quotationId) throw new Error("Sin ID");
      const result = await requestQuotationDiscount(quotationId, {
        reasonId: discountReasonId!,
        ...(selectedReason?.code === "OTHER" ? { notes: discountNotes.trim() } : {}),
      });
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      showSuccess("Solicitud de descuento enviada.");
      setDiscountModalOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["quotation", quotationId] });
    },
    onError: (err: Error) => showError(err.message),
  });

  const handleSelectProduct = (product: ProductSearchResult) => {
    setSelectedProductId(product.id);
    setQuantityMap({});
    setView("product-detail");
  };

  const handleAddToCart = useCallback(() => {
    if (!productDetail) return;
    const totalQty = productSources.reduce((s, src) => s + src.quantity, 0);
    if (totalQty === 0) return;
    const newItem: CartItem = {
      productId: productDetail.id,
      sku: productDetail.sku,
      productName: productDetail.name,
      brandName: productDetail.brandName,
      imageUrl: productDetail.imageUrl,
      originalPrice: productDetail.originalPrice,
      discountAmount: productDetail.discountAmount,
      unitPrice: productDetail.finalPrice,
      quantity: totalQty,
      sources: productSources,
    };
    setLocalCart((prev) => {
      const current = prev ?? quotation?.items ?? [];
      const existing = current.findIndex((c) => c.productId === productDetail.id);
      if (existing >= 0) {
        const updated = [...current];
        updated[existing] = { ...updated[existing], quantity: totalQty, sources: productSources };
        return updated;
      }
      return [...current, newItem];
    });
    setView("form");
    setSelectedProductId(null);
    setProductSearch("");
  }, [productDetail, productSources, quotation?.items]);

  const handleQtyChange = (sourceType: string, delta: number) => {
    setQuantityMap((prev) => ({
      ...prev,
      [sourceType]: Math.max(0, (prev[sourceType] ?? 0) + delta),
    }));
  };

  const handleCartQtyChange = (productId: number, delta: number) => {
    setLocalCart((prev) => {
      const current: CartItem[] = prev ?? quotation?.items ?? [];
      return current
        .map((item: CartItem) =>
          item.productId === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item: CartItem) => item.quantity > 0);
    });
  };

  const handleRemoveFromCart = (productId: number) => {
    setLocalCart((prev) => {
      const current: CartItem[] = prev ?? quotation?.items ?? [];
      return current.filter((item: CartItem) => item.productId !== productId);
    });
  };

  const subtotal = cart.reduce((s, item) => s + item.unitPrice * item.quantity, 0);
  const shippingCost = quotation?.shippingCost ?? 0;
  const total = subtotal + shippingCost;
  const enganche = total * ENGANCHE_PCT;

  const folio = quotation?.folio ?? (quotationLoading ? "…" : String(quotationId ?? ""));
  const discountRequest = quotation?.discountRequest ?? null;
  const client = quotation?.client ?? null;
  const delivery = quotation?.delivery ?? null;

  const canProceed = cart.length > 0;

  if (view === "search") {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "grey.50" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            px: 3,
            py: 2,
            bgcolor: "background.paper",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <IconButton size="small" onClick={() => setView("form")}>
            <X size={18} />
          </IconButton>
          <OutlinedInput
            autoFocus
            fullWidth
            size="small"
            placeholder="Buscar artículo"
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            startAdornment={
              <InputAdornment position="start">
                <Search size={16} />
              </InputAdornment>
            }
          />
          <Button variant="outlined" size="small" startIcon={<ScanLine size={16} />} sx={{ whiteSpace: "nowrap" }}>
            Escanear artículos
          </Button>
        </Box>
        <Box sx={{ p: 3 }}>
          <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.50" }}>
                  {["ID", "Img", "Nombre", "Costo Prom.", "Últ. Costo", "Sin Desc.", "% Desc.1", "Proveedor 1", "Proveedor 2"].map((col) => (
                    <TableCell key={col} sx={{ fontWeight: 500, color: "text.secondary", fontSize: "0.8rem" }}>
                      {col}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {searchLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : (searchResults ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 4, color: "text.secondary" }}>
                      {debouncedProductSearch.length < 2 ? "Escribe para buscar artículos" : "Sin resultados"}
                    </TableCell>
                  </TableRow>
                ) : (
                  (searchResults ?? []).map((p: ProductSearchResult) => (
                    <TableRow key={p.id} hover sx={{ cursor: "pointer" }} onClick={() => handleSelectProduct(p)}>
                      <TableCell sx={{ color: "text.secondary", fontSize: "0.8rem" }}>{p.id}</TableCell>
                      <TableCell>
                        <Box component="img" src={p.imageUrl ?? "/placeholder-product.png"} alt={p.name} sx={{ width: 36, height: 36, borderRadius: 1, objectFit: "cover" }} />
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.85rem" }}>{p.name.length > 40 ? `${p.name.slice(0, 40)}…` : p.name}</TableCell>
                      <TableCell sx={{ fontSize: "0.85rem" }}>{formatCurrency(p.averageCost)}</TableCell>
                      <TableCell sx={{ fontSize: "0.85rem" }}>{formatCurrency(p.lastCost)}</TableCell>
                      <TableCell sx={{ fontSize: "0.85rem" }}>{formatCurrency(p.costWithoutDiscount)}</TableCell>
                      <TableCell sx={{ fontSize: "0.85rem" }}>{p.discountPct}%</TableCell>
                      <TableCell sx={{ fontSize: "0.85rem" }}>{p.supplier1Name ?? "—"}</TableCell>
                      <TableCell sx={{ fontSize: "0.85rem" }}>{p.supplier2Name ?? "—"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Paper>
        </Box>
      </Box>
    );
  }

  if (view === "product-detail") {
    const totalQty = productSources.reduce((s, src) => s + src.quantity, 0);
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "grey.50" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 3, py: 2, bgcolor: "background.paper", borderBottom: "1px solid", borderColor: "divider" }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <IconButton size="small" onClick={() => setView("search")}>
              <ArrowLeft size={18} />
            </IconButton>
            <Typography variant="subtitle1" fontWeight={600}>{productDetail?.name ?? "Cargando…"}</Typography>
          </Stack>
          <Button variant="contained" size="small" disabled={totalQty === 0 || !productDetail} onClick={handleAddToCart}>
            Continuar
          </Button>
        </Box>
        {detailLoading || !productDetail ? (
          <Box sx={{ display: "flex", justifyContent: "center", pt: 8 }}><CircularProgress /></Box>
        ) : (
          <Box sx={{ p: 4, display: "flex", gap: 4, alignItems: "flex-start" }}>
            <Paper variant="outlined" sx={{ width: 300, minHeight: 280, flexShrink: 0, borderRadius: 3, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}>
              <Box component="img" src={productDetail.imageUrl ?? "/placeholder-product.png"} alt={productDetail.name} sx={{ maxWidth: "100%", maxHeight: 260, objectFit: "contain" }} />
            </Paper>
            <Box flex={1}>
              <Typography variant="caption" color="text.secondary">Código: {productDetail.sku}</Typography>
              <Typography variant="h5" fontWeight={700} mt={0.5} mb={0.25}>{productDetail.name}</Typography>
              {productDetail.brandName && <Typography variant="body2" color="text.secondary" mb={2}>{productDetail.brandName}</Typography>}
              <Stack direction="row" spacing={4} mb={3}>
                <Box><Typography variant="caption" color="text.secondary">Precio original</Typography><Typography variant="h6" fontWeight={700}>{formatCurrency(productDetail.originalPrice)}</Typography></Box>
                <Box><Typography variant="caption" color="text.secondary">Descuento</Typography><Typography variant="h6" fontWeight={700} color="error.main">-{formatCurrency(productDetail.discountAmount)}</Typography></Box>
                <Box><Typography variant="caption" color="text.secondary">Total</Typography><Typography variant="h6" fontWeight={700}>{formatCurrency(productDetail.finalPrice)}</Typography></Box>
              </Stack>
              <Typography variant="body2" fontWeight={600} mb={2}>Selecciona el origen del artículo a entregar al cliente</Typography>
              <Stack spacing={0}>
                {productSources.map((src, idx) => {
                  const sourceLabel = src.sourceType === "branch" ? "Ésta sucursal" : src.sourceType === "warehouse" ? "Bodega" : "Por surtir a Bodega";
                  const availLabel = src.sourceType === "incoming" ? `Por surtir ${src.available}` : `Existencia: ${src.available}`;
                  return (
                    <Box key={src.sourceType}>
                      {idx > 0 && <Divider />}
                      <Stack direction="row" alignItems="center" justifyContent="space-between" py={1.5}>
                        <Typography variant="body2">{sourceLabel}</Typography>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Typography variant="caption" color="text.secondary">{availLabel}</Typography>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <IconButton size="small" onClick={() => handleQtyChange(src.sourceType, -1)} disabled={src.quantity === 0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, width: 28, height: 28 }}><Minus size={14} /></IconButton>
                            <Typography variant="body2" sx={{ minWidth: 20, textAlign: "center" }}>{src.quantity}</Typography>
                            <IconButton size="small" onClick={() => handleQtyChange(src.sourceType, 1)} disabled={src.sourceType !== "incoming" && src.quantity >= src.available} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, width: 28, height: 28 }}><Plus size={14} /></IconButton>
                          </Stack>
                        </Stack>
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          py: 2,
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconButton size="small" onClick={() => void router.push("/cotizaciones-guardadas")}>
            <X size={18} />
          </IconButton>
          <Typography variant="h6" fontWeight={700}>
            Cotización {folio}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" size="small" sx={{ textTransform: "none" }}>
            Actualizar cotización
          </Button>
          <Button
            variant="outlined"
            size="small"
            sx={{ textTransform: "none" }}
            onClick={() => setDiscountModalOpen(true)}
            disabled={discountRequest !== null}
          >
            Solicitar descuento
          </Button>
          <Button variant="contained" size="small" disabled={!canProceed} sx={{ textTransform: "none" }}>
            Proceder al cobro
          </Button>
        </Stack>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 3, p: 3, alignItems: "start" }}>
        <Stack spacing={2}>
          {discountRequest && (
            <Box
              sx={{
                bgcolor: "#FFF7ED",
                border: "1px solid #FDBA74",
                borderRadius: 2,
                px: 2.5,
                py: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography variant="body2" fontWeight={700}>
                  Descuento solicitado
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Motivo: {discountRequest.reasonLabel}
                </Typography>
                {discountRequest.reasonCode === "OTHER" && discountRequest.notes && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    Nota: {discountRequest.notes}
                  </Typography>
                )}
              </Box>
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <AlertCircle size={14} color="#EA580C" />
                <Typography variant="caption" sx={{ color: "#EA580C", fontWeight: 500 }}>
                  Pendiente de autorización
                </Typography>
              </Stack>
            </Box>
          )}

          <Paper variant="outlined" sx={{ borderRadius: 2, p: 2.5 }}>
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" mb={2}>
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>Artículos</Typography>
                <Typography variant="body2" color="text.secondary">Agrega los artículos para este cliente.</Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" size="small" startIcon={<ScanLine size={16} />} sx={{ textTransform: "none" }}>
                  Escanear artículos
                </Button>
                <Button variant="outlined" size="small" startIcon={<Search size={16} />} sx={{ textTransform: "none" }} onClick={() => setView("search")}>
                  Buscar
                </Button>
              </Stack>
            </Stack>

            {cart.length === 0 ? (
              <Box sx={{ bgcolor: "grey.100", borderRadius: 1.5, py: 5, textAlign: "center" }}>
                <Typography variant="body2" color="text.disabled">No tienes artículos agregados</Typography>
              </Box>
            ) : (
              <>
                <Stack spacing={1.5}>
                  {cart.map((item) => (
                    <Paper key={item.productId} variant="outlined" sx={{ borderRadius: 1.5, p: 2 }}>
                      <Stack direction="row" alignItems="flex-start" spacing={1.5}>
                        <Box component="img" src={item.imageUrl ?? "/placeholder-product.png"} alt={item.productName} sx={{ width: 56, height: 56, borderRadius: 1, objectFit: "cover", flexShrink: 0, bgcolor: "grey.100" }} />
                        <Box flex={1} minWidth={0}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Código: {item.sku}
                          </Typography>
                          <Typography variant="body2" fontWeight={600} noWrap title={item.productName}>
                            {item.productName}
                          </Typography>
                          {item.brandName && (
                            <Typography variant="caption" color="text.secondary">{item.brandName}</Typography>
                          )}
                        </Box>
                        <IconButton size="small" onClick={() => handleRemoveFromCart(item.productId)} sx={{ color: "text.secondary", flexShrink: 0 }}>
                          <Trash2 size={16} />
                        </IconButton>
                      </Stack>

                      <Stack direction="row" alignItems="flex-end" spacing={3} mt={1.5}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>Cantidad</Typography>
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <IconButton size="small" onClick={() => handleCartQtyChange(item.productId, -1)} disabled={item.quantity <= 1} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, width: 26, height: 26 }}>
                              <Minus size={13} />
                            </IconButton>
                            <Typography variant="body2" sx={{ minWidth: 20, textAlign: "center" }}>{item.quantity}</Typography>
                            <IconButton size="small" onClick={() => handleCartQtyChange(item.productId, 1)} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, width: 26, height: 26 }}>
                              <Plus size={13} />
                            </IconButton>
                          </Stack>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>Precio original</Typography>
                          <Typography variant="body2" fontWeight={500}>{formatCurrency(item.originalPrice)}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>Descuento</Typography>
                          <Typography variant="body2" fontWeight={500} color="error.main">-{formatCurrency(item.discountAmount)}</Typography>
                        </Box>
                        <Box ml="auto">
                          <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>Total</Typography>
                          <Typography variant="body2" fontWeight={600}>{formatCurrency(item.unitPrice * item.quantity)}</Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>

                <Box mt={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" py={1.25}>
                    <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                    <Typography variant="body2" fontWeight={500}>{formatCurrency(subtotal)}</Typography>
                  </Stack>
                  {shippingCost > 0 && (
                    <Stack direction="row" justifyContent="space-between" alignItems="center" py={1.25}>
                      <Typography variant="body2" color="text.secondary">Envío</Typography>
                      <Typography variant="body2" fontWeight={500}>{formatCurrency(shippingCost)}</Typography>
                    </Stack>
                  )}
                  <Box sx={{ bgcolor: "grey.100", borderRadius: 1, px: 1.5, py: 1.25, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="body2" fontWeight={600}>Total</Typography>
                    <Typography variant="body2" fontWeight={700}>{formatCurrency(total)}</Typography>
                  </Box>
                  {(paymentType === "CREDIT" || paymentType === "LAYAWAY") && (
                    <Stack direction="row" justifyContent="space-between" alignItems="center" py={1.25}>
                      <Typography variant="body2" color="text.secondary">Enganche solicitado (10%)</Typography>
                      <Typography variant="body2" fontWeight={500}>{formatCurrency(enganche)}</Typography>
                    </Stack>
                  )}
                </Box>
              </>
            )}
          </Paper>
        </Stack>

        <Stack spacing={2}>
          <Paper variant="outlined" sx={{ borderRadius: 2, p: 2.5 }}>
            <Typography variant="subtitle2" fontWeight={700} mb={1.5}>Tipo de venta</Typography>
            <Stack direction="row" spacing={0}>
              {PAYMENT_OPTIONS.map((opt, idx) => (
                <Button
                  key={opt.value}
                  size="small"
                  variant={paymentType === opt.value ? "contained" : "outlined"}
                  onClick={() => setLocalPaymentType(opt.value)}
                  sx={{
                    flex: 1,
                    textTransform: "none",
                    borderRadius: 0,
                    ...(idx === 0 && { borderRadius: "4px 0 0 4px" }),
                    ...(idx === PAYMENT_OPTIONS.length - 1 && { borderRadius: "0 4px 4px 0" }),
                  }}
                >
                  {opt.label}
                </Button>
              ))}
            </Stack>
          </Paper>

          {paymentType === "CREDIT" && client?.folypuntos !== null && (
            <Paper variant="outlined" sx={{ borderRadius: 2, p: 2.5 }}>
              <Typography variant="subtitle2" fontWeight={700} mb={1}>¿Activar Folypuntos?</Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Switch
                  size="small"
                  checked={folypuntosEnabled}
                  onChange={(_, checked) => setLocalFolypuntos(checked)}
                />
                <Typography variant="body2" color="text.secondary">
                  {(client?.folypuntos ?? 0).toLocaleString("es-MX")} puntos disponibles
                </Typography>
              </Stack>
            </Paper>
          )}

          <Paper variant="outlined" sx={{ borderRadius: 2, p: 2.5 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
              <Typography variant="subtitle2" fontWeight={700}>Cliente</Typography>
              {client && <Button variant="text" size="small" sx={{ textTransform: "none", p: 0, minWidth: 0, color: "text.secondary" }}>Cambiar</Button>}
            </Stack>

            {!client ? (
              <>
                <Typography variant="body2" color="text.secondary" mb={1.5}>Agrega los artículos para este cliente.</Typography>
                <OutlinedInput
                  fullWidth
                  size="small"
                  placeholder="Buscar"
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  startAdornment={<InputAdornment position="start"><Search size={16} /></InputAdornment>}
                  sx={{ mb: 1.5 }}
                />
                <Button fullWidth variant="outlined" size="small" startIcon={<Plus size={16} />} sx={{ textTransform: "none", justifyContent: "flex-start" }}>
                  Registrar nuevo cliente
                </Button>
              </>
            ) : (
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="body2" fontWeight={600}>{client.name}</Typography>
                  {client.creditStatus === "ACTIVE" ? (
                    <Box component="span" sx={{ bgcolor: "#DCFCE7", color: "#15803D", borderRadius: 1, px: 1, py: 0.25, fontSize: "0.75rem", fontWeight: 600 }}>
                      Activo
                    </Box>
                  ) : (
                    <Box component="span" sx={{ bgcolor: "grey.100", color: "text.secondary", borderRadius: 1, px: 1, py: 0.25, fontSize: "0.75rem" }}>
                      Inactivo
                    </Box>
                  )}
                </Stack>
                {client.phone && <Typography variant="caption" color="text.secondary">{client.phone}</Typography>}
                {client.email && <Typography variant="caption" color="text.secondary">{client.email}</Typography>}

                {client.creditStatus !== "ACTIVE" && (
                  <Box sx={{ bgcolor: "grey.100", borderRadius: 1, px: 1.5, py: 1, mt: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Este cliente no cuenta con crédito activo.
                    </Typography>
                  </Box>
                )}

                {client.creditStatus === "ACTIVE" && client.creditUsed !== null && client.creditAvailable !== null && (
                  <Box sx={{ mt: 0.5 }}>
                    <Stack direction="row" justifyContent="space-between" mb={0.5}>
                      <Box>
                        <Typography variant="caption" fontWeight={600}>{formatCurrency(client.creditUsed)}</Typography>
                        <Typography variant="caption" color="text.secondary" display="block">Crédito utilizado</Typography>
                      </Box>
                      <Box textAlign="right">
                        <Typography variant="caption" fontWeight={600}>{formatCurrency(client.creditAvailable)}</Typography>
                        <Typography variant="caption" color="text.secondary" display="block">Crédito disponible</Typography>
                      </Box>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(100, (client.creditUsed / (client.creditUsed + client.creditAvailable)) * 100)}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                )}
              </Stack>
            )}
          </Paper>

          {delivery && (
            <Paper variant="outlined" sx={{ borderRadius: 2, p: 2.5 }}>
              <Typography variant="subtitle2" fontWeight={700} mb={1.5}>Entrega</Typography>
              <OutlinedInput
                fullWidth
                size="small"
                readOnly
                value={delivery.type === "home" ? "A domicilio" : "En sucursal"}
                endAdornment={
                  <InputAdornment position="end">
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>∨</Typography>
                  </InputAdornment>
                }
                sx={{ mb: 1.5 }}
              />
              {delivery.latitude && delivery.longitude && (
                <Box
                  sx={{
                    width: "100%",
                    height: 100,
                    borderRadius: 1.5,
                    bgcolor: "grey.200",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 1.5,
                    overflow: "hidden",
                  }}
                >
                  <MapPin size={24} color="#6B7280" />
                </Box>
              )}
              {delivery.address && (
                <>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={0.5}>
                    <Typography variant="caption" color="text.secondary">Dirección de entrega</Typography>
                    <Button variant="text" size="small" sx={{ textTransform: "none", p: 0, minWidth: 0, fontSize: "0.75rem" }}>Cambiar</Button>
                  </Stack>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>{delivery.address}</Typography>
                  {delivery.receiverEmail && <Typography variant="caption" color="text.secondary" display="block">{delivery.receiverEmail}</Typography>}
                </>
              )}
              {delivery.receiverPhone && (
                <Stack direction="row" justifyContent="space-between" alignItems="center" mt={1}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">Teléfono de quien recibe</Typography>
                    <Typography variant="body2">{delivery.receiverPhone}</Typography>
                  </Box>
                  <Button variant="text" size="small" sx={{ textTransform: "none", p: 0, minWidth: 0, fontSize: "0.75rem" }}>Cambiar</Button>
                </Stack>
              )}
            </Paper>
          )}
        </Stack>
      </Box>

      <Dialog open={discountModalOpen} onClose={() => setDiscountModalOpen(false)} maxWidth="sm" fullWidth>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 3, pt: 2.5, pb: 0 }}>
          <DialogTitle sx={{ p: 0 }}>
            <Stack spacing={0.5}>
              <Typography variant="h6" fontWeight={700}>Solicitar descuento especial</Typography>
              <Typography variant="body2" color="text.secondary">
                Se enviará una solicitud a dirección general para validar tu solicitud.
              </Typography>
            </Stack>
          </DialogTitle>
          <IconButton size="small" onClick={() => setDiscountModalOpen(false)}>
            <X size={18} />
          </IconButton>
        </Box>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary" mb={1.5}>
            Selecciona una opción:
          </Typography>
          <Stack spacing={1.5}>
            {reasonsLoading ? (
              <Typography variant="body2" color="text.secondary">
                Cargando motivos...
              </Typography>
            ) : (
              reasonCatalog.map((opt) => {
                const selected = discountReasonId === opt.id;
                const isOther = opt.code === "OTHER";
                return (
                  <Box
                    key={opt.id}
                    onClick={() => setDiscountReasonId(opt.id)}
                    sx={{
                      position: "relative",
                      border: "1px solid",
                      borderColor: selected ? "primary.main" : "divider",
                      borderRadius: 2,
                      p: 2,
                      pr: 5,
                      cursor: "pointer",
                      bgcolor: selected ? "primary.50" : "background.paper",
                      "&:hover": { borderColor: "primary.light" },
                    }}
                  >
                    <Typography variant="body2" fontWeight={600} mb={opt.description ? 0.5 : 0}>
                      {opt.name}
                    </Typography>
                    {opt.description && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        {opt.description}
                      </Typography>
                    )}
                    {isOther && (
                      <TextField
                        multiline
                        rows={2}
                        fullWidth
                        size="small"
                        placeholder="Ingresa otro motivo"
                        value={discountNotes}
                        disabled={!selected}
                        onChange={(e) => setDiscountNotes(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        sx={{ mt: 1 }}
                      />
                    )}
                    <Box
                      sx={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        bgcolor: selected ? "primary.main" : "transparent",
                        border: selected ? "none" : "1px solid",
                        borderColor: "divider",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {selected && (
                        <Typography sx={{ color: "white", fontSize: 13, lineHeight: 1 }}>
                          ✓
                        </Typography>
                      )}
                    </Box>
                  </Box>
                );
              })
            )}
          </Stack>
        </DialogContent>
        <Box sx={{ display: "flex", gap: 1.5, px: 3, py: 2.5 }}>
          <Button
            variant="contained"
            onClick={() => discountMutation.mutate()}
            disabled={discountMutation.isPending || !canSubmitDiscount}
          >
            Solicitar descuento especial
          </Button>
          <Button variant="text" onClick={() => setDiscountModalOpen(false)}>
            Cancelar
          </Button>
        </Box>
      </Dialog>
    </Box>
  );
}
