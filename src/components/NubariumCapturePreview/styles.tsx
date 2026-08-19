import { styled } from "@mui/material/styles";
import { Stack, Typography } from "@mui/material";

export const CaptureStepRoot = styled(Stack)(({ theme }) => ({
  flex: 1,
  minHeight: 0,
  width: "100%",
  height: "100%",
  gap: theme.spacing(1.5),
  alignItems: "stretch",
  "@media (orientation: landscape) and (max-height: 560px)": {
    gap: theme.spacing(1),
  },
}));

export const CaptureViewport = styled("div")(({ theme }) => ({
  width: "min(100%, calc(min(68dvh, 560px) * 4 / 3))",
  maxWidth: "100%",
  aspectRatio: "4 / 3",
  height: "auto",
  flex: "0 1 auto",
  minWidth: 0,
  minHeight: 180,
  marginInline: "auto",
  borderRadius: 16,
  overflow: "hidden",
  backgroundColor: theme.palette.background.default,
  border: `1px solid ${theme.palette.app.border}`,
  [theme.breakpoints.up("md")]: {
    minHeight: 220,
  },
  "@media (orientation: landscape)": {
    width: "min(100%, calc(min(72dvh, 480px) * 4 / 3))",
    minHeight: 140,
  },
  "@media (orientation: landscape) and (max-height: 500px)": {
    width: "min(100%, calc(min(78dvh, 360px) * 4 / 3))",
    minHeight: 120,
    borderRadius: 12,
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
  "@media (orientation: landscape)": {
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: theme.spacing(1.5),
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
  "@media (orientation: landscape) and (max-height: 560px)": {
    minHeight: 140,
  },
}));

export const PreviewImage = styled("img")({
  width: "100%",
  height: "100%",
  maxHeight: 240,
  objectFit: "contain",
  display: "block",
  "@media (orientation: landscape) and (max-height: 560px)": {
    maxHeight: 140,
  },
});

export const CaptureErrorState = styled(Stack)(({ theme }) => ({
  width: "100%",
  flexShrink: 0,
  alignItems: "center",
  gap: theme.spacing(1),
  padding: theme.spacing(1.5),
  borderRadius: 12,
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.error.light}`,
}));
