import { styled } from "@mui/material/styles";
import { Box, Button, TextField } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { colors } from "@/styles/theme";

export const ControlsContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
  [theme.breakpoints.down("md")]: {
    width: "100%",
  },
}));

export const SearchInput = styled(TextField)({
  width: 280,
  "& .MuiOutlinedInput-root": {
    height: 40,
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
});

export const CreateButton = styled(Button)({
  height: 40,
  whiteSpace: "nowrap",
});

export const SearchIconStyled = styled(SearchIcon)({
  width: 18,
  height: 18,
  color: colors.chip.text,
});
