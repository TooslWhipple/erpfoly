import { Dialog, DialogContent, Box, Typography, IconButton } from "@mui/material";
import { Close as CloseIcon, ArrowUpward as ArrowUpIcon, ArrowDownward as ArrowDownIcon } from "@mui/icons-material";
import {
    CostHistoryTimeline,
    TimelineLine,
    TimelineItem,
    TimelineDot,
    TimelineContent,
    TimelineDate,
    TimelinePrice,
    TimelineChange,
} from "@/styles/catalogos/productos.styles";
import type { CostHistoryEntry } from "../types";

// ============================================================================
// TYPES
// ============================================================================

interface CostHistoryModalProps {
    open: boolean;
    onClose: () => void;
    history: CostHistoryEntry[];
}

// ============================================================================
// COMPONENT
// ============================================================================

export function CostHistoryModal({ open, onClose, history }: CostHistoryModalProps) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    maxHeight: "90vh",
                },
            }}
        >
            <DialogContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Historial de costos de este artículo.
                    </Typography>
                    <IconButton
                        size="small"
                        onClick={onClose}
                        sx={{
                            backgroundColor: "action.hover",
                            "&:hover": {
                                backgroundColor: "action.selected",
                            },
                        }}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>

                <CostHistoryTimeline>
                    <TimelineLine />
                    {history.map((entry) => (
                        <TimelineItem key={entry.id}>
                            <TimelineDot />
                            <TimelineContent>
                                <TimelineDate>{entry.date}</TimelineDate>
                                <TimelinePrice>
                                    ${entry.price.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                                </TimelinePrice>
                                <TimelineChange>
                                    {entry.changeType === "increase" ? (
                                        <ArrowUpIcon fontSize="small" />
                                    ) : (
                                        <ArrowDownIcon fontSize="small" />
                                    )}
                                    {entry.changePercentage}%
                                </TimelineChange>
                            </TimelineContent>
                        </TimelineItem>
                    ))}
                </CostHistoryTimeline>
            </DialogContent>
        </Dialog>
    );
}
