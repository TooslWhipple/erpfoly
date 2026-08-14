import { MenuItem, Stack, Switch, Typography } from "@mui/material";
import numeral from "numeral";
import { FormAutocomplete, FormTextField } from "@/components/Form";
import type { SelectOption } from "@/components/Form";
import {
  APPORTIONMENT_TYPE_HELP,
  APPORTIONMENT_TYPE_OPTIONS,
  type ApportionmentType,
  type GeneralExpenseBranchShare,
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
  branchShares: GeneralExpenseBranchShare[];
  onBranchPercentageChange: (branchId: string, percentage: number) => void;
  singleBranchId: string;
  onSingleBranchChange: (branchId: string, branchName: string) => void;
  branchOptions: SelectOption[];
  branchError?: string;
  loadingPreview?: boolean;
  disabled?: boolean;
}

export function ExpenseApportionmentTab({
  apportionEnabled,
  onApportionEnabledChange,
  apportionmentType,
  onApportionmentTypeChange,
  branchShares,
  onBranchPercentageChange,
  singleBranchId,
  onSingleBranchChange,
  branchOptions,
  branchError,
  loadingPreview = false,
  disabled = false,
}: ExpenseApportionmentTabProps) {
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
        <FormAutocomplete
          label="Sucursal"
          options={branchOptions}
          value={singleBranchId}
          onChange={(branchId) => {
            const option = branchOptions.find(
              (item) => String(item.value) === branchId,
            );
            onSingleBranchChange(branchId, option?.label ?? "");
          }}
          error={Boolean(branchError)}
          helperText={branchError}
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
              {loadingPreview
                ? "Calculando prorrateo del mes anterior..."
                : APPORTIONMENT_TYPE_HELP[apportionmentType]}
            </Typography>
          </Stack>

          <BranchShareList>
            {branchShares.map((branch) => (
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
