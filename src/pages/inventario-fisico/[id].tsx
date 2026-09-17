import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Breadcrumbs, TabFilters } from "@/components";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import type { TabOption } from "@/components/TabFilters";
import {
  PhysicalInventoryCaptureDataView,
  PhysicalInventorySummaryView,
} from "@/components/PhysicalInventory";
import { getPhysicalInventoryDetail } from "@/services/physical-inventory.service";
import { computePhysicalInventorySummary } from "@/utils/physical-inventory";

type DetailTab = "resumen" | "datos";

const DETAIL_TABS: TabOption[] = [
  { label: "Resumen", value: "resumen" },
  { label: "Datos sobre la captura", value: "datos" },
];

export default function InventarioFisicoDetailPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<DetailTab>("resumen");
  const id = Array.isArray(router.query.id)
    ? router.query.id[0]
    : router.query.id;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["physical-inventory-detail", id],
    queryFn: async () => {
      if (!id) return null;
      const result = await getPhysicalInventoryDetail(id);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    enabled: Boolean(id),
  });

  const summary = useMemo(
    () => computePhysicalInventorySummary(data?.items ?? []),
    [data?.items],
  );

  const breadcrumbs: BreadcrumbItem[] = useMemo(
    () => [
      { label: "Inventarios", href: "/inventario-fisico" },
      { label: data?.branch.name ?? "Sucursal" },
      { label: data ? `#${data.id}` : "Detalle" },
    ],
    [data],
  );

  const handleBack = () => {
    void router.push("/inventario-fisico");
  };

  if (!router.isReady || isLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" minHeight={320}>
        <CircularProgress />
      </Stack>
    );
  }

  if (isError || !data) {
    return (
      <Stack spacing={2}>
        <Breadcrumbs
          items={[
            { label: "Inventarios", href: "/inventario-fisico" },
            { label: "Detalle" },
          ]}
          showBackButton
          onBack={handleBack}
        />
        <Typography variant="h5" fontWeight={700}>
          Inventario físico
        </Typography>
        <Divider />
        <Typography color="text.secondary">
          {error instanceof Error
            ? error.message
            : "No se pudo cargar el detalle del inventario."}
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <Breadcrumbs items={breadcrumbs} showBackButton onBack={handleBack} />

      <Typography variant="h5" fontWeight={700}>
        Inventario #{data.id}
      </Typography>
      <Divider />

      <TabFilters
        tabs={DETAIL_TABS}
        activeTab={activeTab}
        onTabChange={(value) => setActiveTab(value as DetailTab)}
        layout="contained"
      />

      {activeTab === "resumen" ? (
        <PhysicalInventorySummaryView summary={summary} />
      ) : (
        <PhysicalInventoryCaptureDataView
          responsibleUser={data.responsibleUser}
          capturedAt={data.capturedAt}
          branchName={data.branch.name}
          captureMethod={data.captureMethod}
        />
      )}
    </Stack>
  );
}
