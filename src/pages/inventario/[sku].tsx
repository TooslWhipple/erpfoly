import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/router";
import {
  Settings as SettingsIcon,
  LocalLaundryService as LaundryIcon,
} from "@mui/icons-material";
import { Breadcrumbs, TabFilters } from "@/components";
import { CategoryChip, StatusChip } from "@/styles/inventario/detalle.styles";
import type {
  ActivityLogEntry,
  BranchInventory,
  InventoryDetail,
  InventorySummary,
  PricingStrategy,
  ProductGallery,
  ProductPackage,
  ProductSupplier,
  SalesBranchConfig,
  SalesData,
} from "@/types/inventario.types";
import type { TabItem } from "@/components/Tabs";
import { Stack, Typography, Skeleton } from "@mui/material";
import {
  InventoryTab,
  ActivityTab,
  TechnicalTab,
  ConfigurationsTab,
} from "./sku-tabs";
import {
  getInventoryActivity,
  getInventoryDetail,
  getInventoryProductExtras,
  getInventorySales,
} from "@/services/inventory.service";
import { updateProductBranchesAvailability } from "@/services/productos.service";
import { useSnackbarStore } from "@/store/useSnackbarStore";

const EMPTY_SUMMARY: InventorySummary = {
  inStock: 0,
  orders: 0,
  inTransit: 0,
  damaged: 0,
};

const EMPTY_SALES: SalesData = {
  lastMonth: 0,
  previousMonth: 0,
  percentageChange: 0,
  monthlyData: [],
};

const EMPTY_PRICING: PricingStrategy = {
  cost: 0,
  listPrice: 0,
  cashPrice: 0,
};

const EMPTY_GALLERY: ProductGallery = { images: [] };

export default function InventoryDetailPage() {
  const router = useRouter();
  const { sku } = router.query;
  const skuStr = useMemo(() => {
    const raw =
      typeof sku === "string" ? sku : Array.isArray(sku) ? sku[0] : undefined;
    if (!raw?.trim()) return undefined;
    return decodeURIComponent(raw).trim();
  }, [sku]);

  return <InventoryDetailContent sku={skuStr} />;
}

