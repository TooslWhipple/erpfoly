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
        },
    },
}));

export const RoutePreviewCard = styled("div")(({ theme }) => ({
    display: "flex",
    flexDirection: "row",
    alignItems: "stretch",
    gap: theme.spacing(1.5),
    padding: theme.spacing(2),
    borderRadius: 12,
    border: `1px solid ${theme.palette.app.border}`,
    backgroundColor: theme.palette.background.paper,
    [theme.breakpoints.down("sm")]: {
        display: "grid",
        gridTemplateColumns: "1fr",
        gridTemplateRows: "1fr auto 1fr",
        alignItems: "stretch",
        width: "100%",
    },
}));

export const BranchPreviewCard = styled("div")(({ theme }) => ({
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: theme.spacing(0.5),
    padding: theme.spacing(1.5),
    borderRadius: 10,
    minWidth: 0,
    backgroundColor: theme.palette.background.lowerGray,
    border: `1px solid ${theme.palette.app.border}`,
    [theme.breakpoints.down("sm")]: {
        width: "100%",
        minHeight: 88,
    },
}),
);

export const RouteArrow = styled("div")(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: theme.palette.text.secondary,
    flexShrink: 0,
    [theme.breakpoints.down("sm")]: {
        transform: "rotate(90deg)",
        justifySelf: "center",
        padding: theme.spacing(0.5, 0),
    },
}));
