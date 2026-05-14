import { Grid } from "@mui/material";
import { styled } from "@mui/material/styles";

export const Card = styled('div')(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.app.border}`,
    borderRadius: "16px",
    gap: "16px",
    padding: "16px",
}));

export const GrayCard = styled('div')(({ theme }) => ({
    width: "100%",
    maxHeight: "100vh",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    backgroundColor: theme.palette.background.lowGray,
    borderRadius: "16px",
    gap: "16px",
    padding: "16px 0px",
}));

export const StickySidebarGrid = styled(Grid)(({ theme }) => ({
    position: "sticky",
    top: 0,
    alignSelf: "flex-start",
    zIndex: theme.zIndex.appBar,
    [theme.breakpoints.down("md")]: {
        position: "static",
    },
}));

export const SuggestionsList = styled('div')(({ theme }) => ({
    display: "flex",
    gap: theme.spacing(2),
    overflowX: "auto",
    paddingBottom: theme.spacing(1),
    "&::-webkit-scrollbar": {
        height: 6,
    },
    "&::-webkit-scrollbar-track": {
        backgroundColor: theme.palette.background.default,
        borderRadius: 3,
    },
    "&::-webkit-scrollbar-thumb": {
        backgroundColor: theme.palette.app.border,
        borderRadius: 3,
        "&:hover": {
            backgroundColor: "#D4D4D8",
        },
    },
}));

export const StockCell = styled('div')<{ isLow: boolean }>(({ theme, isLow }) => ({
    fontSize: 14,
    fontWeight: 500,
    color: isLow ? "#EF4444" : "#16A34A",
}));
