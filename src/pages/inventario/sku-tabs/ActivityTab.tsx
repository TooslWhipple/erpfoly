import { SalesChart, ActivityLog } from "@/components/InventoryDetail";
import type { SalesData, ActivityLogEntry } from "@/types/inventario.types";
import { Stack } from "@mui/material";

export interface ActivityTabProps {
    salesData: SalesData;
    activityLog: ActivityLogEntry[];
}

export function ActivityTab({ salesData, activityLog }: ActivityTabProps) {
    return (
        <Stack spacing={3}>
            <SalesChart data={salesData} />
            <ActivityLog activities={activityLog} />
        </Stack>
    );
}
