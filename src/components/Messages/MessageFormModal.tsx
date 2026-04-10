import { useState, useCallback, useRef } from "react";
import { Typography, CircularProgress, Stack, Button } from "@mui/material";
import { SideModal } from "@/components/SideModal";
import {
  VariablesSection,
  VariablesContainer,
  VariableChip,
  ContentTextarea,
  MessageNameInput,
} from "@/styles/catalogos/mensajes.styles";
import { MessageVariablesProvider } from "./MessageVariablesContext";
import HighlightedContentInput from "./HighlightedContentInput";
import { StatusChip } from "../StatusChip";
import { Copy } from "lucide-react";
import { theme } from "@/styles/theme";

export interface MessageFormData {
  name: string;
  content: string;
  status: "active" | "inactive";
}

export interface MessageVariableItem {
  key: string;
  label: string;
  value: string;
}

export interface MessageFormModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: MessageFormData) => Promise<void>;
  initialValues?: Partial<MessageFormData>;
  /** When defined (editing), shows "En uso" / "Sin uso" in header. When undefined (new), no chip is shown. */
  inUse?: boolean;
  loading?: boolean;
  messageVariables?: MessageVariableItem[];
}

export function MessageFormModal({
  open,
  onClose,
  onConfirm,
  initialValues,
  inUse,
  loading = false,
  messageVariables = [],
}: MessageFormModalProps) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [content, setContent] = useState(initialValues?.content ?? "");

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleInsertVariable = useCallback(
    (variable: string) => {
      const ta = textareaRef.current;
      const start =
        ta && document.activeElement === ta ? ta.selectionStart : content.length;
      const end = ta && document.activeElement === ta ? ta.selectionEnd : content.length;
      const newContent = content.substring(0, start) + variable + content.substring(end);
      setContent(newContent);
      setTimeout(() => {
        if (ta) {
          const newPosition = start + variable.length;
          ta.setSelectionRange(newPosition, newPosition);
          ta.focus();
        }
      }, 0);
    },
    [content],
  );

  const handleSave = useCallback(async () => {
    const trimmedName = name.trim();
    const trimmedContent = content.trim();
    if (!trimmedName || !trimmedContent) return;
    await onConfirm({
      name: trimmedName,
      content: trimmedContent,
      status: initialValues?.status ?? "active",
    });
  }, [name, content, initialValues?.status, onConfirm]);

  const canSave = name.trim().length > 0 && content.trim().length > 0;
  const isEditing = inUse !== undefined;
  const title = isEditing ? name.trim() || "Nuevo mensaje" : "Nuevo mensaje";

  return (
    <SideModal
      open={open}
      onClose={onClose}
      disableClose={loading}
      maxWidth="lg"
      fullWidth
      header={
        <Stack
          direction="row"
          width="100%"
          spacing={2}
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack spacing={1} alignItems="flex-start">
            {isEditing && (
              <StatusChip
                size="small"
                label={inUse ? "En uso" : "Sin uso"}
                variant={inUse ? "success" : "default"}
              />
            )}
            <Typography variant="h6">{title}</Typography>
          </Stack>
          <Button variant="contained" onClick={handleSave} disabled={!canSave || loading}>
            {loading ? <CircularProgress size={24} color="inherit" /> : "Guardar"}
          </Button>
        </Stack>
      }
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          border: "1px solid #e0e0e0",
          borderRadius: "16px",
          padding: "24px",
          backgroundColor: "white",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Nombre del mensaje
        </Typography>
        <MessageNameInput
          fullWidth
          size="small"
          placeholder="Ingresa el nombre del mensaje"
          value={name}
          onChange={(e) => setName(e.target.value)}
          name="message-name"
          slotProps={{
            input: { style: { backgroundColor: theme.palette.background.content } },
          }}
        />

        <Typography variant="body2" color="text.secondary">
          Contenido del mensaje.
        </Typography>
        <MessageVariablesProvider value={messageVariables.map((v) => v.value)}>
          <ContentTextarea
            fullWidth
            multiline
            minRows={6}
            placeholder="Escribe el contenido del mensaje aquí..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            name="message-content"
            inputRef={(el) => {
              if (el) textareaRef.current = el;
            }}
            slotProps={{
              input: { inputComponent: HighlightedContentInput, style: { backgroundColor: theme.palette.background.content } },
            }}
          />
        </MessageVariablesProvider>

        <VariablesSection>
          <Typography variant="body2" color="text.secondary">
            Puedes incrustar datos variables del cliente en tu mensaje como:
          </Typography>
          <VariablesContainer>
            {messageVariables.map((variable) => (
              <VariableChip
                key={variable.key}
                label={
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Typography component="span" sx={{ fontSize: "0.875rem" }}>
                      {variable.value}
                    </Typography>
                    <Copy size={16} />
                  </Stack>
                }
                onClick={() => handleInsertVariable(variable.value)}
                clickable
              />
            ))}
          </VariablesContainer>
        </VariablesSection>
      </div>
    </SideModal>
  );
}
