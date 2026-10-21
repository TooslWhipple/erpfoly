import { useState } from "react";
import { IconButton, Menu, MenuItem } from "@mui/material";
import { MoreVertical } from "lucide-react";

export interface ClientDetailActionsProps {
  showDeactivateAction: boolean;
  deactivateDisabled: boolean;
  onDeactivateClick: () => void;
  onGenerateStatement?: () => void;
}

export function ClientDetailActions({
  showDeactivateAction,
  deactivateDisabled,
  onDeactivateClick,
  onGenerateStatement,
}: ClientDetailActionsProps) {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const hasAnyAction = showDeactivateAction || Boolean(onGenerateStatement);
  if (!hasAnyAction) {
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

  const handleGenerateStatement = () => {
    handleCloseMenu();
    onGenerateStatement?.();
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
        {onGenerateStatement ? (
          <MenuItem onClick={handleGenerateStatement}>
            Generar Estado de Cuenta
          </MenuItem>
        ) : null}
        {showDeactivateAction ? (
          <MenuItem
            disabled={deactivateDisabled}
            onClick={handleDeactivateClick}
            sx={{ color: deactivateDisabled ? undefined : "error.main" }}
          >
            Dar de baja
          </MenuItem>
        ) : null}
      </Menu>
    </>
  );
}

const ClientDetailActionsPage = () => null;

export default ClientDetailActionsPage;
