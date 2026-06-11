import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";

export const Card = styled("div")(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.app.border}`,
    borderRadius: "12px",
    gap: "16px",
    padding: "16px"
}));

export const ImageWrapper = styled("div")(({ theme }) => ({
    width: 48,
    height: 48,
    borderRadius: Number(theme.shape.borderRadius) * 2,
    overflow: "hidden",
    flexShrink: 0,
    backgroundColor: theme.palette.background.lowGray,
    border: `1px solid ${theme.palette.app.border}`,
}));

export const ProductImage = styled("img")({
    width: "100%",
    height: "100%",
    objectFit: "cover",
});

export const ImagePlaceholder = styled("div")(({ theme }) => ({
    width: "100%",
    height: "100%",
    backgroundColor: theme.palette.background.lowGray,
}));

export const StepperWrapper = styled("div")({
    display: "flex",
    justifyContent: "center",
});

export const OnlinePriceBarContainer = styled("div")(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    flexWrap: "nowrap",
    gap: "12px",
    width: "100%",
    minWidth: 0,
    padding: "8px 12px",
    backgroundColor: theme.palette.background.lowerGray,
    borderRadius: "8px",
    overflowX: "auto",
    flexShrink: 0,
    WebkitOverflowScrolling: "touch",
}));

export const OnlinePriceSegment = styled("div")({
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    flexShrink: 0,
    whiteSpace: "nowrap",
});

export const OnlinePriceText = styled(Typography)({
    whiteSpace: "nowrap",
    flexShrink: 0,
});

export const OnlinePriceDivider = styled("div")(({ theme }) => ({
    width: 1,
    alignSelf: "stretch",
    flexShrink: 0,
    backgroundColor: theme.palette.divider,
}));
