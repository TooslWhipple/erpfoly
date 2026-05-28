import { MenuItem, SelectChangeEvent, Typography } from "@mui/material";
import {
  DragIndicator as DragIcon,
  Delete as DeleteIcon,
  ViewList as ViewListIcon,
} from "@mui/icons-material";
import {
  RuleCardContainer,
  RuleContent,
  RuleLabel,
  TriggerSelect,
  OperatorSelect,
  PeriodSelect,
  MessageSelect,
  StatusChip,
  ActionsContainer,
  ActionIconButton,
  DragHandle,
  RulesListContainer,
  EmptyStateContainer,
} from "./styles";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface SelectOption {
  value: string;
  label: string;
}

export interface RuleField {
  id: string;
  type: "select" | "select-large";
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
}

export interface CollectionRuleData {
  id: string;
  trigger: string;
  operator: string;
  period: string;
  message: string;
  isActive: boolean;
}

interface RuleCardProps {
  rule: CollectionRuleData;
  triggerOptions: SelectOption[];
  operatorOptions: SelectOption[];
  periodOptions: SelectOption[];
  messageOptions: SelectOption[];
  onTriggerChange: (ruleId: string, value: string) => void;
  onOperatorChange: (ruleId: string, value: string) => void;
  onPeriodChange: (ruleId: string, value: string) => void;
  onMessageChange: (ruleId: string, value: string) => void;
  onToggleActive: (ruleId: string) => void;
  onDelete: (ruleId: string) => void;
  onViewActivity?: (ruleId: string) => void;
  onReorder?: (ruleId: string) => void;
  canUpdate?: boolean;
  canDelete?: boolean;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function RuleCard({
  rule,
  triggerOptions,
  operatorOptions,
  periodOptions,
  messageOptions,
  onTriggerChange,
  onOperatorChange,
  onPeriodChange,
  onMessageChange,
  onToggleActive,
  onDelete,
  onViewActivity,
  canUpdate = true,
  canDelete = true,
}: RuleCardProps) {
  const handleTriggerChange = (event: SelectChangeEvent<unknown>) => {
    onTriggerChange(rule.id, event.target.value as string);
  };

  const handleOperatorChange = (event: SelectChangeEvent<unknown>) => {
    onOperatorChange(rule.id, event.target.value as string);
  };

  const handlePeriodChange = (event: SelectChangeEvent<unknown>) => {
    onPeriodChange(rule.id, event.target.value as string);
  };

  const handleMessageChange = (event: SelectChangeEvent<unknown>) => {
    onMessageChange(rule.id, event.target.value as string);
  };

  return (
    <RuleCardContainer>
      <RuleContent>
        <RuleLabel>Si</RuleLabel>
        
        <TriggerSelect
          size="small"
          value={rule.trigger}
          onChange={handleTriggerChange}
          disabled={!canUpdate}
        >
          {triggerOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TriggerSelect>

        <RuleLabel>es</RuleLabel>

        <OperatorSelect
          size="small"
          value={rule.operator}
          onChange={handleOperatorChange}
          disabled={!canUpdate}
        >
          {operatorOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </OperatorSelect>

        <RuleLabel>a</RuleLabel>

        <PeriodSelect
          size="small"
          value={rule.period}
          onChange={handlePeriodChange}
          disabled={!canUpdate}
        >
          {periodOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </PeriodSelect>

        <RuleLabel>enviar:</RuleLabel>

        <MessageSelect
          size="small"
          value={rule.message}
          onChange={handleMessageChange}
          disabled={!canUpdate}
        >
          {messageOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </MessageSelect>

        <StatusChip
          label={rule.isActive ? "Activo" : "Inactivo"}
          status={rule.isActive ? "active" : "inactive"}
          onClick={canUpdate ? () => onToggleActive(rule.id) : undefined}
          clickable={canUpdate}
        />
      </RuleContent>

      <ActionsContainer>
        <DragHandle>
          <DragIcon fontSize="small" />
        </DragHandle>
        {onViewActivity && (
          <ActionIconButton onClick={() => onViewActivity(rule.id)} size="small">
            <ViewListIcon fontSize="small" />
          </ActionIconButton>
        )}
        {canDelete && (
          <ActionIconButton onClick={() => onDelete(rule.id)} size="small">
            <DeleteIcon fontSize="small" />
          </ActionIconButton>
        )}
      </ActionsContainer>
    </RuleCardContainer>
  );
}

// ============================================================================
// RULES LIST COMPONENT
// ============================================================================

interface RulesListProps {
  rules: CollectionRuleData[];
  triggerOptions: SelectOption[];
  operatorOptions: SelectOption[];
  periodOptions: SelectOption[];
  messageOptions: SelectOption[];
  onTriggerChange: (ruleId: string, value: string) => void;
  onOperatorChange: (ruleId: string, value: string) => void;
  onPeriodChange: (ruleId: string, value: string) => void;
  onMessageChange: (ruleId: string, value: string) => void;
  onToggleActive: (ruleId: string) => void;
  onDelete: (ruleId: string) => void;
  onViewActivity?: (ruleId: string) => void;
  emptyMessage?: string;
  canUpdate?: boolean;
  canDelete?: boolean;
}

export function RulesList({
  rules,
  triggerOptions,
  operatorOptions,
  periodOptions,
  messageOptions,
  onTriggerChange,
  onOperatorChange,
  onPeriodChange,
  onMessageChange,
  onToggleActive,
  onDelete,
  onViewActivity,
  emptyMessage = "No hay reglas configuradas",
  canUpdate = true,
  canDelete = true,
}: RulesListProps) {
  if (rules.length === 0) {
    return (
      <EmptyStateContainer>
        <Typography variant="body2" color="text.secondary">
          {emptyMessage}
        </Typography>
      </EmptyStateContainer>
    );
  }

  return (
    <RulesListContainer>
      {rules.map((rule) => (
        <RuleCard
          key={rule.id}
          rule={rule}
          triggerOptions={triggerOptions}
          operatorOptions={operatorOptions}
          periodOptions={periodOptions}
          messageOptions={messageOptions}
          onTriggerChange={onTriggerChange}
          onOperatorChange={onOperatorChange}
          onPeriodChange={onPeriodChange}
          onMessageChange={onMessageChange}
          onToggleActive={onToggleActive}
          onDelete={onDelete}
          onViewActivity={onViewActivity}
          canUpdate={canUpdate}
          canDelete={canDelete}
        />
      ))}
    </RulesListContainer>
  );
}
