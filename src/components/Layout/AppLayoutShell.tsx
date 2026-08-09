import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useMediaQuery, useTheme } from "@mui/material";
import { Sidebar } from "@/components/Sidebar";
import { AppNavProvider } from "./AppNavContext";
import {
  LayoutContainer,
  MainContent,
  ContentWrapper,
  MobileMenuButton,
  MobileMenuIcon,
} from "./styles";

interface AppLayoutShellProps {
  children: React.ReactNode;
}

/**
 * Sales flow pages that have an in-header close/back control — the hamburger
 * is rendered next to that control instead of floating above the page.
 */
function shouldEmbedMobileMenu(pathname: string): boolean {
  // Next.js `pathname` uses route patterns (`/ventas/[id]`), not resolved URLs.
  return (
    pathname === "/ventas/nueva" ||
    pathname === "/ventas/[id]" ||
    pathname === "/cotizaciones/[id]"
  );
}

/**
 * Persistent app chrome (sidebar + main area). Mounted once per authenticated session
 * so sidebar scroll and expand state survive client-side route changes.
 */
export function AppLayoutShell({ children }: AppLayoutShellProps) {
  const theme = useTheme();
  const router = useRouter();
  // Tablets (incl. ~1024 landscape) use a temporary drawer so POS screens
  // get full width; permanent sidebar only from `lg` (1200px) up.
  const isCompactNav = useMediaQuery(theme.breakpoints.down("lg"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const isSalesFlowChrome = shouldEmbedMobileMenu(router.pathname);
  // POS chrome (flush + inline menu) only when the sidebar is a drawer.
  // On desktop the permanent sidebar + flush bar looks cramped/odd.
  const embedMobileMenu = isCompactNav && isSalesFlowChrome;
  const flushPadding = isCompactNav && isSalesFlowChrome;

  const navValue = useMemo(
    () => ({
      isCompactNav,
      embedMobileMenu,
      openMobileNav: () => setMobileOpen(true),
      toggleMobileNav: () => setMobileOpen((prev) => !prev),
    }),
    [isCompactNav, embedMobileMenu],
  );

  return (
    <AppNavProvider value={navValue}>
      <LayoutContainer>
        <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
        <MainContent component="main">
          <ContentWrapper
            embedNavMenu={embedMobileMenu}
            flushPadding={flushPadding}
          >
            {isCompactNav && !embedMobileMenu && (
              <MobileMenuButton
                onClick={() => setMobileOpen((prev) => !prev)}
                aria-label="Abrir menú"
              >
                <MobileMenuIcon />
              </MobileMenuButton>
            )}
            {children}
          </ContentWrapper>
        </MainContent>
      </LayoutContainer>
    </AppNavProvider>
  );
}
