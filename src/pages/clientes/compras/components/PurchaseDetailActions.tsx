import { useState } from "react";
import { IconButton, Menu, MenuItem, Stack } from "@mui/material";
import { MoreVertical } from "lucide-react";
import { StatusChip } from "@/components";
import type { StatusChipVariant } from "@/components/StatusChip";
import type { SaleCancelBlockReason } from "@/types/cancelPurchase.types";
import type { ClientPurchaseStatus } from "@/types/clientPurchase.types";
import { usePermissions } from "@/hooks/usePermissions";
import { CUSTOMERS_UPDATE } from "@/lib/permissions";
import { CancelPurchaseModal } from "./CancelPurchaseModal";

const STATUS_LABELS: Record<ClientPurchaseStatus, string> = {
  AL_CORRIENTE: "Al corriente",
  ENTREGA_PROGRAMADA: "Entrega programada",
  ENTREGA_PENDIENTE: "Entrega pendiente",
  CANCELADA: "Cancelada",
};

const STATUS_VARIANTS: Record<ClientPurchaseStatus, StatusChipVariant> = {
  AL_CORRIENTE: "success",
  ENTREGA_PROGRAMADA: "info",
  ENTREGA_PENDIENTE: "infoAlt",
  CANCELADA: "error",
};

export interface PurchaseDetailActionsProps {
  status: ClientPurchaseStatus;
  clientId: number;
  saleId: number;
  canCancel: boolean;
  cancelBlockReason: SaleCancelBlockReason | null;
  totalPaid: number;
  onSuccess?: () => void;
}

export function PurchaseDetailActions({
  status,
  clientId,
  saleId,
  canCancel,
  cancelBlockReason,
  totalPaid,
  onSuccess,
}: PurchaseDetailActionsProps) {
  const { hasPermission } = usePermissions();
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const alreadyCancelled = status === "CANCELADA";
  const canShowCancelMenu = hasPermission(CUSTOMERS_UPDATE);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
  };

  const handleOpenCancelModal = () => {
    handleCloseMenu();
    setCancelModalOpen(true);
  };

  const handleCloseCancelModal = () => {
    setCancelModalOpen(false);
  };

  return (
    <Stack direction="row" alignItems="center" spacing={1.5}>
      <StatusChip
        label={STATUS_LABELS[status]}
        variant={STATUS_VARIANTS[status]}
        size="small"
      />

      {canShowCancelMenu && (
        <>
          <IconButton
            aria-label="Opciones de la compra"
            onClick={handleOpenMenu}
            size="small"
          >
            <MoreVertical size={18} />
          </IconButton>
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={handleCloseMenu}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem
              disabled={alreadyCancelled}
              onClick={handleOpenCancelModal}
              sx={{ color: alreadyCancelled ? undefined : "error.main" }}
            >
              Cancelar cuenta
            </MenuItem>
          </Menu>

          <CancelPurchaseModal
            open={cancelModalOpen}
            clientId={clientId}
            saleId={saleId}
            totalPaid={totalPaid}
            blockReason={canCancel ? null : cancelBlockReason}
            onClose={handleCloseCancelModal}
            onSuccess={onSuccess}
          />
        </>
      )}
    </Stack>
  );
}

const PurchaseDetailActionsPage = () => null;

export default PurchaseDetailActionsPage;
