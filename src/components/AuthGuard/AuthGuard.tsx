import { useEffect, useState, useSyncExternalStore } from "react";
import { Box, CircularProgress } from "@mui/material";
import { useRouter } from "next/router";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/useAuthStore";
import { shouldBypassAccessControl, DEV_MOCK_USER } from "@/lib/accessControl";
import {
  canAccessPath,
  getFirstAllowedRoute,
  isPublicRoute,
  isAuthEntryPublicRoute,
  normalizePathname,
  resolvePostLoginPath,
  shouldUseAppLayout,
} from "@/lib/routeAccess";
import { consumeExplicitLogout } from "@/lib/authSession";

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
    const authEntryRoute = isAuthEntryPublicRoute(currentPath);

    if (!token) {
      if (!publicRoute) {
        clearAuth();
        const skipRedirect = consumeExplicitLogout();
        void router.replace(
          skipRedirect ? "/login" : buildLoginUrl(currentPath),
        );
      }
      return;
    }

    if (validatedToken === token && user) {
      if (authEntryRoute || currentPath === "/") {
        const redirect =
          typeof router.query.redirect === "string"
            ? router.query.redirect
            : undefined;
        void router.replace(resolvePostLoginPath(user, redirect));
        return;
      }

      if (!canAccessPath(currentPath, user)) {
        void router.replace(getFirstAllowedRoute(user));
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

      if (authEntryRoute || currentPath === "/") {
        const redirect =
          typeof router.query.redirect === "string"
            ? router.query.redirect
            : undefined;
        void router.replace(resolvePostLoginPath(nextUser, redirect));
        return;
      }

      if (!canAccessPath(currentPath, nextUser)) {
        void router.replace(getFirstAllowedRoute(nextUser));
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

  if (!shouldUseAppLayout(currentPath, token)) {
    return <>{children}</>;
  }

  if (
    !token ||
    !user ||
    validatedToken !== token ||
    publicRoute ||
    currentPath === "/"
  ) {
    return (
      <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  if (!canAccessPath(currentPath, user)) {
    return (
      <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  return <>{children}</>;
}
