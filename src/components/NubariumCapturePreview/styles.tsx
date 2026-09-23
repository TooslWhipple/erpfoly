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

export const CaptureViewport = styled("div")({
  boxSizing: "border-box",
  position: "relative",
  width: "min(100%, calc(min(68dvh, 560px) * 4 / 3))",
  maxWidth: "100%",
  aspectRatio: "4 / 3",
  height: "auto",
  flex: "0 0 auto",
  minWidth: 0,
  marginInline: "auto",
  borderRadius: 16,
  overflow: "hidden",
  backgroundColor: "#000",
  border: "none",
  "@media (orientation: landscape)": {
    width: "min(100%, calc(min(72dvh, 480px) * 4 / 3))",
  },
  "@media (orientation: landscape) and (max-height: 500px)": {
    width: "min(100%, calc(min(78dvh, 360px) * 4 / 3))",
    borderRadius: 12,
  },
  maxHeight: "min(68dvh, 560px)",
});

export const CaptureHost = styled("div")({
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  "& video, & canvas, & iframe": {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
});

export const PreviewRoot = styled(Stack)(({ theme }) => ({
  width: "100%",
  gap: theme.spacing(2),
}));

export const PreviewGrid = styled("div")(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: theme.spacing(2),
  width: "100%",
  [theme.breakpoints.up("sm")]: {
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

export const PreviewLabel = styled(Typography)(({ theme }) => ({
  textAlign: "left",
  color: theme.palette.text.secondary,
  fontSize: 13,
}));

export const PreviewImageFrame = styled("div")(({ theme }) => ({
  position: "relative",
  width: "100%",
  aspectRatio: "4 / 3",
  borderRadius: 12,
  overflow: "hidden",
  backgroundColor: theme.palette.app.background.lowerGray,
  border: `1px solid ${theme.palette.app.border}`,
  "@media (orientation: landscape) and (max-height: 560px)": {
    aspectRatio: "16 / 9",
  },
}));

export const PreviewImage = styled("img")({
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "contain",
  display: "block",
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
