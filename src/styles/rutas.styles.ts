import { styled } from "@mui/material/styles";
import { colors } from "@/styles/theme";

export const PageContent = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(3),
  flex: 1,
  minHeight: 0,
  [theme.breakpoints.down("lg")]: {
    flexDirection: "column",
  },
}));

export const RouteListPanel = styled("div")(({ theme }) => ({
  width: 320,
  flexShrink: 0,
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
  [theme.breakpoints.down("lg")]: {
    width: "100%",
  },
}));

export const RouteDetailPanel = styled("div")(({ theme }) => ({
  flex: 1,
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  backgroundColor: colors.background.sidebar,
  border: `1px solid ${colors.border}`,
  borderRadius: 8,
  overflow: "hidden",
}));

export const RouteCard = styled("div")<{ selected?: boolean }>(({ theme, selected }) => ({
  display: "flex",
  backgroundColor: colors.background.sidebar,
  border: (selected) ? `2px solid ${theme.palette.primary.main}` : `1px solid ${colors.border}`,
  borderRadius: "12px",
  gap: "12px",
  padding: "12px",
  cursor: "pointer",
  transition: "border-color 0.2s, background-color 0.2s",
  "&:hover": {
    borderColor: selected ? theme.palette.primary.main : colors.text.secondary,
  },
  ...(selected && {
    backgroundColor: `${theme.palette.primary.main}08`,
  }),
}));

export const MapPlaceholder = styled("div")(({ theme }) => ({
  width: "88px",
  height: "100%",
  flexShrink: 0,
  backgroundColor: "#E4E4E7",
  borderRadius: "12px",
  [theme.breakpoints.down("sm")]: {
    width: 64
  },
}));

export const MapPlaceholderLarge = styled("div")(({ theme }) => ({
  width: "100%",
  minHeight: 320,
  backgroundColor: "#E4E4E7",
  borderRadius: 8,
}));

export const DetailHeader = styled("div")(({ theme }) => ({
  padding: theme.spacing(2, 3),
  borderBottom: `1px solid ${colors.border}`,
}));

export const TabContent = styled("div")(({ theme }) => ({
  padding: theme.spacing(2, 3),
  flex: 1,
  overflow: "auto",
}));

export const DriverSection = styled("div")(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

export const PersonRow = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(1.5, 2),
  backgroundColor: colors.background.sidebar,
  border: `1px solid ${colors.border}`,
  borderRadius: 8,
  marginBottom: theme.spacing(1),
}));
