import { useState } from "react";
import { Button, Chip, CircularProgress, Table, TableBody, Typography } from "@mui/material";
import { MoreVert as MoreVertIcon } from "@mui/icons-material";
import {
  StyledTableContainer,
  StyledPaper,
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
  LoadingContainer,
} from "./styles";

export type ColumnType = "text" | "number" | "currency" | "percentage" | "date" | "boolean" | "chip" | "button";

export type ColumnSize = "xs" | "sm" | "md" | "lg" | "xl";

const COLUMN_SIZES: Record<ColumnSize, number> = {
  xs: 60,
  sm: 100,
  md: 150,
  lg: 200,
  xl: 280,
};

export interface ChipStyleConfig {
  label?: string;
  bgColor: string;
  textColor: string;
}

export interface Column<T> {
  id: keyof T | string;
  label: string;
  type?: ColumnType;
  size?: ColumnSize;
  align?: "left" | "center" | "right";
  truncate?: boolean;
  format?: (value: T[keyof T], row: T) => React.ReactNode;
  buttonLabel?: string;
  buttonVariant?: "text" | "outlined" | "contained";
  buttonColor?: "primary" | "secondary" | "error" | "warning" | "info" | "success";
  onButtonClick?: (row: T) => void;
  chipColor?: "default" | "primary" | "secondary" | "error" | "warning" | "info" | "success";
  chipConfig?: Record<string, ChipStyleConfig>;
  currencySymbol?: string;
}

export interface RowAction<T> {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: (row: T) => void;
  color?: "inherit" | "error" | "primary" | "secondary";
  permission?: string;
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
}: TableCrudProps<T>) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<T | null>(null);

  const getColumnWidth = (column: Column<T>): number => {
    if (column.size) {
      return COLUMN_SIZES[column.size];
    }
    // Default sizes based on type
    switch (column.type) {
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
      case "button":
        return COLUMN_SIZES.md;
      default:
        return COLUMN_SIZES.md;
    }
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
      case "number":
        return typeof rawValue === "number" ? rawValue.toLocaleString() : String(rawValue ?? "");
      
      case "currency":
        const symbol = column.currencySymbol || "$";
        return typeof rawValue === "number" 
          ? `${symbol}${rawValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : String(rawValue ?? "");
      
      case "percentage":
        return typeof rawValue === "number" ? `${rawValue.toFixed(2)}%` : String(rawValue ?? "");
      
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
      
      case "chip":
        const chipKey = String(rawValue);
        const chipStyle = column.chipConfig?.[chipKey];
        
        if (chipStyle) {
          return (
            <Chip
              label={chipStyle.label ?? chipKey}
              size="small"
              sx={{
                backgroundColor: chipStyle.bgColor,
                color: chipStyle.textColor,
                borderRadius: "6px",
                fontWeight: 500,
                fontSize: "13px",
              }}
            />
          );
        }
        
        return (
          <Chip
            label={chipKey}
            size="small"
            color={column.chipColor || "default"}
          />
        );
      
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
    if (isNumericType) {
      CellComponent = NumberCell;
    } else if (column.truncate) {
      CellComponent = TruncatedCell;
    }
    
    const width = getColumnWidth(column);

    return (
      <CellComponent
        key={String(column.id)}
        align={column.align || (isNumericType ? "right" : "left")}
        style={{ width, minWidth: column.truncate ? undefined : width }}
        title={column.truncate ? String(value ?? "") : undefined}
      >
        {formattedValue}
      </CellComponent>
    );
  };

  const total = totalRows ?? rows.length;
  const hasActions = actions && actions.length > 0;

  if (loading) {
    return (
      <StyledTableContainer component={StyledPaper}>
        <LoadingContainer>
          <CircularProgress size={40} />
        </LoadingContainer>
      </StyledTableContainer>
    );
  }

  return (
    <StyledTableContainer component={StyledPaper}>
      <Table style={{ minWidth: 650 }}>
        <StyledTableHead>
          <StyledTableRow>
            {columns.map((column) => {
              const width = getColumnWidth(column);
              const isNumericType = column.type === "number" || column.type === "currency" || column.type === "percentage";
              return (
                <StyledHeaderCell
                  key={String(column.id)}
                  align={column.align || (isNumericType ? "right" : "left")}
                  style={{ width, minWidth: width }}
                >
                  {column.label}
                </StyledHeaderCell>
              );
            })}
            {hasActions && <ActionsHeaderCell align="center" />}
          </StyledTableRow>
        </StyledTableHead>
        <TableBody>
          {rows.length === 0 ? (
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
            rows.map((row) => (
              <StyledTableRow key={String(row[rowKey])}>
                {columns.map((column) => {
                  const value = getValue(row, column.id);
                  return renderCell(value, column, row);
                })}
                {hasActions && (
                  <ActionsCell align="center">
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

      {total > 0 && (
        <StyledTablePagination
          rowsPerPageOptions={rowsPerPageOptions}
          component="div"
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
        {actions?.map((action) => (
          <StyledMenuItem
            key={action.id}
            onClick={() => handleActionClick(action)}
            sx={{ color: action.color === "error" ? "error.main" : "inherit" }}
          >
            {action.icon}
            {action.label}
          </StyledMenuItem>
        ))}
      </StyledMenu>
    </StyledTableContainer>
  );
}
