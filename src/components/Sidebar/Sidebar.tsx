import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { Button, Stack, Typography, useTheme } from "@mui/material";
import { Logout as LogoutIcon } from "@mui/icons-material";
import { Plus } from "@/components/Icons";
import { useAppNav } from "@/components/Layout";
import {
  StyledDrawer,
  SidebarHeader,
  NavigationContainer,
  UserProfileContainer,
  UserAvatar,
  UserInfoContainer,
  UserRole,
} from "./styles";
import { CreditApplicationIntakeModal } from "@/components/CreditApplicationIntakeModal";
import {
  CREDIT_APPLICATIONS_CREATE,
} from "@/lib/permissions";
import { hasAccessRequirement } from "@/lib/routeAccess";
import { authService } from "@/services/auth.service";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { useAuthStore } from "@/store/useAuthStore";
import NotificationInbox from "@/components/NotificationInbox/NotificationInbox";
import { createCreditApplicationFromIntake } from "@/services/creditApplications.service";
import type { CreditApplicationBiometricsData } from "@/types/credit-application-form.types";
import { NAV_ITEMS } from "./sidebarNav.config";
import { SidebarNavList } from "./SidebarNavList";
import { filterNavItemsByAccess, getInitialOpenMenus, getInitials } from "./sidebar.utils";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const router = useRouter();
  const theme = useTheme();
  const { isDrawerNav } = useAppNav();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.logout);
  const showError = useSnackbarStore((state) => state.showError);
  const visibleNavItems = useMemo(() => filterNavItemsByAccess(NAV_ITEMS, user), [user]);
  const canCreateCreditApplication = hasAccessRequirement(user, { permission: CREDIT_APPLICATIONS_CREATE });
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(() =>
    getInitialOpenMenus(router.pathname, visibleNavItems)
  );
  const [intakeModalOpen, setIntakeModalOpen] = useState(false);

  useEffect(() => {
    const newOpenMenus = getInitialOpenMenus(router.pathname, visibleNavItems);
    // Keep menu expansion aligned with the current route and the user's permissions.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpenMenus((prev) => {
      const hasNewMenus = Object.keys(newOpenMenus).some((key) => !prev[key]);
      if (!hasNewMenus) {
        return prev;
      }
      return { ...prev, ...newOpenMenus };
    });
  }, [router.pathname, visibleNavItems]);

  const handleNavigation = (path: string) => {
    router.push(path);
    if (isDrawerNav) {
      onClose();
    }
  };

  const handleToggleMenu = (label: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const handleOpenNewCreditApplicationIntake = () => {
    if (isDrawerNav) {
      onClose();
    }
    setIntakeModalOpen(true);
  };

  const handleIntakeFinalize = async (payload: CreditApplicationBiometricsData) => {
    const result = await createCreditApplicationFromIntake(payload);
    if (!result?.id) {
      showError("No se pudo crear la solicitud, intenta nuevamente.");
      return;
    }

    await router.push(`/solicitudes-credito/${result.id}`);
  };

  const handleLogout = async () => {
    await authService.logout();
    clearAuth();
    await router.push("/login");
  };

  return (
    <>
      <StyledDrawer
        variant={isDrawerNav ? "temporary" : "permanent"}
        open={isDrawerNav ? open : true}
        onClose={onClose}
        isMobile={isDrawerNav}>
        <SidebarHeader>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1}>
              <Image src="/logo/foly.svg" alt="Foly" width={32} height={32} />
              <Stack>
                <Typography variant="subtitle2">Folysoft</Typography>
                <Typography variant="body2" color="text.secondary">V.1.0</Typography>
              </Stack>
            </Stack>
            <NotificationInbox />
          </Stack>

          {canCreateCreditApplication && (
            <Button
              variant="option"
              color="primary"
              fullWidth
              startIcon={<Plus size={16} color={theme.palette.primary.light} strokeWidth={3} />}
              onClick={handleOpenNewCreditApplicationIntake}>
              Nueva solicitud
            </Button>
          )}
        </SidebarHeader>

        <NavigationContainer>
          <SidebarNavList
            items={visibleNavItems}
            pathname={router.pathname}
            openMenus={openMenus}
            onNavigate={handleNavigation}
            onToggleMenu={handleToggleMenu}
          />
        </NavigationContainer>

        <UserProfileContainer>
          <UserAvatar alt={user?.name ?? "Usuario"}>{getInitials(user?.name)}</UserAvatar>
          <UserInfoContainer>
            <Typography variant="subtitle2" noWrap>
              {user?.name ?? "Usuario"}
            </Typography>
            <UserRole variant="caption" noWrap>
              {user?.roleName?.trim() || user?.role?.trim() || "Sin rol asignado"}
            </UserRole>
          </UserInfoContainer>
          <Button
            variant="text"
            size="small"
            color="inherit"
            onClick={handleLogout}
            aria-label="Cerrar sesión"
          >
            <LogoutIcon fontSize="small" />
          </Button>
        </UserProfileContainer>
      </StyledDrawer>

      <CreditApplicationIntakeModal
        open={intakeModalOpen}
        onClose={() => setIntakeModalOpen(false)}
        onFinalize={handleIntakeFinalize}
      />
    </>
  );
}
