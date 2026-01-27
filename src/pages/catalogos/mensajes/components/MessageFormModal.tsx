import { useState, useEffect, useCallback, useRef } from "react";
import { Box, Typography } from "@mui/material";
import { ContentCopy as CopyIcon } from "@mui/icons-material";
import { ModalForm } from "@/components/ModalForm";
import type { FormFieldConfig } from "@/components/Form";
import {
  MessageFormTopRow,
  StatusIndicator,
  VariablesSection,
  VariablesInstruction,
  VariablesContainer,
  VariableChip,
} from "@/styles/catalogos/mensajes.styles";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface MessageFormData {
  name: string;
  content: string;
  status: "active" | "inactive";
}

export interface MessageFormModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: MessageFormData) => Promise<void>;
  initialValues?: Partial<MessageFormData>;
  loading?: boolean;
}

interface MessageVariable {
  key: string;
  label: string;
  value: string;
}

// ============================================================================
// MESSAGE VARIABLES
// ============================================================================

const MESSAGE_VARIABLES: MessageVariable[] = [
  { key: "fecha_limite", label: "Fecha límite", value: "*fecha_limite*" },
  { key: "num_factura", label: "Número de factura", value: "*num_factura*" },
  { key: "descripcion_factura", label: "Descripción de factura", value: "*descripcion_factura*" },
  { key: "total_adeudo", label: "Total adeudo", value: "*total_adeudo*" },
  { key: "proximo_pag", label: "Próximo pago", value: "*proximo_pag*" },
];

// ============================================================================
// MESSAGE FORM MODAL COMPONENT
// ============================================================================

export function MessageFormModal({
  open,
  onClose,
  onConfirm,
  initialValues,
  loading = false,
}: MessageFormModalProps) {
  const [formValues, setFormValues] = useState<Record<string, unknown>>({
    name: initialValues?.name || "",
    content: initialValues?.content || "",
    status: initialValues?.status || "active",
  });

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const cursorPositionRef = useRef<number>(0);

  // Find and store textarea reference when modal opens
  useEffect(() => {
    if (open) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        const textarea = document.querySelector(
          'textarea[name="content"]'
        ) as HTMLTextAreaElement | null;
        if (textarea) {
          textareaRef.current = textarea;
          
          // Store cursor position on selection change
          const handleSelectionChange = () => {
            if (textarea === document.activeElement) {
              cursorPositionRef.current = textarea.selectionStart;
            }
          };
          
          textarea.addEventListener("click", handleSelectionChange);
          textarea.addEventListener("keyup", handleSelectionChange);
          
          return () => {
            textarea.removeEventListener("click", handleSelectionChange);
            textarea.removeEventListener("keyup", handleSelectionChange);
          };
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Handle form values change
  const handleValuesChange = useCallback((values: Record<string, unknown>) => {
    setFormValues(values);
  }, []);

  // Handle variable insertion
  const handleInsertVariable = useCallback((variable: string) => {
    const textarea = textareaRef.current;
    const currentContent = (formValues.content as string) || "";
    
    if (textarea && document.activeElement === textarea) {
      // Insert at cursor position
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent =
        currentContent.substring(0, start) + variable + currentContent.substring(end);
      
      setFormValues((prev) => ({
        ...prev,
        content: newContent,
      }));

      // Set cursor position after inserted variable
      setTimeout(() => {
        const newPosition = start + variable.length;
        textarea.setSelectionRange(newPosition, newPosition);
        textarea.focus();
      }, 0);
    } else {
      // Insert at end if textarea is not focused
      const newContent = currentContent + (currentContent ? " " : "") + variable;
      setFormValues((prev) => ({
        ...prev,
        content: newContent,
      }));
      
      // Focus textarea after insertion
      setTimeout(() => {
        if (textarea) {
          const newPosition = newContent.length;
          textarea.setSelectionRange(newPosition, newPosition);
          textarea.focus();
        }
      }, 0);
    }
  }, [formValues.content]);

  // Handle form confirm
  const handleConfirm = useCallback(
    async (data: Record<string, unknown>) => {
      await onConfirm({
        name: data.name as string,
        content: data.content as string,
        status: (data.status as "active" | "inactive") || "active",
      });
    },
    [onConfirm]
  );

  // Reset form when modal closes or initialValues change
  useEffect(() => {
    if (open) {
      setFormValues({
        name: initialValues?.name || "",
        content: initialValues?.content || "",
        status: initialValues?.status || "active",
      });
    }
  }, [open, initialValues]);

  // Form fields configuration
  const fields: FormFieldConfig[] = [
    {
      name: "name",
      label: "Nombre del mensaje",
      type: "text",
      placeholder: "Ingresa el nombre del mensaje",
      validation: {
        required: true,
        minLength: 1,
        maxLength: 255,
      },
      autoFocus: true,
    },
    {
      name: "content",
      label: "Contenido del mensaje",
      type: "textarea",
      placeholder: "Escribe el contenido del mensaje aquí...",
      rows: 6,
      validation: {
        required: true,
        minLength: 1,
      },
    },
  ];

  const isActive = formValues.status === "active";

  return (
    <ModalForm
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fields={fields}
      onConfirm={handleConfirm}
      onValuesChange={handleValuesChange}
      initialValues={formValues}
      loading={loading}
      confirmLabel="Guardar"
      cancelLabel="Cancelar"
      showActions={true}
      title={initialValues?.name ? "Editar mensaje" : "Nuevo mensaje"}
      headerContent={
        isActive ? (
          <StatusIndicator>En uso</StatusIndicator>
        ) : undefined
      }
    >

      {/* Variables section */}
      <VariablesSection>
        <VariablesInstruction>
          Puedes incrustar datos variables del cliente en tu mensaje como:
        </VariablesInstruction>
        <VariablesContainer>
          {MESSAGE_VARIABLES.map((variable) => (
            <VariableChip
              key={variable.key}
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Typography component="span" sx={{ fontSize: "0.875rem" }}>
                    {variable.value}
                  </Typography>
                  <CopyIcon sx={{ fontSize: "1rem" }} />
                </Box>
              }
              onClick={() => handleInsertVariable(variable.value)}
              clickable
            />
          ))}
        </VariablesContainer>
      </VariablesSection>
    </ModalForm>
  );
}
