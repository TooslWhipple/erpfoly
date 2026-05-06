import { styled } from "@mui/material/styles";
import { Tab, Tabs } from "@mui/material";

export const TabsWrapper = styled('div')(({ theme }) => ({
  display: "flex",
  justifyContent: "flex-start",
  alignItems: "center",
  height: 36,
  // Fits tab labels when narrow; never wider than the parent (narrow cards/modals).
  width: "min(100%, max-content)",
  maxWidth: "100%",
  minWidth: 0,
  boxSizing: "border-box",
  backgroundColor: theme.palette.app.segmentControl.background,
  borderRadius: 10,
  padding: "0 4px",
  overflowX: "auto",
  overflowY: "hidden",
  WebkitOverflowScrolling: "touch",
  "&::-webkit-scrollbar": {
    display: "none",
  },
  scrollbarWidth: "none",
}));

export const StyledTabs = styled(Tabs)(() => ({
  minHeight: 28,
  height: 28,
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
  overflow: "hidden",
  boxSizing: "border-box",
  "& .MuiTabs-indicator": {
    display: "none",
  },
  "& .MuiTabs-flexContainer": {
    gap: 0,
    height: 28,
    alignItems: "center",
    width: "max-content",
    flexWrap: "nowrap",
  },
  "& .MuiTabs-scroller": {
    overflowX: "auto !important",
    overflowY: "hidden",
    maxWidth: "100%",
    minWidth: 0,
    WebkitOverflowScrolling: "touch",
    "&::-webkit-scrollbar": {
      display: "none",
    },
    scrollbarWidth: "none",
  },
}));

export const StyledTab = styled(Tab)(({ theme }) => ({
  minHeight: 28,
  height: 28,
  padding: "0 16px",
  textTransform: "none",
  fontSize: 14,
  lineHeight: 20,
  fontWeight: 400,
  color: theme.palette.app.segmentControl.textInactive,
  whiteSpace: "nowrap",
  minWidth: "auto",
  borderRadius: 8,
  transition: "background-color 0.2s ease, color 0.2s ease, font-weight 0.2s ease, box-shadow 0.2s ease",
  "&.Mui-selected": {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    fontWeight: 600,
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
  },
  [theme.breakpoints.down("sm")]: {
    padding: "0 12px",
    fontSize: 13,
  },
  [theme.breakpoints.down("md")]: {
    flex: "0 0 auto",
    minWidth: "auto",
    maxWidth: "none",
  },
}));