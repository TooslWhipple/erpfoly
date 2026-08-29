import { useState, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  Switch,
  Typography,
  Paper,
  Dialog,
  DialogContent,
  Alert,
  List,
  ListItemButton,
  ListItemText,
  Skeleton,
} from "@mui/material";
import {
  ScanLine,
  Pencil,
  X,
  Search,
  ArrowLeft,
  Plus,
  Store,
  Warehouse,
  Truck,
  Package,
  Calendar,
  CreditCard,
} from "lucide-react";
import NumberSpinner from "@/components/NumberSpinner";
import { useTheme } from "@mui/material/styles";
import { InlineMobileMenuButton } from "@/components/Layout";
import { SaleBuilderHeader } from "./SaleBuilderHeader";
import { SaleCartItemRow, BackorderChip } from "./SaleCartItem";
import { SaleCheckoutPaymentPanel } from "./SaleCheckoutPaymentPanel";
import {
  Card,
  EmptyCartBox,
  MainGrid,
  PageContent,
  PageHeader,
  PageShell,
  PaymentTypeRow,
  PaymentTypeButton,
  ProductDetailLayout,
  ProductDetailPanel,
  ProductGallery,
  InventorySourceCard,
  InventorySourceRow,
  InventorySourceMeta,
  InventorySourceActions,
  SearchHeader,
  SearchInputWrap,
  SidebarCard,
  StickySidebar,
  TermPill,
  TermPillsRow,
  TotalBar,
  TouchButton,
  CheckoutGrid,
} from "./styles";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProductDetail,
  searchProducts,
  getPurchaseTypes,
  getLayawayTerms,
  createSaleDraft,
  updateSaleClient,
  updateSalePurchaseType,
  updateSaleLayawayTerm,
  addSaleItem,
  updateSaleItem,
  removeSaleItem,
  checkoutSale,
  confirmCreditSale,
  createLayaway,
  registerSale,
  setDeliveryDate,
  quoteShipping,
  previewShippingQuote,
  previewCartPrices,
  getSaleDetail,
  invalidateSaleDiscount,
} from "@/services/ventas.service";
import type { SaleInvoiceBillingPayload } from "@/services/ventas.service";
import type { ShippingQuote } from "@/services/ventas.service";
import { IdentityVerificationDialog } from "./IdentityVerificationDialog";
import { getPaymentTerminalsCatalog } from "@/services/payment-terminals.service";
import { useAuthStore } from "@/store/useAuthStore";
import { getSessionSummary } from "@/services/cash-register.service";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { getClients } from "@/services/clients.service";
import type {
  CartItem,
  NewSaleView,
  ProductSearchResult,
  SalePaymentType,
} from "@/types/ventas.types";
import type { Client } from "@/services/clients.service";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useAsyncEffect } from "@/hooks/useAsyncEffect";
import { SideModal } from "@/components/SideModal/SideModal";
import { TableCrud } from "@/components/TableCrud";
import { CreateCashClientModal } from "@/components/CreateCashClientModal";
import { CreditApplicationIntakeModal } from "@/components/CreditApplicationIntakeModal";
import { createCreditApplicationFromIntake } from "@/services/creditApplications.service";
import type { CreditApplicationBiometricsData } from "@/types/credit-application-form.types";
import { googleMapsBrowserApiKey } from "@/config/maps";
import { getBranchesCatalog } from "@/services/branches.service";
import { DeliveryAddressModal } from "@/components/DeliveryAddressModal";
import type { DeliveryAddressSelection } from "@/components/DeliveryAddressModal";
import { DeliveryDatePicker } from "@/components/DeliveryDatePicker";
import { ConfirmModal } from "@/components/ConfirmModal";
import { BillingFieldsForm } from "@/components/BillingFieldsForm";
import { useBillingFieldsForm } from "@/hooks/useBillingFieldsForm";
import { formatStreetAddressLine } from "@/utils/address";
import {
  backorderedFromSources,
  hydratedLineQtyMax,
  sellableCeilingForHydratedLine,
  sellableMaxFromPickedSources,
  sourceSellableMax,
  toInventorySourcesPayload,
} from "@/utils/saleCartCoverage";
import {
  cartLineDiscounts,
  cartListSubtotal,
  lineTotal,
  merchandiseTotal,
  patchCartLinePrices,
} from "@/utils/saleCartPricing";
import { StaticLocationMap } from "@/components/StaticLocationMap";
import dayjs from "@/lib/dayjs";
import { SALES_POS_BREAKPOINT } from "@/lib/layoutBreakpoints";
import { DiscountRequestModal } from "@/components/DiscountRequestModal";
import { ProductCodeScannerDialog } from "@/components/ProductCodeScannerDialog";
import { DiscountRequestStatusBanner } from "@/components/DiscountRequestStatusBanner";
import {
  getDiscountRequestReasonLabel,
  getDiscountRequestStatusLabel,
} from "@/utils/discountRequest";

const PT_MAP: Record<string, string[]> = {
  CASH: ["CONTADO", "CASH", "EFECTIVO"],
  CREDIT: ["CREDITO", "CREDIT", "CRÉDITO"],
  LAYAWAY: ["APARTADO", "LAYAWAY", "APART"],
};

function resolvePurchaseTypeId(
  paymentType: string,
  types: Array<{ id: number; code: string }>,
): number | null {
  const keywords = PT_MAP[paymentType] ?? [];
  return (
    types.find((type) =>
      keywords.some((keyword) => type.code.toUpperCase().includes(keyword)),
    )?.id ??
    types[0]?.id ??
    null
  );
}

const SEARCH_DEBOUNCE_MS = 350;

/** Max cash payment allowed for cash (contado) sales. */
const MAX_CASH_SALE_PAYMENT = 100_000;
const MAX_CASH_SALE_PAYMENT_MESSAGE =
  "No es posible realizar ventas de contado y pago en efectivo mayor a $100,000.00";

const GOOGLE_MAPS_API_KEY = googleMapsBrowserApiKey;

const STOCK_SHORTAGE_MESSAGE =
  "No hay existencia ni mercancía por surtir suficientes para esa cantidad.";

type PendingDiscountMutation =
  | { kind: "qty"; productId: number; delta: number }
  | { kind: "remove"; productId: number }
  | { kind: "add" }
  | { kind: "paymentType"; value: SalePaymentType };

function qtyMaxForCartItem(
  item: CartItem,
  coverage: Record<number, number> | undefined,
): number {
  if (item.sources.length > 0) {
    return sellableMaxFromPickedSources(item.sources);
  }
  const ceiling = coverage?.[item.productId];
  if (ceiling == null) return item.quantity;
  return hydratedLineQtyMax(item.quantity, ceiling);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(value);
}

function toCheckoutDate(value: string | null | undefined): string | null {
  if (!value) return null;
  return value.slice(0, 10);
}

const CHANGE_LINK_SX = {
  textTransform: "none" as const,
  fontWeight: 600,
  px: 1,
  py: 0.25,
  minWidth: "auto",
};

const DELIVERY_TYPE_LABELS: Record<"delivery" | "pickup", string> = {
  delivery: "A domicilio",
  pickup: "En tienda o bodega",
};

function formatCheckoutDeliveryDate(date: string | null): string {
  if (!date) return "Sin fecha";
  return dayjs(date)
    .format("dddd D [de] MMMM, YYYY")
    .replace(/^\w/, (c) => c.toUpperCase());
}

function ReadOnlyField({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography
        variant="caption"
        color="text.secondary"
        display="block"
        mb={0.5}
      >
        {label}
      </Typography>
      <Typography variant="body2">{value?.trim() ? value : "—"}</Typography>
    </Box>
  );
}

function DeliveryMapPreview({
  coords,
  apiKey,
}: {
  coords: { lat: number; lng: number } | null;
  apiKey: string;
}) {
  if (coords && apiKey) {
    return (
      <Box sx={{ mb: 1.5 }}>
        <StaticLocationMap coords={coords} apiKey={apiKey} height={130} />
      </Box>
    );
  }
  return (
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
        {coords
          ? "Configura NEXT_PUBLIC_GOOGLE_MAPS_API_KEY para ver el mapa"
          : "Sin coordenadas registradas"}
      </Typography>
    </Box>
  );
}

function SaleBuilderResumeSkeleton({ onExit }: { onExit: () => void }) {
  return (
    <PageShell aria-busy="true" aria-label="Cargando cotización">
      <PageHeader>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          minWidth={0}
          flex="1 1 auto"
        >
          <InlineMobileMenuButton />
          <IconButton size="small" onClick={onExit} aria-label="Cerrar">
            <X size={18} />
          </IconButton>
          <Skeleton variant="text" width={220} height={36} />
        </Stack>
        <Stack direction="row" spacing={1} flexShrink={0}>
          <Skeleton variant="rounded" width={160} height={36} />
          <Skeleton variant="rounded" width={140} height={36} />
        </Stack>
      </PageHeader>
      <MainGrid>
        <Stack spacing={2}>
          <Card>
            <Skeleton variant="text" width={120} height={28} sx={{ mb: 2 }} />
            <Stack spacing={1.5}>
              <Skeleton variant="rounded" height={96} />
              <Skeleton variant="rounded" height={96} />
            </Stack>
          </Card>
        </Stack>
        <StickySidebar>
          <SidebarCard>
            <Skeleton variant="text" width={110} height={24} sx={{ mb: 1.5 }} />
            <Skeleton variant="rounded" height={40} />
          </SidebarCard>
          <SidebarCard>
            <Skeleton variant="text" width={80} height={24} sx={{ mb: 1.5 }} />
            <Skeleton variant="rounded" height={72} />
          </SidebarCard>
        </StickySidebar>
      </MainGrid>
    </PageShell>
  );
}

export interface SaleBuilderProps {
  resumeSaleId: number | null;
  onExit: () => void;
  /**
   * 'vendedor' (default): arma el carrito y, para contado/crédito, la
   * registra sin cobrarla (queda PENDING_CASHIER para que el cajero la
   * cobre). Apartado es la excepción: sigue el flujo actual completo
   * (captura enganche/plazo) sin pasar por PENDING_CASHIER — ver plan
   * "Dudas resueltas, tarea SaleBuilder.tsx".
   * 'cajero': el carrito queda bloqueado (solo lectura). Contado/apartado
   * van al cobro; crédito exige biometría (o skip de supervisor) antes.
   */
  mode?: "vendedor" | "cajero";
  /** Next.js aún no resolvió el id de la ruta; no pintar el flujo de nueva venta. */
  resumeRoutePending?: boolean;
}

