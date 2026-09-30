import { useMemo } from "react";
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
  const branchId = useMemo(() => {
    const value = Array.isArray(sucursalIdRaw)
      ? sucursalIdRaw[0]
      : sucursalIdRaw;
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [sucursalIdRaw]);

  const {
    branch,
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
  } = usePhysicalInventoryScan(branchId);

  const breadcrumbs: BreadcrumbItem[] = useMemo(
    () => [
      { label: "Inventarios", href: "/inventario-fisico" },
      { label: branch?.name ?? "Sucursal" },
      { label: "Nuevo" },
    ],
    [branch?.name],
  );

  const handleBack = () => {
    void router.push("/inventario-fisico");
  };

  const handleFinish = () => {
    if (!branchId || !branch || reviewedItems.length === 0) return;

    const draft: PhysicalInventoryScanDraft = {
      branchId,
      branchName: branch.name,
      captureMethod: "device_camera",
      capturedAt: new Date().toISOString(),
      responsibleUser: user?.name ?? "Usuario",
      items: reviewedItems,
    };
    sessionStorage.setItem(PHYSICAL_INVENTORY_DRAFT_KEY, JSON.stringify(draft));
    void router.push("/inventario-fisico/nuevo/confirmar");
  };

  if (!router.isReady) {
    return (
      <Stack alignItems="center" justifyContent="center" minHeight={320}>
        <CircularProgress />
      </Stack>
    );
  }

  if (!branchId) {
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
          Debes seleccionar una sucursal para iniciar el inventario físico.
        </Typography>
        <Button variant="contained" onClick={handleBack}>
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
          onClick={handleFinish}
          disabled={isLoading || reviewedItems.length === 0}>
          Finalizar escaneo
        </Button>
      </Stack>

      <Typography variant="h5" fontWeight={700}>Nuevo inventario</Typography>
      <Divider />

      <Stack
        direction={{ xs: "column", lg: "row" }}
        spacing={2}
        alignItems="stretch">
        <Stack spacing={2} sx={{ width: { xs: "100%", lg: 360 }, flexShrink: 0 }}>
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
            spacing={2}>
            <Stack spacing={0.25}>
              <Typography variant="h6" fontWeight={700}>Artículos a verificar</Typography>
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
