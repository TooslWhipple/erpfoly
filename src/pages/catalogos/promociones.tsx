import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Stack } from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { MainLayout, Title, TableCrud, FilterMenu, TabFilters } from "@/components";
import type { Column, RowAction } from "@/components/TableCrud";
import type { PromotionListItem } from "@/types/promociones.types";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { useDebouncedInput } from "@/hooks/useDebouncedValue";
import { formatDate } from "@/utils/date";
import {
  getPromotions,
  deletePromotion,
  getPromotionListFilters,
} from "@/services/promociones.service";
import {
  CATALOG_PROMOTIONS_CREATE,
  CATALOG_PROMOTIONS_DELETE,
  CATALOG_PROMOTIONS_UPDATE,
} from "@/lib/permissions";

const SEARCH_DEBOUNCE_MS = 300;
const FILTER_CATALOG_STALE_MS = 5 * 60 * 1000;

function extractNumericIds(selected: (string | number)[]): number[] {
  return [...new Set(
    selected
      .filter((value) => value !== "all")
      .map((value) => (typeof value === "number" ? value : parseInt(String(value), 10)))
      .filter((value) => Number.isInteger(value) && value > 0),
  )];
}

export default function Promociones() {
  const router = useRouter();

  const [selectedBranches, setSelectedBranches] = useState<(string | number)[]>(["all"]);
  const [selectedDepartments, setSelectedDepartments] = useState<(string | number)[]>(["all"]);

  const listExtraParams = useMemo(() => {
    const branchIds = extractNumericIds(selectedBranches);
    const departmentIds = extractNumericIds(selectedDepartments);
    return {
      ...(branchIds.length > 0 ? { branchIds } : {}),
      ...(departmentIds.length > 0 ? { departmentIds } : {}),
    };
  }, [selectedBranches, selectedDepartments]);

  const {
    data: promotionRows,
    total: totalRows,
    page,
    rowsPerPage,
    search: searchValue,
    setPage,
    setRowsPerPage: handleRowsPerPageChange,
    setSearch,
    isLoading: loading,
    refetch,
  } = usePaginatedList<PromotionListItem>({
    queryKey: ["promotions", "list"],
    queryFn: getPromotions,
    initialPage: 0,
    initialRowsPerPage: 10,
    initialSearch: "",
    extraParams: listExtraParams,
  });

  const [searchInput, setSearchInput, debouncedSearch] = useDebouncedInput(
    searchValue,
    SEARCH_DEBOUNCE_MS
  );

  useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);

  useEffect(() => {
    setPage(0);
  }, [listExtraParams, setPage]);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchInput(value);
    },
    [setSearchInput]
  );

  const { data: listFilters } = useQuery({
    queryKey: ["promotions", "list-filters"],
    queryFn: getPromotionListFilters,
    staleTime: FILTER_CATALOG_STALE_MS,
  });

  const branchFilterOptions = listFilters?.branches ?? [];
  const departmentFilterOptions = listFilters?.departments ?? [];

  const handleCreatePromotion = useCallback(() => {
    router.push("/catalogos/promociones/nuevo");
  }, [router]);

  const handleViewDetails = useCallback(
    (promotion: PromotionListItem) => {
      router.push(`/catalogos/promociones/${promotion.id}`);
    },
    [router]
  );

  const handleEditPromotion = useCallback(
    (promotion: PromotionListItem) => {
      router.push(`/catalogos/promociones/${promotion.id}`);
    },
    [router]
  );

  const handleDeletePromotion = useCallback(
    async (promotion: PromotionListItem) => {
      if (
        !window.confirm(`¿Estás seguro de eliminar la promoción "${promotion.name}"?`)
      ) {
        return;
      }
      const result = await deletePromotion(promotion.id);
      if (!result.error) {
        void refetch();
      }
    },
    [refetch]
  );

  const handleBranchFilterChange = useCallback((selectedIds: (string | number)[]) => {
    setSelectedBranches(selectedIds);
  }, []);

  const handleDepartmentFilterChange = useCallback((selectedIds: (string | number)[]) => {
    setSelectedDepartments(selectedIds);
  }, []);

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);
    },
    [setPage]
  );

  const columns = useMemo<Column<PromotionListItem>[]>(
    () => [
      {
        id: "id",
        label: "ID",
        type: "id",
        size: "sm",
        maxSize: "xs",
        idPadding: 2,
      },
      {
        id: "name",
        label: "Nombre",
        size: "xl",
      },
      {
        id: "discount_rate",
        label: "Margen",
        type: "percentage",
        size: "sm",
        align: "left",
      },
      {
        id: "purchase_type_label",
        label: "Tipo",
        size: "md",
        type: "text",
      },
      {
        id: "start_date",
        label: "Inicio",
        type: "text",
        size: "md",
        format: (value) => formatDate(String(value), "dateNumeric"),
      },
      {
        id: "end_date",
        label: "Fin",
        type: "text",
        size: "md",
        format: (value) =>
          formatDate(value as string | null | undefined, "dateNumeric", {
            fallback: "Sin fecha fin",
          }),
      },
      {
        id: "department_summary",
        label: "Departamentos",
        size: "lg",
      },
      {
        id: "branch_summary",
        label: "Sucursales",
        size: "lg",
      },
    ],
    []
  );

  const actions = useMemo<RowAction<PromotionListItem>[]>(
    () => [
      {
        id: "view",
        label: "Ver detalles",
        icon: <VisibilityIcon fontSize="small" />,
        onClick: handleViewDetails,
        permission: CATALOG_PROMOTIONS_UPDATE,
      },
      {
        id: "edit",
        label: "Editar",
        icon: <EditIcon fontSize="small" />,
        onClick: handleEditPromotion,
        permission: CATALOG_PROMOTIONS_UPDATE,
      },
      {
        id: "delete",
        label: "Eliminar",
        icon: <DeleteIcon fontSize="small" />,
        onClick: handleDeletePromotion,
        color: "error",
        permission: CATALOG_PROMOTIONS_DELETE,
      },
    ],
    [handleViewDetails, handleEditPromotion, handleDeletePromotion]
  );

  return (
    <MainLayout>
      <Stack direction="column" spacing={3}>
        <Title title="Promociones" />
        <Stack direction="row" spacing={2} alignContent="center" justifyContent="space-between">
          <Stack direction="row" spacing={2} alignContent="center">
            <FilterMenu
              label="sucursales"
              title="Sucursales"
              options={branchFilterOptions}
              selectedIds={selectedBranches}
              onChange={handleBranchFilterChange}
              allOptionId="all"
              allOptionLabel="Todas"
            />
            <FilterMenu
              label="departamentos"
              title="Departamentos"
              options={departmentFilterOptions}
              selectedIds={selectedDepartments}
              onChange={handleDepartmentFilterChange}
              allOptionId="all"
              allOptionLabel="Todos"
            />
          </Stack>
          <TabFilters
            tabs={[]}
            activeTab=""
            onTabChange={() => {}}
            showSearch
            searchValue={searchInput}
            onSearchChange={handleSearchChange}
            actions={[
              {
                label: "Nuevo",
                onClick: handleCreatePromotion,
                permission: CATALOG_PROMOTIONS_CREATE,
              },
            ]}
          />
        </Stack>

        <TableCrud
          columns={columns}
          rows={promotionRows}
          actions={actions}
          loading={loading}
          rowKey="id"
          page={page}
          rowsPerPage={rowsPerPage}
          totalRows={totalRows}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          emptyMessage="No hay promociones registradas"
          onRowClick={handleViewDetails}
        />
      </Stack>
    </MainLayout>
  );
}
