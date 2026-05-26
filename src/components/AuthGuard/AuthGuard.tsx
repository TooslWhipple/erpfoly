import { useEffect, useState, useSyncExternalStore } from "react";
import { Box, CircularProgress } from "@mui/material";
import { useRouter } from "next/router";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/useAuthStore";
import { shouldBypassAccessControl, DEV_MOCK_USER } from "@/lib/accessControl";
import {
  canAccessPath,
  FORBIDDEN_ROUTE,
  getFirstAllowedRoute,
  isPublicRoute,
  normalizePathname,
} from "@/lib/routeAccess";

interface AuthGuardProps {
  children: React.ReactNode;
}

interface AuthPersistApi {
  hasHydrated: () => boolean;
  onFinishHydration: (callback: () => void) => () => void;
}

function getAuthPersistApi(): AuthPersistApi | null {
  const storeWithPersist = useAuthStore as typeof useAuthStore & { persist?: AuthPersistApi };
  return storeWithPersist.persist ?? null;
}

function subscribeToAuthHydration(callback: () => void): () => void {
  return getAuthPersistApi()?.onFinishHydration(callback) ?? (() => undefined);
}

function getAuthHydrationSnapshot(): boolean {
  return getAuthPersistApi()?.hasHydrated() ?? true;
}

function getServerHydrationSnapshot(): boolean {
  return false;
}

function buildLoginUrl(pathname: string): string {
  const normalizedPath = normalizePathname(pathname);
  if (normalizedPath === "/" || isPublicRoute(normalizedPath)) return "/login";
  return `/login?redirect=${encodeURIComponent(normalizedPath)}`;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const clearAuth = useAuthStore((state) => state.logout);

  const hasHydrated = useSyncExternalStore(
    subscribeToAuthHydration,
    getAuthHydrationSnapshot,
    getServerHydrationSnapshot
  );
  const [validatedToken, setValidatedToken] = useState<string | null>(null);
  const [bypassInitialized, setBypassInitialized] = useState(false);

  useEffect(() => {
    if (shouldBypassAccessControl && !bypassInitialized) {
      setUser(DEV_MOCK_USER);
      setBypassInitialized(true);
      return;
    }

    if (shouldBypassAccessControl) return;
    if (!router.isReady || !hasHydrated) return;

    const currentPath = normalizePathname(router.asPath);
    const publicRoute = isPublicRoute(currentPath);

    if (!token) {
      if (!publicRoute) {
        clearAuth();
        void router.replace(buildLoginUrl(currentPath));
      }
      return;
    }

    if (validatedToken === token && user) {
      if (publicRoute || currentPath === "/") {
        void router.replace(getFirstAllowedRoute(user));
        return;
      }

      if (currentPath === FORBIDDEN_ROUTE) {
        const firstAllowed = getFirstAllowedRoute(user);
        if (firstAllowed !== FORBIDDEN_ROUTE) {
          void router.replace(firstAllowed);
        }
        return;
      }

      if (!canAccessPath(currentPath, user) && currentPath !== FORBIDDEN_ROUTE) {
        void router.replace(FORBIDDEN_ROUTE);
      }
      return;
    }

    let cancelled = false;

    async function validateSession() {
      const result = await authService.me();

      if (cancelled) return;

      if (result.error || !result.data) {
        clearAuth();
        setValidatedToken(null);
        if (!publicRoute) {
          void router.replace(buildLoginUrl(currentPath));
        }
        return;
      }

      const nextUser = result.data;
      setUser(nextUser);
      setValidatedToken(token);

      if (publicRoute || currentPath === "/") {
        void router.replace(getFirstAllowedRoute(nextUser));
        return;
      }

      if (currentPath === FORBIDDEN_ROUTE) {
        const firstAllowed = getFirstAllowedRoute(nextUser);
        if (firstAllowed !== FORBIDDEN_ROUTE) {
          void router.replace(firstAllowed);
        }
        return;
      }

      if (!canAccessPath(currentPath, nextUser) && currentPath !== FORBIDDEN_ROUTE) {
        void router.replace(FORBIDDEN_ROUTE);
      }
    }

    void validateSession();

    return () => {
      cancelled = true;
    };
  }, [clearAuth, hasHydrated, router, setUser, token, user, validatedToken, bypassInitialized]);

  if (shouldBypassAccessControl) {
    return <>{children}</>;
  }

  if (!router.isReady || !hasHydrated) {
    return (
      <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  const currentPath = normalizePathname(router.asPath);
  const publicRoute = isPublicRoute(currentPath);

  if (publicRoute && !token) {
    return <>{children}</>;
  }

  if (!token || !user || validatedToken !== token || publicRoute || currentPath === "/") {
    return (
      <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  if (!canAccessPath(currentPath, user) && currentPath !== FORBIDDEN_ROUTE) {
    return (
      <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  return <>{children}</>;
}
