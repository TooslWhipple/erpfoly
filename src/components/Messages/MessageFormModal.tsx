import { useState, useCallback, useRef } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { ContentCopy as CopyIcon, Close as CloseIcon } from "@mui/icons-material";
import { SideModal } from "@/components/SideModal";
import { ModalTitle, CloseButton } from "@/components/ModalForm/styles";
import { HeaderRow } from "@/components/SideModal/styles";
import {
    StatusIndicator,
    VariablesSection,
    VariablesInstruction,
    VariablesContainer,
    VariableChip,
    ContentSection,
    ContentTitle,
    ContentTextarea,
    MessageNameInput,
    SaveButton,
} from "@/styles/catalogos/mensajes.styles";
import { MessageVariablesProvider } from "./MessageVariablesContext";
import HighlightedContentInput from "./HighlightedContentInput";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface MessageFormData {
    name: string;
    content: string;
    status: "active" | "inactive";
}

/** Variable available for insertion in message content (e.g. from backend catalog). */
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
    loading?: boolean;
    /** Catalog of variables for insertion (e.g. from API). Used for chips and highlight. */
    messageVariables?: MessageVariableItem[];
}

// ============================================================================
// MESSAGE FORM MODAL COMPONENT
// ============================================================================
// MessageVariablesProvider is used because the custom inputComponent receives only
// MUI input props; the variable list is injected via context for highlighting.

export function MessageFormModal({
    open,
    onClose,
    onConfirm,
    initialValues,
    loading = false,
    messageVariables = [],
}: MessageFormModalProps) {
    const [name, setName] = useState(initialValues?.name ?? "");
    const [content, setContent] = useState(initialValues?.content ?? "");
    const [status, setStatus] = useState<"active" | "inactive">(initialValues?.status ?? "active");

    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const handleInsertVariable = useCallback((variable: string) => {
        const ta = textareaRef.current;
        const start = ta && document.activeElement === ta ? ta.selectionStart : content.length;
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
    }, [content]);

    const handleSave = useCallback(async () => {
        const trimmedName = name.trim();
        const trimmedContent = content.trim();
        if (!trimmedName || !trimmedContent) return;
        await onConfirm({
            name: trimmedName,
            content: trimmedContent,
            status,
        });
    }, [name, content, status, onConfirm]);

    const title = name.trim() || "Nuevo mensaje";
    const canSave = name.trim().length > 0 && content.trim().length > 0;

    return (
        <SideModal
            open={open}
            onClose={onClose}
            disableClose={loading}
            maxWidth="lg"
            fullWidth
            header={
                <HeaderRow>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1, minWidth: 0 }}>
                        <CloseButton
                            onClick={onClose}
                            disabled={loading}
                            size="small"
                            aria-label="Cerrar"
                        >
                            <CloseIcon />
                        </CloseButton>
                        <StatusIndicator
                            variant={status}
                            onClick={() => setStatus((s) => (s === "active" ? "inactive" : "active"))}
                            sx={{ cursor: "pointer", userSelect: "none" }}
                        >
                            {status === "active" ? "En uso" : "Sin uso"}
                        </StatusIndicator>
                        <ModalTitle sx={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>
                            {title}
                        </ModalTitle>
                    </Box>
                    <SaveButton
                        variant="contained"
                        color="primary"
                        onClick={handleSave}
                        disabled={!canSave || loading}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : "Guardar"}
                    </SaveButton>
                </HeaderRow>
            }
        >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <ContentSection>
                    <ContentTitle>Nombre del mensaje</ContentTitle>
                    <MessageNameInput
                        fullWidth
                        size="small"
                        placeholder="Ingresa el nombre del mensaje"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        name="message-name"
                    />
                </ContentSection>

                <ContentSection>
                    <ContentTitle>Contenido del mensaje.</ContentTitle>
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
                                input: { inputComponent: HighlightedContentInput },
                            }}
                        />
                    </MessageVariablesProvider>
                </ContentSection>

                <VariablesSection>
                    <VariablesInstruction>
                        Puedes incrustar datos variables del cliente en tu mensaje como:
                    </VariablesInstruction>
                    <VariablesContainer>
                        {messageVariables.map((variable) => (
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
            </Box>
        </SideModal>
    );
}
