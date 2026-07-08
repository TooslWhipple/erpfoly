import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Settings as SettingsIcon, LocalLaundryService as LaundryIcon } from "@mui/icons-material";
import { Breadcrumbs, TabFilters } from "@/components";
import {
    CategoryChip,
    StatusChip,
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
    getSalesBranchesConfig,
} from "@/data/inventario.mockData";
import type { SalesBranchConfig } from "@/types/inventario.types";
import type { TabItem } from "@/components/Tabs";
import { Stack, Typography } from "@mui/material";
import { InventoryTab, ActivityTab, TechnicalTab, ConfigurationsTab } from "./sku-tabs";

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

async function getSalesBranches(sku: string) {
    return getSalesBranchesConfig(sku);
}

export default function InventoryDetail() {
    const router = useRouter();
    const { sku } = router.query;
    const skuStr = typeof sku === "string" ? sku : Array.isArray(sku) ? sku[0] : undefined;

    return <InventoryDetailContent sku={skuStr} />;
}

function InventoryDetailContent({ sku }: { sku: string | undefined }) {
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
    const [salesBranches, setSalesBranches] = useState<SalesBranchConfig[]>([]);

    useEffect(() => {
        const skuVal = sku;
        if (!skuVal) return;

        async function loadData(skuString: string) {
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
                    branchesData,
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
                    getSalesBranches(skuString),
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
                setSalesBranches(branchesData);
            } catch (err) {
                console.error("[InventoryDetail] Error loading data:", err);
            } finally {
                setLoading(false);
            }
        }

        loadData(skuVal);
    }, [sku]);

    const handleBranchToggle = (branchId: string, enabled: boolean) => {
        setSalesBranches((prev) =>
            prev.map((b) => (b.id === branchId ? { ...b, enabled } : b))
        );
    };

    const tabs: TabItem[] = [
        { value: "inventory", label: "Inventario" },
        { value: "activity", label: "Actividad" },
        { value: "configurations", label: "Configuraciones" },
        { value: "technical", label: "Ficha técnica" },
    ];

    const breadcrumbs = [
        { label: "Inventario", href: "/inventario" },
        { label: inventoryDetail.name.length > 30 ? `${inventoryDetail.name.substring(0, 30)}...` : inventoryDetail.name },
    ];

    return (
        <>
            <Stack spacing={3}>
                <Breadcrumbs items={breadcrumbs} />

                <Stack spacing={0.5}>
                    <Typography variant="body2" color="text.secondary">{inventoryDetail.code}</Typography>
                    <Typography variant="h5">{inventoryDetail.name}</Typography>
                    <Stack direction="row" spacing={2}>
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
                    </Stack>
                </Stack>

                <TabFilters
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />

                {
                    activeTab === "inventory" &&
                    <InventoryTab
                        summary={summary}
                        branchInventory={branchInventory}
                        loading={loading}
                    />
                }
                {
                    activeTab === "activity" &&
                    <ActivityTab salesData={salesData} activityLog={activityLog} />
                }
                {
                    activeTab === "configurations" &&
                    <ConfigurationsTab
                        branches={salesBranches}
                        loading={loading}
                        onBranchToggle={handleBranchToggle}
                    />
                }
                {
                    activeTab === "technical" &&
                    <TechnicalTab
                        inventoryDetail={inventoryDetail}
                        suppliers={suppliers}
                        pricingStrategy={pricingStrategy}
                        packages={packages}
                        gallery={gallery}
                        loading={loading}
                    />
                }
            </Stack>
        </>
    );
}
