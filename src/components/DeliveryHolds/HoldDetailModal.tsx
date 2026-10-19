import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { ImageViewerModal } from "@/components/ImageViewerModal/ImageViewerModal";
import { StatusChip } from "@/components/StatusChip/StatusChip";
import { SideModal } from "@/components/SideModal/SideModal";
import { usePermissions } from "@/hooks/usePermissions";
import { unwrapOrThrow } from "@/lib/axios";
import { DELIVERY_HOLD_UPDATE } from "@/lib/permissions";
import {
  getHandoverEvidenceUrl,
  getHoldDetail,
} from "@/services/sale-handover.service";
import type {
  HandoverEvidenceSide,
  HoldDetail,
  HoldRow,
} from "@/types/saleHandover.types";
import { formatDateTimeShort } from "@/utils/date";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import {
  HOLD_STATUS_VARIANTS,
  HOLD_STATUS_LABELS,
  canExtendHold,
  canReleaseHold,
  formatHoldAmount,
  formatHoldDate,
  formatUnits,
  holdHistoryActionLabel,
} from "./holds";

export const HOLD_DETAIL_QUERY_KEY = ["sale-handover", "holds", "detail"] as const;

export interface HoldDetailModalProps {
  saleId: number | null;
  onClose: () => void;
  onExtend: (hold: HoldRow) => void;
  onRelease: (hold: HoldRow) => void;
}

export function HoldDetailModal({
  saleId,
  onClose,
  onExtend,
  onRelease,
}: HoldDetailModalProps) {
  const { hasPermission, user } = usePermissions();
  const role = user?.role;
  const canUpdate = hasPermission(DELIVERY_HOLD_UPDATE);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [...HOLD_DETAIL_QUERY_KEY, saleId],
    queryFn: async () => unwrapOrThrow(await getHoldDetail(saleId as number)),
    enabled: saleId !== null,
  });

  return (
    <SideModal
      open={saleId !== null}
      onClose={onClose}
      title={data ? `Resguardo ${data.folio}` : "Resguardo"}
      description={data ? data.clientName : undefined}
      maxWidth="sm"
    >
      {isLoading ? (
        <Stack alignItems="center" py={6}>
          <CircularProgress size={28} />
        </Stack>
      ) : null}
      {isError ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => void refetch()}>
              Reintentar
            </Button>
          }
        >
          {error instanceof Error ? error.message : "No se pudo cargar el resguardo."}
        </Alert>
      ) : null}
      {data ? (
        <HoldDetailBody
          detail={data}
          canExtend={canExtendHold(data.status, role, canUpdate)}
          canRelease={canReleaseHold(data.status, role, canUpdate)}
          onExtend={() => onExtend(data)}
          onRelease={() => onRelease(data)}
        />
      ) : null}
    </SideModal>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <Stack spacing={0.25}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600}>
        {value}
      </Typography>
    </Stack>
  );
}

function HoldDetailBody({
  detail,
  canExtend,
  canRelease,
  onExtend,
  onRelease,
}: {
  detail: HoldDetail;
  canExtend: boolean;
  canRelease: boolean;
  onExtend: () => void;
  onRelease: () => void;
}) {
  return (
    <Stack spacing={2.5}>
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
        <StatusChip
          size="small"
          variant={HOLD_STATUS_VARIANTS[detail.status]}
          label={HOLD_STATUS_LABELS[detail.status]}
        />
        {detail.extensionsCount > 0 ? (
          <Chip
            size="small"
            variant="outlined"
            label={
              detail.extensionsCount === 1
                ? "1 prórroga"
                : `${detail.extensionsCount} prórrogas`
            }
          />
        ) : null}
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr 1fr 1fr" },
          gap: 2,
        }}
      >
        <Field label="Sucursal" value={detail.branch.name} />
        <Field label="Teléfono" value={detail.clientPhoneMasked ?? "—"} />
        <Field label="Pendiente" value={formatUnits(detail.pendingUnits)} />
        <Field label="Importe pendiente" value={formatHoldAmount(detail.pendingAmount)} />
        <Field label="Listo desde" value={formatHoldDate(detail.readyAt)} />
        <Field label="Vence" value={formatHoldDate(detail.expiresAt)} />
        <Field label="Auditoría" value={formatHoldDate(detail.auditAt)} />
      </Box>

      {canExtend || canRelease ? (
        <Stack direction="row" spacing={1.5}>
          {canExtend ? (
            <Button variant="contained" onClick={onExtend}>
              Prorrogar
            </Button>
          ) : null}
          {canRelease ? (
            <Button variant="outlined" color="warning" onClick={onRelease}>
              Regularizar
            </Button>
          ) : null}
        </Stack>
      ) : null}

      <Divider />
      <HoldEvidenceSection handoverIds={detail.handoverIds} />
      <Divider />

      <Stack spacing={1.5}>
        <Typography variant="subtitle2" fontWeight={700}>
          Historial
        </Typography>
        {detail.history.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Sin movimientos registrados.
          </Typography>
        ) : (
          detail.history.map((entry, index) => (
            <Stack key={`${entry.at}-${entry.action}-${index}`} spacing={0.25}>
              <Typography variant="body2" fontWeight={600}>
                {holdHistoryActionLabel(entry.action)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDateTimeShort(entry.at)}
                {entry.user?.name ? ` · ${entry.user.name}` : ""}
              </Typography>
              {entry.reason ? (
                <Typography variant="body2">Motivo: {entry.reason}</Typography>
              ) : null}
            </Stack>
          ))
        )}
      </Stack>
    </Stack>
  );
}

