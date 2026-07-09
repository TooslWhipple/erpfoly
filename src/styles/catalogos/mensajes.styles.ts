import { styled } from "@mui/material/styles";
import { TextField, Chip } from "@mui/material";
import { theme } from "@/styles/theme";

export const MessageFormContainer = styled('div')({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(3),
});

export const MessageFormHeader = styled('div')({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: theme.spacing(1),
});

export const MessageFormTopRow = styled('div')({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  flex: 1,
});

export const MessageNameInput = styled(TextField)({
  flex: 1,
  "& .MuiOutlinedInput-root": {
    backgroundColor: theme.palette.background.paper,
    "& fieldset": {
      borderColor: theme.palette.app.border,
    },
    "&:hover fieldset": {
      borderColor: theme.palette.app.border,
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.app.sidebar.textSelected,
    },
  },
});

export const ContentTextarea = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    backgroundColor: theme.palette.background.paper,
    "& fieldset": {
      borderColor: theme.palette.app.border,
    },
    "&:hover fieldset": {
      borderColor: theme.palette.app.border,
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.app.sidebar.textSelected,
    },
  },
  "& .MuiInputBase-input": {
    minHeight: "120px",
    padding: theme.spacing(1.5),
    backgroundColor: theme.palette.background.content,
  },
});

export const VariablesSection = styled('div')({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1.5),
  marginTop: theme.spacing(1),
});

export const VariablesContainer = styled('div')({
  display: "flex",
  flexWrap: "wrap",
  gap: theme.spacing(1),
});

export const VariableChip = styled(Chip)({
  height: "28px",
  backgroundColor: "#F1F5F9",
  color: theme.palette.text.secondary,
  fontSize: "14px",
  fontWeight: 400,
  padding: "4px 8px",
  borderRadius: "4px",
});

export const VariableHighlight = styled("span")({
  display: "inline",
  backgroundColor: theme.palette.primary.main + "20",
  color: theme.palette.primary.dark,
  padding: 0,
  borderRadius: 2,
  fontWeight: "inherit",
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  verticalAlign: "baseline",
});

export const HighlightOverlay = styled('div')({
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
});

export const HighlightOverlayWrapper = styled('div')({
  position: "relative",
  "& .highlight-input-overlay": {
    minHeight: 120,
  },
});

export const FormContent = styled('div')({
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  border: "1px solid #e0e0e0",
  borderRadius: "16px",
  padding: "24px",
  backgroundColor: "white",
  [theme.breakpoints.down("sm")]: {
    padding: "0px",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "0px",
  }
});
