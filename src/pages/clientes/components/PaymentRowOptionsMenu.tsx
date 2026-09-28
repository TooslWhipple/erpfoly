import { useState, type MouseEvent } from "react";
import {
  CircularProgress,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";
import { MoreVertical, Printer } from "lucide-react";
import type { ClientMovementItem } from "@/services/client-movements.service";

export interface PaymentRowOptionsMenuProps {
  payment: ClientMovementItem;
  canPrintReceipt: boolean;
  isPrinting: boolean;
  onPrintReceipt: (payment: ClientMovementItem) => void;
}

export function PaymentRowOptionsMenu({
  payment,
  canPrintReceipt,
  isPrinting,
  onPrintReceipt,
}: PaymentRowOptionsMenuProps) {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuAnchor);

  const handleOpenMenu = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
  };

  const handlePrint = (event: MouseEvent) => {
    event.stopPropagation();
    handleCloseMenu();
    onPrintReceipt(payment);
  };

  if (!canPrintReceipt) {
    return null;
  }

  return (
    <>
      <IconButton
        aria-label="Opciones del abono"
        onClick={handleOpenMenu}
        size="small"
        disabled={isPrinting}
      >
        {isPrinting ? (
          <CircularProgress size={16} color="inherit" />
        ) : (
          <MoreVertical size={18} />
        )}
      </IconButton>
      <Menu
        anchorEl={menuAnchor}
        open={menuOpen}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        onClick={(event) => event.stopPropagation()}
      >
        <MenuItem onClick={handlePrint} disabled={isPrinting}>
          <ListItemIcon>
            {isPrinting ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <Printer size={16} />
            )}
          </ListItemIcon>
          <ListItemText>
            {isPrinting ? "Imprimiendo..." : "Imprimir comprobante"}
          </ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}

const PaymentRowOptionsMenuPage = () => null;

export default PaymentRowOptionsMenuPage;
