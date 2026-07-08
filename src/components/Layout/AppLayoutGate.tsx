import { useRouter } from "next/router";
import { AppLayoutShell } from "@/components/Layout";
import { shouldBypassAccessControl } from "@/lib/accessControl";
import { isPublicRoute, normalizePathname } from "@/lib/routeAccess";
import { useAuthStore } from "@/store/useAuthStore";

interface AppLayoutGateProps {
  children: React.ReactNode;
}

/**
 * Applies the persistent app shell only on authenticated app routes.
 * AuthGuard decides whether the page may render; this component only handles chrome.
 */
export function AppLayoutGate({ children }: AppLayoutGateProps) {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);

  if (shouldBypassAccessControl) {
    return <AppLayoutShell>{children}</AppLayoutShell>;
  }

  if (!router.isReady) {
    return children;
  }

  const currentPath = normalizePathname(router.asPath);
  const publicRoute = isPublicRoute(currentPath);

  if (publicRoute && !token) {
    return children;
  }

  return <AppLayoutShell>{children}</AppLayoutShell>;
}
