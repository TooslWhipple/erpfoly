import { styled } from "@mui/material/styles";

export const Card = styled("div")(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: "12px",
  padding: "16px 24px",
  cursor: "pointer",
  transition: "background-color 0.15s ease",
  "&:hover": {
    backgroundColor: theme.palette.background.default,
  },
}));

export const ProgressBarContainer = styled("div")(({ theme }) => ({
  position: "relative",
  height: "8px",
  borderRadius: "12px",
  overflow: "hidden",
  backgroundColor: theme.palette.app.border,
}));

interface ProgressBarFillProps {
  fillColor: string;
  progress: number;
}

export const ProgressBarFill = styled("div", {
  shouldForwardProp: (prop) => prop !== "fillColor" && prop !== "progress",
})<ProgressBarFillProps>(({ fillColor, progress }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  height: "100%",
  width: `${progress}%`,
  backgroundColor: fillColor,
  borderRadius: 3,
  transition: "width 0.3s ease",
}));

export const EmptyContainer = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(6),
  color: theme.palette.text.secondary,
}));
