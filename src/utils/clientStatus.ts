import type { ClientStatus } from "@/types/clientes.types";

type ClientStatusChipVariant = "success" | "error" | "warning" | "default";

export const CLIENT_TERMINAL_STATUSES: ClientStatus[] = ["cesado", "cancelado"];

export const CLIENT_STATUS_LABELS: Record<ClientStatus, string> = {
  active: "Activo",
  blocked: "Bloqueado",
  cesado: "Cesado",
  cancelado: "Cancelado",
};

export const CLIENT_STATUS_VARIANTS: Record<
  ClientStatus,
  ClientStatusChipVariant
> = {
  active: "success",
  blocked: "error",
  cesado: "warning",
  cancelado: "default",
};

export function isClientActive(
  status: ClientStatus | null | undefined,
): boolean {
  return (status ?? "active") === "active";
}

export function isClientDeactivated(
  status: ClientStatus | null | undefined,
): boolean {
  if (status == null) {
    return false;
  }
  return CLIENT_TERMINAL_STATUSES.includes(status);
}