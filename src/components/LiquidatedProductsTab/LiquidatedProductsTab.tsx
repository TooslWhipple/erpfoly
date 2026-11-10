import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Button, Skeleton, Stack, TextField, Typography } from "@mui/material";
import { CardListPagination } from "@/components/CardListPagination";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getLiquidatedProducts } from "@/services/liquidaciones.service";
import { ArticlesGrid } from "@/styles/inventario/departamento.styles";
import { LiquidatedProductCard } from "./LiquidatedProductCard";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

export const LIQUIDATED_PRODUCTS_QUERY_KEY = "liquidated-products";

export interface LiquidatedProductsTabProps {
  departmentId: string;
}

/** "En Liquidación" tab: red-label products of a department that still have stock. */
export function LiquidatedProductsTab({ departmentId }: LiquidatedProductsTabProps) {
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim(), SEARCH_DEBOUNCE_MS);
  const [lastSearch, setLastSearch] = useState(search);
  if (search !== lastSearch) {
    setLastSearch(search);
    setPage(0);
  }

  const query = useQuery({
    queryKey: [LIQUIDATED_PRODUCTS_QUERY_KEY, departmentId, page, search],
    enabled: departmentId.length > 0,
    placeholderData: keepPreviousData,
    queryFn: () =>
      getLiquidatedProducts(departmentId, {
        page: page + 1,
        limit: PAGE_SIZE,
        search: search || undefined,
      }),
  });
  const rows = query.data?.data ?? [];

  return (
    <Stack spacing={2} sx={{ mt: 2 }}>
      <TextField
        size="small"
        placeholder="Buscar por nombre o SKU"
        value={searchInput}
        onChange={(event) => setSearchInput(event.target.value)}
        fullWidth
      />
      {query.isFetching && rows.length === 0 ? (
        <ArticlesGrid sx={{ mt: 0 }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              height={180}
              sx={{ borderRadius: 2 }}
              animation="wave"
            />
          ))}
        </ArticlesGrid>
      ) : query.isError && rows.length === 0 ? (
        <Stack spacing={1.5} alignItems="flex-start">
          <Typography color="text.secondary">
            No se pudieron cargar los artículos en liquidación.
          </Typography>
          <Button variant="outlined" onClick={() => void query.refetch()}>
            Reintentar
          </Button>
        </Stack>
      ) : rows.length === 0 ? (
        <Typography color="text.secondary">
          {search
            ? "No hay artículos en liquidación que coincidan con la búsqueda."
            : "No hay artículos en liquidación con existencias en este departamento."}
        </Typography>
      ) : (
        <ArticlesGrid sx={{ mt: 0 }}>
          {rows.map((item) => (
            <LiquidatedProductCard key={item.id} item={item} />
          ))}
        </ArticlesGrid>
      )}
      {!(query.isError && rows.length === 0) && (
        <CardListPagination
          variant="compact"
          page={page}
          total={query.data?.total ?? 0}
          rowsPerPage={PAGE_SIZE}
          disabled={query.isFetching}
          onPageChange={setPage}
        />
      )}
    </Stack>
  );
}
