import { useCallback, useEffect, useState } from "react";
import { Table, TableBody, Typography } from "@mui/material";
import { ExternalLink } from "lucide-react";
import numeral from "numeral";
import type { BranchMonthlyGoal } from "@/types/goals.types";
import {
  GoalsTableWrapper,
  GoalsTableContainer,
  GoalsTableHead,
  GoalsHeaderCell,
  GoalsHeaderRow,
  GoalsTableRow,
  GoalsEmptyCell,
  BranchNameCell,
  BranchNameLink,
  EditableCell,
  GoalCellInput,
} from "./BranchMonthlyGoalsTable.styles";

export type BranchMonthlyGoalField =
  | "numCredits"
  | "newCredits"
  | "collectionGoal"
  | "monthlyGoal";

export interface BranchMonthlyGoalsTableProps {
  rows: BranchMonthlyGoal[];
  onRowChange: (rowId: string, field: BranchMonthlyGoalField, value: number) => void;
  onBranchNavigate?: (row: BranchMonthlyGoal) => void;
  emptyMessage?: string;
}

function parseNumericInput(value: string): number {
  const cleaned = value.replace(/[^0-9.]/g, "");
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseIntegerInput(value: string): number {
  const cleaned = value.replace(/\D/g, "");
  const parsed = Number.parseInt(cleaned, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

interface IntegerGoalInputProps {
  value: number;
  onCommit: (value: number) => void;
}

function IntegerGoalInput({ value, onCommit }: IntegerGoalInputProps) {
  const [display, setDisplay] = useState(() => String(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) {
      setDisplay(String(value));
    }
  }, [value, focused]);

  const handleBlur = useCallback(() => {
    const parsed = parseIntegerInput(display);
    onCommit(parsed);
    setDisplay(String(parsed));
    setFocused(false);
  }, [display, onCommit]);

  return (
    <GoalCellInput
      size="small"
      value={display}
      onChange={(e) => setDisplay(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={handleBlur}
      inputProps={{ inputMode: "numeric", "aria-label": "Num. Créditos" }}
    />
  );
}

interface CurrencyGoalInputProps {
  value: number;
  format: string;
  ariaLabel: string;
  onCommit: (value: number) => void;
}

function CurrencyGoalInput({ value, format, ariaLabel, onCommit }: CurrencyGoalInputProps) {
  const formatValue = useCallback((v: number) => numeral(v).format(format), [format]);
  const [display, setDisplay] = useState(() => formatValue(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) {
      setDisplay(formatValue(value));
    }
  }, [value, focused, formatValue]);

  const handleFocus = useCallback(() => {
    setFocused(true);
    setDisplay(String(value));
  }, [value]);

  const handleBlur = useCallback(() => {
    const parsed = parseNumericInput(display);
    onCommit(parsed);
    setDisplay(formatValue(parsed));
    setFocused(false);
  }, [display, formatValue, onCommit]);

  return (
    <GoalCellInput
      size="small"
      value={display}
      onChange={(e) => setDisplay(e.target.value)}
      onFocus={handleFocus}
      onBlur={handleBlur}
      inputProps={{ inputMode: "decimal", "aria-label": ariaLabel }}
    />
  );
}

export function BranchMonthlyGoalsTable({
  rows,
  onRowChange,
  onBranchNavigate,
  emptyMessage = "No hay metas configuradas para este mes.",
}: BranchMonthlyGoalsTableProps) {
  const handleBranchClick = useCallback(
    (row: BranchMonthlyGoal) => {
      onBranchNavigate?.(row);
    },
    [onBranchNavigate]
  );

  return (
    <GoalsTableWrapper>
      <GoalsTableContainer>
        <Table size="small" style={{ width: "100%", minWidth: 720 }}>
          <GoalsTableHead>
            <GoalsHeaderRow>
              <GoalsHeaderCell>Sucursal</GoalsHeaderCell>
              <GoalsHeaderCell align="right">Num. Créditos</GoalsHeaderCell>
              <GoalsHeaderCell align="right">Nuevos créditos</GoalsHeaderCell>
              <GoalsHeaderCell align="right">Meta cotizaciones</GoalsHeaderCell>
              <GoalsHeaderCell align="right">Meta mensual</GoalsHeaderCell>
            </GoalsHeaderRow>
          </GoalsTableHead>
          <TableBody>
            {rows.length === 0 ? (
              <GoalsTableRow>
                <GoalsEmptyCell colSpan={5} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    {emptyMessage}
                  </Typography>
                </GoalsEmptyCell>
              </GoalsTableRow>
            ) : (
              rows.map((row) => (
                <GoalsTableRow key={row.id}>
                  <BranchNameCell>
                    <BranchNameLink
                      type="button"
                      onClick={() => handleBranchClick(row)}
                      disabled={!onBranchNavigate}
                      aria-label={
                        onBranchNavigate
                          ? `Ver sucursal ${row.branchName}`
                          : undefined
                      }
                    >
                      {row.branchName}
                      {onBranchNavigate && <ExternalLink size={16} />}
                    </BranchNameLink>
                  </BranchNameCell>
                  <EditableCell align="right">
                    <IntegerGoalInput
                      value={row.numCredits}
                      onCommit={(v) => onRowChange(row.id, "numCredits", v)}
                    />
                  </EditableCell>
                  <EditableCell align="right">
                    <CurrencyGoalInput
                      value={row.newCredits}
                      format="$0,0"
                      ariaLabel="Nuevos créditos"
                      onCommit={(v) => onRowChange(row.id, "newCredits", v)}
                    />
                  </EditableCell>
                  <EditableCell align="right">
                    <CurrencyGoalInput
                      value={row.collectionGoal}
                      format="$0,0"
                      ariaLabel="Meta cotizaciones"
                      onCommit={(v) => onRowChange(row.id, "collectionGoal", v)}
                    />
                  </EditableCell>
                  <EditableCell align="right">
                    <CurrencyGoalInput
                      value={row.monthlyGoal}
                      format="$0,0.00"
                      ariaLabel="Meta mensual"
                      onCommit={(v) => onRowChange(row.id, "monthlyGoal", v)}
                    />
                  </EditableCell>
                </GoalsTableRow>
              ))
            )}
          </TableBody>
        </Table>
      </GoalsTableContainer>
    </GoalsTableWrapper>
  );
}
