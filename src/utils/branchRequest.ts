import type { StatusChipVariant } from "@/components";
import type { BranchOrderStatus } from "@/types/solicitudes.types";

const BRANCH_ORDER_STATUSES: BranchOrderStatus[] = [
    "pending",
    "scheduled",
    "partially_delivered",
    "delivered",
    "cancelled",
];

export function mapBranchOrderStatus(status: string): BranchOrderStatus {
    if (BRANCH_ORDER_STATUSES.includes(status as BranchOrderStatus)) {
        return status as BranchOrderStatus;
    }
    return "pending";
}

export function getBranchOrderStatusLabel(status: BranchOrderStatus): string {
    const labels: Record<BranchOrderStatus, string> = {
        pending: "Pendiente",
        scheduled: "Agendado",
        partially_delivered: "En curso",
        delivered: "Entregado",
        cancelled: "Cancelado",
    };
    return labels[status];
}

export function getBranchOrderStatusVariant(
    status: BranchOrderStatus
): StatusChipVariant {
    const variants: Record<BranchOrderStatus, StatusChipVariant> = {
        pending: "pending",
        scheduled: "warning",
        partially_delivered: "info",
        delivered: "success",
        cancelled: "error",
    };
    return variants[status];
}

export function isBranchOrderEditable(status: BranchOrderStatus): boolean {
    return status === "pending" || status === "scheduled";
}
