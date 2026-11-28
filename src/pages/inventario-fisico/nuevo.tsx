import { useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import {
  Button,
  CircularProgress,
  Divider,
  InputAdornment,
  Stack,
  Typography,
} from "@mui/material";
import { Search } from "lucide-react";
import { Breadcrumbs } from "@/components";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import {
  Card,
  PhysicalInventoryLastScannedCard,
  PhysicalInventoryScanList,
  PhysicalInventoryScanner,
} from "@/components/PhysicalInventory";
import { FormTextField } from "@/components/Form";
import { usePhysicalInventoryScan } from "@/hooks/physical-inventory/usePhysicalInventoryScan";
import { useAuthStore } from "@/store/useAuthStore";
import {
  PHYSICAL_INVENTORY_DRAFT_KEY,
  type PhysicalInventoryScanDraft,
} from "@/types/physical-inventory.types";
import { theme } from "@/styles/theme";

export default function NuevoInventarioFisicoPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const sucursalIdRaw = router.query.sucursalId;
  const sessionIdRaw = router.query.sessionId;

  const branchId = useMemo(() => {
    const value = Array.isArray(sucursalIdRaw)
      ? sucursalIdRaw[0]
      : sucursalIdRaw;
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [sucursalIdRaw]);

  const sessionId = useMemo(() => {
    const value = Array.isArray(sessionIdRaw)
      ? sessionIdRaw[0]
      : sessionIdRaw;
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [sessionIdRaw]);

  const {
    branch,
    zoneName,
    sessionLocked,
    syncStatus,
    isFinishing,
    finishScan,
    visibleItems,
    reviewedItems,
    catalogTotal,
    lastScanned,
    search,
    setSearch,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    updateCountedQuantity,
    handleCodeScanned,
    removeLastScanned,
  } = usePhysicalInventoryScan(branchId, sessionId);

  useEffect(() => {
    if (!sessionLocked || !sessionId) return;
    void router.replace(`/inventario-fisico/${sessionId}`);
  }, [router, sessionId, sessionLocked]);

  const breadcrumbs: BreadcrumbItem[] = useMemo(
    () => [
      { label: "Inventarios", href: "/inventario-fisico" },
      { label: branch?.name ?? "Sucursal" },
      { label: zoneName ?? "Captura" },
    ],
    [branch?.name, zoneName],
  );

  const handleBack = () => {
    void router.push("/inventario-fisico");
  };

  const handleFinish = async () => {
    if (!branchId || !branch || !sessionId || reviewedItems.length === 0) {
      return;
    }

    const synced = await finishScan();
    if (!synced) return;

    const draft: PhysicalInventoryScanDraft = {
      sessionId,
      branchId,
      branchName: branch.name,
      zoneName: zoneName ?? "Captura",
      captureMethod: "device_camera",
      capturedAt: new Date().toISOString(),
      responsibleUser: user?.name ?? "Usuario",
      items: reviewedItems,
    };
    sessionStorage.setItem(PHYSICAL_INVENTORY_DRAFT_KEY, JSON.stringify(draft));
    void router.push("/inventario-fisico/nuevo/confirmar");
  };

  const finishDisabled =
    isLoading || isFinishing || reviewedItems.length === 0;

  if (!router.isReady) {
    return (
      <Stack alignItems="center" justifyContent="center" minHeight={320}>
        <CircularProgress />
      </Stack>
    );
  }

  if (!branchId || !sessionId) {
    return (
      <Stack spacing={2}>
        <Breadcrumbs
          items={[
            { label: "Inventarios", href: "/inventario-fisico" },
            { label: "Nuevo" },
          ]}
          showBackButton
          onBack={handleBack}
        />
        <Typography color="text.secondary">
          Debes iniciar una sesión de inventario desde el listado (sucursal y
          zona).
        </Typography>
        <Button variant="contained" onClick={handleBack}>
          Volver al listado
        </Button>
      </Stack>
    );
  }

  if (sessionLocked) {
    return (
      <Stack alignItems="center" justifyContent="center" minHeight={320}>
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={2}
      >
        <Breadcrumbs items={breadcrumbs} showBackButton onBack={handleBack} />
        <Button
          variant="contained"
          color="primary"
          onClick={() => void handleFinish()}
          disabled={finishDisabled}
          startIcon={
            isFinishing ? (
              <CircularProgress size={18} color="inherit" />
            ) : undefined
          }
        >
          {isFinishing ? "Guardando…" : "Finalizar escaneo"}
        </Button>
      </Stack>

      <Typography variant="h5" fontWeight={700}>
        {branch?.name ?? "Sucursal"}
        {zoneName ? ` · ${zoneName}` : ""}
      </Typography>
      <Divider />

      <Stack
        direction={{ xs: "column", lg: "row" }}
        spacing={2}
        alignItems="stretch"
      >
        <Stack
          spacing={2}
          sx={{ width: { xs: "100%", lg: 360 }, flexShrink: 0 }}
        >
          <Card>
            <PhysicalInventoryScanner onCodeScanned={handleCodeScanned} />
          </Card>
          {lastScanned ? (
            <PhysicalInventoryLastScannedCard
              product={lastScanned}
              onRemove={removeLastScanned}
            />
          ) : null}
        </Stack>

        <Card sx={{ flex: 1, minWidth: 0 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", sm: "center" }}
            spacing={2}
          >
            <Stack spacing={0.25}>
              <Typography variant="h6" fontWeight={700}>
                Artículos a verificar
              </Typography>
              {!isLoading && catalogTotal > 0 && (
                <Typography variant="caption" color="text.secondary">
                  {visibleItems.length} de {catalogTotal} cargados ·{" "}
                  {reviewedItems.length} revisados
                </Typography>
              )}
            </Stack>
            <FormTextField
              placeholder="Buscar"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              size="small"
              fullWidth={false}
              sx={{ width: { xs: "100%", sm: 240 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={16} color={theme.palette.text.secondary} />
                  </InputAdornment>
                ),
              }}
            />
          </Stack>

          {isLoading ? (
            <Stack alignItems="center" justifyContent="center" minHeight={240}>
              <CircularProgress />
            </Stack>
          ) : visibleItems.length === 0 ? (
            <Stack alignItems="center" justifyContent="center" minHeight={240}>
              <Typography color="text.secondary">
                No hay artículos para mostrar
              </Typography>
            </Stack>
          ) : (
            <PhysicalInventoryScanList
              items={visibleItems}
              onChangeQuantity={updateCountedQuantity}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              onLoadMore={fetchNextPage}
            />
          )}
        </Card>
      </Stack>
    </Stack>
  );
}
