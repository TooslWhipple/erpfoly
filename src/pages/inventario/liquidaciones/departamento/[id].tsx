import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/router";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  Title,
  Breadcrumbs,
  PriceSuggestionCard,
  LiquidationRuleCard,
  LiquidationRuleActivityModal,
  LiquidationRuleFormModal,
  ConfirmPriceChangeModal,
  ConfirmModal,
  TabFilters,
  CardListPagination,
} from "@/components";
import type { ActionButtonConfig } from "@/components/TabFilters";
import { useLiquidationRuleActivity } from "@/hooks/useLiquidationRuleActivity";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import type { TabItem } from "@/components/Tabs";
import type {
  DepartmentDetail,
  PriceSuggestionItem,
  LiquidationRule,
  LiquidationRuleOperator,
  LiquidationRulePeriod,
} from "@/types/liquidaciones.types";
import type { LiquidationRuleFormValues } from "@/components/LiquidationRuleFormModal";
import {
  applyPriceSuggestion,
  getDepartmentDetail,
  getPriceSuggestions,
  saveDepartmentRules,
} from "@/services/liquidaciones.service";
import {
  ArticlesGrid,
  RulesList,
} from "@/styles/inventario/departamento.styles";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { INVENTORY_LIQUIDATIONS_UPDATE } from "@/lib/permissions";
import { Box, Button, Skeleton, Stack, TextField, Typography } from "@mui/material";

type PageState = "loading" | "success" | "empty" | "error" | "not_found";

const SUGGESTION_PAGE_SIZE = 10;

function serializeRules(rules: LiquidationRule[]): string {
  return JSON.stringify(
    rules.map((rule) => ({
      id: rule.id,
      operator: rule.operator,
      value: rule.value,
      periodDays: rule.periodDays,
      promotionPercent: rule.promotionPercent,
      redLabelEnabled: rule.redLabelEnabled,
    })),
  );
}

function withRuleOrder(rules: LiquidationRule[]): LiquidationRule[] {
  return rules.map((rule, index) => ({ ...rule, order: index + 1 }));
}

function ruleMatchKey(rule: Pick<LiquidationRule, "operator" | "value" | "periodDays">): string {
  return `${rule.operator}:${rule.value}:${rule.periodDays}`;
}

