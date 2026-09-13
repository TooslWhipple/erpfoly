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
  PhysicalInventoryScanItemRow,
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
    items,
    filteredItems,
    search,
    setSearch,
    isLoading,
    updateCountedQuantity,
    handleCodeScanned,
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
    if (!branchId || !branch) return;

    const draft: PhysicalInventoryScanDraft = {
      branchId,
      branchName: branch.name,
      captureMethod: "device_camera",
      capturedAt: new Date().toISOString(),
      responsibleUser: user?.name ?? "Usuario",
      items,
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
          disabled={isLoading || items.length === 0}>
          Finalizar escaneo
        </Button>
      </Stack>

      <Typography variant="h5" fontWeight={700}>Nuevo inventario</Typography>
      <Divider />

      <Stack
        direction={{ xs: "column", lg: "row" }}
        spacing={2}
        alignItems="stretch">
        <Card sx={{ width: { xs: "100%", lg: 360 }, flexShrink: 0 }}>
          <PhysicalInventoryScanner onCodeScanned={handleCodeScanned} />
        </Card>

        <Card sx={{ flex: 1, minWidth: 0 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", sm: "center" }}
            spacing={2}>
            <Typography variant="h6" fontWeight={700}>Artículos a verificar</Typography>
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
          ) : filteredItems.length === 0 ? (
            <Stack alignItems="center" justifyContent="center" minHeight={240}>
              <Typography color="text.secondary">
                No hay artículos para mostrar
              </Typography>
            </Stack>
          ) : (
            <Stack
              sx={{
                maxHeight: { lg: "calc(100vh - 260px)" },
                overflowY: "auto",
              }}
            >
              <Stack
                direction="row"
                spacing={1.5}
                sx={{ px: 1, pb: 1 }}
                alignItems="center"
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ width: 18 }}
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ minWidth: 36, textAlign: "center" }}
                >
                  Cant.
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ flex: 1 }}
                >
                  Artículo
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ width: 96, textAlign: "center" }}
                >
                  Inventario
                </Typography>
              </Stack>
              {filteredItems.map((item) => (
                <PhysicalInventoryScanItemRow
                  key={item.productId}
                  item={item}
                  onChangeQuantity={updateCountedQuantity}
                />
              ))}
            </Stack>
          )}
        </Card>
      </Stack>
    </Stack>
  );
}
