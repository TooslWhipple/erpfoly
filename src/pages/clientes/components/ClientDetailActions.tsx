import { useState } from "react";
import { IconButton, Menu, MenuItem } from "@mui/material";
import { MoreVertical } from "lucide-react";

export interface ClientDetailActionsProps {
  showDeactivateAction: boolean;
  deactivateDisabled: boolean;
  onDeactivateClick: () => void;
}

export function ClientDetailActions({
  showDeactivateAction,
  deactivateDisabled,
  onDeactivateClick,
}: ClientDetailActionsProps) {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  if (!showDeactivateAction) {
    return null;
  }

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
  );
}

const ClientDetailActionsPage = () => null;

export default ClientDetailActionsPage;
