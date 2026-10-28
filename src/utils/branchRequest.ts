import type { StatusChipVariant } from "@/components";
import type { BranchOrderStatus } from "@/types/solicitudes.types";
import type { QueryTransfersParams } from "@/types/transfers.types";

const BRANCH_ORDER_STATUSES: BranchOrderStatus[] = [
    "draft",
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
        draft: "Propuesta",
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
        draft: "default",
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

/** Se edita una propuesta o un solicitado que no esté ligado a una venta. */
export function isBranchOrderEditable(
    status: BranchOrderStatus,
    linkedToSale: boolean
): boolean {
    return (status === "pending" || status === "draft") && !linkedToSale;
}

export const TRANSFER_TAB_ALL = "all";
export const TRANSFER_FILTER_DRAFT = "draft";
export const TRANSFER_FILTER_PENDING = "pending";
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

/** Filtros de `GET /transfers` que corresponden a cada valor del select de estatus. */
export function getTransferListFilters(statusFilter: string): TransferTabFilters {
    switch (statusFilter) {
        case TRANSFER_FILTER_DRAFT:
            return { status: "draft" };
        case TRANSFER_FILTER_PENDING:
            return { status: "pending" };
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

/** @deprecated Usar `getTransferListFilters`. */
export const getTransferTabFilters = getTransferListFilters;
