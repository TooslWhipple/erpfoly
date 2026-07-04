"use client";

import { useMemo, useState } from "react";
import {
    Autocomplete,
    Button,
    CircularProgress,
    Stack,
    Typography,
} from "@mui/material";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ArrowRight, Building2 } from "lucide-react";
import { SideModal } from "@/components/SideModal";
import { getBranchesCatalog, type BranchCatalogItem } from "@/services/branches.service";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
    BranchAutocompleteField,
    BranchPreviewCard,
    RouteArrow,
    RoutePreviewCard,
} from "./styles";

const SEARCH_DEBOUNCE_MS = 300;

export interface BranchSelectionResult {
    origin: BranchCatalogItem;
    destination: BranchCatalogItem;
}

export interface BranchSelectionModalProps {
    open: boolean;
    onClose: () => void;
    onSelect: (selection: BranchSelectionResult) => void;
}

function getBranchLabel(branch: BranchCatalogItem): string {
    return branch.name;
}

function withSelectedBranch(
    branches: BranchCatalogItem[],
    selected: BranchCatalogItem | null,
): BranchCatalogItem[] {
    if (!selected || branches.some((b) => b.id === selected.id)) {
        return branches;
    }
    return [selected, ...branches];
}

function excludeBranch(
    branches: BranchCatalogItem[],
    excludeId?: number,
): BranchCatalogItem[] {
    if (excludeId == null) return branches;
    return branches.filter((b) => b.id !== excludeId);
}

interface BranchCatalogAutocompleteProps {
    label: string;
    placeholder: string;
    value: BranchCatalogItem | null;
    onChange: (branch: BranchCatalogItem | null) => void;
    excludeBranchId?: number;
    disabled?: boolean;
    enabled: boolean;
    error?: boolean;
    helperText?: string;
}

function BranchCatalogAutocomplete({
    label,
    placeholder,
    value,
    onChange,
    excludeBranchId,
    disabled = false,
    enabled,
    disableClearable = false,
    error = false,
    helperText,
}: BranchCatalogAutocompleteProps & { disableClearable?: boolean }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [searchInput, setSearchInput] = useState("");

    const debouncedSearch = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS);

    const { data: branches, isFetching } = useQuery({
        queryKey: ["branches-catalog", debouncedSearch.trim()],
        queryFn: async () => getBranchesCatalog(debouncedSearch.trim() || undefined),
        enabled: enabled && dropdownOpen,
        staleTime: 60_000,
        placeholderData: keepPreviousData,
    });

    const options = useMemo(() => {
        const filtered = excludeBranch(branches ?? [], excludeBranchId);
        return withSelectedBranch(filtered, value);
    }, [branches, excludeBranchId, value]);

    return (
        <Autocomplete<BranchCatalogItem, false, boolean, false>
            fullWidth
            disableClearable={disableClearable}
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
                if (reason === "clear") {
                    setSearchInput("");
                    onChange(null);
                }
            }}
            onChange={(_, option) => {
                onChange(option);
                setSearchInput("");
            }}
            renderOption={(props, option) => (
                <li {...props} key={option.id}>
                    <Stack spacing={0.25}>
                        <Typography variant="body2">{option.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                            ID {option.id}
                            {option.is_main_warehouse ? " · Matriz" : ""}
                        </Typography>
                    </Stack>
                </li>
            )}
            renderInput={(params) => (
                <BranchAutocompleteField
                    {...params}
                    label={label}
                    placeholder={placeholder}
                    size="small"
                    error={error}
                    helperText={helperText}
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <>
                                {isFetching ? <CircularProgress color="inherit" size={18} /> : null}
                                {params.InputProps.endAdornment}
                            </>
                        ),
                    }}
                />
            )}
        />
    );
}

interface BranchRoutePreviewProps {
    origin: BranchCatalogItem | null;
    destination: BranchCatalogItem | null;
}

