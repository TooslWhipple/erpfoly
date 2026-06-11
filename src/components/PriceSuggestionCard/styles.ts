import { styled } from "@mui/material/styles";

export const CardContainer = styled('div')(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: "12px",
  padding: "16px"
}));

export const ProductImage = styled('img')({
  width: "48px",
  height: "48px",
  borderRadius: "10px",
  objectFit: "cover",
  backgroundColor: "#F3F4F6",
  flexShrink: 0,
});

export const ImagePlaceholder = styled('div')({
  width: "48px",
  height: "48px",
  borderRadius: "10px",
  backgroundColor: "#F3F4F6",
  flexShrink: 0,
});

export const PriceList = styled('div')({
  display: "flex",
  flexDirection: "column",
  position: "relative",
  gap: 0,
});

export const PriceListItem = styled('div')<{ isSuggested?: boolean }>(({ theme, isSuggested }) => ({
  display: "flex",
  flexDirection: "row",
  gap: "8px",
  padding: "8px",
  alignItems: "center",
  ...(isSuggested && {
    justifyContent: "space-between",
    backgroundColor: theme.palette.background.lowerBlue,
    borderRadius: "12px",
  })
}));

export const TimelineDot = styled('div')(({ theme }) => ({
  width: "11px",
  height: "11px",
  borderRadius: "50%",
  backgroundColor: theme.palette.app.border,
  flexShrink: 0,
  zIndex: 1,
}));

export const TimelineLine = styled('div')(({ theme }) => ({
  position: "absolute",
  width: "1px",
  top: "30px",
  bottom: "15px",
  left: "13px",
  backgroundColor: theme.palette.app.border,
}));
