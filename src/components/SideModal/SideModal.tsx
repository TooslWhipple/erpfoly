"use client";

import { Dialog, Box, useMediaQuery, useTheme } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import {
    StyledDialogContent,
    ModalTitle,
    ModalDescription,
    CloseButton,
} from "../ModalForm/styles";
import { HeaderRow, PANEL_WIDTHS, getDefaultPaperSx } from "./styles";

export interface SideModalProps {
    open: boolean;
    onClose: () => void;
    /**
     * Custom header: replaces the default header (close + headerActions + title/description).
     * Use when you need full control (e.g. tabs, custom layout).
     */
    header?: React.ReactNode;
    /**
     * Rendered on the right side of the first row in the default header (e.g. submit button).
     * Ignored if `header` is provided.
     */
    headerActions?: React.ReactNode;
    /** Title shown below the header row in default layout. Ignored if `header` is provided. */
    title?: string;
    /** Description shown below title in default layout. Ignored if `header` is provided. */
    description?: string;
    /** Extra content below title/description in default header (e.g. filters). Ignored if `header` is provided. */
    headerContent?: React.ReactNode;
    /** Main body. Can be any content: form, detail view, tabs, etc. */
    children?: React.ReactNode;
    maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
    fullWidth?: boolean;
    /** When true, backdrop click and escape do not close. E.g. while submitting. */
    disableClose?: boolean;
    /** Merge into the content wrapper Box sx. Use to override layout (flex, overflow, etc.). */
    contentSx?: SxProps<Theme>;
    /** Merge into Dialog slotProps.paper.sx. Use to override position/size/shadow. */
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
            <StyledDialogContent
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    overflow: "auto",
                }}
            >
                {header !== undefined ? (
                    header
                ) : (
                    <Box sx={{ flexShrink: 0 }}>
                        <HeaderRow>
                            <CloseButton
                                onClick={onClose}
                                disabled={disableClose}
                                size="small"
                                aria-label="Cerrar"
                            >
                                <CloseIcon />
                            </CloseButton>
                            {headerActions}
                        </HeaderRow>
                        {(title != null || description != null || headerContent != null) && (
                            <Box sx={{ mb: 2 }}>
                                {title != null && <ModalTitle>{title}</ModalTitle>}
                                {description != null && (
                                    <ModalDescription>{description}</ModalDescription>
                                )}
                                {headerContent}
                            </Box>
                        )}
                    </Box>
                )}

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
            </StyledDialogContent>
        </Dialog>
    );
}
