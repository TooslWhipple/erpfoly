import { useState } from "react";
import { Button, Skeleton, Table, TableBody, Typography } from "@mui/material";
import { MoreVert as MoreVertIcon } from "@mui/icons-material";
import numeral from "numeral";
import { formatDate } from "@/utils/date";
import { usePermissions } from "@/hooks/usePermissions";
import {
  TableWrapper,
  StyledTableContainer,
  StyledTableHead,
  StyledHeaderCell,
  StyledTableRow,
  StyledTableCell,
  TruncatedCell,
  NumberCell,
  ActionsHeaderCell,
  ActionsCell,
  ActionsButton,
  StyledMenu,
  StyledMenuItem,
  StyledTablePagination,
  EmptyStateContainer,
  StickyHeaderCell,
  StickyCell,
} from "./styles";
import { ChipGroup } from "../ChipGroup";
import { StatusChip } from "../StatusChip";
import type { StatusChipVariant } from "../StatusChip";

export type ColumnType = "text" | "number" | "currency" | "percentage" | "date" | "boolean" | "chip" | "chipGroup" | "button" | "id";

export type ColumnSize = "xs" | "sm" | "md" | "lg" | "xl";

const CHIP_COLOR_TO_STATUS_VARIANT: Record<
  NonNullable<Column<unknown>["chipColor"]>,
  StatusChipVariant
> = {
  default: "default",
  primary: "default",
  secondary: "default",
  success: "success",
  error: "error",
  warning: "warning",
  info: "pending",
};

export function getStatusChipVariant(chipColor?: Column<unknown>["chipColor"]): StatusChipVariant {
  return CHIP_COLOR_TO_STATUS_VARIANT[chipColor ?? "default"];
}

const COLUMN_SIZES: Record<ColumnSize, number> = {
  xs: 60,
  sm: 100,
  md: 150,
  lg: 200,
  xl: 280,
};

export interface Column<T> {
  id: keyof T | string;
  label: string;
  type?: ColumnType;
  size?: ColumnSize;
  maxSize?: ColumnSize;
  align?: "left" | "center" | "right";
  truncate?: boolean;
  format?: (value: T[keyof T], row: T) => React.ReactNode;
  sticky?: boolean;
  stickyPosition?: "left" | "right";
  buttonLabel?: string;
  buttonVariant?: "text" | "outlined" | "contained" | "option" | "white";
  buttonColor?: "primary" | "secondary" | "error" | "warning" | "info" | "success";
  onButtonClick?: (row: T) => void;
  chipColor?: "default" | "primary" | "secondary" | "error" | "warning" | "info" | "success";
  /** Map cell value to StatusChip variant (overrides chipColor when present) */
  chipVariantMap?: Record<string, StatusChipVariant>;
  /** Map cell value to display label */
  chipLabelMap?: Record<string, string>;
  currencySymbol?: string;
  chipGroupKey?: string;
  chipGroupMaxVisible?: number;
  idPadding?: number;
}

export interface RowAction<T> {
  id: string;
  label: string | ((row: T) => string);
  icon?: React.ReactNode;
  onClick: (row: T) => void;
  color?: "inherit" | "error" | "primary" | "secondary" | ((row: T) => "inherit" | "error" | "primary" | "secondary");
  permission?: string;
  disabled?: boolean | ((row: T) => boolean);
  hidden?: boolean | ((row: T) => boolean);
}

interface TableCrudProps<T> {
  columns: Column<T>[];
  rows: T[];
  actions?: RowAction<T>[];
  loading?: boolean;
  emptyMessage?: string;
  rowKey: keyof T;
  page?: number;
  rowsPerPage?: number;
  totalRows?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  rowsPerPageOptions?: number[];
  onRowClick?: (row: T) => void;
}

