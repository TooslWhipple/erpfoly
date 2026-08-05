import { create } from "zustand";
import { persist } from "zustand/middleware";

interface InvoicingConfigState {
  facturacionConfirmacionVentaEnabled: boolean;
  setFacturacionConfirmacionVentaEnabled: (enabled: boolean) => void;
  toggleFacturacionConfirmacionVenta: () => void;
}

export const getEnvFacturacionConfirmacionVenta = (): boolean => {
  const envVal = process.env.NEXT_PUBLIC_FACTURACION_CONFIRMACION_VENTA;
  if (envVal !== undefined && envVal !== "") {
    return envVal.toLowerCase() === "true" || envVal === "1";
  }
  return true; // Predeterminado en verdadero
};

export const useInvoicingConfigStore = create<InvoicingConfigState>()(
  persist(
    (set) => ({
      facturacionConfirmacionVentaEnabled: getEnvFacturacionConfirmacionVenta(),

      setFacturacionConfirmacionVentaEnabled: (enabled: boolean) =>
        set({ facturacionConfirmacionVentaEnabled: enabled }),

      toggleFacturacionConfirmacionVenta: () =>
        set((state) => ({
          facturacionConfirmacionVentaEnabled: !state.facturacionConfirmacionVentaEnabled,
        })),
    }),
    {
      name: "invoicing-config-storage",
    }
  )
);
