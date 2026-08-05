import { useMemo, useState } from "react";
import {
  Autocomplete,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { BranchAutocompleteField } from "@/components/BranchSelectionModal/styles";
import { MOCK_RECOVERY_SHEET_BRANCHES } from "@/data/recovery-sheets.mockData";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
  getBranchesCatalog,
  type BranchCatalogItem,
} from "@/services/branches.service";

const SEARCH_DEBOUNCE_MS = 300;

const MOCK_BRANCH_CATALOG: BranchCatalogItem[] =
  MOCK_RECOVERY_SHEET_BRANCHES.map((branch) => ({
    id: branch.id,
    name: branch.name,
    is_main_warehouse: branch.id === 1,
  }));

function getBranchLabel(branch: BranchCatalogItem): string {
  if (branch.is_main_warehouse) {
    return `${branch.name} (Matriz)`;
  }
  return branch.name;
}

function withSelectedBranch(
  branches: BranchCatalogItem[],
  selected: BranchCatalogItem | null,
): BranchCatalogItem[] {
  if (!selected || branches.some((branch) => branch.id === selected.id)) {
    return branches;
  }
  return [selected, ...branches];
}

async function fetchBranchCatalog(search: string): Promise<BranchCatalogItem[]> {
  try {
    return await getBranchesCatalog(search || undefined);
  } catch {
    const query = search.trim().toLowerCase();
    if (!query) return MOCK_BRANCH_CATALOG;
    return MOCK_BRANCH_CATALOG.filter((branch) =>
      branch.name.toLowerCase().includes(query),
    );
  }
}

export interface RecoverySheetBranchAutocompleteProps {
  value: BranchCatalogItem | null;
  onChange: (branch: BranchCatalogItem | null) => void;
  disabled?: boolean;
  enabled: boolean;
}

export function RecoverySheetBranchAutocomplete({
  value,
  onChange,
  disabled = false,
  enabled,
}: RecoverySheetBranchAutocompleteProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS);

  const { data: branches, isFetching } = useQuery({
    queryKey: ["branches-catalog", "recovery-sheet", debouncedSearch.trim()],
    queryFn: () => fetchBranchCatalog(debouncedSearch.trim()),
    enabled: enabled && dropdownOpen,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });

  const options = useMemo(
    () => withSelectedBranch(branches ?? MOCK_BRANCH_CATALOG, value),
    [branches, value],
  );

  return (
    <Autocomplete<BranchCatalogItem, false, false, false>
      fullWidth
      open={dropdownOpen}
      onOpen={() => setDropdownOpen(true)}
      onClose={() => {
        setDropdownOpen(false);
        setSearchInput("");
      }}
      disabled={disabled}
      options={options}
      value={value}
      loading={isFetching}
      loadingText="Buscando sucursales..."
      noOptionsText="Sin resultados"
      filterOptions={(list) => list}
      getOptionLabel={getBranchLabel}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      onInputChange={(_, nextInput, reason) => {
        if (reason === "input") {
          setSearchInput(nextInput);
        }
      }}
      onChange={(_, option) => {
        onChange(option);
        setSearchInput("");
      }}
      renderOption={(props, option) => (
        <li {...props} key={option.id}>
          <Stack spacing={0.25}>
            <Typography variant="body2">{getBranchLabel(option)}</Typography>
          </Stack>
        </li>
      )}
      renderInput={(params) => (
        <BranchAutocompleteField
          {...params}
          label="Sucursal"
          placeholder="Buscar sucursal"
          size="small"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {isFetching ? (
                  <CircularProgress color="inherit" size={18} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}
