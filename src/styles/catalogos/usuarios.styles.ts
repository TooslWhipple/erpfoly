import { styled } from "@mui/material/styles";
import { Typography } from "@mui/material";
import { theme } from "@/styles/theme";

export const FormCard = styled('div')({
    display: "flex",
    flexDirection: "column",
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.app.border}`,
    borderRadius: "16px",
    padding: "24px",
    gap: "16px"
});

export const HelperTextLink = styled(Typography)(({ theme }) => ({
    fontSize: "0.875rem",
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(1),
    "& a": {
        color: theme.palette.primary.main,
        textDecoration: "none",
        fontWeight: 500,
        "&:hover": {
            textDecoration: "underline",
        },
    },
}));
