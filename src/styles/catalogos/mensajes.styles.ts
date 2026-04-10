import { styled } from "@mui/material/styles";
import { Box, TextField, Chip } from "@mui/material";
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
    backgroundColor: theme.palette.background.content,
  },
}));

export const VariablesSection = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1.5),
  marginTop: theme.spacing(1),
}));

export const VariablesContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  gap: theme.spacing(1),
}));

export const VariableChip = styled(Chip)(({ theme }) => ({
  height: "28px",
  backgroundColor: "#F1F5F9",
  color: theme.palette.text.secondary,
  fontSize: "14px",
  fontWeight: 400,
  padding: "4px 8px",
  borderRadius: "4px",
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
