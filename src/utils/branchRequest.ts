import type { StatusChipVariant } from "@/components";
import type { BranchOrderStatus } from "@/types/solicitudes.types";
import type { QueryTransfersParams } from "@/types/transfers.types";

const BRANCH_ORDER_STATUSES: BranchOrderStatus[] = [
    "pending",
    "scheduled",
    "shipped",
    "partially_delivered",
    "in_progress",
    "delivered",
    "cancelled",
];

/** Un estado que el front no conoce se muestra como tal: nunca se disfraza de `pending`. */
export function mapBranchOrderStatus(status: string): BranchOrderStatus {
    if (BRANCH_ORDER_STATUSES.includes(status as BranchOrderStatus)) {
        return status as BranchOrderStatus;
    }
    return "unknown";
}

/** `partially_delivered` e `in_progress` en un traspaso son legado de solo lectura. */
export function isLegacyBranchOrderStatus(status: BranchOrderStatus): boolean {
    return status === "partially_delivered" || status === "in_progress";
}

export function getBranchOrderStatusLabel(status: BranchOrderStatus): string {
    const labels: Record<BranchOrderStatus, string> = {
        pending: "Solicitado",
        scheduled: "Agendado",
        shipped: "En curso",
        partially_delivered: "Legado: parcial",
        in_progress: "Legado: parcial",
        delivered: "Entregado",
        cancelled: "Cancelado",
        unknown: "Desconocido",
    };
    return labels[status];
}

export function getBranchOrderStatusVariant(
    status: BranchOrderStatus
): StatusChipVariant {
    const variants: Record<BranchOrderStatus, StatusChipVariant> = {
        pending: "pending",
        scheduled: "warning",
        shipped: "info",
        partially_delivered: "disabled",
        in_progress: "disabled",
        delivered: "success",
        cancelled: "error",
        unknown: "default",
    };
    return variants[status];
}

/** Solo se edita lo pendiente y que no esté ligado a una venta. */
export function isBranchOrderEditable(
    status: BranchOrderStatus,
    linkedToSale: boolean
): boolean {
    return status === "pending" && !linkedToSale;
}

export const TRANSFER_TAB_ALL = "all";
export const TRANSFER_TAB_TO_SHIP = "to_ship";
export const TRANSFER_TAB_TO_RECEIVE = "to_receive";
export const TRANSFER_TAB_IN_COURSE = "in_course";
export const TRANSFER_TAB_DELIVERED = "delivered";
export const TRANSFER_TAB_INCIDENT = "incident";
export const TRANSFER_TAB_CANCELLED = "cancelled";

type TransferTabFilters = Pick<
    QueryTransfersParams,
    "status" | "pending_action" | "has_open_incident"
>;

/** Filtros de `GET /transfers` que corresponden a cada pestaña del listado. */
export function getTransferTabFilters(tab: string): TransferTabFilters {
    switch (tab) {
        case TRANSFER_TAB_TO_SHIP:
            return { pending_action: "ship" };
        case TRANSFER_TAB_TO_RECEIVE:
            return { pending_action: "receive" };
        case TRANSFER_TAB_IN_COURSE:
            return { status: "shipped" };
        case TRANSFER_TAB_DELIVERED:
            return { status: "delivered" };
        case TRANSFER_TAB_INCIDENT:
            return { has_open_incident: true };
        case TRANSFER_TAB_CANCELLED:
            return { status: "cancelled" };
        default:
            return {};
    }
}
