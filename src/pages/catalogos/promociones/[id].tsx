import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Box, CircularProgress } from "@mui/material";
import {
    MainLayout,
    Breadcrumbs,
    Tabs,
} from "@/components";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import {
    BreadcrumbsContainer,
    PageHeader,
    PageTitle,
    SaveButton,
    DiscardButton,
    TabsContainer,
    FormCard,
} from "@/styles/catalogos/productos.styles";
import type { PromotionFormState, FormErrors } from "./types";
import { getPromotion, savePromotion } from "./api";
import { MOCK_DEPARTMENTS, MOCK_ARTICLES, MOCK_BRANCHES } from "./mockData";
import { ConfigurationTab } from "./components/ConfigurationTab";
import { DepartmentsTab } from "./components/DepartmentsTab";
import { BranchesTab } from "./components/BranchesTab";
import { SuppliersTab } from "./components/SuppliersTab";

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function PromotionFormPage() {
    const router = useRouter();
    const { id } = router.query;

    // Determine if creating or editing
    const isNew = id === "nuevo";
    const promotionId = isNew ? null : Number(id);

    // State
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("configuration");

    // Form State
    const [formState, setFormState] = useState<PromotionFormState>({
        name: "",
        percentage: "",
        applicationType: "Crédito",
        months: [],
        days: [],
        clientLevels: [
            { level: 1, advancePercentage: 0 },
            { level: 2, advancePercentage: 0 },
            { level: 3, advancePercentage: 0 },
        ],
        startDate: "",
        endDate: null,
        hasEndDate: true,
        selectedDepartmentIds: [],
        selectedArticleIds: [],
        selectedBranchIds: [],
        suppliers: [],
    });

    // Errors
    const [errors, setErrors] = useState<FormErrors>({});

    // Fetch promotion data if editing
    useEffect(() => {
        if (isNew || !promotionId) {
            setLoading(false);
            return;
        }

        async function loadPromotion() {
            setLoading(true);
            try {
                const promotion = await getPromotion(promotionId!);
                if (promotion) {
                    setFormState({
                        name: promotion.name,
                        percentage: promotion.percentage.toString(),
                        applicationType: promotion.applicationType,
                        months: promotion.months,
                        days: promotion.days || [],
                        clientLevels: promotion.clientLevels,
                        startDate: promotion.startDate,
                        endDate: promotion.endDate,
                        hasEndDate: promotion.endDate !== null,
                        selectedDepartmentIds: promotion.departments.map((d) => d.id),
                        selectedArticleIds: promotion.articles.map((a) => a.id),
                        selectedBranchIds: promotion.branches.map((b) => b.id),
                        suppliers: promotion.suppliers,
                    });
                }
            } catch (err) {
                console.error("[PromotionForm] Error loading promotion:", err);
            } finally {
                setLoading(false);
            }
        }

        loadPromotion();
    }, [isNew, promotionId]);

    // Validate form
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formState.name.trim()) {
            newErrors.name = "El nombre es requerido";
        }

        if (!formState.percentage || Number(formState.percentage) <= 0) {
            newErrors.percentage = "El porcentaje debe ser mayor a 0";
        }

        if (!formState.startDate) {
            newErrors.startDate = "La fecha de inicio es requerida";
        }

        if (formState.hasEndDate && formState.endDate) {
            if (new Date(formState.endDate) < new Date(formState.startDate)) {
                newErrors.endDate = "La fecha de fin debe ser posterior a la fecha de inicio";
            }
        }

        if (formState.applicationType === "Crédito" && formState.months.length === 0) {
            newErrors.months = "Debe seleccionar al menos un mes";
        }

        if (formState.applicationType === "Apartados" && formState.days.length === 0) {
            newErrors.days = "Debe seleccionar al menos un día";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle save
    const handleSave = async () => {
        if (!validateForm()) {
            setActiveTab("configuration");
            return;
        }

        setSaving(true);
        try {
            // Map form state to promotion format
            const promotionData = {
                id: promotionId || undefined,
                name: formState.name.trim(),
                percentage: Number(formState.percentage),
                applicationType: formState.applicationType,
                months: formState.months,
                days: formState.days,
                clientLevels: formState.clientLevels,
                startDate: formState.startDate,
                endDate: formState.hasEndDate ? formState.endDate : null,
                departments: MOCK_DEPARTMENTS.filter((d) =>
                    formState.selectedDepartmentIds.includes(d.id)
                ),
                articles: MOCK_ARTICLES.filter((a) =>
                    formState.selectedArticleIds.includes(a.id)
                ),
                branches: MOCK_BRANCHES.filter((b) =>
                    formState.selectedBranchIds.includes(b.id)
                ),
                suppliers: formState.suppliers,
            };

            await savePromotion(promotionData);
            router.push("/catalogos/promociones");
        } catch (err) {
            console.error("[PromotionForm] Error saving:", err);
        } finally {
            setSaving(false);
        }
    };

    // Handle discard
    const handleDiscard = () => {
        if (window.confirm("¿Estás seguro de descartar los cambios?")) {
            router.push("/catalogos/promociones");
        }
    };

    // Field change handler
    const handleFieldChange = (field: keyof PromotionFormState, value: any) => {
        setFormState((prev) => ({ ...prev, [field]: value }));
    };

    // Error clear handler
    const handleErrorClear = (field: string) => {
        setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });
    };

    // Breadcrumbs
    const breadcrumbItems: BreadcrumbItem[] = [
        { label: "Promociones", href: "/catalogos/promociones" },
        { label: isNew ? "Nuevo" : "Editar" },
    ];

    // Tabs configuration
    const tabs = [
        { value: "configuration", label: "Configuración" },
        { value: "departments", label: "Departamentos" },
        { value: "branches", label: "Sucursales" },
        { value: "suppliers", label: "Proveedores" },
    ];

    if (loading) {
        return (
            <MainLayout>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        minHeight: 400,
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
                <Breadcrumbs items={breadcrumbItems} />
            </BreadcrumbsContainer>

            <PageHeader>
                <PageTitle>{isNew ? "Nueva promoción" : "Editar promoción"}</PageTitle>
                <Box sx={{ display: "flex", gap: 1 }}>
                    <DiscardButton variant="outlined" onClick={handleDiscard} disabled={saving}>
                        Descartar cambios
                    </DiscardButton>
                    <SaveButton
                        variant="contained"
                        color="primary"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? <CircularProgress size={20} color="inherit" /> : "Guardar"}
                    </SaveButton>
                </Box>
            </PageHeader>

            <TabsContainer>
                <Tabs
                    tabs={tabs}
                    value={activeTab}
                    onChange={setActiveTab}
                    withBorder={true}
                />
            </TabsContainer>

            <FormCard>
                {activeTab === "configuration" && (
                    <ConfigurationTab
                        formState={formState}
                        errors={errors}
                        onFieldChange={handleFieldChange}
                        onErrorClear={handleErrorClear}
                    />
                )}

                {activeTab === "departments" && (
                    <DepartmentsTab
                        formState={formState}
                        onFieldChange={handleFieldChange}
                    />
                )}

                {activeTab === "branches" && (
                    <BranchesTab
                        formState={formState}
                        onFieldChange={handleFieldChange}
                    />
                )}

                {activeTab === "suppliers" && (
                    <SuppliersTab
                        formState={formState}
                        onFieldChange={handleFieldChange}
                    />
                )}
            </FormCard>
        </MainLayout>
    );
}
