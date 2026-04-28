import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Box } from "@mui/material";
import { ModalForm } from "@/components";
import type { FormFieldConfig } from "@/components/Form";
import { createProductLine } from "@/services/product-lines.service";
import { useSnackbarStore } from "@/store/useSnackbarStore";

async function getAffectedItemsCount(departmentId: number): Promise<number> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    if (departmentId === 1) return 43;
    if (departmentId === 2) return 28;
    return Math.floor(Math.random() * 50) + 10;
}

export interface QuickProductLineModalProps {
    open: boolean;
    onClose: () => void;
    departmentId: number;
    onCreated?: (payload: { id: number }) => void | Promise<void>;
}

export function QuickProductLineModal({
    open,
    onClose,
    departmentId,
    onCreated,
}: QuickProductLineModalProps) {
    const showSuccess = useSnackbarStore((s) => s.showSuccess);
    const showError = useSnackbarStore((s) => s.showError);

    const [savingLine, setSavingLine] = useState(false);
    const [hasGroupPromotion, setHasGroupPromotion] = useState(false);
    const [groupAffectedCount, setGroupAffectedCount] = useState<number | null>(null);
    const [groupFormValues, setGroupFormValues] = useState<Record<string, unknown>>({});

    useEffect(() => {
        if (!open) {
            return;
        }
        setGroupFormValues({});
        setHasGroupPromotion(false);
        setGroupAffectedCount(null);
    }, [open]);

    useEffect(() => {
        if (hasGroupPromotion && open) {
            getAffectedItemsCount(departmentId).then(setGroupAffectedCount);
        } else {
            setGroupAffectedCount(null);
        }
    }, [hasGroupPromotion, open, departmentId]);

    const groupFormFields: FormFieldConfig[] = useMemo(() => {
        const base: FormFieldConfig[] = [
            {
                name: "code",
                label: "Abreviación",
                type: "text",
                placeholder: "Ej. LB",
                validation: { required: true, minLength: 1, maxLength: 32 },
                transformInput: (v) => v.toUpperCase(),
            },
            {
                name: "name",
                label: "Nombre de la categoría",
                type: "text",
                placeholder: "Ej. Línea blanca",
                validation: {
                    required: true,
                    minLength: 2,
                    maxLength: 128,
                },
                autoFocus: true,
                showErrorOnlyAfterSubmit: true,
            },
            {
                name: "hasGroupPromotion",
                label: "Agregar Promoción para esta Línea",
                type: "switch",
                defaultValue: false,
            },
        ];
        if (hasGroupPromotion) {
            base.push(
                {
                    name: "promotionPercentage",
                    label: "Promoción",
                    type: "number",
                    placeholder: "32",
                    validation: { required: true, min: 0, max: 100 },
                    helperText: "Porcentaje de descuento (0-100)",
                },
                {
                    name: "promotionStartDate",
                    label: "Fecha de inicio",
                    type: "date",
                    validation: { required: true },
                },
                {
                    name: "promotionEndDate",
                    label: "Fecha fin",
                    type: "date",
                    validation: {
                        required: true,
                        custom: (value, allValues) => {
                            const start = allValues.promotionStartDate as string | undefined;
                            const end = value as string | undefined;
                            if (start && end && new Date(end) < new Date(start)) {
                                return "La fecha fin debe ser posterior a la fecha de inicio";
                            }
                            return undefined;
                        },
                    },
                }
            );
        }
        return base;
    }, [hasGroupPromotion]);

    const groupModalInitialValues = useMemo(() => {
        if (Object.keys(groupFormValues).length > 0) return groupFormValues;
        return { code: "", name: "", hasGroupPromotion: false };
    }, [groupFormValues]);

    const handleCloseGroupModal = () => {
        setHasGroupPromotion(false);
        setGroupAffectedCount(null);
        setGroupFormValues({});
        onClose();
    };

    const handleGroupFormValuesChange = useCallback((values: Record<string, unknown>) => {
        setGroupFormValues(values);
        setHasGroupPromotion(Boolean(values.hasGroupPromotion));
    }, []);

    const handleSaveGroup = async (data: Record<string, unknown>) => {
        const name = (data.name as string)?.trim();
        const code = (data.code as string)?.trim();

        setSavingLine(true);
        const result = await createProductLine({ departmentId, name, code });
        setSavingLine(false);
        if (result.error) {
            console.error("[QuickProductLineModal] Error creating line:", result.error.message);
            showError(result.error.message);
            return;
        }
        if (!result.data) {
            showError("No se recibió la línea creada.");
            return;
        }
        showSuccess("Línea creada correctamente.");
        await onCreated?.({ id: result.data.id });
        handleCloseGroupModal();
    };

    return (
        <ModalForm
            open={open}
            onClose={handleCloseGroupModal}
            title="Nueva línea"
            fields={groupFormFields}
            onConfirm={handleSaveGroup}
            loading={savingLine}
            initialValues={groupModalInitialValues}
            confirmLabel="Crear"
            cancelLabel="Cancelar"
            maxWidth="sm"
            onValuesChange={handleGroupFormValuesChange}
        >
            {hasGroupPromotion && groupAffectedCount !== null && (
                <Box sx={{ mt: 2 }}>
                    <Alert severity="info" sx={{ borderRadius: 1 }}>
                        {groupAffectedCount} artículos serán afectados con esta promoción.
                    </Alert>
                </Box>
            )}
        </ModalForm>
    );
}
