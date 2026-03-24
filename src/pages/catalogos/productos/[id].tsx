import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Box, Button, CircularProgress, Divider, Grid, Stack } from "@mui/material";
import {
    MainLayout,
    Breadcrumbs,
    Title,
    VerticalSidebarTabs,
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
} from "@/types/productos.types";
import {
    getProduct,
    saveProduct,
    createProduct,
    buildCreateProductRequest,
    resolveGalleryImageUrlsForCreate,
} from "@/services/productos.service";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { useProductFormCatalogs } from "@/hooks/useProductFormCatalogs";
import { branchCatalogToProductBranches } from "@/lib/productFormCatalogMappers";
import {
    CURRENCIES,
    MOCK_COST_HISTORY,
    MOCK_ARTICLES,
    MOCK_PACKAGE_BRANCHES,
    COST_BASIS_FOR_PRICE_OPTIONS,
    DEFAULT_PRODUCT_BASE_PRICES,
} from "@/data/productos.mockData";
import { GeneralDataTab } from "@/components/Products/GeneralDataTab";
import { SuppliersTab } from "@/components/Products/SuppliersTab";
import { PriceTab } from "@/components/Products/PriceTab";
import { PackagesTab } from "@/components/Products/PackagesTab";
import { GalleryTab } from "@/components/Products/GalleryTab";
import { BranchesTab } from "@/components/Products/BranchesTab";

