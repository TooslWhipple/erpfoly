import { Button, Stack, TextField, Typography, Skeleton } from "@mui/material";
import { Sparkle } from "lucide-react";
import type { PriceSuggestionItem } from "@/types/liquidaciones.types";
import { PriceSuggestionCard } from "@/components/PriceSuggestionCard";
import { CardListPagination } from "@/components/CardListPagination";
import { SidebarIcon } from "./styles";

export interface PriceSuggestionsSidebarProps {
  suggestions: PriceSuggestionItem[];
  total: number;
  page: number;
  rowsPerPage?: number;
  loading?: boolean;
  error?: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onRetry?: () => void;
  onApply?: (item: PriceSuggestionItem, price: number) => void;
}

export function PriceSuggestionsSidebar({
  suggestions,
  total,
  page,
  rowsPerPage = 10,
  loading = false,
  error = false,
  search,
  onSearchChange,
  onPageChange,
  onRetry,
  onApply,
}: PriceSuggestionsSidebarProps) {
  return (
    <Stack spacing={2}>
      <Stack spacing={1}>
        <SidebarIcon><Sparkle size={16} /></SidebarIcon>
        <Typography variant="body1" fontWeight={700}>Sugerencias [{total}]</Typography>
        <Typography variant="body2" color="text.secondary">Precios sugeridos para artículos identificados con lento movimiento.</Typography>
      </Stack>

      <TextField
        size="small"
        placeholder="Buscar por nombre o SKU"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        fullWidth
      />

      {
        loading && suggestions.length === 0 ?
          [1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rectangular" height={160} sx={{ borderRadius: 2 }} animation="wave" />
          ))
          : error && suggestions.length === 0 ?
            <Stack spacing={1.5} alignItems="flex-start">
              <Typography variant="body2" color="text.secondary">
                No se pudieron cargar las sugerencias.
              </Typography>
              {onRetry ? (
                <Button variant="outlined" onClick={onRetry}>
                  Reintentar
                </Button>
              ) : null}
            </Stack>
            : suggestions.length === 0 ?
              <Typography variant="body2" color="text.secondary">
                {search
                  ? "No hay sugerencias que coincidan con la búsqueda"
                  : "No hay sugerencias de precios disponibles"}
              </Typography>
              :
              suggestions.map((item) => (
                <PriceSuggestionCard key={item.id} item={item} onApply={onApply} />
              ))
      }

      {!(error && suggestions.length === 0) ? (
        <CardListPagination
          variant="compact"
          page={page}
          total={total}
          rowsPerPage={rowsPerPage}
          disabled={loading}
          onPageChange={onPageChange}
        />
      ) : null}
    </Stack>
  );
}
