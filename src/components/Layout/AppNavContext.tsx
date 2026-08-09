import { createContext, useContext } from "react";

export interface AppNavContextValue {
  /** Temporary drawer mode (tablet / mobile). */
  isCompactNav: boolean;
  /** When true, chrome pages should render the menu toggle inline (sales flow). */
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
      isCompactNav: false,
      embedMobileMenu: false,
      openMobileNav: () => undefined,
      toggleMobileNav: () => undefined,
    };
  }
  return ctx;
}
