import { styled } from "@mui/material/styles";
import { theme } from "@/styles/theme";

export const AddArticleModalContainer = styled('div')({
    display: "flex",
    flexDirection: "column",
    marginTop: "16px",
    gap: "16px",
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.app.border}`,
    borderRadius: "16px",
    padding: "24px",
    [theme.breakpoints.down("sm")]: {
        padding: "0px",
        backgroundColor: "transparent",
        border: "none",
        borderRadius: "0px",
    },
});

export const ProductImage = styled('img')({
    width: "64px",
    height: "64px",
    objectFit: "cover",
    border: `1px solid ${theme.palette.app.border}`,
    borderRadius: "12px",
    backgroundColor: theme.palette.background.default,
    flexShrink: 0,
});

export const ImagePlaceholder = styled('div')({
    width: "64px",
    height: "64px",
    border: `1px solid ${theme.palette.app.border}`,
    borderRadius: "12px",
    backgroundColor: theme.palette.background.default,
    flexShrink: 0,
});

export const AgreementSection = styled("div")({
    display: "flex",
    flexDirection: "column",
    gap: "12px"
});

export const HistorySection = styled('div')({
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: "24px"
});

export const UnitPriceSection = styled('div', { shouldForwardProp: (prop) => prop !== 'hasHistory' })<{ hasHistory: boolean }>(({ hasHistory }) => ({
    position: "relative",
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: "8px",
    paddingLeft: (hasHistory) ? "18px" : "0px",
}));

export const TimelineLine = styled('div')({
    position: "absolute",
    left: "5px",
    top: "42px",
    bottom: "34px",
    width: "1px",
    backgroundColor: theme.palette.app.border,
});

export const TimelineItem = styled('div')({
    position: "relative",
    display: "flex",
    alignItems: "flex-start",
    padding: "11px 18px",
});

export const TimelineDot = styled('div')({
    position: "absolute",
    top: "28px",
    left: "0px",
    width: "11px",
    height: "11px",
    borderRadius: "50%",
    backgroundColor: theme.palette.app.border,
    flexShrink: 0,
    zIndex: 1,
});

export const TimelineContent = styled('div')({
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(0.5),
    width: "100%",
});
