import { IconButton, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  Building2,
  Check,
  Clock,
  ExternalLink,
  Map,
  Sofa,
} from "lucide-react";
import { StatusChip } from "@/components";
import type { StatusChipVariant } from "@/components/StatusChip";
import { formatDateOnly } from "@/utils/date";
import {
  RECOVERY_SHEET_ITEM_CONDITION_LABELS,
  RECOVERY_SHEET_ROUTE_STATUS_LABELS,
} from "@/types/recovery-sheets.types";
import type {
  RecoverySheetScheduledRoute,
  RecoverySheetServiceOrderLink,
  RecoverySheetWarehouseEntry,
} from "@/types/recovery-sheets.types";
import {
  SERVICE_ORDER_STATUS_LABELS,
  SERVICE_ORDER_STATUS_VARIANTS,
} from "@/pages/atencion-cliente/components/ServiceOrderDetailModal/constants";
import {
  externalLinkIconButtonSx,
  LinkedCard,
  LinkedCardBodyMain,
  LinkedCardBodyRow,
  LinkedCardContent,
  LinkedCardDateColumn,
  LinkedCardMetaRow,
  LinkedCardThumb,
  LinkedCardThumbMuted,
  MapRouteLine,
  MapThumbBackdrop,
  ServiceOrderCommentBox,
  SofaThumbBackdrop,
  WarehouseIconBox,
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
      <Typography variant="body2" color="text.secondary" fontWeight={500}>
        Ruta programada
      </Typography>

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
              <Typography variant="body2" color="text.secondary">
                {route.id}
              </Typography>
              <StatusChip
                label={RECOVERY_SHEET_ROUTE_STATUS_LABELS[route.status]}
                variant={ROUTE_STATUS_VARIANTS[route.status]}
                size="small"
                startIcon={routeStatusIcon(route.status)}
              />
            </LinkedCardMetaRow>
            <Typography variant="body1" fontWeight={600}>
              {route.branchName}
            </Typography>
          </LinkedCardContent>
        </LinkedCardBodyMain>

        <LinkedCardDateColumn>
          <Typography variant="body2" color="text.secondary">
            Fecha de recuperación
          </Typography>
          <Typography variant="body2" fontWeight={600} color="text.primary">
            {formatDateOnly(route.recoveryDate, "dateLong")}
          </Typography>
        </LinkedCardDateColumn>

        {onOpen ? (
          <IconButton
            size="small"
            onClick={onOpen}
            aria-label="Ver ruta"
            sx={externalLinkIconButtonSx}
          >
            <ExternalLink size={16} />
          </IconButton>
        ) : null}
      </LinkedCardBodyRow>
    </LinkedCard>
  );
}

interface RecoverySheetServiceOrderCardProps {
  serviceOrder: RecoverySheetServiceOrderLink;
  onOpen?: () => void;
}

export function RecoverySheetServiceOrderCard({
  serviceOrder,
  onOpen,
}: RecoverySheetServiceOrderCardProps) {
  const theme = useTheme();

  return (
    <LinkedCard>
      <Typography variant="body2" color="text.secondary" fontWeight={500}>
        Orden de servicio
      </Typography>

      <LinkedCardBodyRow>
        <LinkedCardBodyMain>
          <LinkedCardThumbMuted>
            <SofaThumbBackdrop>
              <Sofa size={30} color={theme.palette.text.secondary} strokeWidth={1.5} />
            </SofaThumbBackdrop>
          </LinkedCardThumbMuted>

          <LinkedCardContent>
            <LinkedCardMetaRow>
              <Typography variant="body2" color="text.secondary">
                {serviceOrder.id}
              </Typography>
              <StatusChip
                label={SERVICE_ORDER_STATUS_LABELS[serviceOrder.status]}
                variant={SERVICE_ORDER_STATUS_VARIANTS[serviceOrder.status]}
                size="small"
                startIcon={<Clock size={12} />}
              />
            </LinkedCardMetaRow>
            <Typography variant="body1" fontWeight={600}>
              {serviceOrder.title}
            </Typography>
          </LinkedCardContent>
        </LinkedCardBodyMain>

        <LinkedCardDateColumn>
          <Typography variant="body2" color="text.secondary">
            Fecha de generación
          </Typography>
          <Typography variant="body2" fontWeight={600} color="text.primary">
            {formatDateOnly(serviceOrder.generatedAt, "dateLong")}
          </Typography>
        </LinkedCardDateColumn>

        {onOpen ? (
          <IconButton
            size="small"
            onClick={onOpen}
            aria-label="Ver orden de servicio"
            sx={externalLinkIconButtonSx}
          >
            <ExternalLink size={16} />
          </IconButton>
        ) : null}
      </LinkedCardBodyRow>

      {serviceOrder.comment ? (
        <ServiceOrderCommentBox>
          <Typography variant="body2" color="text.secondary">
            {serviceOrder.comment}
          </Typography>
        </ServiceOrderCommentBox>
      ) : null}
    </LinkedCard>
  );
}

interface RecoverySheetWarehouseCardProps {
  warehouse: RecoverySheetWarehouseEntry;
  onOpen?: () => void;
}

export function RecoverySheetWarehouseCard({
  warehouse,
  onOpen,
}: RecoverySheetWarehouseCardProps) {
  return (
    <LinkedCard>
      <Typography variant="body2" color="text.secondary" fontWeight={500}>
        Almacén
      </Typography>

      <LinkedCardBodyRow>
        <LinkedCardBodyMain>
          <LinkedCardThumbMuted>
            <WarehouseIconBox>
              <Building2 size={28} strokeWidth={1.5} />
            </WarehouseIconBox>
          </LinkedCardThumbMuted>

          <LinkedCardContent>
            <Typography variant="body1" fontWeight={600}>
              {warehouse.branchName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Estado del artículo:{" "}
              {RECOVERY_SHEET_ITEM_CONDITION_LABELS[warehouse.itemCondition]}
            </Typography>
          </LinkedCardContent>
        </LinkedCardBodyMain>

        <LinkedCardDateColumn>
          <Typography variant="body2" color="text.secondary">
            Fecha de entrada
          </Typography>
          <Typography variant="body2" fontWeight={600} color="text.primary">
            {formatDateOnly(warehouse.entryDate, "dateLong")}
          </Typography>
        </LinkedCardDateColumn>

        {onOpen ? (
          <IconButton
            size="small"
            onClick={onOpen}
            aria-label="Ver almacén"
            sx={externalLinkIconButtonSx}
          >
            <ExternalLink size={16} />
          </IconButton>
        ) : null}
      </LinkedCardBodyRow>
    </LinkedCard>
  );
}
