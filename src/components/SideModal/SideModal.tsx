"use client";

import { Dialog, useMediaQuery, useTheme, Stack, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { X as CloseIcon } from "lucide-react";
import { DialogContent, CloseButton } from "../ModalForm/styles";
import {
  PANEL_WIDTHS,
  getDefaultPaperSx,
  SideModalHeader,
  SideModalContent,
} from "./styles";

export interface SideModalProps {
  open: boolean;
  onClose: () => void;
  header?: React.ReactNode;
  headerActions?: React.ReactNode;
  headerActionsPosition?: "title" | "top";
  title?: string;
  description?: string;
  headerContent?: React.ReactNode;
  children?: React.ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
  disableClose?: boolean;
  contentSx?: SxProps<Theme>;
  paperSx?: SxProps<Theme>;
  /** Breakpoint below which the modal goes fullscreen. Default: `md`. */
  fullScreenBreakpoint?: "sm" | "md" | "lg";
  /** When true, always fullscreen regardless of breakpoint (tablets / camera capture). */
  forceFullScreen?: boolean;
}

export function SideModal({
  open,
  onClose,
  header,
  headerActions,
  headerActionsPosition = "title",
  title,
  description,
  headerContent,
  children,
  maxWidth = "md",
  fullWidth = true,
  disableClose = false,
  contentSx,
  paperSx,
  fullScreenBreakpoint = "md",
  forceFullScreen = false,
}: SideModalProps) {
  const theme = useTheme();
  const matchesBreakpoint = useMediaQuery(
    theme.breakpoints.down(fullScreenBreakpoint),
  );
  const fullScreen = forceFullScreen || matchesBreakpoint;
  const panelWidth = PANEL_WIDTHS[maxWidth] ?? PANEL_WIDTHS.sm;

  const handleClose = (_event: object, reason: string) => {
    if (reason === "backdropClick") {
      return;
    }
    if (reason === "escapeKeyDown") {
      if (!disableClose) onClose();
    }
  };

  const defaultPaper = getDefaultPaperSx(theme, fullScreen, panelWidth, fullWidth);
  const paperSxMerged: SxProps<Theme> | undefined = paperSx
    ? ((defaultPaper ? [defaultPaper, paperSx] : paperSx) as SxProps<Theme>)
    : defaultPaper;

  const defaultHeader = (
    <Stack
      direction="row"
      spacing={2}
      justifyContent="space-between"
      alignItems="flex-start"
      sx={{ width: "100%" }}
    >
      <Stack spacing={0.5} width="100%">
        {title != null && <Typography variant="h6">{title}</Typography>}
        {description != null && (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        )}
        {headerContent != null ? headerContent : null}
      </Stack>
      {headerActionsPosition === "title" ? headerActions : null}
    </Stack>
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen={fullScreen}
      slotProps={{
        container: {
          sx: fullScreen
            ? undefined
            : { justifyContent: "flex-end", alignItems: "stretch" },
        },
        paper: { sx: paperSxMerged },
      }}
    >
      <DialogContent
        sx={{
          p: 0,
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
        }}>
        <SideModalHeader>
          <Stack direction="column" alignItems="flex-start" spacing={2}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              width="100%"
            >
              <CloseButton onClick={onClose} disabled={disableClose} size="small">
                <CloseIcon size={16} />
              </CloseButton>
              {headerActionsPosition === "top" ? headerActions : null}
            </Stack>
            {header ?? defaultHeader}
          </Stack>
        </SideModalHeader>

        <SideModalContent direction="column" spacing={2} sx={contentSx}>
          {children}
        </SideModalContent>
      </DialogContent>
    </Dialog>
  );
}
