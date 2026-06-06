import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
  Paper,
} from "@mui/material";
import { Trash2, ScanLine, Pencil, RefreshCw } from "lucide-react";
import {
  X,
  Search,
  ArrowLeft,
  Plus,
  Store,
  Warehouse,
  Truck,
  Package,
} from "@/components/Icons";
import NumberSpinner from "@/components/NumberSpinner";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getProductDetail,
  searchProducts,
  getPurchaseTypes,
  createSaleDraft,
  addSaleItem,
  registerSalePayment,
  confirmSalePayment,
} from "@/services/ventas.service";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { getClients } from "@/services/clients.service";
import type { CartItem, NewSaleView, ProductSearchResult } from "@/types/ventas.types";
import type { Client } from "@/services/clients.service";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { SideModal } from "@/components/SideModal/SideModal";
import { TableCrud } from "@/components/TableCrud";

const SEARCH_DEBOUNCE_MS = 350;

// TODO: Obtener branch real de la sesion de caja activa
const CURRENT_BRANCH_ID = 2;
const CURRENT_BRANCH_NAME = "Matriz Culiacán Centro";
const CURRENT_BRANCH_ADDRESS = "";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(value);
}

export default function NuevaVenta() {
  const router = useRouter();

  const [view, setView] = useState<NewSaleView>("form");
  const [paymentType, setPaymentType] = useState<"CREDIT" | "CASH" | "LAYAWAY">("CREDIT");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [clientSearch, setClientSearch] = useState("");
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [clientModalSearch, setClientModalSearch] = useState("");
  const [clientModalPage, setClientModalPage] = useState(0);
  const [clientModalLimit, setClientModalLimit] = useState(10);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">("delivery");
  const [wantsInvoice, setWantsInvoice] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card">("cash");
  const [billingModalOpen, setBillingModalOpen] = useState(false);
  const [billingData, setBillingData] = useState<{
    rfc: string;
    businessName: string;
    address: string;
    postalCode: string;
    email: string;
  } | null>(null);
  const [billingForm, setBillingForm] = useState({
    rfc: "",
    businessName: "",
    address: "",
    postalCode: "",
    email: "",
  });

  const [productSearch, setProductSearch] = useState("");
  const [productPage, setProductPage] = useState(0);
  const [productLimit, setProductLimit] = useState(10);
  const debouncedProductSearch = useDebouncedValue(productSearch, SEARCH_DEBOUNCE_MS);

  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [quantityMap, setQuantityMap] = useState<Record<string, number>>({});
  const [showOtherBranches, setShowOtherBranches] = useState(false);

  const { data: productSearchData, isLoading: searchLoading } = useQuery({
    queryKey: ["product-search", debouncedProductSearch, productPage, productLimit],
    enabled: view === "search",
    queryFn: async () => {
      const result = await searchProducts({
        search: debouncedProductSearch.trim().length > 1 ? debouncedProductSearch : undefined,
        page: productPage + 1,
        limit: productLimit,
      });
      if (result.error) throw new Error(result.error.message);
      return result.data ?? { rows: [], total: 0, page: 1, limit: 10 };
    },
  });

  const { data: productDetail, isLoading: detailLoading } = useQuery({
    queryKey: ["product-detail", selectedProductId, showOtherBranches],
    enabled: view === "product-detail" && selectedProductId !== null,
    queryFn: async () => {
      if (!selectedProductId) return null;
      const result = await getProductDetail(
        selectedProductId,
        CURRENT_BRANCH_ID,
        showOtherBranches,
      );
      if (result.error) throw new Error(result.error.message);
      return result.data ?? null;
    },
  });

  const debouncedClientModalSearch = useDebouncedValue(clientModalSearch, SEARCH_DEBOUNCE_MS);
  const snackbar = useSnackbarStore();

  const { data: purchaseTypesRes } = useQuery({
    queryKey: ["purchase-types"],
    queryFn: async () => {
      const res = await getPurchaseTypes();
      if (res.error) throw new Error(res.error.message);
      return res.data ?? [];
    },
    staleTime: Infinity,
  });
  const purchaseTypes = purchaseTypesRes ?? [];

  const PT_MAP: Record<string, string[]> = {
    CASH: ["CONTADO", "CASH", "EFECTIVO"],
    CREDIT: ["CREDITO", "CREDIT", "CRÉDITO"],
    LAYAWAY: ["APARTADO", "LAYAWAY", "APART"],
  };

  const cobrarMutation = useMutation({
    mutationFn: async () => {
      const keywords = PT_MAP[paymentType] ?? [];
      const pt = purchaseTypes.find((p) =>
        keywords.some((k) => p.code.toUpperCase().includes(k))
      ) ?? purchaseTypes[0];
      if (!pt) throw new Error("No se encontró el tipo de compra");

      const draftRes = await createSaleDraft({
        branch_id: CURRENT_BRANCH_ID,
        purchase_type_id: pt.id,
        client_id: selectedClient?.id,
        origin: "STORE",
      });
      if (draftRes.error) throw new Error(draftRes.error.message);
      const saleId = draftRes.data!.id;

      for (const item of cart) {
        const itemRes = await addSaleItem(saleId, {
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          discount_amount: item.discountAmount > 0 ? item.discountAmount : undefined,
        });
        if (itemRes.error) throw new Error(itemRes.error.message);
      }

      const paymentRes = await registerSalePayment(saleId, {
        payment_method: paymentMethod === "cash" ? "CASH" : "CARD",
        amount: totalFinal,
        received_amount: paymentMethod === "cash" ? payAmtNum : undefined,
        change_amount: paymentMethod === "cash" ? change : undefined,
      });
      if (paymentRes.error) throw new Error(paymentRes.error.message);

      const confirmRes = await confirmSalePayment(saleId);
      if (confirmRes.error) throw new Error(confirmRes.error.message);
      return confirmRes.data!;
    },
    onSuccess: (data) => {
      snackbar.showSuccess(`Venta ${data.folio} registrada exitosamente`);
      void router.push("/ventas");
    },
    onError: (err: Error) => {
      snackbar.showError(err.message);
    },
  });

  const { data: clientSearchData, isLoading: clientSearchLoading } = useQuery({
    queryKey: ["client-search", debouncedClientModalSearch, clientModalPage, clientModalLimit],
    enabled: clientModalOpen,
    queryFn: async () => {
      const result = await getClients({
        search: debouncedClientModalSearch.trim().length > 1 ? debouncedClientModalSearch : undefined,
        page: clientModalPage + 1,
        limit: clientModalLimit,
      });
      if (result.error) throw new Error(result.error.message);
      return result.data ?? { rows: [], total: 0, page: 1, limit: 10 };
    },
  });

  const productSources = useMemo(
    () =>
      (productDetail?.inventorySources ?? []).map((s) => ({
        ...s,
        quantity: quantityMap[s.sourceKey] ?? 0,
      })),
    [productDetail, quantityMap]
  );

  const handleSelectProduct = (product: ProductSearchResult) => {
    setSelectedProductId(product.id);
    setQuantityMap({});
    setShowOtherBranches(false);
    setView("product-detail");
  };

  const handleAddToCart = useCallback(() => {
    if (!productDetail) return;
    const totalQty = productSources.reduce((s, src) => s + src.quantity, 0);
    if (totalQty === 0) return;

    setCart((prev) => {
      const existing = prev.findIndex((c) => c.productId === productDetail.id);
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
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { ...updated[existing], quantity: totalQty, sources: productSources };
        return updated;
      }
      return [...prev, newItem];
    });
    setView("form");
    setSelectedProductId(null);
    setShowOtherBranches(false);
    setProductSearch("");
  }, [productDetail, productSources]);

  const handleCartQtyChange = (productId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const handleQtyChange = (sourceKey: string, delta: number) => {
    setQuantityMap((prev) => ({
      ...prev,
      [sourceKey]: Math.max(0, (prev[sourceKey] ?? 0) + delta),
    }));
  };

  const totalCartQty = cart.reduce((s, item) => s + item.quantity, 0);
  const canProceed = totalCartQty > 0;

  const subtotal = cart.reduce((s, item) => s + item.unitPrice * item.quantity, 0);
  const subtotalOriginal = cart.reduce((s, item) => s + item.originalPrice * item.quantity, 0);
  const totalDiscounts = cart.reduce((s, item) => s + item.discountAmount * item.quantity, 0);
  const totalFinal = subtotalOriginal - totalDiscounts;
  const payAmtNum = parseFloat(paymentAmount.replace(/[^0-9.]/g, "")) || 0;
  const change = Math.max(0, payAmtNum - totalFinal);
  const ENGANCHE_PCT = 0.1;
  const enganche = subtotal * ENGANCHE_PCT;

  const PAYMENT_OPTIONS: { value: "CREDIT" | "CASH" | "LAYAWAY"; label: string }[] = [
    { value: "CREDIT", label: "Crédito" },
    { value: "CASH", label: "Contado" },
    { value: "LAYAWAY", label: "Apartado" },
  ];

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
            placeholder="Sala esquinera"
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            startAdornment={
              <InputAdornment position="start">
                <Search size={16} />
              </InputAdornment>
            }
            sx={{ bgcolor: "background.paper" }}
          />
          <Button
            variant="outlined"
            size="small"
            startIcon={<ScanLine size={16} />}
            sx={{ whiteSpace: "nowrap" }}
          >
            Escanear artículos
          </Button>
        </Box>

        <Box sx={{ p: 3 }}>
          <TableCrud<ProductSearchResult>
            columns={[
              { id: "id", label: "ID", type: "id", size: "xs" },
              {
                id: "imageUrl",
                label: "Img",
                type: "text",
                size: "xs",
                format: (value) => (
                  <Box
                    component="img"
                    src={(value as string | null) ?? "/placeholder-product.png"}
                    sx={{ width: 36, height: 36, borderRadius: 1, objectFit: "cover" }}
                  />
                ),
              },
              { id: "name", label: "Nombre", type: "text", size: "lg", truncate: true },
              { id: "averageCost", label: "Costo Prom.", type: "currency", size: "md" },
              { id: "lastCost", label: "Últ. Costo", type: "currency", size: "md" },
              { id: "costWithoutDiscount", label: "Costo sin Desc.", type: "currency", size: "md" },
              { id: "discountPct", label: "% Desc.1", type: "percentage", size: "sm" },
              { id: "supplier1Name", label: "Proveedor 1", type: "text", size: "md" },
              { id: "supplier2Name", label: "Proveedor 2", type: "text", size: "md" },
            ]}
            rows={productSearchData?.rows ?? []}
            loading={searchLoading}
            emptyMessage="No se encontraron artículos"
            rowKey="id"
            page={productPage}
            rowsPerPage={productLimit}
            totalRows={productSearchData?.total ?? 0}
            onPageChange={setProductPage}
            onRowsPerPageChange={setProductLimit}
            onRowClick={handleSelectProduct}
          />
        </Box>
      </Box>
    );
  }

  if (view === "product-detail") {
    const totalQty = productSources.reduce((s, src) => s + src.quantity, 0);

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
            <IconButton
              size="small"
              onClick={() => {
                setShowOtherBranches(false);
                setView("search");
              }}
            >
              <ArrowLeft size={18} />
            </IconButton>
            <Typography variant="subtitle1" fontWeight={600}>
              {productDetail?.name ?? "Cargando…"}
            </Typography>
          </Stack>
          <Button
            variant="contained"
            size="small"
            disabled={totalQty === 0 || !productDetail}
            onClick={handleAddToCart}
          >
            Continuar
          </Button>
        </Box>

        {detailLoading || !productDetail ? (
          <Box sx={{ display: "flex", justifyContent: "center", pt: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box
            sx={{
              p: 3,
              display: "flex",
              gap: 2,
              alignItems: "flex-start",
            }}
          >
            {/* Box imagen — separado */}
            <Paper
              variant="outlined"
              sx={{
                width: 380,
                flexShrink: 0,
                borderRadius: 3,
                bgcolor: "background.paper",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: 3,
                minHeight: 360,
              }}
            >
              <Box
                component="img"
                src={productDetail.imageUrl ?? "/placeholder-product.png"}
                alt={productDetail.name}
                sx={{ maxWidth: "100%", maxHeight: 340, objectFit: "contain" }}
              />
            </Paper>

            {/* Box detalle — separado */}
            <Paper
              variant="outlined"
              sx={{
                flex: 1,
                borderRadius: 3,
                bgcolor: "background.paper",
                p: 4,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Código: {productDetail.sku}
              </Typography>
              <Typography variant="h5" fontWeight={700} mt={0.5} mb={0.25}>
                {productDetail.name}
              </Typography>
              {productDetail.brandName && (
                <Typography variant="body2" color="text.secondary" mb={2}>
                  {productDetail.brandName}
                </Typography>
              )}

              <Stack direction="row" spacing={4} mb={3} mt={1.5}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Precio original
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {formatCurrency(productDetail.originalPrice)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Descuento
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="error.main">
                    -{formatCurrency(productDetail.discountAmount)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Total
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {formatCurrency(productDetail.finalPrice)}
                  </Typography>
                </Box>
              </Stack>

              <Typography variant="body2" fontWeight={600} mb={1.5}>
                Selecciona el origen del artículo a entregar al cliente
              </Typography>

              {/* Orígenes principales: sucursal actual + bodega + por surtir */}
              <Stack spacing={1.5}>
                {productSources
                  .filter(
                    (src) =>
                      src.sourceType === "warehouse" ||
                      src.sourceType === "incoming" ||
                      src.branchId === CURRENT_BRANCH_ID
                  )
                  .map((src) => {
                    const isWarehouse = src.sourceType === "warehouse";
                    const isIncoming = src.sourceType === "incoming";
                    const isCurrentBranch =
                      src.sourceType === "branch" &&
                      src.branchId === CURRENT_BRANCH_ID;

                    const sourceLabel = isCurrentBranch
                      ? `Ésta sucursal (${src.label})`
                      : isWarehouse
                      ? "Bodega"
                      : "Por surtir a Bodega";

                    const SourceIcon =
                      isCurrentBranch ? Store : isWarehouse ? Warehouse : Package;

                    return (
                      <Box
                        key={src.sourceKey}
                        sx={{
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: 2,
                          px: 2,
                          py: 1.75,
                        }}
                      >
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Box sx={{ color: "text.secondary", display: "flex" }}>
                              <SourceIcon size={16} />
                            </Box>
                            <Typography variant="body2">{sourceLabel}</Typography>
                          </Stack>

                          <Stack direction="row" alignItems="center" spacing={2.5}>
                            <Stack direction="row" alignItems="center" spacing={2}>
                              {isWarehouse && (
                                <>
                                  <Stack direction="row" alignItems="center" spacing={0.75}>
                                    <Box sx={{ color: "text.disabled", display: "flex" }}>
                                      <Truck size={13} />
                                    </Box>
                                    <Typography variant="caption" color="text.secondary">
                                      En tránsito: {src.inTransit ?? 0}
                                    </Typography>
                                  </Stack>
                                  <Stack direction="row" alignItems="center" spacing={0.75}>
                                    <Box sx={{ color: "text.disabled", display: "flex" }}>
                                      <Package size={13} />
                                    </Box>
                                    <Typography variant="caption" color="text.secondary">
                                      Existencia: {src.available}
                                    </Typography>
                                  </Stack>
                                </>
                              )}
                              {isIncoming && (
                                <Stack direction="row" alignItems="center" spacing={0.75}>
                                  <Box sx={{ color: "text.disabled", display: "flex" }}>
                                    <Package size={13} />
                                  </Box>
                                  <Typography variant="caption" color="text.secondary">
                                    Por surtir: {src.available}
                                  </Typography>
                                </Stack>
                              )}
                              {isCurrentBranch && (
                                <Stack direction="row" alignItems="center" spacing={0.75}>
                                  <Box sx={{ color: "text.disabled", display: "flex" }}>
                                    <Package size={13} />
                                  </Box>
                                  <Typography variant="caption" color="text.secondary">
                                    Existencia: {src.available}
                                  </Typography>
                                </Stack>
                              )}
                            </Stack>

                            <NumberSpinner
                              value={src.quantity}
                              onChange={(val: number) =>
                                handleQtyChange(src.sourceKey, val - src.quantity)
                              }
                              min={0}
                              max={
                                src.sourceType === "incoming"
                                  ? undefined
                                  : src.available
                              }
                              size="small"
                              iconSize={13}
                            />
                          </Stack>
                        </Stack>
                      </Box>
                    );
                  })}
              </Stack>

              {!showOtherBranches && productDetail?.hasOtherBranches && (
                <Button
                  variant="text"
                  size="small"
                  onClick={() => setShowOtherBranches(true)}
                  sx={{ mt: 1.5, textTransform: "none", px: 0 }}
                >
                  Consultar existencia en otras sucursales
                </Button>
              )}

              {showOtherBranches && (
                <>
                  <Typography variant="body2" fontWeight={600} mt={2} mb={1.5}>
                    Existencia en otras sucursales
                  </Typography>
                  <Stack spacing={1.5}>
                    {productSources
                      .filter(
                        (src) =>
                          src.sourceType === "branch" &&
                          src.branchId !== CURRENT_BRANCH_ID
                      )
                      .map((src) => (
                        <Box
                          key={src.sourceKey}
                          sx={{
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 2,
                            px: 2,
                            py: 1.75,
                          }}
                        >
                          <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                          >
                            <Stack direction="row" alignItems="center" spacing={1.5}>
                              <Box sx={{ color: "text.secondary", display: "flex" }}>
                                <Store size={16} />
                              </Box>
                              <Typography variant="body2">{src.label}</Typography>
                            </Stack>

                            <Stack direction="row" alignItems="center" spacing={2.5}>
                              <Stack direction="row" alignItems="center" spacing={0.75}>
                                <Box sx={{ color: "text.disabled", display: "flex" }}>
                                  <Package size={13} />
                                </Box>
                                <Typography variant="caption" color="text.secondary">
                                  Existencia: {src.available}
                                </Typography>
                              </Stack>

                              <NumberSpinner
                                value={src.quantity}
                                onChange={(val: number) =>
                                  handleQtyChange(src.sourceKey, val - src.quantity)
                                }
                                min={0}
                                max={src.available}
                                size="small"
                                iconSize={13}
                              />
                            </Stack>
                          </Stack>
                        </Box>
                      ))}
                  </Stack>
                </>
              )}
            </Paper>
          </Box>
        )}
      </Box>
    );
  }

  if (view === "checkout") {
    const canRegister =
      !cobrarMutation.isPending &&
      (paymentMethod === "card" || payAmtNum >= totalFinal);

    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "grey.50" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            px: 3,
            py: 2,
            bgcolor: "background.paper",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <IconButton size="small" onClick={() => setView("form")}>
              <X size={18} />
            </IconButton>
            <Typography variant="h6" fontWeight={700}>
              Confirmar venta
            </Typography>
          </Stack>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 320px",
            gap: 3,
            p: 3,
            alignItems: "start",
          }}
        >
          <Stack spacing={3}>
            <Paper variant="outlined" sx={{ borderRadius: 2, p: 2.5 }}>
              <Typography variant="subtitle1" fontWeight={700}>
                Confirmación de artículos
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Confirma los artículos para este cliente
              </Typography>
              <Stack spacing={1.5}>
                {cart.map((item) => (
                  <Box
                    key={item.productId}
                    sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1.5, p: 1.5 }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          flexShrink: 0,
                          borderRadius: 1,
                          overflow: "hidden",
                          bgcolor: "grey.100",
                        }}
                      >
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.productName}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <Box sx={{ width: "100%", height: "100%", bgcolor: "grey.200" }} />
                        )}
                      </Box>
                      <Box flex={1} minWidth={0}>
                        <Typography variant="caption" color="text.secondary">
                          Código: {item.sku}
                        </Typography>
                        <Typography variant="body2" fontWeight={600} noWrap>
                          {item.productName}
                        </Typography>
                        {item.brandName && (
                          <Typography variant="caption" color="text.secondary">
                            {item.brandName}
                          </Typography>
                        )}
                      </Box>
                      <Stack direction="row" alignItems="flex-start" spacing={3} flexShrink={0}>
                        <Box textAlign="right">
                          <Typography variant="caption" color="text.secondary">
                            Cantidad
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {item.quantity}
                          </Typography>
                        </Box>
                        <Box textAlign="right">
                          <Typography variant="caption" color="text.secondary">
                            Precio original
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {formatCurrency(item.originalPrice)}
                          </Typography>
                        </Box>
                        {item.discountAmount > 0 && (
                          <Box textAlign="right">
                            <Typography variant="caption" color="text.secondary">
                              Descuento
                            </Typography>
                            <Typography variant="body2" fontWeight={600} color="error.main">
                              -{formatCurrency(item.discountAmount)}
                            </Typography>
                          </Box>
                        )}
                        <Box textAlign="right">
                          <Typography variant="caption" color="text.secondary">
                            Total
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {formatCurrency(item.unitPrice * item.quantity)}
                          </Typography>
                        </Box>
                      </Stack>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Paper>

            <Paper variant="outlined" sx={{ borderRadius: 2, p: 2.5 }}>
              <Typography variant="subtitle1" fontWeight={700}>
                Facturación
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Selecciona los datos de facturación del cliente
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1} mb={wantsInvoice ? 2 : 0}>
                <Switch
                  checked={wantsInvoice}
                  onChange={(e) => {
                    setWantsInvoice(e.target.checked);
                    if (e.target.checked && !billingData) {
                      setBillingForm({ rfc: "", businessName: "", address: "", postalCode: "", email: "" });
                      setBillingModalOpen(true);
                    }
                  }}
                  size="small"
                />
                <Typography variant="body2">
                  {wantsInvoice ? "Si desea facturar" : "No desea facturar"}
                </Typography>
              </Stack>
              {wantsInvoice && billingData && (
                <Box
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1.5,
                    p: 2,
                    position: "relative",
                  }}
                >
                  <IconButton
                    size="small"
                    sx={{ position: "absolute", top: 8, right: 8 }}
                    onClick={() => setBillingModalOpen(true)}
                  >
                    <Pencil size={14} />
                  </IconButton>
                  <Typography variant="body2" fontWeight={600} mb={0.25}>
                    {billingData.businessName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={0.25}>
                    {billingData.rfc}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={0.25}>
                    {billingData.address}&nbsp;&nbsp;CP. {billingData.postalCode}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "primary.main" }}>
                    {billingData.email}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Stack>

          <Stack spacing={2}>
            <Stack spacing={0.75}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2">Subtotal</Typography>
                <Typography variant="body2">{formatCurrency(subtotalOriginal)}</Typography>
              </Stack>
              {totalDiscounts > 0 && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">Descuentos</Typography>
                  <Typography variant="body2" color="error.main">
                    -{formatCurrency(totalDiscounts)}
                  </Typography>
                </Stack>
              )}
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="subtitle2" fontWeight={700}>
                  Total:
                </Typography>
                <Typography variant="subtitle2" fontWeight={700}>
                  {formatCurrency(totalFinal)}
                </Typography>
              </Stack>
            </Stack>

            <Box sx={{ bgcolor: "rgba(25, 118, 210, 0.06)", borderRadius: 2, p: 2.5 }}>
              <Typography variant="body2" fontWeight={600} textAlign="center" mb={1.5}>
                Ingresa el cobro realizado a el cliente:
              </Typography>

              <Stack direction="row" alignItems="center" justifyContent="center" mb={2}>
                <Typography variant="h4" color="text.secondary" fontWeight={400}>
                  $
                </Typography>
                <OutlinedInput
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                  placeholder="0.00"
                  inputProps={{ style: { fontSize: "2rem", fontWeight: 400, textAlign: "center", padding: "4px 0", width: 120 } }}
                  sx={{ "& .MuiOutlinedInput-notchedOutline": { border: "none" }, fontSize: "2rem" }}
                />
              </Stack>

              <Stack direction="row" spacing={1} mb={2}>
                <Button
                  fullWidth
                  variant={paymentMethod === "cash" ? "contained" : "outlined"}
                  size="small"
                  onClick={() => setPaymentMethod("cash")}
                  sx={{ textTransform: "none", borderRadius: 5 }}
                >
                  Efectivo
                </Button>
                <Button
                  fullWidth
                  variant={paymentMethod === "card" ? "contained" : "outlined"}
                  size="small"
                  onClick={() => setPaymentMethod("card")}
                  sx={{ textTransform: "none", borderRadius: 5 }}
                >
                  Tarjeta
                </Button>
              </Stack>

              <Box
                sx={{
                  bgcolor: "rgba(0,0,0,0.06)",
                  borderRadius: 1,
                  px: 2,
                  py: 1.25,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1.5,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Cambio:
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {formatCurrency(change)}
                </Typography>
              </Box>

              <Button
                fullWidth
                variant="contained"
                size="large"
                disabled={!canRegister}
                onClick={() => cobrarMutation.mutate()}
                sx={{ borderRadius: 1.5, textTransform: "none" }}
              >
                {cobrarMutation.isPending ? "Registrando..." : "Registrar cobro"}
              </Button>
            </Box>
          </Stack>
        </Box>

        <SideModal
          open={billingModalOpen}
          onClose={() => setBillingModalOpen(false)}
          title="Agregar datos de facturación"
          maxWidth="sm"
        >
          <Stack spacing={0}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshCw size={14} />}
              sx={{ textTransform: "none", mb: 3, alignSelf: "flex-start" }}
            >
              Escanear QR de Constancia de Situación Fiscal
            </Button>

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 2 }}>
              <TextField
                label="RFC"
                size="small"
                fullWidth
                value={billingForm.rfc}
                onChange={(e) => setBillingForm((f) => ({ ...f, rfc: e.target.value }))}
              />
              <TextField
                label="Nombre o Razón Social"
                size="small"
                fullWidth
                value={billingForm.businessName}
                onChange={(e) => setBillingForm((f) => ({ ...f, businessName: e.target.value }))}
              />
              <TextField
                label="Domicilio Fiscal"
                size="small"
                fullWidth
                value={billingForm.address}
                onChange={(e) => setBillingForm((f) => ({ ...f, address: e.target.value }))}
              />
              <TextField
                label="CP"
                size="small"
                fullWidth
                value={billingForm.postalCode}
                onChange={(e) => setBillingForm((f) => ({ ...f, postalCode: e.target.value }))}
              />
            </Box>

            <Typography variant="body2" mb={1}>
              Enviar factura a:
            </Typography>
            <TextField
              size="small"
              fullWidth
              value={billingForm.email}
              onChange={(e) => setBillingForm((f) => ({ ...f, email: e.target.value }))}
              sx={{ mb: 3 }}
            />

            <Button
              variant="contained"
              sx={{ textTransform: "none", alignSelf: "flex-start" }}
              onClick={() => {
                setBillingData({ ...billingForm });
                setBillingModalOpen(false);
              }}
            >
              Guardar
            </Button>
          </Stack>
        </SideModal>
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
          <IconButton size="small" onClick={() => void router.push("/ventas")}>
            <X size={18} />
          </IconButton>
          <Typography variant="h6" fontWeight={700}>
            Nueva venta
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" sx={{ borderRadius: 2, textTransform: "none" }}>
            Guardar cotización
          </Button>
          <Button
            variant="contained"
            disabled={!canProceed}
            sx={{ borderRadius: 2, textTransform: "none" }}
            onClick={() => setView("checkout")}
          >
            Proceder al cobro
          </Button>
        </Stack>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 300px",
          gap: 3,
          p: 3,
          alignItems: "start",
        }}
      >
        <Paper
          variant="outlined"
          sx={{ borderRadius: 2, p: 2.5 }}
        >
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" mb={2}>
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                Artículos
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Agrega los artículos para este cliente.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ScanLine size={16} />}
                sx={{ textTransform: "none" }}
              >
                Escanear artículos
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Search size={16} />}
                sx={{ textTransform: "none" }}
                onClick={() => setView("search")}
              >
                Buscar
              </Button>
            </Stack>
          </Stack>

          {cart.length === 0 ? (
            <Box
              sx={{
                bgcolor: "grey.100",
                borderRadius: 1.5,
                py: 5,
                textAlign: "center",
              }}
            >
              <Typography variant="body2" color="text.disabled">
                No tienes artículos agregados a esta venta
              </Typography>
            </Box>
          ) : (
            <>
              <Stack spacing={1.5}>
                {cart.map((item) => (
                  <Paper
                    key={item.productId}
                    variant="outlined"
                    sx={{ borderRadius: 1.5, p: 2 }}
                  >
                    <Stack direction="row" alignItems="flex-start" spacing={1.5}>
                      <Box
                        component="img"
                        src={item.imageUrl ?? "/placeholder-product.png"}
                        alt={item.productName}
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: 1,
                          objectFit: "cover",
                          flexShrink: 0,
                          bgcolor: "grey.100",
                        }}
                      />
                      <Box flex={1} minWidth={0}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          Código: {item.sku}
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          noWrap
                          title={item.productName}
                        >
                          {item.productName}
                        </Typography>
                        {item.brandName && (
                          <Typography variant="caption" color="text.secondary">
                            {item.brandName}
                          </Typography>
                        )}
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveFromCart(item.productId)}
                        sx={{ color: "text.secondary", flexShrink: 0 }}
                      >
                        <Trash2 size={16} />
                      </IconButton>
                    </Stack>

                    {paymentType === "LAYAWAY" ? (
                      <Stack direction="row" alignItems="flex-end" spacing={3} mt={1.5}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>Cantidad</Typography>
                          <Typography variant="body2" fontWeight={600}>{item.quantity}</Typography>
                        </Box>
                        <Box ml="auto">
                          <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>Total</Typography>
                          <Typography variant="body2" fontWeight={600}>{formatCurrency(item.unitPrice * item.quantity)}</Typography>
                        </Box>
                      </Stack>
                    ) : (
                      <Stack direction="row" alignItems="flex-end" spacing={3} mt={1.5}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>Cantidad</Typography>
                          <NumberSpinner
                            value={item.quantity}
                            onChange={(val: number) =>
                              handleCartQtyChange(item.productId, val - item.quantity)
                            }
                            min={1}
                            size="small"
                            iconSize={13}
                          />
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
                    )}
                  </Paper>
                ))}
              </Stack>

              <Box mt={2}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  py={1.25}
                >
                  <Typography variant="body2" color="text.secondary">
                    Subtotal
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {formatCurrency(subtotal)}
                  </Typography>
                </Stack>

                <Box
                  sx={{
                    bgcolor: "grey.100",
                    borderRadius: 1,
                    px: 1.5,
                    py: 1.25,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2" fontWeight={600}>
                    Total
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {formatCurrency(subtotal)}
                  </Typography>
                </Box>

                {paymentType === "CREDIT" && (
                  <Stack direction="row" justifyContent="space-between" alignItems="center" py={1.25}>
                    <Typography variant="body2" color="text.secondary">Enganche solicitado (10%)</Typography>
                    <Typography variant="body2" fontWeight={500}>{formatCurrency(enganche)}</Typography>
                  </Stack>
                )}
                {paymentType === "LAYAWAY" && (
                  <Stack direction="row" justifyContent="space-between" alignItems="center" py={1.25}>
                    <Typography variant="body2" color="text.secondary">Monto inicial de apartado (10%)</Typography>
                    <Typography variant="body2" fontWeight={500}>{formatCurrency(enganche)}</Typography>
                  </Stack>
                )}
              </Box>
            </>
          )}
        </Paper>

        <Stack spacing={2}>
          <Paper variant="outlined" sx={{ borderRadius: 2, p: 2.5 }}>
            <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
              Tipo de venta
            </Typography>
            <Stack direction="row" spacing={0}>
              {PAYMENT_OPTIONS.map((opt, idx) => (
                <Button
                  key={opt.value}
                  size="small"
                  variant={paymentType === opt.value ? "contained" : "outlined"}
                  onClick={() => setPaymentType(opt.value)}
                  sx={{
                    borderRadius: 0,
                    flex: 1,
                    textTransform: "none",
                    ...(idx === 0 && { borderRadius: "4px 0 0 4px" }),
                    ...(idx === PAYMENT_OPTIONS.length - 1 && { borderRadius: "0 4px 4px 0" }),
                  }}
                >
                  {opt.label}
                </Button>
              ))}
            </Stack>
          </Paper>

          {paymentType === "LAYAWAY" && (
            <Paper variant="outlined" sx={{ borderRadius: 2, p: 0, overflow: "hidden" }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  px: 2,
                  py: 1.5,
                  cursor: "pointer",
                  "&:hover": { bgcolor: "grey.50" },
                }}
              >
                <Typography variant="body2" fontWeight={500}>30 días</Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="body2" color="text.secondary">A liquidar: 29 de Julio</Typography>
                  <Typography variant="caption" color="text.secondary">∨</Typography>
                </Stack>
              </Stack>
            </Paper>
          )}

          <Paper variant="outlined" sx={{ borderRadius: 2, p: 2.5 }}>
            {selectedClient ? (
              <>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Cliente
                  </Typography>
                  <Button
                    size="small"
                    variant="text"
                    sx={{ textTransform: "none", fontWeight: 600, p: 0, minWidth: 0, fontSize: "0.875rem" }}
                    onClick={() => {
                      setClientModalOpen(true);
                      setClientModalSearch("");
                    }}
                  >
                    Cambiar
                  </Button>
                </Stack>

                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.5}>
                  <Typography variant="body2" fontWeight={600}>
                    {selectedClient.fullName}
                  </Typography>
                  <Chip
                    label={
                      selectedClient.status === "active"
                        ? "Activo"
                        : selectedClient.status === "blocked"
                        ? "Bloqueado"
                        : "Inactivo"
                    }
                    size="small"
                    color={
                      selectedClient.status === "active"
                        ? "success"
                        : selectedClient.status === "blocked"
                        ? "error"
                        : "default"
                    }
                    sx={{ fontWeight: 600, fontSize: "0.7rem" }}
                  />
                </Stack>

                {selectedClient.phoneNumber && (
                  <Typography variant="body2" color="text.secondary" mb={0.25}>
                    {selectedClient.phoneNumber}
                  </Typography>
                )}
                {selectedClient.email && (
                  <Typography variant="body2" color="text.secondary" mb={1.5}>
                    {selectedClient.email}
                  </Typography>
                )}

                <Box
                  sx={{
                    bgcolor: "rgba(25, 118, 210, 0.06)",
                    borderRadius: 1,
                    px: 1.5,
                    py: 1,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Este cliente no cuenta con crédito activo.
                  </Typography>
                </Box>
              </>
            ) : (
              <>
                <Typography variant="subtitle2" fontWeight={700} mb={0.5}>
                  Cliente
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={1.5}>
                  Agrega los artículos para este cliente.
                </Typography>

                <OutlinedInput
                  fullWidth
                  size="small"
                  placeholder="Buscar cliente"
                  value={clientSearch}
                  onClick={() => {
                    setClientModalOpen(true);
                    setClientModalSearch("");
                  }}
                  startAdornment={
                    <InputAdornment position="start">
                      <Search size={16} />
                    </InputAdornment>
                  }
                  sx={{ mb: 1.5, cursor: "pointer" }}
                  readOnly
                />

                <Button
                  fullWidth
                  variant="outlined"
                  size="small"
                  startIcon={<Plus size={16} />}
                  sx={{ textTransform: "none", justifyContent: "flex-start" }}
                >
                  Registrar nuevo cliente
                </Button>
              </>
            )}
          </Paper>

          {selectedClient && (
            <Paper variant="outlined" sx={{ borderRadius: 2, p: 2.5 }}>
              <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
                Entrega
              </Typography>

              <Select
                fullWidth
                size="small"
                value={deliveryType}
                onChange={(e) => setDeliveryType(e.target.value as "delivery" | "pickup")}
                sx={{ mb: 1.5 }}
              >
                <MenuItem value="delivery">A domicilio</MenuItem>
                <MenuItem value="pickup">En tienda o bodega</MenuItem>
              </Select>

              {deliveryType === "delivery" && (
                <>
                  <Box
                    sx={{
                      width: "100%",
                      height: 130,
                      bgcolor: "grey.200",
                      borderRadius: 1,
                      mb: 1.5,
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography variant="caption" color="text.disabled">
                      Vista de mapa
                    </Typography>
                  </Box>

                  <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      Dirección de entrega
                    </Typography>
                    <Button
                      size="small"
                      variant="text"
                      sx={{ textTransform: "none", fontWeight: 600, p: 0, minWidth: 0, fontSize: "0.75rem" }}
                    >
                      Cambiar
                    </Button>
                  </Stack>
                  <Typography variant="body2" mb={0.5}>
                    {selectedClient.primaryAddressFormatted ?? "Sin dirección registrada"}
                  </Typography>
                  {selectedClient.email && (
                    <Typography variant="body2" color="text.secondary" mb={1.5}>
                      {selectedClient.email}
                    </Typography>
                  )}

                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">
                      Teléfono de quién recibe
                    </Typography>
                    <Button
                      size="small"
                      variant="text"
                      sx={{ textTransform: "none", fontWeight: 600, p: 0, minWidth: 0, fontSize: "0.75rem" }}
                    >
                      Cambiar
                    </Button>
                  </Stack>
                  {selectedClient.phoneNumber && (
                    <Typography variant="body2" color="text.secondary" mt={0.5}>
                      {selectedClient.phoneNumber}
                    </Typography>
                  )}
                </>
              )}

              {deliveryType === "pickup" && (
                <>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      Tienda de entrega
                    </Typography>
                    <Button
                      size="small"
                      variant="text"
                      sx={{ textTransform: "none", fontWeight: 600, p: 0, minWidth: 0, fontSize: "0.75rem" }}
                    >
                      Cambiar
                    </Button>
                  </Stack>
                  <Typography variant="body2" fontWeight={600} mb={0.5}>
                    {CURRENT_BRANCH_NAME} [Actual]
                  </Typography>
                  {CURRENT_BRANCH_ADDRESS && (
                    <Typography variant="body2" color="text.secondary">
                      {CURRENT_BRANCH_ADDRESS}
                    </Typography>
                  )}
                </>
              )}
            </Paper>
          )}

          <SideModal
            open={clientModalOpen}
            onClose={() => setClientModalOpen(false)}
            title="Buscar cliente"
            description="Ingresa el nombre o número de teléfono del cliente para buscar."
            maxWidth="xl"
            headerActions={
              <Button
                variant="outlined"
                size="small"
                startIcon={<Plus size={16} />}
                sx={{ whiteSpace: "nowrap", px: 2 }}
              >
                Registrar nuevo
              </Button>
            }
          >
            <OutlinedInput
              fullWidth
              size="small"
              placeholder="Ingresa el nombre del cliente"
              value={clientModalSearch}
              onChange={(e) => setClientModalSearch(e.target.value)}
              startAdornment={
                <InputAdornment position="start">
                  <Search size={16} />
                </InputAdornment>
              }
              sx={{ mb: 2 }}
              autoFocus
            />

            <TableCrud<Client>
              columns={[
                { id: "id", label: "ID", type: "id", size: "xs" },
                {
                  id: "status",
                  label: "Estatus",
                  type: "chip",
                  size: "sm",
                  chipLabelMap: {
                    active: "Activo",
                    inactive: "Inactivo",
                    blocked: "Bloqueado",
                  },
                  chipVariantMap: {
                    active: "success",
                    inactive: "default",
                    blocked: "error",
                  },
                },
                { id: "fullName", label: "Nombre", type: "text", size: "lg", truncate: true },
                { id: "phoneNumber", label: "Teléfono", type: "text", size: "md" },
                {
                  id: "email",
                  label: "Correo",
                  type: "text",
                  size: "lg",
                  truncate: true,
                  format: (value) => <span>{(value as string | null) || "—"}</span>,
                },
              ]}
              rows={clientSearchData?.rows ?? []}
              loading={clientSearchLoading}
              emptyMessage="No se encontraron clientes"
              rowKey="id"
              page={clientModalPage}
              rowsPerPage={clientModalLimit}
              totalRows={clientSearchData?.total ?? 0}
              onPageChange={setClientModalPage}
              onRowsPerPageChange={setClientModalLimit}
              onRowClick={(row) => {
                setSelectedClient(row);
                setClientSearch(row.fullName);
                setClientModalOpen(false);
              }}
            />
          </SideModal>
        </Stack>
      </Box>
    </Box>
  );
}
