import { useState } from "react";
import { useMediaQuery, useTheme } from "@mui/material";
import { Sidebar } from "@/components/Sidebar";
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
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <LayoutContainer>
      <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <MainContent component="main">
        <ContentWrapper>
          {isMobile && (
            <MobileMenuButton onClick={() => setMobileOpen((prev) => !prev)}>
              <MobileMenuIcon />
            </MobileMenuButton>
          )}
          {children}
        </ContentWrapper>
      </MainContent>
    </LayoutContainer>
  );
}
