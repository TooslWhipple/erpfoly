import { useState, useCallback, Fragment } from "react";
import { useRouter } from "next/router";
import {
  Button,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import numeral from "numeral";
import { CheckCircle2, Clock9, XCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MainLayout,
  Breadcrumbs,
  DiscountRequestItemCard,
  StatusChip,
  ApproveDiscountRequestModal,
  RejectDiscountRequestModal,
} from "@/components";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import type { DiscountRequestDetail } from "@/types/discount-requests.types";
import {
  DiscountCard,
  SectionCard,
  SectionGrayCard,
  ItemsList,
  MapPlaceholder,
  TotalCard,
} from "@/styles/solicitudes-descuento/nuevo.styles";
import { theme } from "@/styles/theme";
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

  const { data: detail, isLoading, isError } = useQuery<DiscountRequestDetail | null>({
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
    mutationFn: async (approvedDiscountPct: number) => {
      if (!requestId) throw new Error("Solicitud no encontrada");
      const result = await approveDiscountRequest(requestId, { approvedDiscountPct });
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      showSuccess("Solicitud de descuento aprobada.");
      setApproveModalOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["discount-requests"] });
      void queryClient.invalidateQueries({ queryKey: ["discount-request", requestId] });
      void router.push("/solicitudes-descuento");
    },
    onError: (err: Error) => showError(err.message),
  });

  const rejectMutation = useMutation({
    mutationFn: async (rejectionReason: string) => {
      if (!requestId) throw new Error("Solicitud no encontrada");
      const result = await rejectDiscountRequest(requestId, { rejectionReason });
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      showSuccess("Solicitud de descuento rechazada.");
      setRejectModalOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["discount-requests"] });
      void queryClient.invalidateQueries({ queryKey: ["discount-request", requestId] });
      void router.push("/solicitudes-descuento");
    },
    onError: (err: Error) => showError(err.message),
  });

  const handleRejectDiscountRequest = useCallback(
    (rejectionReason: string) => {
      rejectMutation.mutate(rejectionReason);
    },
    [rejectMutation]
  );

  const handleApproveDiscountRequest = useCallback(
    (approvedDiscountPercent: number) => {
      approveMutation.mutate(approvedDiscountPercent);
    },
    [approveMutation]
  );

  if (isLoading) {
    return (
      <MainLayout>
        <Stack spacing={2} alignItems="center" justifyContent="center" minHeight={320}>
          <CircularProgress />
        </Stack>
      </MainLayout>
    );
  }

  if (isError || !detail) {
    return (
      <MainLayout>
        <Stack spacing={2} alignItems="center" justifyContent="center" minHeight={320}>
          <Typography variant="body1" color="text.secondary">
            No se encontró la solicitud de descuento.
          </Typography>
          <Button variant="contained" onClick={() => router.push("/solicitudes-descuento")}>
            Volver al listado
          </Button>
        </Stack>
      </MainLayout>
    );
  }

  const isPending = detail.status === "pending";
  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Solicitudes de descuentos", href: "/solicitudes-descuento" },
    { label: `Cotización ${detail.saleFolio}` },
  ];

  return (
    <MainLayout>
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
      <Stack spacing={2}>
        <Stack
          spacing={2}
          direction={{ xs: "column", md: "row" }}
          alignItems={{ xs: "flex-start", md: "center" }}
          justifyContent="space-between"
        >
          <Breadcrumbs
            items={breadcrumbs}
            showBackButton
            onBack={() => router.push("/solicitudes-descuento")}
          />

          <Stack direction="row" spacing={2} alignItems="center">
            {!isPending && getStatusBadge(detail)}
            {isPending && canResolve && (
              <Fragment>
                <Button
                  variant="contained"
                  color="error"
                  style={{ width: 112 }}
                  disabled={rejectMutation.isPending || approveMutation.isPending}
                  onClick={() => setRejectModalOpen(true)}
                >
                  Rechazar
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  style={{ width: 112 }}
                  disabled={rejectMutation.isPending || approveMutation.isPending}
                  onClick={() => setApproveModalOpen(true)}
                >
                  Aprobar
                </Button>
              </Fragment>
            )}
          </Stack>
        </Stack>

        <Typography variant="h4" fontWeight={600}>
          Cotización {detail.saleFolio}
        </Typography>
        <Divider />

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Stack spacing={2}>
              {isPending && (
                <DiscountCard>
                  <Stack flex={1}>
                    <Typography variant="subtitle1">Descuento solicitado</Typography>
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
                  <Stack direction="row" justifyContent="space-between" alignContent="center">
                    <Typography variant="body1">Subtotal</Typography>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {formatCurrency(detail.subtotal)}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" alignContent="center">
                    <Typography variant="body1">Envío</Typography>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {formatCurrency(detail.shipping)}
                    </Typography>
                  </Stack>
                  <TotalCard>
                    <Typography variant="body1" fontWeight={600}>
                      Total
                    </Typography>
                    <Typography variant="h5" fontWeight={600}>
                      {formatCurrency(detail.totalBeforeSpecialDiscount)}
                    </Typography>
                  </TotalCard>

                  {detail.status === "approved" && detail.approvedDiscountPct != null && (
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body1">
                          Descuento ({detail.approvedDiscountPct}%)
                        </Typography>
                        <StatusChip label="Aprobada" variant="success" size="small" />
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
                      <Typography variant="body1">{detail.rejectionReason}</Typography>
                    </Stack>
                  )}

                  <Stack direction="row" justifyContent="space-between" alignContent="center">
                    <Typography variant="body1">
                      Enganche solicitado ({Math.round(detail.downPaymentPct * 100)}%)
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {formatCurrency(detail.downPaymentAmount)}
                    </Typography>
                  </Stack>
                </Stack>
              </SectionCard>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={2}>
              <SectionGrayCard>
                <Typography variant="h6">Tipo de venta</Typography>
                <ToggleButtonGroup
                  value={detail.saleType}
                  exclusive
                  fullWidth
                  size="small"
                  sx={{
                    pointerEvents: "none",
                    "& .MuiToggleButtonGroup-grouped": {
                      border: `1px solid ${theme.palette.app.border}`,
                      "&.Mui-selected": {
                        backgroundColor: theme.palette.app.sidebar.itemSelected,
                        color: theme.palette.app.sidebar.textSelected,
                      },
                    },
                  }}
                >
                  <ToggleButton value="credito">Crédito</ToggleButton>
                  <ToggleButton value="contado">Contado</ToggleButton>
                  <ToggleButton value="apartado">Apartado</ToggleButton>
                </ToggleButtonGroup>
              </SectionGrayCard>

              <SectionGrayCard>
                <Typography variant="h6">Cliente</Typography>
                {detail.client ? (
                  <Stack spacing={0.5}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="nowrap">
                      <Typography variant="body1" fontWeight={500}>
                        {detail.client.fullName}
                      </Typography>
                      <StatusChip label="Activo" variant="success" size="small" />
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {detail.client.phone}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
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
                <Typography variant="h6">Entrega</Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={detail.delivery?.type ?? "a_domicilio"}
                    readOnly
                    sx={{ backgroundColor: "transparent", pointerEvents: "none" }}
                  >
                    <MenuItem value={detail.delivery?.type ?? "a_domicilio"}>
                      {DELIVERY_LABELS[detail.delivery?.type ?? "a_domicilio"]}
                    </MenuItem>
                  </Select>
                </FormControl>
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
                      <Typography variant="body2" color="text.secondary">
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
          </Grid>
        </Grid>
      </Stack>
    </MainLayout>
  );
}
