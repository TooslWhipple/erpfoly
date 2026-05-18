import { Box, Stack, Typography, Skeleton } from "@mui/material";
import { Lightbulb } from "lucide-react";
import type { PriceSuggestionItem } from "@/types/liquidaciones.types";
import { PriceSuggestionCard } from "@/components/PriceSuggestionCard";
import {
  SidebarContainer,
  SidebarHeader,
  SidebarTitle,
  SidebarSubtitle,
  SidebarIcon,
  SuggestionsList,
} from "./styles";

// ============================================================================
// TYPES
// ============================================================================

export interface PriceSuggestionsSidebarProps {
  suggestions: PriceSuggestionItem[];
  loading?: boolean;
  onApply?: (item: PriceSuggestionItem, price: number) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function PriceSuggestionsSidebar({
  suggestions,
  loading = false,
  onApply,
}: PriceSuggestionsSidebarProps) {
  if (loading) {
    return (
      <SidebarContainer>
        <SidebarHeader>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <SidebarIcon>
              <Lightbulb size={20} color="#FCD34D" />
            </SidebarIcon>
            <SidebarTitle>Sugerencias</SidebarTitle>
          </Stack>
        </SidebarHeader>
        <Skeleton variant="text" width="90%" sx={{ mb: 2 }} animation="wave" />
        <SuggestionsList>
          {[1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              height={160}
              sx={{ borderRadius: 2 }}
              animation="wave"
            />
          ))}
        </SuggestionsList>
      </SidebarContainer>
    );
  }

  if (suggestions.length === 0) {
    return (
      <SidebarContainer>
        <SidebarHeader>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <SidebarIcon>
              <Lightbulb size={20} color="#FCD34D" />
            </SidebarIcon>
            <SidebarTitle>Sugerencias</SidebarTitle>
          </Stack>
        </SidebarHeader>
        <Box sx={{ padding: 2, color: "#71717A", fontSize: 14 }}>
          No hay sugerencias de precios disponibles
        </Box>
      </SidebarContainer>
    );
  }

  return (
    <SidebarContainer>
      <SidebarHeader>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <SidebarIcon>
            <Lightbulb size={20} color="#FCD34D" />
          </SidebarIcon>
          <SidebarTitle>Sugerencias [{suggestions.length}]</SidebarTitle>
        </Stack>
      </SidebarHeader>
      <SidebarSubtitle>
        Precios sugeridos para artículos identificados con lento movimiento.
      </SidebarSubtitle>

      <SuggestionsList>
        {suggestions.map((item) => (
          <PriceSuggestionCard
            key={item.id}
            item={item}
            onApply={onApply}
          />
        ))}
      </SuggestionsList>
    </SidebarContainer>
  );
}
