import { styled } from "@mui/material/styles";
import { IconButton, TextField } from "@mui/material";
import { theme } from "@/styles/theme";

export const Card = styled("div")({
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "16px",
    borderTop: `1px solid ${theme.palette.app.border}`
});

export const ProductIconPlaceholder = styled("div")({
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    backgroundColor: theme.palette.app.chip.background,
    border: `1px solid ${theme.palette.app.border}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
});

export const DeliveryDateField = styled(TextField)(({ theme }) => ({
    flex: 2,
    "& .MuiInputBase-root": {
        borderRadius: 8,
        backgroundColor: theme.palette.background.paper,
        "& fieldset": {
            borderColor: theme.palette.app.border,
        },
    },
    "& .MuiInputBase-input": {
        padding: theme.spacing(1, 1.5),
        fontSize: "0.875rem",
    },
}));

export const QuantityControls = styled("div")(({ theme }) => ({
    flex: 2,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    border: `1px solid ${theme.palette.app.border}`,
    borderRadius: "8px",
    overflow: "hidden",
    backgroundColor: theme.palette.background.paper,
}));

