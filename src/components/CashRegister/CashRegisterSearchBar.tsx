import { InputAdornment, MenuItem } from "@mui/material";
import { Search } from "lucide-react";
import { theme } from "@/styles/theme";
import {
  PaymentTypeSelect,
  SearchBarButton,
  SearchBarContainer,
  SearchInput,
} from "@/styles/cajas.styles";
import type { CashRegisterSearchBarProps } from "./types";

export function CashRegisterSearchBar({
  searchQuery,
  isSearching = false,
  onSearchQueryChange,
  onSearch,
  mode,
  onModeChange,
}: CashRegisterSearchBarProps) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      onSearch?.();
    }
  };

  return (
    <SearchBarContainer>
      <PaymentTypeSelect
        size="small"
        value={mode}
        onChange={(event) => onModeChange(event.target.value as typeof mode)}
      >
        <MenuItem value="abonos">Abonos</MenuItem>
        <MenuItem value="ventas">Cobros Pendientes</MenuItem>
      </PaymentTypeSelect>

      <SearchInput
        placeholder={
          mode === "ventas"
            ? "Buscar por Folio, Cliente o Vendedor"
            : "Ingresa código o nombre del cliente"
        }
        value={searchQuery}
        onChange={(event) => onSearchQueryChange(event.target.value)}
        onKeyDown={handleKeyDown}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search size={16} color={theme.palette.text.secondary} />
            </InputAdornment>
          ),
        }}
      />

      <SearchBarButton
        variant="contained"
        disabled={!searchQuery.trim() || isSearching}
        onClick={onSearch}
      >
        {isSearching ? "Buscando..." : "Buscar"}
      </SearchBarButton>
    </SearchBarContainer>
  );
}
