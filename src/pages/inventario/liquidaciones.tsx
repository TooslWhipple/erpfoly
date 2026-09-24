import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Typography, Skeleton, Stack, Divider, Button } from "@mui/material";
import {
  FilterList as FilterListIcon,
  InfoOutlined as InfoIcon,
  ViewModule as InventoryIcon,
} from "@mui/icons-material";
import { Title, DepartmentCard, PriceSuggestionsSidebar, ConfirmPriceChangeModal, StatsCardGroup } from "@/components";
import type { StatsCardData } from "@/components/StatsCard";
import type { PriceSuggestionItem } from "@/types/liquidaciones.types";
import {
  applyPriceSuggestion,
  getLowRotationStrategy,
  getPriceSuggestions,
} from "@/services/liquidaciones.service";
import { SidebarPanel } from "@/styles/inventario/liquidaciones.styles";
import { useSnackbarStore } from "@/store/useSnackbarStore";

type PageState = "loading" | "success" | "empty" | "error";

const SUGGESTION_PAGE_SIZE = 10;

export default function LiquidacionesPage() {
  const router = useRouter();
  const showSuccess = useSnackbarStore((s) => s.showSuccess);
  const showError = useSnackbarStore((s) => s.showError);

  const [suggestionPage, setSuggestionPage] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmModalItem, setConfirmModalItem] = useState<PriceSuggestionItem | null>(null);
  const [confirmPrice, setConfirmPrice] = useState<number | null>(null);
  const [applyLoading, setApplyLoading] = useState(false);

  const strategyQuery = useQuery({
    queryKey: ["liquidation-strategy"],
    queryFn: getLowRotationStrategy,
  });
  const summary = strategyQuery.data?.summary ?? null;
  const departments = strategyQuery.data?.departments ?? [];
  const state: PageState = strategyQuery.isPending
    ? "loading"
    : strategyQuery.isError
      ? "error"
      : departments.length === 0
        ? "empty"
        : "success";

  const searchRef = useRef(search);

  useEffect(() => {
    const timer = setTimeout(() => {
      const next = searchInput.trim();
      if (searchRef.current === next) return;
      searchRef.current = next;
      setSearch(next);
      setSuggestionPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const suggestionsQuery = useQuery({
    queryKey: ["liquidation-suggestions", suggestionPage, search],
    placeholderData: keepPreviousData,
    queryFn: () =>
      getPriceSuggestions({
        page: suggestionPage + 1,
        limit: SUGGESTION_PAGE_SIZE,
        search: search || undefined,
      }),
  });
  const suggestionRows = suggestionsQuery.data?.data ?? [];
  const refetchSuggestions = suggestionsQuery.refetch;
  const refetchStrategy = strategyQuery.refetch;
  const suggestionPagerPage = suggestionsQuery.isPlaceholderData
    ? Math.max(0, (suggestionsQuery.data?.page ?? 1) - 1)
    : suggestionPage;
  if (
    suggestionsQuery.isSuccess &&
    !suggestionsQuery.isFetching &&
    suggestionRows.length === 0 &&
    suggestionPage > 0
  ) {
    setSuggestionPage(suggestionPage - 1);
  }

  const handleApplyClick = useCallback((item: PriceSuggestionItem, price: number) => {
    setConfirmModalItem(item);
    setConfirmPrice(price);
    setConfirmModalOpen(true);
  }, []);

  const handleConfirmPriceChange = useCallback(async () => {
    if (!confirmModalItem) return;
    const price = confirmPrice ?? confirmModalItem.suggestedPrice;
    setApplyLoading(true);
    try {
      await applyPriceSuggestion(confirmModalItem.id, price);
      showSuccess("Precio aplicado correctamente");
      setConfirmModalOpen(false);
      setConfirmModalItem(null);
      setConfirmPrice(null);
      void refetchStrategy();
      void refetchSuggestions();
    } catch {
      showError("No se pudo aplicar el precio");
    } finally {
      setApplyLoading(false);
    }
  }, [confirmModalItem, confirmPrice, showSuccess, showError, refetchStrategy, refetchSuggestions]);

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
    <>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={3}
        sx={{ minWidth: 0, width: "100%" }}
        divider={
          <Divider
            orientation="vertical"
            flexItem
            sx={{ display: { xs: "none", md: "block" } }}
          />
        }
      >
        <Stack direction="column" spacing={3} flex="1 1 768px" sx={{ minWidth: 0 }}>
          <Title title="Estrategia de baja rotación" />
          <StatsCardGroup cards={statsCards} loading={state === "loading"} columns={3} />
          <Stack spacing={1} sx={{ minWidth: 0 }}>
            <Typography variant="body1" color="text.secondary" fontWeight={700}>Departamentos</Typography>
            {
              state === "loading" ? (
                [1, 2, 3, 4].map((i) => (
                  <Skeleton
                    key={i}
                    variant="rectangular"
                    height="96px"
                    animation="wave"
                    style={{ borderRadius: "16px" }}
                  />
                ))
              ) : state === "error" ? (
                <Stack spacing={1.5} alignItems="flex-start">
                  <Typography variant="body2" color="text.secondary">
                    No se pudo cargar la estrategia.
                  </Typography>
                  <Button variant="outlined" onClick={() => void refetchStrategy()}>
                    Reintentar
                  </Button>
                </Stack>
              ) : departments.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No hay departamentos para mostrar.
                </Typography>
              ) : (
                departments.map((item) => (
                  <DepartmentCard
                    key={item.id}
                    department={item}
                    onClick={handleDepartmentClick}
                  />
                ))
              )
            }
          </Stack>
        </Stack>
        <SidebarPanel>
          <PriceSuggestionsSidebar
            suggestions={suggestionRows}
            total={suggestionsQuery.data?.total ?? 0}
            page={suggestionPagerPage}
            rowsPerPage={SUGGESTION_PAGE_SIZE}
            loading={suggestionsQuery.isFetching}
            error={suggestionsQuery.isError}
            search={searchInput}
            onSearchChange={setSearchInput}
            onPageChange={setSuggestionPage}
            onRetry={() => void refetchSuggestions()}
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
            setConfirmPrice(null);
          }
        }}
        productName={confirmModalItem?.productName ?? ""}
        sku={confirmModalItem?.sku ?? ""}
        imageUrl={confirmModalItem?.imageUrl}
        previousPrice={previousPriceFromItem}
        newPrice={confirmPrice ?? confirmModalItem?.suggestedPrice ?? 0}
        changePercent={confirmModalItem?.changePercent ?? 0}
        direction={confirmModalItem?.direction ?? "down"}
        onConfirm={handleConfirmPriceChange}
        loading={applyLoading}
      />
    </>
  );
}
