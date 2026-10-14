import { useState } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  Stack,
  TextField,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { ShieldCheck } from "lucide-react";
import {
  CloseButton,
  DialogContent,
  IconBadge,
  ModalDescription,
  ModalHeader,
  ModalHeaderContent,
  ModalTextBlock,
  ModalTitle,
} from "@/components/ConfirmModal/styles";

export interface ReprintLabelsAuthDialogProps {
  open: boolean;
  loading?: boolean;
  error?: string | null;
  onClose: () => void;
  onConfirm: (credentials: { username: string; password: string }) => void;
}

export function ReprintLabelsAuthDialog({
  open,
  loading = false,
  error = null,
  onClose,
  onConfirm,
}: ReprintLabelsAuthDialogProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  if (!open) return null;

  const handleClose = () => {
    if (loading) return;
    setUsername("");
    setPassword("");
    onClose();
  };

  const handleConfirm = () => {
    if (!username.trim() || !password) return;
    onConfirm({ username: username.trim(), password });
  };

  return (
    <Dialog
      open
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogContent>
        <ModalHeader>
          <ModalHeaderContent>
            <IconBadge modalType="warning">
              <ShieldCheck size={22} aria-hidden />
            </IconBadge>
            <ModalTextBlock>
              <ModalTitle>Autorizar reimpresión</ModalTitle>
              <ModalDescription>
                Se requiere usuario y contraseña de Gerencia o Administración
                para reimprimir etiquetas de este folio.
              </ModalDescription>
            </ModalTextBlock>
          </ModalHeaderContent>
          <CloseButton onClick={handleClose} disabled={loading} size="small">
            <CloseIcon fontSize="small" />
          </CloseButton>
        </ModalHeader>

        <Stack spacing={2} sx={{ mt: 2 }}>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <TextField
            label="Usuario"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            disabled={loading}
            autoFocus
            fullWidth
          />
          <TextField
            label="Contraseña"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={loading}
            fullWidth
            onKeyDown={(event) => {
              if (event.key === "Enter") handleConfirm();
            }}
          />
          <Button
            variant="contained"
            color="primary"
            disabled={loading || !username.trim() || !password}
            onClick={handleConfirm}
          >
            {loading ? <CircularProgress size={18} color="inherit" /> : "Autorizar"}
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
