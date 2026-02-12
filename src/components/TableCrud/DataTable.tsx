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

// ============================================================================
// TYPES
// ============================================================================

export type DataTableColumnType = "text" | "number" | "currency";

export interface DataTableColumn<T> {
  id: keyof T | string;
  label: string;
  align?: "left" | "center" | "right";
  type?: DataTableColumnType;
  /** Custom formatter; overrides type-based formatting when provided */
  format?: (value: unknown, row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: keyof T;
  emptyMessage?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

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
  switch (column.type) {
    case "currency":
      return typeof value === "number"
        ? numeral(value).format("$0,0.00")
        : String(value ?? "");
    case "number":
      return typeof value === "number"
        ? numeral(value).format("0,0")
        : String(value ?? "");
    default:
      return String(value ?? "");
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Reusable data table with the same styles as TableCrud.
 * Use for read-only tables without actions or pagination.
 */
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
                    const isNumeric = col.type === "currency" || col.type === "number";
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
