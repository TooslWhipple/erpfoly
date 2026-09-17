import { Skeleton, Table, TableBody, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import numeral from "numeral";
import { formatDate, formatDateOnly } from "@/utils/date";
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
  | "dateOnly"
  | "boolean"
  | "chip"
  | "chipGroup"
  | "id";

export interface DataTableColumn<T> {
  id: keyof T | string;
  label: string;
  headerContent?: React.ReactNode;
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

export interface DataTableSummaryRow {
  id: string;
  /** One cell per column, in column order. */
  cells: React.ReactNode[];
  rowSx?: SxProps<Theme>;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: keyof T;
  emptyMessage?: string;
  loading?: boolean;
  loadingRowCount?: number;
  onRowClick?: (row: T) => void;
  summaryRows?: DataTableSummaryRow[];
  /** Sin borde ni fondo de tarjeta; solo líneas horizontales entre filas. */
  borderless?: boolean;
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
      return formatDate(rawValue, "dateNumeric");

    case "dateOnly":
      return formatDateOnly(rawValue, "dateNumeric");

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

function renderSkeletonRows<T>(
  columns: DataTableColumn<T>[],
  rowCount: number
) {
  return Array.from({ length: rowCount }, (_, rowIndex) => (
    <StyledTableRow key={`skeleton-${rowIndex}`}>
      {columns.map((column) => (
        <StyledTableCell key={`skeleton-${rowIndex}-${String(column.id)}`} align={column.align ?? "left"}>
          <Skeleton
            variant="text"
            width={column.type === "id" ? 30 : "80%"}
            height={24}
            animation="wave"
          />
        </StyledTableCell>
      ))}
    </StyledTableRow>
  ));
}

function isNumericColumn<T>(column: DataTableColumn<T>): boolean {
  return (
    column.type === "currency" ||
    column.type === "number" ||
    column.type === "percentage"
  );
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  emptyMessage = "No hay datos disponibles",
  loading = false,
  loadingRowCount = 5,
  onRowClick,
  summaryRows,
  borderless = false,
}: DataTableProps<T>) {
  const showSummary =
    !loading && rows.length > 0 && Boolean(summaryRows?.length);

  const plainCellSx = borderless
    ? {
        px: 0,
        py: 1.5,
        bgcolor: "transparent",
        borderColor: "divider",
      }
    : undefined;

  return (
    <TableWrapper
      sx={
        borderless
          ? {
              border: "none",
              borderRadius: 0,
              backgroundColor: "transparent",
              overflow: "visible",
            }
          : undefined
      }
    >
      <StyledTableContainer sx={borderless ? { overflow: "visible" } : undefined}>
        <Table
          size="small"
          style={{
            width: "100%",
            minWidth: borderless ? undefined : 400,
          }}
        >
          <StyledTableHead
            sx={
              borderless
                ? { backgroundColor: "transparent" }
                : undefined
            }
          >
            <StyledTableRow>
              {columns.map((col) => (
                <StyledHeaderCell
                  key={String(col.id)}
                  align={col.align ?? "left"}
                  sx={
                    borderless
                      ? {
                          ...plainCellSx,
                          color: "text.secondary",
                          fontWeight: 500,
                          backgroundColor: "transparent",
                        }
                      : undefined
                  }
                >
                  {col.headerContent ?? col.label}
                </StyledHeaderCell>
              ))}
            </StyledTableRow>
          </StyledTableHead>
          <TableBody>
            {loading ? (
              renderSkeletonRows(columns, loadingRowCount)
            ) : rows.length === 0 ? (
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
              <>
                {rows.map((row) => (
                  <StyledTableRow
                    key={String(row[rowKey])}
                    hover={!borderless}
                    onClick={() => onRowClick?.(row)}
                    sx={
                      borderless
                        ? {
                            "&:hover": {
                              backgroundColor: "transparent",
                              "& td": { backgroundColor: "transparent" },
                            },
                            ...(onRowClick ? { cursor: "pointer" } : {}),
                          }
                        : onRowClick
                          ? { cursor: "pointer" }
                          : undefined
                    }
                  >
                    {columns.map((col) => {
                      const value = getValue(row, col.id);
                      const content = formatCellValue(value, col, row);
                      const Cell = isNumericColumn(col)
                        ? NumberCell
                        : StyledTableCell;
                      return (
                        <Cell
                          key={String(col.id)}
                          align={col.align ?? "left"}
                          sx={plainCellSx}
                        >
                          {content}
                        </Cell>
                      );
                    })}
                  </StyledTableRow>
                ))}
                {showSummary
                  ? summaryRows!.map((summaryRow) => (
                      <StyledTableRow
                        key={summaryRow.id}
                        sx={{
                          "&:hover": {
                            backgroundColor: "transparent",
                            "& td": { backgroundColor: "inherit" },
                          },
                          ...summaryRow.rowSx,
                        }}
                      >
                        {columns.map((col, index) => {
                          const Cell = isNumericColumn(col)
                            ? NumberCell
                            : StyledTableCell;
                          return (
                            <Cell
                              key={`${summaryRow.id}-${String(col.id)}`}
                              align={col.align ?? "left"}
                              sx={plainCellSx}
                            >
                              {summaryRow.cells[index] ?? null}
                            </Cell>
                          );
                        })}
                      </StyledTableRow>
                    ))
                  : null}
              </>
            )}
          </TableBody>
        </Table>
      </StyledTableContainer>
    </TableWrapper>
  );
}
