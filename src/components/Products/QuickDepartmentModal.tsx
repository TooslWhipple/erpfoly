import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Box } from "@mui/material";
import { ModalForm } from "@/components";
import type { FormFieldConfig } from "@/components/Form";
import { createDepartment } from "@/services/departments.service";
import { useSnackbarStore } from "@/store/useSnackbarStore";

async function getAffectedItemsCount(): Promise<number> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return Math.floor(Math.random() * 50) + 10;
}

export interface QuickDepartmentModalProps {
    open: boolean;
    onClose: () => void;
    /** Used to display the next ID in the read-only field (same pattern as the departments catalog page). */
    existingDepartmentIds: number[];
    onCreated?: (payload: { id: number; name: string }) => void | Promise<void>;
}

export function QuickDepartmentModal({
    open,
    onClose,
    existingDepartmentIds,
    onCreated,
}: QuickDepartmentModalProps) {
    const showSuccess = useSnackbarStore((s) => s.showSuccess);
    const showError = useSnackbarStore((s) => s.showError);

    const [saving, setSaving] = useState(false);
    const [hasPromotion, setHasPromotion] = useState(false);
    const [affectedItemsCount, setAffectedItemsCount] = useState<number | null>(null);
    const [formValues, setFormValues] = useState<Record<string, unknown>>({});

    const getNextId = useCallback(() => {
        if (existingDepartmentIds.length === 0) return "01";
        const maxId = Math.max(...existingDepartmentIds);
        return String(maxId + 1).padStart(2, "0");
    }, [existingDepartmentIds]);

    useEffect(() => {
        if (!open) {
            return;
        }
        setFormValues({});
        setHasPromotion(false);
        setAffectedItemsCount(null);
    }, [open]);

    const departmentFormFields: FormFieldConfig[] = useMemo(() => {
        const baseFields: FormFieldConfig[] = [
            {
                name: "id",
                label: "ID",
                type: "text",
                disabled: true,
                defaultValue: getNextId(),
            },
            {
                name: "name",
                label: "Nombre de la categoría",
                type: "text",
                placeholder: "Ej. Línea blanca",
                validation: {
                    required: true,
                    minLength: 2,
                    maxLength: 100,
                },
                autoFocus: true,
            },
            {
                name: "margin",
                label: "Margen",
                type: "number",
                placeholder: "32",
                validation: {
                    required: true,
                    min: 0,
                    max: 100,
                },
                helperText: "Porcentaje de margen (0-100)",
            },
            {
                name: "hasPromotion",
                label: "Agregar promoción para éste departamento",
                type: "switch",
                defaultValue: false,
            },
        ];

        if (hasPromotion) {
            baseFields.push(
                {
                    name: "promotionPercentage",
                    label: "Promoción",
                    type: "number",
                    placeholder: "32",
                    validation: {
                        required: true,
                        min: 0,
                        max: 100,
                    },
                    helperText: "Porcentaje de descuento (0-100)",
                },
                {
                    name: "promotionStartDate",
                    label: "Fecha de inicio",
                    type: "date",
                    validation: {
                        required: true,
                    },
                },
                {
                    name: "promotionEndDate",
                    label: "Fecha fin",
                    type: "date",
                    validation: {
                        required: true,
                        custom: (value, allValues) => {
                            const startDate = allValues.promotionStartDate as string | undefined;
                            const endDate = value as string | undefined;
                            if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
                                return "La fecha fin debe ser posterior a la fecha de inicio";
                            }
                            return undefined;
                        },
                    },
                }
            );
        }

        return baseFields;
    }, [hasPromotion, getNextId]);

    useEffect(() => {
        if (hasPromotion && open) {
            getAffectedItemsCount().then(setAffectedItemsCount);
        } else {
            queueMicrotask(() => setAffectedItemsCount(null));
        }
    }, [hasPromotion, open]);

    const handleClose = () => {
        setHasPromotion(false);
        setAffectedItemsCount(null);
        setFormValues({});
        onClose();
    };

    const handleFormValuesChange = useCallback(
        (values: Record<string, unknown>) => {
            setFormValues(values);
            const promotionEnabled = Boolean(values.hasPromotion);
            if (promotionEnabled !== hasPromotion) {
                setHasPromotion(promotionEnabled);
            }
        },
        [hasPromotion]
    );

    const handleSaveDepartment = async (data: Record<string, unknown>) => {
        setSaving(true);
        const result = await createDepartment({
            name: data.name as string,
            margin: Number(data.margin),
        });
        setSaving(false);
        if (result.error) {
            console.error("[QuickDepartmentModal] Error creating department:", result.error.message);
            showError(result.error.message);
            return;
        }
        if (!result.data) {
            showError("No se recibió el departamento creado.");
            return;
        }
        showSuccess("Departamento creado correctamente.");
        await onCreated?.({ id: result.data.id, name: result.data.name });
        handleClose();
    };

    const initialValues =
        Object.keys(formValues).length > 0
            ? formValues
            : {
                  id: getNextId(),
                  hasPromotion: false,
              };

    return (
        <ModalForm
            open={open}
            onClose={handleClose}
            title="Nuevo departamento"
            fields={departmentFormFields}
            onConfirm={handleSaveDepartment}
            loading={saving}
            initialValues={initialValues}
            confirmLabel="Crear"
            cancelLabel="Cancelar"
            maxWidth="sm"
            onValuesChange={handleFormValuesChange}
        >
            {hasPromotion && affectedItemsCount !== null && (
                <Box sx={{ mt: 2 }}>
                    <Alert severity="info" sx={{ borderRadius: 1 }}>
                        {affectedItemsCount} artículos serán afectados con esta promoción.
                    </Alert>
                </Box>
            )}
        </ModalForm>
    );
}
