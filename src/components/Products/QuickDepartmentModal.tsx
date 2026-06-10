import { useCallback, useEffect, useMemo, useState } from "react";
import { ModalForm } from "@/components";
import type { FormFieldConfig } from "@/components/Form";
import { createDepartment } from "@/services/departments.service";
import { useSnackbarStore } from "@/store/useSnackbarStore";

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
  }, [open]);

  const departmentFormFields: FormFieldConfig[] = useMemo(
    () => [
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
    ],
    [getNextId],
  );

  const handleClose = () => {
    setFormValues({});
    onClose();
  };

  const handleFormValuesChange = useCallback((values: Record<string, unknown>) => {
    setFormValues(values);
  }, []);

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
    />
  );
}
