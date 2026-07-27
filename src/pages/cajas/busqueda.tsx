import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { Stack, Typography } from "@mui/material";
import {
  ClientSearchResults,
  type ClientSearchResult,
  type CashSearchMode,
} from "@/components/CashRegister";
import type { CashRegisterStatus } from "@/styles/cajas.styles";
import { useCashRegisterSession } from "@/hooks/useCashRegisterSession";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { getApiErrorMessage } from "@/lib/axios";
import {
  buildCashRegisterSearchUrl,
  getCashRegisterSearchQuery,
  getCashRegisterSearchMode,
} from "@/lib/cashRegisterRoutes";
import { searchClientsForPayment } from "@/services/cash-register.service";
import { getSales } from "@/services/ventas.service";
import type { SaleListItem } from "@/types/ventas.types";
function getCashRegisterStatusLabel(status: CashRegisterStatus): string {
  return status === "open" ? "Abierta" : "Cerrada";
}
export default function CajasBusquedaPage() {
  const router = useRouter();
  const showError = useSnackbarStore((state) => state.showError);
  const { cashRegister, isLoading } = useCashRegisterSession();
  const [searchInput, setSearchInput] = useState("");
  const [mode, setMode] = useState<CashSearchMode>("abonos");
  const [results, setResults] = useState<ClientSearchResult[]>([]);
  const [saleResults, setSaleResults] = useState<SaleListItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const urlQuery = router.isReady
    ? getCashRegisterSearchQuery(router.query)
    : "";
  const urlMode = router.isReady
    ? getCashRegisterSearchMode(router.query)
    : "abonos";
  const runClientSearch = useCallback(
    async (trimmed: string) => {
      const matches = await searchClientsForPayment(trimmed);
      setResults(matches);
      setSaleResults([]);
      if (matches.length === 0) {
        showError("No se encontraron clientes con ese código o nombre.");
      }
    },
    [showError],
  );
  const runSaleSearch = useCallback(
    async (trimmed: string) => {
      if (!cashRegister) return;
      const numericAmount = Number(trimmed.replace(/[^0-9.]/g, ""));
      const isAmountSearch =
        /^[\d.,]+$/.test(trimmed) && Number.isFinite(numericAmount);
      const res = await getSales({
        page: 1,
        limit: 20,
        statusTab: "pendingCashier",
        ...(isAmountSearch
          ? { amount: numericAmount }
          : { search: trimmed }),
      });
      if (res.error) throw new Error(res.error.message);
      const matches = res.data?.rows ?? [];
      setSaleResults(matches);
      setResults([]);
      if (matches.length === 0) {
        showError("No se encontraron ventas pendientes de cobro.");
      }
    },
    [showError, cashRegister],
  );
  const runSearch = useCallback(
    async (query: string, modeArg: CashSearchMode) => {
      const trimmed = query.trim();
      if (!trimmed) return;
      try {
        setIsSearching(true);
        if (modeArg === "ventas") {
          await runSaleSearch(trimmed);
        } else {
          await runClientSearch(trimmed);
        }
        setHasSearched(true);
      } catch (err) {
        showError(getApiErrorMessage(err));
        setResults([]);
        setSaleResults([]);
        setHasSearched(true);
      } finally {
        setIsSearching(false);
      }
    },
    [showError, runClientSearch, runSaleSearch],
  );
  useEffect(() => {
    if (!router.isReady) return;
    if (!urlQuery) {
      router.replace("/cajas");
      return;
    }
    setSearchInput(urlQuery);
    setMode(urlMode);
    void runSearch(urlQuery, urlMode);
  }, [router.isReady, urlQuery, urlMode, runSearch, router]);
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
    if (trimmed === urlQuery && mode === urlMode) {
      void runSearch(trimmed, mode);
      return;
    }
    router.push(buildCashRegisterSearchUrl(trimmed, mode));
  };
  const handleBack = () => {
    router.push("/cajas");
  };
  const handleRowClick = (client: ClientSearchResult) => {
    router.push(`/clientes/${client.id}`);
  };
  const handleSaleRowClick = (sale: SaleListItem) => {
    router.push(`/ventas/${sale.id}`);
  };
  const handleModeChange = (nextMode: CashSearchMode) => {
    setMode(nextMode);
    setResults([]);
    setSaleResults([]);
    setHasSearched(false);
    const trimmed = searchInput.trim();
    if (trimmed) {
      void runSearch(trimmed, nextMode);
    }
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
        saleResults={saleResults}
        isSearching={isSearching || !hasSearched}
        onSearchQueryChange={setSearchInput}
        onSearch={handleSearch}
        onBack={handleBack}
        onRowClick={handleRowClick}
        onSaleRowClick={handleSaleRowClick}
        mode={mode}
        onModeChange={handleModeChange}
      />
    </Stack>
  );
}
