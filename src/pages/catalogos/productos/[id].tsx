import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  Stack,
} from "@mui/material";
import {
  Breadcrumbs,
  Title,
  VerticalSidebarTabs,
  TabFilters,
  ConfirmModal,
} from "@/components";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import type {
  GeneralDataFormState,
  PriceFormState,
  FormErrors,
  ProductSupplier,
  ProductBranch,
  ProductPackage,
  PackageFormData,
  ProductBasePrice,
  ProductGalleryImage,
  ProductPromotionDraft,
} from "@/types/productos.types";
import { MAX_PRODUCT_GALLERY_FILES } from "@/types/productos.types";
import { usePermissions } from "@/hooks/usePermissions";
import {
  CATALOG_PRODUCTS_CREATE,
  CATALOG_PRODUCTS_UPDATE,
} from "@/lib/permissions";
import {
  createProduct,
  buildCreateProductRequest,
  collectNewGalleryFiles,
  getProductById,
  getProductPreviewCode,
  getCurrentExchangeRate,
  updateProduct,
  productDetailDtoToFormSnapshot,
  type ProductDetailBranchDto,
} from "@/services/productos.service";
import { getApiErrorMessage } from "@/lib/axios";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { useProductFormCatalogs } from "@/hooks/useProductFormCatalogs";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import {
  branchCatalogToProductBranches,
  mergeBranchCatalogWithProductDetail,
  resolveDepartmentMarginFromCatalog,
  syncDefaultBasePriceDepartmentMargin,
} from "@/lib/productFormCatalogMappers";
import {
  CURRENCIES,
  COST_BASIS_FOR_PRICE_OPTIONS,
  DEFAULT_PRODUCT_BASE_PRICES,
} from "@/data/productos.mockData";
import { GeneralDataTab } from "@/components/Products/GeneralDataTab";
import { QuickDepartmentModal } from "@/components/Products/QuickDepartmentModal";
import { QuickProductLineModal } from "@/components/Products/QuickProductLineModal";
import { SuppliersTab } from "@/components/Products/SuppliersTab";
import { PriceTab } from "@/components/Products/PriceTab";
import { PackagesTab } from "@/components/Products/PackagesTab";
import { GalleryTab } from "@/components/Products/GalleryTab";
import { BranchesTab } from "@/components/Products/BranchesTab";

const PRODUCT_FORM_TAB_VALUES = [
  "general",
  "branches",
  "suppliers",
  "price",
  "gallery",
  "packages",
] as const;

type ProductFormTabValue = (typeof PRODUCT_FORM_TAB_VALUES)[number];

function isProductFormTabValue(value: string): value is ProductFormTabValue {
  return (PRODUCT_FORM_TAB_VALUES as readonly string[]).includes(value);
}

function resolveProductFormTab(value: unknown): ProductFormTabValue {
  if (typeof value === "string" && isProductFormTabValue(value)) {
    return value;
  }
  if (Array.isArray(value) && typeof value[0] === "string" && isProductFormTabValue(value[0])) {
    return value[0];
  }
  return "general";
}

const inFlightProductDetailRequests = new Map<
  number,
  ReturnType<typeof getProductById>
>();
async function getProductByIdDeduped(id: number) {
  const inFlight = inFlightProductDetailRequests.get(id);
  if (inFlight) {
    return inFlight;
  }
  const requestPromise = getProductById(id).finally(() => {
    inFlightProductDetailRequests.delete(id);
  });
  inFlightProductDetailRequests.set(id, requestPromise);
  return requestPromise;
}
function serializeProductFormDirtyState(input: {
  isNew: boolean;
  generalData: GeneralDataFormState;
  priceData: PriceFormState;
  suppliers: ProductSupplier[];
  branches: ProductBranch[];
  galleryImages: ProductGalleryImage[];
  packages: ProductPackage[];
  productPromotionDrafts: ProductPromotionDraft[];
  basePrices: ProductBasePrice[];
}): string {
  const payload = buildCreateProductRequest(
    {
      generalData: input.generalData,
      priceData: input.priceData,
      suppliers: input.suppliers,
      branches: input.branches,
      galleryImages: input.galleryImages,
      packages: input.packages,
      promotions: input.productPromotionDrafts,
    },
    input.isNew ? "create" : "update",
  );
  return JSON.stringify({
    payload,
    priceFields: {
      liquidation: input.priceData.liquidation,
      costBasisForCalculation: input.priceData.costBasisForCalculation,
      lastCost: input.priceData.lastCost,
      averageCost: input.priceData.averageCost,
    },
    basePrices: input.basePrices.map((bp) => ({
      name: bp.name,
      marginPercent: bp.marginPercent,
    })),
    newGalleryFileCount: input.galleryImages.filter((g) => g.file != null)
      .length,
  });
}
const MAX_WARRANTY_MONTHS = 600;

