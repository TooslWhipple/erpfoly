import { useState } from "react";
import { Button, IconButton, Menu, MenuItem, Stack } from "@mui/material";
import { MoreVertical } from "lucide-react";
import { StatusChip } from "@/components";
import type { StatusChipVariant } from "@/components/StatusChip";
import type { ClientPurchaseStatus } from "@/types/clientPurchase.types";
import { CancelPurchaseModal } from "./CancelPurchaseModal";
import { DeliverPurchaseModal } from "./DeliverPurchaseModal";

const STATUS_LABELS: Record<ClientPurchaseStatus, string> = {
  AL_CORRIENTE: "Al corriente",
  ENTREGA_PROGRAMADA: "Entrega programada",
  ENTREGA_PENDIENTE: "Entrega pendiente",
};

const STATUS_VARIANTS: Record<ClientPurchaseStatus, StatusChipVariant> = {
  AL_CORRIENTE: "success",
  ENTREGA_PROGRAMADA: "info",
  ENTREGA_PENDIENTE: "infoAlt",
};

export interface PurchaseDetailActionsProps {
  status: ClientPurchaseStatus;
  purchaseId: string;
  productName: string;
  productSku: string;
  productImageUrl?: string | null;
}

export function PurchaseDetailActions({
  status,
  purchaseId,
  productName,
  productSku,
  productImageUrl,
}: PurchaseDetailActionsProps) {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [deliverModalOpen, setDeliverModalOpen] = useState(false);
  const isDeliveryPending = status === "ENTREGA_PENDIENTE";

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

  const handleOpenDeliverModal = () => {
    setDeliverModalOpen(true);
  };

  const handleCloseDeliverModal = () => {
    setDeliverModalOpen(false);
  };

  return (
    <Stack direction="row" alignItems="center" spacing={1.5}>
      <StatusChip
        label={STATUS_LABELS[status]}
        variant={STATUS_VARIANTS[status]}
        size="small"
      />

      {isDeliveryPending ? (
        <>
          <Button variant="contained" color="primary" onClick={handleOpenDeliverModal}>
            Entregar
          </Button>
          <DeliverPurchaseModal
            open={deliverModalOpen}
            purchaseId={purchaseId}
            productName={productName}
            productSku={productSku}
            productImageUrl={productImageUrl}
            onClose={handleCloseDeliverModal}
          />
        </>
      ) : (
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
            <MenuItem onClick={handleOpenCancelModal}>Cancelar venta</MenuItem>
          </Menu>

          <CancelPurchaseModal
            open={cancelModalOpen}
            purchaseId={purchaseId}
            onClose={handleCloseCancelModal}
          />
        </>
      )}
    </Stack>
  );
}

const PurchaseDetailActionsPage = () => null;

export default PurchaseDetailActionsPage;
