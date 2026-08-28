import { IconButton } from "@mui/material";
import { Menu } from "lucide-react";
import { useTheme } from "@mui/material/styles";
import { useAppNav } from "./AppNavContext";

/**
 * Hamburger control for POS flow headers — sits next to the close/back button
 * when the global floating menu is suppressed (`embedMobileMenu`).
 */
export function InlineMobileMenuButton() {
  const theme = useTheme();
  const { embedMobileMenu, toggleMobileNav } = useAppNav();

  if (!embedMobileMenu) return null;

  return (
    <IconButton
      size="medium"
      onClick={toggleMobileNav}
      aria-label="Abrir menú"
      sx={{
        width: 40,
        height: 40,
        border: `1px solid ${theme.palette.app.border}`,
        borderRadius: 1,
        bgcolor: "background.paper",
        flexShrink: 0,
      }}
    >
      <Menu size={20} color={theme.palette.text.primary} />
    </IconButton>
  );
}
