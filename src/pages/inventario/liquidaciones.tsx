import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { Typography, Box, Skeleton, Stack } from "@mui/material";
import {
  FilterList as FilterListIcon,
  InfoOutlined as InfoIcon,
  ViewModule as InventoryIcon,
} from "@mui/icons-material";
import {
  MainLayout,
  Title,
  StatsCardGroup,
  DepartmentCard,
  PriceSuggestionsSidebar,
  ConfirmPriceChangeModal,
} from "@/components";
import type { StatsCardData } from "@/components/StatsCard";
import type { PriceSuggestionItem } from "@/types/liquidaciones.types";
import {
  getLowRotationStrategy,
  applyPriceSuggestion,
} from "@/data/liquidaciones.mockData";
import {
  PageContent,
  SidebarPanel,
  DepartmentsList,
} from "@/styles/inventario/liquidaciones.styles";
import { useSnackbarStore } from "@/store/useSnackbarStore";

// ============================================================================
// TYPES
// ============================================================================

type PageState = "loading" | "success" | "empty" | "error";

// ============================================================================
// PAGE
// ============================================================================

export default function LiquidacionesPage() {
  const router = useRouter();
  const showSuccess = useSnackbarStore((s) => s.showSuccess);
  const showError = useSnackbarStore((s) => s.showError);

  const [state, setState] = useState<PageState>("loading");
  const [summary, setSummary] = useState<{
    slowMovement: number;
    inLiquidation: number;
    totalInventory: number;
  } | null>(null);
  const [departments, setDepartments] = useState<
    Awaited<ReturnType<typeof getLowRotationStrategy>>["departments"]
  >([]);
  const [suggestions, setSuggestions] = useState<PriceSuggestionItem[]>([]);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmModalItem, setConfirmModalItem] = useState<PriceSuggestionItem | null>(null);
  const [applyLoading, setApplyLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setState("loading");
    try {
      const response = await getLowRotationStrategy();
      setSummary(response.summary);
      setDepartments(response.departments);
      setSuggestions(response.priceSuggestions);
      setState(
        response.departments.length === 0 && response.priceSuggestions.length === 0
          ? "empty"
          : "success"
      );
    } catch {
      setState("error");
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApplyClick = useCallback((item: PriceSuggestionItem, _price: number) => {
    setConfirmModalItem(item);
    setConfirmModalOpen(true);
  }, []);

  const handleConfirmPriceChange = useCallback(async () => {
    if (!confirmModalItem) return;
    setApplyLoading(true);
    try {
      await applyPriceSuggestion(confirmModalItem.id, confirmModalItem.suggestedPrice);
      showSuccess("Precio aplicado correctamente");
      setConfirmModalOpen(false);
      setConfirmModalItem(null);
      fetchData();
    } catch {
      showError("No se pudo aplicar el precio");
    } finally {
      setApplyLoading(false);
    }
  }, [confirmModalItem, showSuccess, showError, fetchData]);

  const handleDepartmentClick = useCallback(
    (department: { id: string }) => {
      router.push(`/inventario/liquidaciones/departamento/${department.id}`);
    },
    [router]
  );

  const previousPriceFromItem = confirmModalItem
    ? confirmModalItem.direction === "down"
      ? confirmModalItem.suggestedPrice / (1 - confirmModalItem.changePercent / 100)
      : confirmModalItem.suggestedPrice / (1 + confirmModalItem.changePercent / 100)
    : 0;

  const statsCards: StatsCardData[] = summary
    ? [
      {
        id: "slow",
        label: "Lento movimiento",
        value: summary.slowMovement,
        icon: <FilterListIcon />,
      },
      {
        id: "liquidation",
        label: "En liquidación",
        value: summary.inLiquidation,
        icon: <InfoIcon />,
      },
      {
        id: "total",
        label: "Inventario total",
        value: summary.totalInventory,
        icon: <InventoryIcon />,
      },
    ]
    : [];

  return (
    <MainLayout>

      <PageContent>
        <Stack direction="column" spacing={3} flex={1}>
          <Title title="Estrategia de baja rotación" />
          {state === "loading" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 2,
                  mb: 1,
                }}
              >
                {[1, 2, 3].map((i) => (
                  <Skeleton
                    key={i}
                    variant="rectangular"
                    height={120}
                    sx={{ borderRadius: 2 }}
                    animation="wave"
                  />
                ))}
              </Box>
              <Skeleton variant="text" width={200} height={32} animation="wave" />
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton
                    key={i}
                    variant="rectangular"
                    height={88}
                    sx={{ borderRadius: 2 }}
                    animation="wave"
                  />
                ))}
              </Box>
            </Box>
          )}
          {state === "error" && (
            <p style={{ color: "var(--mui-palette-error-main)" }}>
              Error al cargar los datos. Intenta de nuevo.
            </p>
          )}
          {state === "empty" && (
            <p style={{ color: "var(--mui-palette-text-secondary)" }}>
              No hay datos de baja rotación disponibles.
            </p>
          )}

          {state === "success" && (
            <>
              <StatsCardGroup cards={statsCards} columns={3} />

              <Typography variant="h5" color="text.secondary" fontWeight={700}>Departamentos</Typography>
              <DepartmentsList>
                {
                  departments.map((dept) => (
                    <DepartmentCard
                      key={dept.id}
                      department={dept}
                      onClick={handleDepartmentClick}
                    />
                  ))
                }
              </DepartmentsList>
            </>
          )}
        </Stack>

        <SidebarPanel>
          <PriceSuggestionsSidebar
            suggestions={suggestions}
            loading={state === "loading"}
            onApply={handleApplyClick}
          />
        </SidebarPanel>
      </PageContent>

      <ConfirmPriceChangeModal
        open={confirmModalOpen}
        onClose={() => {
          if (!applyLoading) {
            setConfirmModalOpen(false);
            setConfirmModalItem(null);
          }
        }}
        productName={confirmModalItem?.productName ?? ""}
        sku={confirmModalItem?.sku ?? ""}
        previousPrice={previousPriceFromItem}
        newPrice={confirmModalItem?.suggestedPrice ?? 0}
        changePercent={confirmModalItem?.changePercent ?? 0}
        direction={confirmModalItem?.direction ?? "down"}
        onConfirm={handleConfirmPriceChange}
        loading={applyLoading}
      />
    </MainLayout>
  );
}
