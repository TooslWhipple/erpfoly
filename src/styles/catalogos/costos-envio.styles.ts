import { Box, Divider, IconButton, TextField, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

export const MainContent = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "420px 1fr",
  gap: theme.spacing(2),
  [theme.breakpoints.down("lg")]: {
    gridTemplateColumns: "1fr",
  },
}));

export const LeftPanel = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: 8,
  padding: theme.spacing(3),
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
  maxHeight: 640,
  overflowY: "auto",
}));

export const RightPanel = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: 8,
  overflow: "hidden",
  minHeight: 640,
}));

export const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: 15,
  fontWeight: 700,
  color: theme.palette.text.primary,
}));

export const SectionSubtitle = styled(Typography)(({ theme }) => ({
  fontSize: 13,
  color: theme.palette.text.secondary,
}));

export const PriceInput = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    backgroundColor: theme.palette.background.paper,
  },
}));

export const ZoneList = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1.5),
}));

export const ZoneCard = styled(Box, {
  shouldForwardProp: (prop) => prop !== "selected",
})<{ selected?: boolean }>(({ theme, selected }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1.25),
  padding: theme.spacing(1.5, 1.75),
  borderRadius: 12,
  border: `1px solid ${
    selected ? theme.palette.primary.main : theme.palette.app.border
  }`,
  backgroundColor: theme.palette.background.paper,
}));

export const ZoneCardHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "flex-start",
  gap: theme.spacing(1),
  minWidth: 0,
}));

export const ZoneCardBody = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "1fr auto",
  gap: theme.spacing(1.25),
  alignItems: "end",
}));

export const ZoneField = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: 4,
  minWidth: 0,
});

export const ZoneFieldLabel = styled(Typography)(({ theme }) => ({
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: theme.palette.text.secondary,
  lineHeight: 1.2,
}));

export const ZoneName = styled(TextField)(({ theme }) => ({
  flex: 1,
  minWidth: 0,
  "& .MuiOutlinedInput-root": {
    backgroundColor: theme.palette.background.paper,
    borderRadius: 8,
  },
  "& .MuiOutlinedInput-input": {
    fontWeight: 600,
    fontSize: 14,
    padding: theme.spacing(1, 1.25),
  },
}));

export const ZonePriceInput = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    backgroundColor: theme.palette.background.paper,
    borderRadius: 8,
  },
  "& .MuiOutlinedInput-input": {
    fontSize: 14,
    padding: theme.spacing(1, 1.25),
  },
}));

export const ZoneColorPicker = styled(Box)(({ theme }) => ({
  position: "relative",
  width: 44,
  height: 40,
  borderRadius: 8,
  border: `1px solid ${theme.palette.app.border}`,
  backgroundColor: theme.palette.background.paper,
  overflow: "hidden",
  transition: theme.transitions.create(["border-color"], {
    duration: theme.transitions.duration.shorter,
  }),
  "&:hover": {
    borderColor: theme.palette.text.disabled,
  },
  "& input[type='color']": {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    padding: 0,
    margin: 0,
    border: "none",
    cursor: "pointer",
    backgroundColor: "transparent",
    WebkitAppearance: "none",
    appearance: "none",
    "&::-webkit-color-swatch-wrapper": {
      padding: 4,
    },
    "&::-webkit-color-swatch": {
      border: "none",
      borderRadius: 4,
    },
    "&::-moz-color-swatch": {
      border: "none",
      borderRadius: 4,
    },
    "&:disabled": {
      cursor: "not-allowed",
      opacity: 0.5,
    },
  },
}));

export const ZoneActionGroup = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(0.25),
  padding: theme.spacing(0.25),
  borderRadius: 8,
  backgroundColor: theme.palette.background.lowerGray,
  flexShrink: 0,
}));

export const ZoneActionButton = styled(IconButton)(({ theme }) => ({
  width: 32,
  height: 32,
  borderRadius: 6,
  color: theme.palette.text.secondary,
  "&:hover": {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
  },
  "&.Mui-disabled": {
    opacity: 0.4,
  },
}));

export const ZoneActionButtonDanger = styled(ZoneActionButton)(({ theme }) => ({
  "&:hover": {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
  },
}));

export const ZoneEmptyState = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(0.5),
  padding: theme.spacing(4, 2),
  borderRadius: 12,
  border: `1px dashed ${theme.palette.app.border}`,
  backgroundColor: theme.palette.background.lowerGray,
  textAlign: "center",
}));

export const ZoneHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing(1),
}));

export const DividerSpace = styled(Divider)(({ theme }) => ({
  marginTop: theme.spacing(0.5),
  marginBottom: theme.spacing(0.5),
}));
