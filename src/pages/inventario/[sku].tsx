import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
    GridView as GridViewIcon,
    Sync as SyncIcon,
    LocalShipping as ShippingIcon,
    Build as BuildIcon,
    Settings as SettingsIcon,
    LocalLaundryService as LaundryIcon,
    Inventory2 as BoxIcon,
} from "@mui/icons-material";
import { MainLayout, Breadcrumbs, Tabs } from "@/components";
import {
    SalesChart,
    ActivityLog,
    ProductInfoCard,
    InventoryByBranchTable,
} from "@/components/InventoryDetail";
import { TableCrud } from "@/components/TableCrud";
import type { Column } from "@/components/TableCrud";
import {
    DetailContainer,
    HeaderSection,
    ProductHeader,
    ProductInfo,
    ProductCategories,
    CategoryChip,
    StatusChip,
    SummarySection,
    SummaryCard,
    SummaryCardContent,
    SummaryCardIcon,
    TabContent,
    GalleryContainer,
    GalleryImage,
    PackagesList,
    PackageItem,
    PackageIcon,
    PackageInfo,
    PackagePrice,
    PricingGrid,
    PricingItem,
} from "@/styles/inventario/detalle.styles";
import {
    MOCK_INVENTORY_DETAIL,
    MOCK_INVENTORY_SUMMARY,
    MOCK_BRANCH_INVENTORY,
    MOCK_SALES_DATA,
    MOCK_ACTIVITY_LOG,
    MOCK_SUPPLIERS,
    MOCK_PRICING_STRATEGY,
    MOCK_PACKAGES,
    MOCK_GALLERY,
} from "@/data/inventario.mockData";
import type { TabItem } from "@/components/Tabs";
import numeral from "numeral";
import { Typography } from "@mui/material";

// ============================================================================
// MOCK API FUNCTIONS
// ============================================================================

async function getInventoryDetail(sku: string) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return MOCK_INVENTORY_DETAIL;
}

async function getInventorySummary(sku: string) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return MOCK_INVENTORY_SUMMARY;
}

async function getBranchInventory(sku: string) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return MOCK_BRANCH_INVENTORY;
}

async function getSalesData(sku: string) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return MOCK_SALES_DATA;
}

async function getActivityLog(sku: string) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return MOCK_ACTIVITY_LOG;
}

async function getSuppliers(sku: string) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return MOCK_SUPPLIERS;
}

async function getPricingStrategy(sku: string) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return MOCK_PRICING_STRATEGY;
}

async function getPackages(sku: string) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return MOCK_PACKAGES;
}