function getProductFormValidationErrors(
  generalData: GeneralDataFormState,
  priceData: PriceFormState,
  isNew: boolean,
  suppliers: ProductSupplier[],
  branches: ProductBranch[],
): FormErrors {
  const newErrors: FormErrors = {};
  if (!generalData.departmentId) {
    newErrors.departmentId = "El departamento es requerido";
  }
  if (!generalData.lineId) {
    newErrors.lineId = "La línea es requerida";
  } else if (!Number.isFinite(Number(generalData.lineId))) {
    newErrors.lineId = "La línea debe ser un identificador válido";
  }
  if (!Number.isFinite(Number(generalData.departmentId))) {
    newErrors.departmentId = "El departamento debe ser un identificador válido";
  }
  if (!generalData.description.trim()) {
    newErrors.description = "La descripción es requerida";
  }
  if (!generalData.shortName.trim()) {
    newErrors.shortName = "El nombre corto es requerido";
  }
  if (!generalData.satProductServiceKey?.trim()) {
    newErrors.satProductServiceKey = "La clave de producto/servicio SAT es requerida";
  }
  if (!generalData.satUnitOfMeasureKey?.trim()) {
    newErrors.satUnitOfMeasureKey = "La clave de unidad de medida SAT es requerida";
  }
  if (generalData.warrantyType === "months") {
    const warrantyMonths = Number(generalData.warrantyMonths);
    if (!generalData.warrantyMonths || warrantyMonths <= 0) {
      newErrors.warrantyMonths = "Los meses de garantía deben ser mayor a 0";
    } else if (warrantyMonths > MAX_WARRANTY_MONTHS) {
      newErrors.warrantyMonths = `Los meses de garantía no pueden ser mayor a ${MAX_WARRANTY_MONTHS}`;
    }
  }
  if (
    generalData.warrantyType === "policy" &&
    !generalData.warrantyPolicy.trim()
  ) {
    newErrors.warrantyPolicy = "Describe la garantía por póliza anexa";
  }
  const piecesNum = parseInt(generalData.piecesCount, 10);
  if (
    !generalData.piecesCount.trim() ||
    Number.isNaN(piecesNum) ||
    piecesNum < 1
  ) {
    newErrors.piecesCount = "El número de piezas debe ser al menos 1";
  } else if (piecesNum > 9999) {
    newErrors.piecesCount = "El número de piezas no puede ser mayor a 9999";
  }
  if (suppliers.length < 1) {
    newErrors.suppliers = "Debe asignar al menos un proveedor";
  }
  if (branches.some((branch) => branch.maxInventory < branch.minInventory)) {
    newErrors.branches =
      "El inventario máximo no puede ser menor al mínimo en ninguna sucursal";
  }
  if (isNew) {
    const listCost = Number(priceData.listCost);
    if (
      !priceData.listCost.trim() ||
      !Number.isFinite(listCost) ||
      listCost <= 0
    ) {
      newErrors.listCost = "El costo de lista debe ser mayor a 0";
    }
  }
  if (priceData.currency === "USD") {
    const exchangeRate = Number(priceData.exchangeRate);
    if (
      !priceData.exchangeRate.trim() ||
      !Number.isFinite(exchangeRate) ||
      exchangeRate <= 0
    ) {
      newErrors.exchangeRate = "El tipo de cambio debe ser mayor a 0";
    }
  }
  if (priceData.iva.trim()) {
    const iva = Number(priceData.iva);
    if (!Number.isFinite(iva) || iva < 0 || iva > 100) {
      newErrors.iva = "El IVA debe estar entre 0 y 100";
    }
  }
  return newErrors;
}

