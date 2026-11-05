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
  ChangeDeliveryBranchDialog,
  EvidenceStep,
  HandoverResult,
  HandoverSaleView,
  IdentityStep,
  ReceiverSection,
} from "@/components/HandoverCounter";
import {
  activeAuthorizationFor,
  buildConfirmRequest,
  canChangeDeliveryBranch,
  canConfirm,
  canProcess,
  identityOtpTimerId,
  receiverStepKey,
  type CapturedLines,
} from "@/components/HandoverCounter/handover";
import {
  handoverErrorMessage,
  shouldReloadDetail,
} from "@/components/HandoverCounter/handoverErrors";
import { StatusChip } from "@/components/StatusChip/StatusChip";
import { SectionCard } from "@/components/HandoverCounter/styles";
import { usePermissions } from "@/hooks/usePermissions";
import { DELIVERY_HANDOVER_UPDATE } from "@/lib/permissions";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { useOtpCooldownStore } from "@/store/useOtpCooldownStore";
import { useHandoverSaleDetail } from "@/hooks/sale-handover/useHandoverSaleDetail";
import { confirmHandover } from "@/services/sale-handover.service";
import type {
  ChangeDeliveryBranchResponse,
  HandoverResult as HandoverResultData,
} from "@/types/saleHandover.types";

function parsePositiveInt(value: string | string[] | undefined): number | null {
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

export default function EntregaDetallePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const saleId = parsePositiveInt(router.query.saleId);
  // Opcional: sin `branchId` el detalle se arma contra la sucursal de entrega.
  const requestedBranchId = parsePositiveInt(router.query.branchId);
  const { hasPermission } = usePermissions();
  const showSuccess = useSnackbarStore((state) => state.showSuccess);
  const [changingBranch, setChangingBranch] = useState(false);

  const {
    data: detail,
    isLoading,
    isError,
    error,
    refetch,
  } = useHandoverSaleDetail(router.isReady ? saleId : null, requestedBranchId);

  const [captured, setCaptured] = useState<CapturedLines>({});
  const [receiverDirty, setReceiverDirty] = useState(false);
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

  const receiverKey = detail ? receiverStepKey(detail.receiver) : "";

  // La clave de idempotencia se renueva al cambiar cualquier dato de la entrega;
  // un reintento sin cambios reutiliza la misma.
  useEffect(() => {
    idempotencyKeyRef.current = null;
  }, [
    captured,
    receiverKey,
    identityAuthId,
    expiredAuthId,
    signatureFileId,
    ineFrontFileId,
    ineBackFileId,
  ]);

  const resetForm = () => {
    setCaptured({});
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

  if (saleId === null) {
    return (
      <Stack spacing={2}>
        <Title title="Entrega" />
        <Alert severity="error">
          Falta la venta. Vuelve a la cola de entregas.
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

  // Las escrituras van siempre a la sucursal de entrega.
  const branchId = detail.deliveryBranch.id;
  const processable = canProcess(detail, hasPermission(DELIVERY_HANDOVER_UPDATE));

  const canChangeBranch = canChangeDeliveryBranch(
    detail,
    hasPermission(DELIVERY_HANDOVER_UPDATE),
  );

  const handleBranchChanged = (changed: ChangeDeliveryBranchResponse) => {
    setChangingBranch(false);
    setCaptured({});
    setSubmitError(null);
    idempotencyKeyRef.current = null;
    showSuccess(`La entrega ahora es en ${changed.deliveryBranch.name}.`);
    void queryClient.invalidateQueries({ queryKey: ["sale-handover"] });
    // Un `branchId` fijado en la URL apuntaría a la sucursal anterior.
    if (requestedBranchId !== null) {
      void router.replace({ pathname: router.pathname, query: { saleId: String(detail.saleId) } });
    }
  };

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
    receiverDirty,
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
    if (receiverDirty) missing.push("guardar quién recibe");
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

  // Cambiar de receptor revoca la identidad validada: se descarta el respaldo
  // local y el enfriamiento del reenvío para que el nuevo OTP salga sin espera.
  const handleReceiverSaved = () => {
    setIdentityAuthId(null);
    useOtpCooldownStore.getState().clearTimer(identityOtpTimerId(detail.saleId));
    setSubmitError(null);
    void refetch();
  };

  return (
    <Stack spacing={3}>
      <Title title={`Entrega · ${detail.folio}`} />

      <SectionCard>
        <Stack spacing={0.75}>
          <Typography variant="subtitle1" fontWeight={700}>
            {detail.client.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Venta {detail.folio} · Entrega en {detail.deliveryBranch.name} · Responsable: {detail.branch.name}
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
          {canChangeBranch ? (
            <Button
              size="small"
              variant="outlined"
              sx={{ alignSelf: "flex-start" }}
              onClick={() => setChangingBranch(true)}
              disabled={submitting}
            >
              Cambiar ubicación
            </Button>
          ) : null}
        </Stack>
      </SectionCard>

      {changingBranch ? (
        <ChangeDeliveryBranchDialog
          detail={detail}
          onClose={() => setChangingBranch(false)}
          onChanged={handleBranchChanged}
        />
      ) : null}

      {!processable ? (
        <Alert severity="info">
          Solo lectura: la entrega la procesa {detail.deliveryBranch.name}.
        </Alert>
      ) : null}

      <HandoverSaleView
        readOnly={!processable}
        detail={detail}
        captured={captured}
        onCapturedChange={setCaptured}
        disabled={submitting}
      />

      {!detail.blockReason && processable ? (
        <>
          <ReceiverSection
            detail={detail}
            branchId={branchId}
            onDirtyChange={setReceiverDirty}
            onSaved={handleReceiverSaved}
            disabled={submitting}
          />

          <IdentityStep
            key={receiverKey}
            detail={detail}
            branchId={branchId}
            identityAuthorized={identityAuthId !== null}
            expiredHoldAuthorized={expiredAuthId !== null}
            onIdentityAuthorized={setIdentityAuthId}
            onExpiredHoldAuthorized={setExpiredAuthId}
            disabled={submitting}
          />

          <EvidenceStep
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
