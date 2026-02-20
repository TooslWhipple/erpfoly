import { create } from "zustand";

export type SnackbarSeverity = "success" | "error" | "info" | "warning";

interface SnackbarState {
  open: boolean;
  message: string;
  severity: SnackbarSeverity;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
  showWarning: (message: string) => void;
  close: () => void;
}

export const useSnackbarStore = create<SnackbarState>((set) => ({
  open: false,
  message: "",
  severity: "info",

  showSuccess: (message: string) =>
    set({ open: true, message, severity: "success" }),

  showError: (message: string) =>
    set({ open: true, message, severity: "error" }),

  showInfo: (message: string) =>
    set({ open: true, message, severity: "info" }),

  showWarning: (message: string) =>
    set({ open: true, message, severity: "warning" }),

  close: () => set({ open: false }),
}));
