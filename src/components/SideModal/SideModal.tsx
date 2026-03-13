"use client";

import { Dialog, useMediaQuery, useTheme, Stack, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
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
  const paperSxMerged: SxProps<Theme> | undefined = paperSx
    ? ((defaultPaper ? [defaultPaper, paperSx] : paperSx) as SxProps<Theme>)
    : defaultPaper;

  const defaultHeader = (
    <Stack
      direction="row"
      spacing={2}
      justifyContent="space-between"
      alignItems="center"
      sx={{ width: "100%" }}
    >
      <Stack spacing={0.5}>
        {title != null && <Typography variant="h6">{title}</Typography>}
        {description != null && (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        )}
      </Stack>
      {headerActions}
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
      <DialogContent sx={{ p: 0, display: "flex", flexDirection: "column", flex: 1 }}>
        <SideModalHeader>
          <Stack direction="column" alignItems="flex-start" spacing={2}>
            <CloseButton onClick={onClose} disabled={disableClose} size="small">
              <CloseIcon />
            </CloseButton>
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
