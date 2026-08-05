import { Button, Skeleton, Stack, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { theme } from "@/styles/theme";

export const RutasPageLayout = styled(Stack)({
  flex: 1,
  minHeight: 0,
  height: "100%",
  overflow: "hidden",
});

export const RoutesSidebar = styled(Stack)(({ theme }) => ({
  flex: "0 0 272px",
  maxWidth: 272,
  minHeight: 0,
  minWidth: 260,
  gap: theme.spacing(1),
  [theme.breakpoints.down("md")]: {
    flex: "0 0 auto",
    maxWidth: "100%",
  },
}));

export const SidebarHeaderRow = styled(Stack)(({ theme }) => ({
  flexDirection: "column",
  gap: theme.spacing(1),
  flexShrink: 0,
  [theme.breakpoints.down("md")]: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(1.5),
  },
}));

export const NewRouteButton = styled(Button)(({ theme }) => ({
  width: "100%",
  [theme.breakpoints.down("md")]: {
    width: "auto",
    flexShrink: 0,
    whiteSpace: "nowrap",
  },
}));

export const DateHeaderRow = styled(Stack)(({ theme }) => ({
  flexDirection: "row",
  alignItems: "center",
  flexWrap: "nowrap",
  minWidth: 260,
  gap: theme.spacing(1),
  flexShrink: 0,
  [theme.breakpoints.down("md")]: {
    flex: 1,
    minWidth: 0,
  },
}));

export const DateLabel = styled(Typography)({
  fontWeight: 500,
  textOverflow: "ellipsis",
  overflow: "hidden",
  whiteSpace: "nowrap",
  flex: 1,
});

export const RoutesList = styled(Stack)(({ theme }) => ({
  flex: 1,
  minHeight: 0,
  overflowY: "auto",
  gap: theme.spacing(1),
  [theme.breakpoints.down("md")]: {
    flexDirection: "row",
    overflowX: "auto",
    overflowY: "hidden",
    alignItems: "stretch",
    paddingBottom: theme.spacing(1),
  },
}));

export const RouteDetailPanel = styled(Stack)({
  flex: 1,
  minWidth: 0,
  minHeight: 0,
  overflow: "auto",
});

export const RoundedSkeleton = styled(Skeleton)({
  borderRadius: 8,
});

export const RouteCard = styled("div")<{ selected?: boolean }>(({ theme, selected }) => ({
  display: "flex",
  flexShrink: 0,
  minHeight: 96,
  backgroundColor: theme.palette.background.paper,
  border: (selected) ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.app.border}`,
  borderRadius: "12px",
  gap: "12px",
  padding: "12px",
  cursor: "pointer",
  overflow: "hidden",
  transition: "border-color 0.2s, background-color 0.2s",
  [theme.breakpoints.down("md")]: {
    width: 280,
    minWidth: 280,
  },
  "&:hover": {
    borderColor: selected ? theme.palette.primary.main : theme.palette.text.secondary,
  },
  ...(selected && {
    backgroundColor: `${theme.palette.primary.main}08`,
  }),
}));

export const MapPlaceholder = styled("div")(({ theme }) => ({
  width: "88px",
  height: 88,
  minHeight: 72,
  flexShrink: 0,
  alignSelf: "flex-start",
  backgroundColor: "#E4E4E7",
  borderRadius: "12px",
  [theme.breakpoints.down("sm")]: {
    width: 64,
    height: 64,
  },
}));

export const RouteMiniMapThumb = styled("img")({
  width: "88px",
  height: 88,
  minHeight: 72,
  maxHeight: 120,
  objectFit: "contain",
  backgroundColor: theme.palette.grey[100],
  borderRadius: "12px",
  border: `1px solid ${theme.palette.app.border}`,
  flexShrink: 0,
  alignSelf: "flex-start",
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
