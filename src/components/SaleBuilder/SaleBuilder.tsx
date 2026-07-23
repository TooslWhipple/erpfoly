import { useState, useCallback, useMemo } from "react";
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
} from "@mui/material";
import {
  Trash2,
  ScanLine,
  Pencil,
  Fingerprint,
  DollarSign,
  CreditCard,
  PlusCircle,
  AlertTriangle,
} from "lucide-react";
import {
  X,
  Search,
  ArrowLeft,
  Plus,
  Store,
  Warehouse,
  Truck,
  Package,
  Calendar,
} from "@/components/Icons";
import NumberSpinner from "@/components/NumberSpinner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProductDetail,
  searchProducts,
  getPurchaseTypes,
  getLayawayTerms,
  createSaleDraft,
  updateSaleClient,
  updateSaleLayawayTerm,
  addSaleItem,
  updateSaleItem,
  removeSaleItem,
  registerSalePayment,
  confirmSalePayment,
  confirmCreditSale,
  createLayaway,
  setDeliveryDate,
  getSaleDetail,
  invalidateSaleDiscount,
} from "@/services/ventas.service";
import { getPaymentTerminalsCatalog } from "@/services/payment-terminals.service";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { getClients } from "@/services/clients.service";
import type {
  CartItem,
  NewSaleView,
  ProductSearchResult,
} from "@/types/ventas.types";
import type { Client } from "@/services/clients.service";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { SideModal } from "@/components/SideModal/SideModal";
import { TableCrud } from "@/components/TableCrud";
import { CreateCashClientModal } from "@/components/CreateCashClientModal";
import { CreditApplicationIntakeModal } from "@/components/CreditApplicationIntakeModal";
import { createCreditApplicationFromIntake } from "@/services/creditApplications.service";
import type { CreditApplicationBiometricsData } from "@/types/credit-application-form.types";
import { googleMapsBrowserApiKey } from "@/config/maps";
import { getBranchesCatalog } from "@/services/branches.service";
import { DeliveryAddressModal } from "@/components/DeliveryAddressModal";
import { DeliveryDatePicker } from "@/components/DeliveryDatePicker";
import { ConfirmModal } from "@/components/ConfirmModal";
import { BillingFieldsForm } from "@/components/BillingFieldsForm";
import { useBillingFieldsForm } from "@/hooks/useBillingFieldsForm";
import { formatStreetAddressLine } from "@/utils/address";
import { StaticLocationMap } from "@/components/StaticLocationMap";
import dayjs from "@/lib/dayjs";
import { DiscountRequestModal } from "@/components/DiscountRequestModal";
import { DiscountRequestStatusBanner } from "@/components/DiscountRequestStatusBanner";
import {
  getDiscountRequestReasonLabel,
  getDiscountRequestStatusLabel,
} from "@/utils/discountRequest";

const SEARCH_DEBOUNCE_MS = 350;

const GOOGLE_MAPS_API_KEY = googleMapsBrowserApiKey;

// TODO: Obtener branch real de la sesion de caja activa
const CURRENT_BRANCH_ID = 2;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(value);
}

function formatNumberInput(raw: string): string {
  if (!raw) return "";
  const parts = raw.split(".");
  const intPart = Number(parts[0] || "0").toLocaleString("es-MX");
  if (parts.length > 1) {
    return `${intPart}.${parts[1]}`;
  }
  return intPart;
}

export interface SaleBuilderProps {
  resumeSaleId: number | null;
  onExit: () => void;
}

