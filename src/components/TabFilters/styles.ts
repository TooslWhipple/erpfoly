import { styled } from "@mui/material/styles";
import { Tab, Tabs } from "@mui/material";
import { theme } from "@/styles/theme";


export const TabsWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  height: 36,
  backgroundColor: theme.palette.app.segmentControl.background,
  borderRadius: 10,
  padding: "0 4px",
  overflowX: "auto",
  overflowY: "hidden",
  maxWidth: "100%",
  WebkitOverflowScrolling: "touch",
  "&::-webkit-scrollbar": {
    display: "none",
  },
  scrollbarWidth: "none",
  [theme.breakpoints.down("md")]: {
    width: "100%",
    minWidth: 0,
  },
}));

export const StyledTabs = styled(Tabs)(({ theme }) => ({
  minHeight: 28,
  height: 28,
  "& .MuiTabs-indicator": {
    display: "none",
  },
  "& .MuiTabs-flexContainer": {
    gap: 0,
    height: 28,
    alignItems: "center",
  },
  "& .MuiTabs-scroller": {
    overflowX: "auto !important",
    overflowY: "hidden",
    WebkitOverflowScrolling: "touch",
    "&::-webkit-scrollbar": {
      display: "none",
    },
    scrollbarWidth: "none",
  },
  [theme.breakpoints.down("md")]: {
    minWidth: 0,
    width: "100%",
    "& .MuiTabs-flexContainer": {
      width: "max-content",
      flexWrap: "nowrap",
    },
    "& .MuiTabs-scroller": {
      overflowX: "auto !important",
      overflowY: "hidden",
    },
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