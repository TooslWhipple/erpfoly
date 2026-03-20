import { styled } from "@mui/material/styles";
import { colors } from "@/styles/theme";

export const Root = styled("div", {
  shouldForwardProp: (prop) => prop !== "isDisabled",
})<{ isDisabled?: boolean }>(({ isDisabled }) => ({
  width: "100%",
  ...(isDisabled
    ? {
        opacity: 0.55,
        pointerEvents: "none",
      }
    : null),
}));

export const TrackShell = styled("div")({
  position: "relative",
  width: "100%",
  height: "20px",
  display: "flex",
  alignItems: "center",
});

export const TrackRail = styled("div")({
  position: "absolute",
  left: 0,
  right: 0,
  top: "50%",
  transform: "translateY(-50%)",
  height: "8px",
  borderRadius: "4px",
  backgroundColor: colors.border,
  overflow: "hidden",
});

export const TrackFill = styled("div", {
  shouldForwardProp: (prop) => prop !== "fillColor",
})<{ fillColor: string }>(({ fillColor }) => ({
  height: "100%",
  width: "var(--track-fill-pct, 0%)",
  borderRadius: "inherit",
  backgroundColor: fillColor,
  pointerEvents: "none",
}));

export const ThumbKnob = styled("div")(({ theme }) => ({
  position: "absolute",
  left: "var(--thumb-left-pct, 0%)",
  top: "50%",
  transform: "translate(-50%, -50%)",
  width: "20px",
  height: "20px",
  borderRadius: "50%",
  backgroundColor: theme.palette.common.white,
  border: `1px solid ${theme.palette.divider}`,
  boxSizing: "border-box",
  pointerEvents: "none",
  zIndex: 1,
}));

export const NativeRange = styled("input")({
  position: "absolute",
  left: 0,
  top: 0,
  width: "100%",
  height: "100%",
  margin: 0,
  padding: 0,
  opacity: 0,
  cursor: "pointer",
  zIndex: 2,
  WebkitAppearance: "none",
  appearance: "none",
  "&:disabled": {
    cursor: "not-allowed",
  },
});

export const EdgeLabelsRow = styled("div")({
  position: "relative",
  display: "flex",
  flexDirection: "row",
  alignItems: "flex-start",
  width: "100%",
  minHeight: "18px",
  marginTop: "8px",
});

export const EdgeLabelStart = styled("div")({
  flex: "1 1 0",
  textAlign: "left",
});

export const EdgeLabelEnd = styled("div")({
  flex: "1 1 0",
  textAlign: "right",
});

export const EdgeLabelMiddle = styled("div")({
  position: "absolute",
  left: "var(--middle-left-pct, 50%)",
  transform: "translateX(-50%)",
  textAlign: "center",
});

export const MarkLabelsRow = styled("div")({
  position: "relative",
  width: "100%",
  minHeight: "18px",
  marginTop: "8px",
});

export const MarkLabelSlot = styled("div", {
  shouldForwardProp: (prop) =>
    prop !== "alignMode" && prop !== "positionPct",
})<{
  alignMode: "start" | "center" | "end";
  positionPct: number;
}>(({ alignMode, positionPct }) => {
  const base: Record<string, string | number> = {
    position: "absolute",
    top: 0,
    left: `${positionPct}%`,
  };
  if (alignMode === "start") {
    base.transform = "none";
    base.textAlign = "left";
  } else if (alignMode === "end") {
    base.transform = "translateX(-100%)";
    base.textAlign = "right";
  } else {
    base.transform = "translateX(-50%)";
    base.textAlign = "center";
  }
  return base;
});
