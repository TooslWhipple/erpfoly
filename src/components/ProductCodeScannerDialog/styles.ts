import { DialogContent as MuiDialogContent, IconButton, Stack } from "@mui/material";
import { styled } from "@mui/material/styles";

export const ScannerDialogContent = styled(MuiDialogContent)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
  padding: theme.spacing(3),
  minHeight: 0,
  flex: 1,
  overflow: "hidden",
  "&:first-of-type": {
    paddingTop: theme.spacing(3),
  },
  [theme.breakpoints.down("md")]: {
    padding: theme.spacing(2),
    gap: theme.spacing(1.5),
  },
  "@media (orientation: landscape) and (max-height: 720px)": {
    padding: theme.spacing(1.5, 2),
    gap: theme.spacing(1),
  },
}));

export const ScannerDialogHeader = styled(Stack)(({ theme }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing(1.5),
  flexWrap: "nowrap",
  flexShrink: 0,
  minWidth: 0,
  [theme.breakpoints.down("sm")]: {
    flexWrap: "wrap",
    alignItems: "flex-start",
  },
}));

export const ScannerHeaderText = styled(Stack)(({ theme }) => ({
  minWidth: 0,
  flex: "1 1 auto",
  gap: theme.spacing(0.25),
}));

export const ScannerCloseButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text.secondary,
  flexShrink: 0,
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

/**
 * Remaining dialog body; sized so the square viewport can use container queries.
 * Parent paper must have a definite height — `container-type: size` ignores
 * children, so `height: auto` makes 100cqb resolve to 0 (blank preview).
 */
export const ScannerStage = styled(Stack)(({ theme }) => ({
  flex: 1,
  minHeight: 0,
  minWidth: 0,
  width: "100%",
  alignItems: "center",
  justifyContent: "center",
  containerType: "size",
  gap: theme.spacing(1.5),
}));

/**
 * Square preview that always fits the stage (min of width/height).
 * The library finder is 70% of container width and 1:1 — if the preview is
 * wider than it is tall (tablet landscape), that square gets clipped.
 */
export const ScannerViewport = styled("div")(({ theme }) => ({
  position: "relative",
  width: "min(100%, 68dvh)",
  aspectRatio: "1 / 1",
  height: "auto",
  maxWidth: "100%",
  maxHeight: "100%",
  borderRadius: 16,
  overflow: "hidden",
  backgroundColor: theme.palette.background.default,
  border: `1px solid ${theme.palette.app.border}`,
  flexShrink: 0,
  // When the stage has a definite height, fit a square to min(width, height).
  // If it does not (desktop dialog used to be height:auto), cqb is 0 and this
  // query does not match — the width-based square above stays visible.
  "@container (min-height: 1px)": {
    width: "min(100cqi, 100cqb)",
    height: "min(100cqi, 100cqb)",
    aspectRatio: "unset",
  },
  "@supports not (width: 1cqi)": {
    width: "min(100%, 68dvh)",
    aspectRatio: "1 / 1",
    height: "auto",
    maxHeight: "100%",
  },
  [theme.breakpoints.down("sm")]: {
    borderRadius: 12,
  },
  // Library finder box: width 70% + aspect-ratio 1/1 (inline styles).
  "& div[style*='dashed']": {
    width: "min(70%, 70cqb) !important",
    maxWidth: "100%",
    maxHeight: "calc(100% - 16px)",
    boxSizing: "border-box",
  },
}));
