import { styled } from "@mui/material/styles";
import { theme } from "@/styles/theme";

export const BranchCard = styled("div")({
  display: "flex",
  flexDirection: "column",
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: "16px",
  backgroundColor: theme.palette.background.paper,
  overflow: "hidden",
});

export const BranchHeader = styled("div")({
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "16px",
  padding: "16px",
});

export const BranchEmptyState = styled("div")(({ theme: muiTheme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: muiTheme.spacing(0, 2, 2),
  padding: muiTheme.spacing(5, 2),
  borderRadius: 12,
  backgroundColor: theme.palette.grey[50],
  color: theme.palette.text.secondary,
  fontSize: "0.875rem",
  textAlign: "center",
}));

export const BranchItemRow = styled("div")({
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "16px",
  padding: "12px 16px",
  borderTop: `1px solid ${theme.palette.app.border}`,
  [theme.breakpoints.down("sm")]: {
    flexWrap: "wrap",
  },
});
