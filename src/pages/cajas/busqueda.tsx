import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { Stack, Typography } from "@mui/material";
import { ArrowLeft } from "lucide-react";
import { StatusChip } from "@/components";
import {
  ClientSearchResults,
  type ClientSearchResult,
  type CashSearchMode,
} from "@/components/CashRegister";
import { InlineMobileMenuButton } from "@/components/Layout";
import { BackButton } from "@/components/Breadcrumbs/Breadcrumbs.styles";
import { PageHeader, PageShell } from "@/components/SaleBuilder/styles";
import {
  type CashRegisterStatus,
  CashRegisterPageContent,
} from "@/styles/cajas.styles";
import { useCashRegisterSession } from "@/hooks/useCashRegisterSession";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { getApiErrorMessage } from "@/lib/axios";
import {
  buildCashRegisterSearchUrl,
  buildCashRegisterSaleUrl,
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
        statusTab: "pendingCollection",
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
    router.push(buildCashRegisterSaleUrl(sale.id));
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
      <PageShell
        sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}
      >
        <PageHeader>
          <InlineMobileMenuButton />
        </PageHeader>
        <Stack flex={1} justifyContent="center" alignItems="center">
          <Typography variant="body1">Cargando...</Typography>
        </Stack>
      </PageShell>
    );
  }
  if (!cashRegister) {
    return (
      <PageShell
        sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}
      >
        <PageHeader>
          <InlineMobileMenuButton />
        </PageHeader>
        <Stack flex={1} justifyContent="center" alignItems="center" px={2}>
          <Typography variant="h6" color="text.secondary">
            No tienes una caja asignada
          </Typography>
        </Stack>
      </PageShell>
    );
  }
  if (cashRegister.status === "closed") {
    return null;
  }
  return (
    <PageShell>
      <PageHeader>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          minWidth={0}
          flex="1 1 auto"
        >
          <InlineMobileMenuButton />
          <BackButton onClick={handleBack} size="small">
            <ArrowLeft size={20} />
          </BackButton>
          <Typography variant="h6" fontWeight={700} noWrap>
            {cashRegister.name}
          </Typography>
          <StatusChip
            label={getCashRegisterStatusLabel(cashRegister.status)}
            variant="success"
            size="small"
          />
        </Stack>
      </PageHeader>
      <CashRegisterPageContent>
        <ClientSearchResults
          searchQuery={searchInput}
          results={results}
          saleResults={saleResults}
          isSearching={isSearching || !hasSearched}
          onSearchQueryChange={setSearchInput}
          onSearch={handleSearch}
          onRowClick={handleRowClick}
          onSaleRowClick={handleSaleRowClick}
          mode={mode}
          onModeChange={handleModeChange}
        />
      </CashRegisterPageContent>
    </PageShell>
  );
}
