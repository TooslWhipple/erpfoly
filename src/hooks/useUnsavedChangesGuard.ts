import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import type { NextRouter } from "next/router";

interface UseUnsavedChangesGuardProps {
  isDirty: boolean;
  confirmLeave: () => Promise<boolean>;
}

type PendingNavigation =
  | { kind: "push"; args: Parameters<NextRouter["push"]> }
  | { kind: "replace"; args: Parameters<NextRouter["replace"]> }
  | { kind: "back" };

function resolveAsPath(
  url: Parameters<NextRouter["push"]>[0],
  as?: Parameters<NextRouter["push"]>[1]
): string {
  if (typeof as === "string") {
    return as;
  }
  if (as && typeof as === "object" && "pathname" in as && as.pathname) {
    return String(as.pathname);
  }
  if (typeof url === "string") {
    return url;
  }
  if (url && typeof url === "object" && "pathname" in url && url.pathname) {
    return String(url.pathname);
  }
  return "";
}

function pathMatchesTarget(currentPath: string, targetPath: string): boolean {
  const normalize = (value: string) => value.split("?")[0]?.split("#")[0] ?? value;
  return normalize(currentPath) === normalize(targetPath);
}

export function useUnsavedChangesGuard({
  isDirty,
  confirmLeave,
}: UseUnsavedChangesGuardProps) {
  const router = useRouter();
  const skipNextNavigationGuardRef = useRef(false);
  const pendingNavigationRef = useRef<PendingNavigation | null>(null);
  const confirmLeaveRef = useRef(confirmLeave);
  const isDirtyRef = useRef(isDirty);
  const routerAsPathRef = useRef(router.asPath);

  confirmLeaveRef.current = confirmLeave;
  isDirtyRef.current = isDirty;
  routerAsPathRef.current = router.asPath;

  const navigateWithoutGuard = useCallback(
    (url: string, as?: string, options?: Parameters<NextRouter["push"]>[2]) => {
      skipNextNavigationGuardRef.current = true;
      return router.push(url, as, options);
    },
    [router]
  );

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirtyRef.current) return;
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  useEffect(() => {
    const originalPush = router.push.bind(router);
    const originalReplace = router.replace.bind(router);
    const originalBack = router.back.bind(router);

    const runPendingNavigation = (pending: PendingNavigation): Promise<boolean> => {
      skipNextNavigationGuardRef.current = true;
      switch (pending.kind) {
        case "push":
          return originalPush(...pending.args);
        case "replace":
          return originalReplace(...pending.args);
        case "back":
          originalBack();
          return Promise.resolve(true);
      }
    };

    const confirmAndNavigate = (
      pending: PendingNavigation,
      targetPath: string
    ): Promise<boolean> => {
      if (
        pending.kind !== "back" &&
        pathMatchesTarget(routerAsPathRef.current, targetPath)
      ) {
        return runPendingNavigation(pending);
      }

      pendingNavigationRef.current = pending;

      return confirmLeaveRef.current().then((allow) => {
        const navigation = pendingNavigationRef.current;
        pendingNavigationRef.current = null;
        if (!allow || !navigation) {
          return false;
        }
        return runPendingNavigation(navigation);
      });
    };

    const guardedPush = (url: Parameters<NextRouter["push"]>[0], as?: Parameters<NextRouter["push"]>[1], options?: Parameters<NextRouter["push"]>[2]) => {
      if (skipNextNavigationGuardRef.current) {
        skipNextNavigationGuardRef.current = false;
        return originalPush(url, as, options);
      }
      if (!isDirtyRef.current) {
        return originalPush(url, as, options);
      }

      const targetPath = resolveAsPath(url, as);
      if (pathMatchesTarget(routerAsPathRef.current, targetPath)) {
        return originalPush(url, as, options);
      }

      return confirmAndNavigate({ kind: "push", args: [url, as, options] }, targetPath);
    };

    const guardedReplace = (
      url: Parameters<NextRouter["replace"]>[0],
      as?: Parameters<NextRouter["replace"]>[1],
      options?: Parameters<NextRouter["replace"]>[2]
    ) => {
      if (skipNextNavigationGuardRef.current) {
        skipNextNavigationGuardRef.current = false;
        return originalReplace(url, as, options);
      }
      if (!isDirtyRef.current) {
        return originalReplace(url, as, options);
      }

      const targetPath = resolveAsPath(url, as);
      if (pathMatchesTarget(routerAsPathRef.current, targetPath)) {
        return originalReplace(url, as, options);
      }

      return confirmAndNavigate(
        { kind: "replace", args: [url, as, options] },
        targetPath
      );
    };

    const guardedBack = () => {
      if (skipNextNavigationGuardRef.current) {
        skipNextNavigationGuardRef.current = false;
        originalBack();
        return;
      }
      if (!isDirtyRef.current) {
        originalBack();
        return;
      }

      void confirmAndNavigate({ kind: "back" }, "");
    };

    router.push = guardedPush as NextRouter["push"];
    router.replace = guardedReplace as NextRouter["replace"];
    router.back = guardedBack as NextRouter["back"];

    return () => {
      router.push = originalPush;
      router.replace = originalReplace;
      router.back = originalBack;
    };
  }, [router]);

  return { navigateWithoutGuard };
}
