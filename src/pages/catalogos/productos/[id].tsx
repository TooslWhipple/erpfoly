import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Box, CircularProgress } from "@mui/material";
import {
    MainLayout,
    Breadcrumbs,
    Tabs,
} from "@/components";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import {
    BreadcrumbsContainer,
    PageHeader,
    PageTitle,
    SaveButton,
    DiscardButton,
    TabsContainer,
    FormCard,
} from "@/styles/catalogos/productos.styles";
import type { GeneralDataFormState, PriceFormState, FormErrors, ProductSupplier, ProductBranch, ProductPackage, PackageFormData } from "./types";
import { getProduct, saveProduct } from "./api";
import { MOCK_DEPARTMENTS, MOCK_LINES, CURRENCIES, MOCK_COST_HISTORY, getInitialBranches, MOCK_ARTICLES, MOCK_PACKAGE_BRANCHES, MOCK_SUPPLIERS_FOR_SELECTION } from "./mockData";
import { GeneralDataTab } from "./components/GeneralDataTab";
import { SuppliersTab } from "./components/SuppliersTab";
import { PriceTab } from "./components/PriceTab";
import { PackagesTab } from "./components/PackagesTab";
import { GalleryTab } from "./components/GalleryTab";
import { BranchesTab } from "./components/BranchesTab";

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ProductFormPage() {
    const router = useRouter();
    const { id } = router.query;

    // Determine if creating or editing
    const isNew = id === "nuevo";
    const productId = isNew ? null : String(id);

    // State
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("general");

    // General Data State
    const [generalData, setGeneralData] = useState<GeneralDataFormState>({
        departmentId: "",
        lineId: "",
        code: "",
        description: "",
        shortName: "",
        warrantyType: "months",
        warrantyMonths: "12",
    });

    // Suppliers State
    const [suppliers, setSuppliers] = useState<ProductSupplier[]>([]);

    // Price State
    const [priceData, setPriceData] = useState<PriceFormState>({
        listCost: "0.00",
        currency: "MXN",
        exchangeRate: "1.00",
        iva: "16.00",
        liquidation: false,
    });

    // Branches State
    const [branches, setBranches] = useState<ProductBranch[]>([]);

    // Images State
    const [images, setImages] = useState<string[]>([]);

    // Packages State
    const [packages, setPackages] = useState<ProductPackage[]>([]);

    // Cost History Modal State
    const [costHistoryOpen, setCostHistoryOpen] = useState(false);

    // Errors
    const [errors, setErrors] = useState<FormErrors>({});

    // Fetch product data if editing
    useEffect(() => {
        if (isNew || !productId) {
            setLoading(false);
            setBranches(getInitialBranches());
            return;
        }

        async function loadProduct() {
            setLoading(true);
            try {
                const product = await getProduct(productId!);
                if (product) {
                    setGeneralData({
                        departmentId: String(product.departmentId),
                        lineId: product.lineId,
                        code: product.code,
                        description: product.description,
                        shortName: product.shortName,
                        warrantyType: product.warrantyType,
                        warrantyMonths: String(product.warrantyMonths),
                    });
                    setSuppliers(product.suppliers);
                    setPriceData({
                        listCost: product.price.listCost.toFixed(2),
                        currency: product.price.currency,
                        exchangeRate: product.price.exchangeRate.toFixed(2),
                        iva: String(product.price.iva),
                        liquidation: product.price.liquidation,
                    });
                    setBranches(product.branches);
                    setImages(product.images);
                }
            } catch (err) {
                console.error("[ProductForm] Error loading product:", err);
            } finally {
                setLoading(false);
            }
        }

        loadProduct();
    }, [isNew, productId]);

    // Validate form
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!generalData.departmentId) {
            newErrors.departmentId = "El departamento es requerido";
        }

        if (!generalData.lineId) {
            newErrors.lineId = "La línea es requerida";
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

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle save
    const handleSave = async () => {
        if (!validateForm()) {
            setActiveTab("general");
            return;
        }

        setSaving(true);
        try {
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
                    averageCost: Number(priceData.listCost),
                    lastCost: Number(priceData.listCost),
                    liquidation: priceData.liquidation,
                },
                branches,
                images,
            });
            router.push("/catalogos/productos");
        } catch (err) {
            console.error("[ProductForm] Error saving:", err);
        } finally {
            setSaving(false);
        }
    };

    // Handle discard
    const handleDiscard = () => {
        if (window.confirm("¿Estás seguro de descartar los cambios?")) {
            router.push("/catalogos/productos");
        }
    };

    // General Data Handlers
    const handleGeneralDataChange = (field: keyof GeneralDataFormState, value: string | "months" | "policy") => {
        setGeneralData((prev) => ({ ...prev, [field]: value }));
    };

    const handleErrorClear = (field: string) => {
        setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });
    };

    // Price Handlers
    const handlePriceChange = (field: keyof PriceFormState, value: string | boolean) => {
        setPriceData((prev) => ({ ...prev, [field]: value }));
    };

    // Branch Handlers
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

    // Other Handlers
    const handleAddSupplier = async (supplierId: number) => {
        const supplier = MOCK_SUPPLIERS_FOR_SELECTION.find((s) => s.id === supplierId);
        if (supplier) {
            const newSupplier: ProductSupplier = {
                id: Date.now().toString(),
                supplierId: supplier.id,
                supplierName: supplier.name,
                isDefault: suppliers.length === 0, // First supplier is default
            };
            setSuppliers([...suppliers, newSupplier]);
        }
    };

    const handleAddPackage = async (data: PackageFormData) => {
        const newPackage: ProductPackage = {
            id: Date.now().toString(),
            type: data.type,
            articleId: data.articleId,
            articleName: data.type === "article" 
                ? MOCK_ARTICLES.find(a => a.id === data.articleId)?.name 
                : undefined,
            serviceName: data.serviceName,
            branches: data.branches,
        };
        setPackages([...packages, newPackage]);
    };

    const handleAddImage = (files: FileList) => {
        const newImages: string[] = [];
        Array.from(files).forEach((file) => {
            if (images.length + newImages.length < 6) {
                const imageUrl = URL.createObjectURL(file);
                newImages.push(imageUrl);
            }
        });
        setImages([...images, ...newImages]);
    };

    const handleReplaceImage = (index: number, file: File) => {
        const imageUrl = URL.createObjectURL(file);
        const newImages = [...images];
        // Revoke the old URL to free memory
        if (newImages[index] && newImages[index].startsWith("blob:")) {
            URL.revokeObjectURL(newImages[index]);
        }
        newImages[index] = imageUrl;
        setImages(newImages);
    };

    const handleRemoveImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    // Breadcrumbs
    const breadcrumbItems: BreadcrumbItem[] = [
        { label: "Productos", href: "/catalogos/productos" },
        { label: isNew ? "Nuevo" : "Editar" },
    ];

    // Tabs configuration
    const tabs = [
        { value: "general", label: "Datos generales" },
        { value: "suppliers", label: "Proveedores" },
        { value: "price", label: "Precio" },
        { value: "packages", label: "Paquetes" },
        { value: "gallery", label: "Galería" },
        { value: "branches", label: "Sucursales" },
    ];

    if (loading) {
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
            <BreadcrumbsContainer>
                <Breadcrumbs items={breadcrumbItems} />
            </BreadcrumbsContainer>

            <PageHeader>
                <PageTitle>{isNew ? "Nuevo producto" : "Editar producto"}</PageTitle>
                <Box sx={{ display: "flex", gap: 1 }}>
                    <DiscardButton variant="outlined" onClick={handleDiscard} disabled={saving}>
                        Descartar cambios
                    </DiscardButton>
                    <SaveButton
                        variant="contained"
                        color="primary"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? <CircularProgress size={20} color="inherit" /> : "Guardar"}
                    </SaveButton>
                </Box>
            </PageHeader>

            <TabsContainer>
                <Tabs
                    tabs={tabs}
                    value={activeTab}
                    onChange={setActiveTab}
                    withBorder={true}
                />
            </TabsContainer>

            <FormCard>
                {activeTab === "general" && (
                    <GeneralDataTab
                        formState={generalData}
                        errors={errors}
                        onFieldChange={handleGeneralDataChange}
                        onErrorClear={handleErrorClear}
                        departments={MOCK_DEPARTMENTS}
                        lines={MOCK_LINES}
                    />
                )}

                {activeTab === "suppliers" && (
                    <SuppliersTab
                        suppliers={suppliers}
                        availableSuppliers={MOCK_SUPPLIERS_FOR_SELECTION}
                        onAddSupplier={handleAddSupplier}
                    />
                )}

                {activeTab === "price" && (
                    <PriceTab
                        formState={priceData}
                        onFieldChange={handlePriceChange}
                        lastModified="12 de Julio, 2025, Arturo Gonzalez"
                        currencies={CURRENCIES}
                        costHistory={MOCK_COST_HISTORY}
                        costHistoryOpen={costHistoryOpen}
                        onCostHistoryOpen={() => setCostHistoryOpen(true)}
                        onCostHistoryClose={() => setCostHistoryOpen(false)}
                    />
                )}

                {activeTab === "packages" && (
                    <PackagesTab
                        packages={packages}
                        availableArticles={MOCK_ARTICLES}
                        availableBranches={MOCK_PACKAGE_BRANCHES}
                        onAddPackage={handleAddPackage}
                    />
                )}

                {activeTab === "gallery" && (
                    <GalleryTab
                        images={images}
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
            </FormCard>
        </MainLayout>
    );
}
