import { useState, useRef, useEffect } from "react";
import { Box, IconButton, CircularProgress } from "@mui/material";
import { Close as CloseIcon, ContentCopy as CopyIcon } from "@mui/icons-material";
import {
  MessageFormContainer,
  MessageFormHeader,
  MessageFormTopRow,
  StatusIndicator,
  MessageNameInput,
  SaveButton,
  ContentSection,
  ContentTitle,
  ContentTextarea,
  VariablesSection,
  VariablesInstruction,
  VariablesContainer,
  VariableChip,
} from "@/styles/catalogos/mensajes.styles";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface MessageFormProps {
  initialName?: string;
  initialContent?: string;
  initialStatus?: "active" | "inactive";
  onClose: () => void;
  onSave: (data: { name: string; content: string; status: "active" | "inactive" }) => Promise<void>;
  loading?: boolean;
}

interface Variable {
  key: string;
  label: string;
  value: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const AVAILABLE_VARIABLES: Variable[] = [
  { key: "fecha_limite", label: "Fecha límite", value: "*fecha_limite*" },
  { key: "num_factura", label: "Número de factura", value: "*num_factura*" },
  { key: "descripcion_factura", label: "Descripción de factura", value: "*descripcion_factura*" },
  { key: "total_adeudo", label: "Total adeudo", value: "*total_adeudo*" },
  { key: "proximo_pag", label: "Próximo pago", value: "*proximo_pag*" },
];

// ============================================================================
// MESSAGE FORM COMPONENT
// ============================================================================

export function MessageForm({
  initialName = "",
  initialContent = "",
  initialStatus = "active",
  onClose,
  onSave,
  loading = false,
}: MessageFormProps) {
  const [name, setName] = useState(initialName);
  const [content, setContent] = useState(initialContent);
  const [status, setStatus] = useState<"active" | "inactive">(initialStatus);
  const [nameError, setNameError] = useState("");
  const [contentError, setContentError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update state when initial values change (for edit mode)
  useEffect(() => {
    setName(initialName);
    setContent(initialContent);
    setStatus(initialStatus);
  }, [initialName, initialContent, initialStatus]);

  // Validate form
  const validate = () => {
    let isValid = true;

    if (!name.trim()) {
      setNameError("El nombre del mensaje es requerido");
      isValid = false;
    } else if (name.trim().length < 3) {
      setNameError("El nombre debe tener al menos 3 caracteres");
      isValid = false;
    } else {
      setNameError("");
    }

    if (!content.trim()) {
      setContentError("El contenido del mensaje es requerido");
      isValid = false;
    } else if (content.trim().length < 10) {
      setContentError("El contenido debe tener al menos 10 caracteres");
      isValid = false;
    } else {
      setContentError("");
    }

    return isValid;
  };

  // Handle save
  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    await onSave({
      name: name.trim(),
      content: content.trim(),
      status,
    });
  };

  // Handle variable insertion
  const handleInsertVariable = (variableValue: string) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentContent = content;
    const newContent =
      currentContent.substring(0, start) + variableValue + currentContent.substring(end);

    setContent(newContent);

    // Set cursor position after inserted variable
    setTimeout(() => {
      const newPosition = start + variableValue.length;
      textarea.setSelectionRange(newPosition, newPosition);
      textarea.focus();
    }, 0);
  };

  // Handle copy variable
  const handleCopyVariable = async (variableValue: string) => {
    try {
      await navigator.clipboard.writeText(variableValue);
    } catch (err) {
      console.error("Failed to copy variable:", err);
    }
  };

  return (
    <MessageFormContainer>
      {/* Header with close button, status, name input, and save button */}
      <MessageFormHeader>
        <MessageFormTopRow>
          <IconButton
            onClick={onClose}
            disabled={loading}
            size="small"
            sx={{
              marginTop: -0.5,
              marginLeft: -1,
              color: "text.secondary",
              "&:hover": {
                backgroundColor: "action.hover",
              },
            }}
          >
            <CloseIcon />
          </IconButton>

          {status === "active" && (
            <StatusIndicator>
              <span>En uso</span>
            </StatusIndicator>
          )}

          <MessageNameInput
            placeholder="Nombre del mensaje"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (nameError) setNameError("");
            }}
            error={!!nameError}
            helperText={nameError}
            disabled={loading}
            size="small"
            autoFocus
          />
        </MessageFormTopRow>

        <SaveButton
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : "Guardar"}
        </SaveButton>
      </MessageFormHeader>

      {/* Content section */}
      <ContentSection>
        <ContentTitle>Contenido del mensaje.</ContentTitle>
        <ContentTextarea
          inputRef={textareaRef}
          placeholder="Escribe el contenido del mensaje aquí..."
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            if (contentError) setContentError("");
          }}
          error={!!contentError}
          helperText={contentError}
          disabled={loading}
          multiline
          rows={6}
        />
      </ContentSection>

      {/* Variables section */}
      <VariablesSection>
        <VariablesInstruction>
          Puedes incrustar datos variables del cliente en tu mensaje como:
        </VariablesInstruction>
        <VariablesContainer>
          {AVAILABLE_VARIABLES.map((variable) => (
            <VariableChip
              key={variable.key}
              label={
                <Box component="span" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <span>{variable.value}</span>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyVariable(variable.value);
                    }}
                    sx={{
                      padding: 0.25,
                      marginLeft: 0.5,
                      "&:hover": {
                        backgroundColor: "transparent",
                      },
                    }}
                  >
                    <CopyIcon sx={{ fontSize: "0.875rem" }} />
                  </IconButton>
                </Box>
              }
              onClick={() => handleInsertVariable(variable.value)}
              clickable
            />
          ))}
        </VariablesContainer>
      </VariablesSection>
    </MessageFormContainer>
  );
}
