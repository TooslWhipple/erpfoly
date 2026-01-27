import { Box, Typography, Chip, Stack } from "@mui/material";
import type { ActivityLogEntry } from "@/types/inventario.types";
import {
    ActivityLogContainer,
    ActivityLogHeader,
    ActivityList,
    ActivityItem,
    ActivityDot,
    ActivityContent,
} from "./styles";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ActivityLogProps {
    activities: ActivityLogEntry[];
}

// ============================================================================
// HELPERS
// ============================================================================

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

// ============================================================================
// COMPONENT
// ============================================================================

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
                {activities.map((activity, index) => {
                    const typeColor = getActivityTypeColor(activity.type);
                    const isLast = index === activities.length - 1;

                    return (
                        <ActivityItem key={activity.id}>
                            <ActivityDot isLast={isLast} />
                            <ActivityContent>
                                <Stack direction="row" spacing={1} mb={1} alignItems="center">
                                    <Chip
                                        label={getActivityTypeLabel(activity.type)}
                                        size="small"
                                        sx={{
                                            backgroundColor: typeColor.bg,
                                            color: typeColor.text,
                                            fontWeight: 500,
                                            fontSize: "12px",
                                        }}
                                    />
                                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                        Por: {activity.performedBy}
                                    </Typography>
                                </Stack>
                                <Typography variant="body1" sx={{ mb: 1 }}>
                                    {activity.description}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {activity.date} | {activity.time}
                                </Typography>
                            </ActivityContent>
                        </ActivityItem>
                    );
                })}
            </ActivityList>
        </ActivityLogContainer>
    );
}
