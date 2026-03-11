import { useState, useMemo } from "react";
import { Dialog, Box, CircularProgress, Grid, InputAdornment } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import numeral from "numeral";
import { FormTextField, FormSelect, MultiSelectChips } from "@/components";
import {
    DialogContent,
    ModalHeader,
    ModalTitle,
    CloseButton,
} from "@/components/ModalForm/styles";
import {
    FormActions,
    CancelButton,
    ConfirmButton,
} from "@/components/Form/styles";
import {
    RadioGroupContainer,
    RadioLabel,
    StyledRadioGroup,
    StyledFormControlLabel,
    SectionTitle,
    SectionDescription,
} from "@/styles/catalogos/productos.styles";
import type { PackageType, PackageFormData, SelectableItem } from "@/types/productos.types";
import type { ArticleForPackage } from "@/data/productos.mockData";

// ============================================================================
// TYPES
// ============================================================================

interface AddPackageModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: PackageFormData) => Promise<void>;
    loading?: boolean;
    availableArticles: ArticleForPackage[];
    availableBranches: SelectableItem[];
}

// ============================================================================
// COMPONENT
// ============================================================================

export function AddPackageModal({
    open,
    onClose,
    onSave,
    loading = false,
    availableArticles,
    availableBranches,
}: AddPackageModalProps) {
    const [packageType, setPackageType] = useState<PackageType>("article");
    const [selectedArticleId, setSelectedArticleId] = useState<string>("");
    const [serviceName, setServiceName] = useState<string>("");
    const [packagePrice, setPackagePrice] = useState<string>("");
    const [selectedBranches, setSelectedBranches] = useState<(string | number)[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Get selected article info
    const selectedArticle = useMemo(() => {
        if (!selectedArticleId) return null;
        return availableArticles.find((a) => a.id === selectedArticleId) || null;
    }, [selectedArticleId, availableArticles]);

    // Calculate total (package price * quantity or last price)
    const total = useMemo(() => {
        if (packageType === "article" && selectedArticle) {
            const price = packagePrice ? Number(packagePrice) : selectedArticle.lastPrice;
            return price;
        }
        return 0;
    }, [packageType, selectedArticle, packagePrice]);

    // Reset form when modal opens/closes
    const handleClose = () => {
        if (!loading) {
            setPackageType("article");
            setSelectedArticleId("");
            setServiceName("");
            setPackagePrice("");
            setSelectedBranches([]);
            setErrors({});
            onClose();
        }
    };

    // Validate form
    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (packageType === "article") {
            if (!selectedArticleId) {
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

    // Handle save
    const handleSave = async () => {
        if (!validate()) {
            return;
        }

        const formData: PackageFormData = {
            type: packageType,
            branches: selectedBranches.map((id) => Number(id)),
        };

        if (packageType === "article") {
            formData.articleId = selectedArticleId;
            formData.packagePrice = packagePrice ? Number(packagePrice) : selectedArticle?.lastPrice;
        } else {
            formData.serviceName = serviceName.trim();
        }

        await onSave(formData);
        handleClose();
    };

    // Article options for select
    const articleOptions = useMemo(
        () =>
            availableArticles.map((article) => ({
                value: article.id,
                label: article.name,
            })),
        [availableArticles]
    );

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    maxHeight: "90vh",
                },
            }}
        >
            <DialogContent>
                {/* Header */}
                <ModalHeader>
                    <ModalTitle>Agregar paquete</ModalTitle>
                    <CloseButton onClick={handleClose} disabled={loading} size="small">
                        <CloseIcon />
                    </CloseButton>
                </ModalHeader>

                {/* Form Content */}
                <Box>
                    <Grid container spacing={3}>
                        {/* Package Type */}
                        <Grid size={{ xs: 12 }}>
                            <SectionTitle sx={{ fontSize: "0.875rem", mb: 1 }}>
                                Tipo de paquete
                            </SectionTitle>
                            <RadioGroupContainer>
                                <StyledRadioGroup>
                                    <StyledFormControlLabel
                                        value="article"
                                        label="Artículo"
                                        checked={packageType === "article"}
                                        onChange={(e) => {
                                            setPackageType(e.target.value as PackageType);
                                            setSelectedArticleId("");
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
                                            setSelectedArticleId("");
                                            setServiceName("");
                                            setSelectedBranches([]);
                                            setErrors({});
                                        }}
                                    />
                                </StyledRadioGroup>
                            </RadioGroupContainer>
                        </Grid>

                        {/* Article Selection */}
                        {packageType === "article" && (
                            <>
                                <Grid size={{ xs: 12 }}>
                                    <FormSelect
                                        label="Artículo"
                                        placeholder="Buscar"
                                        value={selectedArticleId}
                                        onChange={(e) => {
                                            const articleId = String(e.target.value);
                                            setSelectedArticleId(articleId);
                                            const article = availableArticles.find((a) => a.id === articleId);
                                            if (article) {
                                                setPackagePrice("");
                                            }
                                            if (errors.articleId) {
                                                setErrors({ ...errors, articleId: "" });
                                            }
                                        }}
                                        options={articleOptions}
                                        error={Boolean(errors.articleId)}
                                        helperText={errors.articleId}
                                        required
                                    />
                                </Grid>

                                {/* Supplier Info */}
                                {selectedArticle && (
                                    <Grid size={{ xs: 12 }}>
                                        <FormTextField
                                            label="Proveedor"
                                            value={selectedArticle.supplierName}
                                            disabled
                                        />
                                    </Grid>
                                )}

                                {/* Price Section */}
                                {selectedArticle && (
                                    <>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <FormTextField
                                                label="Último precio"
                                                value={numeral(selectedArticle.lastPrice).format("0,0.00")}
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

                                {/* Branches Section for Articles */}
                                <Grid size={{ xs: 12 }}>
                                    <SectionTitle sx={{ fontSize: "0.875rem", mb: 1 }}>
                                        Sucursales
                                    </SectionTitle>
                                    <SectionDescription sx={{ mb: 2 }}>
                                        Configura las sucursales donde estará activa este paquete.
                                    </SectionDescription>
                                    <MultiSelectChips
                                        items={availableBranches}
                                        selectedIds={selectedBranches}
                                        onChange={(ids) => {
                                            setSelectedBranches(ids);
                                            if (errors.branches) {
                                                setErrors({ ...errors, branches: "" });
                                            }
                                        }}
                                        error={Boolean(errors.branches)}
                                        helperText={errors.branches}
                                    />
                                </Grid>
                            </>
                        )}

                        {/* Service Form */}
                        {packageType === "service" && (
                            <>
                                <Grid size={{ xs: 12 }}>
                                    <FormTextField
                                        label="Nombre del paquete"
                                        placeholder="Ej. Servicio de instalación gratis"
                                        value={serviceName}
                                        onChange={(e) => {
                                            setServiceName(e.target.value);
                                            if (errors.serviceName) {
                                                setErrors({ ...errors, serviceName: "" });
                                            }
                                        }}
                                        error={Boolean(errors.serviceName)}
                                        helperText={errors.serviceName}
                                        required
                                    />
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <SectionTitle sx={{ fontSize: "0.875rem", mb: 1 }}>
                                        Sucursales
                                    </SectionTitle>
                                    <SectionDescription sx={{ mb: 2 }}>
                                        Configura las sucursales donde estará activa este paquete.
                                    </SectionDescription>
                                    <MultiSelectChips
                                        items={availableBranches}
                                        selectedIds={selectedBranches}
                                        onChange={(ids) => {
                                            setSelectedBranches(ids);
                                            if (errors.branches) {
                                                setErrors({ ...errors, branches: "" });
                                            }
                                        }}
                                        error={Boolean(errors.branches)}
                                        helperText={errors.branches}
                                    />
                                </Grid>
                            </>
                        )}
                    </Grid>
                </Box>

                {/* Actions */}
                <FormActions>
                    <CancelButton
                        type="button"
                        variant="outlined"
                        onClick={handleClose}
                        disabled={loading}
                    >
                        Cancelar
                    </CancelButton>
                    <ConfirmButton
                        type="button"
                        variant="contained"
                        onClick={handleSave}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={20} color="inherit" /> : "Guardar"}
                    </ConfirmButton>
                </FormActions>
            </DialogContent>
        </Dialog>
    );
}
