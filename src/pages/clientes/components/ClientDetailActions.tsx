import { useState } from "react";
import { IconButton, Menu, MenuItem, Stack } from "@mui/material";
import { MoreVertical } from "lucide-react";
import { StatusChip } from "@/components";
import type { StatusChipVariant } from "@/components/StatusChip";
import type { ClientStatus } from "@/types/clientes.types";

const STATUS_LABELS: Record<ClientStatus, string> = {
  active: "Activo",
  inactive: "Inactivo",
  blocked: "Bloqueado",
};

const STATUS_VARIANTS: Record<ClientStatus, StatusChipVariant> = {
  active: "success",
  inactive: "default",
  blocked: "error",
};

export interface ClientDetailActionsProps {
  status: ClientStatus | null;
  showDeactivateAction: boolean;
  deactivateDisabled: boolean;
  onDeactivateClick: () => void;
}

export function ClientDetailActions({
  status,
  showDeactivateAction,
  deactivateDisabled,
  onDeactivateClick,
}: ClientDetailActionsProps) {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const resolvedStatus = status ?? "active";
  const showMenu = showDeactivateAction;

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
  };

  const handleDeactivateClick = () => {
    handleCloseMenu();
    onDeactivateClick();
  };

  return (
    <Stack direction="row" alignItems="center" spacing={1.5}>
      <StatusChip
        label={STATUS_LABELS[resolvedStatus]}
        variant={STATUS_VARIANTS[resolvedStatus]}
        size="small"
      />

      {showMenu && (
        <>
          <IconButton
            aria-label="Opciones del cliente"
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
              disabled={deactivateDisabled}
              onClick={handleDeactivateClick}
              sx={{ color: deactivateDisabled ? undefined : "error.main" }}
            >
              Dar de baja
            </MenuItem>
          </Menu>
        </>
      )}
    </Stack>
  );
}

const ClientDetailActionsPage = () => null;

export default ClientDetailActionsPage;
