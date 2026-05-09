import { styled } from "@mui/material/styles";
import { theme } from "@/styles/theme";

export const RouteDetailPanel = styled("div")(({ theme }) => ({
  flex: 1,
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: 8,
  overflow: "hidden",
}));

export const RouteCard = styled("div")<{ selected?: boolean }>(({ theme, selected }) => ({
  display: "flex",
  backgroundColor: theme.palette.background.paper,
  border: (selected) ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.app.border}`,
  borderRadius: "12px",
  gap: "12px",
  padding: "12px",
  cursor: "pointer",
  transition: "border-color 0.2s, background-color 0.2s",
  "&:hover": {
    borderColor: selected ? theme.palette.primary.main : theme.palette.text.secondary,
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

export const RouteMiniMapThumb = styled("img")({
  width: "88px",
  height: "100%",
  minHeight: 72,
  maxHeight: 120,
  objectFit: "cover",
  borderRadius: "12px",
  flexShrink: 0,
  display: "block",
});

export const DetailMiniMap = styled("img")({
  width: 96,
  height: 96,
  objectFit: "cover",
  borderRadius: 12,
  border: `1px solid ${theme.palette.app.border}`,
});

export const MapPlaceholderLarge = styled("div")(({ theme }) => ({
  width: "100%",
  minHeight: 320,
  backgroundColor: "#E4E4E7",
  borderRadius: 8,
}));

export const DetailHeader = styled("div")({
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  backgroundColor: theme.palette.background.paper,
  padding: "16px 24px",
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: "12px",
});

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
  padding: "12px",
  borderRadius: "12px",
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.app.border}`
}));

export const IconContainer = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "40px",
  height: "40px",
  backgroundColor: "#EFF6FF",
  borderRadius: "4px",
  padding: "8px",
  '& svg': {
    stroke: '#2563EB'
  }
}));