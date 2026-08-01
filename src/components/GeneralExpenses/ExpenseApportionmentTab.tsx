import {
  Checkbox,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import numeral from "numeral";
import { FormSelect, FormTextField } from "@/components/Form";
import { APPORTIONMENT_TYPE_OPTIONS } from "@/data/general-expenses.mockData";
import type {
  ApportionmentType,
  GeneralExpenseBranchShare,
} from "@/types/general-expenses.types";
import {
  BranchShareList,
  BranchShareRow,
  PercentageInput,
  SwitchRow,
} from "./styles";

export interface ExpenseApportionmentTabProps {
  apportionEnabled: boolean;
  onApportionEnabledChange: (value: boolean) => void;
  apportionmentType: ApportionmentType;
  onApportionmentTypeChange: (value: ApportionmentType) => void;
  applyToForeignBranches: boolean;
  onApplyToForeignBranchesChange: (value: boolean) => void;
  branchShares: GeneralExpenseBranchShare[];
  onBranchPercentageChange: (branchId: string, percentage: number) => void;
  singleBranchId: string;
  singleBranchName: string;
  onSingleBranchChange: (branchId: string, branchName: string) => void;
  disabled?: boolean;
}

export function ExpenseApportionmentTab({
  apportionEnabled,
  onApportionEnabledChange,
  apportionmentType,
  onApportionmentTypeChange,
  applyToForeignBranches,
  onApplyToForeignBranchesChange,
  branchShares,
  onBranchPercentageChange,
  singleBranchId,
  singleBranchName,
  onSingleBranchChange,
  disabled = false,
}: ExpenseApportionmentTabProps) {
  const visibleBranches = applyToForeignBranches
    ? branchShares
    : branchShares.filter((branch) => !branch.isForeign);

  const branchOptions = branchShares.map((branch) => ({
    value: branch.branchId,
    label: branch.branchName,
  }));

  const isFree = apportionmentType === "free";

  return (
    <Stack spacing={2.5}>
      <SwitchRow>
        <Typography variant="body2" fontWeight={500}>
          Prorratear gasto entre sucursales
        </Typography>
        <Switch
          checked={apportionEnabled}
          onChange={(_, checked) => onApportionEnabledChange(checked)}
          disabled={disabled}
          color="primary"
        />
      </SwitchRow>

      {!apportionEnabled ? (
        <FormSelect
          label="Sucursal"
          options={branchOptions}
          value={singleBranchId}
          onChange={(event) => {
            const branchId = String(event.target.value);
            const option = branchOptions.find(
              (item) => String(item.value) === branchId,
            );
            onSingleBranchChange(branchId, option?.label ?? singleBranchName);
          }}
          disabled={disabled}
          placeholder="Selecciona una sucursal"
        />
      ) : (
        <Stack spacing={2}>
          <FormTextField
            label="Tipo de prorrateo"
            select
            value={apportionmentType}
            onChange={(event) =>
              onApportionmentTypeChange(event.target.value as ApportionmentType)
            }
            disabled={disabled}
          >
            {APPORTIONMENT_TYPE_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </FormTextField>

          <Stack spacing={0.75}>
            <Typography variant="subtitle2">Prorrateo por sucursal</Typography>
            <Typography variant="body2" color="text.secondary">
              El cálculo de porcentaje de prorrateo es directamente proporcional
              al neto de ventas del mes anterior.
            </Typography>
          </Stack>

          <FormControlLabel
            control={
              <Checkbox
                checked={applyToForeignBranches}
                onChange={(_, checked) =>
                  onApplyToForeignBranchesChange(checked)
                }
                disabled={disabled}
                color="primary"
              />
            }
            label={<Typography variant="body2">Aplicar a foraneas</Typography>}
          />

          <BranchShareList>
            {visibleBranches.map((branch) => (
              <BranchShareRow key={branch.branchId}>
                <Typography variant="body2">{branch.branchName}</Typography>
                {isFree ? (
                  <PercentageInput
                    size="small"
                    value={branch.percentage}
                    disabled={disabled}
                    onChange={(event) => {
                      const raw = event.target.value.replace(/[^\d.]/g, "");
                      const parsed = Number.parseFloat(raw);
                      onBranchPercentageChange(
                        branch.branchId,
                        Number.isFinite(parsed) ? parsed : 0,
                      );
                    }}
                    InputProps={{
                      endAdornment: (
                        <Typography variant="caption" color="text.secondary">
                          %
                        </Typography>
                      ),
                    }}
                  />
                ) : (
                  <Typography variant="body2" textAlign="center">
                    {branch.percentage.toFixed(2)}%
                  </Typography>
                )}
                <Typography variant="subtitle2" textAlign="right">
                  {numeral(branch.amount).format("$0,0.00")}
                </Typography>
              </BranchShareRow>
            ))}
          </BranchShareList>
        </Stack>
      )}
    </Stack>
  );
}
