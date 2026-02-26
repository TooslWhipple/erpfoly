import { Box, Typography } from "@mui/material";
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <SidebarIcon>
              <Lightbulb size={20} color="#FCD34D" />
            </SidebarIcon>
            <SidebarTitle>Sugerencias</SidebarTitle>
          </Box>
        </SidebarHeader>
        <Box sx={{ padding: 2, color: "#71717A", fontSize: 14 }}>
          Cargando...
        </Box>
      </SidebarContainer>
    );
  }

  if (suggestions.length === 0) {
    return (
      <SidebarContainer>
        <SidebarHeader>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <SidebarIcon>
              <Lightbulb size={20} color="#FCD34D" />
            </SidebarIcon>
            <SidebarTitle>Sugerencias</SidebarTitle>
          </Box>
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <SidebarIcon>
            <Lightbulb size={20} color="#FCD34D" />
          </SidebarIcon>
          <SidebarTitle>Sugerencias [{suggestions.length}]</SidebarTitle>
        </Box>
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
