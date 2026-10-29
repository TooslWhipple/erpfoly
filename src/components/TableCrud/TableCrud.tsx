import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Checkbox, Skeleton, Table, TableBody, Typography } from "@mui/material";
import { MoreVert as MoreVertIcon } from "@mui/icons-material";
import numeral from "numeral";
import { formatDate, formatDateOnly } from "@/utils/date";
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
  SortableHeaderLabel,
  StyledMenu,
  StyledMenuItem,
  StyledTablePagination,
  EmptyStateContainer,
  StickyHeaderCell,
  StickyCell,
  ColumnResizeHandle,
} from "./styles";
import { ChipGroup } from "../ChipGroup";
import { StatusChip } from "../StatusChip";
import type { StatusChipVariant } from "../StatusChip";

const RESIZE_MAX_WIDTH = 720;
const RESIZE_DEFAULT_MIN_WIDTH = 72;

export type ColumnType = "text" | "number" | "currency" | "percentage" | "date" | "dateOnly" | "boolean" | "chip" | "chipGroup" | "button" | "id";

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
  /** Explicit pixel width (used as default when resizable, or as minWidth otherwise). */
  width?: number;
  /** Minimum width when the column is resized. */
  minWidth?: number;
  /** When table resizable is on, this column can be dragged (default true if width is set). */
  resizable?: boolean;
  /**
   * When the table is wider than the sum of column widths, this column absorbs leftover space.
   * Only the first flexGrow column is used.
   */
  flexGrow?: boolean;
  align?: "left" | "center" | "right";
  truncate?: boolean;
  /** Allow header label to wrap onto multiple lines. */
  headerWrap?: boolean;
  /** Header click sorts this column when the table receives onSortChange. */
  sortable?: boolean;
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

function isRowActionHidden<T>(action: RowAction<T>, row: T): boolean {
  return typeof action.hidden === "function" ? action.hidden(row) : Boolean(action.hidden);
}

function rowHasVisibleActions<T>(
  actions: RowAction<T>[] | undefined,
  row: T,
): boolean {
  return Boolean(actions?.some((action) => !isRowActionHidden(action, row)));
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
  hidePagination?: boolean;
  selectable?: boolean;
  selectedRowKeys?: Set<string | number>;
  onSelectedRowKeysChange?: (keys: Set<string | number>) => void;
  /** When set, the header checkbox selects the full filtered result, not only the visible page. */
  headerSelection?: {
    checked: boolean;
    indeterminate: boolean;
    onToggle: () => void;
  };
  minTableWidth?: number;
  /** Fill the parent flex height; only the table body scrolls. */
  fillHeight?: boolean;
  /** Enable drag-to-resize on column headers (opt-in). */
  resizable?: boolean;
  /** Active sort column id. */
  sortField?: string;
  sortOrder?: "asc" | "desc";
  onSortChange?: (field: string, order: "asc" | "desc") => void;
}

