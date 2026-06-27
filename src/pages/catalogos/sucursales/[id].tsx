import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { Stack, Chip, Typography, Button } from "@mui/material";
import { Plus } from "lucide-react";
import { MainLayout, Breadcrumbs, Tabs, TabFilters, StatusChip } from "@/components";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import { SalesTab, GoalsTab, PromotionsTab, SettingsTab } from "@/components/BranchDetailTabs";
import { getBranch } from "@/services/branchDetail.service";
import type { Branch } from "@/types/sucursales.types";
import { usePermissions } from "@/hooks/usePermissions";
import { CATALOG_PROMOTIONS_CREATE } from "@/lib/permissions";

const TAB_VENTAS = "ventas";
const TAB_METAS = "metas";
const TAB_PROMOCIONES = "promociones";
const TAB_CONFIGURACIONES = "configuraciones";

const TABS = [
  { value: TAB_VENTAS, label: "Ventas" },
  { value: TAB_METAS, label: "Metas" },
  { value: TAB_PROMOCIONES, label: "Promociones" },
  { value: TAB_CONFIGURACIONES, label: "Configuraciones" },
];

export default function BranchDetailPage() {
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const { id } = router.query;
  const branchId = Number(id);

  const [branch, setBranch] = useState<Branch | null>(null);
  const [activeTab, setActiveTab] = useState(TAB_VENTAS);
  const [newPromotionModalOpen, setNewPromotionModalOpen] = useState(false);

  const loadBranch = useCallback(async () => {
    if (!branchId || isNaN(branchId)) return;
    const data = await getBranch(branchId);
    setBranch(data);
  }, [branchId]);

  useEffect(() => {
    loadBranch();
  }, [loadBranch]);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Sucursales", href: "/catalogos/sucursales" },
    { label: branch?.name ?? branch?.city ?? "Cargando..." },
  ];

  const tabRightContent =
    activeTab === TAB_PROMOCIONES && hasPermission(CATALOG_PROMOTIONS_CREATE) ? (
      <Button
        variant="contained"
        size="small"
        startIcon={<Plus size={16} />}
        onClick={() => setNewPromotionModalOpen(true)}
      >
        Nueva promoción
      </Button>
    ) : null;

  const renderTabContent = () => {
    if (!branchId || isNaN(branchId)) {
      return (
        <Stack alignItems="center" justifyContent="center" minHeight={200}>
          <Typography variant="body2" color="text.secondary">
            Cargando...
          </Typography>
        </Stack>
      );
    }

    switch (activeTab) {
      case TAB_VENTAS:
        return <SalesTab branchId={branchId} />;
      case TAB_METAS:
        return <GoalsTab branchId={branchId} />;
      case TAB_PROMOCIONES:
        return (
          <PromotionsTab
            branchId={branchId}
            openNewPromotionModal={newPromotionModalOpen}
            onCloseNewPromotionModal={() => setNewPromotionModalOpen(false)}
          />
        );
      case TAB_CONFIGURACIONES:
        return <SettingsTab branchId={branchId} onSaved={loadBranch} />;
      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <Stack spacing={3}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Breadcrumbs items={breadcrumbItems} showBackButton />
          {
            branch &&
            <StatusChip
              variant={(branch.status) === "active" ? "success" : "pending"}
              label={(branch.status) === "active" ? "Activo" : "Inactivo"}
            />
          }
        </Stack>

        <Typography variant="h2" component="h1">
          {branch?.name ?? branch?.city ?? "Sucursal"}
        </Typography>

        <TabFilters
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {renderTabContent()}
      </Stack>
    </MainLayout>
  );
}
