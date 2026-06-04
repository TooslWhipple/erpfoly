import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";

export const Card = styled("div")(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.app.border}`,
    borderRadius: "12px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
}));

export const Content = styled("div")({
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "16px",
});

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

export const ProductInfo = styled("div")({
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
});

export const ProductCode = styled(Typography)({
    fontFamily: "monospace",
});

export const ProductName = styled(Typography)({
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
});

export const MetricColumn = styled("div")({
    minWidth: 100,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
});

export const PriceColumn = styled(MetricColumn)({
    minWidth: 80,
});

export const StepperWrapper = styled("div")({
    display: "flex",
    justifyContent: "center",
});

export const OnlinePriceBarContainer = styled("div")(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
    padding: theme.spacing(1, 2),
    backgroundColor: theme.palette.background.lowGray,
    borderTop: `1px solid ${theme.palette.app.border}`,
    overflowX: "auto",
    flexShrink: 0,
}));

export const GlobeWrapper = styled("div")(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    color: theme.palette.text.secondary,
    flexShrink: 0,
}));

export const PriceSegment = styled("div")({
    display: "flex",
    alignItems: "center",
    gap: "4px",
    flexShrink: 0,
    whiteSpace: "nowrap",
});

export const VerticalSeparator = styled("div")(({ theme }) => ({
    width: 1,
    alignSelf: "stretch",
    minHeight: 16,
    backgroundColor: theme.palette.app.border,
    flexShrink: 0,
}));

export const RetailerLink = styled("a")(({ theme }) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
    textDecoration: "none",
    color: theme.palette.text.secondary,
    flexShrink: 0,
    whiteSpace: "nowrap",
    "&:hover": {
        color: theme.palette.primary.main,
    },
}));

export const RetailerEntry = styled("div")({
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    flexShrink: 0,
    whiteSpace: "nowrap",
});
