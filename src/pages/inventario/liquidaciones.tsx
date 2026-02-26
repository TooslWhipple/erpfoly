import { useState, useEffect, useCallback } from "react";
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
} from "@/components";
import type { StatsCardData } from "@/components/StatsCard";
import type { PriceSuggestionItem } from "@/types/liquidaciones.types";
import {
  getLowRotationStrategy,
  applyPriceSuggestion,
} from "@/data/liquidaciones.mockData";
import { PageContent, MainContent, SidebarPanel } from "@/styles/pedidos.styles";
import { DepartmentsList } from "@/styles/inventario/liquidaciones.styles";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { Typography } from "@mui/material";

// ============================================================================
// TYPES
// ============================================================================

type PageState = "loading" | "success" | "empty" | "error";

// ============================================================================
// PAGE
// ============================================================================

export default function LiquidacionesPage() {
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

  const handleApplySuggestion = useCallback(
    async (item: PriceSuggestionItem, price: number) => {
      try {
        await applyPriceSuggestion(item.id, price);
        showSuccess("Precio aplicado correctamente");
        fetchData();
      } catch {
        showError("No se pudo aplicar el precio");
      }
    },
    [showSuccess, showError, fetchData]
  );

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
      <Title title="Estrategia de baja rotación" />

      <PageContent>
        <MainContent>
          {state === "loading" && (
            <p style={{ color: "var(--mui-palette-text-secondary)" }}>
              Cargando...
            </p>
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
                    <DepartmentCard key={dept.id} department={dept} />
                  ))
                }
              </DepartmentsList>
            </>
          )}
        </MainContent>

        <SidebarPanel>
          <PriceSuggestionsSidebar
            suggestions={suggestions}
            loading={state === "loading"}
            onApply={handleApplySuggestion}
          />
        </SidebarPanel>
      </PageContent>
    </MainLayout>
  );
}
