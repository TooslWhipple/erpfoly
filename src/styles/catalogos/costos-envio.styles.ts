import { Box, Divider, TextField, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

export const PageHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
}));

export const PageTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
  fontSize: "1.75rem",
  fontWeight: 700,
}));

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
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: 8,
}));

export const ZoneItem = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  padding: theme.spacing(1.25, 1.5),
}));

export const ZoneColor = styled("span")({
  width: 16,
  height: 16,
  borderRadius: 4,
  display: "inline-block",
  border: "1px solid rgba(0,0,0,0.12)",
  flexShrink: 0,
});

export const ZoneName = styled(TextField)(({ theme }) => ({
  flex: 1,
  minWidth: 0,
  "& .MuiOutlinedInput-root": {
    backgroundColor: theme.palette.background.paper,
  },
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
