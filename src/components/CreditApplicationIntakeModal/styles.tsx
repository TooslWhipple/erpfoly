import { styled } from "@mui/material/styles";
import { Stack, Typography } from "@mui/material";

export const SignatureSection = styled(Stack)(({ theme }) => ({
  width: "100%",
  gap: theme.spacing(2),
}));

export const SignatureCanvasWrapper = styled("div")(({ theme }) => ({
  width: "100%",
  borderRadius: 16,
  overflow: "hidden",
  border: `1px solid ${theme.palette.app.border}`,
  backgroundColor: theme.palette.background.paper,
}));

export const SignatureCanvas = styled("canvas", {
  shouldForwardProp: (prop) => prop !== "disabled",
})<{ disabled?: boolean }>(({ theme, disabled }) => ({
  width: "100%",
  height: 240,
  display: "block",
  touchAction: "none",
  WebkitUserSelect: "none",
  userSelect: "none",
  backgroundColor: theme.palette.background.paper,
  cursor: disabled ? "not-allowed" : "crosshair",
  [theme.breakpoints.up("sm")]: {
    height: 280,
  },
  [theme.breakpoints.up("md")]: {
    height: 320,
  },
  "@media (orientation: landscape) and (max-height: 560px)": {
    height: 180,
  },
}));

export const SignatureLegalText = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  textAlign: "center",
}));
