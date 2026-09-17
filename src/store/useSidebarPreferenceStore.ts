import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type SidebarPreferenceState = {
  isCollapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
};

export const useSidebarPreferenceStore = create<SidebarPreferenceState>()(
  persist(
    (set) => ({
      isCollapsed: false,
      setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
      toggleCollapsed: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
    }),
    {
      name: "sidebar-collapsed-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isCollapsed: state.isCollapsed,
      }),
    },
  ),
);
