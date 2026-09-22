import { useEffect, useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";

import {
  Table,
  TableBody,
  TableRow,
  Checkbox,
  InputAdornment,
  Typography,
  Stack,
  TableContainer,
  CircularProgress,
  Box,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Search as SearchIcon } from "@mui/icons-material";
import { FormTextField } from "@/components";
import { MultiSelectChips } from "@/components/MultiSelectChips";
import { StyledTablePagination } from "@/components/TableCrud/styles";
import { FormCard } from "@/styles/catalogos/productos.styles";
import {
  StyledTableHead,
  StyledTableCell,
  StyledTableRow,
  ArticleTableCell,
  StatusChip,
  SearchContainer,
} from "@/styles/catalogos/promociones.styles";
import type { PromotionFormState } from "@/types/promociones.types";
import { EMPTY_PRODUCT_SELECTION } from "@/types/promociones.types";
import type { DepartmentCatalogItem } from "@/services/departments.service";
import { getDepartmentLines } from "@/services/departments.service";
import { getProductsByLineIds } from "@/services/productos.service";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { useDebouncedInput } from "@/hooks/useDebouncedValue";

const SEARCH_DEBOUNCE_MS = 300;
const DEFAULT_ROWS_PER_PAGE = 50;
const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

interface DepartmentsTabProps {
  formState: PromotionFormState;
  onFieldChange: (field: keyof PromotionFormState, value: unknown) => void;
  departmentCatalog: DepartmentCatalogItem[];
  departmentsCatalogLoading: boolean;
  departmentsCatalogError: string | null;
}

function isProductSelected(
  selection: PromotionFormState["productSelection"],
  productId: number,
): boolean {
  if (selection.selectAll) {
    return !selection.excludedIds.includes(productId);
  }
  return selection.includedIds.includes(productId);
}

export function DepartmentsTab({
  formState,
  onFieldChange,
  departmentCatalog,
}: DepartmentsTabProps) {
  const [searchInput, setSearchInput, debouncedSearch] = useDebouncedInput(
    "",
    SEARCH_DEBOUNCE_MS,
  );

  const departmentItems = useMemo(() => {
    const rows = Array.isArray(departmentCatalog) ? departmentCatalog : [];
    return rows.map((dept) => ({
      id: dept.id,
      label: dept.code ? `${dept.code} — ${dept.name}` : dept.name,
    }));
  }, [departmentCatalog]);

  const lineQueries = useQueries({
    queries: formState.selectedDepartmentIds.map((deptId) => ({
      queryKey: ["department-lines", deptId],
      queryFn: () => getDepartmentLines(deptId),
      staleTime: 5 * 60 * 1000,
      enabled: Number.isFinite(deptId),
    })),
  });

  const mergedLines = useMemo(() => {
    const map = new Map<number, { id: number; label: string }>();
    lineQueries.forEach((q) => {
      const data = Array.isArray(q.data) ? q.data : [];
      if (data.length === 0) return;
      for (const line of data) {
        if (map.has(line.id)) continue;
        const label = line.code ? `${line.code} — ${line.name}` : line.name;
        map.set(line.id, { id: line.id, label });
      }
    });
    return [...map.values()].sort((a, b) => a.label.localeCompare(b.label));
  }, [lineQueries]);

  const allowedLineIdsKey = mergedLines
    .map((l) => l.id)
    .sort((a, b) => a - b)
    .join(",");

  const linesLoading = lineQueries.some((q) => q.isPending || q.isFetching);
  const linesReady =
    formState.selectedDepartmentIds.length > 0 &&
    lineQueries.length === formState.selectedDepartmentIds.length &&
    lineQueries.every((q) => q.isFetched);

  useEffect(() => {
    if (!linesReady) return;
    const allowed = new Set(mergedLines.map((l) => l.id));
    const filtered = formState.selectedLineIds.filter((id) => allowed.has(id));
    if (filtered.length !== formState.selectedLineIds.length) {
      onFieldChange("selectedLineIds", filtered);
    }
  }, [allowedLineIdsKey, linesReady, formState.selectedLineIds, onFieldChange]);

  const lineIds = formState.selectedLineIds;
  const extraParams = useMemo(
    () => ({
      lineIds,
    }),
    [lineIds],
  );

  const {
    data: products,
    total: totalRows,
    scopeTotal,
    page,
    rowsPerPage,
    setPage,
    setRowsPerPage,
    setSearch,
    isLoading: productsLoading,
    isFetching: productsFetching,
  } = usePaginatedList({
    queryKey: ["products-by-lines-promotion"],
    queryFn: getProductsByLineIds,
    initialPage: 0,
    initialRowsPerPage: DEFAULT_ROWS_PER_PAGE,
    extraParams,
    enabled: lineIds.length > 0,
  });

  useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);

  useEffect(() => {
    setPage(0);
  }, [extraParams, setPage]);

  useEffect(() => {
    if (lineIds.length > 0) return;
    const selection = formState.productSelection;
    if (
      selection.selectAll ||
      selection.excludedIds.length > 0 ||
      selection.includedIds.length > 0
    ) {
      onFieldChange("productSelection", EMPTY_PRODUCT_SELECTION);
    }
  }, [lineIds.length, formState.productSelection, onFieldChange]);

  const handleDepartmentChange = (selectedIds: (string | number)[]) => {
    onFieldChange(
      "selectedDepartmentIds",
      selectedIds.map((id) => Number(id)).filter((n) => Number.isFinite(n)),
    );
  };

  const handleLineChange = (selectedIds: (string | number)[]) => {
    const nextLineIds = selectedIds
      .map((id) => Number(id))
      .filter((n) => Number.isFinite(n));
    onFieldChange("selectedLineIds", nextLineIds);
    if (
      formState.selectedLineIds.length === 0 &&
      nextLineIds.length > 0 &&
      !formState.productSelection.selectAll &&
      formState.productSelection.includedIds.length === 0
    ) {
      onFieldChange("productSelection", {
        selectAll: true,
        excludedIds: [],
        includedIds: [],
      });
    }
  };

  const selection = formState.productSelection;

  const handleProductToggle = (productId: number) => {
    if (selection.selectAll) {
      const excluded = new Set(selection.excludedIds);
      if (excluded.has(productId)) {
        excluded.delete(productId);
      } else {
        excluded.add(productId);
      }
      onFieldChange("productSelection", {
        ...selection,
        excludedIds: [...excluded],
      });
      return;
    }

    const included = new Set(selection.includedIds);
    if (included.has(productId)) {
      included.delete(productId);
    } else {
      included.add(productId);
    }
    onFieldChange("productSelection", {
      ...selection,
      includedIds: [...included],
    });
  };

  const handleSelectAllProducts = () => {
    const allSelected = selection.selectAll && selection.excludedIds.length === 0;
    onFieldChange(
      "productSelection",
      allSelected
        ? EMPTY_PRODUCT_SELECTION
        : { selectAll: true, excludedIds: [], includedIds: [] },
    );
  };

  const isAllSelected =
    lineIds.length > 0 && selection.selectAll && selection.excludedIds.length === 0;
  const isIndeterminate =
    (selection.selectAll && selection.excludedIds.length > 0) ||
    (!selection.selectAll && selection.includedIds.length > 0);

  const chipStatus = (status: string): "Activo" | "Draft" =>
    status === "ACTIVE" ? "Activo" : "Draft";

  const showInitialLoading =
    (linesLoading || productsLoading) && lineIds.length > 0 && products.length === 0;

  return (
    <>
      <FormCard>
        <Typography variant="h6">Departamentos donde se aplicará la promoción</Typography>
        <Stack spacing={0.5}>
          <Typography variant="subtitle1">Departamentos</Typography>
          <MultiSelectChips
            searchable
            searchPlaceholder="Buscar departamento"
            items={departmentItems}
            selectedIds={formState.selectedDepartmentIds || []}
            onChange={handleDepartmentChange}
          />
        </Stack>
        {formState.selectedDepartmentIds.length > 0 && (
          <Stack spacing={0.5}>
            <Typography variant="subtitle1">Líneas</Typography>
            <MultiSelectChips
              searchable
              searchPlaceholder="Buscar línea"
              items={mergedLines.map((l) => ({ id: l.id, label: l.label }))}
              selectedIds={formState.selectedLineIds || []}
              onChange={handleLineChange}
            />
          </Stack>
        )}
      </FormCard>

      <FormCard>
        <Stack direction="row" justifyContent="space-between" width="100%" alignItems="center">
          <Stack spacing={0.25}>
            <Typography variant="subtitle1">Productos</Typography>
            {lineIds.length > 0 && (
              <Typography variant="caption" color="text.secondary">
                {isAllSelected
                  ? `Todos los ${scopeTotal} productos de las líneas actuales`
                  : "Seleccionar todos aplica a las líneas actuales, no solo a esta página"}
              </Typography>
            )}
          </Stack>
          <SearchContainer>
            <FormTextField
              placeholder="Buscar"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              sx={{ width: 300 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />
          </SearchContainer>
        </Stack>

        {showInitialLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", pt: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <>
            <Box sx={{ position: "relative" }}>
              {productsFetching && products.length > 0 && (
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "center",
                    pt: 3,
                    bgcolor: (theme) => alpha(theme.palette.background.paper, 0.6),
                    zIndex: 1,
                  }}
                >
                  <CircularProgress size={28} />
                </Box>
              )}
            <TableContainer>
              <Table>
                <StyledTableHead>
                  <TableRow>
                    <StyledTableCell padding="checkbox" width={48}>
                      <Checkbox
                        checked={isAllSelected}
                        indeterminate={!isAllSelected && isIndeterminate}
                        onChange={handleSelectAllProducts}
                        disabled={lineIds.length === 0}
                      />
                    </StyledTableCell>
                    <StyledTableCell>Código</StyledTableCell>
                    <StyledTableCell>Estatus</StyledTableCell>
                    <StyledTableCell>Nombre</StyledTableCell>
                    <StyledTableCell>Departamento</StyledTableCell>
                    <StyledTableCell>Línea</StyledTableCell>
                    <StyledTableCell>Proveedor</StyledTableCell>
                  </TableRow>
                </StyledTableHead>
                <TableBody>
                  {products.length === 0 ? (
                    <TableRow>
                      <ArticleTableCell
                        colSpan={7}
                        align="center"
                        sx={{ py: 4, color: "text.secondary" }}
                      >
                        {lineIds.length === 0
                          ? "Selecciona líneas para ver productos"
                          : searchInput
                            ? "No se encontraron productos"
                            : "Sin productos para las líneas seleccionadas"}
                      </ArticleTableCell>
                    </TableRow>
                  ) : (
                    products.map((product) => {
                      const isSelected = isProductSelected(selection, product.id);
                      const statusChip = chipStatus(product.status);
                      return (
                        <StyledTableRow key={product.id}>
                          <ArticleTableCell padding="checkbox">
                            <Checkbox
                              checked={isSelected}
                              onChange={() => handleProductToggle(product.id)}
                            />
                          </ArticleTableCell>
                          <ArticleTableCell>{product.code}</ArticleTableCell>
                          <ArticleTableCell>
                            <StatusChip
                              label={statusChip}
                              status={statusChip}
                              size="small"
                            />
                          </ArticleTableCell>
                          <ArticleTableCell>{product.name}</ArticleTableCell>
                          <ArticleTableCell>{product.department}</ArticleTableCell>
                          <ArticleTableCell>{product.line}</ArticleTableCell>
                          <ArticleTableCell>{product.supplier ?? "—"}</ArticleTableCell>
                        </StyledTableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            </Box>
            {lineIds.length > 0 && totalRows > 0 && (
              <StyledTablePagination
                slots={{ root: "div" }}
                rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
                count={totalRows}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                onRowsPerPageChange={(event) =>
                  setRowsPerPage(Number.parseInt(event.target.value, 10))
                }
                labelRowsPerPage="Filas por página:"
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
                }
              />
            )}
          </>
        )}
      </FormCard>
    </>
  );
}
