import { styled } from "@mui/material/styles";
import { TextField } from "@mui/material";

export const BranchAutocompleteField = styled(TextField)(({ theme }) => ({
    "& .MuiOutlinedInput-root": {
        borderRadius: 8,
        backgroundColor: theme.palette.background.paper,
        "& fieldset": {
            borderColor: theme.palette.app.border,
        },
        "&:hover fieldset": {
            borderColor: theme.palette.app.border,
        },
        "&.Mui-focused fieldset": {
            borderColor: theme.palette.primary.main,
        }
    }
}));

