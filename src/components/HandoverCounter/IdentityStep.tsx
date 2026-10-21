import { useState } from "react";
import { Alert, Button, Chip, Stack, TextField, Typography } from "@mui/material";
import { ShieldCheck } from "lucide-react";
import { useOtpCooldown } from "@/hooks/common/useOtpCooldown";
import { SupervisorCredentialsDialog } from "@/components/SupervisorCredentialsDialog";
import type { SupervisorCredentials } from "@/components/SupervisorCredentialsDialog";
import {
  authorizeHandoverWithSupervisor,
  requestHandoverOtp,
  verifyHandoverOtp,
} from "@/services/sale-handover.service";
import type {
  HandoverAuthorizationPurpose,
  HandoverSaleDetail,
} from "@/types/saleHandover.types";
import { activeAuthorizationFor } from "./handover";
import { handoverErrorMessage } from "./handoverErrors";
import { SectionCard } from "./styles";

const OTP_LENGTH = 6;

export interface IdentityStepProps {
  detail: HandoverSaleDetail;
  branchId: number;
  identityAuthorized: boolean;
  expiredHoldAuthorized: boolean;
  onIdentityAuthorized: (authorizationId: string) => void;
  onExpiredHoldAuthorized: (authorizationId: string) => void;
  disabled?: boolean;
}