function buildInitialColumnWidths<T>(columns: Column<T>[]): Record<string, number> {
  const widths: Record<string, number> = {};
  columns.forEach((column) => {
    const id = String(column.id);
    if (column.width != null) {
      widths[id] = column.width;
    }
  });
  return widths;
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
  hidePagination = false,
  selectable = false,
  selectedRowKeys,
  onSelectedRowKeysChange,
  headerSelection,
  minTableWidth = 650,
  fillHeight = false,
  resizable = false,
  sortField,
  sortOrder,
  onSortChange,
}: TableCrudProps<T>) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<T | null>(null);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() =>
    buildInitialColumnWidths(columns),
  );
  const [flexColumnPinned, setFlexColumnPinned] = useState(false);
  const resizeStateRef = useRef<{
    columnId: string;
    startX: number;
    startWidth: number;
  } | null>(null);
  const { hasPermission } = usePermissions();
  const visibleActions = actions?.filter((action) => {
    if (!action.permission) return true;
    return hasPermission(action.permission);
  });

  const getDefaultColumnWidth = (column: Column<T>): number => {
    if (column.width != null) {
      return column.width;
    }
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

  const getColumnWidth = (column: Column<T>): number => {
    const id = String(column.id);
    if (resizable && columnWidths[id] != null) {
      return columnWidths[id];
    }
    return getDefaultColumnWidth(column);
  };

  const getColumnMaxWidth = (column: Column<T>): number | undefined => {
    if (column.maxSize) {
      return COLUMN_SIZES[column.maxSize];
    }
    return undefined;
  };

  const isColumnResizable = (column: Column<T>): boolean => {
    if (!resizable) return false;
    if (column.resizable === false) return false;
    if (column.sticky) return false;
    if (column.resizable === true) return true;
    return column.width != null;
  };

  const flexColumnId = useMemo(() => {
    if (!resizable) return null;
    const flexCol = columns.find((column) => column.flexGrow);
    return flexCol ? String(flexCol.id) : null;
  }, [columns, resizable]);

  const resolvedMinTableWidth = useMemo(() => {
    if (!resizable) return minTableWidth;
    const columnsTotal = columns.reduce((sum, column) => {
      const id = String(column.id);
      const width = columnWidths[id] ?? column.width ?? COLUMN_SIZES[column.size ?? "md"];
      return sum + width;
    }, 0);
    const selectionWidth = selectable ? 48 : 0;
    const actionsWidth = visibleActions && visibleActions.length > 0 ? 56 : 0;
    return Math.max(minTableWidth, columnsTotal + selectionWidth + actionsWidth);
  }, [resizable, columns, columnWidths, minTableWidth, selectable, visibleActions]);

  const columnsRef = useRef(columns);
  columnsRef.current = columns;
  const columnWidthsRef = useRef(columnWidths);
  columnWidthsRef.current = columnWidths;

  const handleResizeMove = useCallback((event: MouseEvent) => {
    const state = resizeStateRef.current;
    if (!state) return;
    const column = columnsRef.current.find((item) => String(item.id) === state.columnId);
    if (!column) return;
    const minWidth = column.minWidth ?? RESIZE_DEFAULT_MIN_WIDTH;
    const nextWidth = Math.min(
      RESIZE_MAX_WIDTH,
      Math.max(minWidth, state.startWidth + (event.clientX - state.startX)),
    );
    setColumnWidths((prev) => ({ ...prev, [state.columnId]: nextWidth }));
  }, []);

  const handleResizeEnd = useCallback(() => {
    resizeStateRef.current = null;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    window.removeEventListener("mousemove", handleResizeMove);
    window.removeEventListener("mouseup", handleResizeEnd);
  }, [handleResizeMove]);

  const handleResizeStart = useCallback(
    (event: React.MouseEvent, column: Column<T>) => {
      event.preventDefault();
      event.stopPropagation();
      const columnId = String(column.id);
      const currentWidth =
        columnWidthsRef.current[columnId] ??
        column.width ??
        (column.size ? COLUMN_SIZES[column.size] : RESIZE_DEFAULT_MIN_WIDTH);
      resizeStateRef.current = {
        columnId,
        startX: event.clientX,
        startWidth: currentWidth,
      };
      if (flexColumnId === columnId) {
        setFlexColumnPinned(true);
      }
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      window.addEventListener("mousemove", handleResizeMove);
      window.addEventListener("mouseup", handleResizeEnd);
    },
    [flexColumnId, handleResizeEnd, handleResizeMove],
  );

  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", handleResizeMove);
      window.removeEventListener("mouseup", handleResizeEnd);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [handleResizeEnd, handleResizeMove]);

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

      case "dateOnly":
        return formatDateOnly(rawValue, "dateNumeric");

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
            onClick={(event) => {
              event.stopPropagation();
              column.onButtonClick?.(row);
            }}
          >
            {column.buttonLabel || String(rawValue)}
          </Button>
        );

      default:
        return String(rawValue ?? "");
    }
  };

  const getCellStyle = (column: Column<T>): React.CSSProperties => {
    const width = getColumnWidth(column);
    const maxWidth = getColumnMaxWidth(column);
    if (resizable) {
      const isFlexColumn = flexColumnId === String(column.id) && !flexColumnPinned;
      return {
        width: isFlexColumn ? undefined : width,
        minWidth: width,
        // Override TruncatedCell's maxWidth: 0 so fixed/flex column widths apply.
        maxWidth: isFlexColumn ? "none" : width,
        overflow: column.truncate ? "hidden" : undefined,
      };
    }
    const cellStyle: React.CSSProperties = { minWidth: width };
    if (maxWidth !== undefined) {
      cellStyle.maxWidth = maxWidth;
      cellStyle.width = maxWidth;
    }
    return cellStyle;
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

    const cellProps: React.ComponentProps<typeof StyledTableCell> & {
      position?: Column<T>["stickyPosition"];
    } = {
      align: column.align ?? "left",
      style: getCellStyle(column),
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
  const selectionEnabled = selectable && selectedRowKeys != null && onSelectedRowKeysChange != null;

  const getRowKeyValue = (row: T): string | number => {
    const value = row[rowKey];
    if (typeof value === "string" || typeof value === "number") {
      return value;
    }
    return String(value);
  };

  const visibleRowKeys = rows?.map(getRowKeyValue) ?? [];
  const allVisibleSelected =
    selectionEnabled &&
    visibleRowKeys.length > 0 &&
    visibleRowKeys.every((key) => selectedRowKeys.has(key));
  const someVisibleSelected =
    selectionEnabled &&
    visibleRowKeys.some((key) => selectedRowKeys.has(key)) &&
    !allVisibleSelected;

  const handleToggleRow = (row: T) => {
    if (!selectionEnabled) return;
    const key = getRowKeyValue(row);
    const next = new Set(selectedRowKeys);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    onSelectedRowKeysChange(next);
  };

  const handleToggleAllVisible = () => {
    if (!selectionEnabled) return;
    const next = new Set(selectedRowKeys);
    if (allVisibleSelected) {
      visibleRowKeys.forEach((key) => next.delete(key));
    } else {
      visibleRowKeys.forEach((key) => next.add(key));
    }
    onSelectedRowKeysChange(next);
  };

  const renderSkeletonRows = () => {
    const skeletonRows = Array.from({ length: rowsPerPage }, (_, index) => index);

    return skeletonRows.map((index) => (
      <StyledTableRow key={`skeleton-${index}`}>
        {selectionEnabled && (
          <StyledTableCell align="center" style={{ minWidth: 48, width: 48 }}>
            <Skeleton variant="circular" width={20} height={20} animation="wave" />
          </StyledTableCell>
        )}
        {columns.map((column) => (
          <StyledTableCell
            key={`skeleton-${index}-${String(column.id)}`}
            align={column.align ?? "left"}
            style={getCellStyle(column)}
          >
            <Skeleton
              variant="text"
              width={column.type === "id" ? 30 : "80%"}
              height={24}
              animation="wave"
            />
          </StyledTableCell>
        ))}
        {hasActions && (
          <ActionsCell align="center">
            <Skeleton variant="circular" width={24} height={24} animation="wave" />
          </ActionsCell>
        )}
      </StyledTableRow>
    ));
  };

  const handleColumnSort = (columnId: string) => {
    if (!onSortChange) return;
    const nextOrder: "asc" | "desc" =
      sortField === columnId && sortOrder === "desc" ? "asc" : "desc";
    onSortChange(columnId, nextOrder);
  };

  const renderTableHeader = () => (
    <StyledTableHead>
      <StyledTableRow>
        {selectionEnabled && (
          <StyledHeaderCell align="center" style={{ minWidth: 48, width: 48 }}>
            <Checkbox
              size="small"
              checked={headerSelection ? headerSelection.checked : allVisibleSelected}
              indeterminate={
                headerSelection ? headerSelection.indeterminate : someVisibleSelected
              }
              onChange={headerSelection ? headerSelection.onToggle : handleToggleAllVisible}
              onClick={(event) => event.stopPropagation()}
            />
          </StyledHeaderCell>
        )}
        {columns.map((column) => {
          const columnId = String(column.id);
          const canResize = isColumnResizable(column);
          const allowWrap = Boolean(column.headerWrap) || (resizable && column.type === "number");
          const HeaderCellComponent = column.sticky ? StickyHeaderCell : StyledHeaderCell;
          const isSortable = Boolean(column.sortable && onSortChange);
          const isActiveSort = sortField === columnId;

          return (
            <HeaderCellComponent
              key={columnId}
              align={column.align ?? "left"}
              style={getCellStyle(column)}
              position={column.stickyPosition}
              allowWrap={allowWrap}
              resizable={canResize}
            >
              {isSortable ? (
                <SortableHeaderLabel
                  active={isActiveSort}
                  direction={isActiveSort && sortOrder === "asc" ? "asc" : "desc"}
                  hideSortIcon={false}
                  onClick={() => handleColumnSort(columnId)}
                >
                  {column.label}
                </SortableHeaderLabel>
              ) : (
                column.label
              )}
              {canResize && (
                <ColumnResizeHandle
                  role="separator"
                  aria-orientation="vertical"
                  aria-label={`Redimensionar columna ${column.label}`}
                  onMouseDown={(event) => handleResizeStart(event, column)}
                />
              )}
            </HeaderCellComponent>
          );
        })}
        {hasActions && <ActionsHeaderCell align="center" />}
      </StyledTableRow>
    </StyledTableHead>
  );

  return (
    <TableWrapper fillHeight={fillHeight}>
      <StyledTableContainer fillHeight={fillHeight}>
        <Table
          stickyHeader={fillHeight}
          style={{
            width: "100%",
            minWidth: resolvedMinTableWidth,
            tableLayout: resizable ? "fixed" : undefined,
          }}
        >
          {resizable && (
            <colgroup>
              {selectionEnabled && <col style={{ width: 48 }} />}
              {columns.map((column) => {
                const columnId = String(column.id);
                const width = getColumnWidth(column);
                const isFlexColumn = flexColumnId === columnId && !flexColumnPinned;
                return (
                  <col
                    key={columnId}
                    style={
                      isFlexColumn
                        ? { minWidth: width }
                        : { width, minWidth: width }
                    }
                  />
                );
              })}
              {hasActions && <col style={{ width: 56 }} />}
            </colgroup>
          )}
          {renderTableHeader()}
          <TableBody>
            {loading ? (
              renderSkeletonRows()
            ) : !rows?.length ? (
              <StyledTableRow>
                <StyledTableCell
                  colSpan={
                    columns.length + (hasActions ? 1 : 0) + (selectionEnabled ? 1 : 0)
                  }
                >
                  <EmptyStateContainer>
                    <Typography variant="body2" color="text.secondary">
                      {emptyMessage}
                    </Typography>
                  </EmptyStateContainer>
                </StyledTableCell>
              </StyledTableRow>
            ) : (
              rows?.map((row) => {
                const actionsDisabled = !rowHasVisibleActions(visibleActions, row);
                return (
                <StyledTableRow
                  key={String(row[rowKey])}
                  onClick={() => onRowClick?.(row)}
                  sx={onRowClick ? { cursor: "pointer" } : undefined}
                >
                  {selectionEnabled && (
                    <StyledTableCell
                      align="center"
                      style={{ minWidth: 48, width: 48 }}
                      onClick={(event) => event.stopPropagation()}
                    >
                      <Checkbox
                        size="small"
                        checked={selectedRowKeys.has(getRowKeyValue(row))}
                        onChange={() => handleToggleRow(row)}
                      />
                    </StyledTableCell>
                  )}
                  {columns.map((column) => {
                    const value = getValue(row, column.id);
                    return renderCell(value, column, row);
                  })}
                  {hasActions && (
                    <ActionsCell align="center" onClick={(e) => e.stopPropagation()}>
                      <ActionsButton
                        disabled={actionsDisabled}
                        onClick={(e) => {
                          if (actionsDisabled) return;
                          handleOpenMenu(e, row);
                        }}
                      >
                        <MoreVertIcon />
                      </ActionsButton>
                    </ActionsCell>
                  )}
                </StyledTableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </StyledTableContainer>

      {!hidePagination && total > 0 && (
        <StyledTablePagination
          slots={{ root: "div" }}
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
