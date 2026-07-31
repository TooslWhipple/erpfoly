import { Button, InputAdornment, MenuItem } from "@mui/material";
import { Search } from "lucide-react";
import { theme } from "@/styles/theme";
import {
  PaymentTypeSelect,
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
        <MenuItem value="ventas">Ventas</MenuItem>
      </PaymentTypeSelect>

      <SearchInput
        placeholder={
          mode === "ventas"
            ? "Ingresa folio, cliente o monto"
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

      <Button
        variant="contained"
        sx={{ minWidth: "112px" }}
        disabled={!searchQuery.trim() || isSearching}
        onClick={onSearch}
      >
        {isSearching ? "Buscando..." : "Buscar"}
      </Button>
    </SearchBarContainer>
  );
}
