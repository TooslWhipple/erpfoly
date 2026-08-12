import { styled } from "@mui/material/styles";
import { Button, Typography } from "@mui/material";

export const PageContainer = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2.5),
}));

export const PageHeaderRow = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: theme.spacing(2),
  flexWrap: "wrap",
}));

export const HeaderActions = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
  flexShrink: 0,
  [theme.breakpoints.down("sm")]: {
    width: "100%",
    justifyContent: "flex-end",
  },
}));

export const SaveButton = styled(Button)(({ theme }) => ({
  minWidth: 120,
  textTransform: "none",
  fontWeight: 500,
  [theme.breakpoints.down("sm")]: {
    width: "100%",
  },
}));

export const TabsSection = styled("div")({
  display: "inline-flex",
  maxWidth: "100%",
});

export const ContentLayout = styled("div")(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) minmax(320px, 360px)",
  gap: theme.spacing(2.5),
  alignItems: "flex-start",
  [theme.breakpoints.down("lg")]: {
    gridTemplateColumns: "1fr",
  },
}));

export const MainPanel = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
  minWidth: 0,
}));

export const FormCard = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
  padding: theme.spacing(2.5),
  borderRadius: 16,
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.app.border}`,
}));

export const SummaryPanel = styled("aside")(({ theme }) => ({
  position: "sticky",
  top: theme.spacing(2),
  [theme.breakpoints.down("lg")]: {
    position: "static",
  },
}));

export const SummaryCard = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2.5),
  padding: theme.spacing(3),
  minHeight: 180,
  borderRadius: 16,
  backgroundColor: theme.palette.background.lowerBlue,
  border: `1px solid ${theme.palette.app.border}`,
}));

export const SummaryTitle = styled(Typography)(({ theme }) => ({
  fontSize: "1rem",
  fontWeight: 600,
  color: theme.palette.text.primary,
}));

export const SectionHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing(2),
  flexWrap: "wrap",
}));
