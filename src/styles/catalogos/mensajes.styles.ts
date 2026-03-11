import { styled } from "@mui/material/styles";
import { Box, TextField, Typography, Chip, Button } from "@mui/material";
import { colors } from "@/styles/theme";

export const MessageFormContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(3),
}));

export const MessageFormHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: theme.spacing(1),
}));

export const MessageFormTopRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  flex: 1,
}));

export const StatusIndicator = styled(Box, {
  shouldForwardProp: (prop) => prop !== "variant",
})<{ variant?: "active" | "inactive" }>(({ theme, variant = "active" }) => {
  const isActive = variant === "active";
  return {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.75),
    padding: `${theme.spacing(0.5)} ${theme.spacing(1)}`,
    borderRadius: theme.shape.borderRadius,
    fontSize: "0.875rem",
    fontWeight: 500,
    backgroundColor: isActive ? "#DCFCE7" : theme.palette.action.hover,
    color: isActive ? "#166534" : theme.palette.text.secondary,
    "&::before": {
      content: '""',
      width: 8,
      height: 8,
      borderRadius: "50%",
      flexShrink: 0,
      backgroundColor: isActive ? "#22C55E" : theme.palette.text.disabled,
    },
  };
});

export const MessageNameInput = styled(TextField)(() => ({
  flex: 1,
  "& .MuiOutlinedInput-root": {
    backgroundColor: colors.background.sidebar,
    "& fieldset": {
      borderColor: colors.border,
    },
    "&:hover fieldset": {
      borderColor: colors.border,
    },
    "&.Mui-focused fieldset": {
      borderColor: colors.sidebar.textSelected,
    },
  },
}));

export const SaveButton = styled(Button)(() => ({
  height: 40,
  minWidth: 100,
  fontWeight: 600,
}));

export const ContentSection = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1.5),
}));

export const ContentTitle = styled(Typography)(({ theme }) => ({
  fontSize: "1rem",
  fontWeight: 600,
  color: theme.palette.text.primary,
}));

export const ContentTextarea = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    backgroundColor: colors.background.sidebar,
    "& fieldset": {
      borderColor: colors.border,
    },
    "&:hover fieldset": {
      borderColor: colors.border,
    },
    "&.Mui-focused fieldset": {
      borderColor: colors.sidebar.textSelected,
    },
  },
  "& .MuiInputBase-input": {
    minHeight: "120px",
    padding: theme.spacing(1.5),
  },
}));

export const VariablesSection = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1.5),
  marginTop: theme.spacing(1),
}));

export const VariablesInstruction = styled(Typography)(({ theme }) => ({
  fontSize: "0.875rem",
  color: theme.palette.text.secondary,
}));

export const VariablesContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  gap: theme.spacing(1),
}));

export const VariableChip = styled(Chip)(({ theme }) => ({
  height: 32,
  backgroundColor: colors.background.sidebar,
  border: `1px solid ${colors.border}`,
  color: theme.palette.text.primary,
  fontSize: "0.875rem",
  fontWeight: 500,
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
    borderColor: colors.sidebar.textSelected,
  },
  "& .MuiChip-label": {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
  "& .MuiChip-icon": {
    marginLeft: theme.spacing(0.5),
    marginRight: 0,
    color: theme.palette.text.secondary,
    fontSize: "1rem",
  },
}));

export const VariableHighlight = styled("span")(({ theme }) => ({
  display: "inline",
  backgroundColor: theme.palette.primary.main + "20",
  color: theme.palette.primary.dark,
  padding: 0,
  borderRadius: 2,
  fontWeight: "inherit",
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  verticalAlign: "baseline",
}));

export const HighlightOverlay = styled(Box)(() => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  overflow: "auto",
  pointerEvents: "none",
  whiteSpace: "pre-wrap",
  wordWrap: "break-word",
  font: "inherit",
  fontSize: "inherit",
  lineHeight: "inherit",
  letterSpacing: "inherit",
  "& *": {
    font: "inherit",
    fontSize: "inherit",
    lineHeight: "inherit",
    fontWeight: "inherit",
  },
}));

export const HighlightOverlayWrapper = styled(Box)(() => ({
  position: "relative",
  "& .highlight-input-overlay": {
    minHeight: 120,
  },
}));
