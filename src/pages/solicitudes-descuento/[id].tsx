import { useState, useCallback } from "react";
import { useRouter } from "next/router";
import {
  Button,
  CircularProgress,
  IconButton,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import numeral from "numeral";
import { Ban, CheckCircle2, Clock9, X, XCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DiscountRequestItemCard,
  StatusChip,
  ApproveDiscountRequestModal,
  RejectDiscountRequestModal,
} from "@/components";
import { InlineMobileMenuButton } from "@/components/Layout";
import type { ApproveDiscountRequestResult } from "@/components";
import type {
  ApproveDiscountRequestPayload,
  DiscountRequestDetail,
  SaleTypeForm,
} from "@/types/discount-requests.types";
import {
  DiscountCard,
  SectionCard,
  SectionGrayCard,
  ItemsList,
  MapPlaceholder,
  TotalCard,
} from "@/styles/solicitudes-descuento/nuevo.styles";
import {
  DetailGrid,
  DetailHeader,
  DetailPageShell,
} from "@/styles/ventas/detalle.styles";
import {
  approveDiscountRequest,
  getDiscountRequestDetail,
  rejectDiscountRequest,
} from "@/services/discount-requests.service";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { usePermissions } from "@/hooks/usePermissions";
import { DISCOUNT_REQUESTS_UPDATE } from "@/lib/permissions";
const DELIVERY_LABELS: Record<string, string> = {
  a_domicilio: "A domicilio",
  recoger_sucursal: "Recoger en sucursal",
};
const SALE_TYPE_LABELS: Record<SaleTypeForm, string> = {
  credito: "Crédito",
  contado: "Contado",
  apartado: "Apartado",
};
function formatCurrency(value: number): string {
  return numeral(value).format("$0,0.00");
}
function getStatusBadge(detail: DiscountRequestDetail) {
  if (detail.status === "approved") {
    return (
      <StatusChip
        label="Aprobada"
        variant="success"
        size="small"
        startIcon={<CheckCircle2 size={12} />}
      />
    );
  }
  if (detail.status === "rejected") {
    return (
      <StatusChip
        label="Rechazada"
        variant="error"
        size="small"
        startIcon={<XCircle size={12} />}
      />
    );
  }
  if (detail.status === "invalidated") {
    return (
      <StatusChip
        label="Invalidada"
        variant="disabled"
        size="small"
        startIcon={<Ban size={12} />}
      />
    );
  }
  return (
    <StatusChip
      label="Pendiente de autorización"
      variant="pending"
      size="small"
      startIcon={<Clock9 size={12} />}
    />
  );
}
export default function DiscountRequestDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const requestId = typeof id === "string" ? parseInt(id, 10) : null;
  const queryClient = useQueryClient();
  const showSuccess = useSnackbarStore((s) => s.showSuccess);
  const showError = useSnackbarStore((s) => s.showError);
  const { hasPermission } = usePermissions();
  const canResolve = hasPermission(DISCOUNT_REQUESTS_UPDATE);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const {
    data: detail,
    isLoading,
    isError,
  } = useQuery<DiscountRequestDetail | null>({
    queryKey: ["discount-request", requestId],
    enabled: requestId !== null && !Number.isNaN(requestId),
    queryFn: async () => {
      if (requestId === null) return null;
      const result = await getDiscountRequestDetail(requestId);
      if (result.error) throw new Error(result.error.message);
      return result.data ?? null;
    },
  });
  const approveMutation = useMutation({
    mutationFn: async (payload: ApproveDiscountRequestPayload) => {
      if (!requestId) throw new Error("Solicitud no encontrada");
      const result = await approveDiscountRequest(requestId, payload);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      showSuccess("Solicitud de descuento aprobada.");
      setApproveModalOpen(false);
      void queryClient.invalidateQueries({
        queryKey: ["discount-requests"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["discount-request", requestId],
      });
      void router.push("/solicitudes-descuento");
    },
    onError: (err: Error) => showError(err.message),
  });
  const rejectMutation = useMutation({
    mutationFn: async (rejectionReason: string) => {
      if (!requestId) throw new Error("Solicitud no encontrada");
      const result = await rejectDiscountRequest(requestId, {
        rejectionReason,
      });
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      showSuccess("Solicitud de descuento rechazada.");
      setRejectModalOpen(false);
      void queryClient.invalidateQueries({
        queryKey: ["discount-requests"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["discount-request", requestId],
      });
      void router.push("/solicitudes-descuento");
    },
    onError: (err: Error) => showError(err.message),
  });
  const handleRejectDiscountRequest = useCallback(
    (rejectionReason: string) => {
      rejectMutation.mutate(rejectionReason);
    },
    [rejectMutation],
  );
  const handleApproveDiscountRequest = useCallback(
    (result: ApproveDiscountRequestResult) => {
      approveMutation.mutate(
        result.mode === "amount"
          ? { approvedDiscountAmount: result.value }
          : { approvedDiscountPct: result.value }
      );
    },
    [approveMutation],
  );
  if (isLoading) {
    return (
      <DetailPageShell>
        <DetailHeader>
          <InlineMobileMenuButton />
          <CircularProgress size={24} />
        </DetailHeader>
        <DetailGrid>
          <Skeleton variant="rounded" height={200} />
          <Skeleton variant="rounded" height={300} />
        </DetailGrid>
      </DetailPageShell>
    );
  }
  if (isError || !detail) {
    return (
      <DetailPageShell>
        <DetailHeader>
          <InlineMobileMenuButton />
          <Typography variant="h6" fontWeight={700}>
            Solicitud de descuento
          </Typography>
        </DetailHeader>
        <DetailGrid>
          <Stack spacing={2} alignItems="flex-start">
            <Typography variant="body1" color="text.secondary">
              No se encontró la solicitud de descuento.
            </Typography>
            <Button
              variant="contained"
              onClick={() => router.push("/solicitudes-descuento")}
            >
              Volver al listado
            </Button>
          </Stack>
        </DetailGrid>
      </DetailPageShell>
    );
  }
  const isPending = detail.status === "pending";
  return (
    <DetailPageShell>
      <RejectDiscountRequestModal
        open={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        onReject={handleRejectDiscountRequest}
      />
      <ApproveDiscountRequestModal
        open={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        saleTotal={detail.totalBeforeSpecialDiscount}
        suggestedDiscountPercent={detail.requestedDiscountPct ?? 5}
        onApprove={handleApproveDiscountRequest}
      />
      <DetailHeader sx={{ flexWrap: { xs: "wrap", sm: "nowrap" } }}>
        <InlineMobileMenuButton />
        <IconButton
          size="small"
          onClick={() => router.push("/solicitudes-descuento")}
          aria-label="Volver a solicitudes de descuento"
        >
          <X size={18} />
        </IconButton>
        <Typography variant="h6" fontWeight={700} noWrap sx={{ minWidth: 0, flex: "1 1 auto" }}>
          Cotización {detail.saleFolio}
        </Typography>
        {!isPending && getStatusBadge(detail)}
        {isPending && canResolve && (
          <Stack
            direction="row"
            spacing={1}
            sx={{
              ml: { sm: "auto" },
              width: { xs: "100%", sm: "auto" },
              flex: { xs: "1 0 100%", sm: "0 0 auto" },
            }}
          >
            <Button
              variant="contained"
              color="error"
              disabled={rejectMutation.isPending || approveMutation.isPending}
              onClick={() => setRejectModalOpen(true)}
              sx={{ flex: { xs: 1, sm: "0 0 auto" }, minWidth: 0 }}
            >
              Rechazar
            </Button>
            <Button
              variant="contained"
              color="primary"
              disabled={rejectMutation.isPending || approveMutation.isPending}
              onClick={() => setApproveModalOpen(true)}
              sx={{ flex: { xs: 1, sm: "0 0 auto" }, minWidth: 0 }}
            >
              Aprobar
            </Button>
          </Stack>
        )}
      </DetailHeader>

      <DetailGrid>
        <Stack spacing={2} minWidth={0}>
          {isPending && (
            <DiscountCard>
              <Stack flex={1} minWidth={0}>
                <Typography variant="subtitle1">
                  Descuento solicitado
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Motivo: {detail.reasonLabel}
                </Typography>
                {detail.reason === "OTHER" && detail.notes && (
                  <Typography variant="body2" color="text.secondary">
                    Nota: {detail.notes}
                  </Typography>
                )}
              </Stack>
              {getStatusBadge(detail)}
            </DiscountCard>
          )}

          <SectionCard>
            <Stack>
              <Typography variant="h6">Artículos</Typography>
              <Typography variant="body2" color="text.secondary">
                Detalle de los artículos incluidos en esta solicitud.
              </Typography>
            </Stack>

            {detail.lineItems.length === 0 ? (
              [1, 2].map((item) => (
                <Skeleton key={item} width="100%" height="144px" />
              ))
            ) : (
              <ItemsList>
                {detail.lineItems.map((item) => (
                  <DiscountRequestItemCard key={item.id} item={item} />
                ))}
              </ItemsList>
            )}

            <Stack spacing={3}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                gap={1}
              >
                <Typography variant="body1">Subtotal</Typography>
                <Typography variant="subtitle1" fontWeight={600}>
                  {formatCurrency(detail.subtotal)}
                </Typography>
              </Stack>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                gap={1}
              >
                <Typography variant="body1">Envío</Typography>
                <Typography variant="subtitle1" fontWeight={600}>
                  {formatCurrency(detail.shipping)}
                </Typography>
              </Stack>
              <TotalCard>
                <Typography variant="body1" fontWeight={600}>
                  Total
                </Typography>
                <Typography variant="h5" fontWeight={600} noWrap>
                  {formatCurrency(detail.totalBeforeSpecialDiscount)}
                </Typography>
              </TotalCard>

              {detail.status === "approved" &&
                (detail.approvedDiscountPct != null ||
                  detail.approvedDiscountAmount != null) && (
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    gap={1}
                    flexWrap="wrap"
                  >
                    <Stack direction="row" spacing={1} alignItems="center" minWidth={0}>
                      <Typography variant="body1">
                        {detail.approvedDiscountAmount != null
                          ? `Descuento (${formatCurrency(detail.approvedDiscountAmount)})`
                          : `Descuento (${detail.approvedDiscountPct}%)`}
                      </Typography>
                      <StatusChip
                        label="Aprobada"
                        variant="success"
                        size="small"
                      />
                    </Stack>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {formatCurrency(detail.totalAfterSpecialDiscount)}
                    </Typography>
                  </Stack>
                )}

              {detail.status === "rejected" && detail.rejectionReason && (
                <Stack spacing={0.5}>
                  <Typography variant="body2" color="text.secondary">
                    Motivo de rechazo
                  </Typography>
                  <Typography variant="body1">
                    {detail.rejectionReason}
                  </Typography>
                </Stack>
              )}

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                gap={1}
              >
                <Typography variant="body1">
                  Enganche solicitado (
                  {Math.round(detail.downPaymentPct * 100)}%)
                </Typography>
                <Typography variant="subtitle1" fontWeight={600}>
                  {formatCurrency(detail.downPaymentAmount)}
                </Typography>
              </Stack>
            </Stack>
          </SectionCard>
        </Stack>

        <Stack spacing={2} minWidth={0}>
          <SectionGrayCard>
            <Typography variant="subtitle2" fontWeight={700}>
              Tipo de venta
            </Typography>
            <Typography variant="body2">
              {SALE_TYPE_LABELS[detail.saleType] ?? detail.saleType}
            </Typography>
          </SectionGrayCard>

          <SectionGrayCard>
            <Typography variant="subtitle2" fontWeight={700}>
              Cliente
            </Typography>
            {detail.client ? (
              <Stack spacing={0.5}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  gap={1}
                  minWidth={0}
                >
                  <Typography variant="body1" fontWeight={500} noWrap>
                    {detail.client.fullName}
                  </Typography>
                  <StatusChip
                    label="Activo"
                    variant="success"
                    size="small"
                  />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {detail.client.phone}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: "anywhere" }}>
                  {detail.client.email}
                </Typography>
                {!detail.client.hasActiveCredit && (
                  <Typography variant="body2" color="text.secondary">
                    Este cliente no cuenta con crédito activo.
                  </Typography>
                )}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Sin cliente asignado
              </Typography>
            )}
          </SectionGrayCard>

          <SectionGrayCard>
            <Typography variant="subtitle2" fontWeight={700}>
              Entrega
            </Typography>
            <Typography variant="body2">
              {DELIVERY_LABELS[detail.delivery?.type ?? "a_domicilio"]}
            </Typography>
            <MapPlaceholder />
            {detail.delivery?.address && (
              <Stack spacing={0.5}>
                <Typography variant="caption" fontWeight={500}>
                  Dirección de entrega
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {detail.delivery.address}
                </Typography>
                {detail.delivery.receiverEmail && (
                  <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: "anywhere" }}>
                    {detail.delivery.receiverEmail}
                  </Typography>
                )}
              </Stack>
            )}
            {detail.delivery?.receiverPhone && (
              <Stack spacing={0.5}>
                <Typography variant="caption" fontWeight={500}>
                  Teléfono de quien recibe
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {detail.delivery.receiverPhone}
                </Typography>
              </Stack>
            )}
          </SectionGrayCard>
        </Stack>
      </DetailGrid>
    </DetailPageShell>
  );
}
