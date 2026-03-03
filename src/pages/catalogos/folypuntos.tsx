import { useState, useEffect, useCallback } from "react";
import { Box, Button, CircularProgress, Snackbar, Alert } from "@mui/material";
import { MainLayout, Breadcrumbs, TabFilters } from "@/components";
import { BreadcrumbsContainer, PageHeader, PageTitle, SaveButton } from "@/styles/catalogos/folypuntos.styles";
import { FolypuntosForm } from "@/components/Folypuntos/FolypuntosForm";
import { getFolypuntosConfiguration, saveFolypuntosConfiguration } from "@/services/folypuntos.service";
import type { FolypuntosFormState, PaymentType } from "@/types/folypuntos.types";

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Folypuntos() {
    // State management
    const [formState, setFormState] = useState<FolypuntosFormState>({
        cash: {
            purchaseEquivalence: 10,
            saleEquivalence: 1,
        },
        credit: {
            purchaseEquivalence: 10,
            saleEquivalence: 1,
        },
        layaway: {
            purchaseEquivalence: 10,
            saleEquivalence: 1,
        },
    });
    const [activeTab, setActiveTab] = useState<string>("cash");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error";
    }>({
        open: false,
        message: "",
        severity: "success",
    });

    // Fetch configuration on mount
    useEffect(() => {
        const fetchConfiguration = async () => {
            setLoading(true);
            try {
                const config = await getFolypuntosConfiguration();
                setFormState(config);
            } catch (error) {
                console.error("[Folypuntos] Error fetching configuration:", error);
                setSnackbar({
                    open: true,
                    message: "Error al cargar la configuración",
                    severity: "error",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchConfiguration();
    }, []);

    // Handle field changes
    const handleFieldChange = useCallback(
        (
            paymentType: PaymentType,
            field: "purchaseEquivalence" | "saleEquivalence",
            value: number
        ) => {
            setFormState((prev) => ({
                ...prev,
                [paymentType]: {
                    ...prev[paymentType],
                    [field]: value,
                },
            }));
        },
        []
    );

    // Handle save
    const handleSave = useCallback(async () => {
        setSaving(true);
        try {
            const response = await saveFolypuntosConfiguration(formState);
            if (response.success) {
                setSnackbar({
                    open: true,
                    message: response.message || "Configuración guardada exitosamente",
                    severity: "success",
                });
            } else {
                setSnackbar({
                    open: true,
                    message: response.message || "Error al guardar la configuración",
                    severity: "error",
                });
            }
        } catch (error) {
            console.error("[Folypuntos] Error saving configuration:", error);
            setSnackbar({
                open: true,
                message: "Error al guardar la configuración",
                severity: "error",
            });
        } finally {
            setSaving(false);
        }
    }, [formState]);

    // Handle tab change
    const handleTabChange = (value: string) => {
        setActiveTab(value);
    };

    // Handle snackbar close
    const handleSnackbarClose = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    // Tab configuration
    const tabs = [
        { value: "cash", label: "Contado" },
        { value: "credit", label: "Crédito" },
        { value: "layaway", label: "Apartados" },
    ];

    // Breadcrumbs
    const breadcrumbs = [
        { label: "Folypuntos", href: "/catalogos/folypuntos" },
        { label: "Configuración" },
    ];

    if (loading) {
        return (
            <MainLayout>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        minHeight: "400px",
                    }}
                >
                    <CircularProgress />
                </Box>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <BreadcrumbsContainer>
                <Breadcrumbs items={breadcrumbs} />
            </BreadcrumbsContainer>

            <PageHeader>
                <PageTitle>Configuración de Folypuntos</PageTitle>
                <SaveButton>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSave}
                        disabled={saving}
                        startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
                    >
                        Guardar
                    </Button>
                </SaveButton>
            </PageHeader>

            <TabFilters
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={handleTabChange}
            />

            <FolypuntosForm
                formState={formState}
                activePaymentType={activeTab as PaymentType}
                onFieldChange={handleFieldChange}
                disabled={saving}
            />

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={snackbar.severity}
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </MainLayout>
    );
}
