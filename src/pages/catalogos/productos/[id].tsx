import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Box, Button, CircularProgress, Stack } from "@mui/material";
import {
    MainLayout,
    Breadcrumbs,
    Title,
    TabFilters,
} from "@/components";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import {
    FormCard,
} from "@/styles/catalogos/productos.styles";
import type { GeneralDataFormState, PriceFormState, FormErrors, ProductSupplier, ProductBranch, ProductPackage, PackageFormData } from "@/types/productos.types";
import { getProduct, saveProduct } from "@/services/productos.service";
import { MOCK_DEPARTMENTS, MOCK_LINES, CURRENCIES, MOCK_COST_HISTORY, getInitialBranches, MOCK_ARTICLES, MOCK_PACKAGE_BRANCHES, MOCK_SUPPLIERS_FOR_SELECTION } from "@/data/productos.mockData";
import { GeneralDataTab } from "@/components/Products/GeneralDataTab";
import { SuppliersTab } from "@/components/Products/SuppliersTab";
import { PriceTab } from "@/components/Products/PriceTab";
import { PackagesTab } from "@/components/Products/PackagesTab";
import { GalleryTab } from "@/components/Products/GalleryTab";
import { BranchesTab } from "@/components/Products/BranchesTab";

export default function ProductFormPage() {
    const router = useRouter();
    const { id } = router.query;

    const isNew = id === "nuevo";
    const productId = isNew ? null : String(id);

    const [loading, setLoading] = useState(!isNew);
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
    });

    const [suppliers, setSuppliers] = useState<ProductSupplier[]>([]);

    const [priceData, setPriceData] = useState<PriceFormState>({
        listCost: "0.00",
        currency: "MXN",
        exchangeRate: "1.00",
        iva: "16.00",
        liquidation: false,
    });

    const [branches, setBranches] = useState<ProductBranch[]>([]);

    const [images, setImages] = useState<string[]>([]);

    const [packages, setPackages] = useState<ProductPackage[]>([]);

    const [costHistoryOpen, setCostHistoryOpen] = useState(false);

    const [errors, setErrors] = useState<FormErrors>({});

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
                        piecesCount: "1",
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

    const handleDiscard = () => {
        if (window.confirm("¿Estás seguro de descartar los cambios?")) {
            router.push("/catalogos/productos");
        }
    };

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

    const handlePriceChange = (field: keyof PriceFormState, value: string | boolean) => {
        setPriceData((prev) => ({ ...prev, [field]: value }));
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
        const supplier = MOCK_SUPPLIERS_FOR_SELECTION.find((s) => s.id === supplierId);
        if (supplier) {
            const newSupplier: ProductSupplier = {
                id: Date.now().toString(),
                supplierId: supplier.id,
                supplierName: supplier.name,
                isDefault: suppliers.length === 0,
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
        if (newImages[index] && newImages[index].startsWith("blob:")) {
            URL.revokeObjectURL(newImages[index]);
        }
        newImages[index] = imageUrl;
        setImages(newImages);
    };

    const handleRemoveImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
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
            <Stack spacing={3}>
                <Breadcrumbs items={breadcrumbItems} />
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Title
                        title={(isNew) ? "Nuevo producto" : "Editar producto"} />
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
                <TabFilters
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />

                <FormCard>
                    {
                        activeTab === "general" &&
                        <GeneralDataTab
                            formState={generalData}
                            errors={errors}
                            onFieldChange={handleGeneralDataChange}
                            onErrorClear={handleErrorClear}
                            departments={MOCK_DEPARTMENTS}
                            lines={MOCK_LINES}
                        />
                    }

                    {
                        activeTab === "suppliers" &&
                        <SuppliersTab
                            suppliers={suppliers}
                            availableSuppliers={MOCK_SUPPLIERS_FOR_SELECTION}
                            onAddSupplier={handleAddSupplier}
                        />
                    }

                    {
                        activeTab === "price" &&
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
                    }

                    {
                        activeTab === "packages" &&
                        <PackagesTab
                            packages={packages}
                            availableArticles={MOCK_ARTICLES}
                            availableBranches={MOCK_PACKAGE_BRANCHES}
                            onAddPackage={handleAddPackage}
                        />
                    }

                    {
                        activeTab === "gallery" &&
                        <GalleryTab
                            images={images}
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

                </FormCard>
            </Stack>

        </MainLayout>
    );
}
