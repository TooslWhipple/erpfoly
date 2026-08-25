import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useAsyncEffect } from "@/hooks/useAsyncEffect";
import { fetchSupplierDashboard } from "@/services/supplierDashboard.service";
import type {
  SupplierDashboard,
  SupplierDashboardTab,
} from "@/types/supplierDashboard.types";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";

const DASHBOARD_TABS: { label: string; value: SupplierDashboardTab }[] = [
  { label: "Estados de cuenta", value: "account_statements" },
  { label: "Cargos", value: "charges" },
  { label: "Pagos a proveedor", value: "payments" },
  { label: "Mercancia dañada", value: "damaged_goods" },
];

function isSupplierDashboardTab(value: string): value is SupplierDashboardTab {
  return (
    value === "account_statements" ||
    value === "charges" ||
    value === "payments" ||
    value === "damaged_goods"
  );
}

export function useSupplierDashboard() {
  const router = useRouter();
  const rawId = router.query.id;
  const isReservedRoute = rawId === "nuevo" || rawId === "editar";
  const supplierId = typeof rawId === "string" && rawId.length > 0 && !isReservedRoute ? Number.parseInt(rawId, 10) : null;
  const validId = supplierId != null && !Number.isNaN(supplierId) ? supplierId : null;

  const [dashboard, setDashboard] = useState<SupplierDashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<SupplierDashboardTab>("account_statements");

  const loadDashboard = useCallback(
    async (isCancelled?: () => boolean) => {
      await Promise.resolve();
      if (isCancelled?.()) return;

      if (validId === null) {
        setDashboard(null);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await fetchSupplierDashboard(validId);
        if (isCancelled?.()) return;

        if (result.error) {
          setDashboard(null);
          setError(result.error.message);
        } else {
          setDashboard(result.data ?? null);
        }
      } finally {
        if (!isCancelled?.()) {
          setLoading(false);
        }
      }
    },
    [validId]
  );

  useAsyncEffect(
    async (isCancelled) => {
      await loadDashboard(isCancelled);
    },
    [loadDashboard]
  );

  const breadcrumbItems: BreadcrumbItem[] = useMemo(
    () => [
      { label: "Proveedores", href: "/catalogos/proveedores" },
      { label: dashboard?.supplierName ?? "Detalle" },
    ],
    [dashboard?.supplierName]
  );

  const handleTabChange = (value: string) => {
    if (isSupplierDashboardTab(value)) {
      setActiveTab(value);
    }
  };

  const handleEdit = () => {
    if (validId == null) return;
    router.push(`/catalogos/proveedores/${validId}/editar`);
  };

  const showLoading = !router.isReady || loading || (dashboard == null && !error);

  return {
    routerReady: router.isReady,
    validId,
    dashboard,
    loading: showLoading,
    error,
    activeTab,
    tabs: DASHBOARD_TABS,
    breadcrumbItems,
    handleTabChange,
    handleEdit,
    refetchDashboard: loadDashboard,
  };
}
