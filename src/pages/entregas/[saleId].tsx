import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { Title } from "@/components";
import {
  EvidenceStep,
  HandoverResult,
  HandoverSaleView,
  IdentityStep,
} from "@/components/HandoverCounter";
import {
  activeAuthorizationFor,
  buildConfirmRequest,
  canConfirm,
  type CapturedLines,
} from "@/components/HandoverCounter/handover";
import {
  handoverErrorMessage,
  shouldReloadDetail,
} from "@/components/HandoverCounter/handoverErrors";
import { StatusChip } from "@/components/StatusChip/StatusChip";
import { SectionCard } from "@/components/HandoverCounter/styles";
import { useHandoverSaleDetail } from "@/hooks/sale-handover/useHandoverSaleDetail";
import { confirmHandover } from "@/services/sale-handover.service";
import type {
  HandoverResult as HandoverResultData,
  HandoverSaleDetail,
} from "@/types/saleHandover.types";

function parsePositiveInt(value: string | string[] | undefined): number | null {
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

function defaultReceiverName(detail: HandoverSaleDetail): string {
  return detail.receiver.type === "THIRD_PARTY"
    ? detail.receiver.thirdPartyName
    : detail.client.name;
}

export default function EntregaDetallePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const saleId = parsePositiveInt(router.query.saleId);
  const branchId = parsePositiveInt(router.query.branchId);

  const {
    data: detail,
    isLoading,
    isError,
    error,
    refetch,
  } = useHandoverSaleDetail(router.isReady ? saleId : null, branchId);

  const [captured, setCaptured] = useState<CapturedLines>({});
  const [receiverNameInput, setReceiverNameInput] = useState<string | null>(null);
  const [signatureFileId, setSignatureFileId] = useState<number | null>(null);
  const [ineFrontFileId, setIneFrontFileId] = useState<number | null>(null);
  const [ineBackFileId, setIneBackFileId] = useState<number | null>(null);
  // `undefined` = sin decisión del usuario: vale el respaldo vigente que trae el
  // detalle (así sobrevive a recargar). `null` = descartado o ya consumido.
  const [identityAuthOverride, setIdentityAuthId] = useState<string | null | undefined>(undefined);
  const [expiredAuthOverride, setExpiredAuthId] = useState<string | null | undefined>(undefined);
  const identityAuthId =
    identityAuthOverride !== undefined
      ? identityAuthOverride
      : detail
        ? (activeAuthorizationFor(detail, "IDENTITY")?.authorizationId ?? null)
        : null;
  const expiredAuthId =
    expiredAuthOverride !== undefined
      ? expiredAuthOverride
      : detail
        ? (activeAuthorizationFor(detail, "EXPIRED_HOLD")?.authorizationId ?? null)
        : null;
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<HandoverResultData | null>(null);
  const idempotencyKeyRef = useRef<string | null>(null);

  const receiverName =
    receiverNameInput ?? (detail ? defaultReceiverName(detail) : "");

  // La clave de idempotencia se renueva al cambiar cualquier dato de la entrega;
  // un reintento sin cambios reutiliza la misma.
  useEffect(() => {
    idempotencyKeyRef.current = null;
  }, [
    captured,
    receiverName,
    identityAuthId,
    expiredAuthId,
    signatureFileId,
    ineFrontFileId,
    ineBackFileId,
  ]);

  const resetForm = () => {
    setCaptured({});
    setReceiverNameInput(null);
    setSignatureFileId(null);
    setIneFrontFileId(null);
    setIneBackFileId(null);
    setIdentityAuthId(null);
    setExpiredAuthId(null);
    setSubmitError(null);
    idempotencyKeyRef.current = null;
  };

  if (!router.isReady || isLoading) {
    return (
      <Stack alignItems="center" py={8}>
        <CircularProgress size={28} />
      </Stack>
    );
  }

  if (saleId === null || branchId === null) {
    return (
      <Stack spacing={2}>
        <Title title="Entrega" />
        <Alert severity="error">
          Falta la venta o la sucursal. Vuelve a la cola de entregas.
        </Alert>
        <Button onClick={() => void router.push("/entregas")}>
          Volver a entregas
        </Button>
      </Stack>
    );
  }

  if (isError || !detail) {
    return (
      <Stack spacing={2}>
        <Title title="Entrega" />
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => void refetch()}>
              Reintentar
            </Button>
          }
        >
          {error instanceof Error
            ? error.message
            : "No se pudo cargar la venta."}
        </Alert>
        <Button
          sx={{ alignSelf: "flex-start" }}
          onClick={() => void router.push("/entregas")}
        >
          Volver a entregas
        </Button>
      </Stack>
    );
  }

  const goToQueue = () => {
    void queryClient.invalidateQueries({ queryKey: ["sale-handover"] });
    void router.push("/entregas");
  };

  if (result) {
    return (
      <Stack spacing={3}>
        <Title title={`Entrega · ${result.folio}`} />
        <HandoverResult
          result={result}
          onNext={goToQueue}
          onContinueSale={() => {
            setResult(null);
            resetForm();
            void refetch();
          }}
        />
      </Stack>
    );
  }

  const confirmInput = {
    detail,
    captured,
    receiverName,
    signatureFileId,
    identityAuthorizationId: identityAuthId,
    expiredHoldAuthorizationId: expiredAuthId,
  };
  const confirmEnabled = canConfirm(confirmInput) && !submitting;

  const missing: string[] = [];
  if (!detail.blockReason) {
    if (Object.keys(captured).length === 0) missing.push("marcar al menos una pieza");
    if (detail.requiresIdentityAuthorization && !identityAuthId) missing.push("validar la identidad");
    if (detail.requiresExpiredHoldAuthorization && !expiredAuthId) missing.push("autorizar el resguardo vencido");
    if (receiverName.trim().length < 2) missing.push("capturar el nombre de quien recibe");
    if (signatureFileId === null) missing.push("guardar la firma");
  }

  const handleConfirm = async () => {
    idempotencyKeyRef.current ??= crypto.randomUUID();
    const request = buildConfirmRequest({
      ...confirmInput,
      branchId,
      idempotencyKey: idempotencyKeyRef.current,
      ineFrontFileId,
      ineBackFileId,
    });
    if (!request) return;
    setSubmitting(true);
    setSubmitError(null);
    const response = await confirmHandover(request);
    setSubmitting(false);
    if (response.error || !response.data) {
      const apiError = response.error;
      setSubmitError(
        apiError ? handoverErrorMessage(apiError) : "No se pudo registrar la entrega.",
      );
      if (apiError?.errorCode === "AUTHORIZATION_REQUIRED" || apiError?.errorCode === "AUTHORIZATION_INVALID") {
        if (apiError.data?.purpose === "EXPIRED_HOLD") setExpiredAuthId(null);
        else setIdentityAuthId(null);
      }
      if (apiError?.errorCode === "IDEMPOTENCY_KEY_REUSED") {
        idempotencyKeyRef.current = null;
      }
      if (apiError && shouldReloadDetail(apiError)) {
        setCaptured({});
        void refetch();
      }
      return;
    }
    idempotencyKeyRef.current = null;
    void queryClient.invalidateQueries({ queryKey: ["sale-handover"] });
    setResult(response.data);
  };

  const receiver = detail.receiver;

  return (
    <Stack spacing={3}>
      <Title title={`Entrega · ${detail.folio}`} />

      <SectionCard>
        <Stack spacing={0.75}>
          <Typography variant="subtitle1" fontWeight={700}>
            {detail.client.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Venta {detail.folio} · Entrega en {detail.branch.name}
            {detail.client.phoneMasked ? ` · ${detail.client.phoneMasked}` : ""}
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <StatusChip
              size="small"
              label={
                receiver.type === "THIRD_PARTY"
                  ? `Recibe: ${receiver.thirdPartyName} (tercero)`
                  : "Recibe el titular"
              }
            />
            {detail.hold?.status === "EXPIRED" ? (
              <StatusChip size="small" variant="warning" label="Resguardo vencido" />
            ) : null}
          </Stack>
        </Stack>
      </SectionCard>

      <HandoverSaleView
        detail={detail}
        captured={captured}
        onCapturedChange={setCaptured}
        disabled={submitting}
      />

      {!detail.blockReason ? (
        <>
          <IdentityStep
            detail={detail}
            branchId={branchId}
            identityAuthorized={identityAuthId !== null}
            expiredHoldAuthorized={expiredAuthId !== null}
            onIdentityAuthorized={setIdentityAuthId}
            onExpiredHoldAuthorized={setExpiredAuthId}
            disabled={submitting}
          />

          <EvidenceStep
            receiverName={receiverName}
            onReceiverNameChange={setReceiverNameInput}
            signatureFileId={signatureFileId}
            onSignatureFileIdChange={setSignatureFileId}
            ineFrontFileId={ineFrontFileId}
            onIneFrontFileIdChange={setIneFrontFileId}
            ineBackFileId={ineBackFileId}
            onIneBackFileIdChange={setIneBackFileId}
            disabled={submitting}
          />

          {submitError ? <Alert severity="error">{submitError}</Alert> : null}

          {missing.length > 0 ? (
            <Typography variant="body2" color="text.secondary">
              Para confirmar falta: {missing.join(", ")}.
            </Typography>
          ) : null}

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Button
              variant="contained"
              size="large"
              disabled={!confirmEnabled}
              onClick={() => void handleConfirm()}
            >
              {submitting ? "Registrando..." : "Confirmar entrega"}
            </Button>
            <Button variant="text" onClick={() => void router.push("/entregas")}>
              Cancelar
            </Button>
          </Stack>
        </>
      ) : (
        <Button
          sx={{ alignSelf: "flex-start" }}
          onClick={() => void router.push("/entregas")}
        >
          Volver a entregas
        </Button>
      )}
    </Stack>
  );
}
