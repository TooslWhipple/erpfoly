import { Box, Typography, Chip, Stack } from "@mui/material";
import type { ActivityLogEntry } from "@/types/inventario.types";
import {
    ActivityLogContainer,
    ActivityLogHeader,
    ActivityList,
    ActivityItem,
    ActivityDot,
    ActivityTimeLine
} from "./styles";
import { StatusChip } from "../StatusChip";

export interface ActivityLogProps {
    activities: ActivityLogEntry[];
}

function getActivityTypeLabel(type: ActivityLogEntry["type"]): string {
    const labels: Record<ActivityLogEntry["type"], string> = {
        edition: "Edición",
        inventory: "Inventarios",
        sales: "Ventas",
    };
    return labels[type];
}

function getActivityTypeColor(type: ActivityLogEntry["type"]): {
    bg: string;
    text: string;
} {
    const colors: Record<ActivityLogEntry["type"], { bg: string; text: string }> = {
        edition: { bg: "#F3E8FF", text: "#9333EA" },
        inventory: { bg: "#F3E8FF", text: "#9333EA" },
        sales: { bg: "#DCFCE7", text: "#16A34A" },
    };
    return colors[type];
}

export function ActivityLog({ activities }: ActivityLogProps) {
    return (
        <ActivityLogContainer>
            <ActivityLogHeader>
                <Typography variant="h6" sx={{ mb: 0.5 }}>
                    Actividad del artículo
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Historial completo de movimientos y cambios en el artículo
                </Typography>
            </ActivityLogHeader>

            <ActivityList>
                <ActivityTimeLine />
                {
                    activities.map((activity, index) => {
                        const typeColor = getActivityTypeColor(activity.type);

                        return (
                            <ActivityItem key={activity.id}>
                                <ActivityDot />
                                <Stack direction="column" spacing={0.5}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <StatusChip
                                            size="small"
                                            variant="info"
                                            label={getActivityTypeLabel(activity.type)}
                                        />
                                        <Typography variant="body2" color="text.secondary">Por: {activity.performedBy}</Typography>
                                    </Stack>
                                    <Typography variant="body1">{activity.description}</Typography>
                                    <Typography variant="caption" color="text.secondary">{activity.date} | {activity.time}</Typography>
                                </Stack>
                            </ActivityItem>
                        );
                    })}
            </ActivityList>
        </ActivityLogContainer >
    );
}
