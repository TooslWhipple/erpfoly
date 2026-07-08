import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { Stack, Typography } from "@mui/material";
import {
  ClientSearchResults,
  type ClientSearchResult,
} from "@/components/CashRegister";
import type { CashRegisterStatus } from "@/styles/cajas.styles";
import { useCashRegisterSession } from "@/hooks/useCashRegisterSession";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { getApiErrorMessage } from "@/lib/axios";
import {
  buildCashRegisterSearchUrl,
  getCashRegisterSearchQuery,
} from "@/lib/cashRegisterRoutes";
import { searchClientsForPayment } from "@/services/cash-register.service";
function getCashRegisterStatusLabel(status: CashRegisterStatus): string {
  return status === "open" ? "Abierta" : "Cerrada";
}
export default function CajasBusquedaPage() {
  const router = useRouter();
  const showError = useSnackbarStore((state) => state.showError);
  const { cashRegister, isLoading } = useCashRegisterSession();
  const [searchInput, setSearchInput] = useState("");
  const [results, setResults] = useState<ClientSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const urlQuery = router.isReady
    ? getCashRegisterSearchQuery(router.query)
    : "";
  const runSearch = useCallback(
    async (query: string) => {
      const trimmed = query.trim();
      if (!trimmed) return;
      try {
        setIsSearching(true);
        const matches = await searchClientsForPayment(trimmed);
        setResults(matches);
        setHasSearched(true);
        if (matches.length === 0) {
          showError("No se encontraron clientes con ese código o nombre.");
        }
      } catch (err) {
        showError(getApiErrorMessage(err));
        setResults([]);
        setHasSearched(true);
      } finally {
        setIsSearching(false);
      }
    },
    [showError],
  );
  useEffect(() => {
    if (!router.isReady) return;
    if (!urlQuery) {
      router.replace("/cajas");
      return;
    }
    setSearchInput(urlQuery);
    void runSearch(urlQuery);
  }, [router.isReady, urlQuery, runSearch, router]);
  useEffect(() => {
    if (!router.isReady || isLoading || !cashRegister) return;
    if (cashRegister.status === "closed") {
      showError("La caja debe estar abierta para buscar clientes.");
      router.replace("/cajas");
    }
  }, [router, isLoading, cashRegister, showError]);
  const handleSearch = () => {
    const trimmed = searchInput.trim();
    if (!trimmed) return;
    if (trimmed === urlQuery) {
      void runSearch(trimmed);
      return;
    }
    router.push(buildCashRegisterSearchUrl(trimmed));
  };
  const handleBack = () => {
    router.push("/cajas");
  };
  const handleRowClick = (client: ClientSearchResult) => {
    router.push(`/clientes/${client.id}`);
  };
  if (isLoading || !router.isReady) {
    return (
      <Stack
        justifyContent="center"
        alignItems="center"
        style={{
          marginTop: "112px",
          minHeight: "200px",
        }}
      >
        <Typography variant="body1">Cargando...</Typography>
      </Stack>
    );
  }
  if (!cashRegister) {
    return (
      <Stack
        justifyContent="center"
        alignItems="center"
        style={{
          marginTop: "112px",
          minHeight: "200px",
        }}
      >
        <Typography variant="h6" color="text.secondary">
          No tienes una caja asignada
        </Typography>
      </Stack>
    );
  }
  if (cashRegister.status === "closed") {
    return null;
  }
  return (
    <Stack spacing={3} justifyContent="center" alignItems="stretch">
      <ClientSearchResults
        cashRegisterName={cashRegister.name}
        cashRegisterStatusLabel={getCashRegisterStatusLabel(
          cashRegister.status,
        )}
        cashRegisterStatus={cashRegister.status}
        searchQuery={searchInput}
        results={results}
        isSearching={isSearching || !hasSearched}
        onSearchQueryChange={setSearchInput}
        onSearch={handleSearch}
        onBack={handleBack}
        onRowClick={handleRowClick}
      />
    </Stack>
  );
}
