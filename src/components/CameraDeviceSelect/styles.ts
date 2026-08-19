import { styled } from "@mui/material/styles";
import { Box, Stack } from "@mui/material";

export const CameraSetupRoot = styled(Stack)(({ theme }) => ({
  flex: 1,
  minHeight: 0,
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
  flexShrink: 0,
  minWidth: 148,
  maxWidth: 220,
  marginLeft: "auto",
  "& .MuiInputBase-root": {
    minHeight: 40,
    backgroundColor: theme.palette.background.paper,
  },
  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    paddingLeft: theme.spacing(0.5),
    fontSize: theme.typography.body2.fontSize,
  },
}));
