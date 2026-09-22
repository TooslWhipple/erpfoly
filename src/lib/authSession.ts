import type { NextRouter } from "next/router";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/useAuthStore";
import { queryClient } from "@/lib/queryClient";

export const EXPLICIT_LOGOUT_FLAG_KEY = "explicitLogout";

export function markExplicitLogout(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(EXPLICIT_LOGOUT_FLAG_KEY, "1");
}

export function consumeExplicitLogout(): boolean {
  if (typeof window === "undefined") return false;
  const flagged = sessionStorage.getItem(EXPLICIT_LOGOUT_FLAG_KEY) === "1";
  if (flagged) {
    sessionStorage.removeItem(EXPLICIT_LOGOUT_FLAG_KEY);
  }
  return flagged;
}

export function clearExplicitLogoutFlag(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(EXPLICIT_LOGOUT_FLAG_KEY);
}

export async function logoutToLogin(
  router: Pick<NextRouter, "replace">,
): Promise<void> {
  markExplicitLogout();
  await authService.logout();
  queryClient.clear();
  useAuthStore.getState().logout();
  await router.replace("/login");
}
