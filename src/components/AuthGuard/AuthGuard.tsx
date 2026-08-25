import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
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
  isAuthEntryPublicRoute,
  normalizePathname,
  shouldUseAppLayout,
} from "@/lib/routeAccess";

interface AuthGuardProps {
  children: React.ReactNode;
}

interface AuthPersistApi {
  hasHydrated: () => boolean;
  onFinishHydration: (callback: () => void) => () => void;
}

const SESSION_REVALIDATE_MS = 5 * 60 * 1000;

function getAuthPersistApi(): AuthPersistApi | null {
  const storeWithPersist = useAuthStore as typeof useAuthStore & {
    persist?: AuthPersistApi;
  };
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
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setUser = useAuthStore((state) => state.setUser);
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.logout);

  const hasHydrated = useSyncExternalStore(
    subscribeToAuthHydration,
    getAuthHydrationSnapshot,
    getServerHydrationSnapshot
  );
  const [sessionValidated, setSessionValidated] = useState(false);
  const [bypassInitialized, setBypassInitialized] = useState(false);

  const validateSession = useCallback(
    async (opts?: { quiet?: boolean }) => {
      const currentPath = normalizePathname(router.asPath);
      const publicRoute = isPublicRoute(currentPath);
      const authEntryRoute = isAuthEntryPublicRoute(currentPath);

      const result = await authService.me();

      if (result.error || !result.data) {
        clearAuth();
        setSessionValidated(false);
        if (!publicRoute && !opts?.quiet) {
          void router.replace(buildLoginUrl(currentPath));
        }
        return false;
      }

      const nextUser = result.data;
      setAuth("cookie", nextUser);
      setSessionValidated(true);

      if (authEntryRoute || currentPath === "/") {
        void router.replace(getFirstAllowedRoute(nextUser));
        return true;
      }

      if (
        !canAccessPath(currentPath, nextUser) &&
        currentPath !== FORBIDDEN_ROUTE
      ) {
        void router.replace(FORBIDDEN_ROUTE);
      }
      return true;
    },
    [clearAuth, router, setAuth]
  );

  useEffect(() => {
    if (shouldBypassAccessControl && !bypassInitialized) {
      setUser(DEV_MOCK_USER);
      setBypassInitialized(true);
      return;
    }

    if (shouldBypassAccessControl) {
      if (router.isReady) {
        const currentPath = normalizePathname(router.asPath);
        if (currentPath === "/") {
          void router.replace(getFirstAllowedRoute(DEV_MOCK_USER));
        }
      }
      return;
    }
    if (!router.isReady || !hasHydrated) return;

    const currentPath = normalizePathname(router.asPath);
    const publicRoute = isPublicRoute(currentPath);

    // Public routes: optional silent revalidation if we think we have a session
    if (publicRoute && !isAuthenticated && !isAuthEntryPublicRoute(currentPath)) {
      return;
    }

    let cancelled = false;

    void (async () => {
      const ok = await validateSession({ quiet: publicRoute });
      if (cancelled) return;
      if (!ok && publicRoute) {
        setSessionValidated(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    bypassInitialized,
    hasHydrated,
    isAuthenticated,
    router,
    setUser,
    validateSession,
  ]);

  // FE-M-3: revalidate on focus and on an interval so revoked sessions die quickly
  useEffect(() => {
    if (shouldBypassAccessControl || !sessionValidated) return;

    const onFocus = () => {
      void validateSession({ quiet: true });
    };
    window.addEventListener("focus", onFocus);
    const intervalId = window.setInterval(() => {
      void validateSession({ quiet: true });
    }, SESSION_REVALIDATE_MS);

    return () => {
      window.removeEventListener("focus", onFocus);
      window.clearInterval(intervalId);
    };
  }, [sessionValidated, validateSession]);

  if (shouldBypassAccessControl) {
    return <>{children}</>;
  }

  if (!router.isReady || !hasHydrated) {
    return (
      <Box
        minHeight="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <CircularProgress />
      </Box>
    );
  }

  const currentPath = normalizePathname(router.asPath);
  const publicRoute = isPublicRoute(currentPath);
  const sessionToken = isAuthenticated || sessionValidated ? "cookie" : null;

  if (!shouldUseAppLayout(currentPath, sessionToken)) {
    return <>{children}</>;
  }

  if (
    !sessionValidated ||
    !user ||
    publicRoute ||
    currentPath === "/"
  ) {
    return (
      <Box
        minHeight="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!canAccessPath(currentPath, user) && currentPath !== FORBIDDEN_ROUTE) {
    return (
      <Box
        minHeight="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <CircularProgress />
      </Box>
    );
  }

  return <>{children}</>;
}
