import { styled } from "@mui/material/styles";
import { Stack, Typography } from "@mui/material";

export const CaptureViewport = styled("div")(({ theme }) => ({
  width: "100%",
  minHeight: 360,
  height: "50vh",
  borderRadius: 16,
  overflow: "hidden",
  backgroundColor: theme.palette.background.default,
  border: `1px solid ${theme.palette.app.border}`,
  [theme.breakpoints.up("md")]: {
    minHeight: 480,
    height: "clamp(420px, 55vh, 520px)",
  },
}));

export const PreviewRoot = styled(Stack)(({ theme }) => ({
  width: "100%",
  gap: theme.spacing(2),
}));

export const PreviewTitle = styled(Typography)({
  textAlign: "center",
});

export const PreviewGrid = styled("div")(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: theme.spacing(2),
  width: "100%",
  [theme.breakpoints.up("md")]: {
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  },
}));

export const PreviewItem = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(1),
  minWidth: 0,
}));

export const PreviewLabel = styled(Typography)({
  textAlign: "center",
});

export const PreviewImageFrame = styled("div")(({ theme }) => ({
  width: "100%",
  minHeight: 240,
  borderRadius: 12,
  overflow: "hidden",
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.app.border}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

export const PreviewImage = styled("img")({
  width: "100%",
  height: "100%",
  maxHeight: 240,
  objectFit: "contain",
  display: "block",
});

export const CaptureErrorState = styled(Stack)(({ theme }) => ({
  width: "100%",
  alignItems: "center",
  gap: theme.spacing(1),
}));
