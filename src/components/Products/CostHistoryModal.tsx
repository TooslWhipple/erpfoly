import numeral from "numeral";
import { SideModal } from "@/components/SideModal";
import {
    CostHistoryTimeline,
    TimelineLine,
    TimelineItem,
    TimelineDot,
} from "@/styles/catalogos/productos.styles";
import type { CostHistoryEntry } from "@/types/productos.types";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Stack, Typography } from "@mui/material";
import { theme } from "@/styles/theme";

interface CostHistoryModalProps {
    open: boolean;
    onClose: () => void;
    history: CostHistoryEntry[];
}

export function CostHistoryModal({ open, onClose, history }: CostHistoryModalProps) {
    return (
        <SideModal
            open={open}
            onClose={onClose}
            maxWidth="md"
            title="Historial de costos de este artículo.">
            {
                history.length > 0 ?
                    <CostHistoryTimeline>
                        <TimelineLine />
                        {
                            history.map((entry) => (
                                <TimelineItem key={entry.id}>
                                    <TimelineDot />
                                    <Stack style={{ paddingLeft: "24px" }}>
                                        <Typography variant="body2" color="text.secondary">{entry.date}</Typography>
                                        <Stack direction="row" alignItems="center" spacing={0.5}>
                                            <Typography variant="body1">{numeral(entry.price).format("$0,0.00")}</Typography>
                                            {
                                                entry.changeType === "increase"
                                                    ? <ArrowUp size={12} strokeWidth={2} color={theme.palette.text.secondary} />
                                                    : <ArrowDown size={12} strokeWidth={2} color={theme.palette.text.secondary} />
                                            }
                                            <Typography variant="body2" color="text.secondary" fontWeight={500}> {numeral(entry.changePercentage).format("0.00")}%</Typography>
                                        </Stack>
                                    </Stack>
                                </TimelineItem>
                            ))
                        }
                    </CostHistoryTimeline>
                    :
                    <CostHistoryTimeline>
                        <Typography variant="body2" color="text.secondary" textAlign="center" fontWeight={500}>Este artículo aún no cuenta con histórico de costos.</Typography>
                    </CostHistoryTimeline>
            }

        </SideModal>
    );
}
