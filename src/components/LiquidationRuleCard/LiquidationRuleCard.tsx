import { Stack, IconButton, Switch, FormControl, MenuItem, Typography } from "@mui/material";
import { DragIndicator as DragIcon, Delete as DeleteIcon } from "@mui/icons-material";
import type { LiquidationRule, LiquidationRuleOperator, LiquidationRulePeriod } from "@/types/liquidaciones.types";
import {
  RuleCardContainer,
  RuleNumberBadge,
  RuleLabel,
  RuleOperatorSelect,
  RuleValueInput,
  RulePeriodSelect,
  RulePromotionInput,
  RuleActions,
} from "./styles";

// ============================================================================
// TYPES
// ============================================================================

export interface LiquidationRuleCardProps {
  rule: LiquidationRule;
  onOperatorChange: (ruleId: string, value: LiquidationRuleOperator) => void;
  onValueChange: (ruleId: string, value: number) => void;
  onPeriodChange: (ruleId: string, value: LiquidationRulePeriod) => void;
  onPromotionChange: (ruleId: string, value: number) => void;
  onRedLabelChange: (ruleId: string, enabled: boolean) => void;
  onDelete: (ruleId: string) => void;
  onDrag?: (ruleId: string) => void;
}

const OPERATOR_OPTIONS: { value: LiquidationRuleOperator; label: string }[] = [
  { value: "less", label: "Menor" },
  { value: "greater", label: "Mayor" },
];

const PERIOD_OPTIONS: { value: LiquidationRulePeriod; label: string }[] = [
  { value: "30", label: "30 días" },
  { value: "60", label: "60 días" },
  { value: "90", label: "90 días" },
];

// ============================================================================
// COMPONENT
// ============================================================================

export function LiquidationRuleCard({
  rule,
  onOperatorChange,
  onValueChange,
  onPeriodChange,
  onPromotionChange,
  onRedLabelChange,
  onDelete,
  onDrag,
}: LiquidationRuleCardProps) {
  return (
    <RuleCardContainer>
      <RuleNumberBadge>{rule.order}</RuleNumberBadge>
      <RuleLabel>Si número de ventas es</RuleLabel>
      <FormControl size="small">
        <RuleOperatorSelect
          value={rule.operator}
          onChange={(e) => onOperatorChange(rule.id, e.target.value as LiquidationRuleOperator)}
          displayEmpty
        >
          {OPERATOR_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </RuleOperatorSelect>
      </FormControl>
      <RuleLabel>a</RuleLabel>
      <RuleValueInput
        type="number"
        size="small"
        value={rule.value}
        onChange={(e) => onValueChange(rule.id, Number(e.target.value) || 0)}
        inputProps={{ min: 0, max: 999 }}
      />
      <RuleLabel>en</RuleLabel>
      <FormControl size="small">
        <RulePeriodSelect
          value={rule.periodDays}
          onChange={(e) => onPeriodChange(rule.id, e.target.value as LiquidationRulePeriod)}
        >
          {PERIOD_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </RulePeriodSelect>
      </FormControl>
      <RuleLabel>aplicar Promoción:</RuleLabel>
      <RulePromotionInput
        size="small"
        value={rule.promotionPercent}
        onChange={(e) => onPromotionChange(rule.id, Number(e.target.value) || 0)}
        inputProps={{ min: 0, max: 100, suffix: "%" }}
        placeholder="%"
      />
      <Typography component="span" sx={{ fontSize: 14, color: "text.secondary" }}>
        %
      </Typography>
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <Typography component="span" sx={{ fontSize: 14, color: "text.secondary", whiteSpace: "nowrap" }}>
          Etiqueta roja
        </Typography>
        <Switch
          size="small"
          checked={rule.redLabelEnabled}
          onChange={(_, checked) => onRedLabelChange(rule.id, checked)}
          color="primary"
        />
      </Stack>
      <RuleActions>
        {onDrag && (
          <IconButton size="small" onClick={() => onDrag(rule.id)} aria-label="Reordenar">
            <DragIcon fontSize="small" />
          </IconButton>
        )}
        <IconButton size="small" onClick={() => onDelete(rule.id)} aria-label="Eliminar" color="error">
          <DeleteIcon fontSize="small" />
        </IconButton>
      </RuleActions>
    </RuleCardContainer>
  );
}
