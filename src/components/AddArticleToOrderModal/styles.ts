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
});

export const ProductImage = styled('img')({
    width: "64px",
    height: "64px",
    border: `1px solid ${theme.palette.app.border}`,
    borderRadius: "12px",
    backgroundColor: theme.palette.background.default,
    flexShrink: 0,
});

export const HistorySection = styled('div')({
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    paddingLeft: "8px"
});

export const UnitPriceSection = styled('div')({
    position: "relative",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
    paddingLeft: "18px"
});

export const TimelineLine = styled('div')({
    position: "absolute",
    left: "13px",
    top: "12px",
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

export const TimelineOrderLink = styled("a")({
    fontSize: 14,
    color: "#71717A",
    textDecoration: "underline",
    cursor: "pointer",
    whiteSpace: "nowrap",
    "&:hover": {
        color: theme.palette.primary.main,
    },
}); 
