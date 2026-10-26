import { styled } from "@mui/material/styles";
import { theme } from "@/styles/theme";

export const CardContainer = styled("div", {
  shouldForwardProp: (prop) => prop !== "$clickable" && prop !== "$active",
})<{ $clickable?: boolean; $active?: boolean }>(({ $clickable, $active }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  padding: "24px 16px",
  backgroundColor: theme.palette.background.paper,
  borderRadius: "16px",
  border: `1px solid ${
    $active ? theme.palette.primary.main : theme.palette.app.border
  }`,
  boxShadow: $active
    ? `inset 0 0 0 1px ${theme.palette.primary.main}`
    : "none",
  overflow: "hidden",
  cursor: $clickable ? "pointer" : "default",
  ...($clickable
    ? {
        "&:hover": {
          borderColor: theme.palette.primary.main,
        },
        "&:focus-visible": {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: 2,
        },
      }
    : {}),
}));
