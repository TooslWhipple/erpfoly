import { styled } from "@mui/material/styles";
import { Box, Button, Select, Tab, Tabs, TextField } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { colors } from "@/styles/theme";

export const Container = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  flexDirection: "row",
  marginBottom: theme.spacing(3),
  borderBottom: `1px solid ${colors.border}`,
  gap: theme.spacing(2),
  [theme.breakpoints.down("md")]: {
    flexDirection: "column-reverse",
    alignItems: "stretch",
    gap: theme.spacing(1.5),
  },
}));

export const TabsWrapper = styled(Box)(({ theme }) => ({
  overflow: "auto",
  maxWidth: "100%",
  "&::-webkit-scrollbar": {
    display: "none",
  },
  scrollbarWidth: "none",
}));

export const StyledTabs = styled(Tabs)(({ theme }) => ({
  minHeight: 40,
  "& .MuiTabs-indicator": {
    backgroundColor: colors.sidebar.textSelected,
    bottom: 0,
  },
  "& .MuiTabs-flexContainer": {
    [theme.breakpoints.down("sm")]: {
      gap: 0,
    },
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
  minHeight: 40,
  padding: "8px 16px",
  textTransform: "none",
  fontSize: 14,
  fontWeight: 500,
  color: "text.secondary",
  whiteSpace: "nowrap",
  minWidth: "auto",
  "&.Mui-selected": {
    color: colors.sidebar.textSelected,
  },
  [theme.breakpoints.down("sm")]: {
    padding: "8px 12px",
    fontSize: 13,
  },
}));

export const SearchContainer = styled(Box)<{ singleAction?: boolean }>(({ theme, singleAction }) => ({
  paddingBottom: theme.spacing(1),
  flexShrink: 0,
  [theme.breakpoints.down("md")]: {
    paddingBottom: 0,
    width: singleAction ? "auto" : "100%",
    flex: singleAction ? "1 1 auto" : "none",
  },
}));

// SearchInput uses TextField with inline styles from theme

export const SearchIconStyled = styled(SearchIcon)({
  width: 18,
  height: 18,
  color: "#71717A",
});

export const FiltersRightSection = styled(Box)<{ singleAction?: boolean }>(({ theme, singleAction }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(1.5),
  paddingBottom: theme.spacing(1),
  [theme.breakpoints.down("md")]: {
    paddingBottom: 0,
    width: "100%",
    flexDirection: singleAction ? "row" : "column",
    flexWrap: singleAction ? "nowrap" : "wrap",
  },
}));

// ActionButton uses Button with inline styles from theme

// StyledSelect uses Select with inline styles from theme
