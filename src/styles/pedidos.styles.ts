import { styled } from "@mui/material/styles";

export const PageContent = styled('div')(({ theme }) => ({
    display: "flex",
    gap: theme.spacing(3),
    [theme.breakpoints.down("lg")]: {
        flexDirection: "column",
    },
}));

export const SidebarPanel = styled('div')(({ theme }) => ({
    width: 400,
    flexShrink: 0,
    [theme.breakpoints.down("lg")]: {
        width: "100%",
    },
}));

export const TabsWrapper = styled('div')(({ theme }) => ({
    marginBottom: theme.spacing(3),
}));
