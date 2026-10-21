import { useState } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  Stack,
  TextField,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
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
import { PasswordFieldAdornment } from "@/components/PasswordFieldAdornment";

export const SUPERVISOR_REASON_MIN_LENGTH = 5;
export const SUPERVISOR_REASON_MAX_LENGTH = 512;

export interface SupervisorCredentials {
  username: string;
  password: string;
  /** Solo presente cuando el diálogo pide motivo (`reasonLabel`). */
  reason?: string;
}

export interface SupervisorCredentialsDialogProps {
  open: boolean;
  title: string;
  description: string;
  loading?: boolean;
  error?: string | null;
  confirmLabel?: string;
  /** Si se define, muestra el campo de motivo con esa etiqueta. */
  reasonLabel?: string;
  /** Con `reasonLabel`, exige entre 5 y 512 caracteres para habilitar el botón. */
  reasonRequired?: boolean;
  onClose: () => void;
  onConfirm: (credentials: SupervisorCredentials) => void;
}

export function SupervisorCredentialsDialog({
  open,
  title,
  description,
  loading = false,
  error = null,
  confirmLabel = "Autorizar",
  reasonLabel,
  reasonRequired = false,
  onClose,
  onConfirm,
}: SupervisorCredentialsDialogProps) {
  const theme = useTheme();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [reason, setReason] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  if (!open) return null;

  const trimmedReason = reason.trim();
  const showReason = Boolean(reasonLabel);
  const reasonValid =
    !showReason ||
    (trimmedReason.length === 0 && !reasonRequired) ||
    (trimmedReason.length >= SUPERVISOR_REASON_MIN_LENGTH &&
      trimmedReason.length <= SUPERVISOR_REASON_MAX_LENGTH);
  const canSubmit = !loading && Boolean(username.trim()) && Boolean(password) && reasonValid;

  const handleClose = () => {
    if (loading) return;
    setUsername("");
    setPassword("");
    setReason("");
    setShowPassword(false);
    onClose();
  };

  const handleConfirm = () => {
    if (!canSubmit) return;
    onConfirm({
      username: username.trim(),
      password,
      ...(showReason && trimmedReason ? { reason: trimmedReason } : {}),
    });
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
              <ModalTitle>{title}</ModalTitle>
              <ModalDescription>{description}</ModalDescription>
            </ModalTextBlock>
          </ModalHeaderContent>
          <CloseButton onClick={handleClose} disabled={loading} size="small" aria-label="Cerrar">
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
            autoComplete="off"
          />
          <TextField
            label="Contraseña"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={loading}
            fullWidth
            autoComplete="off"
            InputProps={{
              endAdornment: (
                <PasswordFieldAdornment
                  length={password.length}
                  showPassword={showPassword}
                  onToggleVisibility={() => setShowPassword((current) => !current)}
                  iconColor={theme.palette.text.secondary}
                  showCounter={false}
                  disabled={loading}
                />
              ),
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleConfirm();
            }}
          />
          {showReason ? (
            <TextField
              label={reasonLabel}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              disabled={loading}
              fullWidth
              multiline
              minRows={2}
              required={reasonRequired}
              autoComplete="off"
              inputProps={{ maxLength: SUPERVISOR_REASON_MAX_LENGTH }}
              error={Boolean(trimmedReason) && !reasonValid}
              helperText={
                trimmedReason && !reasonValid
                  ? `Mínimo ${SUPERVISOR_REASON_MIN_LENGTH} caracteres.`
                  : undefined
              }
            />
          ) : null}
          <Button
            variant="contained"
            color="primary"
            disabled={!canSubmit}
            onClick={handleConfirm}
          >
            {loading ? <CircularProgress size={18} color="inherit" /> : confirmLabel}
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
