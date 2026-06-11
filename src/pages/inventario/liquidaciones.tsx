import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { Typography, Skeleton, Stack, Divider } from "@mui/material";
import {
  FilterList as FilterListIcon,
  InfoOutlined as InfoIcon,
  ViewModule as InventoryIcon,
} from "@mui/icons-material";
import {
  MainLayout,
  Title,
  DepartmentCard,
  PriceSuggestionsSidebar,
  ConfirmPriceChangeModal,
  StatsCardGroup
} from "@/components";
import type { StatsCardData } from "@/components/StatsCard";
import type { PriceSuggestionItem } from "@/types/liquidaciones.types";
import {
  getLowRotationStrategy,
  applyPriceSuggestion,
} from "@/data/liquidaciones.mockData";
import { SidebarPanel } from "@/styles/inventario/liquidaciones.styles";
import { useSnackbarStore } from "@/store/useSnackbarStore";

type PageState = "loading" | "success" | "empty" | "error";

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
      <Stack direction={{ xs: "column", md: "row" }} spacing={3} divider={<Divider orientation="vertical" flexItem />}>
        <Stack direction="column" spacing={3} flex="0 1 768px">
          <Title title="Estrategia de baja rotación" />
          <StatsCardGroup cards={statsCards} loading={state === "loading"} columns={3} />
          <Stack spacing={1}>
            <Typography variant="body1" color="text.secondary" fontWeight={700}>Departamentos</Typography>
            {
              (state === "loading") ?
                [1, 2, 3, 4].map((i) => (
                  <Skeleton
                    key={i}
                    variant="rectangular"
                    height="96px"
                    animation="wave"
                    style={{ borderRadius: "16px" }}
                  />
                ))
                :
                departments.map((item) => (
                  <DepartmentCard
                    key={item.id}
                    department={item}
                    onClick={handleDepartmentClick}
                  />
                ))
            }
          </Stack>
        </Stack>
        <SidebarPanel>
          <PriceSuggestionsSidebar
            suggestions={suggestions}
            loading={state === "loading"}
            onApply={handleApplyClick}
          />
        </SidebarPanel>
      </Stack>

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
        imageUrl={confirmModalItem?.imageUrl}
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