export function SaleBuilder({ resumeSaleId, onExit }: SaleBuilderProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [discountRequestModalOpen, setDiscountRequestModalOpen] =
    useState(false);

  const [activeSaleId, setActiveSaleId] = useState<number | null>(null);
  const [activeSaleFolio, setActiveSaleFolio] = useState<string | null>(null);
  const [originalItemIds, setOriginalItemIds] = useState<Set<number>>(
    new Set(),
  );
  // Snapshot productId -> quantity al retomar la venta, usado para detectar
  // si quitar/reducir un artículo debe invalidar un descuento especial ya
  // aprobado (agregar artículos nuevos no invalida).
  const [originalQuantities, setOriginalQuantities] = useState<
    Map<number, number>
  >(new Map());
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
  const [customDeliveryAddress, setCustomDeliveryAddress] = useState<{
    id: number;
    formatted: string;
  } | null>(null);
  const [deliveryAddressModalOpen, setDeliveryAddressModalOpen] =
    useState(false);
  const [checkoutDeliveryDate, setCheckoutDeliveryDate] = useState<
    string | null
  >(null);
  const [checkoutDeliveryDateModalOpen, setCheckoutDeliveryDateModalOpen] =
    useState(false);
  const [deliveryDateWarningOpen, setDeliveryDateWarningOpen] =
    useState(false);
  const [wantsInvoice, setWantsInvoice] = useState(false);
  const [cashAmount, setCashAmount] = useState("");
  const [cardAmount, setCardAmount] = useState("");
  const [selectedTerminal, setSelectedTerminal] = useState<number | null>(null);
  const [fingerprintModalOpen, setFingerprintModalOpen] = useState(false);
  const [fingerprintConfirmed, setFingerprintConfirmed] = useState(false);
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
    if (!primary?.latitude || !primary?.longitude) return null;
    const lat = Number(primary.latitude);
    const lng = Number(primary.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
  }, [selectedClient]);

  const todayIsoDate = useMemo(() => dayjs().format("YYYY-MM-DD"), []);

  const [productSearch, setProductSearch] = useState("");
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

  const PT_MAP: Record<string, string[]> = {
    CASH: ["CONTADO", "CASH", "EFECTIVO"],
    CREDIT: ["CREDITO", "CREDIT", "CRÉDITO"],
    LAYAWAY: ["APARTADO", "LAYAWAY", "APART"],
  };

  const { data: resumeSaleData } = useQuery({
    queryKey: ["resume-sale-draft", resumeSaleId],
    enabled: resumeSaleId !== null && !Number.isNaN(resumeSaleId),
    queryFn: async () => {
      const res = await getSaleDetail(resumeSaleId!);
      if (res.error) throw new Error(res.error.message);
      return res.data!;
    },
  });

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
    setOriginalQuantities(
      new Map(resumeSaleData.items.map((item) => [item.product.id, item.quantity])),
    );

    setCart(
      resumeSaleData.items.map((item) => ({
        productId: item.product.id,
        sku: item.product.code,
        productName: item.product.name,
        brandName: null,
        imageUrl: item.product.imageUrl,
        originalPrice: item.unitPrice,
        discountAmount: item.discountAmount,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        sources: [],
        saleItemId: item.id,
        backorderedQuantity: item.backorderedQuantity,
      })),
    );

    if (resumeSaleData.purchaseType) {
      const upper = resumeSaleData.purchaseType.toUpperCase();
      const matched = Object.entries(PT_MAP).find(([, keywords]) =>
        keywords.some((k) => upper.includes(k)),
      );
      if (matched) setPaymentType(matched[0] as "CREDIT" | "CASH" | "LAYAWAY");
    }

    if (resumeSaleData.layawayTermId != null) {
      setSelectedLayawayTermId(resumeSaleData.layawayTermId);
    }

    if (resumeSaleData.deliveryType === "ADDRESS") {
      setDeliveryType("delivery");
    } else if (resumeSaleData.deliveryType === "BRANCH") {
      setDeliveryType("pickup");
      if (resumeSaleData.deliveryBranchId != null) {
        setDeliveryBranch({
          id: resumeSaleData.deliveryBranchId,
          label: resumeSaleData.deliveryBranchName ?? "",
        });
        setDeliveryBranchOverridden(true);
      }
    }
  }

  if (
    resumeClientData &&
    hydratedSaleId !== null &&
    hydratedClientForSaleId !== hydratedSaleId
  ) {
    setHydratedClientForSaleId(hydratedSaleId);
    setSelectedClient(resumeClientData);
  }

  const syncDeliverySelection = async (saleId: number) => {
    if (deliveryType === "delivery") {
      const clientPrimaryAddress =
        selectedClient?.addresses?.find((a) => a.isPrimary) ??
        selectedClient?.addresses?.[0];
      const addressId = useCustomDeliveryAddress
        ? customDeliveryAddress?.id
        : clientPrimaryAddress?.id;
      if (addressId) {
        await setDeliveryDate(saleId, {
          delivery_type: "ADDRESS",
          address_id: addressId,
        });
      }
    } else if (deliveryType === "pickup" && effectiveDeliveryBranch) {
      await setDeliveryDate(saleId, {
        delivery_type: "BRANCH",
        branch_id: effectiveDeliveryBranch.id,
      });
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
      const draftRes = await createSaleDraft({
        branch_id: lockedBranch?.id ?? CURRENT_BRANCH_ID,
        purchase_type_id: pt.id,
        client_id: selectedClient?.id,
        origin: "STORE",
      });
      if (draftRes.error) throw new Error(draftRes.error.message);
      saleId = draftRes.data!.id;
      folio = draftRes.data!.folio;

      for (const item of cart) {
        const itemRes = await addSaleItem(saleId, {
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          discount_amount:
            item.discountAmount > 0 ? item.discountAmount : undefined,
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

      if (selectedClient) {
        const clientRes = await updateSaleClient(saleId, selectedClient.id);
        if (clientRes.error) throw new Error(clientRes.error.message);
      }

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
        if (item.saleItemId) {
          const updateRes = await updateSaleItem(saleId, item.saleItemId, {
            quantity: item.quantity,
            unit_price: item.unitPrice,
            discount_amount:
              item.discountAmount > 0 ? item.discountAmount : undefined,
          });
          if (updateRes.error) throw new Error(updateRes.error.message);
        } else {
          const itemRes = await addSaleItem(saleId, {
            product_id: item.productId,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            discount_amount:
              item.discountAmount > 0 ? item.discountAmount : undefined,
          });
          if (itemRes.error) throw new Error(itemRes.error.message);
        }
      }

      setOriginalItemIds(currentIds);
    }

    if (paymentType === "LAYAWAY" && activeLayawayTerm) {
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

      const { id: saleId } = await ensureSaleSynced();

      if (deliveryType === "delivery") {
        const clientPrimaryAddress =
          selectedClient?.addresses?.find((a) => a.isPrimary) ??
          selectedClient?.addresses?.[0];
        const addressId = useCustomDeliveryAddress
          ? customDeliveryAddress?.id
          : clientPrimaryAddress?.id;
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

      if (paymentType === "CREDIT") {
        if (!selectedClient)
          throw new Error("Se requiere un cliente para venta a crédito");
        const creditRes = await confirmCreditSale(saleId, {
          term_months: selectedTermMonths,
          down_payment: enganche,
          payment_method: cashAmtNum > 0 ? "CASH" : "CARD",
          payment_terminal_id: selectedTerminal ?? undefined,
        });
        if (creditRes.error) throw new Error(creditRes.error.message);
        return creditRes.data!;
      }

      if (paymentType === "LAYAWAY") {
        if (!activeLayawayTerm)
          throw new Error("Selecciona un plazo de apartado");
        const depositAmount = cashAmtNum + cardAmtNum;
        const layawayRes = await createLayaway(saleId, {
          layaway_term_id: activeLayawayTerm.id,
          deposit_amount: depositAmount,
          payment_method: cashAmtNum > 0 ? "CASH" : "CARD",
          payment_terminal_id: selectedTerminal ?? undefined,
        });
        if (layawayRes.error) throw new Error(layawayRes.error.message);
        return {
          id: saleId,
          folio: activeSaleFolio ?? "",
          status: "ACTIVE",
        };
      }

      const paymentRes = await registerSalePayment(saleId, {
        payment_method: cashAmtNum > 0 ? "CASH" : "CARD",
        amount: totalFinal,
        received_amount: cashAmtNum > 0 ? cashAmtNum : undefined,
        change_amount: cashAmtNum > 0 ? change : undefined,
        payment_terminal_id: selectedTerminal ?? undefined,
      });
      if (paymentRes.error) throw new Error(paymentRes.error.message);

      const confirmRes = await confirmSalePayment(saleId);
      if (confirmRes.error) throw new Error(confirmRes.error.message);
      return confirmRes.data!;
    },
    onSuccess: (data) => {
      void router.push(`/ventas/${data.id}?nuevo=1`);
    },
    onError: (err: Error) => {
      snackbar.showError(err.message);
    },
  });

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

  const isCardPayment = Boolean(cardAmount) && parseFloat(cardAmount) > 0;
  const paymentTerminalBranchId = lockedBranch?.id ?? CURRENT_BRANCH_ID;
  const paymentTerminalsQuery = useQuery({
    queryKey: ["payment-terminals-catalog", paymentTerminalBranchId],
    queryFn: () => getPaymentTerminalsCatalog(paymentTerminalBranchId),
    enabled: isCardPayment,
    staleTime: 60_000,
  });

  const isBranchSourceLocked = (src: {
    sourceType: string;
    branchId?: number;
  }) =>
    src.sourceType === "branch" &&
    lockedBranch !== null &&
    src.branchId !== lockedBranch.id;

  // Sucursal de entrega/recolección: por default es la misma de donde sale
  // el stock (lockedBranch); el vendedor puede cambiarla con "Cambiar".
  const effectiveDeliveryBranch = deliveryBranchOverridden
    ? deliveryBranch
    : lockedBranch;

  const { data: branchesCatalog = [] } = useQuery({
    queryKey: ["branches-catalog-pickup"],
    queryFn: async () => {
      const branches = await getBranchesCatalog();
      return branches.filter((b) => !b.is_main_warehouse);
    },
    enabled: branchPickerOpen,
    staleTime: 5 * 60 * 1000,
  });

  const cartProductIds = useMemo(
    () => cart.map((i) => i.productId).join(","),
    [cart],
  );

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
    effectiveDeliveryBranch?.id === CURRENT_BRANCH_ID;
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

  const handleAddToCart = useCallback(() => {
    if (!productDetail) return;
    const totalQty = productSources.reduce((s, src) => s + src.quantity, 0);
    if (totalQty === 0) return;

    const branchSourcesWithQty = productSources.filter(
      (src) => src.sourceType === "branch" && src.quantity > 0,
    );
    const distinctBranchIds = new Set(
      branchSourcesWithQty.map((s) => s.branchId),
    );
    if (distinctBranchIds.size > 1) {
      snackbar.showError(
        "No puedes combinar existencia de distintas sucursales en el mismo artículo.",
      );
      return;
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
      return;
    }

    // Misma cuenta que hace el backend al confirmar (sale.branch_id +
    // ProductInventory.existence): lo que exceda la existencia de la
    // sucursal queda en backorder, sin bloquear el alta al carrito.
    const branchAvailable =
      productSources.find((src) => src.sourceType === "branch")?.available ??
      0;
    const backorderedQuantity = Math.max(0, totalQty - branchAvailable);

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
  }, [productDetail, productSources, lockedBranch, snackbar]);

  // Invalidación optimista: el cambio de carrito ya se aplicó localmente
  // cuando se llama esta función. Si el endpoint falla, se revierte al
  // `previousCart` y se avisa por snackbar.
  const triggerDiscountInvalidation = useCallback(
    (previousCart: CartItem[]) => {
      const request = resumeSaleData?.discountRequest;
      if (!request || request.status !== "APPROVED") return;

      void invalidateSaleDiscount(request.id).then((res) => {
        if (res.error) {
          setCart(previousCart);
          snackbar.showError(
            `No se pudo invalidar el descuento especial: ${res.error.message}`,
          );
          return;
        }
        void queryClient.invalidateQueries({
          queryKey: ["resume-sale-draft", resumeSaleId],
        });
      });
    },
    [resumeSaleData?.discountRequest, resumeSaleId, queryClient, snackbar],
  );

  const handleCartQtyChange = (productId: number, delta: number) => {
    const previousCart = cart;

    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId !== productId) return item;
          const quantity = Math.max(0, item.quantity + delta);
          // Sin `sources` (línea hidratada de una venta retomada) no hay
          // existencia de sucursal a mano para recalcular — se conserva el
          // último valor que confirmó el backend hasta el próximo sync.
          if (item.sources.length === 0) return { ...item, quantity };
          const branchAvailable =
            item.sources.find((src) => src.sourceType === "branch")
              ?.available ?? 0;
          return {
            ...item,
            quantity,
            backorderedQuantity: Math.max(0, quantity - branchAvailable),
          };
        })
        .filter((item) => item.quantity > 0),
    );

    if (delta < 0) {
      const originalQty = originalQuantities.get(productId);
      const previousQty =
        previousCart.find((item) => item.productId === productId)?.quantity ??
        0;
      const newQty = Math.max(0, previousQty + delta);
      if (originalQty != null && newQty < originalQty) {
        triggerDiscountInvalidation(previousCart);
      }
    }
  };

  const handleRemoveFromCart = (productId: number) => {
    const previousCart = cart;
    setCart((prev) => prev.filter((item) => item.productId !== productId));

    if (originalQuantities.has(productId)) {
      triggerDiscountInvalidation(previousCart);
    }
  };

  const handleQtyChange = (sourceKey: string, delta: number) => {
    setQuantityMap((prev) => ({
      ...prev,
      [sourceKey]: Math.max(0, (prev[sourceKey] ?? 0) + delta),
    }));
  };

  const totalCartQty = cart.reduce((s, item) => s + item.quantity, 0);
  const isClientMoroso =
    paymentType === "CREDIT" && selectedClient?.creditStatus === "MOROSO";
  const isClientWithoutActiveCredit =
    paymentType === "CREDIT" && selectedClient?.creditStatus !== "ACTIVE";

  const isDeliveryAddressReady =
    deliveryType === "delivery" &&
    (useCustomDeliveryAddress
      ? !!customDeliveryAddress
      : !!selectedClient?.primaryAddressFormatted);

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

  const subtotal = cart.reduce(
    (s, item) => s + item.unitPrice * item.quantity,
    0,
  );
  const subtotalOriginal = cart.reduce(
    (s, item) => s + item.originalPrice * item.quantity,
    0,
  );
  const totalDiscounts = cart.reduce(
    (s, item) => s + item.discountAmount * item.quantity,
    0,
  );
  const approvedDiscountRequest =
    resumeSaleData?.discountRequest?.status === "APPROVED"
      ? resumeSaleData.discountRequest
      : null;
  const specialDiscountAmount = approvedDiscountRequest
    ? (approvedDiscountRequest.approvedDiscountAmount ??
      (subtotalOriginal - totalDiscounts) *
        ((approvedDiscountRequest.approvedDiscountPct ?? 0) / 100))
    : 0;
  const totalFinal = subtotalOriginal - totalDiscounts - specialDiscountAmount;
  const cashAmtNum = parseFloat(cashAmount.replace(/[^0-9.]/g, "")) || 0;
  const cardAmtNum = parseFloat(cardAmount.replace(/[^0-9.]/g, "")) || 0;
  const totalPaid = Math.round(cashAmtNum + cardAmtNum);
  const ENGANCHE_PCT = 0.1;
  const enganche = Math.round(totalFinal * ENGANCHE_PCT);
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
            placeholder="Búsqueda de artículos..."
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
            sx={{ whiteSpace: "nowrap", px: 3 }}
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
                id: "averageCost",
                label: "Costo Prom.",
                type: "currency",
                size: "md",
              },
              {
                id: "lastCost",
                label: "Últ. Costo",
                type: "currency",
                size: "md",
              },
              {
                id: "costWithoutDiscount",
                label: "Costo sin Descuentos",
                type: "currency",
                size: "md",
              },
              {
                id: "discountPct",
                label: "% Desc.1",
                type: "percentage",
                size: "sm",
              },
              {
                id: "supplier1Name",
                label: "Proveedor 1",
                type: "text",
                size: "md",
              },
              {
                id: "supplier2Name",
                label: "Proveedor 2",
                type: "text",
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

              {lockedBranch && lockedBranch.id !== CURRENT_BRANCH_ID && (
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

              {/* Orígenes principales: sucursal actual + bodega + por surtir */}
              <Stack spacing={1.5}>
                {productSources
                  .filter(
                    (src) =>
                      src.sourceType === "warehouse" ||
                      src.sourceType === "incoming" ||
                      src.branchId === CURRENT_BRANCH_ID,
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

                    const SourceIcon = isCurrentBranch
                      ? Store
                      : isWarehouse
                        ? Warehouse
                        : Package;

                    const branchLocked = isBranchSourceLocked(src);

                    return (
                      <Box
                        key={src.sourceKey}
                        sx={{
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: 2,
                          px: 2,
                          py: 1.75,
                          opacity: branchLocked ? 0.6 : 1,
                        }}
                      >
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1.5}
                          >
                            <Box
                              sx={{ color: "text.secondary", display: "flex" }}
                            >
                              <SourceIcon size={16} />
                            </Box>
                            <Typography variant="body2">
                              {sourceLabel}
                            </Typography>
                          </Stack>

                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={2.5}
                          >
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={2}
                            >
                              {isWarehouse && (
                                <>
                                  <Stack
                                    direction="row"
                                    alignItems="center"
                                    spacing={0.75}
                                  >
                                    <Box
                                      sx={{
                                        color: "text.disabled",
                                        display: "flex",
                                      }}
                                    >
                                      <Truck size={13} />
                                    </Box>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      En tránsito: {src.inTransit ?? 0}
                                    </Typography>
                                  </Stack>
                                  <Stack
                                    direction="row"
                                    alignItems="center"
                                    spacing={0.75}
                                  >
                                    <Box
                                      sx={{
                                        color: "text.disabled",
                                        display: "flex",
                                      }}
                                    >
                                      <Package size={13} />
                                    </Box>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      Existencia: {src.available}
                                    </Typography>
                                  </Stack>
                                </>
                              )}
                              {isIncoming && (
                                <Stack
                                  direction="row"
                                  alignItems="center"
                                  spacing={0.75}
                                >
                                  <Box
                                    sx={{
                                      color: "text.disabled",
                                      display: "flex",
                                    }}
                                  >
                                    <Package size={13} />
                                  </Box>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    Por surtir: {src.available}
                                  </Typography>
                                </Stack>
                              )}
                              {isCurrentBranch && (
                                <Stack
                                  direction="row"
                                  alignItems="center"
                                  spacing={0.75}
                                >
                                  <Box
                                    sx={{
                                      color: "text.disabled",
                                      display: "flex",
                                    }}
                                  >
                                    <Package size={13} />
                                  </Box>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    Existencia: {src.available}
                                  </Typography>
                                </Stack>
                              )}
                            </Stack>

                            <NumberSpinner
                              value={src.quantity}
                              onChange={(val: number) =>
                                handleQtyChange(
                                  src.sourceKey,
                                  val - src.quantity,
                                )
                              }
                              min={0}
                              // Sin `max`: se permite pedir más de lo
                              // disponible — el excedente queda en
                              // backorder (ver sale.service.ts addItem).
                              disabled={branchLocked}
                              size="small"
                              iconSize={13}
                            />
                          </Stack>
                        </Stack>
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
                          src.branchId !== CURRENT_BRANCH_ID,
                      )
                      .map((src) => {
                        const branchLocked = isBranchSourceLocked(src);
                        return (
                          <Box
                            key={src.sourceKey}
                            sx={{
                              border: "1px solid",
                              borderColor: "divider",
                              borderRadius: 2,
                              px: 2,
                              py: 1.75,
                              opacity: branchLocked ? 0.6 : 1,
                            }}
                          >
                            <Stack
                              direction="row"
                              alignItems="center"
                              justifyContent="space-between"
                            >
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={1.5}
                              >
                                <Box
                                  sx={{
                                    color: "text.secondary",
                                    display: "flex",
                                  }}
                                >
                                  <Store size={16} />
                                </Box>
                                <Typography variant="body2">
                                  {src.label}
                                </Typography>
                              </Stack>

                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={2.5}
                              >
                                <Stack
                                  direction="row"
                                  alignItems="center"
                                  spacing={0.75}
                                >
                                  <Box
                                    sx={{
                                      color: "text.disabled",
                                      display: "flex",
                                    }}
                                  >
                                    <Package size={13} />
                                  </Box>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    Existencia: {src.available}
                                  </Typography>
                                </Stack>

                                <NumberSpinner
                                  value={src.quantity}
                                  onChange={(val: number) =>
                                    handleQtyChange(
                                      src.sourceKey,
                                      val - src.quantity,
                                    )
                                  }
                                  min={0}
                                  // Sin `max`: se permite pedir más de lo
                                  // disponible — el excedente queda en
                                  // backorder (ver sale.service.ts addItem).
                                  disabled={branchLocked}
                                  size="small"
                                  iconSize={13}
                                />
                              </Stack>
                            </Stack>
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
                          </Box>
                        );
                      })}
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
    const canRegister = !cobrarMutation.isPending && totalPaid >= amountToPay;

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
                            {formatCurrency(item.unitPrice * item.quantity)}
                          </Typography>
                        </Box>
                      </Stack>
                    </Stack>
                    {item.backorderedQuantity > 0 && (
                      <Chip
                        icon={<AlertTriangle size={12} />}
                        label={`${item.backorderedQuantity} de ${item.quantity} en backorder`}
                        size="small"
                        color="warning"
                        variant="outlined"
                        sx={{ mt: 1, height: 22, fontSize: "0.6875rem" }}
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
                          (totalFinal - enganche) / selectedTermMonths,
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

            <Box
              sx={{
                bgcolor: "rgba(25, 118, 210, 0.06)",
                borderRadius: 2,
                p: 2.5,
              }}
            >
              <Typography variant="body2" fontWeight={600} mb={3}>
                Ingresa el cobro realizado a el cliente:
              </Typography>

              <Stack spacing={1.5} mb={3}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    pb: 1.5,
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        bgcolor: "rgba(0,0,0,0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <DollarSign size={16} color="#666" />
                    </Box>
                    <Typography variant="body1" fontWeight={400}>
                      Efectivo
                    </Typography>
                  </Stack>
                  <OutlinedInput
                    value={cashAmount ? formatNumberInput(cashAmount) : ""}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9.]/g, "");
                      const parts = val.split(".");
                      const sanitized =
                        parts.length > 2
                          ? parts[0] + "." + parts.slice(1).join("")
                          : val;
                      setCashAmount(sanitized);
                    }}
                    placeholder="0.00"
                    startAdornment={
                      <InputAdornment position="start">
                        <Typography
                          variant="h6"
                          color="text.primary"
                          sx={{ fontWeight: 400 }}
                        >
                          $
                        </Typography>
                      </InputAdornment>
                    }
                    sx={{
                      width: 180,
                      bgcolor: "transparent",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(0,0,0,0.15)",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(0,0,0,0.25)",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(0,0,0,0.3)",
                      },
                      "& input": {
                        textAlign: "right",
                        fontSize: "1.15rem",
                        fontWeight: 400,
                        py: 1.25,
                      },
                    }}
                  />
                </Stack>

                <Stack
                  spacing={1.5}
                  sx={{
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    pb: 1.5,
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          bgcolor: "rgba(0,0,0,0.08)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <CreditCard size={16} color="#666" />
                      </Box>
                      <Typography variant="body1" fontWeight={400}>
                        Tarjeta
                      </Typography>
                    </Stack>
                    <OutlinedInput
                      value={cardAmount ? formatNumberInput(cardAmount) : ""}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9.]/g, "");
                        const parts = val.split(".");
                        const sanitized =
                          parts.length > 2
                            ? parts[0] + "." + parts.slice(1).join("")
                            : val;
                        setCardAmount(sanitized);
                      }}
                      placeholder="0.0"
                      startAdornment={
                        <InputAdornment position="start">
                          <Typography
                            variant="h6"
                            color="text.primary"
                            sx={{ fontWeight: 400 }}
                          >
                            $
                          </Typography>
                        </InputAdornment>
                      }
                      sx={{
                        width: 180,
                        bgcolor: "transparent",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "rgba(0,0,0,0.15)",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "rgba(0,0,0,0.25)",
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "rgba(0,0,0,0.3)",
                        },
                        "& input": {
                          textAlign: "right",
                          fontSize: "1.15rem",
                          fontWeight: 400,
                          py: 1.25,
                        },
                      }}
                    />
                  </Stack>
                  {isCardPayment && (
                    <Box sx={{ pl: 5.5 }}>
                      <Select
                        value={selectedTerminal ?? ""}
                        onChange={(e) =>
                          setSelectedTerminal(Number(e.target.value) || null)
                        }
                        displayEmpty
                        fullWidth
                        disabled={paymentTerminalsQuery.isLoading}
                        sx={{
                          fontSize: "0.875rem",
                          bgcolor: "rgba(0,0,0,0.02)",
                          borderRadius: 1.5,
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "rgba(0,0,0,0.08)",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "rgba(0,0,0,0.15)",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "primary.main",
                            borderWidth: 1,
                          },
                          "& .MuiSelect-select": {
                            py: 1.25,
                            px: 1.5,
                          },
                        }}
                      >
                        <MenuItem value="" disabled>
                          {paymentTerminalsQuery.isLoading
                            ? "Cargando terminales..."
                            : "Selecciona una terminal"}
                        </MenuItem>
                        {(paymentTerminalsQuery.data ?? []).map((terminal) => (
                          <MenuItem key={terminal.id} value={terminal.id}>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                              width="100%"
                            >
                              <Typography
                                sx={{ fontSize: "0.9375rem", fontWeight: 500 }}
                              >
                                {terminal.name}
                              </Typography>
                              <Chip
                                label={terminal.bank}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: "0.6875rem",
                                  fontWeight: 600,
                                  "& .MuiChip-label": { px: 1 },
                                }}
                              />
                            </Stack>
                          </MenuItem>
                        ))}
                        {paymentTerminalsQuery.data?.length === 0 && (
                          <MenuItem value="" disabled>
                            Esta sucursal no tiene terminales activas
                          </MenuItem>
                        )}
                      </Select>
                    </Box>
                  )}
                </Stack>
              </Stack>

              <Button
                variant="text"
                size="small"
                startIcon={<PlusCircle size={16} />}
                sx={{
                  textTransform: "none",
                  color: "primary.main",
                  mb: 3,
                  px: 0,
                }}
              >
                Agregar otra tarjeta
              </Button>

              {paymentType !== "LAYAWAY" && (
                <Box
                  sx={{
                    bgcolor: "rgba(0,0,0,0.06)",
                    borderRadius: 1.5,
                    px: 2,
                    py: 1.5,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Cambio:
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {formatCurrency(change)}
                  </Typography>
                </Box>
              )}

              <Button
                fullWidth
                variant="contained"
                size="large"
                disabled={!canRegister}
                onClick={() => {
                  if (showCheckoutDeliveryDateField && !checkoutDeliveryDate) {
                    setDeliveryDateWarningOpen(true);
                  } else {
                    cobrarMutation.mutate();
                  }
                }}
                sx={{ borderRadius: 1.5, textTransform: "none", py: 1.5 }}
              >
                {cobrarMutation.isPending
                  ? "Registrando..."
                  : `Registrar cobro  ${formatCurrency(amountToPay)}`}
              </Button>
            </Box>
          </Stack>
        </Box>

        <ConfirmModal
          open={deliveryDateWarningOpen}
          onClose={() => setDeliveryDateWarningOpen(false)}
          onConfirm={() => {
            setDeliveryDateWarningOpen(false);
            cobrarMutation.mutate();
          }}
          type="warning"
          title="¿Continuar sin asignar fecha de entrega?"
          description="No has asignado una fecha de entrega. Podrás asignarla después desde el detalle de la venta, pero se recomienda confirmarla con el cliente antes de cobrar."
          confirmLabel="Continuar sin fecha"
          cancelLabel="Asignar fecha"
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
          <IconButton size="small" onClick={onExit}>
            <X size={18} />
          </IconButton>
          <Typography variant="h6" fontWeight={700}>
            {resumeSaleId !== null && activeSaleFolio
              ? `Cotización ${activeSaleFolio}`
              : "Nueva venta"}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            sx={{ borderRadius: 2, textTransform: "none" }}
            disabled={cart.length === 0 || guardarCotizacionMutation.isPending}
            onClick={() => guardarCotizacionMutation.mutate()}
          >
            {guardarCotizacionMutation.isPending ? (
              <CircularProgress size={16} />
            ) : resumeSaleId !== null ? (
              "Actualizar cotización"
            ) : (
              "Guardar cotización"
            )}
          </Button>
          {resumeSaleId !== null && (
            <Button
              variant="outlined"
              sx={{ borderRadius: 2, textTransform: "none" }}
              disabled={
                resumeSaleData?.discountRequest != null &&
                resumeSaleData.discountRequest.status !== "INVALIDATED"
              }
              onClick={() => setDiscountRequestModalOpen(true)}
            >
              Solicitar descuento
            </Button>
          )}
          <Button
            variant="contained"
            disabled={!canProceed}
            sx={{ borderRadius: 2, textTransform: "none" }}
            onClick={() => {
              if (paymentType === "CREDIT") {
                setFingerprintConfirmed(false);
                setFingerprintModalOpen(true);
              } else {
                setView("checkout");
              }
            }}
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
        <Stack spacing={2}>
          {resumeSaleData?.discountRequest != null && (
            <DiscountRequestStatusBanner
              motivo={getDiscountRequestReasonLabel(
                resumeSaleData.discountRequest.reason,
                resumeSaleData.discountRequest.notes,
              )}
              estado={getDiscountRequestStatusLabel(
                resumeSaleData.discountRequest.status,
              )}
              warning={
                resumeSaleData.discountRequest.status === "APPROVED"
                  ? "Quitar un artículo o reducir su cantidad invalidará este descuento."
                  : undefined
              }
            />
          )}
          <Paper variant="outlined" sx={{ borderRadius: 2, p: 2.5 }}>
            <Stack
              direction="row"
              alignItems="flex-start"
              justifyContent="space-between"
              mb={2}
            >
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
                      <Stack
                        direction="row"
                        alignItems="flex-start"
                        spacing={1.5}
                      >
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
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {item.brandName}
                            </Typography>
                          )}
                          {(() => {
                            const branchSrc = item.sources.find(
                              (s) =>
                                s.sourceType === "branch" && s.quantity > 0,
                            );
                            if (
                              !branchSrc ||
                              branchSrc.branchId === CURRENT_BRANCH_ID
                            )
                              return null;
                            return (
                              <Chip
                                label={branchSrc.label}
                                size="small"
                                variant="outlined"
                                sx={{
                                  mt: 0.5,
                                  height: 20,
                                  fontSize: "0.6875rem",
                                }}
                              />
                            );
                          })()}
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
                        <Stack
                          direction="row"
                          alignItems="flex-end"
                          spacing={3}
                          mt={1.5}
                        >
                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                              mb={0.5}
                            >
                              Cantidad
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {item.quantity}
                            </Typography>
                          </Box>
                          <Box ml="auto">
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                              mb={0.5}
                            >
                              Total
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {formatCurrency(item.unitPrice * item.quantity)}
                            </Typography>
                          </Box>
                        </Stack>
                      ) : (
                        <Stack
                          direction="row"
                          alignItems="flex-end"
                          spacing={3}
                          mt={1.5}
                        >
                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                              mb={0.5}
                            >
                              Cantidad
                            </Typography>
                            <NumberSpinner
                              value={item.quantity}
                              onChange={(val: number) =>
                                handleCartQtyChange(
                                  item.productId,
                                  val - item.quantity,
                                )
                              }
                              min={1}
                              size="small"
                              iconSize={13}
                            />
                          </Box>
                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                              mb={0.5}
                            >
                              Precio original
                            </Typography>
                            <Typography variant="body2" fontWeight={500}>
                              {formatCurrency(item.originalPrice)}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                              mb={0.5}
                            >
                              Descuento
                            </Typography>
                            <Typography
                              variant="body2"
                              fontWeight={500}
                              color="error.main"
                            >
                              -{formatCurrency(item.discountAmount)}
                            </Typography>
                          </Box>
                          <Box ml="auto">
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                              mb={0.5}
                            >
                              Total
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {formatCurrency(item.unitPrice * item.quantity)}
                            </Typography>
                          </Box>
                        </Stack>
                      )}
                      {item.backorderedQuantity > 0 && (
                        <Chip
                          icon={<AlertTriangle size={12} />}
                          label={`${item.backorderedQuantity} de ${item.quantity} en backorder`}
                          size="small"
                          color="warning"
                          variant="outlined"
                          sx={{ mt: 1, height: 22, fontSize: "0.6875rem" }}
                        />
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
                      {formatCurrency(totalFinal)}
                    </Typography>
                  </Box>

                  {paymentType === "CREDIT" && (
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

                        <Stack direction="row" spacing={1}>
                          {layawayTerms.map((term) => (
                            <Button
                              key={term.id}
                              size="small"
                              variant={
                                selectedLayawayTermId === term.id
                                  ? "contained"
                                  : "outlined"
                              }
                              onClick={() => setSelectedLayawayTermId(term.id)}
                              sx={{
                                borderRadius: 2,
                                textTransform: "none",
                                px: 2,
                                py: 0.75,
                                minWidth: 80,
                                fontSize: "0.875rem",
                                fontWeight:
                                  selectedLayawayTermId === term.id ? 600 : 400,
                                ...(selectedLayawayTermId === term.id && {
                                  bgcolor: "primary.main",
                                  color: "white",
                                  "&:hover": {
                                    bgcolor: "primary.dark",
                                  },
                                }),
                              }}
                            >
                              {term.name}
                            </Button>
                          ))}
                        </Stack>
                      </Box>
                    </>
                  )}
                </Box>
              </>
            )}
          </Paper>
        </Stack>

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
                    ...(idx === PAYMENT_OPTIONS.length - 1 && {
                      borderRadius: "0 4px 4px 0",
                    }),
                  }}
                >
                  {opt.label}
                </Button>
              ))}
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ borderRadius: 2, p: 2.5 }}>
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
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      p: 0,
                      minWidth: 0,
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

                {paymentType === "CREDIT" && isClientMoroso && (
                  <Box
                    sx={{
                      bgcolor: "rgba(211, 47, 47, 0.08)",
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
                      Este cliente no puede realizar una compra a crédito por
                      estar en mora.
                    </Typography>
                  </Box>
                )}

                {paymentType === "CREDIT" &&
                  selectedClient.creditStatus !== "ACTIVE" && (
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      startIcon={<CreditCard size={16} />}
                      sx={{
                        textTransform: "none",
                        justifyContent: "flex-start",
                        mt: 1.5,
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
                    sx={{ textTransform: "none", justifyContent: "flex-start" }}
                    onClick={() => setCreateClientModalOpen(true)}
                  >
                    Registrar nuevo cliente
                  </Button>
                )}
              </>
            )}
          </Paper>

          {selectedClient && (
            <Paper variant="outlined" sx={{ borderRadius: 2, p: 2.5 }}>
              <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
                Entrega
              </Typography>

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
                      px: 1.5,
                      py: 0.75,
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
                      ? dayjs(checkoutDeliveryDate)
                          .format("dddd D [de] MMMM, YYYY")
                          .replace(/^\w/, (c) => c.toUpperCase())
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
                sx={{ mb: 1.5 }}
              >
                <MenuItem value="">
                  <em>Selecciona un tipo de entrega</em>
                </MenuItem>
                <MenuItem value="delivery">A domicilio</MenuItem>
                <MenuItem value="pickup">En tienda o bodega</MenuItem>
              </Select>

              {deliveryType === "delivery" && (
                <>
                  {primaryCoords && GOOGLE_MAPS_API_KEY ? (
                    <Box sx={{ mb: 1.5 }}>
                      <StaticLocationMap
                        coords={primaryCoords}
                        apiKey={GOOGLE_MAPS_API_KEY}
                        height={130}
                      />
                    </Box>
                  ) : (
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
                        {primaryCoords
                          ? "Configura NEXT_PUBLIC_GOOGLE_MAPS_API_KEY para ver el mapa"
                          : "Sin coordenadas registradas"}
                      </Typography>
                    </Box>
                  )}

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
                        textTransform: "none",
                        fontWeight: 600,
                        p: 0,
                        minWidth: 0,
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
                        textTransform: "none",
                        p: 0,
                        minWidth: 0,
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
                        textTransform: "none",
                        fontWeight: 600,
                        p: 0,
                        minWidth: 0,
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
                          effectiveDeliveryBranch.id === CURRENT_BRANCH_ID
                            ? " [Actual]"
                            : ""
                        }`
                      : cart.length > 0
                        ? "Selecciona una sucursal"
                        : "Agrega artículos al carrito primero"}
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
            </Paper>
          )}

          <DeliveryDatePicker
            open={checkoutDeliveryDateModalOpen}
            onClose={() => setCheckoutDeliveryDateModalOpen(false)}
            branchId={CURRENT_BRANCH_ID}
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
                        b.id === CURRENT_BRANCH_ID
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
            onSaved={(address) => {
              setCustomDeliveryAddress(address);
              setUseCustomDeliveryAddress(true);
              setDeliveryAddressModalOpen(false);
            }}
          />

          <Dialog
            open={fingerprintModalOpen}
            onClose={() => setFingerprintModalOpen(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}
          >
            <DialogContent sx={{ p: 4 }}>
              <Stack spacing={4} alignItems="center" textAlign="center">
                <Typography variant="h5" fontWeight={600}>
                  Validación de identidad
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Para continuar, captura la huella dactilar del cliente
                </Typography>
                <Box sx={{ py: 2 }}>
                  <Fingerprint
                    size={180}
                    color={fingerprintConfirmed ? "#22c55e" : "#94a3b8"}
                  />
                </Box>
                <Typography variant="body1">
                  {fingerprintConfirmed
                    ? "Dedo índice registrado"
                    : "Coloca el dedo índice del cliente en el lector."}
                </Typography>
                <Button
                  variant={fingerprintConfirmed ? "contained" : "outlined"}
                  sx={{ borderRadius: 2, textTransform: "none" }}
                  onClick={() => {
                    if (fingerprintConfirmed) {
                      setFingerprintModalOpen(false);
                      setCashAmount(enganche.toFixed(2));
                      setView("checkout");
                    } else {
                      setFingerprintConfirmed(true);
                    }
                  }}
                >
                  {fingerprintConfirmed ? "Continuar" : "Confirmar huella"}
                </Button>
              </Stack>
            </DialogContent>
          </Dialog>

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
                        ? "#dc2626"
                        : status === "ACTIVE"
                          ? "#16a34a"
                          : "#6b7280";
                    return (
                      <span
                        style={{ color, fontWeight: 600, fontSize: "0.8rem" }}
                      >
                        {label}
                      </span>
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
              }}
            />
          </SideModal>

          <CreateCashClientModal
            open={createClientModalOpen}
            onClose={() => setCreateClientModalOpen(false)}
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
        </Stack>
      </Box>
    </Box>
  );
}
