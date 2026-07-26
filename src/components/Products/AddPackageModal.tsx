import { useCallback, useEffect, useMemo, useState, type SyntheticEvent } from "react";
import {
    Autocomplete,
    CircularProgress,
    Grid,
    InputAdornment,
    Stack,
    Typography,
    useTheme,
    type AutocompleteInputChangeReason,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import numeral from "numeral";
import { Search } from "lucide-react";
import { FormTextField, MultiSelectChips } from "@/components";
import { SideModal } from "@/components/SideModal";
import { ConfirmButton } from "@/components/Form/styles";
import { StyledFormControlLabel } from "@/styles/catalogos/productos.styles";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { unwrapOrThrow } from "@/lib/axios";
import {
    PRODUCT_SEARCH_DEFAULT_LIMIT,
    searchProducts,
    type ProductSearchItem,
} from "@/services/productos.service";
import type { PackageType, PackageFormData, SelectableItem } from "@/types/productos.types";

const SEARCH_DEBOUNCE_MS = 300;

interface AddPackageModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: PackageFormData) => Promise<void>;
    loading?: boolean;
    availableBranches: SelectableItem[];
    excludeProductId?: number;
}

function parseProductListCost(listCost: string): number {
    const parsed = Number(listCost);
    return Number.isFinite(parsed) ? parsed : 0;
}

function getProductOptionLabel(option: ProductSearchItem): string {
    const code = option.code?.trim();
    return code ? `${option.shortName} (${code})` : option.shortName;
}

