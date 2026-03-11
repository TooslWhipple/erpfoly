"use client";

import { Dialog, Box, useMediaQuery, useTheme, Stack, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import {
    DialogContent,
    ModalTitle,
    ModalDescription,
    CloseButton,
} from "../ModalForm/styles";
import { HeaderRow, PANEL_WIDTHS, getDefaultPaperSx } from "./styles";

export interface SideModalProps {
    open: boolean;
    onClose: () => void;
    header?: React.ReactNode;
    headerActions?: React.ReactNode;
    title?: string;
    description?: string;
    headerContent?: React.ReactNode;
    children?: React.ReactNode;
    maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
    fullWidth?: boolean;
    disableClose?: boolean;
    contentSx?: SxProps<Theme>;
    paperSx?: SxProps<Theme>;
}

export function SideModal({
    open,
    onClose,
    header,
    headerActions,
    title,
    description,
    headerContent,
    children,
    maxWidth = "md",
    fullWidth = true,
    disableClose = false,
    contentSx,
    paperSx,
}: SideModalProps) {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
    const panelWidth = PANEL_WIDTHS[maxWidth] ?? PANEL_WIDTHS.sm;

    const handleClose = (_event: object, reason: string) => {
        if (reason === "backdropClick" || reason === "escapeKeyDown") {
            if (!disableClose) onClose();
        }
    };

    const defaultPaper = getDefaultPaperSx(theme, fullScreen, panelWidth, fullWidth);
    const mergedPaperSx: SxProps<Theme> | undefined = paperSx
        ? (defaultPaper
            ? [defaultPaper, paperSx]
            : paperSx) as SxProps<Theme>
        : defaultPaper;

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullScreen={fullScreen}
            slotProps={{
                container: {
                    sx: fullScreen
                        ? undefined
                        : {
                            justifyContent: "flex-end",
                            alignItems: "stretch",
                        },
                },
                paper: {
                    sx: mergedPaperSx,
                },
            }}
        >
            <DialogContent>
                <Stack
                    direction="column"
                    alignItems="flex-start"
                    spacing={2}>
                    <CloseButton
                        onClick={onClose}
                        disabled={disableClose}
                        size="small"
                    >
                        <CloseIcon />
                    </CloseButton>
                    {
                        header ? header :
                            <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
                                <Stack spacing={0.5}>
                                    {
                                        title != null && <Typography variant="h6">{title}</Typography>
                                    }
                                    {
                                        description != null && <Typography variant="body2" color="text.secondary">{description}</Typography>
                                    }
                                </Stack>
                                {
                                    headerActions
                                }

                            </Stack>
                    }
                </Stack>

                <Box
                    component="div"
                    sx={[
                        {
                            display: "flex",
                            flexDirection: "column",
                            flex: 1,
                            minHeight: 0,
                            overflow: "auto",
                        },
                        ...(Array.isArray(contentSx) ? contentSx : contentSx ? [contentSx] : []),
                    ]}
                >
                    {children}
                </Box>
            </DialogContent>
        </Dialog>
    );
}
