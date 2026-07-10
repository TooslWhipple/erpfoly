import { useRouter } from "next/router";
import { AppLayoutShell } from "@/components/Layout";
import { normalizePathname, shouldUseAppLayout } from "@/lib/routeAccess";
import { useAuthStore } from "@/store/useAuthStore";

interface AppLayoutGateProps {
  children: React.ReactNode;
}

/**
 * Applies the persistent app shell only when shouldUseAppLayout says so.
 * AuthGuard decides whether the page may render; this component only handles chrome.
 */
export function AppLayoutGate({ children }: AppLayoutGateProps) {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);

  if (!router.isReady) {
    return children;
  }

  const currentPath = normalizePathname(router.asPath);

  if (!shouldUseAppLayout(currentPath, token)) {
    return children;
  }

  return <AppLayoutShell>{children}</AppLayoutShell>;
}