export default function ProductFormPage() {
    const router = useRouter();
    const { id } = router.query;
    const showSuccess = useSnackbarStore((s) => s.showSuccess);
    const showError = useSnackbarStore((s) => s.showError);

    const isNew = id === "nuevo";
    const productId = isNew ? null : String(id);

    const [productLoading, setProductLoading] = useState(!isNew);
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
        departmentOptions,
        lineOptions,
        suppliersCatalog,
        branchCatalogItems,
        warrantyOptions,
    } = useProductFormCatalogs(generalData.departmentId);

    const pageLoading = catalogsLoading || productLoading;

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
    });

    const [basePrices, setBasePrices] = useState<ProductBasePrice[]>(() => [...DEFAULT_PRODUCT_BASE_PRICES]);

    const [branches, setBranches] = useState<ProductBranch[]>([]);

    const [galleryImages, setGalleryImages] = useState<ProductGalleryImage[]>([]);

    const [packages, setPackages] = useState<ProductPackage[]>([]);

    const [costHistoryOpen, setCostHistoryOpen] = useState(false);

    const [errors, setErrors] = useState<FormErrors>({});

    useEffect(() => {
        if (isNew || !productId) {
            setProductLoading(false);
            return;
        }

        async function loadProduct() {
            setProductLoading(true);
            try {
                const product = await getProduct(productId!);
                if (product) {
                    setGeneralData({
                        departmentId: String(product.departmentId),
                        lineId: product.lineId,
                        code: product.code,
                        description: product.description,
                        shortName: product.shortName,
                        piecesCount: "1",
                        warrantyType: product.warrantyType,
                        warrantyMonths: String(product.warrantyMonths),
                        warrantyPolicy: "",
                    });
                    setSuppliers(product.suppliers);
                    setPriceData({
                        listCost: product.price.listCost.toFixed(2),
                        currency: product.price.currency,
                        exchangeRate: product.price.exchangeRate.toFixed(2),
                        iva: String(product.price.iva),
                        liquidation: product.price.liquidation,
                        costBasisForCalculation: product.price.costBasisForCalculation ?? "last_cost",
                        lastCost: product.price.lastCost.toFixed(2),
                        averageCost: product.price.averageCost.toFixed(2),
                    });
                    setBasePrices(product.price.basePrices ?? [...DEFAULT_PRODUCT_BASE_PRICES]);
                    setBranches(product.branches);
                    setGalleryImages(
                        product.images.map((url, index) => ({
                            id: `loaded-${product.id}-${index}`,
                            previewUrl: url,
                            file: null,
                        }))
                    );
                }
            } catch (err) {
                console.error("[ProductForm] Error loading product:", err);
            } finally {
                setProductLoading(false);
            }
        }

        loadProduct();
    }, [isNew, productId]);

    useEffect(() => {
        if (!isNew || catalogsLoading || branchCatalogItems.length === 0) {
            return;
        }
        setBranches((prev) =>
            prev.length === 0 ? branchCatalogToProductBranches(branchCatalogItems) : prev
        );
    }, [isNew, catalogsLoading, branchCatalogItems]);

    const validateForm = (): boolean => {
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

        if (generalData.warrantyType === "months" && (!generalData.warrantyMonths || Number(generalData.warrantyMonths) <= 0)) {
            newErrors.warrantyMonths = "Los meses de garantía deben ser mayor a 0";
        }

        if (generalData.warrantyType === "policy" && !generalData.warrantyPolicy.trim()) {
            newErrors.warrantyPolicy = "Describe la garantía por póliza anexa";
        }

        const piecesNum = parseInt(generalData.piecesCount, 10);
        if (!generalData.piecesCount.trim() || Number.isNaN(piecesNum) || piecesNum < 1) {
            newErrors.piecesCount = "El número de piezas debe ser al menos 1";
        } else if (piecesNum > 9999) {
            newErrors.piecesCount = "El número de piezas no puede ser mayor a 9999";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            setActiveTab("general");
            return;
        }

        setSaving(true);
        try {
            if (isNew) {
                let resolvedImageUrls: string[];
                try {
                    resolvedImageUrls = await resolveGalleryImageUrlsForCreate(galleryImages);
                } catch (readErr) {
                    console.error("[ProductForm] Error reading gallery files:", readErr);
                    showError("No se pudieron procesar las imágenes. Intenta de nuevo.");
                    return;
                }
                const payload = buildCreateProductRequest({
                    generalData,
                    suppliers,
                    branches,
                    images: resolvedImageUrls,
                });
                const result = await createProduct(payload);
                if (result.error) {
                    console.error("[ProductForm] Error creating product:", result.error.message);
                    showError(result.error.message);
                    return;
                }
                showSuccess("Producto creado correctamente.");
            } else {
                await saveProduct({
                    id: productId || undefined,
                    code: generalData.code || "ART-000",
                    departmentId: Number(generalData.departmentId),
                    lineId: generalData.lineId,
                    description: generalData.description.trim(),
                    shortName: generalData.shortName.trim(),
                    warrantyType: generalData.warrantyType,
                    warrantyMonths: generalData.warrantyType === "months" ? Number(generalData.warrantyMonths) : 0,
                    suppliers,
                    price: {
                        listCost: Number(priceData.listCost),
                        currency: priceData.currency,
                        exchangeRate: Number(priceData.exchangeRate),
                        iva: Number(priceData.iva),
                        averageCost: Number(priceData.averageCost),
                        lastCost: Number(priceData.lastCost),
                        liquidation: priceData.liquidation,
                        costBasisForCalculation: priceData.costBasisForCalculation,
                        basePrices,
                    },
                    branches,
                    images: galleryImages.map((g) => g.previewUrl),
                });
            }
            router.push("/catalogos/productos");
        } catch (err) {
            console.error("[ProductForm] Error saving:", err);
        } finally {
            setSaving(false);
        }
    };

    const handleDiscard = () => {
        if (window.confirm("¿Estás seguro de descartar los cambios?")) {
            router.push("/catalogos/productos");
        }
    };

    const handleGeneralDataChange = (field: keyof GeneralDataFormState, value: string | "months" | "policy") => {
        setGeneralData((prev) => {
            if (field === "departmentId" && value !== prev.departmentId) {
                return { ...prev, departmentId: value as string, lineId: "" };
            }
            return { ...prev, [field]: value };
        });
    };

    const handleErrorClear = (field: string) => {
        setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });
    };

    const handlePriceChange = (field: keyof PriceFormState, value: string | boolean) => {
        setPriceData((prev) => ({ ...prev, [field]: value }));
    };

    const handleAddBasePrice = (entry: Omit<ProductBasePrice, "id">) => {
        setBasePrices((prev) => [...prev, { ...entry, id: `bp-${Date.now()}` }]);
    };

    const handleBranchToggle = (branchId: string) => {
        setBranches(
            branches.map((branch) =>
                branch.id === branchId ? { ...branch, enabled: !branch.enabled } : branch
            )
        );
    };

    const handleInventoryChange = (branchId: string, field: "minInventory" | "maxInventory", delta: number) => {
        setBranches(
            branches.map((branch) => {
                if (branch.id === branchId) {
                    const currentValue = branch[field];
                    const newValue = Math.max(0, currentValue + delta);
                    return { ...branch, [field]: newValue };
                }
                return branch;
            })
        );
    };

    const handleInventoryInputChange = (branchId: string, field: "minInventory" | "maxInventory", value: string) => {
        const numValue = parseInt(value, 10) || 0;
        setBranches(
            branches.map((branch) =>
                branch.id === branchId ? { ...branch, [field]: Math.max(0, numValue) } : branch
            )
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

    const handleAddImage = (files: FileList) => {
        setGalleryImages((prev) => {
            const additions: ProductGalleryImage[] = [];
            Array.from(files).forEach((file) => {
                if (prev.length + additions.length < 6) {
                    additions.push({
                        id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
                        previewUrl: URL.createObjectURL(file),
                        file,
                    });
                }
            });
            return [...prev, ...additions];
        });
    };

    const handleReplaceImage = (index: number, file: File) => {
        setGalleryImages((prev) => {
            const next = [...prev];
            const old = next[index];
            if (old?.previewUrl.startsWith("blob:")) {
                URL.revokeObjectURL(old.previewUrl);
            }
            next[index] = {
                id: old?.id ?? `img-${Date.now()}`,
                previewUrl: URL.createObjectURL(file),
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
        { label: "Productos", href: "/catalogos/productos" },
        { label: isNew ? "Nuevo" : "Editar" },
    ];

    const tabs = [
        { value: "general", label: "Datos generales" },
        { value: "suppliers", label: "Proveedores" },
        { value: "price", label: "Precio" },
        { value: "packages", label: "Paquetes" },
        { value: "gallery", label: "Galería" },
        { value: "branches", label: "Sucursales" },
    ];

    if (pageLoading) {
        return (
            <MainLayout>
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
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <Stack spacing={3}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Breadcrumbs items={breadcrumbItems} />
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Button
                            variant="outlined"
                            onClick={handleDiscard}
                            disabled={saving}>
                            Descartar cambios
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? <CircularProgress size={20} color="inherit" /> : "Guardar"}
                        </Button>
                    </Stack>
                </Stack>
                <Title title={(isNew) ? "Nuevo producto" : "Editar producto"} />
                <Divider />

                <Grid container spacing={5} flexWrap="nowrap">
                    <Grid size={{ xs: 'auto' }}>
                        <VerticalSidebarTabs
                            tabs={tabs}
                            value={activeTab}
                            onChange={setActiveTab}
                        />
                    </Grid>
                    <Grid size={{ xs: 'grow' }}>

                        {
                            activeTab === "general" &&
                            <GeneralDataTab
                                formState={generalData}
                                errors={errors}
                                onFieldChange={handleGeneralDataChange}
                                onErrorClear={handleErrorClear}
                                departments={departmentOptions}
                                lines={lineOptions}
                                warrantyOptions={warrantyOptions}
                            />
                        }

                        {
                            activeTab === "suppliers" &&
                            <SuppliersTab
                                suppliers={suppliers}
                                availableSuppliers={suppliersCatalog}
                                onAddSupplier={handleAddSupplier}
                                onRemoveSupplier={handleRemoveSupplier}
                            />
                        }

                        {
                            activeTab === "price" &&
                            <PriceTab
                                formState={priceData}
                                onFieldChange={handlePriceChange}
                                currencies={CURRENCIES}
                                costBasisOptions={COST_BASIS_FOR_PRICE_OPTIONS}
                                basePrices={basePrices}
                                onAddBasePrice={handleAddBasePrice}
                                costHistory={MOCK_COST_HISTORY}
                                costHistoryOpen={costHistoryOpen}
                                onCostHistoryOpen={() => setCostHistoryOpen(true)}
                                onCostHistoryClose={() => setCostHistoryOpen(false)}
                            />
                        }

                        {
                            activeTab === "packages" &&
                            <PackagesTab
                                packages={packages}
                                availableArticles={MOCK_ARTICLES}
                                availableBranches={MOCK_PACKAGE_BRANCHES}
                                onAddPackage={handleAddPackage}
                                onRemovePackage={handleRemovePackage}
                            />
                        }

                        {
                            activeTab === "gallery" &&
                            <GalleryTab
                                images={galleryImages}
                                onAddImage={handleAddImage}
                                onReplaceImage={handleReplaceImage}
                                onRemoveImage={handleRemoveImage}
                            />
                        }

                        {
                            activeTab === "branches" &&
                            <BranchesTab
                                branches={branches}
                                onBranchToggle={handleBranchToggle}
                                onInventoryChange={handleInventoryChange}
                                onInventoryInputChange={handleInventoryInputChange}
                            />
                        }

                    </Grid>
                </Grid>
            </Stack>
        </MainLayout>
    );
}