async function getGallery(sku: string) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return MOCK_GALLERY;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function InventoryDetail() {
    const router = useRouter();
    const { sku } = router.query;

    const [activeTab, setActiveTab] = useState("inventory");
    const [loading, setLoading] = useState(true);
    const [inventoryDetail, setInventoryDetail] = useState(MOCK_INVENTORY_DETAIL);
    const [summary, setSummary] = useState(MOCK_INVENTORY_SUMMARY);
    const [branchInventory, setBranchInventory] = useState(MOCK_BRANCH_INVENTORY);
    const [salesData, setSalesData] = useState(MOCK_SALES_DATA);
    const [activityLog, setActivityLog] = useState(MOCK_ACTIVITY_LOG);
    const [suppliers, setSuppliers] = useState(MOCK_SUPPLIERS);
    const [pricingStrategy, setPricingStrategy] = useState(MOCK_PRICING_STRATEGY);
    const [packages, setPackages] = useState(MOCK_PACKAGES);
    const [gallery, setGallery] = useState(MOCK_GALLERY);

    // Load data
    useEffect(() => {
        if (!sku || typeof sku !== "string") return;

        const skuString = Array.isArray(sku) ? sku[0] : sku;

        async function loadData() {
            setLoading(true);
            try {
                const [
                    detail,
                    summaryData,
                    branchData,
                    sales,
                    activities,
                    suppliersData,
                    pricing,
                    packagesData,
                    galleryData,
                ] = await Promise.all([
                    getInventoryDetail(skuString),
                    getInventorySummary(skuString),
                    getBranchInventory(skuString),
                    getSalesData(skuString),
                    getActivityLog(skuString),
                    getSuppliers(skuString),
                    getPricingStrategy(skuString),
                    getPackages(skuString),
                    getGallery(skuString),
                ]);

                setInventoryDetail(detail);
                setSummary(summaryData);
                setBranchInventory(branchData);
                setSalesData(sales);
                setActivityLog(activities);
                setSuppliers(suppliersData);
                setPricingStrategy(pricing);
                setPackages(packagesData);
                setGallery(galleryData);
            } catch (err) {
                console.error("[InventoryDetail] Error loading data:", err);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [sku]);

    // Tabs configuration
    const tabs: TabItem[] = [
        { value: "inventory", label: "Inventario" },
        { value: "activity", label: "Actividad" },
        { value: "technical", label: "Ficha técnica" },
    ];

    // Breadcrumbs
    const breadcrumbs = [
        { label: "Inventario", href: "/inventario" },
        { label: inventoryDetail.name.length > 30 ? `${inventoryDetail.name.substring(0, 30)}...` : inventoryDetail.name },
    ];

    // General info fields
    const generalInfoFields = [
        { label: "Nombre corto", value: inventoryDetail.shortName },
        { label: "Descripción del artículo", value: inventoryDetail.description },
        { label: "Departamento", value: `${inventoryDetail.department.code} - ${inventoryDetail.department.name}` },
        { label: "Línea", value: `${inventoryDetail.line.code} - ${inventoryDetail.line.name}` },
        { label: "Garantía", value: inventoryDetail.warranty },
    ];

    // Suppliers table columns
    const suppliersColumns: Column<typeof suppliers[0]>[] = [
        {
            id: "supplierId",
            label: "ID",
            size: "md",
        },
        {
            id: "supplierName",
            label: "PROVEEDOR",
            size: "xl",
        },
        {
            id: "status",
            label: "ESTATUS",
            type: "chip",
            size: "sm",
            chipConfig: {
                principal: {
                    label: "Principal",
                    bgColor: "#FEF3C7",
                    textColor: "#92400E",
                },
                secondary: {
                    label: "Secundario",
                    bgColor: "#F3F4F6",
                    textColor: "#6B7280",
                },
            },
        },
    ];

    return (
        <MainLayout>
            <HeaderSection>
                <Breadcrumbs items={breadcrumbs} />
                <ProductHeader>
                    <ProductInfo>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {inventoryDetail.code}
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1.5, lineHeight: 1.3 }}>
                            {inventoryDetail.name}
                        </Typography>
                        <ProductCategories>
                            <CategoryChip
                                icon={<SettingsIcon />}
                                label={`${inventoryDetail.department.code} - ${inventoryDetail.department.name}`}
                                size="small"
                            />
                            <CategoryChip
                                icon={<LaundryIcon />}
                                label={`${inventoryDetail.line.code} - ${inventoryDetail.line.name}`}
                                size="small"
                            />
                            <StatusChip
                                status={inventoryDetail.status}
                                label={inventoryDetail.status === "active" ? "Activo" : "Inactivo"}
                            />
                        </ProductCategories>
                    </ProductInfo>
                </ProductHeader>
            </HeaderSection>

            <Tabs tabs={tabs} value={activeTab} onChange={setActiveTab} />

            <TabContent>
                {activeTab === "inventory" && (
                    <>
                        <SummarySection>
                            <SummaryCard>
                                <SummaryCardContent>
                                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5, lineHeight: 1.2 }}>
                                        {summary.inStock}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                                        Total en todas las sucursales.
                                    </Typography>
                                </SummaryCardContent>
                                <SummaryCardIcon>
                                    <GridViewIcon />
                                </SummaryCardIcon>
                            </SummaryCard>
                            <SummaryCard>
                                <SummaryCardContent>
                                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5, lineHeight: 1.2 }}>
                                        {summary.orders}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                                        Artículos solicitados a proveedores.
                                    </Typography>
                                </SummaryCardContent>
                                <SummaryCardIcon>
                                    <SyncIcon />
                                </SummaryCardIcon>
                            </SummaryCard>
                            <SummaryCard>
                                <SummaryCardContent>
                                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5, lineHeight: 1.2 }}>
                                        {summary.inTransit}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                                        Artículos con pedido activo
                                    </Typography>
                                </SummaryCardContent>
                                <SummaryCardIcon>
                                    <ShippingIcon />
                                </SummaryCardIcon>
                            </SummaryCard>
                            <SummaryCard>
                                <SummaryCardContent>
                                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5, lineHeight: 1.2, color: "#DC2626" }}>
                                        {summary.damaged}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                                        Requieren gestión especial
                                    </Typography>
                                </SummaryCardContent>
                                <SummaryCardIcon>
                                    <BuildIcon />
                                </SummaryCardIcon>
                            </SummaryCard>
                        </SummarySection>

                        <ProductInfoCard
                            title="Inventario por Sucursal"
                            subtitle="Distribución de existencias en cada ubicación"
                            showEditButton={false}
                        >
                            <InventoryByBranchTable data={branchInventory} loading={loading} />
                        </ProductInfoCard>
                    </>
                )}

                {activeTab === "activity" && (
                    <>
                        <SalesChart data={salesData} />
                        <ActivityLog activities={activityLog} />
                    </>
                )}

                {activeTab === "technical" && (
                    <>
                        <ProductInfoCard
                            title="Información general"
                            subtitle="Detalles completos del artículo"
                            fields={generalInfoFields}
                        />

                        <ProductInfoCard
                            title="Proveedores"
                            subtitle="Proveedores autorizados para este artículo"
                        >
                            <TableCrud
                                columns={suppliersColumns}
                                rows={suppliers}
                                loading={loading}
                                rowKey="id"
                                emptyMessage="No hay proveedores asignados"
                            />
                        </ProductInfoCard>

                        <ProductInfoCard
                            title="Estrategia de Precios"
                            subtitle="Configuración de precios y márgenes"
                        >
                            <PricingGrid>
                                <PricingItem>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                        Costo
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                        {numeral(pricingStrategy.cost).format("$0,0.00")}
                                    </Typography>
                                </PricingItem>
                                <PricingItem>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                        Precio de lista
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                        {numeral(pricingStrategy.listPrice).format("$0,0.00")}
                                    </Typography>
                                </PricingItem>
                                <PricingItem>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                        Riguroso contado
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                        {numeral(pricingStrategy.cashPrice).format("$0,0.00")}
                                    </Typography>
                                </PricingItem>
                            </PricingGrid>
                        </ProductInfoCard>

                        <ProductInfoCard
                            title="Galería"
                            subtitle="Imágenes del artículo"
                        >
                            <GalleryContainer>
                                {gallery.images.map((image, index) => (
                                    <GalleryImage key={index}>
                                        <img src={image} alt={`Product image ${index + 1}`} />
                                    </GalleryImage>
                                ))}
                            </GalleryContainer>
                        </ProductInfoCard>

                        <ProductInfoCard
                            title="Paquetes"
                            subtitle="Paquetes especiales"
                        >
                            <PackagesList>
                                {packages.map((pkg) => (
                                    <PackageItem key={pkg.id}>
                                        <PackageIcon>
                                            <BoxIcon />
                                        </PackageIcon>
                                        <PackageInfo>
                                            <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
                                                {pkg.articleName}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Cantidad: {pkg.quantity} Ult. precio:{" "}
                                                {numeral(pkg.lastPrice).format("$0,0.00")}
                                            </Typography>
                                        </PackageInfo>
                                        <PackagePrice>
                                            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
                                                Precio paquete:
                                            </Typography>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                {numeral(pkg.packagePrice).format("$0,0.00")}
                                            </Typography>
                                        </PackagePrice>
                                    </PackageItem>
                                ))}
                            </PackagesList>
                        </ProductInfoCard>
                    </>
                )}
            </TabContent>
        </MainLayout>
    );
}
