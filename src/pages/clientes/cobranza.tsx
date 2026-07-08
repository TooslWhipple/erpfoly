import { useState, useEffect, useCallback, useMemo } from "react";
import { CircularProgress, Box, Stack } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { Title, RulesList, AutomatedCollectionActivityModal, ConfirmModal } from "@/components";
import type { TitleAction } from "@/components";
import type { CollectionRuleData, SelectOption } from "@/components/RuleCard";
import { usePermissions } from "@/hooks/usePermissions";
import {
  CUSTOMER_COLLECTION_CREATE,
  CUSTOMER_COLLECTION_UPDATE,
  CUSTOMER_COLLECTION_DELETE,
} from "@/lib/permissions";
import {
  getAutomatedCollectionRules,
  getAutomatedCollectionCatalogs,
  createAutomatedCollectionRule,
  updateAutomatedCollectionRule,
  deleteAutomatedCollectionRule,
} from "@/services/automated-collection.service";
import type {
  AutomatedCollectionRule,
  AutomatedCollectionCatalogs,
} from "@/services/automated-collection.service";

function ruleToCollectionRule(rule: AutomatedCollectionRule): CollectionRuleData {
  return {
    id: String(rule.id),
    trigger: String(rule.condition_type.id),
    operator: String(rule.comparison_operator.id),
    period: String(rule.time_period.id),
    message: String(rule.message.id),
    isActive: rule.status,
  };
}

function sortRulesByNewest(rules: CollectionRuleData[]): CollectionRuleData[] {
  return [...rules].sort((a, b) => Number(b.id) - Number(a.id));
}

