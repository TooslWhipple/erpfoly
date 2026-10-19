import { SupervisorCredentialsDialog } from "@/components/SupervisorCredentialsDialog";

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
  return (
    <SupervisorCredentialsDialog
      open={open}
      loading={loading}
      error={error}
      title="Autorizar reimpresión"
      description="Se requiere usuario y contraseña de Gerencia o Administración para reimprimir etiquetas de este folio."
      onClose={onClose}
      onConfirm={({ username, password }) => onConfirm({ username, password })}
    />
  );
}
