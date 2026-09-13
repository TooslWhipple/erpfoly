import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  Button,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { Breadcrumbs, TabFilters } from "@/components";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import type { TabOption } from "@/components/TabFilters";
import {
  PhysicalInventoryCaptureDataView,
  PhysicalInventorySummaryView,
} from "@/components/PhysicalInventory";
import { createPhysicalInventory } from "@/services/physical-inventory.service";
import { computePhysicalInventorySummary } from "@/utils/physical-inventory";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import {
  PHYSICAL_INVENTORY_DRAFT_KEY,
  type PhysicalInventoryScanDraft,
} from "@/types/physical-inventory.types";

type ConfirmTab = "resumen" | "datos";

const CONFIRM_TABS: TabOption[] = [
  { label: "Resumen", value: "resumen" },
  { label: "Datos sobre la captura", value: "datos" },
];

export default function ConfirmarInventarioFisicoPage() {
  const router = useRouter();
  const { showError, showSuccess } = useSnackbarStore();
  const [draft, setDraft] = useState<PhysicalInventoryScanDraft | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "empty" | "saving">(
    "loading",
  );
  const [activeTab, setActiveTab] = useState<ConfirmTab>("resumen");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = sessionStorage.getItem(PHYSICAL_INVENTORY_DRAFT_KEY);
    if (!stored) {
      setStatus("empty");
      return;
    }
    try {
      const parsed = JSON.parse(stored) as PhysicalInventoryScanDraft;
      if (!parsed?.items?.length || !parsed.branchId) {
        setStatus("empty");
        return;
      }
      setDraft(parsed);
      setStatus("ready");
    } catch {
      setStatus("empty");
    }
  }, []);

  const summary = useMemo(
    () => computePhysicalInventorySummary(draft?.items ?? []),
    [draft?.items],
  );

  const breadcrumbs: BreadcrumbItem[] = useMemo(
    () => [
      { label: "Inventarios", href: "/inventario-fisico" },
      { label: draft?.branchName ?? "Sucursal" },
      { label: "Confirmar" },
    ],
    [draft?.branchName],
  );

  const handleBack = () => {
    if (!draft) {
      void router.push("/inventario-fisico");
      return;
    }
    void router.push({
      pathname: "/inventario-fisico/nuevo",
      query: { sucursalId: String(draft.branchId) },
    });
  };

  const handleSave = async () => {
    if (!draft) return;
    setStatus("saving");
    const result = await createPhysicalInventory({
      branchId: draft.branchId,
      captureMethod: draft.captureMethod,
      capturedAt: draft.capturedAt,
      items: draft.items.map((item) => ({
        productId: item.productId,
        systemQuantity: item.systemQuantity,
        countedQuantity: item.countedQuantity,
        wasScanned: item.wasScanned,
        isSurplus: item.isSurplus,
      })),
    });

    if (result.error) {
      setStatus("ready");
      showError(result.error.message);
      return;
    }

    sessionStorage.removeItem(PHYSICAL_INVENTORY_DRAFT_KEY);
    showSuccess("Inventario físico guardado correctamente");
    void router.push("/inventario-fisico");
  };

  if (status === "loading") {
    return (
      <Stack alignItems="center" justifyContent="center" minHeight={320}>
        <CircularProgress />
      </Stack>
    );
  }

  if (status === "empty" || !draft) {
    return (
      <Stack spacing={2}>
        <Breadcrumbs
          items={[
            { label: "Inventarios", href: "/inventario-fisico" },
            { label: "Confirmar" },
          ]}
          showBackButton
          onBack={() => void router.push("/inventario-fisico")}
        />
        <Typography variant="h5" fontWeight={700}>Confirmar inventario</Typography>
        <Divider />
        <Typography color="text.secondary">No hay un inventario en progreso para confirmar.</Typography>
        <Button
          variant="contained"
          onClick={() => void router.push("/inventario-fisico")}>
          Volver al listado
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={2}>
        <Breadcrumbs items={breadcrumbs} showBackButton onBack={handleBack} />
        <Button
          variant="contained"
          color="primary"
          onClick={() => void handleSave()}
          disabled={status === "saving"}>
          {status === "saving" ? "Guardando..." : "Confirmar y guardar"}
        </Button>
      </Stack>

      <Typography variant="h5" fontWeight={700}>Confirmar inventario</Typography>
      <Divider />

      <TabFilters
        tabs={CONFIRM_TABS}
        activeTab={activeTab}
        onTabChange={(value) => setActiveTab(value as ConfirmTab)}
      />

      {
        activeTab === "resumen"
          ? <PhysicalInventorySummaryView summary={summary} />
          : <PhysicalInventoryCaptureDataView
            responsibleUser={draft.responsibleUser}
            capturedAt={draft.capturedAt}
            branchName={draft.branchName}
            captureMethod={draft.captureMethod}
          />
      }
    </Stack>
  );
}
