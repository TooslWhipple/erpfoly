import { useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getMunicipalityCatalog } from "@/services/municipalities.service";

const SEARCH_STALE_TIME_MS = 6 * 60 * 60 * 1000;
const SEARCH_GC_TIME_MS = 24 * 60 * 60 * 1000;

interface UseShippingMunicipalityCatalogParams {
  searchInput: string;
  open: boolean;
}

export function useShippingMunicipalityCatalog({
  searchInput,
  open,
}: UseShippingMunicipalityCatalogParams) {
  const debouncedSearch = useDebouncedValue(searchInput.trim(), 300);

  const preloadQuery = useQuery({
    queryKey: ["municipalities", "preload", 20],
    queryFn: () =>
      getMunicipalityCatalog({
        limit: 20,
      }),
    staleTime: SEARCH_STALE_TIME_MS,
    gcTime: SEARCH_GC_TIME_MS,
  });

  const searchQuery = useQuery({
    queryKey: ["municipalities", "search", debouncedSearch],
    queryFn: () =>
      getMunicipalityCatalog({
        search: debouncedSearch,
        limit: 25,
      }),
    enabled: open && debouncedSearch.length >= 2,
    staleTime: SEARCH_STALE_TIME_MS,
    gcTime: SEARCH_GC_TIME_MS,
    placeholderData: (previous) => previous,
  });

  return {
    preloadMunicipalities: preloadQuery.data ?? [],
    searchedMunicipalities: searchQuery.data ?? [],
    isFetching: preloadQuery.isFetching || searchQuery.isFetching,
    debouncedSearch,
  };
}
