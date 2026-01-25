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

export const SearchContainer = styled(Box)(({ theme }) => ({
  paddingBottom: theme.spacing(1),
  flexShrink: 0,
  [theme.breakpoints.down("md")]: {
    paddingBottom: 0,
    width: "100%",
  },
}));

export const SearchInput = styled(TextField)(({ theme }) => ({
  width: 280,
  [theme.breakpoints.down("md")]: {
    width: "100%",
  },
  "& .MuiOutlinedInput-root": {
    backgroundColor: colors.background.sidebar,
    "& fieldset": {
      borderColor: colors.border,
    },
    "&:hover fieldset": {
      borderColor: colors.border,
    },
    "&.Mui-focused fieldset": {
      borderColor: colors.sidebar.textSelected,
    },
  },
}));

export const SearchIconStyled = styled(SearchIcon)({
  width: 18,
  height: 18,
  color: "#71717A",
});

export const FiltersRightSection = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(1.5),
  paddingBottom: theme.spacing(1),
  [theme.breakpoints.down("md")]: {
    paddingBottom: 0,
    width: "100%",
    flexDirection: "column",
  },
}));

export const ActionButton = styled(Button)(({ theme }) => ({
  height: 40,
  minWidth: 100,
  textTransform: "none",
  fontWeight: 500,
  flexShrink: 0,
  marginBottom: theme.spacing(1),
  [theme.breakpoints.down("md")]: {
    marginBottom: 0,
  },
}));

export const StyledSelect = styled(Select)(({ theme }) => ({
  minWidth: 140,
  backgroundColor: colors.background.sidebar,
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: colors.border,
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: colors.border,
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: colors.sidebar.textSelected,
  },
  [theme.breakpoints.down("md")]: {
    width: "100%",
  },
}));
