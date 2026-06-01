import { useState } from "react";
import { useMediaQuery, useTheme } from "@mui/material";
import { Sidebar } from "@/components/Sidebar";
import NotificationInbox from "@/components/NotificationInbox/NotificationInbox";
import {
  LayoutContainer,
  MainContent,
  ContentWrapper,
  TopBar,
  MobileMenuButton,
  MobileMenuIcon,
} from "./styles";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleToggleMobile = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleCloseMobile = () => {
    setMobileOpen(false);
  };

  return (
    <LayoutContainer>
      <Sidebar open={mobileOpen} onClose={handleCloseMobile} />
      <MainContent component="main">
        <TopBar>
          {isMobile && (
            <MobileMenuButton onClick={handleToggleMobile}>
              <MobileMenuIcon />
            </MobileMenuButton>
          )}
          <NotificationInbox />
        </TopBar>
        <ContentWrapper>
          {children}
        </ContentWrapper>
      </MainContent>
    </LayoutContainer>
  );
}
