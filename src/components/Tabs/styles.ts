import { styled } from "@mui/material/styles";
import { Box, Tab, Tabs } from "@mui/material";
import { colors } from "@/styles/theme";

interface TabsContainerProps {
  fullWidth?: boolean;
  withBorder?: boolean;
}

export const TabsContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== "fullWidth" && prop !== "withBorder",
})<TabsContainerProps>(({ theme, fullWidth, withBorder = true }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  flexDirection: "row",
  borderBottom: withBorder ? `1px solid ${colors.border}` : "none",
  gap: theme.spacing(2),
  width: fullWidth ? "100%" : "auto",
  [theme.breakpoints.down("md")]: {
    flexDirection: "column-reverse",
    alignItems: "stretch",
    gap: theme.spacing(1.5),
  },
}));

export const TabsWrapper = styled(Box)({
  overflow: "auto",
  maxWidth: "100%",
  "&::-webkit-scrollbar": {
    display: "none",
  },
  scrollbarWidth: "none",
});

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

export const TabsRightSection = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
  paddingBottom: theme.spacing(1),
  [theme.breakpoints.down("md")]: {
    paddingBottom: 0,
    width: "100%",
  },
}));
