import { styled } from "@mui/material/styles";
import { Stack, Typography } from "@mui/material";

export const CaptureStepRoot = styled(Stack)(({ theme }) => ({
  flex: 1,
  minHeight: 0,
  width: "100%",
  height: "100%",
  gap: theme.spacing(1.5),
  alignItems: "stretch",
}));

/**
 * Capture host for IdCapture and FaceCapture.
 * The SDK mounts into this element via `rootElement`.
 */
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
}));

/** @deprecated Use CaptureViewport — kept as alias for existing imports. */
export const IdCaptureViewport = CaptureViewport;

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
