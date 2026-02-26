import { SalesChart, ActivityLog } from "@/components/InventoryDetail";
import type { SalesData, ActivityLogEntry } from "@/types/inventario.types";

export interface ActivityTabProps {
    salesData: SalesData;
    activityLog: ActivityLogEntry[];
}

export function ActivityTab({ salesData, activityLog }: ActivityTabProps) {
    return (
        <>
            <SalesChart data={salesData} />
            <ActivityLog activities={activityLog} />
        </>
    );
}
