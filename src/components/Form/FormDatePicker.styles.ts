import { styled } from "@mui/material/styles";
import { IconButton } from "@mui/material";

export const StyledOpenPickerButton = styled(IconButton)(({ theme }) => ({
  padding: theme.spacing(0.5),
  marginRight: theme.spacing(0.25),
  color: theme.palette.text.secondary,
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
  "&.Mui-disabled": {
    color: theme.palette.action.disabled,
  },
}));
