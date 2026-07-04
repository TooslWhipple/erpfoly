import { styled, alpha } from "@mui/material/styles";
import {
  Typography,
  IconButton,
  DialogContent as MuiDialogContent,
  Box,
} from "@mui/material";

export type ConfirmModalType = "primary" | "warning" | "error" | "success";

export const DialogContent = styled(MuiDialogContent)(({ theme }) => ({
  padding: theme.spacing(3),
  display: "flex",
  flexDirection: "column",
  gap: 0,
  "&:first-of-type": {
    paddingTop: theme.spacing(3),
  },
}));

export const ModalHeader = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
}));

export const ModalHeaderContent = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "flex-start",
  gap: theme.spacing(2),
  flex: 1,
  minWidth: 0,
}));

export const ModalTextBlock = styled("div")({
  display: "flex",
  flexDirection: "column",
  flex: 1,
  minWidth: 0,
});

export const IconBadge = styled(Box, {
  shouldForwardProp: (prop) => prop !== "modalType",
})<{ modalType: ConfirmModalType }>(({ theme, modalType }) => {
  const paletteMap = {
    primary: theme.palette.primary,
    warning: theme.palette.warning,
    error: theme.palette.error,
    success: theme.palette.success,
  } as const;
  const palette = paletteMap[modalType];

  return {
    width: 44,
    height: 44,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    backgroundColor: alpha(palette.main, 0.12),
    color: palette.main,
  };
});

export const ModalTitle = styled(Typography)(({ theme }) => ({
  fontSize: "1.25rem",
  fontWeight: 600,
  color: theme.palette.text.primary,
  lineHeight: 1.3,
}));

export const ModalDescription = styled("div")(({ theme }) => ({
  fontSize: "0.875rem",
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(0.75),
  lineHeight: 1.5,
}));

export const ItemNameHighlight = styled("span")(({ theme }) => ({
  fontWeight: 600,
  color: theme.palette.text.primary,
}));

export const CloseButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(-0.5),
  marginRight: theme.spacing(-0.5),
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));
