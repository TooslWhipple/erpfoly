import { styled } from "@mui/material/styles";
import {
  Box,
  Button,
  Checkbox,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";

export const MenuContainer = styled(Box)(({ theme }) => ({
  minWidth: 280,
  maxWidth: 320,
  backgroundColor: theme.palette.app.background.sidebar,
}));

export const MenuHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.app.border}`,
}));

export const MenuTitle = styled(Typography)(({ theme }) => ({
  fontSize: "0.875rem",
  fontWeight: 600,
  color: theme.palette.text.primary,
}));

export const ClearButton = styled(Button)(({ theme }) => ({
  minWidth: "auto",
  padding: "4px 8px",
  fontSize: "0.875rem",
  fontWeight: 400,
  color: theme.palette.text.secondary,
  textTransform: "none",
  "&:hover": {
    backgroundColor: "transparent",
    color: theme.palette.app.sidebar.textSelected,
  },
}));

export const OptionsList = styled(List)({
  padding: 0,
  maxHeight: 400,
  overflowY: "auto",
});

export const StyledListItem = styled(ListItem)({
  padding: 0,
});

export const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  "&:hover": {
    backgroundColor: theme.palette.app.background.main,
  },
}));

export const StyledCheckbox = styled(Checkbox)(({ theme }) => ({
  padding: "4px",
  color: theme.palette.app.border,
  "&.Mui-checked": {
    color: theme.palette.app.sidebar.textSelected,
  },
}));

export const OptionLabel = styled(ListItemText)(({ theme }) => ({
  "& .MuiListItemText-primary": {
    fontSize: "0.875rem",
    fontWeight: 400,
    color: theme.palette.text.primary,
  },
}));
