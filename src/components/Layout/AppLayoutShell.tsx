import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useMediaQuery, useTheme } from "@mui/material";
import { Sidebar } from "@/components/Sidebar";
import {
  NAV_COMPACT_BREAKPOINT,
  SALES_POS_BREAKPOINT,
} from "@/lib/layoutBreakpoints";
import { isSalesFlowRoute } from "@/lib/salesFlowRoutes";
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
 * Persistent app chrome (sidebar + main area). Mounted once per authenticated session
 * so sidebar scroll and expand state survive client-side route changes.
 */
export function AppLayoutShell({ children }: AppLayoutShellProps) {
  const theme = useTheme();
  const router = useRouter();
  const isBelowNavBreakpoint = useMediaQuery(
    theme.breakpoints.down(NAV_COMPACT_BREAKPOINT),
  );
  const isBelowSalesPosBreakpoint = useMediaQuery(
    theme.breakpoints.down(SALES_POS_BREAKPOINT),
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  const isSalesFlowChrome = isSalesFlowRoute(router.pathname);
  const isDrawerNav = isSalesFlowChrome
    ? isBelowSalesPosBreakpoint
    : isBelowNavBreakpoint;
  const isSalesPosLayout = isSalesFlowChrome && isBelowSalesPosBreakpoint;
  const embedMobileMenu = isDrawerNav && isSalesFlowChrome;
  const flushPadding = isSalesPosLayout;

  const navValue = useMemo(
    () => ({
      isDrawerNav,
      isSalesPosLayout,
      embedMobileMenu,
      openMobileNav: () => setMobileOpen(true),
      toggleMobileNav: () => setMobileOpen((prev) => !prev),
    }),
    [isDrawerNav, isSalesPosLayout, embedMobileMenu],
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
            {isDrawerNav && !embedMobileMenu && (
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
