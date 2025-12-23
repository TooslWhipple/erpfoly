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
        <ContentWrapper>
          {isMobile && (
            <MobileMenuButton onClick={handleToggleMobile}>
              <MobileMenuIcon />
            </MobileMenuButton>
          )}
          {children}
        </ContentWrapper>
      </MainContent>
    </LayoutContainer>
  );
}