function markFirstGalleryImagePrimary(
  images: ProductGalleryImage[],
): ProductGalleryImage[] {
  return images.map((image, index) => ({
    ...image,
    isPrimary: index === 0,
  }));
}
export default function ProductFormPage() {
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const showSuccess = useSnackbarStore((s) => s.showSuccess);
  const showError = useSnackbarStore((s) => s.showError);

  /** Avoid running logic while `query.id` is still undefined (first paint / hard reload). */
  const routeIdParam =
    typeof router.query.id === "string" ? router.query.id : undefined;
  const isNew = routeIdParam === "nuevo";
  const canSaveProduct = hasPermission(
    isNew ? CATALOG_PRODUCTS_CREATE : CATALOG_PRODUCTS_UPDATE,
  );
  const isViewOnly = !isNew && !canSaveProduct;
  /** Numeric id segment for edit mode; only defined once the router is ready. */
  const editProductIdStr =
    router.isReady && routeIdParam != null && !isNew ? routeIdParam : null;
  const editProductId = useMemo(() => {
    const id = Number(editProductIdStr);
    return Number.isFinite(id) && id > 0 ? id : null;
  }, [editProductIdStr]);
  const [productLoading, setProductLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const tabFromQuery = resolveProductFormTab(router.query.tab);
  const [activeTab, setActiveTab] = useState<ProductFormTabValue>(tabFromQuery);

  const syncTabToUrl = useCallback(
    (tab: ProductFormTabValue) => {
      if (!router.isReady) return;
      const current = resolveProductFormTab(router.query.tab);
      if (current === tab) return;
      void router.replace(
        {
          pathname: router.pathname,
          query: { ...router.query, tab },
        },
        undefined,
        { shallow: true },
      );
    },
    [router],
  );

  const handleTabChange = useCallback(
    (value: string) => {
      const tab = resolveProductFormTab(value);
      setActiveTab(tab);
      syncTabToUrl(tab);
    },
    [syncTabToUrl],
  );

  useEffect(() => {
    if (!router.isReady) return;
    setActiveTab(tabFromQuery);
  }, [router.isReady, tabFromQuery]);
  const [generalData, setGeneralData] = useState<GeneralDataFormState>({
    departmentId: "",
    lineId: "",
    code: "",
    description: "",
    shortName: "",
    piecesCount: "1",
    satProductServiceKey: "",
    satUnitOfMeasureKey: "",
    warrantyType: "months",
    warrantyMonths: "12",
    warrantyPolicy: "",
  });
  const {
    catalogsLoading,
    linesLoading,
    departmentCatalogItems,
    departmentOptions,
    lineOptions,
    suppliersCatalog,
    branchCatalogItems,
    warrantyOptions,
    refreshDepartmentOptions,
    refreshLineOptions,
  } = useProductFormCatalogs(generalData.departmentId);
  const [departmentModalOpen, setDepartmentModalOpen] = useState(false);
  const [lineModalOpen, setLineModalOpen] = useState(false);
  const existingDepartmentIds = useMemo(
    () =>
      departmentOptions
        .map((o) => Number(o.value))
        .filter((id) => Number.isFinite(id)),
    [departmentOptions],
  );
  const selectedDepartmentNumericId = useMemo(() => {
    const n = Number(generalData.departmentId);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [generalData.departmentId]);
  useEffect(() => {
    if (selectedDepartmentNumericId == null) {
      setLineModalOpen(false);
    }
  }, [selectedDepartmentNumericId]);
  const pageLoading = !router.isReady || catalogsLoading || productLoading;
  const [suppliers, setSuppliers] = useState<ProductSupplier[]>([]);
  const [priceData, setPriceData] = useState<PriceFormState>({
    listCost: "0.00",
    currency: "MXN",
    exchangeRate: "1.00",
    iva: "16.00",
    liquidation: false,
    costBasisForCalculation: "last_cost",
    lastCost: "0.00",
    averageCost: "0.00",
    lastEditedBy: "",
    lastEditedDate: "",
  });
  const [basePrices, setBasePrices] = useState<ProductBasePrice[]>(() => [
    ...DEFAULT_PRODUCT_BASE_PRICES,
  ]);
  const [branches, setBranches] = useState<ProductBranch[]>([]);
  const [detailBranchRows, setDetailBranchRows] = useState<
    ProductDetailBranchDto[] | null
  >(null);
  const [galleryImages, setGalleryImages] = useState<ProductGalleryImage[]>([]);
  const [packages, setPackages] = useState<ProductPackage[]>([]);
  const packageBranchSelectableItems = useMemo(
    () =>
      branches
        .filter((branch) => branch.enabled)
        .map((branch) => ({
          id: branch.branchId,
          label: branch.branchName,
        })),
    [branches],
  );
  const [costHistoryOpen, setCostHistoryOpen] = useState(false);
  const [productPromotionDrafts, setProductPromotionDrafts] = useState<
    ProductPromotionDraft[]
  >([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [exchangeRateLoading, setExchangeRateLoading] = useState(false);
  const [refreshExchangeRate, setRefreshExchangeRate] = useState(false);
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);
  const [confirmLeaveResolver, setConfirmLeaveResolver] = useState<
    ((value: boolean) => void) | null
  >(null);
  const isFormReady =
    !pageLoading &&
    (isNew
      ? branchCatalogItems.length > 0 && branches.length > 0
      : detailBranchRows !== null && branches.length > 0);
  const formReadyKey = [
    routeIdParam ?? "",
    isFormReady ? "ready" : "loading",
    branches.length,
    detailBranchRows?.length ?? 0,
    branchCatalogItems.length,
  ].join(":");
  const currentFormSnapshot = useMemo(
    () =>
      serializeProductFormDirtyState({
        isNew,
        generalData,
        priceData,
        suppliers,
        branches,
        galleryImages,
        packages,
        productPromotionDrafts,
        basePrices,
      }),
    [
      isNew,
      generalData,
      priceData,
      suppliers,
      branches,
      galleryImages,
      packages,
      productPromotionDrafts,
      basePrices,
    ],
  );
  const baselineSnapshot = useMemo(() => {
    if (!isFormReady) {
      return null;
    }
    return currentFormSnapshot;
    // Capture baseline only when the form becomes ready or the route changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formReadyKey]);
  const isDirty = useMemo(() => {
    if (isViewOnly || baselineSnapshot === null) {
      return false;
    }
    return baselineSnapshot !== currentFormSnapshot;
  }, [isViewOnly, baselineSnapshot, currentFormSnapshot]);
  const resolveConfirmLeave = useCallback(
    (allow: boolean) => {
      setConfirmLeaveOpen(false);
      confirmLeaveResolver?.(allow);
      setConfirmLeaveResolver(null);
    },
    [confirmLeaveResolver],
  );
  const requestLeaveConfirmation = useCallback(() => {
    if (!isDirty) {
      return Promise.resolve(true);
    }
    return new Promise<boolean>((resolve) => {
      setConfirmLeaveResolver(() => resolve);
      setConfirmLeaveOpen(true);
    });
  }, [isDirty]);
  const { navigateWithoutGuard } = useUnsavedChangesGuard({
    isDirty,
    confirmLeave: requestLeaveConfirmation,
  });
  useEffect(() => {
    if (!router.isReady) {
      return;
    }
    if (isNew || editProductIdStr == null) {
      setProductLoading(false);
      setDetailBranchRows(null);
      setProductPromotionDrafts([]);
      setPackages([]);
      return;
    }
    async function loadProduct() {
      setProductLoading(true);
      setDetailBranchRows(null);
      setProductPromotionDrafts([]);
      setPackages([]);
      try {
        const idNum = Number(editProductIdStr);
        if (!Number.isFinite(idNum)) {
          showError("Identificador de artículo inválido.");
          return;
        }
        const result = await getProductByIdDeduped(idNum);
        if (result.error) {
          console.error(
            "[ProductForm] Error loading product:",
            result.error.message,
          );
          showError(result.error.message);
          return;
        }
        if (result.data) {
          const snap = productDetailDtoToFormSnapshot(result.data);
          setGeneralData(snap.generalData);
          setSuppliers(snap.suppliers);
          setPriceData(snap.priceData);
          setRefreshExchangeRate(false);
          setBasePrices(snap.basePrices);
          setGalleryImages(snap.galleryImages);
          setPackages(snap.packages);
          setProductPromotionDrafts(snap.promotionDrafts);
          setDetailBranchRows(result.data.branches ?? []);
        }
      } catch (err) {
        console.error("[ProductForm] Error loading product:", err);
        showError("No se pudo cargar el artículo.");
      } finally {
        setProductLoading(false);
      }
    }
    loadProduct();
  }, [router.isReady, isNew, editProductIdStr, showError]);
  useEffect(() => {
    if (!isNew) {
      return;
    }
    setDetailBranchRows(null);
  }, [isNew]);
  useEffect(() => {
    if (!isNew || catalogsLoading || branchCatalogItems.length === 0) {
      return;
    }
    setBranches(branchCatalogToProductBranches(branchCatalogItems));
  }, [isNew, catalogsLoading, branchCatalogItems]);
  useEffect(() => {
    if (departmentCatalogItems.length === 0) {
      return;
    }
    const departmentMargin = resolveDepartmentMarginFromCatalog(
      departmentCatalogItems,
      generalData.departmentId,
    );
    setBasePrices((prev) => {
      const next = syncDefaultBasePriceDepartmentMargin(prev, departmentMargin);
      if (
        prev.length === next.length &&
        prev.every(
          (bp, index) =>
            bp.id === next[index]?.id &&
            bp.name === next[index]?.name &&
            bp.marginPercent === next[index]?.marginPercent,
        )
      ) {
        return prev;
      }
      return next;
    });
  }, [departmentCatalogItems, generalData.departmentId]);
  useEffect(() => {
    if (isNew || detailBranchRows === null) {
      return;
    }
    if (branchCatalogItems.length === 0) {
      return;
    }
    setBranches(
      mergeBranchCatalogWithProductDetail(branchCatalogItems, detailBranchRows),
    );
  }, [isNew, detailBranchRows, branchCatalogItems]);
  const isNewFormComplete = useMemo(
    () =>
      !isNew ||
      Object.keys(
        getProductFormValidationErrors(
          generalData,
          priceData,
          isNew,
          suppliers,
          branches,
        ),
      ).length === 0,
    [isNew, generalData, priceData, suppliers, branches],
  );
  const firstTabWithValidationErrors = (
    validationErrors: FormErrors,
  ): ProductFormTabValue => {
    const tabFields: Array<{ tab: ProductFormTabValue; fields: string[] }> = [
      {
        tab: "general",
        fields: [
          "departmentId",
          "lineId",
          "description",
          "shortName",
          "warrantyMonths",
          "warrantyPolicy",
          "piecesCount",
          "satProductServiceKey",
          "satUnitOfMeasureKey",
        ],
      },
      { tab: "branches", fields: ["branches"] },
      { tab: "suppliers", fields: ["suppliers"] },
      { tab: "price", fields: ["listCost", "exchangeRate", "iva"] },
    ];
    for (const { tab, fields } of tabFields) {
      if (fields.some((field) => field in validationErrors)) {
        return tab;
      }
    }
    return "price";
  };
  const handleSave = async () => {
    const validationErrors = getProductFormValidationErrors(
      generalData,
      priceData,
      isNew,
      suppliers,
      branches,
    );
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const tab = resolveProductFormTab(
        firstTabWithValidationErrors(validationErrors),
      );
      setActiveTab(tab);
      syncTabToUrl(tab);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      const newGalleryFiles = collectNewGalleryFiles(galleryImages);
      const payload = buildCreateProductRequest(
        {
          generalData,
          priceData,
          suppliers,
          branches,
          galleryImages,
          packages,
          promotions: productPromotionDrafts,
          refreshExchangeRate,
        },
        isNew ? "create" : "update",
      );
      if (isNew) {
        const result = await createProduct(payload, {
          galleryFiles:
            newGalleryFiles.length > 0 ? newGalleryFiles : undefined,
        });
        if (result.error) {
          console.error(
            "[ProductForm] Error creating product:",
            result.error.message,
          );
          showError(result.error.message);
          return;
        }
        showSuccess("Artículo creado correctamente.");
      } else {
        const idNum = Number(editProductIdStr);
        if (!Number.isFinite(idNum)) {
          showError("Identificador de artículo inválido.");
          return;
        }
        const result = await updateProduct(idNum, payload, {
          galleryFiles:
            newGalleryFiles.length > 0 ? newGalleryFiles : undefined,
        });
        if (result.error) {
          console.error(
            "[ProductForm] Error updating product:",
            result.error.message,
          );
          showError(result.error.message);
          return;
        }
        showSuccess("Artículo actualizado correctamente.");
      }
      setRefreshExchangeRate(false);
      navigateWithoutGuard("/catalogos/productos");
    } catch (err) {
      console.error("[ProductForm] Error saving:", err);
      showError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };
  const handleDiscard = async () => {
    const allow = await requestLeaveConfirmation();
    if (allow) {
      navigateWithoutGuard("/catalogos/productos");
    }
  };
  const handleGeneralDataChange = (
    field: keyof GeneralDataFormState,
    value: string | "months" | "policy",
  ) => {
    if (field === "lineId") {
      const lineIdStr = String(value);
      setGeneralData((prev) => ({
        ...prev,
        lineId: lineIdStr,
        ...(lineIdStr === ""
          ? {
              code: "",
            }
          : {}),
      }));
      const lineNumericId = Number(lineIdStr);
      if (!Number.isFinite(lineNumericId) || lineNumericId <= 0) {
        return;
      }
      void (async () => {
        const result = await getProductPreviewCode(lineNumericId);
        if (result.error) {
          console.error(
            "[ProductForm] Preview code error:",
            result.error.message,
          );
          showError(result.error.message);
          return;
        }
        const preview = result.data;
        if (!preview) {
          return;
        }
        setGeneralData((prev) =>
          prev.lineId !== lineIdStr
            ? prev
            : {
                ...prev,
                code: preview.code,
              },
        );
      })();
      return;
    }
    setGeneralData((prev) => {
      if (field === "departmentId" && value !== prev.departmentId) {
        return {
          ...prev,
          departmentId: value as string,
          lineId: "",
          code: "",
        };
      }
      return {
        ...prev,
        [field]: value,
      };
    });
  };
  const handleErrorClear = (field: string) => {
    setErrors((prev) => {
      const newErrors = {
        ...prev,
      };
      delete newErrors[field];
      return newErrors;
    });
  };
  const fetchAndApplyExchangeRate = useCallback(async () => {
    setExchangeRateLoading(true);
    handleErrorClear("exchangeRate");
    try {
      const result = await getCurrentExchangeRate();
      if (result.error) {
        const message = result.error.message;
        setErrors((prev) => ({ ...prev, exchangeRate: message }));
        return;
      }
      const rate = result.data?.exchangeRate;
      if (rate == null || rate <= 0) {
        setErrors((prev) => ({
          ...prev,
          exchangeRate: "No se pudo obtener el tipo de cambio.",
        }));
        return;
      }
      setPriceData((prev) => ({ ...prev, exchangeRate: rate.toFixed(2) }));
      setRefreshExchangeRate(true);
    } catch (err) {
      console.error("[ProductForm] Error fetching exchange rate:", err);
      setErrors((prev) => ({
        ...prev,
        exchangeRate: "No se pudo obtener el tipo de cambio de Banxico.",
      }));
    } finally {
      setExchangeRateLoading(false);
    }
  }, []);
  const handlePriceChange = (
    field: keyof PriceFormState,
    value: string | boolean,
  ) => {
    if (field === "listCost" && errors.listCost) {
      handleErrorClear("listCost");
    }
    if (field === "iva" && errors.iva) {
      handleErrorClear("iva");
    }
    if (field === "currency") {
      if (value === "USD") {
        setPriceData((prev) => ({ ...prev, currency: "USD" }));
        void fetchAndApplyExchangeRate();
      } else {
        setRefreshExchangeRate(false);
        setPriceData((prev) => ({
          ...prev,
          currency: value as string,
          exchangeRate: "1.00",
        }));
      }
      return;
    }
    setPriceData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const handleRefreshExchangeRate = () => {
    void fetchAndApplyExchangeRate();
  };
  const handleBranchToggle = (branchId: string) => {
    setBranches(
      branches.map((branch) =>
        branch.id === branchId
          ? {
              ...branch,
              enabled: !branch.enabled,
            }
          : branch,
      ),
    );
  };
  const handleToggleAllBranches = () => {
    const areAllEnabled = branches.length > 0 && branches.every((branch) => branch.enabled);
    setBranches(
      branches.map((branch) => ({
        ...branch,
        enabled: !areAllEnabled,
      })),
    );
  };
  const handleInventoryChange = (
    branchId: string,
    field: "minInventory" | "maxInventory",
    delta: number,
  ) => {
    setBranches(
      branches.map((branch) => {
        if (branch.id === branchId) {
          const currentValue = branch[field];
          const newValue = Math.max(0, currentValue + delta);
          return {
            ...branch,
            [field]: newValue,
          };
        }
        return branch;
      }),
    );
    handleErrorClear("branches");
  };
  const handleInventoryInputChange = (
    branchId: string,
    field: "minInventory" | "maxInventory",
    value: string,
  ) => {
    const numValue = parseInt(value, 10) || 0;
    setBranches(
      branches.map((branch) =>
        branch.id === branchId
          ? {
              ...branch,
              [field]: Math.max(0, numValue),
            }
          : branch,
      ),
    );
    handleErrorClear("branches");
  };
  const handleAddSupplier = async (supplierId: number) => {
    const supplier = suppliersCatalog.find((s) => s.id === supplierId);
    if (supplier) {
      const newSupplier: ProductSupplier = {
        id: Date.now().toString(),
        supplierId: supplier.id,
        supplierName: supplier.businessName?.trim() || supplier.name,
        isDefault: suppliers.length === 0,
        supplierProductCode: "",
      };
      setSuppliers([...suppliers, newSupplier]);
      handleErrorClear("suppliers");
    }
  };
  const handleRemoveSupplier = (supplierRowId: string) => {
    setSuppliers((prev) => {
      const next = prev.filter((s) => s.id !== supplierRowId);
      if (next.length === 0) {
        return next;
      }
      if (!next.some((s) => s.isDefault)) {
        return next.map((s, index) => ({
          ...s,
          isDefault: index === 0,
        }));
      }
      return next;
    });
  };
  const handleSetPrimarySupplier = (supplierRowId: string) => {
    setSuppliers((prev) =>
      prev.map((supplier) => ({
        ...supplier,
        isDefault: supplier.id === supplierRowId,
      })),
    );
  };
  const handleSupplierProductCodeChange = (
    supplierRowId: string,
    supplierProductCode: string,
  ) => {
    setSuppliers((prev) =>
      prev.map((supplier) =>
        supplier.id === supplierRowId
          ? { ...supplier, supplierProductCode }
          : supplier,
      ),
    );
  };
  const handleAddPackage = async (data: PackageFormData) => {
    const resolvedArticlePrice =
      data.type === "article"
        ? (data.packagePrice ?? data.articleListCost ?? 0)
        : 0;
    const newPackage: ProductPackage = {
      id: Date.now().toString(),
      type: data.type,
      articleId: data.articleId,
      articleName: data.articleName,
      serviceName: data.serviceName,
      quantity: 1,
      packagePrice: resolvedArticlePrice,
      branches: data.branches,
    };
    setPackages((prev) => [...prev, newPackage]);
  };
  const handleRemovePackage = (packageId: string) => {
    setPackages((prev) => prev.filter((p) => p.id !== packageId));
  };
  const handleAddImage = (files: FileList | readonly File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    setGalleryImages((prev) => {
      const additions: ProductGalleryImage[] = [];
      for (const file of list) {
        if (prev.length + additions.length >= MAX_PRODUCT_GALLERY_FILES) {
          break;
        }
        additions.push({
          id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
          previewUrl: URL.createObjectURL(file),
          file,
          isPrimary: prev.length + additions.length === 0,
          imageUrl: "",
          sortOrder: prev.length + additions.length,
        });
      }
      return markFirstGalleryImagePrimary([...prev, ...additions]);
    });
  };
  const handleReplaceImage = (index: number, file: File) => {
    setGalleryImages((prev) => {
      const next = [...prev];
      const old = next[index];
      if (!old) {
        return next;
      }
      if (old.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(old.previewUrl);
      }
      next[index] = {
        ...old,
        previewUrl: URL.createObjectURL(file),
        imageUrl: "",
        file,
      };
      return markFirstGalleryImagePrimary(next);
    });
  };
  const handleRemoveImage = (index: number) => {
    setGalleryImages((prev) => {
      const removed = prev[index];
      if (removed?.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(removed.previewUrl);
      }
      return markFirstGalleryImagePrimary(prev.filter((_, i) => i !== index));
    });
  };
  const breadcrumbItems: BreadcrumbItem[] = [
    {
      label: "Artículos",
      href: "/catalogos/productos",
    },
    {
      label: isNew ? "Nuevo" : isViewOnly ? "Ver" : "Editar",
    },
  ];
  const tabs = [
    {
      value: "general",
      label: "Datos generales",
    },
     {
      value: "branches",
      label: "Sucursales",
    },
    {
      value: "suppliers",
      label: "Proveedores",
    },
    {
      value: "price",
      label: "Precio",
    },
    {
      value: "gallery",
      label: "Galería",
    },
     {
      value: "packages",
      label: "Paquetes",
    },
  ];
  if (pageLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 400,
        }}
      >
        <CircularProgress />
      </Box>
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
          justifyContent="space-between"
          alignItems={{
            xs: "flex-start",
            sm: "center",
          }}
          spacing={2}
        >
          <Breadcrumbs items={breadcrumbItems} />
          {!isViewOnly && (
          <Stack direction="row" spacing={2} alignItems="center">
            <Button
              variant="option"
              color="inherit"
              onClick={handleDiscard}
              disabled={saving}
            >
              Descartar cambios
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={
                saving || !canSaveProduct || (isNew && !isNewFormComplete)
              }
            >
              {saving ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Guardar"
              )}
            </Button>
          </Stack>
          )}
        </Stack>
        <Title
          title={
            isNew
              ? "Nuevo artículo"
              : isViewOnly
                ? "Ver artículo"
                : "Editar artículo"
          }
        />
        <Divider />

        <Grid container spacing={5} flexWrap="nowrap">
          <Grid
            size={{
              xs: "auto",
            }}
            sx={{
              display: {
                xs: "none",
                sm: "block",
              },
            }}
          >
            <VerticalSidebarTabs
              tabs={tabs}
              value={activeTab}
              onChange={handleTabChange}
            />
          </Grid>
          <Grid
            size={{
              xs: "grow",
            }}
          >
            <Box
              sx={{
                display: {
                  xs: "block",
                  sm: "none",
                },
              }}
            >
              <TabFilters
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={handleTabChange}
              />
            </Box>
            {activeTab === "general" && (
              <GeneralDataTab
                formState={generalData}
                errors={errors}
                onFieldChange={handleGeneralDataChange}
                onErrorClear={handleErrorClear}
                departments={departmentOptions}
                lines={lineOptions}
                linesLoading={linesLoading}
                warrantyOptions={warrantyOptions}
                onOpenNewDepartmentModal={() => setDepartmentModalOpen(true)}
                onOpenNewLineModal={() => setLineModalOpen(true)}
                readOnly={isViewOnly}
              />
            )}

            {activeTab === "suppliers" && (
              <SuppliersTab
                suppliers={suppliers}
                availableSuppliers={suppliersCatalog}
                onAddSupplier={handleAddSupplier}
                onRemoveSupplier={handleRemoveSupplier}
                onSetPrimarySupplier={handleSetPrimarySupplier}
                onSupplierProductCodeChange={handleSupplierProductCodeChange}
                error={errors.suppliers}
                readOnly={isViewOnly}
              />
            )}

            {activeTab === "price" && (
              <PriceTab
                formState={priceData}
                errors={errors}
                onFieldChange={handlePriceChange}
                currencies={CURRENCIES}
                costBasisOptions={COST_BASIS_FOR_PRICE_OPTIONS}
                basePrices={basePrices}
                costHistoryOpen={costHistoryOpen}
                onCostHistoryOpen={() => setCostHistoryOpen(true)}
                onCostHistoryClose={() => setCostHistoryOpen(false)}
                productNumericId={
                  isNew ||
                  editProductIdStr == null ||
                  !Number.isFinite(Number(editProductIdStr))
                    ? null
                    : Number(editProductIdStr)
                }
                promotionDrafts={productPromotionDrafts}
                onPromotionDraftsChange={setProductPromotionDrafts}
                exchangeRateLoading={exchangeRateLoading}
                onRefreshExchangeRate={handleRefreshExchangeRate}
                readOnly={isViewOnly}
              />
            )}

            {activeTab === "packages" && (
              <PackagesTab
                packages={packages}
                availableBranches={packageBranchSelectableItems}
                excludeProductId={editProductId ?? undefined}
                onAddPackage={handleAddPackage}
                onRemovePackage={handleRemovePackage}
                readOnly={isViewOnly}
              />
            )}

            {activeTab === "gallery" && (
              <GalleryTab
                images={galleryImages}
                maxImages={MAX_PRODUCT_GALLERY_FILES}
                onAddImage={handleAddImage}
                onReplaceImage={handleReplaceImage}
                onRemoveImage={handleRemoveImage}
                readOnly={isViewOnly}
              />
            )}

            {activeTab === "branches" && (
              <BranchesTab
                branches={branches}
                onBranchToggle={handleBranchToggle}
                onToggleAllBranches={handleToggleAllBranches}
                onInventoryChange={handleInventoryChange}
                onInventoryInputChange={handleInventoryInputChange}
                error={errors.branches}
                readOnly={isViewOnly}
              />
            )}
          </Grid>
        </Grid>
      </Stack>

      <QuickDepartmentModal
        open={departmentModalOpen}
        onClose={() => setDepartmentModalOpen(false)}
        existingDepartmentIds={existingDepartmentIds}
        onCreated={async ({ id }) => {
          await refreshDepartmentOptions();
          handleGeneralDataChange("departmentId", String(id));
        }}
      />
      {selectedDepartmentNumericId != null && (
        <QuickProductLineModal
          open={lineModalOpen}
          onClose={() => setLineModalOpen(false)}
          departmentId={selectedDepartmentNumericId}
          onCreated={async ({ id }) => {
            await refreshLineOptions();
            handleGeneralDataChange("lineId", String(id));
          }}
        />
      )}

      <ConfirmModal
        open={confirmLeaveOpen}
        onClose={() => resolveConfirmLeave(false)}
        onConfirm={() => resolveConfirmLeave(true)}
        title="Cambios sin guardar"
        description="Tienes cambios sin guardar. Si sales ahora, se perderán. ¿Deseas salir?"
        cancelLabel="Quedarme"
        confirmLabel="Salir sin guardar"
        type="warning"
      />
    </>
  );
}
