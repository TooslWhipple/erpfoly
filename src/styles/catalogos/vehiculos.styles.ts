import { styled } from "@mui/material/styles";

export const FormCard = styled("div")(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.app.border}`,
    borderRadius: "16px",
    padding: theme.spacing(3),
    gap: theme.spacing(2),
    [theme.breakpoints.down("md")]: {
        padding: theme.spacing(2),
    },
}));