function BranchRoutePreview({ origin, destination }: BranchRoutePreviewProps) {
    return (
        <RoutePreviewCard>
            <BranchPreviewCard $variant="origin">
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Origen
                </Typography>
                {origin ? (
                    <>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Building2 size={16} />
                            <Typography variant="subtitle2" fontWeight={600} noWrap title={origin.name}>
                                {origin.name}
                            </Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                            ID {origin.id}
                            {origin.is_main_warehouse ? " · Matriz" : ""}
                        </Typography>
                    </>
                ) : (
                    <Typography variant="body2" color="text.secondary">
                        Sin seleccionar
                    </Typography>
                )}
            </BranchPreviewCard>

            <RouteArrow>
                <ArrowRight size={20} />
            </RouteArrow>

            <BranchPreviewCard $variant="destination">
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Destino
                </Typography>
                {destination ? (
                    <>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Building2 size={16} />
                            <Typography variant="subtitle2" fontWeight={600} noWrap title={destination.name}>
                                {destination.name}
                            </Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                            ID {destination.id}
                        </Typography>
                    </>
                ) : (
                    <Typography variant="body2" color="text.secondary">
                        Sin seleccionar
                    </Typography>
                )}
            </BranchPreviewCard>
        </RoutePreviewCard>
    );
}

export function BranchSelectionModal({
    open,
    onClose,
    onSelect,
}: BranchSelectionModalProps) {
    const [originBranch, setOriginBranch] = useState<BranchCatalogItem | null>(null);
    const [destinationBranch, setDestinationBranch] = useState<BranchCatalogItem | null>(null);
    const [destinationError, setDestinationError] = useState<string | null>(null);

    const resetForm = () => {
        setOriginBranch(null);
        setDestinationBranch(null);
        setDestinationError(null);
    };

    const { data: initialBranches } = useQuery({
        queryKey: ["branches-catalog", ""],
        queryFn: async () => getBranchesCatalog(),
        enabled: open,
        staleTime: 60_000,
    });

    const defaultOriginBranch = useMemo(
        () => initialBranches?.find((b) => b.is_main_warehouse) ?? null,
        [initialBranches],
    );

    const resolvedOriginBranch = originBranch ?? defaultOriginBranch;

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleOriginChange = (branch: BranchCatalogItem | null) => {
        setOriginBranch(branch);
        if (branch && destinationBranch?.id === branch.id) {
            setDestinationBranch(null);
            setDestinationError(null);
        }
    };

    const handleDestinationChange = (branch: BranchCatalogItem | null) => {
        setDestinationBranch(branch);
        if (branch) {
            setDestinationError(null);
        }
    };

    const handleContinue = () => {
        if (!destinationBranch) {
            setDestinationError("La sucursal de destino es requerida.");
            return;
        }
        if (!resolvedOriginBranch) return;
        if (resolvedOriginBranch.id === destinationBranch.id) {
            setDestinationError("La sucursal de origen y destino deben ser distintas.");
            return;
        }
        onSelect({ origin: resolvedOriginBranch, destination: destinationBranch });
        resetForm();
        onClose();
    };

    const destinationDisabled = !resolvedOriginBranch;

    return (
        <SideModal
            open={open}
            onClose={handleClose}
            title="Sucursales"
            description="Selecciona la sucursal de origen y la de destino para continuar"
            maxWidth="md"
            contentSx={{ flex: 1, minHeight: 0 }}
            headerActions={
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleContinue}
                    sx={{ minWidth: 112, textTransform: "none", fontWeight: 600 }}
                >
                    Continuar
                </Button>
            }
        >
            <Stack spacing={2.5} sx={{ flex: 1 }}>
                <BranchCatalogAutocomplete
                    label="Sucursal de origen"
                    placeholder="Buscar sucursal de origen..."
                    value={resolvedOriginBranch}
                    onChange={handleOriginChange}
                    enabled={open}
                    disableClearable
                />

                <BranchCatalogAutocomplete
                    label="Sucursal de destino"
                    placeholder={
                        destinationDisabled
                            ? "Selecciona primero el origen"
                            : "Buscar sucursal de destino..."
                    }
                    value={destinationBranch}
                    onChange={handleDestinationChange}
                    excludeBranchId={resolvedOriginBranch?.id}
                    disabled={destinationDisabled}
                    enabled={open && !destinationDisabled}
                    error={Boolean(destinationError)}
                    helperText={destinationError ?? undefined}
                />

                <BranchRoutePreview
                    origin={resolvedOriginBranch}
                    destination={destinationBranch}
                />
            </Stack>
        </SideModal>
    );
}
