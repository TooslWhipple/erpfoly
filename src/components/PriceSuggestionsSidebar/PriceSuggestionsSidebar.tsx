import { Stack, Typography, Skeleton } from "@mui/material";
import { Sparkle } from "lucide-react";
import type { PriceSuggestionItem } from "@/types/liquidaciones.types";
import { PriceSuggestionCard } from "@/components/PriceSuggestionCard";
import { SidebarIcon } from "./styles";

export interface PriceSuggestionsSidebarProps {
  suggestions: PriceSuggestionItem[];
  loading?: boolean;
  onApply?: (item: PriceSuggestionItem, price: number) => void;
}

export function PriceSuggestionsSidebar({ suggestions, loading = false, onApply }: PriceSuggestionsSidebarProps) {
  return (
    <Stack spacing={2}>
      <Stack spacing={1}>
        <SidebarIcon><Sparkle size={16} color="#F59E0B" /></SidebarIcon>
        <Typography variant="body1" fontWeight={700}>Sugerencias [{suggestions.length}]</Typography>
        <Typography variant="body2" color="text.secondary">Precios sugeridos para artículos identificados con lento movimiento.</Typography>
      </Stack>

      {
        (loading) ?
          [1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rectangular" height={160} sx={{ borderRadius: 2 }} animation="wave" />
          ))
          :
          (suggestions.length === 0) ?
            <Typography variant="body2" color="text.secondary">No hay sugerencias de precios disponibles</Typography>
            :
            suggestions.map((item) => (
              <PriceSuggestionCard key={item.id} item={item} onApply={onApply} />
            ))
      }
    </Stack>
  );
}
