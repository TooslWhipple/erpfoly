import { useEffect } from "react";
import { useRouter } from "next/router";

interface UseUnsavedChangesGuardProps {
  isDirty: boolean;
  confirmLeave: () => Promise<boolean>;
}

export function useUnsavedChangesGuard({
  isDirty,
  confirmLeave,
}: UseUnsavedChangesGuardProps) {
  const router = useRouter();

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    const onRouteChangeStart = async (url: string) => {
      if (!isDirty || url === router.asPath) return;
      const allow = await confirmLeave();
      if (!allow) {
        router.events.emit("routeChangeError");
        throw new Error("Navigation cancelled due to unsaved changes");
      }
    };

    router.events.on("routeChangeStart", onRouteChangeStart);
    return () => router.events.off("routeChangeStart", onRouteChangeStart);
  }, [confirmLeave, isDirty, router]);
}
