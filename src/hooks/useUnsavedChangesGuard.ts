import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import type { NextRouter } from "next/router";
import { isSameRouteNavigation } from "./unsavedChangesNavigation";

interface UseUnsavedChangesGuardProps {
  isDirty: boolean;
  confirmLeave: () => Promise<boolean>;
}

type PendingNavigation =
  | { kind: "push"; args: Parameters<NextRouter["push"]> }
  | { kind: "replace"; args: Parameters<NextRouter["replace"]> }
  | { kind: "back" };

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
  const routerPathnameRef = useRef(router.pathname);
  const routerQueryRef = useRef(router.query);

  confirmLeaveRef.current = confirmLeave;
  isDirtyRef.current = isDirty;
  routerAsPathRef.current = router.asPath;
  routerPathnameRef.current = router.pathname;
  routerQueryRef.current = router.query;

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

    const confirmAndNavigate = (pending: PendingNavigation): Promise<boolean> => {
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

      if (
        isSameRouteNavigation(
          routerPathnameRef.current,
          routerAsPathRef.current,
          routerQueryRef.current,
          url,
          as
        )
      ) {
        return originalPush(url, as, options);
      }

      return confirmAndNavigate({ kind: "push", args: [url, as, options] });
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

      if (
        isSameRouteNavigation(
          routerPathnameRef.current,
          routerAsPathRef.current,
          routerQueryRef.current,
          url,
          as
        )
      ) {
        return originalReplace(url, as, options);
      }

      return confirmAndNavigate({
        kind: "replace",
        args: [url, as, options],
      });
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

      void confirmAndNavigate({ kind: "back" });
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