export function IdentityStep({
  detail,
  branchId,
  identityAuthorized,
  expiredHoldAuthorized,
  onIdentityAuthorized,
  onExpiredHoldAuthorized,
  disabled = false,
}: IdentityStepProps) {
  const [phoneMasked, setPhoneMasked] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [dialogPurpose, setDialogPurpose] =
    useState<HandoverAuthorizationPurpose | null>(null);
  const [supervising, setSupervising] = useState(false);
  const [supervisorError, setSupervisorError] = useState<string | null>(null);
  const [supervisorName, setSupervisorName] = useState<string | null>(
    () => activeAuthorizationFor(detail, "IDENTITY")?.supervisor?.name ?? null,
  );

  const otpCooldown = useOtpCooldown(`sale-handover:identity-otp:${detail.saleId}`);
  const cooldownSeconds = otpCooldown.remainingSeconds;

  const handleSend = async () => {
    setSending(true);
    setOtpError(null);
    const result = await requestHandoverOtp(detail.saleId, { branchId });
    setSending(false);
    if (result.error || !result.data) {
      if (result.error?.errorCode === "OTP_COOLDOWN") {
        const until = result.error.data?.cooldownUntil;
        if (typeof until === "string") otpCooldown.start(until);
      }
      setOtpError(
        result.error
          ? handoverErrorMessage(result.error)
          : "No se pudo enviar el código.",
      );
      return;
    }
    setPhoneMasked(result.data.phoneMasked);
    otpCooldown.start(result.data.cooldownUntil);
    setCode("");
  };

  const handleVerify = async () => {
    setVerifying(true);
    setOtpError(null);
    const result = await verifyHandoverOtp(detail.saleId, { branchId, code });
    setVerifying(false);
    if (result.error || !result.data) {
      setOtpError(
        result.error
          ? handoverErrorMessage(result.error)
          : "No se pudo verificar el código.",
      );
      setCode("");
      return;
    }
    setSupervisorName(null);
    onIdentityAuthorized(result.data.authorizationId);
  };

  const handleSupervisor = async (credentials: SupervisorCredentials) => {
    if (!dialogPurpose) return;
    const purpose = dialogPurpose;
    setSupervising(true);
    setSupervisorError(null);
    const result = await authorizeHandoverWithSupervisor(detail.saleId, {
      branchId,
      purpose,
      username: credentials.username,
      password: credentials.password,
      ...(credentials.reason ? { reason: credentials.reason } : {}),
    });
    setSupervising(false);
    if (result.error || !result.data) {
      setSupervisorError(
        result.error
          ? handoverErrorMessage(result.error)
          : "No se pudo autorizar.",
      );
      return;
    }
    setDialogPurpose(null);
    if (purpose === "IDENTITY") {
      setSupervisorName(result.data.supervisor.name);
      onIdentityAuthorized(result.data.authorizationId);
    } else {
      onExpiredHoldAuthorized(result.data.authorizationId);
    }
  };

  if (!detail.requiresIdentityAuthorization && !detail.requiresExpiredHoldAuthorization) {
    return null;
  }

  const receiver = detail.receiver;

  return (
    <Stack spacing={2}>
      {detail.requiresIdentityAuthorization ? (
        <SectionCard>
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Typography variant="subtitle1" fontWeight={700}>
                Identidad de quien recibe
              </Typography>
              {identityAuthorized ? (
                <Chip size="small" color="success" label="Validada" />
              ) : (
                <Chip size="small" color="warning" label="Pendiente" />
              )}
            </Stack>
            {receiver.type === "THIRD_PARTY" ? (
              <Typography variant="body2" color="text.secondary">
                Recibe un tercero: <strong>{receiver.thirdPartyName}</strong> (
                {receiver.thirdPartyPhoneMasked}). Se le envía un código por
                WhatsApp.
              </Typography>
            ) : null}

            {identityAuthorized ? (
              <Alert severity="success">
                {supervisorName
                  ? `Identidad autorizada por ${supervisorName}.`
                  : "Código verificado."}
              </Alert>
            ) : (
              <>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }}>
                  <Button
                    variant="outlined"
                    onClick={() => void handleSend()}
                    disabled={disabled || sending || cooldownSeconds > 0}
                  >
                    {sending
                      ? "Enviando..."
                      : cooldownSeconds > 0
                        ? `Reenviar en ${cooldownSeconds} s`
                        : phoneMasked
                          ? "Reenviar código"
                          : "Enviar código"}
                  </Button>
                  {phoneMasked ? (
                    <Typography variant="body2" color="text.secondary">
                      Enviado al celular {phoneMasked}
                    </Typography>
                  ) : null}
                </Stack>
                <Stack direction="row" spacing={1.5}>
                  <TextField
                    size="small"
                    label="Código de 6 dígitos"
                    value={code}
                    disabled={disabled || verifying}
                    onChange={(event) =>
                      setCode(event.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH))
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && code.length === OTP_LENGTH) {
                        void handleVerify();
                      }
                    }}
                    inputProps={{
                      inputMode: "numeric",
                      autoComplete: "one-time-code",
                      maxLength: OTP_LENGTH,
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={() => void handleVerify()}
                    disabled={disabled || verifying || code.length !== OTP_LENGTH}
                  >
                    {verifying ? "Verificando..." : "Verificar"}
                  </Button>
                </Stack>
                {otpError ? <Alert severity="error">{otpError}</Alert> : null}
                <Button
                  size="small"
                  startIcon={<ShieldCheck size={16} aria-hidden />}
                  onClick={() => {
                    setSupervisorError(null);
                    setDialogPurpose("IDENTITY");
                  }}
                  disabled={disabled}
                  sx={{ alignSelf: "flex-start" }}
                >
                  Autorización de respaldo
                </Button>
              </>
            )}
          </Stack>
        </SectionCard>
      ) : null}

      {detail.requiresExpiredHoldAuthorization ? (
        <SectionCard>
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Typography variant="subtitle1" fontWeight={700}>
                Resguardo vencido
              </Typography>
              {expiredHoldAuthorized ? (
                <Chip size="small" color="success" label="Autorizado" />
              ) : (
                <Chip size="small" color="warning" label="Requiere autorización" />
              )}
            </Stack>
            <Typography variant="body2" color="text.secondary">
              El resguardo de esta venta venció. Un responsable debe autorizar
              la entrega e indicar el motivo.
            </Typography>
            {!expiredHoldAuthorized ? (
              <Button
                variant="outlined"
                startIcon={<ShieldCheck size={16} aria-hidden />}
                onClick={() => {
                  setSupervisorError(null);
                  setDialogPurpose("EXPIRED_HOLD");
                }}
                disabled={disabled}
                sx={{ alignSelf: "flex-start" }}
              >
                Autorizar entrega vencida
              </Button>
            ) : null}
          </Stack>
        </SectionCard>
      ) : null}

      {dialogPurpose !== null ? (
      <SupervisorCredentialsDialog
        open
        title={
          dialogPurpose === "EXPIRED_HOLD"
            ? "Autorizar resguardo vencido"
            : "Autorización de respaldo"
        }
        description={
          dialogPurpose === "EXPIRED_HOLD"
            ? "Un gerente o administrador debe ingresar sus credenciales y el motivo."
            : "Un gerente o administrador autoriza la entrega sin el código del tercero."
        }
        reasonLabel={
          dialogPurpose === "EXPIRED_HOLD"
            ? "Motivo (obligatorio)"
            : "Motivo (opcional)"
        }
        reasonRequired={dialogPurpose === "EXPIRED_HOLD"}
        loading={supervising}
        error={supervisorError}
        onClose={() => setDialogPurpose(null)}
        onConfirm={(credentials) => void handleSupervisor(credentials)}
      />
      ) : null}
    </Stack>
  );
}
