import { useReducer, useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { getSupplierById, createSupplier, updateSupplier, inviteSupplier } from "@/services/suppliers.service";
import { unwrapOrThrow, getApiErrorMessage } from "@/lib/axios";
import { useContactJobTitles } from "./useContactJobTitles";
import {
    validateGeneralForm,
    validateContactsForm,
    validateCreditForm,
} from "@/forms";
import {
    getDefaultFormState,
    supplierDetailToFormState,
    createPromotionSnapshot,
    formStateToPayload,
} from "./mappers";
import type {
    GeneralFormValues,
} from "@/types/proveedores.types";
import {
    SUPPLIER_FORM_TABS,
    isSupplierFormTab,
    hasSupplierTabErrors,
    type SupplierFormTab,
} from "./supplierForm.constants";
import { supplierFormReducer } from "./supplierForm.reducer";
import { useSupplierFormHandlers } from "./useSupplierFormHandlers";
import { theme } from "@/styles/theme";

export function useSupplierForm() {
    const router = useRouter();
    const { id } = router.query;
    const queryClient = useQueryClient();
    const showError = useSnackbarStore((s) => s.showError);
    const showSuccess = useSnackbarStore((s) => s.showSuccess);

    const routeId = useMemo(() => {
        if (Array.isArray(id)) return id[0];
        return id;
    }, [id]);
    const isNew =
        routeId === "nuevo" || router.pathname === "/catalogos/proveedores/nuevo";
    const supplierId = isNew || !routeId ? null : Number(routeId);
    const hasValidSupplierId = supplierId != null && Number.isFinite(supplierId) && supplierId > 0;

    const { data: jobTitlesData, isLoading: loadingCatalog } = useContactJobTitles();
    const jobTitleOptions = useMemo(() => {
        if (!jobTitlesData) return [];
        return jobTitlesData.map((j) => ({ value: j.id, label: j.name }));
    }, [jobTitlesData]);

    const [activeTab, setActiveTab] = useState<SupplierFormTab>("general");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formState, dispatchForm] = useReducer(
        supplierFormReducer,
        undefined,
        getDefaultFormState,
    );
    const initialPromotionsRef = useRef(createPromotionSnapshot(getDefaultFormState().promotions));
    const hasShownInvalidIdError = useRef(false);

    const createTempId = useCallback((): string => {
        const randomPart = Math.random().toString(36).slice(2, 8);
        return `tmp-${Date.now()}-${randomPart}`;
    }, []);

    const shouldLoadSupplier = router.isReady && !isNew && hasValidSupplierId && supplierId != null;
    const hasInvalidRouteId = router.isReady && !isNew && !hasValidSupplierId;

    const supplierQuery = useQuery({
        queryKey: ["supplier", supplierId],
        enabled: shouldLoadSupplier,
        queryFn: async () => {
            const result = await getSupplierById(supplierId as number);
            return unwrapOrThrow(result);
        },
    });

    const createSupplierMutation = useMutation({
        mutationFn: createSupplier,
    });

    const updateSupplierMutation = useMutation({
        mutationFn: ({ id: supplierIdValue, payload }: { id: number; payload: ReturnType<typeof formStateToPayload> }) =>
            updateSupplier(supplierIdValue, payload),
    });

    const inviteSupplierMutation = useMutation({
        mutationFn: inviteSupplier,
    });

    useEffect(() => {
        if (isNew) {
            dispatchForm({ type: "set_form_state", payload: getDefaultFormState() });
            initialPromotionsRef.current = {};
        }
    }, [isNew]);

    useEffect(() => {
        if (!supplierQuery.data) return;
        const nextFormState = supplierDetailToFormState(supplierQuery.data);
        dispatchForm({ type: "set_form_state", payload: nextFormState });
        initialPromotionsRef.current = createPromotionSnapshot(nextFormState.promotions);
    }, [supplierQuery.data]);

    useEffect(() => {
        if (!hasInvalidRouteId) {
            hasShownInvalidIdError.current = false;
            return;
        }
        if (hasShownInvalidIdError.current) return;
        hasShownInvalidIdError.current = true;
        showError("No se encontró un identificador de proveedor válido.");
    }, [hasInvalidRouteId, showError]);

    useEffect(() => {
        if (!supplierQuery.error) return;
        console.error("[SupplierForm] Error loading supplier:", supplierQuery.error);
        showError(getApiErrorMessage(supplierQuery.error));
    }, [supplierQuery.error, showError]);

    const runAllValidations = useCallback(() => {
        const general = validateGeneralForm({
            name: formState.name.trim(),
            businessName: formState.businessName.trim(),
            rfc: formState.rfc.trim(),
            website: formState.website.trim() || undefined,
            email: formState.email.trim() || undefined,
            paymentTerm: formState.paymentTerm,
        });
        const contacts = validateContactsForm(
            formState.contacts.map((c) => ({
                jobTitleId: c.jobTitleId,
                name: c.name,
                phone: c.phone,
            })),
        );
        const credit = validateCreditForm({
            attention: formState.creditAttention,
            jobTitleId: formState.creditJobTitleId,
            phone: formState.creditPhone,
        });

        const mergedErrors = {
            ...general.errors,
            ...contacts.errors,
            ...credit.errors,
        };
        const firstInvalidTab: SupplierFormTab | null = !general.success
            ? "general"
            : !contacts.success
              ? "contacts"
              : !credit.success
                ? "credit"
                : null;

        return {
            success: general.success && contacts.success && credit.success,
            errors: mergedErrors,
            firstInvalidTab,
        };
    }, [
        formState.name,
        formState.businessName,
        formState.rfc,
        formState.website,
        formState.email,
        formState.paymentTerm,
        formState.contacts,
        formState.creditAttention,
        formState.creditJobTitleId,
        formState.creditPhone,
    ]);

    const handleSave = useCallback(async () => {
        const validation = runAllValidations();
        setErrors(validation.errors);
        if (!validation.success) {
            if (validation.firstInvalidTab) setActiveTab(validation.firstInvalidTab);
            return;
        }
        try {
            if (!isNew && (!hasValidSupplierId || supplierId == null)) {
                showError("No se encontró un identificador de proveedor válido.");
                return;
            }
            const resolvedSupplierId = supplierId as number;
            const payload = formStateToPayload(formState, initialPromotionsRef.current);
            if (isNew) {
                const result = await createSupplierMutation.mutateAsync(payload);
                if (result.error) {
                    const message = result.error.message;
                    if (/RFC/i.test(message)) {
                        setErrors((prev) => ({ ...prev, rfc: message }));
                        setActiveTab("general");
                    }
                    showError(message);
                    return;
                }
                showSuccess(result.data?.message ?? "Proveedor creado correctamente.");
            } else {
                const result = await updateSupplierMutation.mutateAsync({
                    id: resolvedSupplierId,
                    payload,
                });
                if (result.error) {
                    const message = result.error.message;
                    if (/RFC/i.test(message)) {
                        setErrors((prev) => ({ ...prev, rfc: message }));
                        setActiveTab("general");
                    }
                    showError(message);
                    return;
                }
                showSuccess(result.data?.message ?? "Proveedor actualizado correctamente.");
            }
            await queryClient.invalidateQueries({ queryKey: ["suppliers"] });
            router.push("/catalogos/proveedores");
        } catch (err) {
            console.error("[SupplierForm] Error saving:", err);
            const message = getApiErrorMessage(err);
            if (/RFC/i.test(message)) {
                setErrors((prev) => ({ ...prev, rfc: message }));
                setActiveTab("general");
            }
            showError(message);
        }
    }, [
        formState,
        isNew,
        hasValidSupplierId,
        supplierId,
        runAllValidations,
        showError,
        showSuccess,
        queryClient,
        router,
        createSupplierMutation,
        updateSupplierMutation,
    ]);

    const {
        handleGeneralFieldChange,
        handleAddContact,
        handleRemoveContact,
        handleContactChange,
        handleCreditDataChange,
        handleAddBankAccount,
        handleRemoveBankAccount,
        handleBankAccountChange,
    } = useSupplierFormHandlers({
        dispatchForm,
        errors,
        setErrors,
        createTempId,
    });

    const handleInvite = useCallback(async () => {
        if (!hasValidSupplierId || supplierId == null) {
            showError("No se encontró un identificador de proveedor válido.");
            return;
        }
        try {
            const result = await inviteSupplierMutation.mutateAsync(supplierId as number);
            if (result.error) {
                showError(result.error.message);
                return;
            }
            showSuccess(result.data?.message ?? "Invitación enviada correctamente.");
        } catch (err) {
            console.error("[SupplierForm] Error inviting:", err);
            showError(getApiErrorMessage(err));
        }
    }, [supplierId, hasValidSupplierId, inviteSupplierMutation, showError, showSuccess]);

    const handleTabChange = useCallback((value: string) => {
        if (!isSupplierFormTab(value)) return;
        setActiveTab(value);
    }, []);

    const generalFormValues: GeneralFormValues = {
        name: formState.name,
        businessName: formState.businessName,
        rfc: formState.rfc,
        website: formState.website,
        email: formState.email,
        type: formState.type,
        paymentTerm: formState.paymentTerm,
        freight: formState.freight,
        observations: formState.observations,
    };

    const creditData = {
        attention: formState.creditAttention,
        jobTitleId: formState.creditJobTitleId,
        phone: formState.creditPhone,
    };

    const showLoader =
        !router.isReady ||
        (shouldLoadSupplier && supplierQuery.isLoading) ||
        (loadingCatalog && jobTitleOptions.length === 0);
    const saving = createSupplierMutation.isPending || updateSupplierMutation.isPending;
    const inviting = inviteSupplierMutation.isPending;
    const hasUser = supplierQuery.data?.hasUser ?? false;
    const breadcrumbItems = useMemo(
        () => {
            const items: BreadcrumbItem[] = [
                { label: "Proveedores", href: "/catalogos/proveedores" },
            ];
            if (isNew) {
                items.push({ label: "Nuevo" });
                return items;
            }
            if (hasValidSupplierId && supplierId != null) {
                items.push({
                    label: supplierQuery.data?.name ?? "Detalle",
                    href: `/catalogos/proveedores/${supplierId}`,
                });
            }
            items.push({ label: "Editar" });
            return items;
        },
        [isNew, hasValidSupplierId, supplierId, supplierQuery.data?.name],
    );

    const handleEdit = () => {
        if (supplierId == null) return;
        router.push(`/catalogos/proveedores/${supplierId}/editar`);
    };

    const tabs = useMemo(
        () =>
            SUPPLIER_FORM_TABS.map((tab) => ({
                ...tab,
                textColor: hasSupplierTabErrors(tab.value, errors)
                    ? theme.palette.error.main
                    : undefined,
            })),
        [errors],
    );


    return {
        isNew,
        showLoader,
        breadcrumbItems,
        tabs,
        generalFormValues,
        errors,
        contacts: formState.contacts,
        creditData,
        bankAccounts: formState.bankAccounts,
        jobTitleOptions,
        activeTab,
        setActiveTab: handleTabChange,
        saving,
        inviting,
        hasUser,
        handleSave,
        handleInvite,
        handleGeneralFieldChange,
        handleAddContact,
        handleRemoveContact,
        handleContactChange,
        handleCreditDataChange,
        handleAddBankAccount,
        handleRemoveBankAccount,
        handleBankAccountChange,
        handleEdit
    };
}
