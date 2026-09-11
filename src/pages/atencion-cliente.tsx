import { useState } from "react";
import { useRouter } from "next/router";
import {
  CircularProgress,
  InputAdornment,
  MenuItem,
  SelectChangeEvent,
  Stack,
} from "@mui/material";
import { Check as CheckIcon } from "@mui/icons-material";
import { Search } from "lucide-react";
import type { SearchType } from "@/types/atencion-cliente.types";
import {
  searchCustomerSupport,
  searchSalesForClient,
  type CustomerSupportSearchResult,
} from "@/services/customer-support.service";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { SearchResults } from "./atencion-cliente/components/SearchResults";
import {
  SearchPageContainer,
  LogoContainer,
  LogoText,
  VersionText,
  SearchBarContainer,
  SearchTypeSelect,
  SearchInput,
  SearchButton,
} from "@/styles/atencion-cliente.styles";

export default function AtencionCliente() {
  const router = useRouter();
  const showError = useSnackbarStore((state) => state.showError);
  const [searchType, setSearchType] = useState<SearchType>("facturas");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CustomerSupportSearchResult[] | null>(
    null,
  );
  const [searched, setSearched] = useState(false);
  const [resultsHint, setResultsHint] = useState<string | null>(null);

  const handleSearchTypeChange = (event: SelectChangeEvent<unknown>) => {
    setSearchType(event.target.value as SearchType);
    setResults(null);
    setSearched(false);
    setResultsHint(null);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setSearched(true);
    setResultsHint(null);
    try {
      const found = await searchCustomerSupport(searchQuery, searchType);
      setResults(found);
    } catch (error) {
      console.error("[AtencionCliente] Search error:", error);
      showError("No se pudo completar la búsqueda.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (result: CustomerSupportSearchResult) => {
    if (result.type === "facturas") {
      void router.push(`/atencion-cliente/${result.id}`);
      return;
    }
    if (result.clientId) {
      setLoading(true);
      setSearched(true);
      setResultsHint(`Facturas de ${result.title}`);
      try {
        const sales = await searchSalesForClient(result.clientId);
        setResults(sales);
        setSearchType("facturas");
      } catch (error) {
        console.error("[AtencionCliente] Client sales error:", error);
        showError("No se pudieron cargar las facturas del cliente.");
        setResults([]);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <SearchPageContainer pinnedTop={searched}>
      <LogoContainer>
        <LogoText compact={searched}>
          <span className="foly">FoLy</span>
          <span className="soft">Soft</span>
        </LogoText>
        {searched ? null : <VersionText>V1.0</VersionText>}
      </LogoContainer>

      <SearchBarContainer>
        <SearchTypeSelect
          value={searchType}
          onChange={handleSearchTypeChange}
          size="small"
        >
          <MenuItem value="facturas">
            <Stack direction="row" alignItems="center" spacing={1}>
              {searchType === "facturas" && <CheckIcon sx={{ fontSize: 16 }} />}
              Facturas
            </Stack>
          </MenuItem>
          <MenuItem value="clientes">
            <Stack direction="row" alignItems="center" spacing={1}>
              {searchType === "clientes" && <CheckIcon sx={{ fontSize: 16 }} />}
              Clientes
            </Stack>
          </MenuItem>
        </SearchTypeSelect>

        <SearchInput
          placeholder={
            searchType === "facturas"
              ? "Buscar por folio o nombre..."
              : "Buscar clientes..."
          }
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") void handleSearch();
          }}
          size="small"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" sx={{ color: "text.secondary" }}>
                <Search size={18} />
              </InputAdornment>
            ),
          }}
        />

        <SearchButton
          variant="contained"
          color="primary"
          onClick={() => void handleSearch()}
          disabled={loading || !searchQuery.trim()}
          startIcon={
            loading ? <CircularProgress size={16} color="inherit" /> : undefined
          }
        >
          Buscar
        </SearchButton>
      </SearchBarContainer>

      {searched ? (
        <SearchResults
          results={results ?? []}
          loading={loading}
          hint={resultsHint}
          onSelect={(result) => void handleSelect(result)}
        />
      ) : null}
    </SearchPageContainer>
  );
}