type EvidenceViewer = { url: string; title: string };

const SIDE_LABELS: Record<HandoverEvidenceSide, string> = {
  INE_FRONT: "INE (frente)",
  INE_BACK: "INE (reverso)",
};

/**
 * INE de las entregas de la venta. Los ids vienen en el detalle del resguardo
 * (`handoverIds`), así que basta el permiso de resguardos que ya exige el
 * modal. La URL firmada se pide al abrir y no se guarda.
 */
function HoldEvidenceSection({ handoverIds }: { handoverIds: number[] }) {
  const showError = useSnackbarStore((state) => state.showError);
  const showInfo = useSnackbarStore((state) => state.showInfo);
  const [viewer, setViewer] = useState<EvidenceViewer | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [missing, setMissing] = useState<ReadonlySet<string>>(new Set());
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  if (handoverIds.length === 0) return null;

  const openEvidence = async (
    handoverId: number,
    index: number,
    side: HandoverEvidenceSide,
  ) => {
    const key = `${handoverId}-${side}`;
    setLoadingKey(key);
    const result = await getHandoverEvidenceUrl(handoverId, side);
    setLoadingKey(null);
    if (result.error || !result.data) {
      if (result.error?.status === 404) {
        setMissing((prev) => new Set(prev).add(key));
        showInfo("Esta entrega no tiene esa identificación registrada.");
      } else {
        showError(result.error?.message ?? "No se pudo obtener la identificación.");
      }
      return;
    }
    setViewer({
      url: result.data.url,
      title: `${SIDE_LABELS[side]} · entrega ${index + 1}`,
    });
    setViewerOpen(true);
  };

  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2" fontWeight={700}>
        Identificación de quien recibió
      </Typography>
      {handoverIds.map((handoverId, index) => (
        <Stack
          key={handoverId}
          direction="row"
          spacing={1}
          alignItems="center"
          flexWrap="wrap"
          useFlexGap
        >
          <Typography variant="body2" sx={{ flexGrow: 1 }}>
            Entrega {index + 1}
          </Typography>
          {(["INE_FRONT", "INE_BACK"] as const).map((side) => (
            <Button
              key={side}
              size="small"
              variant="outlined"
              disabled={loadingKey !== null || missing.has(`${handoverId}-${side}`)}
              onClick={() => void openEvidence(handoverId, index, side)}
            >
              {loadingKey === `${handoverId}-${side}` ? (
                <CircularProgress size={16} />
              ) : missing.has(`${handoverId}-${side}`) ? (
                `Sin ${side === "INE_FRONT" ? "INE frente" : "INE reverso"}`
              ) : (
                `Ver ${side === "INE_FRONT" ? "INE frente" : "INE reverso"}`
              )}
            </Button>
          ))}
        </Stack>
      ))}
      {viewer ? (
        <ImageViewerModal
          open={viewerOpen}
          onClose={() => setViewerOpen(false)}
          title={viewer.title}
          imageUrl={viewer.url}
          fileName="ine.jpg"
        />
      ) : null}
    </Stack>
  );
}