function InventoryDetailContent({ sku }: { sku: string | undefined }) {
  const router = useRouter();
  const showError = useSnackbarStore((s) => s.showError);
  const showSuccess = useSnackbarStore((s) => s.showSuccess);
  const [activeTab, setActiveTab] = useState("inventory");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [inventoryDetail, setInventoryDetail] = useState<InventoryDetail | null>(
    null,
  );
  const [summary, setSummary] = useState<InventorySummary>(EMPTY_SUMMARY);
  const [branchInventory, setBranchInventory] = useState<BranchInventory[]>([]);
  const [salesData, setSalesData] = useState<SalesData>(EMPTY_SALES);
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
  const [suppliers, setSuppliers] = useState<ProductSupplier[]>([]);
  const [pricingStrategy, setPricingStrategy] =
    useState<PricingStrategy>(EMPTY_PRICING);
  const [packages, setPackages] = useState<ProductPackage[]>([]);
  const [gallery, setGallery] = useState<ProductGallery>(EMPTY_GALLERY);
  const [salesBranches, setSalesBranches] = useState<SalesBranchConfig[]>([]);
  const [savingBranchIds, setSavingBranchIds] = useState<string[]>([]);

  useEffect(() => {
    if (!sku) return;

    let cancelled = false;

    async function loadData(skuValue: string) {
      setLoading(true);
      setNotFound(false);
      try {
        const detailResult = await getInventoryDetail(skuValue);
        if (cancelled) return;

        if (detailResult.error || detailResult.data === null) {
          setNotFound(true);
          return;
        }

        const mapped = detailResult.data;
        setInventoryDetail(mapped.inventoryDetail);
        setSummary(mapped.summary);
        setBranchInventory(mapped.branchInventory);

        const avgPrice =
          mapped.branchInventory.length > 0
            ? mapped.branchInventory.reduce((s, b) => s + b.price, 0) /
              mapped.branchInventory.length
            : 0;

        const productId = Number(mapped.inventoryDetail.id);

        const [salesResult, activityResult, extrasResult] = await Promise.all([
          getInventorySales(skuValue),
          getInventoryActivity(skuValue, { page: 1, limit: 50 }),
          Number.isFinite(productId) && productId > 0
            ? getInventoryProductExtras(productId, avgPrice)
            : Promise.resolve({ data: null, error: null }),
        ]);

        if (cancelled) return;

        if (salesResult.data) {
          setSalesData(salesResult.data);
        }
        if (activityResult.data) {
          setActivityLog(activityResult.data.rows);
        }
        if (extrasResult.data) {
          setSuppliers(extrasResult.data.suppliers);
          setPricingStrategy(extrasResult.data.pricingStrategy);
          setPackages(extrasResult.data.packages);
          setGallery(extrasResult.data.gallery);
          setSalesBranches(extrasResult.data.salesBranches);
        }
      } catch (err) {
        console.error("[InventoryDetail] Error loading data:", err);
        if (!cancelled) {
          setNotFound(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData(sku);
    return () => {
      cancelled = true;
    };
  }, [sku]);

  useEffect(() => {
    if (notFound) {
      router.replace("/inventario");
    }
  }, [notFound, router]);

  const handleBranchToggle = useCallback(
    async (branchId: string, enabled: boolean) => {
      const productId = Number(inventoryDetail?.id);
      if (!Number.isFinite(productId) || productId <= 0) {
        showError("No se pudo identificar el producto");
        return;
      }

      const previous = salesBranches;
      setSalesBranches((prev) =>
        prev.map((b) =>
          b.id === branchId
            ? {
                ...b,
                enabled,
              }
            : b,
        ),
      );
      setSavingBranchIds((prev) =>
        prev.includes(branchId) ? prev : [...prev, branchId],
      );

      const result = await updateProductBranchesAvailability(productId, [
        { branchId: Number(branchId), isAvailable: enabled },
      ]);

      setSavingBranchIds((prev) => prev.filter((id) => id !== branchId));

      if (result.error || result.data === null) {
        setSalesBranches(previous);
        showError(
          result.error?.message ??
            "No se pudo actualizar la sucursal de venta",
        );
        return;
      }

      showSuccess(
        enabled
          ? "Sucursal habilitada para venta"
          : "Sucursal deshabilitada para venta",
      );
    },
    [inventoryDetail?.id, salesBranches, showError, showSuccess],
  );

  const handleToggleAllBranches = useCallback(async () => {
    const productId = Number(inventoryDetail?.id);
    if (!Number.isFinite(productId) || productId <= 0) {
      showError("No se pudo identificar el producto");
      return;
    }
    if (salesBranches.length === 0) return;

    const enableAll = !salesBranches.every((b) => b.enabled);
    const previous = salesBranches;
    const allIds = salesBranches.map((b) => b.id);

    setSalesBranches((prev) =>
      prev.map((b) => ({
        ...b,
        enabled: enableAll,
      })),
    );
    setSavingBranchIds(allIds);

    const result = await updateProductBranchesAvailability(
      productId,
      salesBranches.map((b) => ({
        branchId: Number(b.id),
        isAvailable: enableAll,
      })),
    );

    setSavingBranchIds([]);

    if (result.error || result.data === null) {
      setSalesBranches(previous);
      showError(
        result.error?.message ??
          "No se pudo actualizar las sucursales de venta",
      );
      return;
    }

    showSuccess(
      enableAll
        ? "Todas las sucursales habilitadas"
        : "Todas las sucursales deshabilitadas",
    );
  }, [inventoryDetail?.id, salesBranches, showError, showSuccess]);

  const tabs: TabItem[] = [
    { value: "inventory", label: "Inventario" },
    { value: "activity", label: "Actividad" },
    { value: "configurations", label: "Configuraciones" },
    { value: "technical", label: "Ficha técnica" },
  ];

  if (!sku || loading || !inventoryDetail) {
    return (
      <Stack spacing={3}>
        <Skeleton variant="text" width={200} height={28} />
        <Skeleton variant="text" width="60%" height={36} />
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
      </Stack>
    );
  }

  const breadcrumbs = [
    {
      label: "Inventario",
      href: "/inventario",
    },
    {
      label:
        inventoryDetail.name.length > 30
          ? `${inventoryDetail.name.substring(0, 30)}...`
          : inventoryDetail.name,
    },
  ];

  return (
    <Stack spacing={3}>
      <Breadcrumbs items={breadcrumbs} />

      <Stack spacing={0.5}>
        <Typography variant="body2" color="text.secondary">
          {inventoryDetail.code}
        </Typography>
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

      {activeTab === "inventory" && (
        <InventoryTab
          summary={summary}
          branchInventory={branchInventory}
          loading={loading}
        />
      )}
      {activeTab === "activity" && (
        <ActivityTab salesData={salesData} activityLog={activityLog} />
      )}
      {activeTab === "configurations" && (
        <ConfigurationsTab
          branches={salesBranches}
          loading={loading}
          savingBranchIds={savingBranchIds}
          onBranchToggle={handleBranchToggle}
          onToggleAll={handleToggleAllBranches}
        />
      )}
      {activeTab === "technical" && (
        <TechnicalTab
          productId={inventoryDetail.id}
          inventoryDetail={inventoryDetail}
          suppliers={suppliers}
          pricingStrategy={pricingStrategy}
          packages={packages}
          gallery={gallery}
          loading={loading}
        />
      )}
    </Stack>
  );
}
