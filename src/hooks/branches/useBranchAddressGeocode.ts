import { useQuery, type QueryObserverResult } from "@tanstack/react-query";
import { geocodeBranchAddress, type GeocodeBranchResult } from "@/services/branches.service";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

export interface BranchGeocodeAddressInput {
  street?: string;
  externalNumber?: string;
  internalNumber?: string;
  neighborhoodName?: string;
  municipality?: string;
  state?: string;
  postalCode?: string;
}

const STALE_TIME_MS = 24 * 60 * 60 * 1000;
const DEBOUNCE_MS = 600;

function isComplete(address: BranchGeocodeAddressInput): boolean {
  return Boolean(
    address.street?.trim() &&
      address.externalNumber?.trim() &&
      address.neighborhoodName?.trim() &&
      address.municipality?.trim() &&
      address.state?.trim() &&
      address.postalCode?.trim(),
  );
}

function addressKey(address: BranchGeocodeAddressInput): string {
  return [
    address.street ?? "",
    address.externalNumber ?? "",
    address.internalNumber ?? "",
    address.neighborhoodName ?? "",
    address.municipality ?? "",
    address.state ?? "",
    address.postalCode ?? "",
  ]
    .map((s) => s.trim().toLowerCase())
    .join("|");
}

export function useBranchAddressGeocode(
  address: BranchGeocodeAddressInput,
  debounceMs: number = DEBOUNCE_MS,
): QueryObserverResult<GeocodeBranchResult | null> {
  const debouncedAddress = useDebouncedValue(address, debounceMs);
  const key = addressKey(debouncedAddress);
  const enabled = isComplete(debouncedAddress);

  return useQuery<GeocodeBranchResult | null>({
    queryKey: ["branches", "geocode", key],
    queryFn: async () => {
      const result = await geocodeBranchAddress({
        street: debouncedAddress.street ?? "",
        externalNumber: debouncedAddress.externalNumber,
        internalNumber: debouncedAddress.internalNumber,
        neighborhoodName: debouncedAddress.neighborhoodName,
        municipality: debouncedAddress.municipality,
        state: debouncedAddress.state,
        postalCode: debouncedAddress.postalCode,
      });
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
    enabled,
    staleTime: STALE_TIME_MS,
    retry: 1,
  });
}
