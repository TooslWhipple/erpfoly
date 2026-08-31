import { createContext, useContext } from "react";

export interface AppNavContextValue {
  /** Sidebar is a temporary drawer (breakpoint depends on the current route). */
  isDrawerNav: boolean;
  /** Compact POS layout for sales / quotes / caja routes (below `lg`). */
  isSalesPosLayout: boolean;
  /** When true, POS chrome renders the menu toggle inline instead of floating. */
  embedMobileMenu: boolean;
  openMobileNav: () => void;
  toggleMobileNav: () => void;
}

const AppNavContext = createContext<AppNavContextValue | null>(null);

export function AppNavProvider({
  value,
  children,
}: {
  value: AppNavContextValue;
  children: React.ReactNode;
}) {
  return (
    <AppNavContext.Provider value={value}>{children}</AppNavContext.Provider>
  );
}

export function useAppNav(): AppNavContextValue {
  const ctx = useContext(AppNavContext);
  if (!ctx) {
    return {
      isDrawerNav: false,
      isSalesPosLayout: false,
      embedMobileMenu: false,
      openMobileNav: () => undefined,
      toggleMobileNav: () => undefined,
    };
  }
  return ctx;
}
