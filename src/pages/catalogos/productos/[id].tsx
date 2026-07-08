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
  updateProduct,
  productDetailDtoToFormSnapshot,
  type ProductDetailBranchDto,
} from "@/services/productos.service";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { useProductFormCatalogs } from "@/hooks/useProductFormCatalogs";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import {
  branchCatalogToPackageSelectableItems,
  branchCatalogToProductBranches,
  mergeBranchCatalogWithProductDetail,
  resolveDepartmentMarginFromCatalog,
  syncDefaultBasePriceDepartmentMargin,
} from "@/lib/productFormCatalogMappers";
import {
  CURRENCIES,
  MOCK_ARTICLES,
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
function getProductFormValidationErrors(
  generalData: GeneralDataFormState,
  priceData: PriceFormState,
  isNew: boolean,
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
  if (
    generalData.warrantyType === "months" &&
    (!generalData.warrantyMonths || Number(generalData.warrantyMonths) <= 0)
  ) {
    newErrors.warrantyMonths = "Los meses de garantía deben ser mayor a 0";
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
  return newErrors;
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
  /** Numeric id segment for edit mode; only defined once the router is ready. */
  const editProductIdStr =
    router.isReady && routeIdParam != null && !isNew ? routeIdParam : null;
  const [productLoading, setProductLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [generalData, setGeneralData] = useState<GeneralDataFormState>({
    departmentId: "",
    lineId: "",
    code: "",
    description: "",
    shortName: "",
    piecesCount: "1",
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
  const packageBranchSelectableItems = useMemo(
    () => branchCatalogToPackageSelectableItems(branchCatalogItems),
    [branchCatalogItems],
  );
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
  const [costHistoryOpen, setCostHistoryOpen] = useState(false);
  const [productPromotionDrafts, setProductPromotionDrafts] = useState<
    ProductPromotionDraft[]
  >([]);
  const [errors, setErrors] = useState<FormErrors>({});
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
    if (baselineSnapshot === null) {
      return false;
    }
    return baselineSnapshot !== currentFormSnapshot;
  }, [baselineSnapshot, currentFormSnapshot]);
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
      return;
    }
    async function loadProduct() {
      setProductLoading(true);
      setDetailBranchRows(null);
      setProductPromotionDrafts([]);
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
          setBasePrices(snap.basePrices);
          setGalleryImages(snap.galleryImages);
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
      Object.keys(getProductFormValidationErrors(generalData, priceData, isNew))
        .length === 0,
    [isNew, generalData, priceData],
  );
  const firstTabWithValidationErrors = (
    validationErrors: FormErrors,
  ): string => {
    const generalFields = new Set([
      "departmentId",
      "lineId",
      "description",
      "shortName",
      "warrantyMonths",
      "warrantyPolicy",
      "piecesCount",
    ]);
    if (Object.keys(validationErrors).some((key) => generalFields.has(key))) {
      return "general";
    }
    return "price";
  };
  const handleSave = async () => {
    const validationErrors = getProductFormValidationErrors(
      generalData,
      priceData,
      isNew,
    );
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setActiveTab(firstTabWithValidationErrors(validationErrors));
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
      navigateWithoutGuard("/catalogos/productos");
    } catch (err) {
      console.error("[ProductForm] Error saving:", err);
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
  const handlePriceChange = (
    field: keyof PriceFormState,
    value: string | boolean,
  ) => {
    if (field === "listCost" && errors.listCost) {
      handleErrorClear("listCost");
    }
    setPriceData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const handleAddBasePrice = (entry: Omit<ProductBasePrice, "id">) => {
    setBasePrices((prev) => [
      ...prev,
      {
        ...entry,
        id: `bp-${Date.now()}`,
      },
    ]);
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
  };
  const handleAddSupplier = async (supplierId: number) => {
    const supplier = suppliersCatalog.find((s) => s.id === supplierId);
    if (supplier) {
      const newSupplier: ProductSupplier = {
        id: Date.now().toString(),
        supplierId: supplier.id,
        supplierName: supplier.businessName?.trim() || supplier.name,
        isDefault: suppliers.length === 0,
      };
      setSuppliers([...suppliers, newSupplier]);
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
  const handleAddPackage = async (data: PackageFormData) => {
    const article =
      data.type === "article" && data.articleId
        ? MOCK_ARTICLES.find((a) => a.id === data.articleId)
        : undefined;
    const resolvedArticlePrice =
      data.type === "article"
        ? (data.packagePrice ?? article?.lastPrice ?? 0)
        : 0;
    const newPackage: ProductPackage = {
      id: Date.now().toString(),
      type: data.type,
      articleId: data.articleId,
      articleName: article?.name,
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
          isPrimary: false,
          imageUrl: "",
          sortOrder: prev.length + additions.length,
        });
      }
      return [...prev, ...additions];
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
      return next;
    });
  };
  const handleRemoveImage = (index: number) => {
    setGalleryImages((prev) => {
      const removed = prev[index];
      if (removed?.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(removed.previewUrl);
      }
      return prev.filter((_, i) => i !== index);
    });
  };
  const breadcrumbItems: BreadcrumbItem[] = [
    {
      label: "Artículos",
      href: "/catalogos/productos",
    },
    {
      label: isNew ? "Nuevo" : "Editar",
    },
  ];
  const tabs = [
    {
      value: "general",
      label: "Datos generales",
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
      value: "packages",
      label: "Paquetes",
    },
    {
      value: "gallery",
      label: "Galería",
    },
    {
      value: "branches",
      label: "Sucursales",
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
        </Stack>
        <Title title={isNew ? "Nuevo artículo" : "Editar artículo"} />
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
              onChange={setActiveTab}
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
                onTabChange={setActiveTab}
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
              />
            )}

            {activeTab === "suppliers" && (
              <SuppliersTab
                suppliers={suppliers}
                availableSuppliers={suppliersCatalog}
                onAddSupplier={handleAddSupplier}
                onRemoveSupplier={handleRemoveSupplier}
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
                onAddBasePrice={handleAddBasePrice}
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
              />
            )}

            {activeTab === "packages" && (
              <PackagesTab
                packages={packages}
                availableArticles={MOCK_ARTICLES}
                availableBranches={packageBranchSelectableItems}
                onAddPackage={handleAddPackage}
                onRemovePackage={handleRemovePackage}
              />
            )}

            {activeTab === "gallery" && (
              <GalleryTab
                images={galleryImages}
                maxImages={MAX_PRODUCT_GALLERY_FILES}
                onAddImage={handleAddImage}
                onReplaceImage={handleReplaceImage}
                onRemoveImage={handleRemoveImage}
              />
            )}

            {activeTab === "branches" && (
              <BranchesTab
                branches={branches}
                onBranchToggle={handleBranchToggle}
                onInventoryChange={handleInventoryChange}
                onInventoryInputChange={handleInventoryInputChange}
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
