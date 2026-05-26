import { useState, useEffect, useCallback } from "react";
import { CircularProgress, Box } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { MainLayout, Title, RulesList } from "@/components";
import type { TitleAction } from "@/components";
import type { CollectionRuleData, SelectOption } from "@/components/RuleCard";
import { usePermissions } from "@/hooks/usePermissions";
import {
  CUSTOMER_COLLECTION_CREATE,
  CUSTOMER_COLLECTION_DELETE,
  CUSTOMER_COLLECTION_UPDATE,
} from "@/lib/permissions";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface GetCollectionRulesResponse {
  data: CollectionRuleData[];
  total: number;
}

interface CreateRulePayload {
  trigger: string;
  operator: string;
  period: string;
  message: string;
  isActive: boolean;
}

interface UpdateRulePayload extends CreateRulePayload {
  id: string;
}

// ============================================================================
// CONFIGURATION OPTIONS
// ============================================================================

const TRIGGER_OPTIONS: SelectOption[] = [
  { value: "due_date", label: "Fecha límite de pago" },
  { value: "delinquency", label: "Morosidad" },
];

const OPERATOR_OPTIONS: SelectOption[] = [
  { value: "less_than", label: "Menor" },
  { value: "greater_than", label: "Mayor" },
  { value: "equal_to", label: "Igual" },
];

const PERIOD_OPTIONS: SelectOption[] = [
  { value: "1_day", label: "1 día" },
  { value: "3_days", label: "3 días" },
  { value: "7_days", label: "7 días" },
  { value: "15_days", label: "15 días" },
  { value: "1_month", label: "1 mes" },
  { value: "2_months", label: "2 meses" },
  { value: "3_months", label: "3 meses" },
];

const MESSAGE_OPTIONS: SelectOption[] = [
  { value: "payment_reminder", label: "Mensaje recordatorio de pago" },
  { value: "payment_invitation", label: "Mensaje de invitación de pago" },
  { value: "reminder_1_week", label: "Email de recordatorio 1 semana" },
  { value: "judicial_warning", label: "Mensaje advertencia judicial" },
  { value: "judicial_collection", label: "Mensaje Notificación cobranza judicial" },
  { value: "final_notice", label: "Aviso final de cobranza" },
];

// ============================================================================
// MOCK DATA
// ============================================================================

const DUMMY_RULES: CollectionRuleData[] = [
  {
    id: "rule-1",
    trigger: "due_date",
    operator: "less_than",
    period: "1_day",
    message: "payment_reminder",
    isActive: true,
  },
  {
    id: "rule-2",
    trigger: "delinquency",
    operator: "greater_than",
    period: "1_day",
    message: "payment_invitation",
    isActive: true,
  },
  {
    id: "rule-3",
    trigger: "delinquency",
    operator: "greater_than",
    period: "7_days",
    message: "reminder_1_week",
    isActive: true,
  },
  {
    id: "rule-4",
    trigger: "delinquency",
    operator: "greater_than",
    period: "1_month",
    message: "judicial_warning",
    isActive: true,
  },
  {
    id: "rule-5",
    trigger: "delinquency",
    operator: "greater_than",
    period: "3_months",
    message: "judicial_collection",
    isActive: true,
  },
];

// ============================================================================
// MOCK API FUNCTIONS
// ============================================================================

async function getCollectionRules(): Promise<GetCollectionRulesResponse> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return {
    data: DUMMY_RULES,
    total: DUMMY_RULES.length,
  };
}

async function createCollectionRule(
  payload: CreateRulePayload
): Promise<CollectionRuleData> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const newRule: CollectionRuleData = {
    id: `rule-${Date.now()}`,
    ...payload,
  };
  console.log("[API] Created rule:", newRule);
  return newRule;
}

async function updateCollectionRule(
  payload: UpdateRulePayload
): Promise<CollectionRuleData> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  console.log("[API] Updated rule:", payload);
  return payload as CollectionRuleData;
}