export default function DepartamentoLiquidacionesPage() {
  const router = useRouter();
  const { id } = router.query;
  const showSuccess = useSnackbarStore((s) => s.showSuccess);
  const showError = useSnackbarStore((s) => s.showError);
  const [state, setState] = useState<PageState>("loading");
  const [department, setDepartment] = useState<DepartmentDetail | null>(null);
  const [articlePage, setArticlePage] = useState(0);
  const [articleSearchInput, setArticleSearchInput] = useState("");
  const [articleSearch, setArticleSearch] = useState("");
  const [rules, setRules] = useState<LiquidationRule[]>([]);
  const [savedRulesSnapshot, setSavedRulesSnapshot] = useState("");
  const [activeTab, setActiveTab] = useState("articulos");
  const [createRuleOpen, setCreateRuleOpen] = useState(false);
  const [confirmModalItem, setConfirmModalItem] =
    useState<PriceSuggestionItem | null>(null);
  const [confirmPrice, setConfirmPrice] = useState<number | null>(null);
  const [applyLoading, setApplyLoading] = useState(false);
  const [savingRules, setSavingRules] = useState(false);
  const [activityRuleId, setActivityRuleId] = useState<string | null>(null);
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);
  const [confirmLeaveResolver, setConfirmLeaveResolver] = useState<
    ((value: boolean) => void) | null
  >(null);
  const {
    data: ruleActivity,
    isLoading: activityLoading,
    isError: activityError,
    refetch: refetchActivity,
  } = useLiquidationRuleActivity(activityRuleId, activityRuleId !== null);
  const departmentId = typeof id === "string" ? id : "";
  const isDirty = useMemo(
    () => savedRulesSnapshot !== "" && serializeRules(rules) !== savedRulesSnapshot,
    [rules, savedRulesSnapshot],
  );

  const applyLoadedRules = useCallback((nextRules: LiquidationRule[]) => {
    const ordered = withRuleOrder(nextRules);
    setRules(ordered);
    setSavedRulesSnapshot(serializeRules(ordered));
  }, []);

  useEffect(() => {
    if (!departmentId) return;
    let cancelled = false;
    void getDepartmentDetail(departmentId).then((data) => {
      if (cancelled) return;
      if (!data) {
        setState("not_found");
        return;
      }
      setDepartment(data);
      applyLoadedRules(data.rules);
      setState("success");
    }).catch(() => {
      if (!cancelled) setState("error");
    });
    return () => {
      cancelled = true;
    };
  }, [departmentId, applyLoadedRules]);

  const articleSearchRef = useRef(articleSearch);
  const [articlesDepartmentId, setArticlesDepartmentId] = useState(departmentId);
  if (departmentId !== articlesDepartmentId) {
    setArticlesDepartmentId(departmentId);
    setArticleSearchInput("");
    setArticleSearch("");
    setArticlePage(0);
    if (departmentId) setState("loading");
  }
  useEffect(() => {
    const timer = setTimeout(() => {
      const next = articleSearchInput.trim();
      if (articleSearchRef.current === next) return;
      articleSearchRef.current = next;
      setArticleSearch(next);
      setArticlePage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [articleSearchInput]);

  const articlesQuery = useQuery({
    queryKey: ["liquidation-suggestions", departmentId, articlePage, articleSearch],
    enabled: departmentId.length > 0,
    placeholderData: keepPreviousData,
    queryFn: () =>
      getPriceSuggestions({
        page: articlePage + 1,
        limit: SUGGESTION_PAGE_SIZE,
        departmentId,
        search: articleSearch || undefined,
      }),
  });
  const articleRows = articlesQuery.data?.data ?? [];
  const refetchArticles = articlesQuery.refetch;
  const articlePagerPage = articlesQuery.isPlaceholderData
    ? Math.max(0, (articlesQuery.data?.page ?? 1) - 1)
    : articlePage;
  if (
    articlesQuery.isSuccess &&
    !articlesQuery.isFetching &&
    articleRows.length === 0 &&
    articlePage > 0
  ) {
    setArticlePage(articlePage - 1);
  }
  const handleApplyClick = useCallback(
    (item: PriceSuggestionItem, price: number) => {
      setConfirmModalItem(item);
      setConfirmPrice(price);
    },
    [],
  );
  const handleConfirmPriceChange = useCallback(async () => {
    if (!confirmModalItem) return;
    const price = confirmPrice ?? confirmModalItem.suggestedPrice;
    setApplyLoading(true);
    try {
      await applyPriceSuggestion(confirmModalItem.id, price);
      showSuccess("Precio aplicado correctamente");
      setConfirmModalItem(null);
      setConfirmPrice(null);
      void refetchArticles();
    } catch {
      showError("No se pudo aplicar el precio");
    } finally {
      setApplyLoading(false);
    }
  }, [confirmModalItem, confirmPrice, showSuccess, showError, refetchArticles]);
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
    setRules((prev) => withRuleOrder(prev.filter((r) => r.id !== ruleId)));
  }, []);
  const handleCreateRule = useCallback(
    async (values: LiquidationRuleFormValues) => {
      const key = ruleMatchKey(values);
      if (rules.some((rule) => ruleMatchKey(rule) === key)) {
        showError(
          "Ya existe una regla con el mismo operador, umbral y periodo.",
        );
        return;
      }
      setRules((prev) =>
        withRuleOrder([
          ...prev,
          {
            id: `tmp-${Date.now()}`,
            order: prev.length + 1,
            operator: values.operator,
            value: values.value,
            periodDays: values.periodDays,
            promotionPercent: values.promotionPercent,
            redLabelEnabled: values.redLabelEnabled,
          },
        ]),
      );
      setCreateRuleOpen(false);
    },
    [rules, showError],
  );
  const handleSaveRules = useCallback(async () => {
    if (!departmentId) return;
    setSavingRules(true);
    try {
      const saved = await saveDepartmentRules(departmentId, rules);
      setDepartment(saved);
      applyLoadedRules(saved.rules);
      showSuccess("Reglas guardadas");
      void refetchArticles();
    } catch {
      showError("No se pudieron guardar las reglas");
    } finally {
      setSavingRules(false);
    }
  }, [departmentId, rules, applyLoadedRules, showSuccess, showError, refetchArticles]);
  const resolveConfirmLeave = useCallback(
    (allow: boolean) => {
      setConfirmLeaveOpen(false);
      confirmLeaveResolver?.(allow);
      setConfirmLeaveResolver(null);
    },
    [confirmLeaveResolver],
  );
  const requestLeaveConfirmation = useCallback(() => {
    if (!isDirty) {
      return Promise.resolve(true);
    }
    return new Promise<boolean>((resolve) => {
      setConfirmLeaveResolver(() => resolve);
      setConfirmLeaveOpen(true);
    });
  }, [isDirty]);
  useUnsavedChangesGuard({
    isDirty,
    confirmLeave: requestLeaveConfirmation,
  });

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
  const tabActions = useMemo((): ActionButtonConfig[] => {
    if (state !== "success" || activeTab !== "ajustes") {
      return [];
    }
    const actions: ActionButtonConfig[] = [
      {
        label: "Agregar regla",
        onClick: () => setCreateRuleOpen(true),
        variant: "outlined",
        showIcon: true,
        permission: INVENTORY_LIQUIDATIONS_UPDATE,
      },
    ];
    if (isDirty) {
      actions.push({
        label: savingRules ? "Guardando…" : "Guardar ajustes",
        onClick: () => void handleSaveRules(),
        variant: "contained",
        color: "primary",
        disabled: savingRules,
        permission: INVENTORY_LIQUIDATIONS_UPDATE,
      });
    }
    return actions;
  }, [state, activeTab, isDirty, savingRules, handleSaveRules]);
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
      <Stack spacing={3} sx={{ width: "100%", minWidth: 0 }}>
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
          actions={tabActions}
        />

        {state === "loading" && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
              },
              gap: 2,
              minWidth: 0,
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
              <Stack spacing={2} sx={{ mt: 2 }}>
                <TextField
                  size="small"
                  placeholder="Buscar por nombre o SKU"
                  value={articleSearchInput}
                  onChange={(event) => setArticleSearchInput(event.target.value)}
                  fullWidth
                />
                {articlesQuery.isFetching && articleRows.length === 0 ? (
                  <ArticlesGrid sx={{ mt: 0 }}>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Skeleton
                        key={i}
                        variant="rectangular"
                        height={220}
                        sx={{ borderRadius: 2 }}
                        animation="wave"
                      />
                    ))}
                  </ArticlesGrid>
                ) : articlesQuery.isError && articleRows.length === 0 ? (
                  <Stack spacing={1.5} alignItems="flex-start">
                    <Typography color="text.secondary">
                      No se pudieron cargar las sugerencias.
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={() => void refetchArticles()}
                    >
                      Reintentar
                    </Button>
                  </Stack>
                ) : articleRows.length === 0 ? (
                  <Typography color="text.secondary">
                    {articleSearch
                      ? "No hay sugerencias que coincidan con la búsqueda."
                      : "No hay sugerencias. Configura reglas con un porcentaje mayor a 0 para artículos de lento movimiento."}
                  </Typography>
                ) : (
                  <ArticlesGrid sx={{ mt: 0 }}>
                    {articleRows.map((item) => (
                      <PriceSuggestionCard
                        key={item.id}
                        item={item}
                        onApply={handleApplyClick}
                      />
                    ))}
                  </ArticlesGrid>
                )}
                {!(articlesQuery.isError && articleRows.length === 0) ? (
                  <CardListPagination
                    variant="compact"
                    page={articlePagerPage}
                    total={articlesQuery.data?.total ?? 0}
                    rowsPerPage={SUGGESTION_PAGE_SIZE}
                    disabled={articlesQuery.isFetching}
                    onPageChange={setArticlePage}
                  />
                ) : null}
              </Stack>
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
                      onViewActivity={
                        rule.id.startsWith("tmp-")
                          ? undefined
                          : setActivityRuleId
                      }
                    />
                  ))
                )}
              </RulesList>
            )}
          </>
        )}
      </Stack>

      <LiquidationRuleFormModal
        open={createRuleOpen}
        onClose={() => setCreateRuleOpen(false)}
        onSubmit={handleCreateRule}
      />

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
          if (!applyLoading) {
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

      <ConfirmModal
        open={confirmLeaveOpen}
        onClose={() => resolveConfirmLeave(false)}
        onConfirm={() => resolveConfirmLeave(true)}
        title="Cambios sin guardar"
        description="Tienes cambios sin guardar. Si sales ahora, se perderán. ¿Deseas salir?"
        cancelLabel="Quedarme"
        confirmLabel="Salir sin guardar"
        type="warning"
      />
    </>
  );
}
