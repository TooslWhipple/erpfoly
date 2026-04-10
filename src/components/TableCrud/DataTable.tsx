import { Table, TableBody } from "@mui/material";
import { Typography } from "@mui/material";
import numeral from "numeral";
import {
  TableWrapper,
  StyledTableContainer,
  StyledTableHead,
  StyledHeaderCell,
  StyledTableRow,
  StyledTableCell,
  NumberCell,
  EmptyStateContainer,
} from "./styles";
import { ChipGroup } from "../ChipGroup";
import { StatusChip } from "../StatusChip";
import { getStatusChipVariant } from "./TableCrud";
import type { StatusChipVariant } from "../StatusChip";

export type DataTableColumnType =
  | "text"
  | "number"
  | "currency"
  | "percentage"
  | "date"
  | "boolean"
  | "chip"
  | "chipGroup"
  | "id";

export interface DataTableColumn<T> {
  id: keyof T | string;
  label: string;
  align?: "left" | "center" | "right";
  type?: DataTableColumnType;
  format?: (value: unknown, row: T) => React.ReactNode;
  chipColor?: "default" | "primary" | "secondary" | "error" | "warning" | "info" | "success";
  chipVariantMap?: Record<string, StatusChipVariant>;
  chipLabelMap?: Record<string, string>;
  chipGroupKey?: string;
  chipGroupMaxVisible?: number;
  currencySymbol?: string;
  idPadding?: number;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: keyof T;
  emptyMessage?: string;
}

function getValue<T>(row: T, columnId: keyof T | string): unknown {
  return row[columnId as keyof T];
}

function formatCellValue<T>(
  value: unknown,
  column: DataTableColumn<T>,
  row: T
): React.ReactNode {
  if (column.format) {
    return column.format(value, row);
  }
  const rawValue = value;
  switch (column.type) {
    case "id":
      const padding = column.idPadding ?? 2;
      return typeof rawValue === "number"
        ? String(rawValue).padStart(padding, "0")
        : String(rawValue ?? "");

    case "number":
      return typeof rawValue === "number"
        ? numeral(rawValue).format("0,0")
        : String(rawValue ?? "");

    case "currency": {
      const symbol = column.currencySymbol ?? "$";
      return typeof rawValue === "number"
        ? `${symbol}${numeral(rawValue).format("0,0.00")}`
        : String(rawValue ?? "");
    }

    case "percentage":
      return typeof rawValue === "number"
        ? numeral(rawValue).format("0.00") + "%"
        : String(rawValue ?? "");

    case "date":
      if (rawValue instanceof Date) {
        return rawValue.toLocaleDateString();
      }
      if (typeof rawValue === "string") {
        return new Date(rawValue).toLocaleDateString();
      }
      return String(rawValue ?? "");

    case "boolean":
      return rawValue ? "Sí" : "No";

    case "chip": {
      const chipKey = String(rawValue);
      const label = column.chipLabelMap?.[chipKey] ?? chipKey;
      const variant =
        column.chipVariantMap?.[chipKey] ?? getStatusChipVariant(column.chipColor);
      return <StatusChip label={label} variant={variant} size="small" />;
    }

    case "chipGroup":
      if (Array.isArray(rawValue)) {
        const key = column.chipGroupKey || "name";
        const maxVisible = column.chipGroupMaxVisible ?? 6;
        const items = rawValue.map((item) =>
          typeof item === "object" && item !== null
            ? String(item[key as keyof typeof item] ?? "")
            : String(item)
        );
        return <ChipGroup items={items} maxVisible={maxVisible} />;
      }
      return null;

    default:
      return String(rawValue ?? "");
  }
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  emptyMessage = "No hay datos disponibles",
}: DataTableProps<T>) {
  return (
    <TableWrapper>
      <StyledTableContainer>
        <Table size="small" style={{ width: "100%", minWidth: 400 }}>
          <StyledTableHead>
            <StyledTableRow>
              {columns.map((col) => (
                <StyledHeaderCell
                  key={String(col.id)}
                  align={col.align ?? "left"}
                >
                  {col.label}
                </StyledHeaderCell>
              ))}
            </StyledTableRow>
          </StyledTableHead>
          <TableBody>
            {rows.length === 0 ? (
              <StyledTableRow>
                <StyledTableCell colSpan={columns.length}>
                  <EmptyStateContainer>
                    <Typography variant="body2" color="text.secondary">
                      {emptyMessage}
                    </Typography>
                  </EmptyStateContainer>
                </StyledTableCell>
              </StyledTableRow>
            ) : (
              rows.map((row) => (
                <StyledTableRow key={String(row[rowKey])} hover>
                  {columns.map((col) => {
                    const value = getValue(row, col.id);
                    const content = formatCellValue(value, col, row);
                    const isNumeric =
                      col.type === "currency" ||
                      col.type === "number" ||
                      col.type === "percentage";
                    const Cell = isNumeric ? NumberCell : StyledTableCell;
                    return (
                      <Cell
                        key={String(col.id)}
                        align={col.align ?? "left"}
                      >
                        {content}
                      </Cell>
                    );
                  })}
                </StyledTableRow>
              ))
            )}
          </TableBody>
        </Table>
      </StyledTableContainer>
    </TableWrapper>
  );
}