export function TableCrud<T>({
  columns,
  rows,
  actions,
  loading = false,
  emptyMessage = "No hay datos disponibles",
  rowKey,
  page = 0,
  rowsPerPage = 10,
  totalRows,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [10, 25, 50],
  onRowClick,
}: TableCrudProps<T>) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<T | null>(null);
  const { hasPermission } = usePermissions();
  const visibleActions = actions?.filter((action) => {
    if (!action.permission) return true;
    return hasPermission(action.permission);
  });

  const getColumnWidth = (column: Column<T>): number => {
    if (column.size) {
      return COLUMN_SIZES[column.size];
    }

    switch (column.type) {
      case "id":
        return COLUMN_SIZES.xs;
      case "number":
      case "percentage":
        return COLUMN_SIZES.sm;
      case "currency":
        return COLUMN_SIZES.md;
      case "date":
        return COLUMN_SIZES.md;
      case "boolean":
        return COLUMN_SIZES.xs;
      case "chip":
        return COLUMN_SIZES.sm;
      case "chipGroup":
        return COLUMN_SIZES.xl;
      case "button":
        return COLUMN_SIZES.md;
      default:
        return COLUMN_SIZES.md;
    }
  };

  const getColumnMaxWidth = (column: Column<T>): number | undefined => {
    if (column.maxSize) {
      return COLUMN_SIZES[column.maxSize];
    }
    return undefined;
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, row: T) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handleActionClick = (action: RowAction<T>) => {
    if (selectedRow) {
      action.onClick(selectedRow);
    }
    handleCloseMenu();
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    onPageChange?.(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    onRowsPerPageChange?.(parseInt(event.target.value, 10));
    onPageChange?.(0);
  };

  const getValue = (row: T, columnId: keyof T | string): T[keyof T] => {
    return row[columnId as keyof T];
  };

  const formatValue = (value: T[keyof T], column: Column<T>, row: T): React.ReactNode => {
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
        return typeof rawValue === "number" ? numeral(rawValue).format("0,0") : String(rawValue ?? "");

      case "currency":
        const symbol = column.currencySymbol || "$";
        return typeof rawValue === "number"
          ? `${symbol}${numeral(rawValue).format("0,0.00")}`
          : String(rawValue ?? "");

      case "percentage":
        return typeof rawValue === "number" ? numeral(rawValue).format("0.00") + "%" : String(rawValue ?? "");

      case "date":
        return formatDate(rawValue, "dateNumeric");

      case "boolean":
        return rawValue ? "Sí" : "No";

      case "chip": {
        const chipKey = String(rawValue);
        const label = column.chipLabelMap?.[chipKey] ?? chipKey;
        const variant = column.chipVariantMap?.[chipKey] ?? getStatusChipVariant(column.chipColor);

        return <StatusChip
          label={label}
          variant={variant}
          size="small" />;
      }

      case "chipGroup":
        if (Array.isArray(rawValue)) {
          const key = column.chipGroupKey || "name";
          const maxVisible = column.chipGroupMaxVisible ?? 6;
          const items = rawValue.map((item) =>
            typeof item === "object" && item !== null ? String(item[key] ?? "") : String(item)
          );
          return <ChipGroup items={items} maxVisible={maxVisible} />;
        }
        return null;

      case "button":
        return (
          <Button
            variant={column.buttonVariant || "outlined"}
            color={column.buttonColor || "primary"}
            size="small"
            onClick={() => column.onButtonClick?.(row)}
          >
            {column.buttonLabel || String(rawValue)}
          </Button>
        );

      default:
        return String(rawValue ?? "");
    }
  };

  const renderCell = (value: T[keyof T], column: Column<T>, row: T) => {
    const formattedValue = formatValue(value, column, row);
    const isNumericType = column.type === "number" || column.type === "currency" || column.type === "percentage";

    let CellComponent = StyledTableCell;
    if (column.sticky) {
      CellComponent = StickyCell;
    } else if (isNumericType) {
      CellComponent = NumberCell;
    } else if (column.truncate) {
      CellComponent = TruncatedCell;
    }

    const width = getColumnWidth(column);
    const maxWidth = getColumnMaxWidth(column);
    const cellStyle: React.CSSProperties = { minWidth: width };
    if (maxWidth !== undefined) {
      cellStyle.maxWidth = maxWidth;
      cellStyle.width = maxWidth;
    }

    const cellProps: React.ComponentProps<typeof StyledTableCell> & {
      position?: Column<T>["stickyPosition"];
    } = {
      align: column.align ?? "left",
      style: cellStyle,
      title: column.truncate ? String(value ?? "") : undefined,
      className: column.sticky ? "sticky-cell" : undefined,
    };

    if (column.sticky && CellComponent === StickyCell) {
      cellProps.position = column.stickyPosition;
    }

    return (
      <CellComponent key={String(column.id)} {...cellProps}>
        {formattedValue}
      </CellComponent>
    );
  };

  const total = totalRows ?? rows?.length ?? 0;
  const hasActions = visibleActions && visibleActions.length > 0;

  const renderSkeletonRows = () => {
    const skeletonRows = Array.from({ length: rowsPerPage }, (_, index) => index);

    return skeletonRows.map((index) => (
      <StyledTableRow key={`skeleton-${index}`}>
        {columns.map((column) => {
          const width = getColumnWidth(column);
          const maxWidth = getColumnMaxWidth(column);
          const cellStyle: React.CSSProperties = { minWidth: width };
          if (maxWidth !== undefined) {
            cellStyle.maxWidth = maxWidth;
            cellStyle.width = maxWidth;
          }

          return (
            <StyledTableCell
              key={`skeleton-${index}-${String(column.id)}`}
              align={column.align ?? "left"}
              style={cellStyle}
            >
              <Skeleton
                variant="text"
                width={column.type === "id" ? 30 : "80%"}
                height={24}
                animation="wave"
              />
            </StyledTableCell>
          );
        })}
        {hasActions && (
          <ActionsCell align="center">
            <Skeleton variant="circular" width={24} height={24} animation="wave" />
          </ActionsCell>
        )}
      </StyledTableRow>
    ));
  };

  const renderTableHeader = () => (
    <StyledTableHead>
      <StyledTableRow>
        {columns.map((column) => {
          const width = getColumnWidth(column);
          const maxWidth = getColumnMaxWidth(column);
          const headerStyle: React.CSSProperties = { minWidth: width };
          if (maxWidth !== undefined) {
            headerStyle.maxWidth = maxWidth;
            headerStyle.width = maxWidth;
          }

          const HeaderCellComponent = column.sticky ? StickyHeaderCell : StyledHeaderCell;

          return (
            <HeaderCellComponent
              key={String(column.id)}
              align={column.align ?? "left"}
              style={headerStyle}
              position={column.stickyPosition}
            >
              {column.label}
            </HeaderCellComponent>
          );
        })}
        {hasActions && <ActionsHeaderCell align="center" />}
      </StyledTableRow>
    </StyledTableHead>
  );

  return (
    <TableWrapper>
      <StyledTableContainer>
        <Table style={{ width: "100%", minWidth: 650 }}>
          {renderTableHeader()}
          <TableBody>
            {loading ? (
              renderSkeletonRows()
            ) : !rows?.length ? (
              <StyledTableRow>
                <StyledTableCell colSpan={columns.length + (hasActions ? 1 : 0)}>
                  <EmptyStateContainer>
                    <Typography variant="body2" color="text.secondary">
                      {emptyMessage}
                    </Typography>
                  </EmptyStateContainer>
                </StyledTableCell>
              </StyledTableRow>
            ) : (
              rows?.map((row) => (
                <StyledTableRow
                  key={String(row[rowKey])}
                  onClick={() => onRowClick?.(row)}
                  sx={onRowClick ? { cursor: "pointer" } : undefined}
                >
                  {columns.map((column) => {
                    const value = getValue(row, column.id);
                    return renderCell(value, column, row);
                  })}
                  {hasActions && (
                    <ActionsCell align="center" onClick={(e) => e.stopPropagation()}>
                      <ActionsButton onClick={(e) => handleOpenMenu(e, row)}>
                        <MoreVertIcon />
                      </ActionsButton>
                    </ActionsCell>
                  )}
                </StyledTableRow>
              ))
            )}
          </TableBody>
        </Table>
      </StyledTableContainer>

      {total > 0 && (
        <StyledTablePagination
          rowsPerPageOptions={rowsPerPageOptions}
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
        />
      )}

      <StyledMenu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        {visibleActions?.map((action) => {
          const isHidden =
            typeof action.hidden === "function" && selectedRow
              ? action.hidden(selectedRow)
              : Boolean(action.hidden);
          if (isHidden) return null;

          const isDisabled =
            typeof action.disabled === "function" && selectedRow
              ? action.disabled(selectedRow)
              : Boolean(action.disabled);
          const resolvedLabel =
            typeof action.label === "function"
              ? selectedRow
                ? action.label(selectedRow)
                : ""
              : action.label;
          const resolvedColor =
            typeof action.color === "function" && selectedRow
              ? action.color(selectedRow)
              : action.color;
          return (
            <StyledMenuItem
              key={action.id}
              onClick={() => !isDisabled && handleActionClick(action)}
              disabled={isDisabled}
              sx={{ color: resolvedColor === "error" ? "error.main" : "inherit" }}
            >
              {action.icon}
              {resolvedLabel}
            </StyledMenuItem>
          );
        })}
      </StyledMenu>
    </TableWrapper>
  );
}