export default function CobranzaAutomatica() {
  const { hasPermission } = usePermissions();
  const canUpdateRule = hasPermission(CUSTOMER_COLLECTION_UPDATE);
  const canDeleteRule = hasPermission(CUSTOMER_COLLECTION_DELETE);

  const [rules, setRules] = useState<CollectionRuleData[]>([]);
  const [catalogs, setCatalogs] = useState<AutomatedCollectionCatalogs | null>(null);
  const [loading, setLoading] = useState(true);
  const [activityRuleId, setActivityRuleId] = useState<string | null>(null);
  const [rulePendingDelete, setRulePendingDelete] = useState<CollectionRuleData | null>(
    null
  );
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [rulesRes, catalogsRes] = await Promise.all([
        getAutomatedCollectionRules(),
        getAutomatedCollectionCatalogs(),
      ]);
      if (rulesRes.data) {
        setRules(
          sortRulesByNewest(rulesRes.data.data.map(ruleToCollectionRule))
        );
      }
      if (catalogsRes.data) {
        setCatalogs(catalogsRes.data);
      }
    } catch (err) {
      console.error("[CobranzaAutomatica] Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const triggerOptions: SelectOption[] = useMemo(
    () =>
      catalogs?.conditionTypes.map((ct) => ({
        value: String(ct.id),
        label: ct.name,
      })) ?? [],
    [catalogs]
  );

  const operatorOptions: SelectOption[] = useMemo(
    () =>
      catalogs?.comparisonOperators.map((co) => ({
        value: String(co.id),
        label: co.name,
      })) ?? [],
    [catalogs]
  );

  const periodOptions: SelectOption[] = useMemo(
    () =>
      catalogs?.timePeriods.map((tp) => ({
        value: String(tp.id),
        label: `${tp.quantity} ${tp.unit.name}${tp.quantity > 1 ? "s" : ""}`,
      })) ?? [],
    [catalogs]
  );

  const messageOptions: SelectOption[] = useMemo(
    () =>
      catalogs?.messages.map((m) => ({
        value: String(m.id),
        label: m.name,
      })) ?? [],
    [catalogs]
  );

  const handleCreateRule = async () => {
    if (!catalogs || createLoading) return;
    const firstCondition = catalogs.conditionTypes[0];
    const firstOperator = catalogs.comparisonOperators[0];
    const firstPeriod = catalogs.timePeriods[0];
    const firstMessage = catalogs.messages[0];
    const firstMessageType = catalogs.messageTypes[0];

    if (!firstCondition || !firstOperator || !firstPeriod || !firstMessage || !firstMessageType) return;

    setCreateLoading(true);
    try {
      const result = await createAutomatedCollectionRule({
        name: `Nueva regla ${Date.now()}`,
        condition_type_id: firstCondition.id,
        comparison_operator_id: firstOperator.id,
        time_period_id: firstPeriod.id,
        message_id: firstMessage.id,
        message_type_id: firstMessageType.id,
        status: false,
      });
      if (result.data) {
        setRules((prev) => [
          ruleToCollectionRule(result.data!),
          ...prev,
        ]);
      }
    } catch (err) {
      console.error("[CobranzaAutomatica] Error creating rule:", err);
    } finally {
      setCreateLoading(false);
    }
  };

  const FIELD_TO_API: Record<string, string> = {
    trigger: "condition_type_id",
    operator: "comparison_operator_id",
    period: "time_period_id",
    message: "message_id",
  };

  const handleFieldChange = async (
    ruleId: string,
    field: "trigger" | "operator" | "period" | "message",
    value: string
  ) => {
    const previousRules = rules;
    setRules((prev) =>
      prev.map((rule) =>
        rule.id === ruleId ? { ...rule, [field]: value } : rule
      )
    );

    try {
      const result = await updateAutomatedCollectionRule(Number(ruleId), {
        [FIELD_TO_API[field]]: Number(value),
      });
      if (result.error) {
        setRules(previousRules);
      }
    } catch {
      setRules(previousRules);
    }
  };

  const handleTriggerChange = (ruleId: string, value: string) =>
    handleFieldChange(ruleId, "trigger", value);
  const handleOperatorChange = (ruleId: string, value: string) =>
    handleFieldChange(ruleId, "operator", value);
  const handlePeriodChange = (ruleId: string, value: string) =>
    handleFieldChange(ruleId, "period", value);
  const handleMessageChange = (ruleId: string, value: string) =>
    handleFieldChange(ruleId, "message", value);

  const handleToggleActive = async (ruleId: string) => {
    const rule = rules.find((r) => r.id === ruleId);
    if (!rule) return;

    const updatedRule = { ...rule, isActive: !rule.isActive };
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? updatedRule : r))
    );

    try {
      const result = await updateAutomatedCollectionRule(Number(ruleId), {
        status: updatedRule.isActive,
      });
      if (result.error) {
        setRules((prev) =>
          prev.map((r) => (r.id === ruleId ? rule : r))
        );
      }
    } catch {
      setRules((prev) =>
        prev.map((r) => (r.id === ruleId ? rule : r))
      );
    }
  };

  const handleRequestDeleteRule = (ruleId: string) => {
    const rule = rules.find((r) => r.id === ruleId);
    if (rule) {
      setRulePendingDelete(rule);
    }
  };

  const handleCloseDeleteModal = () => {
    if (!deleteLoading) {
      setRulePendingDelete(null);
    }
  };

  const handleConfirmDeleteRule = async () => {
    if (!rulePendingDelete) return;

    const ruleToDelete = rulePendingDelete;
    const ruleId = ruleToDelete.id;
    setDeleteLoading(true);
    setRules((prev) => prev.filter((r) => r.id !== ruleId));

    try {
      const result = await deleteAutomatedCollectionRule(Number(ruleId));
      if (result.error) {
        setRules((prev) => sortRulesByNewest([...prev, ruleToDelete]));
        return;
      }
      setRulePendingDelete(null);
      if (activityRuleId === ruleId) {
        setActivityRuleId(null);
      }
    } catch {
      setRules((prev) => sortRulesByNewest([...prev, ruleToDelete]));
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleViewActivity = (ruleId: string) => {
    setActivityRuleId(ruleId);
  };

  const handleCloseActivityModal = () => {
    setActivityRuleId(null);
  };

  const selectedActivityRule = useMemo(
    () => rules.find((rule) => rule.id === activityRuleId) ?? null,
    [rules, activityRuleId]
  );

  const getRuleMessageName = useCallback(
    (rule: CollectionRuleData) =>
      messageOptions.find((option) => option.value === rule.message)?.label ??
      "Regla de cobranza",
    [messageOptions]
  );

  const selectedMessageName = useMemo(() => {
    if (!selectedActivityRule) return "";
    return getRuleMessageName(selectedActivityRule);
  }, [selectedActivityRule, getRuleMessageName]);

  const pendingDeleteItemName = useMemo(() => {
    if (!rulePendingDelete) return "";
    return getRuleMessageName(rulePendingDelete);
  }, [rulePendingDelete, getRuleMessageName]);

  const titleActions: TitleAction[] = [
    {
      id: "create",
      label: "Crear nueva",
      icon: <AddIcon />,
      onClick: handleCreateRule,
      variant: "contained",
      color: "primary",
      permission: CUSTOMER_COLLECTION_CREATE,
      loading: createLoading,
      disabled: loading || !catalogs,
    },
  ];

  return (
    <>
      <Stack spacing={3} sx={{ width: "100%", minWidth: 0 }}>
        <Title
          title="Cobranza automática"
          description="Configura las condiciones que se deben cumplir para mandar los mensajes o correos automáticos."
          actions={titleActions}
        />

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 200,
            }}
          >
            <CircularProgress size={40} />
          </Box>
        ) : (
          <RulesList
            rules={rules}
            triggerOptions={triggerOptions}
            operatorOptions={operatorOptions}
            periodOptions={periodOptions}
            messageOptions={messageOptions}
            onTriggerChange={handleTriggerChange}
            onOperatorChange={handleOperatorChange}
            onPeriodChange={handlePeriodChange}
            onMessageChange={handleMessageChange}
            onToggleActive={handleToggleActive}
            onDelete={handleRequestDeleteRule}
            onViewActivity={handleViewActivity}
            canUpdate={canUpdateRule}
            canDelete={canDeleteRule}
            emptyMessage="No hay reglas de cobranza configuradas. Crea una nueva regla para comenzar."
          />
        )}
      </Stack>

      <AutomatedCollectionActivityModal
        open={activityRuleId !== null}
        onClose={handleCloseActivityModal}
        ruleId={activityRuleId ? Number(activityRuleId) : null}
        messageName={selectedMessageName}
        isActive={selectedActivityRule?.isActive ?? true}
      />

      <ConfirmModal
        open={rulePendingDelete !== null}
        onClose={handleCloseDeleteModal}
        itemName={pendingDeleteItemName}
        onConfirm={handleConfirmDeleteRule}
        loading={deleteLoading}
      />
    </>
  );
}
