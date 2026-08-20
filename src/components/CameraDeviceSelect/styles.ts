import { styled } from "@mui/material/styles";
import { Box, Stack } from "@mui/material";

export const CAMERA_MENU_PROPS = {
  PaperProps: {
    sx: {
      maxWidth: { xs: "calc(100vw - 32px)", sm: 440 },
      "& .MuiMenuItem-root": {
        whiteSpace: "normal",
        overflowWrap: "anywhere",
      },
    },
  },
} as const;

export const CameraSetupRoot = styled(Stack)(({ theme }) => ({
  flex: 1,
  minHeight: 0,
  minWidth: 0,
  width: "100%",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(2),
  padding: theme.spacing(1),
  overflow: "auto",
}));

export const CameraSetupCard = styled(Stack)(({ theme }) => ({
  width: "100%",
  maxWidth: 440,
  minWidth: 0,
  gap: theme.spacing(2),
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: 16,
  [theme.breakpoints.down("sm")]: {
    maxWidth: "100%",
    padding: theme.spacing(0.5, 0, 0),
    backgroundColor: "transparent",
    border: "none",
    borderRadius: 0,
  },
  "@media (orientation: landscape) and (max-height: 560px)": {
    maxWidth: 640,
    padding: theme.spacing(2),
    gap: theme.spacing(1.5),
  },
}));

export const CameraSelectField = styled(Box)(({ theme }) => ({
  width: "100%",
  minWidth: 0,
  "& .MuiInputBase-root": {
    width: "100%",
    minWidth: 0,
    [theme.breakpoints.down("sm")]: {
      height: 44,
    },
  },
  "& .MuiInputBase-root .MuiSelect-select": {
    display: "block",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    paddingRight: theme.spacing(4),
  },
}));

export const CameraIconBadge = styled(Box)(({ theme }) => ({
  width: 56,
  height: 56,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  alignSelf: "center",
  flexShrink: 0,
  backgroundColor: theme.palette.action.hover,
  color: theme.palette.primary.main,
  "@media (orientation: landscape) and (max-height: 560px)": {
    width: 40,
    height: 40,
  },
}));

export const CameraHeaderSelectControl = styled(Box)(({ theme }) => ({
  flex: "0 1 220px",
  minWidth: 0,
  maxWidth: 220,
  marginLeft: "auto",
  "& .MuiInputBase-root": {
    minHeight: 40,
    minWidth: 0,
    backgroundColor: theme.palette.background.paper,
  },
  "& .MuiSelect-select": {
    display: "block",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    paddingLeft: theme.spacing(0.5),
    fontSize: theme.typography.body2.fontSize,
  },
  [theme.breakpoints.down("sm")]: {
    flex: "1 1 100%",
    maxWidth: "100%",
    marginLeft: 0,
    "& .MuiInputBase-root": {
      minHeight: 44,
    },
  },
}));
