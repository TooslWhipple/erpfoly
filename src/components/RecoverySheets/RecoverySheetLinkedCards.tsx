import { Button, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Check, Clock, ExternalLink, Map, Sofa } from "lucide-react";
import { StatusChip } from "@/components";
import type { StatusChipVariant } from "@/components/StatusChip";
import { formatDateOnly } from "@/utils/date";
import { RECOVERY_SHEET_ROUTE_STATUS_LABELS } from "@/types/recovery-sheets.types";
import type {
  RecoverySheetScheduledRoute,
  RecoverySheetServiceOrderLink,
} from "@/types/recovery-sheets.types";
import {
  SERVICE_ORDER_STATUS_LABELS,
  SERVICE_ORDER_STATUS_VARIANTS,
} from "@/pages/atencion-cliente/components/ServiceOrderDetailModal/constants";
import {
  FactItem,
  LinkedCard,
  LinkedCardBodyMain,
  LinkedCardBodyRow,
  LinkedCardContent,
  LinkedCardHeaderRow,
  LinkedCardMetaRow,
  LinkedCardThumb,
  LinkedCardThumbMuted,
  MapRouteLine,
  MapThumbBackdrop,
  ServiceOrderCommentBox,
  ServiceOrderFactsGrid,
  SofaThumbBackdrop,
  textLinkButtonSx,
} from "./styles";

interface RecoverySheetRouteCardProps {
  route: RecoverySheetScheduledRoute;
  onOpen?: () => void;
}

const ROUTE_STATUS_VARIANTS: Record<
  RecoverySheetScheduledRoute["status"],
  StatusChipVariant
> = {
  pendiente: "default",
  finalizada: "success",
};

function routeStatusIcon(status: RecoverySheetScheduledRoute["status"]) {
  if (status === "finalizada") return <Check size={12} />;
  return <Clock size={12} />;
}

export function RecoverySheetRouteCard({
  route,
  onOpen,
}: RecoverySheetRouteCardProps) {
  const theme = useTheme();

  return (
    <LinkedCard>
      <LinkedCardHeaderRow>
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          Ruta programada
        </Typography>
        {onOpen ? (
          <Button
            variant="text"
            onClick={onOpen}
            endIcon={<ExternalLink size={14} />}
            sx={textLinkButtonSx}
          >
            Ver ruta
          </Button>
        ) : null}
      </LinkedCardHeaderRow>

      <LinkedCardBodyRow>
        <LinkedCardBodyMain>
          <LinkedCardThumb>
            <MapThumbBackdrop>
              <Map size={20} color={theme.palette.primary.main} />
              <MapRouteLine />
            </MapThumbBackdrop>
          </LinkedCardThumb>

          <LinkedCardContent>
            <LinkedCardMetaRow>
              <Typography variant="body2" fontWeight={600}>
                {route.id}
              </Typography>
              <StatusChip
                label={RECOVERY_SHEET_ROUTE_STATUS_LABELS[route.status]}
                variant={ROUTE_STATUS_VARIANTS[route.status]}
                size="small"
                startIcon={routeStatusIcon(route.status)}
              />
            </LinkedCardMetaRow>
            <Typography variant="body2" color="text.secondary">
              {route.branchName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Recuperación: {formatDateOnly(route.recoveryDate, "dateLong")}
            </Typography>
          </LinkedCardContent>
        </LinkedCardBodyMain>
      </LinkedCardBodyRow>
    </LinkedCard>
  );
}

interface RecoverySheetServiceOrderCardProps {
  serviceOrder: RecoverySheetServiceOrderLink;
  quantity: number;
  onOpen?: () => void;
}

function pieceLabel(quantity: number) {
  const qty = Number.isFinite(quantity) ? Math.max(0, quantity) : 0;
  return `${qty} ${qty === 1 ? "pieza" : "piezas"}`;
}

export function RecoverySheetServiceOrderCard({
  serviceOrder,
  quantity,
  onOpen,
}: RecoverySheetServiceOrderCardProps) {
  const theme = useTheme();
  const reason = serviceOrder.comment?.trim() || "—";
  const observations =
    serviceOrder.title?.trim() &&
    serviceOrder.title.trim().toLowerCase() !== reason.toLowerCase()
      ? serviceOrder.title.trim()
      : serviceOrder.comment?.trim() || "";

  return (
    <LinkedCard>
      <LinkedCardHeaderRow>
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          Orden de servicio
        </Typography>
        {onOpen ? (
          <Button
            variant="text"
            onClick={onOpen}
            endIcon={<ExternalLink size={14} />}
            sx={textLinkButtonSx}
          >
            Ver orden
          </Button>
        ) : null}
      </LinkedCardHeaderRow>

      <LinkedCardBodyRow>
        <LinkedCardBodyMain>
          <LinkedCardThumbMuted>
            <SofaThumbBackdrop>
              <Sofa
                size={30}
                color={theme.palette.text.secondary}
                strokeWidth={1.5}
              />
            </SofaThumbBackdrop>
          </LinkedCardThumbMuted>

          <LinkedCardContent>
            <LinkedCardMetaRow>
              <Typography variant="body2" fontWeight={600}>
                {serviceOrder.id}
              </Typography>
              <StatusChip
                label={SERVICE_ORDER_STATUS_LABELS[serviceOrder.status]}
                variant={SERVICE_ORDER_STATUS_VARIANTS[serviceOrder.status]}
                size="small"
                startIcon={<Clock size={12} />}
              />
            </LinkedCardMetaRow>

            <ServiceOrderFactsGrid>
              <FactItem>
                <Typography variant="body2" color="text.secondary">
                  Motivo
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {reason}
                </Typography>
              </FactItem>
              <FactItem>
                <Typography variant="body2" color="text.secondary">
                  Cantidad
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {pieceLabel(quantity)}
                </Typography>
              </FactItem>
              <FactItem>
                <Typography variant="body2" color="text.secondary">
                  Generada
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {formatDateOnly(serviceOrder.generatedAt, "dateLong")}
                </Typography>
              </FactItem>
            </ServiceOrderFactsGrid>
          </LinkedCardContent>
        </LinkedCardBodyMain>
      </LinkedCardBodyRow>

      {observations ? (
        <ServiceOrderCommentBox>
          <Typography variant="body2" color="text.secondary">
            {observations}
          </Typography>
        </ServiceOrderCommentBox>
      ) : null}
    </LinkedCard>
  );
}