export function SaleBuilder({
  resumeSaleId,
  onExit,
  mode = "vendedor",
  resumeRoutePending = false,
}: SaleBuilderProps) {
  const theme = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [discountRequestModalOpen, setDiscountRequestModalOpen] =
    useState(false);
  const [pendingDiscountMutation, setPendingDiscountMutation] =
    useState<PendingDiscountMutation | null>(null);
  const [discountInvalidateLoading, setDiscountInvalidateLoading] =
    useState(false);
  const saleOperationLockRef = useRef(false);
  const checkoutIdempotencyKeyRef = useRef<string | null>(null);

  const [activeSaleId, setActiveSaleId] = useState<number | null>(null);
  const [activeSaleFolio, setActiveSaleFolio] = useState<string | null>(null);
  const [originalItemIds, setOriginalItemIds] = useState<Set<number>>(
    new Set(),
  );
  const [hydratedSaleId, setHydratedSaleId] = useState<number | null>(null);
  const [hydratedClientForSaleId, setHydratedClientForSaleId] = useState<
    number | null
  >(null);

  const [view, setView] = useState<NewSaleView>("form");
  const [paymentType, setPaymentType] = useState<"CREDIT" | "CASH" | "LAYAWAY">(
    "CREDIT",
  );
  const [cart, setCart] = useState<CartItem[]>([]);
  const [clientSearch, setClientSearch] = useState("");
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [clientModalSearch, setClientModalSearch] = useState("");
  const [clientModalPage, setClientModalPage] = useState(0);
  const [clientModalLimit, setClientModalLimit] = useState(10);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [deliveryType, setDeliveryType] = useState<
    "delivery" | "pickup" | null
  >(null);
  const [deliveryBranch, setDeliveryBranch] = useState<{
    id: number;
    label: string;
  } | null>(null);
  const [deliveryBranchOverridden, setDeliveryBranchOverridden] =
    useState(false);
  const [branchPickerOpen, setBranchPickerOpen] = useState(false);
  const [useCustomDeliveryAddress, setUseCustomDeliveryAddress] =
    useState(false);
  const [customDeliveryAddress, setCustomDeliveryAddress] =
    useState<DeliveryAddressSelection | null>(null);
  const [shippingQuote, setShippingQuote] = useState<ShippingQuote | null>(
    null,
  );
  const [shippingQuoteLoading, setShippingQuoteLoading] = useState(false);
  const lastPatchedPurchaseTypeRef = useRef<number | null>(null);
  const [deliveryAddressModalOpen, setDeliveryAddressModalOpen] =
    useState(false);
  const [checkoutDeliveryDate, setCheckoutDeliveryDate] = useState<
    string | null
  >(null);
  const [checkoutDeliveryDateModalOpen, setCheckoutDeliveryDateModalOpen] =
    useState(false);
  const [deliveryDateWarningOpen, setDeliveryDateWarningOpen] =
    useState(false);
  const openDeliveryPickerAfterWarningRef = useRef(false);
  const [wantsInvoice, setWantsInvoice] = useState(false);
  const [cashAmount, setCashAmount] = useState("");
  const [cardAmount, setCardAmount] = useState("");
  const [extraCards, setExtraCards] = useState<
    Array<{ amount: string; terminalId: number | null }>
  >([]);
  const [selectedTerminal, setSelectedTerminal] = useState<number | null>(null);
  const [identityVerificationModalOpen, setIdentityVerificationModalOpen] = useState(false);
  const [identityOk, setIdentityOk] = useState(false);
  const [createClientModalOpen, setCreateClientModalOpen] = useState(false);
  const [creditIntakeModalOpen, setCreditIntakeModalOpen] = useState(false);
  const [selectedTermMonths, setSelectedTermMonths] = useState<12 | 18 | 24>(
    12,
  );
  const [billingModalOpen, setBillingModalOpen] = useState(false);
  const [billingConfirmed, setBillingConfirmed] = useState(false);
  const [useClientBillingData, setUseClientBillingData] = useState(false);
  const billing = useBillingFieldsForm();

  const primaryCoords = useMemo(() => {
    if (!selectedClient?.addresses?.length) return null;
    const primary =
      selectedClient.addresses.find((a) => a.isPrimary) ??
      selectedClient.addresses[0];
    if (primary?.latitude == null || primary.longitude == null) return null;
    const lat = Number(primary.latitude);
    const lng = Number(primary.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
  }, [selectedClient]);

  const deliveryCoords = useMemo(() => {
    if (!useCustomDeliveryAddress || !customDeliveryAddress) {
      return primaryCoords;
    }
    if (
      customDeliveryAddress.latitude == null ||
      customDeliveryAddress.longitude == null
    ) {
      return null;
    }
    return {
      lat: customDeliveryAddress.latitude,
      lng: customDeliveryAddress.longitude,
    };
  }, [customDeliveryAddress, primaryCoords, useCustomDeliveryAddress]);

  const todayIsoDate = useMemo(() => dayjs().format("YYYY-MM-DD"), []);

  const [productSearch, setProductSearch] = useState("");
  const [productScannerOpen, setProductScannerOpen] = useState(false);
  const [productPage, setProductPage] = useState(0);
  const [productLimit, setProductLimit] = useState(10);
  const debouncedProductSearch = useDebouncedValue(
    productSearch,
    SEARCH_DEBOUNCE_MS,
  );

  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null,
  );
  const [quantityMap, setQuantityMap] = useState<Record<string, number>>({});
  const [showOtherBranches, setShowOtherBranches] = useState(false);

  const { data: productSearchData, isLoading: searchLoading } = useQuery({
    queryKey: [
      "product-search",
      debouncedProductSearch,
      productPage,
      productLimit,
    ],
    enabled: view === "search",
    queryFn: async () => {
      const result = await searchProducts({
        search:
          debouncedProductSearch.trim().length > 1
            ? debouncedProductSearch
            : undefined,
        page: productPage + 1,
        limit: productLimit,
      });
      if (result.error) throw new Error(result.error.message);
      return result.data ?? { rows: [], total: 0, page: 1, limit: 10 };
    },
  });

  const principalBranchId =
    useAuthStore((s) => s.user?.principalBranchId) ?? null;
  const activeSessionQuery = useQuery({
    queryKey: ["cash-register-session-summary"],
    queryFn: async () => {
      try {
        return await getSessionSummary();
      } catch {
        return null;
      }
    },
    retry: false,
    staleTime: 60_000,
  });
  const workingBranchId =
    activeSessionQuery.data?.branch_id ?? principalBranchId ?? null;

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
  const purchaseTypeId = resolvePurchaseTypeId(paymentType, purchaseTypes);

  const { data: productDetail, isLoading: detailLoading } = useQuery({
    queryKey: [
      "product-detail",
      selectedProductId,
      showOtherBranches,
      workingBranchId,
      purchaseTypeId,
    ],
    enabled:
      view === "product-detail" &&
      selectedProductId !== null &&
      workingBranchId != null,
    queryFn: async () => {
      if (!selectedProductId || workingBranchId == null) return null;
      const result = await getProductDetail(
        selectedProductId,
        workingBranchId,
        showOtherBranches,
        purchaseTypeId ?? undefined,
      );
      if (result.error) throw new Error(result.error.message);
      return result.data ?? null;
    },
  });

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [lastImageProductId, setLastImageProductId] = useState<
    number | undefined
  >(productDetail?.id);
  if (productDetail?.id !== lastImageProductId) {
    setLastImageProductId(productDetail?.id);
    setSelectedImageIndex(0);
  }

  const debouncedClientModalSearch = useDebouncedValue(
    clientModalSearch,
    SEARCH_DEBOUNCE_MS,
  );
  const snackbar = useSnackbarStore();
  const showSuccess = useSnackbarStore((s) => s.showSuccess);

  const handleCreditIntakeFinalize = async (
    payload: CreditApplicationBiometricsData,
  ) => {
    if (!selectedClient) return;

    const result = await createCreditApplicationFromIntake(
      payload,
      selectedClient.id,
    );
    if (!result?.id) {
      snackbar.showError(
        "No se pudo crear la solicitud de crédito, intenta nuevamente.",
      );
      throw new Error("No se pudo crear la solicitud de crédito.");
    }

    showSuccess(
      `Solicitud de crédito ${result.folio} creada para ${selectedClient.fullName}.`,
    );
    await router.push(`/solicitudes-credito/${result.id}`);
  };

  const { data: layawayTermsRes } = useQuery({
    queryKey: ["layaway-terms"],
    queryFn: async () => {
      const res = await getLayawayTerms();
      if (res.error) throw new Error(res.error.message);
      return res.data ?? [];
    },
    staleTime: Infinity,
  });
  const layawayTerms = layawayTermsRes ?? [];
  const [selectedLayawayTermId, setSelectedLayawayTermId] = useState<
    number | null
  >(null);
  const activeLayawayTerm =
    layawayTerms.find((t) => t.id === selectedLayawayTermId) ??
    layawayTerms[0] ??
    null;

  const { data: resumeSaleData, isError: resumeSaleError } = useQuery({
    queryKey: ["resume-sale-draft", resumeSaleId],
    enabled: resumeSaleId !== null && !Number.isNaN(resumeSaleId),
    queryFn: async () => {
      const res = await getSaleDetail(resumeSaleId!);
      if (res.error) throw new Error(res.error.message);
      return res.data!;
    },
  });

  // Cotización registrada (pendiente de cobro) o apartado en cobro: mismos
  // términos comerciales, solo caja cobra. No reabrir el editor.
  const isCajeroMode =
    mode === "cajero" ||
    resumeSaleData?.status === "PENDING_CASHIER" ||
    resumeSaleData?.status === "PENDING_PAYMENT";

  const currentBranchId =
    workingBranchId ?? resumeSaleData?.branchId ?? null;
  const coverageBranchId = resumeSaleData?.branchId ?? currentBranchId;
  const branchUnresolved =
    !activeSessionQuery.isLoading && currentBranchId == null;

  const resumeClientId = resumeSaleData?.client?.id ?? null;
  const { data: resumeClientData } = useQuery({
    queryKey: ["resume-sale-client", resumeClientId],
    enabled: resumeClientId !== null,
    queryFn: async () => {
      const res = await getClients({
        page: 1,
        limit: 1,
        client_id: resumeClientId!,
      });
      if (res.error) throw new Error(res.error.message);
      return res.data?.rows[0] ?? null;
    },
  });

  // Adjust local state during render when resume data first arrives, per
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  if (resumeSaleData && hydratedSaleId !== resumeSaleData.id) {
    setHydratedSaleId(resumeSaleData.id);
    setActiveSaleId(resumeSaleData.id);
    setActiveSaleFolio(resumeSaleData.folio);
    setOriginalItemIds(new Set(resumeSaleData.items.map((item) => item.id)));

    setCart(
      resumeSaleData.items.map((item) => ({
        productId: item.product.id,
        sku: item.product.code,
        productName: item.product.name,
        brandName: null,
        imageUrl: item.product.imageUrl,
        originalPrice: item.listPrice ?? item.unitPrice,
        discountAmount: item.discountAmount,
        unitPrice:
          item.quantity > 0
            ? item.totalAmount / item.quantity
            : item.unitPrice,
        quantity: item.quantity,
        sources: item.inventorySources,
        saleItemId: item.id,
        backorderedQuantity: item.backorderedQuantity,
      })),
    );

    let nextPaymentType: "CREDIT" | "CASH" | "LAYAWAY" = "CREDIT";
    if (resumeSaleData.purchaseType) {
      const upper = resumeSaleData.purchaseType.toUpperCase();
      const matched = Object.entries(PT_MAP).find(([, keywords]) =>
        keywords.some((k) => upper.includes(k)),
      );
      if (matched) {
        nextPaymentType = matched[0] as "CREDIT" | "CASH" | "LAYAWAY";
        setPaymentType(nextPaymentType);
      }
    }

    if (resumeSaleData.layawayTermId != null) {
      setSelectedLayawayTermId(resumeSaleData.layawayTermId);
    }

    if (resumeSaleData.deliveryType === "ADDRESS") {
      setDeliveryType("delivery");
      const deliveryAddressId = resumeSaleData.deliveryAddressId;
      const isCustomAddress =
        deliveryAddressId != null &&
        deliveryAddressId !== resumeSaleData.client?.primaryAddress?.id;
      if (isCustomAddress) {
        const latitude =
          resumeSaleData.deliveryAddressLatitude != null
            ? Number(resumeSaleData.deliveryAddressLatitude)
            : null;
        const longitude =
          resumeSaleData.deliveryAddressLongitude != null
            ? Number(resumeSaleData.deliveryAddressLongitude)
            : null;
        setCustomDeliveryAddress({
          id: deliveryAddressId,
          formatted:
            resumeSaleData.deliveryAddressFormatted ??
            "Dirección de entrega personalizada",
          latitude:
            latitude != null && Number.isFinite(latitude) ? latitude : null,
          longitude:
            longitude != null && Number.isFinite(longitude) ? longitude : null,
        });
        setUseCustomDeliveryAddress(true);
      } else {
        setCustomDeliveryAddress(null);
        setUseCustomDeliveryAddress(false);
      }
    } else if (resumeSaleData.deliveryType === "BRANCH") {
      setDeliveryType("pickup");
      setCustomDeliveryAddress(null);
      setUseCustomDeliveryAddress(false);
      if (resumeSaleData.deliveryBranchId != null) {
        setDeliveryBranch({
          id: resumeSaleData.deliveryBranchId,
          label: resumeSaleData.deliveryBranchName ?? "",
        });
        setDeliveryBranchOverridden(true);
      }
    } else {
      setDeliveryType(null);
      setCustomDeliveryAddress(null);
      setUseCustomDeliveryAddress(false);
    }

    if (resumeSaleData.shippingCoverage) {
      setShippingQuote({
        amount: resumeSaleData.shippingAmount ?? null,
        zoneId: null,
        zoneName: null,
        inZone: resumeSaleData.shippingCoverage === "IN_ZONE",
        coverage: resumeSaleData.shippingCoverage,
        economicRevision: resumeSaleData.economicRevision,
      });
    }

    const hydratedDeliveryDate = toCheckoutDate(resumeSaleData.deliveryDate);
    if (hydratedDeliveryDate) {
      setCheckoutDeliveryDate(hydratedDeliveryDate);
    }

    const nextIdentityOk =
      Boolean(resumeSaleData.identityVerifiedAt) ||
      Boolean(resumeSaleData.identityVerificationAuthorizedBy);
    setIdentityOk(nextIdentityOk);

    if (isCajeroMode && (nextPaymentType !== "CREDIT" || nextIdentityOk)) {
      setView("checkout");
    }
  }

  if (
    resumeClientData &&
    hydratedSaleId !== null &&
    hydratedClientForSaleId !== hydratedSaleId
  ) {
    setHydratedClientForSaleId(hydratedSaleId);
    setSelectedClient(resumeClientData);
    if (!isCajeroMode && resumeClientData.creditStatus === "MOROSO") {
      setPaymentType("CASH");
    }
  }

  if (view === "checkout" && paymentType === "CREDIT" && !identityOk) {
    setView("form");
  }

  const syncDeliverySelection = async (saleId: number) => {
    const deliveryDate =
      deliveryType === "pickup"
        ? effectivePickupDate || checkoutDeliveryDate || undefined
        : checkoutDeliveryDate ?? undefined;

    if (deliveryType === "delivery") {
      const clientPrimaryAddress =
        selectedClient?.addresses?.find((a) => a.isPrimary) ??
        selectedClient?.addresses?.[0];
      const addressId = useCustomDeliveryAddress
        ? customDeliveryAddress?.id
        : clientPrimaryAddress?.addressId;
      if (addressId) {
        await setDeliveryDate(saleId, {
          delivery_type: "ADDRESS",
          address_id: addressId,
          ...(deliveryDate ? { delivery_date: deliveryDate } : {}),
        });
        const quote = await quoteShipping(saleId, {
          address_id: addressId,
          dispatch_branch_id: coverageBranchId ?? undefined,
        });
        setShippingQuote(quote);
      }
    } else if (deliveryType === "pickup" && effectiveDeliveryBranch) {
      await setDeliveryDate(saleId, {
        delivery_type: "BRANCH",
        branch_id: effectiveDeliveryBranch.id,
        ...(deliveryDate ? { delivery_date: deliveryDate } : {}),
      });
      setShippingQuote(null);
    }
  };

  const ensureSaleSynced = async (): Promise<{
    id: number;
    folio: string;
  }> => {
    const keywords = PT_MAP[paymentType] ?? [];
    const pt =
      purchaseTypes.find((p) =>
        keywords.some((k) => p.code.toUpperCase().includes(k)),
      ) ?? purchaseTypes[0];
    if (!pt) throw new Error("No se encontró el tipo de compra");

    let saleId: number;
    let folio: string;

    if (activeSaleId === null) {
      // Sale ownership stays with the operating branch. Inventory sources are
      // persisted per item and may belong to another branch.
      const draftBranchId = currentBranchId;
      if (draftBranchId == null) {
        throw new Error("No se pudo determinar tu sucursal");
      }
      const draftRes = await createSaleDraft({
        branch_id: draftBranchId,
        purchase_type_id: pt.id,
        client_id: selectedClient?.id,
        origin: "STORE",
      });
      if (draftRes.error) throw new Error(draftRes.error.message);
      saleId = draftRes.data!.id;
      folio = draftRes.data!.folio;

      for (const item of cart) {
        const inventorySources = toInventorySourcesPayload(item.sources);
        const itemRes = await addSaleItem(saleId, {
          product_id: item.productId,
          quantity: item.quantity,
          ...(inventorySources.length > 0
            ? { inventory_sources: inventorySources }
            : {}),
        });
        if (itemRes.error) throw new Error(itemRes.error.message);
      }

      setActiveSaleId(saleId);
      setActiveSaleFolio(folio);
      setOriginalItemIds(
        new Set(
          cart
            .filter((item) => item.saleItemId)
            .map((item) => item.saleItemId!),
        ),
      );
    } else {
      saleId = activeSaleId;
      folio = activeSaleFolio ?? "";

      // Modo cajero: el carrito/cliente están bloqueados en la UI y la venta
      // ya no está en DRAFT, así que el backend rechaza estos endpoints
      // (guard status !== DRAFT) — no hay nada que sincronizar.
      if (!isCajeroMode) {
        if (selectedClient) {
          const clientRes = await updateSaleClient(saleId, selectedClient.id);
          if (clientRes.error) throw new Error(clientRes.error.message);
        }

        const purchaseTypeRes = await updateSalePurchaseType(saleId, pt.id);
        if (purchaseTypeRes.error) throw new Error(purchaseTypeRes.error.message);

        const currentIds = new Set(
          cart.filter((item) => item.saleItemId).map((item) => item.saleItemId!),
        );

        for (const originalId of originalItemIds) {
          if (!currentIds.has(originalId)) {
            const removeRes = await removeSaleItem(saleId, originalId);
            if (removeRes.error) throw new Error(removeRes.error.message);
          }
        }

        for (const item of cart) {
          const inventorySources = toInventorySourcesPayload(item.sources);
          if (item.saleItemId) {
            const updateRes = await updateSaleItem(saleId, item.saleItemId, {
              quantity: item.quantity,
              ...(inventorySources.length > 0
                ? { inventory_sources: inventorySources }
                : {}),
            });
            if (updateRes.error) throw new Error(updateRes.error.message);
          } else {
            const itemRes = await addSaleItem(saleId, {
              product_id: item.productId,
              quantity: item.quantity,
              ...(inventorySources.length > 0
                ? { inventory_sources: inventorySources }
                : {}),
            });
            if (itemRes.error) throw new Error(itemRes.error.message);
          }
        }

        setOriginalItemIds(currentIds);
      }
    }

    if (!isCajeroMode && paymentType === "LAYAWAY" && activeLayawayTerm) {
      const termRes = await updateSaleLayawayTerm(saleId, activeLayawayTerm.id);
      if (termRes.error) throw new Error(termRes.error.message);
    }

    await syncDeliverySelection(saleId);
    return { id: saleId, folio };
  };

  const guardarCotizacionMutation = useMutation({
    mutationFn: async () => {
      await ensureSaleSynced();
    },
    onSuccess: () => {
      if (resumeSaleId !== null) {
        showSuccess("Cotización actualizada.");
        void queryClient.invalidateQueries({
          queryKey: ["resume-sale-draft", resumeSaleId],
        });
        void queryClient.invalidateQueries({ queryKey: ["sale-drafts"] });
      } else {
        showSuccess(
          "Cotización guardada. Puedes retomarla desde Cotizaciones guardadas.",
        );
        void router.push("/cotizaciones-guardadas");
      }
    },
    onError: (err: Error) => {
      snackbar.showError(err.message);
    },
  });

  const cobrarMutation = useMutation({
    mutationFn: async () => {
      if (isCardPayment && !selectedTerminal) {
        throw new Error("Selecciona una terminal para el pago con tarjeta");
      }
      const cashPaymentAmount =
        parseFloat(cashAmount.replace(/[^0-9.]/g, "")) || 0;
      if (
        paymentType === "CASH" &&
        cashPaymentAmount >= MAX_CASH_SALE_PAYMENT
      ) {
        throw new Error(MAX_CASH_SALE_PAYMENT_MESSAGE);
      }

      const { id: saleId } = await ensureSaleSynced();

      const billingPayload: SaleInvoiceBillingPayload | undefined =
        wantsInvoice && billingConfirmed
          ? {
              rfc: billing.values.rfc,
              business_name: billing.values.businessName,
              tax_regime_id: billing.values.taxRegimeId,
              cfdi_use_id: billing.values.cfdiUseId,
              neighborhood_code: billing.values.fiscalNeighborhoodFullCode,
              street: billing.values.fiscalStreet,
              external_number: billing.values.fiscalExternalNumber,
              postal_code: billing.values.fiscalPostalCode,
              email: billing.values.sendInvoiceByEmail
                ? billing.values.invoiceEmail
                : undefined,
            }
          : undefined;

      if (deliveryType === "delivery") {
        const clientPrimaryAddress =
          selectedClient?.addresses?.find((a) => a.isPrimary) ??
          selectedClient?.addresses?.[0];
        const addressId = useCustomDeliveryAddress
          ? customDeliveryAddress?.id
          : clientPrimaryAddress?.addressId;
        if (!addressId) {
          throw new Error("Falta la dirección de entrega");
        }
        await setDeliveryDate(saleId, {
          delivery_type: "ADDRESS",
          address_id: addressId,
          delivery_date: checkoutDeliveryDate ?? undefined,
        });
      } else if (deliveryType === "pickup" && effectiveDeliveryBranch) {
        await setDeliveryDate(saleId, {
          delivery_type: "BRANCH",
          branch_id: effectiveDeliveryBranch.id,
          delivery_date: effectivePickupDate || checkoutDeliveryDate || undefined,
        });
      }

      const extraCardTenders = extraCards
        .map((card) => ({
          amount: parseFloat(card.amount.replace(/[^0-9.]/g, "")) || 0,
          terminalId: card.terminalId,
        }))
        .filter((card) => card.amount > 0);

      const tenders: Array<{
        payment_method: "CASH" | "CARD";
        amount: number;
        received_amount?: number;
        payment_terminal_id?: number;
      }> = [];
      if (cashAmtNum > 0) {
        tenders.push({
          payment_method: "CASH",
          amount: Math.min(cashAmtNum, totalFinal),
          received_amount: cashAmtNum,
        });
      }
      if (cardAmtNum > 0) {
        tenders.push({
          payment_method: "CARD",
          amount: cardAmtNum,
          payment_terminal_id: selectedTerminal ?? undefined,
        });
      }
      for (const card of extraCardTenders) {
        tenders.push({
          payment_method: "CARD",
          amount: card.amount,
          payment_terminal_id: card.terminalId ?? undefined,
        });
      }

      if (paymentType === "CREDIT") {
        if (!identityOk) {
          throw new Error(
            "Debe verificar la identidad del cliente o registrar una omisión autorizada por supervisor.",
          );
        }
        if (!selectedClient)
          throw new Error("Se requiere un cliente para venta a crédito");
        const creditTenders =
          tenders.length > 0
            ? tenders
            : [
                {
                  payment_method: (isCardPayment ? "CARD" : "CASH") as
                    | "CASH"
                    | "CARD",
                  amount: enganche,
                  payment_terminal_id: selectedTerminal ?? undefined,
                },
              ];
        const creditRes = await confirmCreditSale(saleId, {
          term_months: selectedTermMonths,
          down_payment: enganche,
          payment_method: isCardPayment ? "CARD" : "CASH",
          payment_terminal_id: selectedTerminal ?? undefined,
          tenders: creditTenders,
          economic_revision: economicRevision,
          ...billingPayload,
        });
        if (creditRes.error) throw new Error(creditRes.error.message);
        return creditRes.data!;
      }

      if (paymentType === "LAYAWAY") {
        if (!activeLayawayTerm)
          throw new Error("Selecciona un plazo de apartado");
        const depositAmount = cashAmtNum + cardAmtNum + extraCardAmtNum;
        const layawayTenders =
          tenders.length > 0
            ? tenders
            : depositAmount > 0
              ? [
                  {
                    payment_method: (isCardPayment ? "CARD" : "CASH") as
                      | "CASH"
                      | "CARD",
                    amount: depositAmount,
                    payment_terminal_id: selectedTerminal ?? undefined,
                  },
                ]
              : [];
        const layawayRes = await createLayaway(saleId, {
          layaway_term_id: activeLayawayTerm.id,
          deposit_amount: depositAmount,
          payment_method: isCardPayment ? "CARD" : "CASH",
          payment_terminal_id: selectedTerminal ?? undefined,
          tenders: layawayTenders,
        });
        if (layawayRes.error) throw new Error(layawayRes.error.message);
        return {
          id: saleId,
          folio: activeSaleFolio ?? "",
          status: "ACTIVE",
        };
      }

      if (tenders.length === 0) {
        tenders.push({
          payment_method: "CASH",
          amount: totalFinal,
          received_amount: cashAmtNum || totalFinal,
        });
      }

      const checkoutRes = await checkoutSale(saleId, {
        ...billingPayload,
        tenders,
        economic_revision: economicRevision,
        idempotency_key:
          checkoutIdempotencyKeyRef.current ??
          (checkoutIdempotencyKeyRef.current = crypto.randomUUID()),
      });
      if (checkoutRes.error) throw new Error(checkoutRes.error.message);
      return checkoutRes.data!;
    },
    onSuccess: (data) => {
      // En modo cajero, SaleBuilder se monta dentro de /ventas/[id] (misma
      // ruta, mismo saleId): el push de abajo solo cambia el query string,
      // así que Next.js no remonta la página y el detalle no se refresca
      // solo con eso — hay que invalidar la query del padre para que deje
      // de renderizar SaleBuilder (status ya no es PENDING_CASHIER) y
      // muestre VentaDetalle.
      void queryClient.invalidateQueries({
        queryKey: ["venta-detail", data.id],
      });
      void queryClient.invalidateQueries({ queryKey: ["cash-session-summary"] });
      void queryClient.invalidateQueries({ queryKey: ["cash-session-history"] });
      void queryClient.invalidateQueries({ queryKey: ["pending-cashier-sales"] });
      void queryClient.invalidateQueries({ queryKey: ["sales"] });
      checkoutIdempotencyKeyRef.current = null;
      void router.push(`/ventas/${data.id}?nuevo=1`);
    },
    onError: (err: Error) => {
      snackbar.showError(err.message);
    },
  });

  // Paso vendedor: registra la venta sin cobrarla (contado, crédito y
  // apartado quedan PENDING_CASHIER para que el cajero cobre en Cajas).
  const registerSaleMutation = useMutation({
    mutationFn: async () => {
      const { id: saleId } = await ensureSaleSynced();
      const registerRes = await registerSale(saleId);
      if (registerRes.error) throw new Error(registerRes.error.message);
      return registerRes.data!;
    },
    onSuccess: () => {
      showSuccess("Venta registrada. Queda pendiente de cobro en caja.");
      onExit();
    },
    onError: (err: Error) => {
      snackbar.showError(err.message);
    },
  });

  const saleOperationPending =
    guardarCotizacionMutation.isPending ||
    cobrarMutation.isPending ||
    registerSaleMutation.isPending;

  const executeSaleOperation = async (operation: () => Promise<unknown>) => {
    if (saleOperationLockRef.current) return;
    saleOperationLockRef.current = true;
    try {
      await operation();
    } catch {
      // Each mutation reports its own contextual error through onError.
    } finally {
      saleOperationLockRef.current = false;
    }
  };

  const { data: clientSearchData, isLoading: clientSearchLoading } = useQuery({
    queryKey: [
      "client-search",
      debouncedClientModalSearch,
      clientModalPage,
      clientModalLimit,
    ],
    enabled: clientModalOpen,
    queryFn: async () => {
      const result = await getClients({
        search:
          debouncedClientModalSearch.trim().length > 1
            ? debouncedClientModalSearch
            : undefined,
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
    [productDetail, quantityMap],
  );

  // Sucursal a la que ya está comprometido el ticket, tomada de los artículos
  // que ya están en el carrito. `warehouse`/`incoming` no cuentan como sucursal
  // porque son bodega central compartida, no una sucursal física.
  const cartBranch = useMemo(() => {
    const branchSrc = cart
      .flatMap((item) => item.sources)
      .find((s) => s.sourceType === "branch" && s.quantity > 0);
    return branchSrc
      ? { id: branchSrc.branchId, label: branchSrc.label }
      : null;
  }, [cart]);

  // Sucursal que el usuario está seleccionando en el producto que está armando
  // ahora mismo (antes de darle "Continuar" y que entre al carrito).
  const selectionBranch = useMemo(() => {
    const branchSrc = productSources.find(
      (s) => s.sourceType === "branch" && s.quantity > 0,
    );
    return branchSrc
      ? { id: branchSrc.branchId, label: branchSrc.label }
      : null;
  }, [productSources]);

  const lockedBranch = cartBranch ?? selectionBranch;

  const isCardPayment =
    (Boolean(cardAmount) && parseFloat(cardAmount) > 0) ||
    extraCards.some((card) => parseFloat(card.amount.replace(/[^0-9.]/g, "")) > 0);
  const isCheckoutView = view === "checkout";

  const paymentTerminalBranchId = activeSessionQuery.data?.branch_id ?? null;
  const paymentTerminalsQuery = useQuery({
    queryKey: ["payment-terminals-catalog", paymentTerminalBranchId],
    queryFn: () => getPaymentTerminalsCatalog(paymentTerminalBranchId!),
    enabled: isCheckoutView && paymentTerminalBranchId != null,
    staleTime: 60_000,
  });
  const paymentTerminals = paymentTerminalsQuery.data ?? [];
  const paymentTerminalsLoading =
    isCheckoutView &&
    (activeSessionQuery.isLoading || paymentTerminalsQuery.isLoading);
  const hasPaymentTerminals = paymentTerminals.length > 0;

  if (
    isCheckoutView &&
    !paymentTerminalsLoading &&
    !hasPaymentTerminals &&
    (cardAmount !== "" || selectedTerminal != null)
  ) {
    setCardAmount("");
    setSelectedTerminal(null);
  }

  const isBranchSourceLocked = (src: {
    sourceType: string;
    branchId?: number;
  }) =>
    src.sourceType === "branch" &&
    lockedBranch !== null &&
    src.branchId !== lockedBranch.id;

  const { data: branchesCatalog = [] } = useQuery({
    queryKey: ["branches-catalog-pickup"],
    queryFn: async () => {
      const branches = await getBranchesCatalog();
      return branches.filter((b) => !b.is_main_warehouse);
    },
    enabled: branchPickerOpen || deliveryType === "pickup",
    staleTime: 5 * 60 * 1000,
  });

  const currentBranchOption = useMemo(() => {
    if (currentBranchId == null) return null;
    const fromCatalog = branchesCatalog.find((b) => b.id === currentBranchId);
    if (fromCatalog) return { id: fromCatalog.id, label: fromCatalog.name };
    return { id: currentBranchId, label: "Sucursal actual" };
  }, [branchesCatalog, currentBranchId]);

  // Pickup: sucursal actual por default. "Cambiar" fija un override.
  const effectiveDeliveryBranch = deliveryBranchOverridden
    ? deliveryBranch
    : currentBranchOption;

  const cartProductIds = useMemo(
    () => cart.map((i) => i.productId).join(","),
    [cart],
  );

  const hydratedUnsourcedIds = useMemo(
    () =>
      cart
        .filter((item) => item.sources.length === 0)
        .map((item) => item.productId)
        .sort((a, b) => a - b),
    [cart],
  );

  const { data: hydratedSellableCeiling } = useQuery({
    queryKey: [
      "hydrated-cart-coverage",
      coverageBranchId,
      hydratedUnsourcedIds,
    ],
    enabled:
      hydratedUnsourcedIds.length > 0 && coverageBranchId != null,
    queryFn: async () => {
      const branchId = coverageBranchId!;
      const pairs = await Promise.all(
        hydratedUnsourcedIds.map(async (id) => {
          const res = await getProductDetail(id, branchId);
          return [
            id,
            sellableCeilingForHydratedLine(
              res.data?.inventorySources ?? [],
              branchId,
            ),
          ] as const;
        }),
      );
      return Object.fromEntries(pairs) as Record<number, number>;
    },
    staleTime: 30_000,
  });

  const isApprovedSpecialDiscount =
    resumeSaleData?.discountRequest?.status === "APPROVED";

  const { data: hasStockAtDeliveryBranch } = useQuery({
    queryKey: [
      "delivery-branch-stock",
      effectiveDeliveryBranch?.id,
      cartProductIds,
    ],
    enabled:
      deliveryType === "pickup" && !!effectiveDeliveryBranch && cart.length > 0,
    queryFn: async () => {
      const checks = await Promise.all(
        cart.map(async (item) => {
          const res = await getProductDetail(
            item.productId,
            effectiveDeliveryBranch!.id,
            true,
          );
          const available =
            res.data?.inventorySources.find(
              (s) => s.branchId === effectiveDeliveryBranch!.id,
            )?.available ?? 0;
          return available >= item.quantity;
        }),
      );
      return checks.every(Boolean);
    },
  });

  const isDeliveryBranchCurrent =
    effectiveDeliveryBranch?.id === currentBranchId;
  const isSameDayPickup =
    deliveryType === "pickup" &&
    isDeliveryBranchCurrent &&
    hasStockAtDeliveryBranch === true;

  // El apartado difiere la fecha de entrega hasta liquidar (banner ya
  // existente en ventas/[id].tsx); el pickup del mismo día sigue con fecha
  // automática y no muestra el campo.
  const showCheckoutDeliveryDateField =
    paymentType !== "LAYAWAY" &&
    (deliveryType === "delivery" ||
      (deliveryType === "pickup" && !isSameDayPickup));

  // La fecha de recolección en otra sucursal con stock (escenario 3) y la
  // fecha de domicilio quedan diferidas para después del pago; el único caso
  // con fecha automática es el pickup inmediato en la sucursal actual.
  const effectivePickupDate = isSameDayPickup ? todayIsoDate : "";

  const handleUseClientBillingDataToggle = (checked: boolean) => {
    setUseClientBillingData(checked);
    if (checked && selectedClient) {
      const primaryAddress =
        selectedClient.addresses?.find((a) => a.isPrimary) ??
        selectedClient.addresses?.[0];
      billing.setValues((prev) => ({
        ...prev,
        businessName: selectedClient.businessName || selectedClient.fullName,
        rfc: selectedClient.rfc || prev.rfc,
        fiscalPostalCode:
          selectedClient.billingPostalCode ||
          primaryAddress?.postalCode ||
          prev.fiscalPostalCode,
        fiscalNeighborhoodFullCode: "-1",
        fiscalState: "",
        fiscalCity: "",
        fiscalStreet:
          selectedClient.billingStreet ||
          primaryAddress?.street ||
          prev.fiscalStreet,
        fiscalExternalNumber:
          primaryAddress?.externalNumber || prev.fiscalExternalNumber,
        invoiceEmail:
          selectedClient.invoiceEmail ||
          selectedClient.email ||
          prev.invoiceEmail,
      }));
    }
  };

  const handleSelectDeliveryBranch = (branch: {
    id: number;
    label: string;
  }) => {
    setDeliveryBranch(branch);
    setDeliveryBranchOverridden(true);
    setBranchPickerOpen(false);
  };

  const handleSelectProduct = (product: ProductSearchResult) => {
    setSelectedProductId(product.id);
    setQuantityMap({});
    setShowOtherBranches(false);
    setView("product-detail");
  };

  const handleProductCodeScanned = (code: string) => {
    setProductScannerOpen(false);
    setProductSearch(code);
    setProductPage(0);
    setView("search");
  };

  const canAddToCart = (): boolean => {
    if (!productDetail) return false;
    const totalQty = productSources.reduce((s, src) => s + src.quantity, 0);
    if (totalQty === 0) return false;
    if (totalQty > sellableMaxFromPickedSources(productSources)) {
      snackbar.showError(STOCK_SHORTAGE_MESSAGE);
      return false;
    }

    const branchSourcesWithQty = productSources.filter(
      (src) => src.sourceType === "branch" && src.quantity > 0,
    );
    if (new Set(branchSourcesWithQty.map((s) => s.branchId)).size > 1) {
      snackbar.showError(
        "No puedes combinar existencia de distintas sucursales en el mismo artículo.",
      );
      return false;
    }
    const pickedBranchId = branchSourcesWithQty[0]?.branchId;
    if (
      lockedBranch &&
      pickedBranchId !== undefined &&
      pickedBranchId !== lockedBranch.id
    ) {
      snackbar.showError(
        `Ya tienes artículos de "${lockedBranch.label}" en este ticket. Quita esos artículos para poder agregar de otra sucursal.`,
      );
      return false;
    }
    return true;
  };

  const commitAddToCart = (): boolean => {
    if (!canAddToCart() || !productDetail) return false;
    const totalQty = productSources.reduce((s, src) => s + src.quantity, 0);

    // Exceso sobre existencia de las fuentes elegidas = piezas de pedido
    // aceptado ("por surtir"). El spinner no deja vender más que eso.
    const backorderedQuantity = backorderedFromSources(
      productSources,
      totalQty,
    );

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
        backorderedQuantity,
      };
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = {
          ...updated[existing],
          quantity: totalQty,
          sources: productSources,
          backorderedQuantity,
        };
        return updated;
      }
      return [...prev, newItem];
    });
    setView("form");
    setSelectedProductId(null);
    setShowOtherBranches(false);
    setProductSearch("");
    return true;
  };

  const applyCartQtyChange = (productId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId !== productId) return item;
          const maxQty = qtyMaxForCartItem(item, hydratedSellableCeiling);
          const quantity = Math.min(
            maxQty,
            Math.max(0, item.quantity + delta),
          );
          if (item.sources.length === 0) {
            return { ...item, quantity };
          }
          return {
            ...item,
            quantity,
            backorderedQuantity: backorderedFromSources(item.sources, quantity),
          };
        })
        .filter((item) => item.quantity > 0),
    );
  };

  const applyRemoveFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const handleConfirmDiscountInvalidation = async () => {
    const mutation = pendingDiscountMutation;
    const request = resumeSaleData?.discountRequest;
    if (!mutation || !request) return;

    setDiscountInvalidateLoading(true);
    const res = await invalidateSaleDiscount(request.id);
    if (res.error) {
      snackbar.showError(
        `No se pudo invalidar el descuento especial: ${res.error.message}`,
      );
      setDiscountInvalidateLoading(false);
      return;
    }

    void queryClient.invalidateQueries({
      queryKey: ["resume-sale-draft", resumeSaleId],
    });

    if (mutation.kind === "qty") {
      applyCartQtyChange(mutation.productId, mutation.delta);
    } else if (mutation.kind === "remove") {
      applyRemoveFromCart(mutation.productId);
    } else if (mutation.kind === "add") {
      commitAddToCart();
    } else {
      setPaymentType(mutation.value);
    }

    setPendingDiscountMutation(null);
    setDiscountInvalidateLoading(false);
  };

  const handleAddToCart = () => {
    if (isApprovedSpecialDiscount) {
      if (!canAddToCart()) return;
      setPendingDiscountMutation({ kind: "add" });
      return;
    }
    commitAddToCart();
  };

  const handleCartQtyChange = (productId: number, delta: number) => {
    if (delta === 0) return;
    const item = cart.find((c) => c.productId === productId);
    if (!item) return;
    const maxQty = qtyMaxForCartItem(item, hydratedSellableCeiling);
    const next = Math.min(maxQty, Math.max(0, item.quantity + delta));
    if (next === item.quantity) {
      if (delta > 0) snackbar.showError(STOCK_SHORTAGE_MESSAGE);
      return;
    }
    if (isApprovedSpecialDiscount) {
      setPendingDiscountMutation({ kind: "qty", productId, delta });
      return;
    }
    applyCartQtyChange(productId, delta);
  };

  const handleRemoveFromCart = (productId: number) => {
    if (isApprovedSpecialDiscount) {
      setPendingDiscountMutation({ kind: "remove", productId });
      return;
    }
    applyRemoveFromCart(productId);
  };

  const handleQtyChange = (sourceKey: string, delta: number) => {
    setQuantityMap((prev) => ({
      ...prev,
      [sourceKey]: Math.max(0, (prev[sourceKey] ?? 0) + delta),
    }));
  };

  const totalCartQty = cart.reduce((s, item) => s + item.quantity, 0);
  const isMorosoClient = selectedClient?.creditStatus === "MOROSO";

  const handlePaymentTypeChange = (value: SalePaymentType) => {
    if (isMorosoClient && value !== "CASH") return;
    if (value === paymentType) return;
    if (isApprovedSpecialDiscount) {
      setPendingDiscountMutation({ kind: "paymentType", value });
      return;
    }
    setPaymentType(value);
  };
  const isClientWithoutActiveCredit =
    paymentType === "CREDIT" && selectedClient?.creditStatus !== "ACTIVE";

  const isDeliveryAddressReady =
    deliveryType === "delivery" &&
    (useCustomDeliveryAddress
      ? !!customDeliveryAddress
      : !!selectedClient?.primaryAddressFormatted);

  const deliveryAddressId =
    deliveryType !== "delivery"
      ? null
      : useCustomDeliveryAddress
        ? (customDeliveryAddress?.id ?? null)
        : (selectedClient?.addresses?.find((a) => a.isPrimary)?.addressId ??
          selectedClient?.addresses?.[0]?.addressId ??
          null);
  const debouncedDeliveryAddressId = useDebouncedValue(deliveryAddressId, 200);

  useAsyncEffect(
    async (isCancelled) => {
      if (deliveryType !== "delivery") {
        setShippingQuote(null);
        setShippingQuoteLoading(false);
        return;
      }
      if (debouncedDeliveryAddressId == null || coverageBranchId == null) {
        setShippingQuote(null);
        setShippingQuoteLoading(false);
        return;
      }
      setShippingQuoteLoading(true);
      try {
        const quote = await previewShippingQuote({
          address_id: debouncedDeliveryAddressId,
          dispatch_branch_id: coverageBranchId,
        });
        if (!isCancelled()) setShippingQuote(quote);
      } catch (error) {
        if (!isCancelled()) {
          setShippingQuote(null);
          snackbar.showError(
            error instanceof Error
              ? error.message
              : "No se pudo cotizar el envío",
          );
        }
      } finally {
        if (!isCancelled()) setShippingQuoteLoading(false);
      }
    },
    [deliveryType, debouncedDeliveryAddressId, coverageBranchId],
  );

  const cartPriceKey = cart
    .map((item) => `${item.productId}:${item.quantity}`)
    .join(",");
  const debouncedCartPriceKey = useDebouncedValue(cartPriceKey, 200);

  useAsyncEffect(
    async (isCancelled) => {
      if (
        isCajeroMode ||
        cart.length === 0 ||
        purchaseTypeId == null ||
        coverageBranchId == null
      ) {
        return;
      }
      if (activeSaleId != null && lastPatchedPurchaseTypeRef.current == null) {
        lastPatchedPurchaseTypeRef.current = purchaseTypeId;
      } else if (
        activeSaleId != null &&
        lastPatchedPurchaseTypeRef.current !== purchaseTypeId
      ) {
        const res = await updateSalePurchaseType(activeSaleId, purchaseTypeId);
        if (isCancelled()) return;
        if (res.error) {
          snackbar.showError(res.error.message);
          return;
        }
        lastPatchedPurchaseTypeRef.current = purchaseTypeId;
      }

      try {
        const lines = await previewCartPrices({
          branch_id: coverageBranchId,
          purchase_type_id: purchaseTypeId,
          items: cart.map((item) => ({
            product_id: item.productId,
            quantity: item.quantity,
          })),
        });
        if (isCancelled()) return;
        setCart((prev) => patchCartLinePrices(prev, lines));
      } catch (error) {
        if (!isCancelled()) {
          snackbar.showError(
            error instanceof Error
              ? error.message
              : "No se pudieron actualizar las promociones",
          );
        }
      }
    },
    [
      isCajeroMode,
      debouncedCartPriceKey,
      purchaseTypeId,
      coverageBranchId,
      activeSaleId,
    ],
  );

  const isPickupReady = deliveryType === "pickup" && !!effectiveDeliveryBranch;

  const isDeliveryInfoReady =
    deliveryType === "delivery"
      ? isDeliveryAddressReady
      : deliveryType === "pickup"
        ? isPickupReady
        : false;

  const canProceed =
    totalCartQty > 0 &&
    !isClientWithoutActiveCredit &&
    deliveryType !== null &&
    isDeliveryInfoReady;

  const subtotalOriginal = cartListSubtotal(cart);
  const totalDiscounts = cartLineDiscounts(cart);
  const approvedDiscountRequest =
    resumeSaleData?.discountRequest?.status === "APPROVED"
      ? resumeSaleData.discountRequest
      : null;
  const specialDiscountAmount = approvedDiscountRequest
    ? (approvedDiscountRequest.approvedDiscountAmount ??
      (subtotalOriginal - totalDiscounts) *
        ((approvedDiscountRequest.approvedDiscountPct ?? 0) / 100))
    : 0;
  const merchandiseNet = merchandiseTotal(cart, specialDiscountAmount);
  const shippingAmount =
    deliveryType === "delivery" ? (shippingQuote?.amount ?? 0) : 0;
  const totalFinal = merchandiseNet + shippingAmount;
  const showShippingInSummary =
    deliveryType === "delivery" &&
    (shippingQuoteLoading || shippingQuote != null);
  const shippingSummaryLabel =
    shippingQuote?.coverage === "OUT_OF_COVERAGE"
      ? "Envío (fuera de zona)"
      : "Envío";
  const shippingSummaryValue = shippingQuoteLoading
    ? "Calculando…"
    : formatCurrency(shippingAmount);
  const economicRevision =
    shippingQuote?.economicRevision ?? resumeSaleData?.economicRevision ?? 0;
  const cashAmtNum = parseFloat(cashAmount.replace(/[^0-9.]/g, "")) || 0;
  const cardAmtNum = parseFloat(cardAmount.replace(/[^0-9.]/g, "")) || 0;
  const extraCardAmtNum = extraCards.reduce(
    (sum, card) =>
      sum + (parseFloat(card.amount.replace(/[^0-9.]/g, "")) || 0),
    0,
  );
  const exceedsCashLimit =
    paymentType === "CASH" && cashAmtNum >= MAX_CASH_SALE_PAYMENT;
  const totalPaid = Math.round(cashAmtNum + cardAmtNum + extraCardAmtNum);
  const ENGANCHE_PCT = 0.1;
  const enganche = Math.round(totalFinal * ENGANCHE_PCT);
  const montoAFinanciar = totalFinal - enganche;

  const handleIdentityVerified = useCallback(() => {
    setIdentityOk(true);
    setIdentityVerificationModalOpen(false);
    setCashAmount(enganche.toFixed(2));
    setView("checkout");
  }, [enganche]);

  const handleIdentityDialogClose = useCallback(() => {
    setIdentityVerificationModalOpen(false);
  }, []);
  const amountToPay =
    paymentType === "CREDIT"
      ? enganche
      : paymentType === "LAYAWAY"
        ? 0
        : Math.round(totalFinal);
  const change = Math.max(0, totalPaid - amountToPay);

  const PAYMENT_OPTIONS: {
    value: "CREDIT" | "CASH" | "LAYAWAY";
    label: string;
  }[] = [
    { value: "CREDIT", label: "Crédito" },
    { value: "CASH", label: "Contado" },
    { value: "LAYAWAY", label: "Apartado" },
  ];

  const discountInvalidateModal = (
    <ConfirmModal
      open={pendingDiscountMutation != null}
      loading={discountInvalidateLoading}
      onClose={() => {
        if (discountInvalidateLoading) return;
        setPendingDiscountMutation(null);
      }}
      onConfirm={handleConfirmDiscountInvalidation}
      type="warning"
      title="Se invalidará el descuento"
      description="Si continúas, el descuento especial aprobado se invalidará. Tendrás que solicitar uno nuevo si lo necesitas."
      confirmLabel="Continuar"
      cancelLabel="Cancelar"
    />
  );

  const resumeIdReady =
    resumeSaleId !== null && !Number.isNaN(resumeSaleId);
  const waitingForResumeHydrate =
    resumeIdReady && hydratedSaleId !== resumeSaleId;
  if (resumeRoutePending || (waitingForResumeHydrate && !resumeSaleError)) {
    return <SaleBuilderResumeSkeleton onExit={onExit} />;
  }
  if (resumeIdReady && resumeSaleError) {
    return (
      <PageShell>
        <PageHeader>
          <Stack direction="row" alignItems="center" spacing={1} minWidth={0}>
            <InlineMobileMenuButton />
            <IconButton size="small" onClick={onExit} aria-label="Cerrar">
              <X size={18} />
            </IconButton>
            <Typography variant="h6" fontWeight={700} noWrap>
              Cotización
            </Typography>
          </Stack>
        </PageHeader>
        <Box px={3} py={2}>
          <Alert severity="error">No se pudo cargar la cotización.</Alert>
        </Box>
      </PageShell>
    );
  }

  if (view === "search") {
    return (
      <>
      <PageShell>
        <SearchHeader>
          <InlineMobileMenuButton />
          <IconButton size="medium" onClick={() => setView("form")} aria-label="Cerrar">
            <X size={20} />
          </IconButton>
          <SearchInputWrap>
            <OutlinedInput
              autoFocus
              fullWidth
              size="small"
              placeholder="Búsqueda de artículos..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              startAdornment={
                <InputAdornment position="start">
                  <Search size={16} color={theme.palette.text.secondary} />
                </InputAdornment>
              }
              sx={{ bgcolor: "background.paper" }}
            />
          </SearchInputWrap>
          {!isCajeroMode && (
            <TouchButton
              variant="outlined"
              startIcon={<ScanLine size={16} />}
              onClick={() => setProductScannerOpen(true)}
            >
              Escanear artículos
            </TouchButton>
          )}
        </SearchHeader>

        <PageContent>
          <TableCrud<ProductSearchResult>
            columns={[
              {
                id: "imageUrl",
                label: "Img",
                type: "text",
                size: "xs",
                format: (value) => (
                  <Box
                    component="img"
                    src={(value as string | null) ?? "/placeholder-product.png"}
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 1,
                      objectFit: "cover",
                    }}
                  />
                ),
              },
              {
                id: "name",
                label: "Nombre",
                type: "text",
                size: "lg",
                truncate: true,
              },
              {
                id: "finalPrice",
                label: "Precio Final",
                type: "currency",
                size: "md",
              },
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
        </PageContent>
      </PageShell>
      <ProductCodeScannerDialog
        open={productScannerOpen}
        onClose={() => setProductScannerOpen(false)}
        onCodeScanned={handleProductCodeScanned}
      />
      </>
    );
  }

  if (view === "product-detail") {
    const totalQty = productSources.reduce((s, src) => s + src.quantity, 0);

    return (
      <>
      <PageShell>
        <PageHeader>
          <Stack direction="row" alignItems="center" spacing={1} minWidth={0}>
            <InlineMobileMenuButton />
            <IconButton
              size="medium"
              onClick={() => {
                setShowOtherBranches(false);
                setView("search");
              }}
              aria-label="Volver"
            >
              <ArrowLeft size={20} />
            </IconButton>
            <Typography variant="subtitle1" fontWeight={600} noWrap>
              {productDetail?.name ?? "Cargando…"}
            </Typography>
          </Stack>
          <TouchButton
            variant="contained"
            disabled={totalQty === 0 || !productDetail}
            onClick={handleAddToCart}
          >
            Continuar
          </TouchButton>
        </PageHeader>

        {detailLoading || !productDetail ? (
          <Box sx={{ display: "flex", justifyContent: "center", pt: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <ProductDetailLayout>
            <ProductGallery>
            <Paper
              variant="outlined"
              sx={{
                width: "100%",
                borderRadius: 2,
                bgcolor: "background.paper",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                p: 3,
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  height: 340,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Box
                  component="img"
                  src={
                    productDetail.images?.[selectedImageIndex]?.imageUrl ??
                    productDetail.imageUrl ??
                    "/placeholder-product.png"
                  }
                  alt={productDetail.name}
                  sx={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                  }}
                />
              </Box>
              {(productDetail.images?.length ?? 0) > 1 && (
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    width: "100%",
                    overflowX: "auto",
                    pb: 0.5,
                  }}
                >
                  {productDetail.images?.map((image, index) => (
                    <Box
                      key={image.imageUrl}
                      component="img"
                      src={image.imageUrl}
                      alt={`${productDetail.name} ${index + 1}`}
                      onClick={() => setSelectedImageIndex(index)}
                      sx={{
                        width: 56,
                        height: 56,
                        flexShrink: 0,
                        objectFit: "contain",
                        borderRadius: 1,
                        cursor: "pointer",
                        border: "2px solid",
                        borderColor:
                          index === selectedImageIndex
                            ? "primary.main"
                            : "divider",
                        p: 0.5,
                      }}
                    />
                  ))}
                </Box>
              )}
            </Paper>
            </ProductGallery>

            <ProductDetailPanel>
            <Paper
              variant="outlined"
              sx={{
                width: "100%",
                borderRadius: 2,
                bgcolor: "background.paper",
                p: { xs: 2.5, md: 4 },
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

              <Stack
                direction="row"
                spacing={{ xs: 2, md: 4 }}
                mb={3}
                mt={1.5}
                flexWrap="wrap"
                useFlexGap
              >
                <Box minWidth={100}>
                  <Typography variant="caption" color="text.secondary">
                    Precio original
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {formatCurrency(productDetail.originalPrice)}
                  </Typography>
                </Box>
                <Box minWidth={100}>
                  <Typography variant="caption" color="text.secondary">
                    Descuento
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="error.main">
                    -{formatCurrency(productDetail.discountAmount)}
                  </Typography>
                </Box>
                <Box minWidth={100}>
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

              {lockedBranch && lockedBranch.id !== currentBranchId && (
                <Box
                  sx={{
                    bgcolor: "warning.50",
                    border: "1px solid",
                    borderColor: "warning.light",
                    borderRadius: 2,
                    px: 2,
                    py: 1.25,
                    mb: 2,
                  }}
                >
                  <Typography variant="caption" color="warning.dark">
                    Este ticket ya tiene artículos de &quot;{lockedBranch.label}
                    &quot;. Solo puedes seguir agregando artículos de esa
                    sucursal. Para agregar de otra, primero quita los artículos
                    actuales del carrito.
                  </Typography>
                </Box>
              )}

              {/* Orígenes principales: sucursal actual + bodega (existencia + por surtir) */}
              <Stack spacing={1.5}>
                {productSources
                  .filter(
                    (src) =>
                      src.sourceType === "warehouse" ||
                      src.branchId === currentBranchId,
                  )
                  .map((src) => {
                    const isWarehouse = src.sourceType === "warehouse";
                    const isCurrentBranch =
                      src.sourceType === "branch" &&
                      src.branchId === currentBranchId;

                    const sourceLabel = isCurrentBranch
                      ? `Ésta sucursal (${src.label})`
                      : "Bodega";

                    const SourceIcon = isCurrentBranch ? Store : Warehouse;

                    const branchLocked = isBranchSourceLocked(src);

                    return (
                      <InventorySourceCard
                        key={src.sourceKey}
                        sx={{ opacity: branchLocked ? 0.6 : 1 }}
                      >
                        <InventorySourceRow>
                          <InventorySourceMeta>
                            <Box
                              sx={{
                                color: "text.secondary",
                                display: "flex",
                                flexShrink: 0,
                              }}
                            >
                              <SourceIcon size={16} />
                            </Box>
                            <Typography
                              variant="body2"
                              sx={{ minWidth: 0, wordBreak: "break-word" }}
                            >
                              {sourceLabel}
                            </Typography>
                          </InventorySourceMeta>

                          <InventorySourceActions>
                            {isWarehouse && (
                              <>
                                <Stack
                                  direction="row"
                                  alignItems="center"
                                  spacing={0.75}
                                  flexShrink={0}
                                >
                                  <Truck
                                    size={13}
                                    color={theme.palette.text.disabled}
                                  />
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    noWrap
                                  >
                                    En tránsito: {src.inTransit ?? 0}
                                  </Typography>
                                </Stack>
                                <Stack
                                  direction="row"
                                  alignItems="center"
                                  spacing={0.75}
                                  flexShrink={0}
                                >
                                  <Package
                                    size={13}
                                    color={theme.palette.text.disabled}
                                  />
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    noWrap
                                  >
                                    Existencia: {src.available}
                                  </Typography>
                                </Stack>
                                {(src.pendingOrdered ?? 0) > 0 && (
                                  <Stack
                                    direction="row"
                                    alignItems="center"
                                    spacing={0.75}
                                    flexShrink={0}
                                  >
                                    <Package
                                      size={13}
                                      color={theme.palette.text.disabled}
                                    />
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      noWrap
                                    >
                                      Por surtir: {src.pendingOrdered}
                                    </Typography>
                                  </Stack>
                                )}
                              </>
                            )}
                            {isCurrentBranch && (
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={0.75}
                                flexShrink={0}
                              >
                                <Package
                                  size={13}
                                  color={theme.palette.text.disabled}
                                />
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  noWrap
                                >
                                  Existencia: {src.available}
                                </Typography>
                              </Stack>
                            )}
                            <Box sx={{ flexShrink: 0 }}>
                              <NumberSpinner
                                value={src.quantity}
                                onChange={(val: number) =>
                                  handleQtyChange(
                                    src.sourceKey,
                                    val - src.quantity,
                                  )
                                }
                                min={0}
                                max={sourceSellableMax(src)}
                                disabled={branchLocked}
                                size="medium"
                                iconSize={14}
                              />
                            </Box>
                          </InventorySourceActions>
                        </InventorySourceRow>
                        {branchLocked && lockedBranch && (
                          <Typography
                            variant="caption"
                            color="text.disabled"
                            display="block"
                            mt={0.75}
                          >
                            No disponible: ya tienes artículos de &quot;
                            {lockedBranch.label}&quot; en este ticket.
                          </Typography>
                        )}
                      </InventorySourceCard>
                    );
                  })}
              </Stack>

              {!showOtherBranches && productDetail?.hasOtherBranches && (
                <Button
                  variant="text"
                  size="small"
                  onClick={() => setShowOtherBranches(true)}
                  sx={{ mt: 1.5, px: 1 }}
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
                          src.branchId !== currentBranchId,
                      )
                      .map((src) => {
                        const branchLocked = isBranchSourceLocked(src);
                        return (
                          <InventorySourceCard
                            key={src.sourceKey}
                            sx={{ opacity: branchLocked ? 0.6 : 1 }}
                          >
                            <InventorySourceRow>
                              <InventorySourceMeta>
                                <Box
                                  sx={{
                                    color: "text.secondary",
                                    display: "flex",
                                    flexShrink: 0,
                                  }}
                                >
                                  <Store size={16} />
                                </Box>
                                <Typography
                                  variant="body2"
                                  sx={{ minWidth: 0, wordBreak: "break-word" }}
                                >
                                  {src.label}
                                </Typography>
                              </InventorySourceMeta>
                              <InventorySourceActions>
                                <Stack
                                  direction="row"
                                  alignItems="center"
                                  spacing={0.75}
                                  flexShrink={0}
                                >
                                  <Package
                                    size={13}
                                    color={theme.palette.text.disabled}
                                  />
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    noWrap
                                  >
                                    Existencia: {src.available}
                                  </Typography>
                                </Stack>
                                <Box sx={{ flexShrink: 0 }}>
                                  <NumberSpinner
                                    value={src.quantity}
                                    onChange={(val: number) =>
                                      handleQtyChange(
                                        src.sourceKey,
                                        val - src.quantity,
                                      )
                                    }
                                    min={0}
                                    max={src.available}
                                    disabled={branchLocked}
                                    size="medium"
                                    iconSize={14}
                                  />
                                </Box>
                              </InventorySourceActions>
                            </InventorySourceRow>
                            {branchLocked && lockedBranch && (
                              <Typography
                                variant="caption"
                                color="text.disabled"
                                display="block"
                                mt={0.75}
                              >
                                No disponible: ya tienes artículos de &quot;
                                {lockedBranch.label}&quot; en este ticket.
                              </Typography>
                            )}
                          </InventorySourceCard>
                        );
                      })}
                  </Stack>
                </>
              )}
            </Paper>
            </ProductDetailPanel>
          </ProductDetailLayout>
        )}
      </PageShell>
      {discountInvalidateModal}
      </>
    );
  }

  if (view === "checkout") {
    const canRegister =
      !saleOperationPending &&
      totalPaid >= amountToPay &&
      !exceedsCashLimit &&
      (paymentType !== "CREDIT" || identityOk) &&
      (!isCardPayment ||
        (hasPaymentTerminals && selectedTerminal != null));

    return (
      <PageShell aria-busy={saleOperationPending}>
        <PageHeader>
          <Stack direction="row" alignItems="center" spacing={1}>
            <InlineMobileMenuButton />
            <IconButton
              size="medium"
              disabled={saleOperationPending}
              onClick={() => (isCajeroMode ? onExit() : setView("form"))}
              aria-label={isCajeroMode ? "Cerrar" : "Volver"}
            >
              <X size={20} />
            </IconButton>
            <Typography variant="h6" fontWeight={700}>
              Confirmar venta
            </Typography>
          </Stack>
        </PageHeader>

        <CheckoutGrid>
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
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1.5,
                      p: 1.5,
                    }}
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
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: "100%",
                              height: "100%",
                              bgcolor: "grey.200",
                            }}
                          />
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
                      <Stack
                        direction="row"
                        alignItems="flex-start"
                        spacing={3}
                        flexShrink={0}
                      >
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
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Descuento
                            </Typography>
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              color="error.main"
                            >
                              -{formatCurrency(item.discountAmount)}
                            </Typography>
                          </Box>
                        )}
                        <Box textAlign="right">
                          <Typography variant="caption" color="text.secondary">
                            Total
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {formatCurrency(lineTotal(item))}
                          </Typography>
                        </Box>
                      </Stack>
                    </Stack>
                    {item.backorderedQuantity > 0 && (
                      <BackorderChip
                        backorderedQuantity={item.backorderedQuantity}
                        quantity={item.quantity}
                        sx={{ mt: 1 }}
                      />
                    )}
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
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                mb={wantsInvoice ? 2 : 0}
              >
                <Switch
                  checked={wantsInvoice}
                  onChange={(e) => {
                    setWantsInvoice(e.target.checked);
                    if (e.target.checked && !billingConfirmed) {
                      billing.reset();
                      setUseClientBillingData(false);
                      setBillingModalOpen(true);
                    }
                  }}
                  size="small"
                />
                <Typography variant="body2">
                  {wantsInvoice ? "Si desea facturar" : "No desea facturar"}
                </Typography>
              </Stack>
              {wantsInvoice && billingConfirmed && (
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
                    {billing.values.businessName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={0.25}>
                    {billing.values.rfc}
                  </Typography>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    mb={0.25}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {formatStreetAddressLine({
                        street: billing.values.fiscalStreet,
                        externalNumber: billing.values.fiscalExternalNumber,
                      })}
                    </Typography>
                    <Box
                      sx={{ width: "1px", height: 14, bgcolor: "divider" }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      CP. {billing.values.fiscalPostalCode}
                    </Typography>
                  </Stack>
                  {billing.values.sendInvoiceByEmail &&
                    billing.values.invoiceEmail && (
                      <Typography
                        variant="body2"
                        sx={{ color: "primary.main" }}
                      >
                        {billing.values.invoiceEmail}
                      </Typography>
                    )}
                </Box>
              )}
            </Paper>
          </Stack>

          <Stack spacing={2}>
            <Paper variant="outlined" sx={{ borderRadius: 2, p: 2.5 }}>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Subtotal
                  </Typography>
                  <Typography variant="body2">
                    {formatCurrency(subtotalOriginal)}
                  </Typography>
                </Stack>
                {totalDiscounts > 0 && (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Descuentos
                    </Typography>
                    <Typography variant="body2" color="error.main">
                      -{formatCurrency(totalDiscounts)}
                    </Typography>
                  </Stack>
                )}
                {specialDiscountAmount > 0 && (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Descuento especial aprobado
                    </Typography>
                    <Typography variant="body2" color="error.main">
                      -{formatCurrency(specialDiscountAmount)}
                    </Typography>
                  </Stack>
                )}
                {showShippingInSummary && (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      {shippingSummaryLabel}
                    </Typography>
                    <Typography variant="body2">
                      {shippingSummaryValue}
                    </Typography>
                  </Stack>
                )}
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Total
                  </Typography>
                  <Typography variant="body2">
                    {formatCurrency(totalFinal)}
                  </Typography>
                </Stack>

                {paymentType === "CREDIT" && (
                  <>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      mt={1}
                    >
                      <Typography variant="h6" fontWeight={700}>
                        Enganche:
                      </Typography>
                      <Typography variant="h6" fontWeight={700}>
                        {formatCurrency(enganche)}
                      </Typography>
                    </Stack>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography variant="h6" fontWeight={700}>
                        Monto a financiar
                      </Typography>
                      <Typography variant="h6" fontWeight={700}>
                        {formatCurrency(montoAFinanciar)}
                      </Typography>
                    </Stack>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      gap={1}
                    >
                      <Select
                        size="small"
                        value={selectedTermMonths}
                        onChange={(e) =>
                          setSelectedTermMonths(e.target.value as 12 | 18 | 24)
                        }
                        sx={{ minWidth: 110 }}
                      >
                        <MenuItem value={12}>12 meses</MenuItem>
                        <MenuItem value={18}>18 meses</MenuItem>
                        <MenuItem value={24}>24 meses</MenuItem>
                      </Select>
                      <Typography variant="body2" fontWeight={600}>
                        {formatCurrency(
                          montoAFinanciar / selectedTermMonths,
                        )}
                      </Typography>
                    </Stack>
                  </>
                )}
                {paymentType === "LAYAWAY" && activeLayawayTerm && (
                  <>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      mt={1}
                    >
                      <Typography variant="h6" fontWeight={700}>
                        Fecha límite:
                      </Typography>
                      <Typography variant="h6" fontWeight={700}>
                        {dayjs()
                          .add(activeLayawayTerm.days, "day")
                          .format("D [de] MMMM")}
                      </Typography>
                    </Stack>
                    <Select
                      size="small"
                      value={activeLayawayTerm.id}
                      onChange={(e) =>
                        setSelectedLayawayTermId(Number(e.target.value))
                      }
                      sx={{ minWidth: 140 }}
                    >
                      {layawayTerms.map((term) => (
                        <MenuItem key={term.id} value={term.id}>
                          {term.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </>
                )}
              </Stack>
            </Paper>

            <SaleCheckoutPaymentPanel
              cashAmount={cashAmount}
              cardAmount={cardAmount}
              onCashAmountChange={setCashAmount}
              onCardAmountChange={setCardAmount}
              extraCards={extraCards}
              onExtraCardsChange={setExtraCards}
              isCardPayment={isCardPayment}
              exceedsCashLimit={exceedsCashLimit}
              cashLimitErrorMessage={MAX_CASH_SALE_PAYMENT_MESSAGE}
              selectedTerminal={selectedTerminal}
              onTerminalChange={setSelectedTerminal}
              terminals={paymentTerminals}
              terminalsLoading={paymentTerminalsLoading}
              cardPaymentDisabled={
                paymentTerminalsLoading || !hasPaymentTerminals
              }
              showNoTerminalsWarning={
                !paymentTerminalsLoading && !hasPaymentTerminals
              }
              showChange={paymentType !== "LAYAWAY"}
              change={change}
              canRegister={canRegister}
              isPending={saleOperationPending}
              amountToPay={amountToPay}
              onRegister={() => {
                if (showCheckoutDeliveryDateField && !checkoutDeliveryDate) {
                  setDeliveryDateWarningOpen(true);
                } else {
                  void executeSaleOperation(() => cobrarMutation.mutateAsync());
                }
              }}
            />
          </Stack>
        </CheckoutGrid>

        <ConfirmModal
          open={deliveryDateWarningOpen}
          onClose={() => {
            openDeliveryPickerAfterWarningRef.current = false;
            setDeliveryDateWarningOpen(false);
          }}
          onCancel={() => {
            openDeliveryPickerAfterWarningRef.current = true;
            setDeliveryDateWarningOpen(false);
          }}
          onConfirm={() => {
            openDeliveryPickerAfterWarningRef.current = false;
            setDeliveryDateWarningOpen(false);
            void executeSaleOperation(() => cobrarMutation.mutateAsync());
          }}
          onExited={() => {
            if (!openDeliveryPickerAfterWarningRef.current) return;
            openDeliveryPickerAfterWarningRef.current = false;
            setCheckoutDeliveryDateModalOpen(true);
          }}
          type="warning"
          title="¿Continuar sin asignar fecha de entrega?"
          description="No has asignado una fecha de entrega. Podrás asignarla después desde el detalle de la venta, pero se recomienda confirmarla con el cliente antes de cobrar."
          confirmLabel="Continuar sin fecha"
          cancelLabel="Asignar fecha"
        />

        <DeliveryDatePicker
          open={checkoutDeliveryDateModalOpen}
          onClose={() => setCheckoutDeliveryDateModalOpen(false)}
          branchId={currentBranchId ?? undefined}
          value={checkoutDeliveryDate}
          onConfirm={(date) => {
            setCheckoutDeliveryDate(date);
            setCheckoutDeliveryDateModalOpen(false);
          }}
        />

        <SideModal
          open={billingModalOpen}
          onClose={() => setBillingModalOpen(false)}
          title="Agregar datos de facturación"
          maxWidth="lg"
        >
          <Stack spacing={3}>
            <BillingFieldsForm
              values={billing.values}
              onChange={billing.setValue}
              whatsappFallbackNumber={selectedClient?.phoneNumber ?? undefined}
              lockedFields={
                useClientBillingData
                  ? {
                      businessName: true,
                      rfc: true,
                      fiscalStreet: true,
                      fiscalExternalNumber: true,
                    }
                  : undefined
              }
              beforeFields={
                selectedClient ? (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={useClientBillingData}
                        onChange={(e) =>
                          handleUseClientBillingDataToggle(e.target.checked)
                        }
                      />
                    }
                    label="Usar los mismos datos del cliente"
                  />
                ) : undefined
              }
            />

            <Button
              variant="contained"
              sx={{ textTransform: "none", alignSelf: "flex-start" }}
              onClick={() => {
                setBillingConfirmed(true);
                setBillingModalOpen(false);
              }}
            >
              Guardar
            </Button>
          </Stack>
        </SideModal>
      </PageShell>
    );
  }

  return (
    <PageShell aria-busy={saleOperationPending}>
      <SaleBuilderHeader
        title={
          isCajeroMode && activeSaleFolio
            ? `Cobro ${activeSaleFolio}`
            : resumeSaleId !== null && activeSaleFolio
              ? `Cotización ${activeSaleFolio}`
              : "Nueva venta"
        }
        onExit={onExit}
        isCajeroMode={isCajeroMode}
        canProceed={canProceed}
        showDiscountButton={resumeSaleId !== null}
        discountDisabled={
          resumeSaleData?.discountRequest != null &&
          resumeSaleData.discountRequest.status !== "INVALIDATED"
        }
        operationPending={saleOperationPending}
        savePending={guardarCotizacionMutation.isPending}
        saveDisabled={cart.length === 0 || (branchUnresolved && activeSaleId === null)}
        registerPending={registerSaleMutation.isPending}
        saveLabel={
          resumeSaleId !== null ? "Actualizar cotización" : "Guardar cotización"
        }
        onSave={() =>
          void executeSaleOperation(() =>
            guardarCotizacionMutation.mutateAsync(),
          )
        }
        onDiscount={() => setDiscountRequestModalOpen(true)}
        onRegisterSale={() =>
          void executeSaleOperation(() => registerSaleMutation.mutateAsync())
        }
        proceedLabel={
          paymentType === "CREDIT" && !identityOk
            ? "Validar identidad"
            : "Proceder al cobro"
        }
        onProceedToCheckout={() => {
          if (paymentType === "CREDIT" && !identityOk) {
            setIdentityVerificationModalOpen(true);
          } else {
            setView("checkout");
          }
        }}
      />

      <MainGrid>
        <Stack spacing={2}>
          {branchUnresolved && (
            <Alert severity="warning">
              No se pudo determinar tu sucursal.
            </Alert>
          )}
          {isCajeroMode && paymentType === "CREDIT" && !identityOk && (
            <Alert severity="info">
              Valida la identidad del titular del crédito antes de cobrar el
              enganche.
            </Alert>
          )}
          {resumeSaleData?.discountRequest != null && (
            <DiscountRequestStatusBanner
              motivo={getDiscountRequestReasonLabel(
                resumeSaleData.discountRequest.reason,
                resumeSaleData.discountRequest.notes,
              )}
              estado={getDiscountRequestStatusLabel(
                resumeSaleData.discountRequest.status,
              )}
              status={resumeSaleData.discountRequest.status}
              warning={
                resumeSaleData.discountRequest.status === "APPROVED"
                  ? "Cualquier cambio en artículos, cantidades o tipo de venta invalidará este descuento."
                  : undefined
              }
            />
          )}
          <Card>
            <Stack
              direction="row"
              alignItems="flex-start"
              justifyContent="space-between"
              spacing={1.5}
              flexWrap="wrap"
              useFlexGap
            >
              <Box minWidth={0} flex="1 1 160px">
                <Typography variant="subtitle1" fontWeight={700}>
                  Artículos
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Agrega los artículos para este cliente.
                </Typography>
              </Box>
              {!isCajeroMode && (
                <Stack
                  direction="row"
                  spacing={1}
                  flexShrink={0}
                  sx={{ "& .MuiButton-root": { flexShrink: 0 } }}
                >
                  <TouchButton
                    variant="option"
                    color="inherit"
                    startIcon={<ScanLine size={16} />}
                    onClick={() => setProductScannerOpen(true)}
                  >
                    Escanear artículos
                  </TouchButton>
                  <TouchButton
                    variant="option"
                    color="inherit"
                    startIcon={<Search size={16} />}
                    onClick={() => setView("search")}
                  >
                    Buscar
                  </TouchButton>
                </Stack>
              )}
            </Stack>

            {cart.length === 0 ? (
              <EmptyCartBox>
                <Typography variant="body2" color="text.disabled">
                  No tienes artículos agregados a esta venta
                </Typography>
              </EmptyCartBox>
            ) : (
              <>
                <Stack spacing={1.5}>
                  {cart.map((item) => (
                    <SaleCartItemRow
                      key={item.productId}
                      item={item}
                      isLayaway={paymentType === "LAYAWAY"}
                      isCajeroMode={isCajeroMode}
                      currentBranchId={currentBranchId}
                      qtyMax={qtyMaxForCartItem(item, hydratedSellableCeiling)}
                      onRemove={handleRemoveFromCart}
                      onQtyChange={handleCartQtyChange}
                    />
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
                      {formatCurrency(subtotalOriginal)}
                    </Typography>
                  </Stack>

                  {totalDiscounts > 0 && (
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      py={1.25}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Descuentos
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={500}
                        color="error.main"
                      >
                        -{formatCurrency(totalDiscounts)}
                      </Typography>
                    </Stack>
                  )}

                  {specialDiscountAmount > 0 && (
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      py={1.25}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Descuento especial aprobado
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={500}
                        color="error.main"
                      >
                        -{formatCurrency(specialDiscountAmount)}
                      </Typography>
                    </Stack>
                  )}

                  {showShippingInSummary && (
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      py={1.25}
                    >
                      <Typography variant="body2" color="text.secondary">
                        {shippingSummaryLabel}
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {shippingSummaryValue}
                      </Typography>
                    </Stack>
                  )}

                  <TotalBar>
                    <Typography variant="body2" fontWeight={600}>
                      Total
                    </Typography>
                    <Typography variant="body2" fontWeight={700}>
                      {formatCurrency(totalFinal)}
                    </Typography>
                  </TotalBar>

                  {paymentType === "CREDIT" && (
                    <>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      py={1.25}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Enganche solicitado (10%)
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {formatCurrency(enganche)}
                      </Typography>
                    </Stack>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      py={1.25}
                    >
                      <Typography variant="body2" fontWeight={700}>
                        Monto a financiar
                      </Typography>
                      <Typography variant="body2" fontWeight={700}>
                        {formatCurrency(montoAFinanciar)}
                      </Typography>
                    </Stack>
                    </>
                  )}

                  {paymentType === "LAYAWAY" && (
                    <>
                      <Box
                        sx={{
                          bgcolor: "grey.100",
                          borderRadius: 1,
                          px: 1.5,
                          py: 1.5,
                          mt: 1,
                        }}
                      >
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          mb={1.5}
                        >
                          <Typography variant="body2" fontWeight={600}>
                            Total a liquidar
                          </Typography>
                          <Typography variant="h6" fontWeight={700}>
                            {formatCurrency(totalFinal)}
                          </Typography>
                        </Stack>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          mb={1}
                        >
                          Plazo disponible:
                        </Typography>

                        <TermPillsRow>
                          {layawayTerms.map((term) => (
                            <TermPill
                              key={term.id}
                              active={selectedLayawayTermId === term.id}
                              onClick={() => setSelectedLayawayTermId(term.id)}
                            >
                              {term.name}
                            </TermPill>
                          ))}
                        </TermPillsRow>
                      </Box>
                    </>
                  )}
                </Box>
              </>
            )}
          </Card>
        </Stack>

        <StickySidebar>
          <SidebarCard>
            <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
              Tipo de venta
            </Typography>
            {isCajeroMode ? (
              <Typography variant="body2">
                {PAYMENT_OPTIONS.find((opt) => opt.value === paymentType)
                  ?.label ?? "—"}
              </Typography>
            ) : (
              <PaymentTypeRow>
                {PAYMENT_OPTIONS.map((opt) => (
                  <PaymentTypeButton
                    key={opt.value}
                    active={paymentType === opt.value}
                    disabled={isMorosoClient && opt.value !== "CASH"}
                    onClick={() => handlePaymentTypeChange(opt.value)}
                  >
                    {opt.label}
                  </PaymentTypeButton>
                ))}
              </PaymentTypeRow>
            )}
          </SidebarCard>

          <SidebarCard>
            {selectedClient ? (
              <>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  mb={1.5}
                >
                  <Typography variant="subtitle2" fontWeight={700}>
                    Cliente
                  </Typography>
                  <Button
                    size="small"
                    variant="text"
                    disabled={isCajeroMode}
                    sx={{
                      ...CHANGE_LINK_SX,
                      fontSize: "0.875rem",
                    }}
                    onClick={() => {
                      setClientModalOpen(true);
                      setClientModalSearch("");
                    }}
                  >
                    Cambiar
                  </Button>
                </Stack>

                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={1}
                  mb={0.5}
                >
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    title={selectedClient.fullName}
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {selectedClient.fullName}
                  </Typography>
                  <Chip
                    label={
                      selectedClient.creditStatus === "MOROSO"
                        ? "Moroso"
                        : selectedClient.creditStatus === "ACTIVE"
                          ? "Con crédito"
                          : "Sin crédito"
                    }
                    size="small"
                    color={
                      selectedClient.creditStatus === "MOROSO"
                        ? "error"
                        : selectedClient.creditStatus === "ACTIVE"
                          ? "success"
                          : "default"
                    }
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.7rem",
                      flexShrink: 0,
                    }}
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

                {isMorosoClient && (
                  <Box
                    sx={{
                      bgcolor: theme.palette.app.chip.variants.error.background,
                      border: "1px solid",
                      borderColor: "error.main",
                      borderRadius: 1,
                      px: 1.5,
                      py: 1,
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="error.main"
                      fontWeight={600}
                    >
                      Este cliente está en mora y solo puede realizar compras
                      de contado.
                    </Typography>
                  </Box>
                )}

                {paymentType === "CREDIT" &&
                  selectedClient.creditStatus == null && (
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      startIcon={<CreditCard size={16} />}
                      sx={{
                        justifyContent: "flex-start",
                        mt: 1.5,
                        minHeight: 44,
                        height: 44,
                        maxHeight: 44,
                        px: 1.5,
                      }}
                      onClick={() => setCreditIntakeModalOpen(true)}
                    >
                      Solicitar crédito para este cliente
                    </Button>
                  )}
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
                />

                {(paymentType === "CASH" || paymentType === "LAYAWAY") && (
                  <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    startIcon={<Plus size={16} />}
                    sx={{
                      justifyContent: "flex-start",
                      minHeight: 44,
                      height: 44,
                      maxHeight: 44,
                      px: 1.5,
                    }}
                    onClick={() => setCreateClientModalOpen(true)}
                  >
                    Registrar nuevo cliente
                  </Button>
                )}
              </>
            )}
          </SidebarCard>

          {selectedClient && (
            <SidebarCard>
              <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
                Entrega
              </Typography>

              {isCajeroMode ? (
                <>
                  <ReadOnlyField
                    label="Fecha de entrega"
                    value={formatCheckoutDeliveryDate(checkoutDeliveryDate)}
                  />
                  <ReadOnlyField
                    label="Tipo de entrega"
                    value={
                      deliveryType
                        ? DELIVERY_TYPE_LABELS[deliveryType]
                        : "Sin tipo de entrega"
                    }
                  />
                  {deliveryType === "delivery" && (
                    <>
                      <DeliveryMapPreview
                        coords={deliveryCoords}
                        apiKey={GOOGLE_MAPS_API_KEY}
                      />
                      <ReadOnlyField
                        label="Dirección de entrega"
                        value={
                          useCustomDeliveryAddress
                            ? customDeliveryAddress?.formatted
                            : selectedClient.primaryAddressFormatted
                        }
                      />
                      <ReadOnlyField
                        label="Email"
                        value={selectedClient.email}
                      />
                      <ReadOnlyField
                        label="Teléfono de quién recibe"
                        value={selectedClient.phoneNumber}
                      />
                    </>
                  )}
                  {deliveryType === "pickup" && (
                    <ReadOnlyField
                      label="Sucursal de entrega"
                      value={
                        effectiveDeliveryBranch
                          ? `${effectiveDeliveryBranch.label}${
                              effectiveDeliveryBranch.id === currentBranchId
                                ? " [Actual]"
                                : ""
                            }`
                          : undefined
                      }
                    />
                  )}
                </>
              ) : (
                <>
              {showCheckoutDeliveryDateField && (
                <Box sx={{ mb: 1.5 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    mb={0.5}
                  >
                    Fecha de entrega (opcional)
                  </Typography>
                  <Box
                    onClick={() => setCheckoutDeliveryDateModalOpen(true)}
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1.5,
                      px: 2,
                      py: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      color: checkoutDeliveryDate
                        ? "text.primary"
                        : "primary.main",
                      fontWeight: 500,
                      fontSize: "0.85rem",
                    }}
                  >
                    {checkoutDeliveryDate
                      ? formatCheckoutDeliveryDate(checkoutDeliveryDate)
                      : "Asignar fecha de entrega"}
                    <Calendar size={16} />
                  </Box>
                </Box>
              )}

              <Select
                fullWidth
                size="small"
                displayEmpty
                value={deliveryType ?? ""}
                onChange={(e) =>
                  setDeliveryType(
                    (e.target.value || null) as "delivery" | "pickup" | null,
                  )
                }
                sx={{
                  mb: 1.5,
                  minHeight: 44,
                  borderRadius: 1,
                  bgcolor: "background.paper",
                  "& .MuiSelect-select": {
                    py: 1.25,
                    display: "flex",
                    alignItems: "center",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "divider",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "text.secondary",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "primary.main",
                    borderWidth: 1,
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      mt: 0.5,
                      boxShadow: 2,
                    },
                  },
                }}
              >
                <MenuItem value="" disabled>
                  <Typography variant="body2" color="text.secondary">
                    Selecciona un tipo de entrega
                  </Typography>
                </MenuItem>
                <MenuItem value="delivery">A domicilio</MenuItem>
                <MenuItem value="pickup">En tienda o bodega</MenuItem>
              </Select>

              {deliveryType === "delivery" && (
                <>
                  <DeliveryMapPreview
                    coords={deliveryCoords}
                    apiKey={GOOGLE_MAPS_API_KEY}
                  />
                  {shippingQuote && shippingQuote.coverage !== "IN_ZONE" ? (
                    <Alert severity="warning" sx={{ mb: 1.5 }}>
                      {shippingQuote.coverage === "UNCONFIGURED"
                        ? "No hay cobertura de envío configurada para esta dirección."
                        : "La dirección está fuera de la zona de cobertura. Se aplica el costo de envío fuera de zona."}
                    </Alert>
                  ) : null}

                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    mb={0.5}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Dirección de entrega
                    </Typography>
                    <Button
                      size="small"
                      variant="text"
                      sx={{
                        ...CHANGE_LINK_SX,
                        fontSize: "0.75rem",
                      }}
                      onClick={() => setDeliveryAddressModalOpen(true)}
                    >
                      Cambiar
                    </Button>
                  </Stack>
                  <Typography variant="body2" mb={0.5}>
                    {useCustomDeliveryAddress
                      ? (customDeliveryAddress?.formatted ??
                        "Sin dirección capturada")
                      : (selectedClient.primaryAddressFormatted ??
                        "Sin dirección registrada")}
                  </Typography>
                  {useCustomDeliveryAddress && (
                    <Button
                      size="small"
                      variant="text"
                      sx={{
                        ...CHANGE_LINK_SX,
                        fontSize: "0.75rem",
                        mb: 1,
                      }}
                      onClick={() => {
                        setUseCustomDeliveryAddress(false);
                        setCustomDeliveryAddress(null);
                      }}
                    >
                      Usar dirección del cliente
                    </Button>
                  )}
                  {selectedClient.email && (
                    <Typography variant="body2" color="text.secondary" mb={1.5}>
                      {selectedClient.email}
                    </Typography>
                  )}

                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    mb={1.5}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Teléfono de quién recibe
                    </Typography>
                  </Stack>
                  {selectedClient.phoneNumber && (
                    <Typography variant="body2" color="text.secondary">
                      {selectedClient.phoneNumber}
                    </Typography>
                  )}
                </>
              )}

              {deliveryType === "pickup" && (
                <>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    mb={0.5}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Sucursal de entrega
                    </Typography>
                    <Button
                      size="small"
                      variant="text"
                      sx={{
                        ...CHANGE_LINK_SX,
                        fontSize: "0.75rem",
                      }}
                      onClick={() => setBranchPickerOpen(true)}
                    >
                      Cambiar
                    </Button>
                  </Stack>
                  <Typography variant="body2" fontWeight={600} mb={1.5}>
                    {effectiveDeliveryBranch
                      ? `${effectiveDeliveryBranch.label}${
                          effectiveDeliveryBranch.id === currentBranchId
                            ? " [Actual]"
                            : ""
                        }`
                      : "Selecciona una sucursal"}
                  </Typography>

                  {effectiveDeliveryBranch &&
                    hasStockAtDeliveryBranch === undefined && (
                      <Typography variant="caption" color="text.secondary">
                        Verificando existencia en esta sucursal...
                      </Typography>
                    )}

                  {isSameDayPickup && (
                    <Alert severity="success" sx={{ mb: 1 }}>
                      Entrega hoy mismo en tienda.
                    </Alert>
                  )}
                </>
              )}
                </>
              )}
            </SidebarCard>
          )}

          <DeliveryDatePicker
            open={checkoutDeliveryDateModalOpen}
            onClose={() => setCheckoutDeliveryDateModalOpen(false)}
            branchId={currentBranchId ?? undefined}
            value={checkoutDeliveryDate}
            onConfirm={(date) => {
              setCheckoutDeliveryDate(date);
              setCheckoutDeliveryDateModalOpen(false);
            }}
          />

          <Dialog
            open={branchPickerOpen}
            onClose={() => setBranchPickerOpen(false)}
            maxWidth="xs"
            fullWidth
          >
            <DialogContent sx={{ p: 0 }}>
              <Typography
                variant="subtitle1"
                fontWeight={700}
                sx={{ p: 2, pb: 1 }}
              >
                Selecciona la sucursal de entrega
              </Typography>
              <List sx={{ maxHeight: 360, overflowY: "auto" }}>
                {branchesCatalog.map((b) => (
                  <ListItemButton
                    key={b.id}
                    selected={effectiveDeliveryBranch?.id === b.id}
                    onClick={() =>
                      handleSelectDeliveryBranch({ id: b.id, label: b.name })
                    }
                  >
                    <ListItemText
                      primary={b.name}
                      secondary={
                        b.id === currentBranchId
                          ? "Sucursal actual"
                          : undefined
                      }
                    />
                  </ListItemButton>
                ))}
              </List>
            </DialogContent>
          </Dialog>

          <DeliveryAddressModal
            open={deliveryAddressModalOpen}
            onClose={() => setDeliveryAddressModalOpen(false)}
            onSaved={async (address) => {
              if (activeSaleId) {
                await setDeliveryDate(activeSaleId, {
                  delivery_type: "ADDRESS",
                  address_id: address.id,
                  ...(checkoutDeliveryDate
                    ? { delivery_date: checkoutDeliveryDate }
                    : {}),
                });
              }
              setCustomDeliveryAddress(address);
              setUseCustomDeliveryAddress(true);
              setDeliveryAddressModalOpen(false);
            }}
          />

          <IdentityVerificationDialog
            open={identityVerificationModalOpen}
            saleId={activeSaleId}
            onVerified={handleIdentityVerified}
            onClose={handleIdentityDialogClose}
          />

          <SideModal
            open={clientModalOpen}
            onClose={() => setClientModalOpen(false)}
            title="Buscar cliente"
            description="Ingresa el nombre o número de teléfono del cliente para buscar."
            maxWidth="xl"
            fullScreenBreakpoint={SALES_POS_BREAKPOINT}
            headerActions={
              <Button
                variant="outlined"
                size="small"
                startIcon={<Plus size={16} />}
                sx={{ whiteSpace: "nowrap", px: 2 }}
                onClick={() => {
                  setClientModalOpen(false);
                  setCreateClientModalOpen(true);
                }}
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
                {
                  id: "fullName",
                  label: "Nombre",
                  type: "text",
                  size: "lg",
                  truncate: true,
                },
                {
                  id: "phoneNumber",
                  label: "Teléfono",
                  type: "text",
                  size: "md",
                },
                {
                  id: "creditStatus",
                  label: "Crédito",
                  type: "text",
                  size: "sm",
                  format: (value) => {
                    const status = value as Client["creditStatus"];
                    const label =
                      status === "MOROSO"
                        ? "Moroso"
                        : status === "ACTIVE"
                          ? "Con crédito"
                          : "Sin crédito";
                    const color =
                      status === "MOROSO"
                        ? theme.palette.error.main
                        : status === "ACTIVE"
                          ? theme.palette.success.main
                          : theme.palette.text.secondary;
                    return (
                      <Box
                        component="span"
                        sx={{ color, fontWeight: 600, fontSize: "0.8rem" }}
                      >
                        {label}
                      </Box>
                    );
                  },
                },
                {
                  id: "email",
                  label: "Correo",
                  type: "text",
                  size: "lg",
                  truncate: true,
                  format: (value) => (
                    <span>{(value as string | null) || "—"}</span>
                  ),
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
                if (row.creditStatus === "MOROSO") {
                  setPaymentType("CASH");
                }
              }}
            />
          </SideModal>

          <CreateCashClientModal
            open={createClientModalOpen}
            onClose={() => setCreateClientModalOpen(false)}
            requirePhoneVerification={paymentType !== "CASH"}
            onSuccess={(client) => {
              setSelectedClient(client);
              setClientSearch(client.fullName);
              showSuccess(`Cliente ${client.fullName} creado exitosamente`);

              // Si el cliente fue creado con datos de facturación, prellenarlos
              if (client.rfc && client.businessName) {
                setWantsInvoice(true);
                setUseClientBillingData(false);
                billing.setValues((prev) => ({
                  ...prev,
                  requiresInvoice: true,
                  rfc: client.rfc ?? "",
                  businessName: client.businessName ?? "",
                  taxRegimeId:
                    client.taxRegimeId != null
                      ? String(client.taxRegimeId)
                      : "",
                  cfdiUseId:
                    client.cfdiUseId != null ? String(client.cfdiUseId) : "",
                  fiscalPostalCode: client.billingPostalCode ?? "",
                  fiscalStreet: client.billingStreet ?? "",
                  sendInvoiceByEmail: client.sendInvoiceByEmail ?? false,
                  invoiceEmail: client.invoiceEmail ?? "",
                  invoiceWhatsappNumber: client.invoiceWhatsappNumber ?? "",
                }));
                setBillingConfirmed(true);
              }
            }}
          />

          <CreditApplicationIntakeModal
            open={creditIntakeModalOpen}
            onClose={() => setCreditIntakeModalOpen(false)}
            onFinalize={handleCreditIntakeFinalize}
          />

          <ProductCodeScannerDialog
            open={productScannerOpen}
            onClose={() => setProductScannerOpen(false)}
            onCodeScanned={handleProductCodeScanned}
          />

          {resumeSaleId !== null && (
            <DiscountRequestModal
              open={discountRequestModalOpen}
              onClose={() => setDiscountRequestModalOpen(false)}
              saleId={resumeSaleId}
              existingRequest={
                resumeSaleData?.discountRequest?.status === "INVALIDATED"
                  ? null
                  : (resumeSaleData?.discountRequest ?? null)
              }
              onSuccess={() => {
                showSuccess("Solicitud de descuento enviada.");
                void queryClient.invalidateQueries({
                  queryKey: ["resume-sale-draft", resumeSaleId],
                });
              }}
            />
          )}
        </StickySidebar>
      </MainGrid>
      {discountInvalidateModal}
    </PageShell>
  );
}
