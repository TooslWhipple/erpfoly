import { styled } from "@mui/material/styles";
import { Typography } from "@mui/material";

export const SuggestionsIcon = styled('div')({
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: "#FEF3C7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
});

export const ProductItem = styled('div')(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    backgroundColor: theme.palette.background.paper,
    borderRadius: "12px",
    gap: "24px",
    padding: "16px",
}));

export const ProductImage = styled('img')({
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    objectFit: "cover",
    backgroundColor: "#F3F4F6",
    flexShrink: 0,
});

export const ImagePlaceholder = styled('div')({
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    backgroundColor: "#F3F4F6",
    flexShrink: 0,
});

export const TrendChartContainer = styled('div')({
    marginTop: 8,
});

export const TrendChart = styled('div')({
    width: "100%",
    height: 40,
    marginBottom: 4,
});

export const TrendLine = styled("path")({
    strokeLinecap: "round",
    strokeLinejoin: "round",
});

export const TrendArea = styled("path")({
    stroke: "none",
});

export const TrendAxis = styled('div')({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
});

export const TrendMonth = styled(Typography)(({ theme }) => ({
    fontSize: 10,
    color: theme.palette.text.secondary,
    textAlign: "center",
    flex: 1,
}));
