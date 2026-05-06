import { useEffect, useMemo, useState } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";

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
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { FormTextField } from "@/components";
import { MultiSelectChips } from "@/components/MultiSelectChips";
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
import type { DepartmentCatalogItem } from "@/services/departments.service";
import { getDepartmentLines } from "@/services/departments.service";
import { getProductsByLineIds } from "@/services/productos.service";

interface DepartmentsTabProps {
  formState: PromotionFormState;
  onFieldChange: (field: keyof PromotionFormState, value: unknown) => void;
  onProductsFetched: (productIds: number[]) => void;
  departmentCatalog: DepartmentCatalogItem[];
  departmentsCatalogLoading: boolean;
  departmentsCatalogError: string | null;
}

export function DepartmentsTab({
  formState,
  onFieldChange,
  onProductsFetched,
  departmentCatalog,
}: DepartmentsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");

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

  useEffect(() => {
    const allowed = new Set(mergedLines.map((l) => l.id));
    const filtered = formState.selectedLineIds.filter((id) => allowed.has(id));
    if (filtered.length !== formState.selectedLineIds.length) {
      onFieldChange("selectedLineIds", filtered);
    }
  }, [allowedLineIdsKey]);

  const sortedLineKey = [...formState.selectedLineIds].sort((a, b) => a - b).join(",");

  const productsQuery = useQuery({
    queryKey: ["products-by-lines-promotion", sortedLineKey],
    queryFn: () => getProductsByLineIds([...formState.selectedLineIds]),
    enabled: formState.selectedLineIds.length > 0,
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    if (formState.selectedLineIds.length === 0) {
      if (formState.selectedProductIds.length > 0) {
        onFieldChange("selectedProductIds", []);
      }
      return;
    }
    if (productsQuery.isFetching || productsQuery.data === undefined) return;
    const rows = Array.isArray(productsQuery.data) ? productsQuery.data : [];
    onProductsFetched(rows.map((p) => p.id));
  }, [
    productsQuery.data,
    productsQuery.isFetching,
    formState.selectedLineIds.length,
    sortedLineKey,
    formState.selectedProductIds.length,
    onFieldChange,
    onProductsFetched,
  ]);

  const linesLoading = lineQueries.some((q) => q.isFetching);
  const firstLineQueryError = lineQueries.find((q) => q.isError);

  const filteredProducts = useMemo(() => {
    const rows = Array.isArray(productsQuery.data) ? productsQuery.data : [];
    if (!searchTerm.trim()) return rows;
    const q = searchTerm.toLowerCase();
    return rows.filter(
      (p) =>
        p.code.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.line.toLowerCase().includes(q)
    );
  }, [productsQuery.data, searchTerm]);

  const handleDepartmentChange = (selectedIds: (string | number)[]) => {
    onFieldChange(
      "selectedDepartmentIds",
      selectedIds.map((id) => Number(id)).filter((n) => Number.isFinite(n))
    );
  };

  const handleLineChange = (selectedIds: (string | number)[]) => {
    onFieldChange(
      "selectedLineIds",
      selectedIds.map((id) => Number(id)).filter((n) => Number.isFinite(n))
    );
  };

  const handleProductToggle = (productId: number) => {
    const currentIds = formState.selectedProductIds || [];
    const isSelected = currentIds.includes(productId);
    const newIds = isSelected
      ? currentIds.filter((id) => id !== productId)
      : [...currentIds, productId];
    onFieldChange("selectedProductIds", newIds);
  };

  const handleSelectAllProducts = () => {
    const allSelected =
      filteredProducts.length > 0 &&
      filteredProducts.every((p) => formState.selectedProductIds.includes(p.id));
    if (allSelected) {
      const drop = new Set(filteredProducts.map((p) => p.id));
      onFieldChange(
        "selectedProductIds",
        formState.selectedProductIds.filter((id) => !drop.has(id))
      );
    } else {
      const next = new Set(formState.selectedProductIds);
      filteredProducts.forEach((p) => next.add(p.id));
      onFieldChange("selectedProductIds", [...next]);
    }
  };

  const isAllSelected =
    filteredProducts.length > 0 &&
    filteredProducts.every((p) => formState.selectedProductIds.includes(p.id));

  const chipStatus = (status: string): "Activo" | "Draft" =>
    status === "ACTIVE" ? "Activo" : "Draft";

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
        {
          formState.selectedDepartmentIds.length > 0 &&
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
        }
      </FormCard>

      <FormCard>
        <Stack direction="row" justifyContent="space-between" width="100%">
          <Typography variant="subtitle1">Productos</Typography>
          <SearchContainer>
            <FormTextField
              placeholder="Buscar"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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

        {
          productsQuery.isFetching && formState.selectedLineIds.length > 0 ?
            <div
              style={{ display: "flex", justifyContent: "center", paddingTop: "32px" }}>
              <CircularProgress size={28} />
            </div>
            :
            <TableContainer>
              <Table>
                <StyledTableHead>
                  <TableRow>
                    <StyledTableCell padding="checkbox" width={48}>
                      <Checkbox
                        checked={isAllSelected}
                        indeterminate={
                          !isAllSelected &&
                          filteredProducts.some((p) =>
                            formState.selectedProductIds.includes(p.id)
                          )
                        }
                        onChange={handleSelectAllProducts}
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
                  {filteredProducts.length === 0 ? (
                    <TableRow>
                      <ArticleTableCell
                        colSpan={7}
                        align="center"
                        sx={{ py: 4, color: "text.secondary" }}
                      >
                        {formState.selectedLineIds.length === 0
                          ? "Selecciona líneas para ver productos"
                          : searchTerm
                            ? "No se encontraron productos"
                            : "Sin productos para las líneas seleccionadas"}
                      </ArticleTableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product) => {
                      const isSelected = formState.selectedProductIds.includes(product.id);
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
        }
      </FormCard>
    </>
  );
}