async function deleteCollectionRule(id: string): Promise<{ success: boolean }> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  console.log("[API] Deleted rule:", id);
  return { success: true };
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CobranzaAutomatica() {
  const { hasPermission } = usePermissions();
  const canUpdateRule = hasPermission(CUSTOMER_COLLECTION_UPDATE);
  const canDeleteRule = hasPermission(CUSTOMER_COLLECTION_DELETE);
  // State management
  const [rules, setRules] = useState<CollectionRuleData[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch rules on mount
  const fetchRules = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getCollectionRules();
      setRules(response.data);
    } catch (err) {
      console.error("[CobranzaAutomatica] Error fetching rules:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  // Event handlers
  const handleCreateRule = async () => {
    try {
      const newRule = await createCollectionRule({
        trigger: "delinquency",
        operator: "greater_than",
        period: "1_day",
        message: "payment_reminder",
        isActive: true,
      });
      setRules((prev) => [...prev, newRule]);
    } catch (err) {
      console.error("[CobranzaAutomatica] Error creating rule:", err);
    }
  };

  const handleTriggerChange = (ruleId: string, value: string) => {
    setRules((prev) =>
      prev.map((rule) =>
        rule.id === ruleId ? { ...rule, trigger: value } : rule
      )
    );
    // In production, debounce and call updateCollectionRule
  };

  const handleOperatorChange = (ruleId: string, value: string) => {
    setRules((prev) =>
      prev.map((rule) =>
        rule.id === ruleId ? { ...rule, operator: value } : rule
      )
    );
  };

  const handlePeriodChange = (ruleId: string, value: string) => {
    setRules((prev) =>
      prev.map((rule) =>
        rule.id === ruleId ? { ...rule, period: value } : rule
      )
    );
  };

  const handleMessageChange = (ruleId: string, value: string) => {
    setRules((prev) =>
      prev.map((rule) =>
        rule.id === ruleId ? { ...rule, message: value } : rule
      )
    );
  };

  const handleToggleActive = async (ruleId: string) => {
    const rule = rules.find((r) => r.id === ruleId);
    if (!rule) return;

    const updatedRule = { ...rule, isActive: !rule.isActive };
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? updatedRule : r))
    );

    try {
      await updateCollectionRule(updatedRule);
    } catch (err) {
      // Rollback on error
      setRules((prev) =>
        prev.map((r) => (r.id === ruleId ? rule : r))
      );
      console.error("[CobranzaAutomatica] Error toggling rule:", err);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    const ruleToDelete = rules.find((r) => r.id === ruleId);
    if (!ruleToDelete) return;

    // Optimistic update
    setRules((prev) => prev.filter((r) => r.id !== ruleId));

    try {
      await deleteCollectionRule(ruleId);
    } catch (err) {
      // Rollback on error
      setRules((prev) => [...prev, ruleToDelete]);
      console.error("[CobranzaAutomatica] Error deleting rule:", err);
    }
  };

  // Title actions
  const titleActions: TitleAction[] = [
    {
      id: "create",
      label: "Crear nueva",
      icon: <AddIcon />,
      onClick: handleCreateRule,
      variant: "contained",
      color: "primary",
      permission: CUSTOMER_COLLECTION_CREATE,
    },
  ];

  return (
    <MainLayout>
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
          triggerOptions={TRIGGER_OPTIONS}
          operatorOptions={OPERATOR_OPTIONS}
          periodOptions={PERIOD_OPTIONS}
          messageOptions={MESSAGE_OPTIONS}
          onTriggerChange={handleTriggerChange}
          onOperatorChange={handleOperatorChange}
          onPeriodChange={handlePeriodChange}
          onMessageChange={handleMessageChange}
          onToggleActive={handleToggleActive}
          onDelete={handleDeleteRule}
          canUpdate={canUpdateRule}
          canDelete={canDeleteRule}
          emptyMessage="No hay reglas de cobranza configuradas. Crea una nueva regla para comenzar."
        />
      )}
    </MainLayout>
  );
}
