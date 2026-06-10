import { useCallback, useEffect, useMemo, useState } from "react";
import { ModalForm } from "@/components";
import type { FormFieldConfig } from "@/components/Form";
import { createProductLine } from "@/services/product-lines.service";
import { useSnackbarStore } from "@/store/useSnackbarStore";

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
  const [groupFormValues, setGroupFormValues] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (!open) {
      return;
    }
    setGroupFormValues({});
  }, [open]);

  const groupFormFields: FormFieldConfig[] = useMemo(
    () => [
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
    ],
    [],
  );

  const groupModalInitialValues = useMemo(() => {
    if (Object.keys(groupFormValues).length > 0) return groupFormValues;
    return { code: "", name: "" };
  }, [groupFormValues]);

  const handleCloseGroupModal = () => {
    setGroupFormValues({});
    onClose();
  };

  const handleGroupFormValuesChange = useCallback((values: Record<string, unknown>) => {
    setGroupFormValues(values);
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
    />
  );
}
