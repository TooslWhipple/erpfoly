import { styled, darken } from "@mui/material/styles";

export const DropZoneRoot = styled("div")<{ isDragActive: boolean; isError?: boolean }>(
  ({ theme, isDragActive, isError }) => ({
    border: `2px dashed ${(isError) ? "#DC2626" : (isDragActive) ? darken(theme.palette.primary.main, 0.06) : theme.palette.primary.main}`,
    borderRadius: "12px",
    backgroundColor: ((isDragActive) ? darken("EFF6FF", 0.06) : "#EFF6FF"),
    padding: "24px 12px",
    textAlign: "center",
    cursor: "pointer",
    transition: "border-color 0.2s, background-color 0.2s",
    "&:hover": {
      borderColor: (isError) ? "#DC2626" : darken(theme.palette.primary.main, 0.06),
      backgroundColor: darken("#EFF6FF", 0.06),
    },
  })
);

export const FileListContainer = styled("div")(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

export const FileIconContainer = styled("div")({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "40px",
  height: "40px",
  borderRadius: "4px",
  backgroundColor: "#EFF6FF",
  padding: "8px",
  '& svg': {
    stroke: '#2563EB'
  }
});

export const FileItemRow = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  padding: "12px",
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: "12px"
}));