export function AddPackageModal({
    open,
    onClose,
    onSave,
    loading = false,
    availableBranches,
    excludeProductId,
}: AddPackageModalProps) {
    const theme = useTheme();
    const [packageType, setPackageType] = useState<PackageType>("article");
    const [selectedProduct, setSelectedProduct] = useState<ProductSearchItem | null>(null);
    const [productSearchInput, setProductSearchInput] = useState("");
    const [serviceName, setServiceName] = useState<string>("");
    const [packagePrice, setPackagePrice] = useState<string>("");
    const [selectedBranches, setSelectedBranches] = useState<(string | number)[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const debouncedSearch = useDebouncedValue(productSearchInput.trim(), SEARCH_DEBOUNCE_MS);

    const { data: searchResults = [], isFetching: isSearching } = useQuery({
        queryKey: ["product-package-search", debouncedSearch, excludeProductId],
        queryFn: async () => {
            const rows = unwrapOrThrow(
                await searchProducts({
                    q: debouncedSearch,
                    limit: PRODUCT_SEARCH_DEFAULT_LIMIT,
                }),
            );
            if (excludeProductId == null) {
                return rows;
            }
            return rows.filter((row) => row.id !== excludeProductId);
        },
        staleTime: 30_000,
        enabled: open && packageType === "article",
    });

    const selectedListCost = useMemo(() => {
        if (!selectedProduct) {
            return 0;
        }
        return parseProductListCost(selectedProduct.listCost);
    }, [selectedProduct]);

    const total = useMemo(() => {
        if (packageType === "article" && selectedProduct) {
            return packagePrice ? Number(packagePrice) : selectedListCost;
        }
        return 0;
    }, [packageType, selectedProduct, packagePrice, selectedListCost]);

    const resetForm = useCallback(() => {
        setPackageType("article");
        setSelectedProduct(null);
        setProductSearchInput("");
        setServiceName("");
        setPackagePrice("");
        setSelectedBranches([]);
        setErrors({});
    }, []);

    const handleClose = () => {
        if (!loading) {
            resetForm();
            onClose();
        }
    };

    useEffect(() => {
        if (!open) {
            resetForm();
        }
    }, [open, resetForm]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (packageType === "article") {
            if (!selectedProduct) {
                newErrors.articleId = "Debes seleccionar un artículo";
            }
            if (selectedBranches.length === 0) {
                newErrors.branches = "Debes seleccionar al menos una sucursal";
            }
        }

        if (packageType === "service") {
            if (!serviceName.trim()) {
                newErrors.serviceName = "El nombre del servicio es requerido";
            }
            if (selectedBranches.length === 0) {
                newErrors.branches = "Debes seleccionar al menos una sucursal";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) {
            return;
        }

        const formData: PackageFormData = {
            type: packageType,
            branches: selectedBranches.map((id) => Number(id)),
        };

        if (packageType === "article" && selectedProduct) {
            formData.articleId = String(selectedProduct.id);
            formData.articleName = selectedProduct.shortName;
            formData.articleListCost = selectedListCost;
            formData.packagePrice = packagePrice
                ? Number(packagePrice)
                : selectedListCost;
        } else {
            formData.serviceName = serviceName.trim();
        }

        await onSave(formData);
        handleClose();
    };

    const handleProductInputChange = useCallback(
        (_: SyntheticEvent, value: string, reason: AutocompleteInputChangeReason) => {
            if (reason === "clear") {
                setProductSearchInput("");
                setSelectedProduct(null);
                return;
            }
            if (reason === "reset" || reason === "blur") {
                return;
            }
            setProductSearchInput(value);
            if (
                selectedProduct != null &&
                value !== getProductOptionLabel(selectedProduct)
            ) {
                setSelectedProduct(null);
            }
        },
        [selectedProduct],
    );

    return (
        <SideModal
            open={open}
            onClose={handleClose}
            maxWidth="md"
            disableClose={loading}
            title="Agregar paquete"
            description="Define el tipo de paquete y las sucursales donde aplica."
            contentSx={{
                flex: 1,
                minHeight: 0,
                overflow: "auto",
            }}
            headerActions={
                <ConfirmButton
                    type="button"
                    variant="contained"
                    onClick={handleSave}
                    disabled={loading}>
                    {loading ? <CircularProgress size={20} color="inherit" /> : "Guardar"}
                </ConfirmButton>
            }
        >
            <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                        Tipo de paquete
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <StyledFormControlLabel
                            value="article"
                            label="Artículo"
                            checked={packageType === "article"}
                            onChange={(e) => {
                                setPackageType(e.target.value as PackageType);
                                setSelectedProduct(null);
                                setProductSearchInput("");
                                setServiceName("");
                                setSelectedBranches([]);
                                setErrors({});
                            }}
                        />
                        <StyledFormControlLabel
                            value="service"
                            label="Servicio"
                            checked={packageType === "service"}
                            onChange={(e) => {
                                setPackageType(e.target.value as PackageType);
                                setSelectedProduct(null);
                                setProductSearchInput("");
                                setServiceName("");
                                setSelectedBranches([]);
                                setErrors({});
                            }}
                        />
                    </Stack>
                </Grid>

                {packageType === "article" && (
                    <>
                        <Grid size={{ xs: 12 }}>
                            <Autocomplete<ProductSearchItem, false, false, false>
                                fullWidth
                                openOnFocus
                                options={searchResults}
                                loading={isSearching}
                                filterOptions={(list) => list}
                                getOptionLabel={getProductOptionLabel}
                                isOptionEqualToValue={(a, b) => a.id === b.id}
                                value={selectedProduct}
                                inputValue={productSearchInput}
                                onInputChange={handleProductInputChange}
                                onChange={(_, newValue) => {
                                    if (newValue == null) {
                                        setSelectedProduct(null);
                                        setProductSearchInput("");
                                        setPackagePrice("");
                                    } else {
                                        setSelectedProduct(newValue);
                                        setProductSearchInput(getProductOptionLabel(newValue));
                                        setPackagePrice("");
                                    }
                                    if (errors.articleId) {
                                        setErrors((prev) => ({ ...prev, articleId: "" }));
                                    }
                                }}
                                noOptionsText={
                                    debouncedSearch.length < 2
                                        ? "Escribe al menos 2 caracteres para buscar"
                                        : "No se encontraron artículos"
                                }
                                renderInput={(params) => (
                                    <FormTextField
                                        {...params}
                                        label="Artículo"
                                        placeholder="Buscar por nombre o código"
                                        required
                                        error={Boolean(errors.articleId)}
                                        helperText={errors.articleId}
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <>
                                                    {isSearching ? (
                                                        <CircularProgress color="inherit" size={18} />
                                                    ) : null}
                                                    {params.InputProps.endAdornment}
                                                    <InputAdornment position="end">
                                                        <Search
                                                            size={18}
                                                            color={theme.palette.text.secondary}
                                                        />
                                                    </InputAdornment>
                                                </>
                                            ),
                                        }}
                                    />
                                )}
                            />
                        </Grid>

                        {selectedProduct && (
                            <>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <FormTextField
                                        label="Costo de lista"
                                        value={numeral(selectedListCost).format("0,0.00")}
                                        disabled
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">$</InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <FormTextField
                                        label="Precio en paquete"
                                        placeholder="0.00"
                                        type="number"
                                        value={packagePrice}
                                        onChange={(e) => {
                                            setPackagePrice(e.target.value);
                                        }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">$</InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <FormTextField
                                        label="Total"
                                        value={numeral(total).format("0,0.00")}
                                        disabled
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">$</InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>
                            </>
                        )}

                        <Grid size={{ xs: 12 }}>
                            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                                Sucursales
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Solo se muestran las sucursales activas configuradas para este artículo.
                            </Typography>
                            <MultiSelectChips
                                items={availableBranches}
                                selectedIds={selectedBranches}
                                onChange={(ids) => {
                                    setSelectedBranches(ids);
                                    if (errors.branches) {
                                        setErrors((prev) => ({ ...prev, branches: "" }));
                                    }
                                }}
                                error={Boolean(errors.branches)}
                                helperText={
                                    errors.branches ??
                                    (availableBranches.length === 0
                                        ? "Activa al menos una sucursal en la pestaña Sucursales"
                                        : undefined)
                                }
                            />
                        </Grid>
                    </>
                )}

                {packageType === "service" && (
                    <>
                        <Grid size={{ xs: 12 }}>
                            <FormTextField
                                label="Nombre del servicio"
                                placeholder="Ej. Servicio de instalación gratis"
                                value={serviceName}
                                onChange={(e) => {
                                    setServiceName(e.target.value);
                                    if (errors.serviceName) {
                                        setErrors((prev) => ({ ...prev, serviceName: "" }));
                                    }
                                }}
                                error={Boolean(errors.serviceName)}
                                helperText={errors.serviceName}
                                required
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                                Sucursales
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Solo se muestran las sucursales activas configuradas para este artículo.
                            </Typography>
                            <MultiSelectChips
                                items={availableBranches}
                                selectedIds={selectedBranches}
                                onChange={(ids) => {
                                    setSelectedBranches(ids);
                                    if (errors.branches) {
                                        setErrors((prev) => ({ ...prev, branches: "" }));
                                    }
                                }}
                                error={Boolean(errors.branches)}
                                helperText={
                                    errors.branches ??
                                    (availableBranches.length === 0
                                        ? "Activa al menos una sucursal en la pestaña Sucursales"
                                        : undefined)
                                }
                            />
                        </Grid>
                    </>
                )}
            </Grid>
        </SideModal>
    );
}
