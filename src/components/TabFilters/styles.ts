import { styled } from "@mui/material/styles";
import { Box, Tab, Tabs } from "@mui/material";
import { colors } from "@/styles/theme";

export const Container = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexDirection: "row",
  gap: "16px",
  [theme.breakpoints.down("md")]: {
    flexDirection: "column-reverse",
    alignItems: "stretch",
    gap: "12px"
  },
}));

export const TabsWrapper = styled(Box)(({ theme }) => ({
  display: "inline-flex",
  alignItems: "center",
  height: 36,
  backgroundColor: colors.segmentControl.background,
  borderRadius: 10,
  padding: "0 4px",
  overflow: "auto",
  maxWidth: "100%",
  "&::-webkit-scrollbar": {
    display: "none",
  },
  scrollbarWidth: "none",
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
    overflow: "auto !important",
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
  color: colors.segmentControl.textInactive,
  whiteSpace: "nowrap",
  minWidth: "auto",
  borderRadius: 8,
  transition: "background-color 0.2s ease, color 0.2s ease, font-weight 0.2s ease, box-shadow 0.2s ease",
  "&.Mui-selected": {
    backgroundColor: colors.background.sidebar,
    color: colors.text.primary,
    fontWeight: 600,
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
  },
  [theme.breakpoints.down("sm")]: {
    padding: "0 12px",
    fontSize: 13,
  },
}));

export const SearchContainer = styled(Box)<{ singleAction?: boolean }>(({ theme, singleAction }) => ({
  flexShrink: 0,
  [theme.breakpoints.down("md")]: {
    width: singleAction ? "auto" : "100%",
    flex: singleAction ? "1 1 auto" : "none",
  },
}));

export const FiltersRightSection = styled(Box)<{ singleAction?: boolean }>(({ theme, singleAction }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "12px",
  [theme.breakpoints.down("md")]: {
    width: "100%",
    flexDirection: (singleAction) ? "row" : "column",
    flexWrap: (singleAction) ? "nowrap" : "wrap",
  },
}));
