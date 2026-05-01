import { styled } from "@mui/material/styles";
import { theme } from "@/styles/theme";

export const PageContainer = styled("div")(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    marginTop: "16px",
    gap: "24px"
}));

export const OriginDestinationRow = styled("div")(({ theme }) => ({
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "16px",
    backgroundColor: theme.palette.background.paper,
    borderRadius: "12px",
    padding: "16px",
    border: `1px solid ${theme.palette.app.border}`
}));

export const ProductsSection = styled("div")(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    backgroundColor: theme.palette.background.paper,
    borderRadius: "12px",
    padding: "0px",
    border: `1px solid ${theme.palette.app.border}`
}));

export const ProductHeaderSection = styled("div")(({ theme }) => ({
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: "16px 24px",
    gap: "16px"
}));

export const StatusValue = styled("div")(({ backgroundColor, color }: { backgroundColor: string, color: string }) => ({
    display: "flex",
    alignItems: "center",
    padding: "4px 10px",
    borderRadius: "8px",
    backgroundColor: backgroundColor,
    color: color,
}));