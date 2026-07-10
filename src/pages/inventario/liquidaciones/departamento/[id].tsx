import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import {
  Title,
  Breadcrumbs,
  Tabs,
  PriceSuggestionCard,
  LiquidationRuleCard,
  LiquidationRuleActivityModal,
  ConfirmPriceChangeModal,
  TabFilters,
} from "@/components";
import { useLiquidationRuleActivity } from "@/hooks/useLiquidationRuleActivity";
import type { TabItem } from "@/components/Tabs";
import type {
  DepartmentDetail,
  PriceSuggestionItem,
  LiquidationRule,
  LiquidationRuleOperator,
  LiquidationRulePeriod,
} from "@/types/liquidaciones.types";
import {
  getDepartmentDetail,
  applyPriceSuggestion,
} from "@/data/liquidaciones.mockData";
import {
  ArticlesGrid,
  RulesList,
} from "@/styles/inventario/departamento.styles";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { Box, Skeleton, Stack, Typography } from "@mui/material";
type PageState = "loading" | "success" | "empty" | "error" | "not_found";
export default function DepartamentoLiquidacionesPage() {
  const router = useRouter();
  const { id } = router.query;
  const showSuccess = useSnackbarStore((s) => s.showSuccess);
  const showError = useSnackbarStore((s) => s.showError);
  const [state, setState] = useState<PageState>("loading");
  const [department, setDepartment] = useState<DepartmentDetail | null>(null);
  const [rules, setRules] = useState<LiquidationRule[]>([]);
  const [activeTab, setActiveTab] = useState("articulos");
  const [confirmModalItem, setConfirmModalItem] =
    useState<PriceSuggestionItem | null>(null);
  const [applyLoading, setApplyLoading] = useState(false);
  const [activityRuleId, setActivityRuleId] = useState<string | null>(null);
  const {
    data: ruleActivity,
    isLoading: activityLoading,
    isError: activityError,
    refetch: refetchActivity,
  } = useLiquidationRuleActivity(activityRuleId, activityRuleId !== null);
  const departmentId = typeof id === "string" ? id : "";
  const fetchDetail = useCallback(async () => {
    if (!departmentId) return;
    setState("loading");
    try {
      const data = await getDepartmentDetail(departmentId);
      if (!data) {
        setState("not_found");
        return;
      }
      setDepartment(data);
      setRules(data.rules);
      setState(
        data.articles.length === 0 && data.rules.length === 0
          ? "empty"
          : "success",
      );
    } catch {
      setState("error");
    }
  }, [departmentId]);
  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);
  const handleApplyClick = useCallback(
    (item: PriceSuggestionItem, _price: number) => {
      setConfirmModalItem(item);
    },
    [],
  );
  const handleConfirmPriceChange = useCallback(async () => {
    if (!confirmModalItem) return;
    setApplyLoading(true);
    try {
      await applyPriceSuggestion(
        confirmModalItem.id,
        confirmModalItem.suggestedPrice,
      );
      showSuccess("Precio aplicado correctamente");
      setConfirmModalItem(null);
      fetchDetail();
    } catch {
      showError("No se pudo aplicar el precio");
    } finally {
      setApplyLoading(false);
    }
  }, [confirmModalItem, showSuccess, showError, fetchDetail]);
  const previousPriceFromItem = confirmModalItem
    ? confirmModalItem.direction === "down"
      ? confirmModalItem.suggestedPrice /
        (1 - confirmModalItem.changePercent / 100)
      : confirmModalItem.suggestedPrice /
        (1 + confirmModalItem.changePercent / 100)
    : 0;
  const handleRuleOperatorChange = useCallback(
    (ruleId: string, value: LiquidationRuleOperator) => {
      setRules((prev) =>
        prev.map((r) =>
          r.id === ruleId
            ? {
                ...r,
                operator: value,
              }
            : r,
        ),
      );
    },
    [],
  );
  const handleRuleValueChange = useCallback((ruleId: string, value: number) => {
    setRules((prev) =>
      prev.map((r) =>
        r.id === ruleId
          ? {
              ...r,
              value,
            }
          : r,
      ),
    );
  }, []);
  const handleRulePeriodChange = useCallback(
    (ruleId: string, value: LiquidationRulePeriod) => {
      setRules((prev) =>
        prev.map((r) =>
          r.id === ruleId
            ? {
                ...r,
                periodDays: value,
              }
            : r,
        ),
      );
    },
    [],
  );
  const handleRulePromotionChange = useCallback(
    (ruleId: string, value: number) => {
      setRules((prev) =>
        prev.map((r) =>
          r.id === ruleId
            ? {
                ...r,
                promotionPercent: value,
              }
            : r,
        ),
      );
    },
    [],
  );
  const handleRuleRedLabelChange = useCallback(
    (ruleId: string, enabled: boolean) => {
      setRules((prev) =>
        prev.map((r) =>
          r.id === ruleId
            ? {
                ...r,
                redLabelEnabled: enabled,
              }
            : r,
        ),
      );
    },
    [],
  );
  const handleRuleDelete = useCallback((ruleId: string) => {
    setRules((prev) => prev.filter((r) => r.id !== ruleId));
  }, []);
  const tabs: TabItem[] = [
    {
      value: "articulos",
      label: "Artículos",
    },
    {
      value: "ajustes",
      label: "Ajustes",
    },
  ];
  const breadcrumbItems = [
    {
      label: "Estrategia de baja rotación",
      href: "/inventario/liquidaciones",
    },
    {
      label: department?.name ?? "Departamento",
    },
  ];
  if (state === "not_found") {
    return (
      <Box
        sx={{
          py: 3,
        }}
      >
        <Typography color="text.secondary">
          Departamento no encontrado.
        </Typography>
        <Typography
          component="span"
          onClick={() => router.push("/inventario/liquidaciones")}
          sx={{
            mt: 2,
            display: "inline-block",
            color: "primary.main",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          Volver a Estrategia de baja rotación
        </Typography>
      </Box>
    );
  }
  return (
    <>
      <Stack spacing={3}>
        <Breadcrumbs
          items={breadcrumbItems}
          onBack={() => router.push("/inventario/liquidaciones")}
        />

        <Title
          title={state === "loading" ? "Cargando..." : (department?.name ?? "")}
        />

        <TabFilters
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {state === "loading" && (
          <Stack
            sx={{
              mt: 3,
            }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 2,
              }}
            >
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  height={220}
                  sx={{
                    borderRadius: 2,
                  }}
                  animation="wave"
                />
              ))}
            </Box>
          </Stack>
        )}

        {state === "error" && (
          <Typography
            color="error"
            sx={{
              mt: 2,
            }}
          >
            Error al cargar los datos. Intenta de nuevo.
          </Typography>
        )}

        {state === "empty" && (
          <Typography
            color="text.secondary"
            sx={{
              mt: 2,
            }}
          >
            No hay artículos ni reglas configuradas para este departamento.
          </Typography>
        )}

        {state === "success" && department && (
          <>
            {activeTab === "articulos" && (
              <ArticlesGrid>
                {department.articles.map((item) => (
                  <PriceSuggestionCard
                    key={item.id}
                    item={item}
                    onApply={handleApplyClick}
                  />
                ))}
              </ArticlesGrid>
            )}

            {activeTab === "ajustes" && (
              <RulesList>
                {rules.length === 0 ? (
                  <Typography color="text.secondary">
                    No hay reglas configuradas. Agrega una regla para aplicar
                    promociones por bajo movimiento.
                  </Typography>
                ) : (
                  rules.map((rule) => (
                    <LiquidationRuleCard
                      key={rule.id}
                      rule={rule}
                      onOperatorChange={handleRuleOperatorChange}
                      onValueChange={handleRuleValueChange}
                      onPeriodChange={handleRulePeriodChange}
                      onPromotionChange={handleRulePromotionChange}
                      onRedLabelChange={handleRuleRedLabelChange}
                      onDelete={handleRuleDelete}
                      onViewActivity={setActivityRuleId}
                      onDrag={() => {}}
                    />
                  ))
                )}
              </RulesList>
            )}
          </>
        )}
      </Stack>

      <LiquidationRuleActivityModal
        open={activityRuleId !== null}
        onClose={() => setActivityRuleId(null)}
        totalModified={ruleActivity?.totalModified ?? 0}
        entries={ruleActivity?.entries ?? []}
        loading={activityLoading}
        error={activityError}
        onRetry={() => void refetchActivity()}
      />

      <ConfirmPriceChangeModal
        open={!!confirmModalItem}
        onClose={() => {
          if (!applyLoading) setConfirmModalItem(null);
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
    </>
  );
}
