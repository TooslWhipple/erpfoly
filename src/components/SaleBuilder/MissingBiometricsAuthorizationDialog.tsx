import { useState } from "react";
import { Alert, Button, CircularProgress, Dialog, Stack, TextField } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { authorizeMissingBiometrics } from "@/services/ventas.service";
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

type DialogView = "choice" | "authorize";

interface MissingBiometricsAuthorizationDialogProps {
  open: boolean;
  saleId: number | null;
  onClose: () => void;
  onAuthorized: () => void;
  onEnroll: () => void;
}

export function MissingBiometricsAuthorizationDialog({
  open,
  saleId,
  onClose,
  onAuthorized,
  onEnroll,
}: MissingBiometricsAuthorizationDialogProps) {
  if (!open) return null;
  return (
    <MissingBiometricsAuthorizationForm
      saleId={saleId}
      onClose={onClose}
      onAuthorized={onAuthorized}
      onEnroll={onEnroll}
    />
  );
}

function MissingBiometricsAuthorizationForm({
  saleId,
  onClose,
  onAuthorized,
  onEnroll,
}: Omit<MissingBiometricsAuthorizationDialogProps, "open">) {
  const [view, setView] = useState<DialogView>("choice");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const authorizeMutation = useMutation({
    mutationFn: async () => {
      if (saleId == null) {
        throw new Error("No hay una venta activa para autorizar");
      }
      if (!username.trim() || !password) {
        throw new Error("Usuario y contraseña son requeridos");
      }
      const res = await authorizeMissingBiometrics(saleId, {
        username: username.trim(),
        password,
      });
      if (res.error) throw new Error(res.error.message);
      return res.data;
    },
    onSuccess: () => {
      setPassword("");
      onAuthorized();
    },
  });

  const handleClose = () => {
    if (authorizeMutation.isPending) return;
    setPassword("");
    onClose();
  };

  const isChoice = view === "choice";

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
              {isChoice ? (
                <AlertTriangle size={22} aria-hidden />
              ) : (
                <ShieldCheck size={22} aria-hidden />
              )}
            </IconBadge>
            <ModalTextBlock>
              <ModalTitle>
                {isChoice ? "Validar identidad" : "Autorización en caja"}
              </ModalTitle>
              <ModalDescription>
                {isChoice
                  ? "El cliente no tiene biometría registrada. Captúrala ahora, o autoriza el cobro en caja."
                  : "Un analista de crédito, gerente o administrador debe ingresar sus credenciales para cobrar sin biometría."}
              </ModalDescription>
            </ModalTextBlock>
          </ModalHeaderContent>
          <CloseButton
            onClick={handleClose}
            size="small"
            aria-label="Cerrar"
            disabled={authorizeMutation.isPending}
          >
            <CloseIcon fontSize="small" />
          </CloseButton>
        </ModalHeader>

        {isChoice ? (
          <Stack spacing={1.25}>
            <Button variant="contained" onClick={onEnroll} fullWidth>
              Capturar ahora
            </Button>
            <Button color="inherit" onClick={() => setView("authorize")} fullWidth>
              Autorizar en caja
            </Button>
          </Stack>
        ) : (
          <Stack spacing={2}>
            <TextField
              label="Usuario"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              disabled={authorizeMutation.isPending}
              fullWidth
              autoComplete="username"
            />
            <TextField
              label="Contraseña"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={authorizeMutation.isPending}
              fullWidth
              autoComplete="current-password"
            />
            {authorizeMutation.isError ? (
              <Alert severity="error">{authorizeMutation.error.message}</Alert>
            ) : null}
            <Stack spacing={1.25}>
              <Button
                variant="contained"
                disabled={authorizeMutation.isPending}
                onClick={() => authorizeMutation.mutate()}
                fullWidth
              >
                {authorizeMutation.isPending ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  "Autorizar"
                )}
              </Button>
              <Button
                color="inherit"
                onClick={() => setView("choice")}
                disabled={authorizeMutation.isPending}
                fullWidth
              >
                Volver
              </Button>
            </Stack>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}
